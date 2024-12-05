# solar/views/dashboard_views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from typing import Any

from ..services.dashboard_service import DashboardService
from ..services.inventory_service import InventoryService
from ..services.customer_service import CustomerService
from ..middleware.error_handler import AppError

logger = logging.getLogger(__name__)

class IsStaffMixin(LoginRequiredMixin, UserPassesTestMixin):
    """Mixin to ensure user is staff."""
    def test_func(self) -> bool:
        view: Any = self
        return bool(view.request and view.request.user and view.request.user.is_staff)

class DashboardMetricsView(IsStaffMixin, APIView):
    """API endpoint for dashboard core metrics."""
    
    def get(self, request):
        try:
            # Get time range from query params
            time_range = request.query_params.get('range', '7d')  # Default to 7 days
            
            # Get all dashboard stats
            response = DashboardService.get_dashboard_stats()
            return Response(response)

        except AppError as e:
            logger.warning(f"Dashboard metrics fetch failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error fetching dashboard metrics")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DashboardChartsView(IsStaffMixin, APIView):
    """API endpoint for dashboard charts data."""
    
    def get(self, request):
        try:
            # Get chart type from query params
            chart_type = request.query_params.get('type', 'all')
            time_range = request.query_params.get('range', '30d')

            # Define which charts to return
            charts_to_fetch = {
                'customers': self._get_customer_charts,
                'inventory': self._get_inventory_charts,
                'revenue': self._get_revenue_charts,
                'performance': self._get_performance_charts
            }

            if chart_type == 'all':
                response_data = {}
                for chart_name, fetch_func in charts_to_fetch.items():
                    response_data[chart_name] = fetch_func(time_range)
            else:
                fetch_func = charts_to_fetch.get(chart_type)
                if not fetch_func:
                    raise AppError(
                        message=f'Invalid chart type: {chart_type}',
                        code='INVALID_TYPE'
                    )
                response_data = {chart_type: fetch_func(time_range)}

            return Response({
                'success': True,
                'data': response_data
            })

        except AppError as e:
            logger.warning(f"Dashboard charts fetch failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error fetching dashboard charts")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_customer_charts(self, time_range: str) -> dict:
        """Get customer-related charts data."""
        customer_stats = CustomerService.get_customer_stats()
        if not customer_stats['success']:
            raise AppError(
                message='Failed to fetch customer stats',
                code='DATA_ERROR'
            )
        return customer_stats['data']

    def _get_inventory_charts(self, time_range: str) -> dict:
        """Get inventory-related charts data."""
        inventory_stats = InventoryService.get_inventory_stats()
        if not inventory_stats['success']:
            raise AppError(
                message='Failed to fetch inventory stats',
                code='DATA_ERROR'
            )
        return inventory_stats['data']

    def _get_revenue_charts(self, time_range: str) -> dict:
        """Get revenue-related charts data."""
        performance_metrics = DashboardService.get_performance_metrics()
        if not performance_metrics['success']:
            raise AppError(
                message='Failed to fetch performance metrics',
                code='DATA_ERROR'
            )
        return performance_metrics['data'].get('revenue', {})

    def _get_performance_charts(self, time_range: str) -> dict:
        """Get performance-related charts data."""
        performance_metrics = DashboardService.get_performance_metrics()
        if not performance_metrics['success']:
            raise AppError(
                message='Failed to fetch performance metrics',
                code='DATA_ERROR'
            )
        return {
            k: v for k, v in performance_metrics['data'].items()
            if k != 'revenue'  # Revenue is handled separately
        }

class DashboardSummaryView(IsStaffMixin, APIView):
    """API endpoint for dashboard summary data."""
    
    def get(self, request):
        try:
            # Get all the metrics we need for the summary
            dashboard_stats = DashboardService.get_dashboard_stats()
            performance_metrics = DashboardService.get_performance_metrics()
            customer_stats = CustomerService.get_customer_stats()
            inventory_stats = InventoryService.get_inventory_stats()

            # Combine all stats into a summary
            summary = {
                'quick_stats': {
                    'total_customers': customer_stats['data']['total_customers'],
                    'total_capacity': inventory_stats['data']['total_capacity'],
                    'conversion_rate': performance_metrics['data']['quote_conversion_rate'],
                    'average_satisfaction': performance_metrics['data']['customer_satisfaction']['average_rating']
                },
                'trends': dashboard_stats['data']['trends'],
                'recent_activity': self._get_recent_activity(),
                'alerts': self._get_system_alerts()
            }

            return Response({
                'success': True,
                'data': summary
            })

        except AppError as e:
            logger.warning(f"Dashboard summary fetch failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error fetching dashboard summary")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_recent_activity(self) -> list:
        """Get recent system activity."""
        # This would typically come from an activity log
        return []

    def _get_system_alerts(self) -> list:
        """Get system alerts and notifications."""
        # This would typically come from a notification system
        return []