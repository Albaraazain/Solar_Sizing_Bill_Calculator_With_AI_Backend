# solar/views/quote_views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from solar.invoice_generator.invoicemaker import generate_invoice
from ..services.quote_service import QuoteService
from ..services.bill_service import BillService
from ..middleware.error_handler import AppError

logger = logging.getLogger(__name__)

class QuoteGenerateAPIView(APIView):
    def post(self, request):
        try:
            # Log the raw request data
            logger.info(f"Raw quote generation request data: {request.data}")
            logger.info(f"Request content type: {request.content_type}")

            # Log data type validations
            for field in ['units_consumed', 'amount', 'total_yearly_units']:
                value = request.data.get(field)
                logger.info(f"Field {field}: value={value}, type={type(value)}")

            try:
                # Attempt numeric conversions
                units = float(request.data.get('units_consumed', 0))
                amount = float(request.data.get('amount', 0))
                yearly = float(request.data.get('total_yearly_units', 0))
                
                logger.info(f"Converted values - units: {units}, amount: {amount}, yearly: {yearly}")
            except (ValueError, TypeError) as e:
                logger.error(f"Numeric conversion error: {e}")
                return Response({
                    'success': False,
                    'error': {
                        'message': 'Invalid numeric values',
                        'code': 'VALIDATION_ERROR',
                        'details': str(e)
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            # Log the data being passed to the service
            logger.info("Passing to quote service:", request.data)
            quote_data = QuoteService.generate_quote(request.data)
            
            # Check if PDF generation is explicitly requested
            generate_pdf = request.data.get('generate_pdf', False)
            
            if generate_pdf:
                logger.info("PDF generation requested, preparing to generate invoice...")
                customer_name = quote_data['data']['systemDetails']['customer_name']
                customer_address = 'Not specified'
                customer_phone = '034512152266'
                # Extract values and convert to float to ensure consistent type handling
                system_size = float(quote_data['data']['systemDetails']['systemSize'])
                panels = int(quote_data['data']['systemDetails']['panelCount'])
                panel_power = float(quote_data['data']['systemDetails']['panelType']['power'])
                inverter_price = float(quote_data['data']['systemDetails']['inverterType']['price'])
                inverter_brand = quote_data['data']['systemDetails']['inverterType']['brand']
                panel_price = float(quote_data['data']['systemDetails']['panelType']['price']) * panel_power * panels
                net_metering = float(quote_data['data']['costs']['details']['net_metering']['amount'])
                installation_costs = float(quote_data['data']['costs']['details']['installation']['amount'])
                dc_cable = float(quote_data['data']['costs']['details']['dc_cable']['amount'])
                ac_cable = float(quote_data['data']['costs']['details']['ac_cable']['amount'])
                cabling_costs = float(dc_cable + ac_cable)
                frame_costs = float(quote_data['data']['costs']['details']['frame']['amount'])
                electrical_and_mechanical_costs = float(50000)
                total_cost = float(installation_costs + cabling_costs + frame_costs + electrical_and_mechanical_costs + panel_price + inverter_price + net_metering)
                
                # Log values for debugging
                logger.info(f"Extracted quote values:")
                logger.info(f"System size: {system_size}")
                logger.info(f"Panel cost calculation: {panel_price} = {quote_data['data']['systemDetails']['panelType']['price']} * {panel_power} * {panels}")
                logger.info(f"Total cost components: installation={installation_costs}, cabling={cabling_costs}, frame={frame_costs}, e&m={electrical_and_mechanical_costs}, panel={panel_price}, inverter={inverter_price}, net metering={net_metering}")
                logger.info(f"Total cost: {total_cost}")
                logger.info(f"Starting invoice generation for customer: {customer_name}")
                
                try:
                    # Ensure all parameters are properly formatted
                    generate_invoice(
                        system_size=float(system_size),
                        panel_amount=int(panels),
                        panel_power=float(panel_power),
                        price_of_inverter=float(inverter_price),
                        brand_of_inverter=str(inverter_brand),
                        price_of_panels=float(panel_price),
                        netmetering_costs=float(net_metering),
                        installation_costs=float(installation_costs),
                        cabling_costs=float(cabling_costs),
                        structure_costs=float(frame_costs),
                        electrical_and_mechanical_costs=float(electrical_and_mechanical_costs),
                        total_cost=float(total_cost),
                        customer_name=str(customer_name),
                        customer_address=str(customer_address),
                        customer_contact=str(customer_phone)
                    )
                    logger.info("Invoice generated and sent successfully")
                    quote_data['pdf_generated'] = True
                    
                except Exception as e:
                    logger.error(f"Failed to generate invoice: {str(e)}")
                    quote_data['pdf_generated'] = False
                    quote_data['pdf_error'] = str(e)
            
            return Response(quote_data)

        except Exception as e:
            logger.exception("Error in quote generation")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': 'QUOTE_GENERATION_ERROR',
                    'details': str(e)
                }
            }, status=status.HTTP_400_BAD_REQUEST)


# Add a new endpoint specifically for PDF generation
class QuoteGeneratePDFAPIView(APIView):
    """API endpoint to generate PDF for an existing quote."""
    
    def post(self, request):
        try:
            # Get quote data from request
            quote_data = request.data.get('quote_data')
            customer_info = request.data.get('customer_info', {})
            
            if not quote_data:
                raise AppError(
                    message='Quote data is required',
                    code='VALIDATION_ERROR'
                )
                
            # Extract necessary data for PDF generation
            system_size = float(quote_data['systemDetails']['systemSize'])
            panels = int(quote_data['systemDetails']['panelCount'])
            panel_power = float(quote_data['systemDetails']['panelType']['power'])
            inverter_price = float(quote_data['systemDetails']['inverterType']['price'])
            inverter_brand = quote_data['systemDetails']['inverterType']['brand']
            panel_price = float(quote_data['systemDetails']['panelType']['price'])
            net_metering = float(quote_data['costs']['details']['net_metering']['amount'])
            installation_costs = float(quote_data['costs']['details']['installation']['amount'])
            dc_cable = float(quote_data['costs']['details']['dc_cable']['amount'])
            ac_cable = float(quote_data['costs']['details']['ac_cable']['amount'])
            cabling_costs = float(dc_cable + ac_cable)
            frame_costs = float(quote_data['costs']['details']['frame']['amount'])
            electrical_and_mechanical_costs = float(50000)
            total_cost = float(installation_costs + cabling_costs + frame_costs + 
                              electrical_and_mechanical_costs + panel_price * panel_power * panels + 
                              inverter_price + net_metering)
            
            # Get customer info
            customer_name = customer_info.get('name', quote_data['systemDetails'].get('customer_name', 'Customer'))
            customer_address = customer_info.get('address', 'Not specified')
            customer_phone = customer_info.get('phone', '034512152266')
            
            # Generate the invoice PDF
            pdf_path = generate_invoice(
                system_size=system_size,
                panel_amount=panels,
                panel_power=panel_power,
                price_of_inverter=inverter_price,
                brand_of_inverter=inverter_brand,
                price_of_panels=panel_price,
                netmetering_costs=net_metering,
                installation_costs=installation_costs,
                cabling_costs=cabling_costs,
                structure_costs=frame_costs,
                electrical_and_mechanical_costs=electrical_and_mechanical_costs,
                total_cost=total_cost,
                customer_name=customer_name,
                customer_address=customer_address,
                customer_contact=customer_phone
            )
            
            return Response({
                'success': True,
                'data': {
                    'pdf_path': pdf_path,
                    'message': 'PDF generated and email sent successfully'
                }
            })
            
        except AppError as e:
            logger.warning(f"PDF generation failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.exception("Error generating PDF")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': 'PDF_GENERATION_ERROR',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class QuoteDetailsAPIView(APIView):
    """API endpoint to retrieve specific quote details."""
    
    def get(self, request, quote_id):
        try:
            if not quote_id:
                raise AppError(
                    message='Quote ID is required',
                    code='VALIDATION_ERROR'
                )

            quote_data = QuoteService.get_quote_by_id(quote_id)
            return Response(quote_data)

        except AppError as e:
            logger.warning(f"Quote details fetch failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.exception("Unexpected error fetching quote details")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class QuoteSaveAPIView(APIView):
    """API endpoint to save quote with customer details."""
    
    def post(self, request):
        try:
            quote_data = request.data.get('quote')
            customer_data = request.data.get('customer')

            if not all([quote_data, customer_data]):
                raise AppError(
                    message='Both quote and customer data are required',
                    code='VALIDATION_ERROR'
                )

            saved_quote = QuoteService.save_quote(quote_data, customer_data)
            return Response(saved_quote)

        except AppError as e:
            logger.warning(f"Quote save failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.exception("Unexpected error saving quote")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)