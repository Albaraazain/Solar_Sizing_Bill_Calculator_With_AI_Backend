# solar/services/customer_service.py
from typing import Dict, Any, List, Optional, NoReturn
from django.db import transaction
from django.db.models import Q, Count
from django.core.paginator import Paginator
from datetime import datetime, timedelta

from .base_service import BaseService
from ..models import PotentialCustomers
from ..middleware.error_handler import AppError

class CustomerService(BaseService):
    """Service for managing potential customers and their data."""

    REQUIRED_CUSTOMER_FIELDS = ['name', 'phone', 'address', 'reference_number']

    @classmethod
    def handle_error(cls, error: Exception, code: str, message: str) -> NoReturn:
        """
        Handle errors by raising AppError.
        Always raises an exception, never returns.
        """
        if isinstance(error, AppError):
            raise error
        raise AppError(
            message=message or str(error),
            code=code,
            data={'original_error': str(error)}
        )

    @classmethod
    def add_customer(cls, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a new potential customer.
        
        Args:
            customer_data: Dictionary containing customer information
            
        Returns:
            Dict containing saved customer data
            
        Raises:
            AppError: If validation fails or save fails
        """
        try:
            # Validate required fields
            cls.validate_data(customer_data, cls.REQUIRED_CUSTOMER_FIELDS)

            # Check for existing customer with same reference number
            if PotentialCustomers.objects.filter(
                reference_number=customer_data['reference_number']
            ).exists():
                raise AppError(
                    message='Customer with this reference number already exists',
                    code='DUPLICATE_ERROR'
                )

            # Create new customer
            customer = PotentialCustomers.objects.create(
                name=customer_data['name'],
                phone=customer_data['phone'],
                address=customer_data['address'],
                reference_number=customer_data['reference_number']
            )

            return cls.format_response({
                'id': customer.id,
                'name': customer.name,
                'phone': customer.phone,
                'address': customer.address,
                'reference_number': customer.reference_number,
                'date': customer.date
            })

        except Exception as e:
            cls.handle_error(e, 'CUSTOMER_CREATE_ERROR', 'Failed to create customer')

    @classmethod
    def get_customers(
        cls,
        search_query: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = '-date'
    ) -> Dict[str, Any]:
        """
        Get paginated list of customers with optional filtering.
        
        Args:
            search_query: Optional search term for filtering
            page: Page number for pagination
            page_size: Number of items per page
            sort_by: Field to sort by (prefix with - for descending)
            
        Returns:
            Dict containing paginated customer list and metadata
        """
        try:
            queryset = PotentialCustomers.objects.all()

            # Apply search filter if provided
            if search_query:
                queryset = queryset.filter(
                    Q(name__icontains=search_query) |
                    Q(phone__icontains=search_query) |
                    Q(reference_number__icontains=search_query) |
                    Q(address__icontains=search_query)
                )

            # Apply sorting
            queryset = queryset.order_by(sort_by)

            # Paginate results
            paginator = Paginator(queryset, page_size)
            current_page = paginator.get_page(page)

            return cls.format_response({
                'customers': [{
                    'id': customer.id,
                    'name': customer.name,
                    'phone': customer.phone,
                    'address': customer.address,
                    'reference_number': customer.reference_number,
                    'date': customer.date
                } for customer in current_page],
                'pagination': {
                    'current_page': page,
                    'total_pages': paginator.num_pages,
                    'total_items': paginator.count,
                    'has_next': current_page.has_next(),
                    'has_previous': current_page.has_previous()
                }
            })

        except Exception as e:
            cls.handle_error(e, 'CUSTOMER_FETCH_ERROR', 'Failed to fetch customers')

    @classmethod
    def get_customer_by_reference(cls, reference_number: str) -> Dict[str, Any]:
        """
        Get customer details by bill reference number.
        
        Args:
            reference_number: Bill reference number
            
        Returns:
            Dict containing customer details
            
        Raises:
            AppError: If customer not found
        """
        try:
            customer = PotentialCustomers.objects.get(
                reference_number=reference_number
            )

            return cls.format_response({
                'id': customer.id,
                'name': customer.name,
                'phone': customer.phone,
                'address': customer.address,
                'reference_number': customer.reference_number,
                'date': customer.date
            })

        except PotentialCustomers.DoesNotExist:
            raise AppError(
                message=f'Customer with reference {reference_number} not found',
                code='NOT_FOUND'
            )
        except Exception as e:
            cls.handle_error(e, 'CUSTOMER_FETCH_ERROR', 'Failed to fetch customer')

    @classmethod
    def update_customer(
        cls,
        customer_id: int,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update customer information.
        
        Args:
            customer_id: ID of customer to update
            update_data: Dictionary containing fields to update
            
        Returns:
            Dict containing updated customer data
            
        Raises:
            AppError: If customer not found or update fails
        """
        try:
            customer = PotentialCustomers.objects.get(id=customer_id)

            # Update provided fields
            for field, value in update_data.items():
                if hasattr(customer, field):
                    setattr(customer, field, value)

            customer.save()

            return cls.format_response({
                'id': customer.id,
                'name': customer.name,
                'phone': customer.phone,
                'address': customer.address,
                'reference_number': customer.reference_number,
                'date': customer.date
            })

        except PotentialCustomers.DoesNotExist:
            raise AppError(
                message=f'Customer with id {customer_id} not found',
                code='NOT_FOUND'
            )
        except Exception as e:
            cls.handle_error(e, 'CUSTOMER_UPDATE_ERROR', 'Failed to update customer')

    @classmethod
    def get_customer_stats(cls) -> Dict[str, Any]:
        """Get customer statistics and metrics."""
        try:
            total_customers = PotentialCustomers.objects.count()
            recent_customers = PotentialCustomers.objects.filter(
                date__gte=datetime.now() - timedelta(days=30)
            ).count()

            monthly_stats = PotentialCustomers.objects.extra(
                select={'month': "EXTRACT(month FROM date)"}
            ).values('month').annotate(
                count=Count('id')
            ).order_by('month')

            return cls.format_response({
                'total_customers': total_customers,
                'recent_customers': recent_customers,
                'monthly_trend': [{
                    'month': stat['month'],
                    'count': stat['count']
                } for stat in monthly_stats]
            })

        except Exception as e:
            cls.handle_error(e, 'STATS_ERROR', 'Failed to fetch customer statistics')

    @classmethod
    @transaction.atomic
    def bulk_create_customers(cls, customers_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Bulk create multiple customers.
        
        Args:
            customers_data: List of dictionaries containing customer data
            
        Returns:
            Dict containing creation results
            
        Raises:
            AppError: If validation fails or creation fails
        """
        try:
            # Validate all customers first
            for customer_data in customers_data:
                cls.validate_data(customer_data, cls.REQUIRED_CUSTOMER_FIELDS)

            # Create customers
            customers = [
                PotentialCustomers(**customer_data)
                for customer_data in customers_data
            ]
            
            created_customers = PotentialCustomers.objects.bulk_create(customers)

            return cls.format_response({
                'created_count': len(created_customers),
                'customers': [{
                    'id': customer.id,
                    'name': customer.name,
                    'reference_number': customer.reference_number
                } for customer in created_customers]
            })

        except Exception as e:
            cls.handle_error(e, 'BULK_CREATE_ERROR', 'Failed to create customers')