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
    """API endpoint to generate solar system quotes."""
    
    def post(self, request):
        try:
            # Validate reference number if provided
            reference_number = request.data.get('reference_number')
            if not reference_number:
                raise AppError(
                    message='Reference number is required',
                    code='VALIDATION_ERROR'
                )

            # Get bill details first
            bill_response = BillService.get_bill_details(reference_number)
            if not bill_response['success']:
                return Response(bill_response, status=status.HTTP_400_BAD_REQUEST)

            # Generate quote using bill data
            quote_data = QuoteService.generate_quote(bill_response['data'])
            return Response(quote_data)

        except AppError as e:
            logger.warning(f"Quote generation failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("Unexpected error in quote generation")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
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