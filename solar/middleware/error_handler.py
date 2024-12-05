# solar/middleware/error_handler.py
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import exception_handler
from django.core.exceptions import ValidationError
import traceback
import logging

from EnergyCove import settings

logger = logging.getLogger(__name__)

class AppError(Exception):
    def __init__(self, message, code, data=None):
        self.message = message
        self.code = code
        self.data = data or {}
        super().__init__(message)

class ErrorHandlerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            return self.get_response(request)
        except Exception as e:
            return self.handle_error(e)

    def handle_error(self, error):
        """Convert exceptions to JSON responses matching frontend expectations"""
        
        # Handle custom AppError
        if isinstance(error, AppError):
            return JsonResponse({
                'success': False,
                'error': {
                    'message': error.message,
                    'code': error.code,
                    'data': error.data
                }
            }, status=self.get_status_code(error.code))

        # Handle Django ValidationError
        if isinstance(error, ValidationError):
            return JsonResponse({
                'success': False,
                'error': {
                    'message': 'Validation error',
                    'code': 'VALIDATION_ERROR',
                    'data': {
                        'fields': error.message_dict if hasattr(error, 'message_dict') else {'error': error.messages}
                    }
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        # Handle other exceptions
        logger.error(f"Unhandled error: {str(error)}\n{traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': {
                'message': 'An unexpected error occurred',
                'code': 'INTERNAL_ERROR',
                'data': {'detail': str(error)} if settings.DEBUG else {}
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_status_code(self, error_code):
        """Map error codes to HTTP status codes"""
        ERROR_CODE_MAP = {
            'VALIDATION_ERROR': status.HTTP_400_BAD_REQUEST,
            'UNAUTHORIZED': status.HTTP_401_UNAUTHORIZED,
            'FORBIDDEN': status.HTTP_403_FORBIDDEN,
            'NOT_FOUND': status.HTTP_404_NOT_FOUND,
            'SERVER_ERROR': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'SERVICE_ERROR': status.HTTP_503_SERVICE_UNAVAILABLE,
            'NETWORK_ERROR': status.HTTP_503_SERVICE_UNAVAILABLE,
        }
        return ERROR_CODE_MAP.get(error_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

# solar/utils/error_utils.py
class ErrorTypes:
    """Error type constants matching frontend error codes"""
    VALIDATION_ERROR = 'VALIDATION_ERROR'
    UNAUTHORIZED = 'UNAUTHORIZED'
    FORBIDDEN = 'FORBIDDEN'
    NOT_FOUND = 'NOT_FOUND'
    SERVER_ERROR = 'SERVER_ERROR'
    NETWORK_ERROR = 'NETWORK_ERROR'
    SERVICE_ERROR = 'SERVICE_ERROR'
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'

def custom_exception_handler(exc, context):
    """Custom exception handler for DRF views"""
    response = exception_handler(exc, context)
    
    if response is not None:
        response.data = {
            'success': False,
            'error': {
                'message': str(exc),
                'code': get_error_code(response.status_code),
                'data': response.data if hasattr(response, 'data') else {}
            }
        }
    
    return response

def get_error_code(status_code):
    """Map HTTP status codes to error codes"""
    STATUS_CODE_MAP = {
        400: ErrorTypes.VALIDATION_ERROR,
        401: ErrorTypes.UNAUTHORIZED,
        403: ErrorTypes.FORBIDDEN,
        404: ErrorTypes.NOT_FOUND,
        500: ErrorTypes.SERVER_ERROR,
        503: ErrorTypes.SERVICE_ERROR
    }
    return STATUS_CODE_MAP.get(status_code, ErrorTypes.UNKNOWN_ERROR)

# Example usage in views:
# def example_view(request):
#     try:
#         # Your logic here
#         if some_validation_fails:
#             raise AppError(
#                 message='Invalid input data',
#                 code=ErrorTypes.VALIDATION_ERROR,
#                 data={'field': 'Details about the error'}
#             )
#     except Exception as e:
#         raise  # The middleware will handle it