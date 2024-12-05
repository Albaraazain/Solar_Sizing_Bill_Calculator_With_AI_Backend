# solar/views/customer_views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from ..services.customer_service import CustomerService
from ..middleware.error_handler import AppError

logger = logging.getLogger(__name__)

class CustomerListAPIView(APIView):
    """API endpoint for listing and creating customers."""
    
    def get(self, request):
        """Get paginated list of customers with optional filtering."""
        try:
            search = request.query_params.get('search')
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            sort_by = request.query_params.get('sort_by', '-date')

            response = CustomerService.get_customers(
                search_query=search,
                page=page,
                page_size=page_size,
                sort_by=sort_by
            )
            return Response(response)

        except ValueError as e:
            return Response({
                'success': False,
                'error': {
                    'message': 'Invalid pagination parameters',
                    'code': 'VALIDATION_ERROR',
                    'data': {'detail': str(e)}
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error fetching customers")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create a new customer."""
        try:
            response = CustomerService.add_customer(request.data)
            return Response(response, status=status.HTTP_201_CREATED)

        except AppError as e:
            logger.warning(f"Customer creation failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error creating customer")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomerDetailAPIView(APIView):
    """API endpoint for retrieving and updating specific customers."""
    
    def get(self, request, reference_number):
        """Get customer details by reference number."""
        try:
            response = CustomerService.get_customer_by_reference(reference_number)
            return Response(response)

        except AppError as e:
            logger.warning(f"Customer fetch failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error fetching customer")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, reference_number):
        """Update customer details."""
        try:
            customer = CustomerService.get_customer_by_reference(reference_number)
            response = CustomerService.update_customer(
                customer['data']['id'],
                request.data
            )
            return Response(response)

        except AppError as e:
            logger.warning(f"Customer update failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error updating customer")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomerBulkCreateAPIView(APIView):
    """API endpoint for bulk creating customers."""
    
    def post(self, request):
        try:
            customers_data = request.data.get('customers')
            if not customers_data:
                raise AppError(
                    message='Customers data is required',
                    code='VALIDATION_ERROR'
                )

            response = CustomerService.bulk_create_customers(customers_data)
            return Response(response, status=status.HTTP_201_CREATED)

        except AppError as e:
            logger.warning(f"Bulk customer creation failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error in bulk customer creation")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomerStatsAPIView(APIView):
    """API endpoint for customer statistics."""
    
    def get(self, request):
        try:
            response = CustomerService.get_customer_stats()
            return Response(response)

        except AppError as e:
            logger.warning(f"Customer stats fetch failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error fetching customer stats")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                    'data': {'detail': str(e)} if settings.DEBUG else {}
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)