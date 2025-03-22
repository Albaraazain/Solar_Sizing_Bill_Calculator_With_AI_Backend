# solar/services/quote_service.py
from typing import Dict, Any, List
from decimal import Decimal
import math
from django.db import transaction
import logging

from .base_service import BaseService
from .inventory_service import InventoryService
from ..models import Bill, Panel, Inverter, Quote, VariableCosts, BracketCosts
from ..middleware.error_handler import AppError
logger = logging.getLogger(__name__)

class QuoteService(BaseService):
    """Service for handling solar system quotes and calculations."""

    # Constants for calculations
    PEAK_SUN_HOURS = 4.5  # Average peak sun hours in Pakistan
    PERFORMANCE_RATIO = 0.75  # System performance ratio
    ANNUAL_DEGRADATION = 0.007  # Panel degradation rate per year
    VAT_RATE = 0.17  # VAT rate for solar equipment
    INSTALLATION_MARGIN = 0.15  # Installation profit margin

    @classmethod
    def generate_quote(cls, bill_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate solar system quote based on bill data.
        
        Args:
            bill_data: Dict containing bill analysis data
            
        Returns:
            Dict containing complete quote details
            
        Raises:
            AppError: If quote generation fails
        """
        try:
            # Enhanced debugging
            logger.info("=== Starting Quote Generation ===")
            logger.info(f"Received bill data: {bill_data}")
            print(bill_data)
            # Data sanitization
            sanitized_data = {
                'reference_number': str(bill_data.get('reference_number', '')).strip(),
                'units_consumed': float(bill_data.get('units_consumed', 0)),
                'amount': float(bill_data.get('amount', 0)),
                'total_yearly_units': float(bill_data.get('total_yearly_units', 0)),
                'customer_name': str(bill_data.get('customer_name', '')).strip(),
                'customer_address': str(bill_data.get('customer_address', '')).strip(),
                'issue_date': bill_data.get('issue_date'),
                'due_date': bill_data.get('due_date')
            }
            
            logger.info(f"Sanitized data: {sanitized_data}")
            print(sanitized_data)
            # Validate required fields
            required_fields = ['reference_number', 'units_consumed', 'amount', 'total_yearly_units']
            missing_fields = [field for field in required_fields if not sanitized_data.get(field)]
            
            if missing_fields:
                raise AppError(
                    message=f"Missing required fields: {', '.join(missing_fields)}",
                    code='VALIDATION_ERROR'
                )

            # Validate numeric values
            if sanitized_data['total_yearly_units'] <= 0:
                raise AppError(
                    message="Yearly units must be greater than 0",
                    code='VALIDATION_ERROR'
                )

            # Calculate system size
            system_size = cls._calculate_system_size(sanitized_data['total_yearly_units'])
            logger.info(f"Calculated system size: {system_size}kW")

            # Get components with error handling
            try:
                panel = cls._get_default_panel()
                panels_needed = cls._calculate_panels_needed(system_size, panel.power)
                inverter = cls._get_suitable_inverter(system_size)
                
                logger.info(f"Components selected - Panel: {panel.brand}, Count: {panels_needed}, Inverter: {inverter.brand}")
                
            except AppError as e:
                logger.error(f"Component selection failed: {str(e)}")
                raise

            # Calculate costs with validation
            try:
                costs = cls._get_all_costs(system_size, panels_needed)
                logger.info(f"Calculated costs: {costs}")
                
            except AppError as e:
                logger.error(f"Cost calculation failed: {str(e)}")
                raise

            # Rest of the calculation logic remains the same
            # Calculate system metrics
            calculations = cls._calculate_system_metrics(
                system_size=system_size,
                panel_data={'cost': panel.price, 'count': panels_needed, 'power': panel.power},
                inverter_data={'cost': inverter.price, 'brand': inverter.brand},
                costs=costs
            )

            return cls.format_response({
                'systemDetails': {
                    'systemSize': system_size,
                    'panelCount': panels_needed,
                    'panelType': {
                        'brand': panel.brand,
                        'power': int(panel.power),
                        'price': int(panel.price) * panels_needed * panel.power
                    },
                    'inverterType': {
                        'brand': inverter.brand,
                        'power': float(inverter.power),
                        'price': float(inverter.price)
                    },
                    'roofArea': panels_needed * 2, 
                    'customer_name': sanitized_data['customer_name'],
                    'customer_address': sanitized_data['customer_address'],
                    'installationTime': cls._estimate_installation_time(system_size),
                    'warranty': {
                        'panels': '25 years',
                        'inverter': '5 years',
                        'installation': '2 years'
                    }
                },
                'production': calculations['production'],
                'financial': calculations['financial'],
                'environmental': calculations['environmental'],
                'costs': cls._format_costs_breakdown(costs)
            })

        except AppError as e:
            logger.error(f"Quote generation failed with AppError: {str(e)}")
            raise
        except KeyError as e:
            logger.error(f"Missing required field: {e}")
            raise AppError(
                message=f'Missing required field: {str(e)}',
                code='VALIDATION_ERROR'
            )   
        except ValueError as e:
            logger.error(f"Value conversion error: {e}")
            raise AppError(
                message='Invalid numeric value',
                code='VALIDATION_ERROR',
                data={'error': str(e)}
            )
        except Exception as e:
            logger.exception("Unexpected error in quote generation")
            raise AppError(
                message='Failed to generate quote',
                code='QUOTE_GENERATION_ERROR',
                data={'error': str(e)}
            )
            
            
    @classmethod
    def _calculate_system_size(cls, yearly_units: float) -> float:
        """Calculate optimal system size based on yearly consumption."""
        daily_avg = yearly_units / 365
        base_size = daily_avg / (cls.PEAK_SUN_HOURS * cls.PERFORMANCE_RATIO)
        return math.ceil(base_size * 1.5)  # Add 50% buffer

    @classmethod
    def _get_default_panel(cls) -> Panel:
        """Get the default panel from inventory."""
        panel = Panel.objects.filter(default_choice=True, availability=True).first()
        if not panel:
            raise AppError(
                message='No default panel configured',
                code='INVENTORY_ERROR'
            )
        return panel

    @classmethod
    def _calculate_panels_needed(cls, system_size: float, panel_power: Decimal) -> int:
        """Calculate number of panels needed."""
        return math.ceil((system_size * 1000) / float(panel_power))

    @classmethod
    def _get_suitable_inverter(cls, system_size: float) -> Inverter:
        """Get appropriate inverter for system size."""
        inverter = Inverter.objects.filter(
            power__gte=system_size,
            availability=True
        ).order_by('power').first()

        if not inverter:
            raise AppError(
                message='No suitable inverter found',
                code='INVENTORY_ERROR',
                data={'system_size': system_size}
            )
        return inverter

    @classmethod
    def _get_all_costs(cls, system_size: float, panels_count: int) -> Dict[str, float]:
        """Get all system costs with enhanced error handling."""
        try:
            logger.info(f"Calculating costs for {system_size}kW system with {panels_count} panels")

            # Get variable costs with defaults
            variable_costs = {}
            required_costs = [
                'Net Metering',
                'Installation Cost per Watt',
                'Frame Cost per Watt',
                'Labor Cost'
            ]
            
            for cost in VariableCosts.objects.all():
                variable_costs[cost.cost_name] = float(cost.cost)
            
            # Check for missing costs and use defaults
            for required_cost in required_costs:
                if required_cost not in variable_costs:
                    logger.warning(f"Missing cost: {required_cost}, using default")
                    default_values = {
                        'Net Metering': VariableCosts.objects.get(cost_name='Net Metering').cost,
                        'Installation Cost per Watt': VariableCosts.objects.get(cost_name='Installation Cost per Watt').cost,
                        'Frame Cost per Watt': VariableCosts.objects.get(cost_name='Frame Cost per Watt').cost,
                        'Labor Cost': 5000
                    }
                    variable_costs[required_cost] = default_values[required_cost]

            # Get bracket costs
            bracket_costs = InventoryService.get_bracket_costs(system_size)
            logger.info(f"Retrieved bracket costs: {bracket_costs}")

            costs = {
                'net_metering': variable_costs['Net Metering'],
                'installation': variable_costs['Installation Cost per Watt'] * system_size * 1000,
                'frame': variable_costs['Frame Cost per Watt'] * system_size * 1000,
                'labor': variable_costs['Labor Cost'] * system_size,
                'dc_cable': bracket_costs['dc_cable'],
                'ac_cable': bracket_costs['ac_cable'],
                'accessories': bracket_costs['accessories'],
                'transport': cls._calculate_transport_cost(system_size),
                'margin': 0,
                'vat': 0
            }

            logger.info(f"Final calculated costs: {costs}")
            return costs

        except Exception as e:
            logger.exception("Error calculating costs")
            raise AppError(
                message='Failed to retrieve costs',
                code='COST_ERROR',
                data={
                    'error': str(e),
                    'system_size': system_size,
                    'panels_count': panels_count
                }
            )

    @classmethod
    def _calculate_system_metrics(
        cls, 
        system_size: float,
        panel_data: Dict[str, Any],
        inverter_data: Dict[str, Any],
        costs: Dict[str, float]
    ) -> Dict[str, Any]:
        """Calculate comprehensive system metrics."""
        
        # Calculate production metrics
        daily_production = system_size * cls.PEAK_SUN_HOURS * cls.PERFORMANCE_RATIO
        monthly_production = daily_production * 30
        yearly_production = daily_production * 365

        # Calculate system costs
        total_panel_cost = float(panel_data['cost']) * panel_data['count']
        total_inverter_cost = float(inverter_data['cost'])
        
        total_cost = (
            total_panel_cost +
            total_inverter_cost +
            sum(costs.values())
        )

        # Calculate savings
        annual_savings = yearly_production * 20  # Assuming PKR 20 per unit
        monthly_savings = annual_savings / 12

        return {
            'production': {
                'daily': round(daily_production, 1),
                'monthly': cls._generate_monthly_production(monthly_production),
                'annual': round(yearly_production),
                'peakHours': cls.PEAK_SUN_HOURS,
                'performanceRatio': cls.PERFORMANCE_RATIO,
                'yearlyDegradation': cls.ANNUAL_DEGRADATION * 100
            },
            'financial': {
                'systemCost': round(total_cost),
                'annualSavings': round(annual_savings),
                'monthlySavings': round(monthly_savings),
                'paybackPeriod': round(total_cost / annual_savings, 1),
                'roi': round((annual_savings / total_cost) * 100, 1),
                'savingsTimeline': cls._generate_savings_timeline(
                    annual_savings,
                    total_cost
                ),
                'financingOptions': cls._generate_financing_options(total_cost)
            },
            'environmental': {
                'co2Offset': round(system_size * 1.2, 1),  # Tons per year
                'treesEquivalent': round(system_size * 20),
                'homesEquivalent': round(yearly_production / 12000),
                'carbonFootprintReduction': round(system_size * 1000)  # kg/year
            }
        }

    @classmethod
    def _generate_monthly_production(cls, base_production: float) -> List[Dict[str, Any]]:
        """Generate monthly production estimates with seasonal variations."""
        seasonal_factors = {
            'winter': 0.7,  # Nov-Feb
            'spring': 0.9,  # Mar-Apr
            'summer': 1.2,  # May-Aug
            'fall': 0.8     # Sep-Oct
        }

        months = [
            ('Jan', 'winter'), ('Feb', 'winter'), ('Mar', 'spring'),
            ('Apr', 'spring'), ('May', 'summer'), ('Jun', 'summer'),
            ('Jul', 'summer'), ('Aug', 'summer'), ('Sep', 'fall'),
            ('Oct', 'fall'), ('Nov', 'winter'), ('Dec', 'winter')
        ]

        return [{
            'month': month,
            'production': round(base_production * seasonal_factors[season]),
            'efficiency': round(seasonal_factors[season] * 100, 1)
        } for month, season in months]

    @classmethod
    def _generate_savings_timeline(
        cls,
        annual_savings: float,
        system_cost: float,
        years: int = 25
    ) -> List[Dict[str, Any]]:
        """Generate long-term savings projection."""
        return [{
            'year': year + 1,
            'annualSavings': round(
                annual_savings * (1 + (year * 0.05)) * 
                (1 - cls.ANNUAL_DEGRADATION) ** year
            ),
            'cumulativeSavings': round(
                annual_savings * (year + 1) * 
                (1 + (year * 0.025)) * 
                (1 - cls.ANNUAL_DEGRADATION) ** year
            )
        } for year in range(years)]

    @classmethod
    def _generate_financing_options(cls, total_cost: float) -> List[Dict[str, Any]]:
        """Generate financing options for the system."""
        return [
            {
                'name': 'Full Payment',
                'downPayment': round(total_cost),
                'monthlyPayment': 0,
                'term': 0,
                'totalCost': round(total_cost)
            },
            {
                'name': '50% Down Payment',
                'downPayment': round(total_cost * 0.5),
                'monthlyPayment': round((total_cost * 0.5) / 12),
                'term': 12,
                'totalCost': round(total_cost * 1.1)  # 10% financing cost
            },
            {
                'name': '25% Down Payment',
                'downPayment': round(total_cost * 0.25),
                'monthlyPayment': round((total_cost * 0.75) / 24),
                'term': 24,
                'totalCost': round(total_cost * 1.2)  # 20% financing cost
            }
        ]

    @staticmethod
    def _estimate_installation_time(system_size: float) -> str:
        """Estimate installation time based on system size."""
        if system_size <= 5:
            return "2-3 days"
        elif system_size <= 10:
            return "3-5 days"
        else:
            return "5-7 days"

    @staticmethod
    def _calculate_transport_cost(system_size: float) -> float:
        """Calculate transportation cost based on system size."""
        try:
            transport_cost = VariableCosts.objects.get(cost_name='Transport Cost').cost
            return float(transport_cost)
        except VariableCosts.DoesNotExist:
            raise AppError(
                message='Transport Cost not found in variable costs',
                code='COST_ERROR'
            )

    @staticmethod
    def _calculate_margin(system_size: float) -> float:
        """Calculate installation margin."""
        return system_size * 1000 * 0.15  # 15% margin

    @staticmethod
    def _calculate_vat(system_size: float) -> float:
        """Calculate VAT amount."""
        return system_size * 1000 * 0.17  # 17% VAT

    @staticmethod
    def _format_costs_breakdown(costs: Dict[str, float]) -> Dict[str, Any]:
        """Format costs for client presentation."""
        total = sum(costs.values())
        
        return {
            'details': {
                category: {
                    'amount': round(amount),
                    'percentage': round((amount / total) * 100, 1)
                }
                for category, amount in costs.items()
            },
            'total': round(total),
            'summary': {
                'equipment': round(sum([
                    costs['dc_cable'], 
                    costs['ac_cable'],
                    costs['accessories']
                ])),
                'installation': round(sum([
                    costs['installation'],
                    costs['labor'],
                    costs['frame']
                ])),
                'other': round(sum([
                    costs['net_metering'],
                    costs['transport'],
                    costs['margin'],
                    costs['vat']
                ]))
            }
        }

    @classmethod
    def get_quote_by_id(cls, quote_id: int) -> Dict[str, Any]:
        """
        Retrieve quote details by ID.
        
        Args:
            quote_id: ID of the quote to retrieve
            
        Returns:
            Dict containing quote details
            
        Raises:
            AppError: If quote not found or retrieval fails
        """
        try:
            quote = Quote.objects.select_related('bill').get(id=quote_id)
            return cls.format_response({
                'quote': {
                    'id': quote.id,
                    'systemSize': float(quote.system_size),
                    'totalCost': float(quote.total_cost),
                    'createdAt': quote.created_at.isoformat(),
                    'bill': {
                        'referenceNumber': quote.bill.reference_number,
                        'customerName': quote.bill.customer_name,
                        'amount': float(quote.bill.amount),
                        'unitsConsumed': quote.bill.units_consumed
                    }
                }
            })
        except Quote.DoesNotExist:
            raise AppError(
                message='Quote not found',
                code='NOT_FOUND_ERROR',
                data={'quote_id': quote_id}
            )
        except Exception as e:
            raise AppError(
                message='Failed to retrieve quote',
                code='RETRIEVAL_ERROR',
                data={'error': str(e)}
            )

    @classmethod
    def save_quote(cls, quote_data: Dict[str, Any], customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save quote with customer details.
        
        Args:
            quote_data: Dict containing quote information
            customer_data: Dict containing customer details
            
        Returns:
            Dict containing saved quote details
            
        Raises:
            AppError: If save operation fails
        """
        try:
            with transaction.atomic():
                # Create or update bill record
                bill, _ = Bill.objects.update_or_create(
                    reference_number=customer_data.get('reference_number'),
                    defaults={
                        'customer_name': customer_data.get('name'),
                        'amount': quote_data.get('amount', 0),
                        'units_consumed': quote_data.get('units', 0),
                        'issue_date': quote_data.get('issue_date'),
                        'due_date': quote_data.get('due_date')
                    }
                )

                # Create quote record
                quote = Quote.objects.create(
                    bill=bill,
                    system_size=quote_data.get('system_size'),
                    total_cost=quote_data.get('total_cost')
                )

                return cls.format_response({
                    'quote': {
                        'id': quote.id,
                        'referenceNumber': bill.reference_number,
                        'customerName': bill.customer_name,
                        'systemSize': float(quote.system_size),
                        'totalCost': float(quote.total_cost),
                        'createdAt': quote.created_at.isoformat()
                    }
                })

        except Exception as e:
            raise AppError(
                message='Failed to save quote',
                code='SAVE_ERROR',
                data={'error': str(e)}
            )