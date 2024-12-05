import logging
from typing import Any, Dict, cast
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.request import Request
from django.db.models import Q
from django.db import transaction
from django.contrib.auth.mixins import UserPassesTestMixin
from django.http import HttpRequest
from ..models import Panel, Inverter, PotentialCustomers, VariableCosts
from ..middleware.error_handler import AppError, ErrorTypes
from ..serializers.admin_serializers import (
    PanelSerializer,
    InverterSerializer,
    CustomerSerializer,
    PriceConfigurationSerializer
)

logger = logging.getLogger(__name__)

class IsStaffMixin(UserPassesTestMixin):
    def test_func(self) -> bool:
        user = getattr(self.request, 'user', None)
        return bool(user and user.is_staff)

    def get_request(self) -> Request:
        return self.request

    @property
    def request(self) -> Request:
        return self.get_request()

class PanelViewSet(IsStaffMixin, viewsets.ModelViewSet):
    """ViewSet for managing solar panels."""
    
    queryset = Panel.objects.all()
    serializer_class = PanelSerializer

    def get_queryset(self):
        queryset = Panel.objects.all()
        request = cast(Request, self.request)
        brand = request.query_params.get('brand', None)
        power_min = request.query_params.get('power_min', None)
        power_max = request.query_params.get('power_max', None)

        if brand:
            queryset = queryset.filter(brand__icontains=brand)
        if power_min:
            queryset = queryset.filter(power__gte=power_min)
        if power_max:
            queryset = queryset.filter(power__lte=power_max)

        return queryset.order_by('-power')

    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        try:
            with transaction.atomic():
                # Reset all panels
                Panel.objects.all().update(default_choice=False)
                # Set new default
                panel = self.get_object()
                panel.default_choice = True
                panel.save()

            return Response({
                'success': True,
                'message': f'{panel.brand} set as default panel'
            })
        except Exception as e:
            logger.exception('Error setting default panel')
            raise AppError(
                message='Failed to set default panel', code=ErrorTypes.SERVER_ERROR
            ) from e

class InverterViewSet(IsStaffMixin, viewsets.ModelViewSet):
    """ViewSet for managing inverters."""
    
    queryset = Inverter.objects.all()
    serializer_class = InverterSerializer

    def get_queryset(self):
        queryset = Inverter.objects.all()
        brand = self.request.query_params.get('brand', None)
        available = self.request.query_params.get('available', None)
        power_min = self.request.query_params.get('power_min', None)

        if brand:
            queryset = queryset.filter(brand__icontains=brand)
        if available is not None:
            queryset = queryset.filter(availability=available.lower() == 'true')
        if power_min:
            queryset = queryset.filter(power__gte=power_min)

        return queryset.order_by('power')

class CustomerViewSet(IsStaffMixin, viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing potential customers."""
    
    queryset = PotentialCustomers.objects.all()
    serializer_class = CustomerSerializer

    def get_queryset(self):
        queryset = PotentialCustomers.objects.all()
        if search := self.request.query_params.get('search', None):
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(phone__icontains=search) |
                Q(reference_number__icontains=search)
            )

        return queryset.order_by('-created_at')

class PriceConfigurationView(IsStaffMixin, APIView):
    """API endpoint for managing variable costs configuration."""

    def get(self, request):
        try:
            costs = {
                'frame_cost_per_watt': VariableCosts.objects.get(
                    cost_name='Frame Cost per Watt'
                ).cost,
                'installation_cost_per_watt': VariableCosts.objects.get(
                    cost_name='Installation Cost per Watt'
                ).cost,
                'net_metering': VariableCosts.objects.get(
                    cost_name='Net Metering'
                ).cost,
                'labor_cost': VariableCosts.objects.get(
                    cost_name='Labor Cost'
                ).cost
            }

            return Response({
                'success': True,
                'data': costs
            })
        except VariableCosts.DoesNotExist as e:
            logger.error(f'Missing cost configuration: {str(e)}')
            raise AppError(
                message='Incomplete cost configuration', code=ErrorTypes.NOT_FOUND
            ) from e
        except Exception as e:
            logger.exception('Error fetching price configuration')
            raise AppError(
                message='Failed to fetch price configuration',
                code=ErrorTypes.SERVER_ERROR,
            ) from e

    def post(self, request: Request) -> Response:
        try:
            serializer = PriceConfigurationSerializer(data=request.data)
            if not serializer.is_valid():
                raise AppError(
                    message='Invalid price configuration',
                    code=ErrorTypes.VALIDATION_ERROR,
                    data=serializer.errors
                )

            validated_data: Dict[str, float] = serializer.validated_data # type: ignore

            with transaction.atomic():
                for cost_name, value in validated_data.items():
                    VariableCosts.objects.update_or_create(
                        cost_name=cost_name,
                        defaults={'cost': value}
                    )

            return Response({
                'success': True,
                'message': 'Price configuration updated successfully'
            })
        except AppError:
            raise
        except Exception as e:
            logger.exception('Error updating price configuration')
            raise AppError(
                message='Failed to update price configuration',
                code=ErrorTypes.SERVER_ERROR,
            ) from e