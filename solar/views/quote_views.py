# solar/views/quote_views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

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