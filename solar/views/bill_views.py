# solar/views/bill_views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from ..services.bill_service import BillService
from ..middleware.error_handler import AppError

logger = logging.getLogger(__name__)

class BillValidateAPIView(APIView):
    def post(self, request):
        try:
            print("Getting reference number")
            reference_number = request.data.get('reference_number')
            print(request.data)
            if not reference_number:
                return Response({
                    'success': False,
                    'error': {
                        'message': 'Please enter a reference number',
                        'code': 'VALIDATION_ERROR'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            # Use BillService to validate
            print("Validating bill")
            result = BillService.validate_bill(reference_number)
            
            if not result.get('data', {}).get('isValid', False):
                message = result.get('data', {}).get('message', 'Invalid reference number')
                return Response({
                    'success': False,
                    'error': {
                        'message': message,
                        'code': 'VALIDATION_ERROR'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response(result)

        except AppError as e:
            logger.warning(f"Bill validation failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': getattr(e, 'code', 'VALIDATION_ERROR')
                }
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.exception("Unexpected error in bill validation")
            return Response({
                'success': False,
                'error': {
                    'message': 'Unable to validate bill at this time. Please try again later.',
                    'code': 'SERVER_ERROR',
                    'reference_number': request.data.get('reference_number')
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
class BillDetailsAPIView(APIView):
    """API endpoint to fetch electricity bill details."""
    
    def get(self, request, reference_number=None):
        try:
            if not reference_number:
                raise AppError(
                    message='Reference number is required',
                    code='VALIDATION_ERROR'
                )

            # Use BillService to get details
            response = BillService.get_bill_details(reference_number)
            return Response(response)

        except AppError as e:
            logger.warning(f"Bill details fetch failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.exception("Unexpected error fetching bill details")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BillAnalyzeAPIView(APIView):
    """API endpoint to analyze electricity bill consumption patterns."""
    
    def post(self, request):
        try:
            reference_number = request.data.get('reference_number')
            
            if not reference_number:
                raise AppError(
                    message='Reference number is required',
                    code='VALIDATION_ERROR'
                )

            # Use BillService to analyze
            response = BillService.analyze_bill(reference_number)
            return Response(response)

        except AppError as e:
            logger.warning(f"Bill analysis failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.exception("Unexpected error analyzing bill")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BillHistoryAPIView(APIView):
    """API endpoint to retrieve bill history for a reference number."""
    
    def get(self, request, reference_number=None):
        try:
            if not reference_number:
                raise AppError(
                    message='Reference number is required',
                    code='VALIDATION_ERROR',
                    data={'field': 'reference_number'}
                )

            # First validate if the reference number is valid
            BillService.validate_bill(reference_number)

            # Get bill history from service
            history = BillService.get_bill_history(reference_number)
            
            return Response({
                'success': True,
                'data': history
            })

        except AppError as e:
            logger.warning(f"Bill history fetch failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.exception("Unexpected error fetching bill history")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)