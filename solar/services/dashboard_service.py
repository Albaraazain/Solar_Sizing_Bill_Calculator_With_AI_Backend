# solar/services/dashboard_service.py
from typing import Dict, Any, List
from datetime import datetime, timedelta
from django.db.models import Count, Avg, Sum
from django.db.models.functions import TruncMonth, TruncDay, TruncDate

from .base_service import BaseService
from .customer_service import CustomerService
from .inventory_service import InventoryService
from ..models import PotentialCustomers, Panel, Inverter
from ..middleware.error_handler import AppError

class DashboardService(BaseService):
    """Service for handling admin dashboard statistics and analytics."""

    @classmethod
    def get_dashboard_stats(cls) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics."""
        try:
            return cls.format_response({
                'customers': cls._get_customer_metrics(),
                'inventory': cls._get_inventory_metrics(),
                'revenue': cls._get_revenue_metrics(),
                'trends': cls._get_trend_metrics()
            })
        except Exception as e:
            raise AppError(
                message='Failed to fetch dashboard statistics',
                code='DASHBOARD_ERROR'
            ) from e

    @classmethod
    def _get_customer_metrics(cls) -> Dict[str, Any]:
        """Get customer-related metrics."""
        now = datetime.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        customers = PotentialCustomers.objects

        return {
            'total': customers.count(),
            'this_month': customers.filter(date__gte=start_of_month).count(),
            'growth': cls._calculate_growth_rate(
                customers,
                'date',
                start_of_month - timedelta(days=30),
                start_of_month
            ),
            'monthly_trend': cls._get_monthly_trend(customers, 'date', 6),
            'daily_trend': cls._get_daily_trend(customers, 'date', 14)
        }

    @classmethod
    def _get_inventory_metrics(cls) -> Dict[str, Any]:
        """Get inventory-related metrics."""
        inventory_stats = InventoryService.get_inventory_stats()
        if not inventory_stats['success']:
            raise AppError(
                message='Failed to fetch inventory stats',
                code='INVENTORY_ERROR'
            )

        return {
            'panels': inventory_stats['data']['panels'],
            'inverters': inventory_stats['data']['inverters'],
            'total_capacity': (
                inventory_stats['data']['panels']['total_power'] +
                inventory_stats['data']['inverters']['total_power']
            )
        }

    @classmethod
    def _get_revenue_metrics(cls) -> Dict[str, Any]:
        """Get revenue-related metrics."""
        # This would typically connect to your financial data
        # For now, returning placeholder data
        return {
            'total_revenue': 0,
            'this_month': 0,
            'growth': 0,
            'average_quote': 0,
            'monthly_trend': []
        }

    @classmethod
    def _get_trend_metrics(cls) -> Dict[str, Any]:
        """Get trending metrics and insights."""
        customers = PotentialCustomers.objects
        last_30_days = datetime.now() - timedelta(days=30)

        return {
            'customer_acquisition': {
                'total': customers.filter(date__gte=last_30_days).count(),
                'trend': cls._get_daily_trend(customers, 'date', 30)
            },
            'popular_system_sizes': cls._get_popular_system_sizes(),
            'geographic_distribution': cls._get_geographic_distribution()
        }

    @staticmethod
    def _calculate_growth_rate(queryset, date_field: str, 
                             start_date: datetime, end_date: datetime) -> float:
        """Calculate growth rate between two periods."""
        current_period = queryset.filter(**{
            f'{date_field}__gte': start_date,
            f'{date_field}__lt': end_date
        }).count()

        previous_period = queryset.filter(**{
            f'{date_field}__gte': start_date - timedelta(days=30),
            f'{date_field}__lt': start_date
        }).count()

        if previous_period == 0:
            return 100 if current_period > 0 else 0

        return ((current_period - previous_period) / previous_period) * 100

    @staticmethod
    def _get_monthly_trend(queryset, date_field: str, months: int) -> List[Dict[str, Any]]:
        """Get monthly trend data."""
        return list(
            queryset.filter(**{
                f'{date_field}__gte': datetime.now() - timedelta(days=30 * months)
            })
            .annotate(month=TruncMonth(date_field))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

    @staticmethod
    def _get_daily_trend(queryset, date_field: str, days: int) -> List[Dict[str, Any]]:
        """Get daily trend data."""
        return list(
            queryset.filter(**{
                f'{date_field}__gte': datetime.now() - timedelta(days=days)
            })
            .annotate(date=TruncDate(date_field))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

    @classmethod
    def _get_popular_system_sizes(cls) -> List[Dict[str, Any]]:
        """Get distribution of popular system sizes."""
        return [
            {'range': '1-3kW', 'count': 0},
            {'range': '3-5kW', 'count': 0},
            {'range': '5-10kW', 'count': 0},
            {'range': '10kW+', 'count': 0},
        ]

    @classmethod
    def _get_geographic_distribution(cls) -> List[Dict[str, Any]]:
        """Get geographic distribution of customers."""
        try:
            return list(
                PotentialCustomers.objects.values('address')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
        except Exception:
            return []

    @classmethod
    def get_performance_metrics(cls) -> Dict[str, Any]:
        """Get system performance metrics."""
        try:
            return cls.format_response({
                'quote_conversion_rate': cls._calculate_quote_conversion_rate(),
                'average_response_time': cls._calculate_response_time(),
                'customer_satisfaction': cls._get_customer_satisfaction(),
                'system_efficiency': cls._get_system_efficiency()
            })
        except Exception as e:
            raise AppError(
                message='Failed to fetch performance metrics',
                code='METRICS_ERROR'
            ) from e

    @staticmethod
    def _calculate_quote_conversion_rate() -> float:
        """Calculate quote to installation conversion rate."""
        # This would be implemented when you have quote tracking
        return 0.0

    @staticmethod
    def _calculate_response_time() -> float:
        """Calculate average response time for customer inquiries."""
        # This would be implemented when you have inquiry tracking
        return 0.0

    @staticmethod
    def _get_customer_satisfaction() -> Dict[str, Any]:
        """Get customer satisfaction metrics."""
        # This would be implemented when you have feedback tracking
        return {
            'average_rating': 0.0,
            'total_ratings': 0,
            'distribution': {
                '5_star': 0,
                '4_star': 0,
                '3_star': 0,
                '2_star': 0,
                '1_star': 0
            }
        }

    @staticmethod
    def _get_system_efficiency() -> Dict[str, Any]:
        """Get system efficiency metrics."""
        return {
            'average_production': 0.0,
            'peak_efficiency': 0.0,
            'maintenance_rate': 0.0
        }