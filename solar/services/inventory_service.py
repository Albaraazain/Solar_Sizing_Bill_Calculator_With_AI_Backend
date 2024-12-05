# solar/services/inventory_service.py
from typing import Dict, Any, List, Optional, NoReturn
from decimal import Decimal
from django.db import transaction
from django.db.models import Q

from .base_service import BaseService
from ..models import Panel, Inverter, VariableCosts, BracketCosts
from ..middleware.error_handler import AppError

class InventoryService(BaseService):
    """Service for managing solar system inventory and costs."""

    @classmethod
    def handle_service_error(cls, e: Exception, code: str, message: str) -> None:
        """Updated error handling"""
        cls.handle_error(e, code, message)
        raise AppError(message=message, code=code, data={'original_error': str(e)}) from e

    @classmethod
    def get_panels(cls, filters: Optional[Dict[str, Any]] = None) -> List[Panel]:
        """
        Get panels with optional filtering.
        
        Args:
            filters: Optional dict containing filter parameters
                - brand: Filter by brand name
                - power_min: Minimum power rating
                - power_max: Maximum power rating
                - available_only: Only show available panels
        """
        try:
            queryset = Panel.objects.all()

            if filters:
                if brand := filters.get('brand'):
                    queryset = queryset.filter(brand__icontains=brand)
                if power_min := filters.get('power_min'):
                    queryset = queryset.filter(power__gte=power_min)
                if power_max := filters.get('power_max'):
                    queryset = queryset.filter(power__lte=power_max)
                if filters.get('available_only'):
                    queryset = queryset.filter(availability=True)

            return list(queryset.order_by('-power'))

        except Exception as e:
            cls.handle_service_error(e, 'PANEL_FETCH_ERROR', 'Failed to fetch panels')
            return []  # To satisfy type checker, though this line is never reached

    @classmethod
    def get_inverters(cls, filters: Optional[Dict[str, Any]] = None) -> List[Inverter]:
        """
        Get inverters with optional filtering.
        
        Args:
            filters: Optional dict containing filter parameters
                - brand: Filter by brand name
                - power_min: Minimum power rating
                - available_only: Only show available inverters
        """
        try:
            queryset = Inverter.objects.all()

            if filters:
                if brand := filters.get('brand'):
                    queryset = queryset.filter(brand__icontains=brand)
                if power_min := filters.get('power_min'):
                    queryset = queryset.filter(power__gte=power_min)
                if filters.get('available_only'):
                    queryset = queryset.filter(availability=True)

            return list(queryset.order_by('power'))

        except Exception as e:
            cls.handle_service_error(e, 'INVERTER_FETCH_ERROR', 'Failed to fetch inverters')
            return []  # To satisfy type checker

    @classmethod
    @transaction.atomic
    def add_panel(cls, panel_data: Dict[str, Any]) -> Panel:
        """Add a new panel to inventory."""
        try:
            cls.validate_data(panel_data, ['brand', 'power', 'price'])

            # Convert decimal fields
            panel_data['power'] = Decimal(str(panel_data['power']))
            panel_data['price'] = Decimal(str(panel_data['price']))

            return Panel.objects.create(**panel_data)

        except Exception as e:
            cls.handle_service_error(e, 'PANEL_CREATE_ERROR', 'Failed to create panel')
            raise  # To satisfy type checker

    @classmethod
    @transaction.atomic
    def add_inverter(cls, inverter_data: Dict[str, Any]) -> Inverter:
        """Add a new inverter to inventory."""
        try:
            cls.validate_data(inverter_data, ['brand', 'power', 'price'])

            # Convert decimal fields
            inverter_data['power'] = Decimal(str(inverter_data['power']))
            inverter_data['price'] = Decimal(str(inverter_data['price']))

            return Inverter.objects.create(**inverter_data)

        except Exception as e:
            cls.handle_service_error(e, 'INVERTER_CREATE_ERROR', 'Failed to create inverter')
            raise  # To satisfy type checker

    @classmethod
    @transaction.atomic
    def update_panel(cls, panel_id: int, update_data: Dict[str, Any]) -> Panel:
        """Update panel details."""
        try:
            panel = Panel.objects.get(id=panel_id)

            # Convert decimal fields if present
            if 'power' in update_data:
                update_data['power'] = Decimal(str(update_data['power']))
            if 'price' in update_data:
                update_data['price'] = Decimal(str(update_data['price']))

            for field, value in update_data.items():
                setattr(panel, field, value)

            panel.save()
            return panel

        except Panel.DoesNotExist as e:
            raise AppError(
                message=f'Panel with id {panel_id} not found',
                code='NOT_FOUND'
            ) from e
        except Exception as e:
            cls.handle_service_error(e, 'PANEL_UPDATE_ERROR', 'Failed to update panel')
            raise  # This will never be reached but satisfies type checker

    @classmethod
    @transaction.atomic
    def update_inverter(cls, inverter_id: int, update_data: Dict[str, Any]) -> Inverter:
        """Update inverter details."""
        try:
            inverter = Inverter.objects.get(id=inverter_id)

            # Convert decimal fields if present
            if 'power' in update_data:
                update_data['power'] = Decimal(str(update_data['power']))
            if 'price' in update_data:
                update_data['price'] = Decimal(str(update_data['price']))

            for field, value in update_data.items():
                setattr(inverter, field, value)

            inverter.save()
            return inverter

        except Inverter.DoesNotExist as e:
            raise AppError(
                message=f'Inverter with id {inverter_id} not found',
                code='NOT_FOUND'
            ) from e
        except Exception as e:
            cls.handle_service_error(e, 'INVERTER_UPDATE_ERROR', 'Failed to update inverter')
            raise  # This will never be reached but satisfies type checker

    @classmethod
    @transaction.atomic
    def set_default_panel(cls, panel_id: int) -> Panel:
        """Set a panel as the default choice."""
        try:
            # Reset all panels
            Panel.objects.all().update(default_choice=False)

            # Set new default
            panel = Panel.objects.get(id=panel_id)
            panel.default_choice = True
            panel.save()

            return panel

        except Panel.DoesNotExist as e:
            raise AppError(
                message=f'Panel with id {panel_id} not found',
                code='NOT_FOUND'
            ) from e
        except Exception as e:
            cls.handle_service_error(e, 'DEFAULT_SET_ERROR', 'Failed to set default panel')
            raise  # This will never be reached but satisfies type checker

    @classmethod
    def get_price_configuration(cls) -> Dict[str, float]:
        """Get current price configuration."""
        try:
            costs = VariableCosts.objects.all()
            return {
                cost.cost_name: float(cost.cost)
                for cost in costs
            }

        except Exception as e:
            cls.handle_service_error(e, 'CONFIG_FETCH_ERROR', 'Failed to fetch price configuration')
            raise  # This will never be reached but satisfies type checker

    @classmethod
    @transaction.atomic
    def update_price_configuration(cls, config: Dict[str, float]) -> Dict[str, float]:
        """Update price configuration."""
        try:
            for name, cost in config.items():
                VariableCosts.objects.update_or_create(
                    cost_name=name,
                    defaults={'cost': Decimal(str(cost))}
                )

            return config

        except Exception as e:
            cls.handle_service_error(e, 'CONFIG_UPDATE_ERROR', 'Failed to update price configuration')
            raise  # This will never be reached but satisfies type checker

    @classmethod
    def get_bracket_costs(cls, system_size: float) -> Dict[str, float]:
        """Get appropriate bracket costs for system size."""
        try:
            costs = {}
            for cost_type in ['DC Cables', 'AC Cables', 'Accessories']:
                if not (bracket := BracketCosts.objects.filter(
                    Type=cost_type,
                    SystemRange__lte=system_size
                ).order_by('-SystemRange').first()):
                    raise AppError(
                        message=f'No bracket cost found for {cost_type}',
                        code='NOT_FOUND',
                        data={'system_size': system_size}
                    )

                costs[cost_type.lower().replace(' ', '_')] = float(bracket.cost)

            return costs

        except Exception as e:
            cls.handle_service_error(e, 'BRACKET_FETCH_ERROR', 'Failed to fetch bracket costs')
            raise  # To satisfy type checker

    @classmethod
    def get_inventory_stats(cls) -> Dict[str, Any]:
        """Get inventory statistics."""
        try:
            return {
                'panels': {
                    'total': Panel.objects.count(),
                    'available': Panel.objects.filter(availability=True).count(),
                    'total_power': sum(
                        float(p.power)
                        for p in Panel.objects.filter(availability=True)
                    ),
                    'brands': Panel.objects.values('brand').distinct().count(),
                },
                'inverters': {
                    'total': Inverter.objects.count(),
                    'available': Inverter.objects.filter(
                        availability=True
                    ).count(),
                    'total_power': sum(
                        float(i.power)
                        for i in Inverter.objects.filter(availability=True)
                    ),
                    'brands': Inverter.objects.values('brand').distinct().count(),
                },
            }
        except Exception as e:
            cls.handle_service_error(e, 'STATS_ERROR', 'Failed to fetch inventory statistics')
            raise  # This will never be reached but satisfies type checker