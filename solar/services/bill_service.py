# solar/services/bill_service.py
import math
import requests
from typing import Dict, Any, List
from django.conf import settings
from solar.invoice_generator.Bill_Reader import bill_reader

from .base_service import BaseService
from .bill_parser import get_parser_for_bill
from ..middleware.error_handler import AppError, ErrorTypes

class BillService(BaseService):
    """Service for handling electricity bill operations."""

    BASE_URL = "https://bill.pitc.com.pk/mepcobill"

    # Constants for calculations
    KWH_PER_KW_PER_DAY = 4  # Average daily production per kW in Pakistan
    AVERAGE_RATE_PKR = 20  # Average rate per unit
    CO2_PER_KWH = 0.0007  # Metric tons of CO2 per kWh
    TREES_PER_TON = 40  # Trees needed to offset 1 ton of CO2
    
    @classmethod
    def validate_bill(cls, reference_number: str) -> Dict[str, Any]:
        """Validate bill reference number and determine bill type."""
        try:
            # First validate the format
            print("Validating bill format")
            if not reference_number.isdigit():
                return cls.format_response({
                    'isValid': False,
                    'message': 'Reference number must contain only digits'
                })

            # Check each bill type
            print("Checking bill types")
            try:
                response = bill_reader(reference_number)
                print(f"Response: {response}")
                if response.get('Name') and response['Name'] != "Not found":
                    return cls.format_response({
                        'isValid': True,
                        'referenceNumber': reference_number,
                        'source_url': "https://bill.pitc.com.pk/mepcobill"
                    })
            except requests.RequestException as e:
                print(f"Error checking bill: {str(e)}")

            # If we get here, bill was not found in any type
            return cls.format_response({
                'isValid': False,
                'message': 'Bill not found. Please check your reference number.'
            })

        except requests.RequestException as e:
            raise AppError(
                message='Unable to validate bill at this time. Please try again later.',
                code=ErrorTypes.NETWORK_ERROR,
                data={'original_error': str(e)}
            )
        except Exception as e:
            raise AppError(
                message='Failed to validate bill',
                code=ErrorTypes.SERVER_ERROR,
                data={'original_error': str(e)}
            )
        
    @classmethod
    def get_bill_details(cls, reference_number: str) -> Dict[str, Any]:
        """
        Get detailed bill information with analysis.
        
        Args:
            reference_number: Bill reference number
            
        Returns:
            Dict containing bill details and analysis
            
        Raises:
            AppError: If bill fetch or processing fails
        """
        try:
            # First validate the bill
            bill = bill_reader(reference_number)
            if bill.name == "Not found":
                raise AppError(
                    message='Invalid bill reference',
                    code=ErrorTypes.VALIDATION_ERROR
                )
            #validation = cls.validate_bill(reference_number)
            #if not validation['data']['isValid']:
            #    raise AppError(
            #        message='Invalid bill reference',
            #        code=ErrorTypes.VALIDATION_ERROR
            #    )

            # Fetch bill HTML
            #response = requests.get(validation['data']['source_url'])
            #if response.status_code != 200:
            #    raise AppError(
            #        message='Failed to fetch bill',
            #        code=ErrorTypes.SERVICE_ERROR
            #    )

            # Parse bill using appropriate parser
            #parser = get_parser_for_bill(
            #    validation['data']['type'],
            #    response.text
            #)
            #bill_data = parser.parse_bill()

            #if not bill_data:
            #    raise AppError(
            #        message='Failed to parse bill data',
            #        code=ErrorTypes.SERVICE_ERROR
            #    )

            # Calculate system sizing and enhancements
            yearly_units = int(bill['Total Yearly Units'])
            print(f"Yearly units: {yearly_units}")
            system_sizing = cls.calculate_system_sizing(yearly_units)

            return cls.format_response(
                cls._enhance_bill_data(bill, system_sizing)
            )

        except AppError:
            raise
        except Exception as e:
            raise AppError(
                message='Failed to process bill',
                code=ErrorTypes.SERVER_ERROR,
                data={'original_error': str(e)},
            ) from e

    @classmethod
    def analyze_bill(cls, reference_number: str) -> Dict[str, Any]:
        """
        Analyze bill and provide detailed insights.
        
        Args:
            reference_number: Bill reference number
            
        Returns:
            Dict containing analysis results
            
        Raises:
            AppError: If analysis fails
        """
        try:
            bill_details = cls.get_bill_details(reference_number)
            yearly_units = int(bill_details['data']['Total Yearly Units'])

            return cls.format_response({
                'consumption': cls.calculate_consumption_metrics(yearly_units),
                'systemSize': cls.calculate_system_sizing(yearly_units),
                'savings': cls.calculate_savings_metrics(yearly_units),
                'environmental': cls.calculate_environmental_impact(yearly_units),
                'production': cls.calculate_monthly_production(
                    cls.calculate_system_sizing(yearly_units)['recommended']
                )
            })

        except AppError:
            raise
        except Exception as e:
            raise AppError(
                message='Failed to analyze bill',
                code=ErrorTypes.SERVER_ERROR,
                data={'original_error': str(e)},
            ) from e

    @classmethod
    def calculate_system_sizing(cls, yearly_units: int) -> Dict[str, float]:
        """Calculate recommended system sizes based on yearly consumption."""
        daily_units = yearly_units / 365
        base_kw = daily_units / cls.KWH_PER_KW_PER_DAY
        
        return {
            'recommended': math.ceil(base_kw * 1.5),  # 50% buffer
            'smaller': math.ceil(base_kw * 1.3),      # 30% buffer
            'larger': math.ceil(base_kw * 1.7)        # 70% buffer
        }

    @classmethod
    def calculate_consumption_metrics(cls, yearly_units: int) -> Dict[str, float]:
        """Calculate consumption-related metrics."""
        daily_avg = yearly_units / 365
        monthly_avg = yearly_units / 12
        
        return {
            'daily': round(daily_avg, 2),
            'monthly': round(monthly_avg, 2),
            'yearly': yearly_units,
            'peak': round(daily_avg * 1.4, 2)  # Estimated peak
        }

    @classmethod
    def calculate_savings_metrics(cls, yearly_units: int) -> Dict[str, Any]:
        """Calculate financial savings metrics."""
        monthly_savings = (yearly_units / 12) * cls.AVERAGE_RATE_PKR
        yearly_savings = yearly_units * cls.AVERAGE_RATE_PKR
        
        system_size = math.ceil((yearly_units / 365 / cls.KWH_PER_KW_PER_DAY) * 1.5)
        installation_cost = 150000  # Base cost per kW
        total_cost = installation_cost * system_size

        return {
            'monthly': round(monthly_savings, 2),
            'yearly': round(yearly_savings, 2),
            'paybackPeriod': round(total_cost / yearly_savings, 1),
            'estimatedCost': total_cost,
            'roi': round((yearly_savings / total_cost) * 100, 1)
        }

    @classmethod
    def calculate_environmental_impact(cls, yearly_units: int) -> Dict[str, float]:
        """Calculate environmental impact metrics."""
        co2_reduction = yearly_units * cls.CO2_PER_KWH
        trees_equivalent = co2_reduction * cls.TREES_PER_TON

        return {
            'co2Reduction': round(co2_reduction, 2),
            'treesEquivalent': round(trees_equivalent),
            'homesEquivalent': round(yearly_units / 12000),  # Avg home usage
            'carbonFootprintReduction': round(co2_reduction * 1000, 2)  # Convert to kg
        }

    @classmethod
    def calculate_monthly_production(cls, system_size: float) -> List[Dict[str, Any]]:
        """Calculate estimated monthly production with seasonal variations."""
        base_production = system_size * cls.KWH_PER_KW_PER_DAY * 30
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
    def get_bill_history(cls, reference_number: str) -> Dict[str, Any]:
        """
        Get historical bill data for a reference number.
        
        Args:
            reference_number: Bill reference number
            
        Returns:
            Dict containing bill history data
            
        Raises:
            AppError: If history fetch fails
        """
        try:
            # First validate the bill
            validation = cls.validate_bill(reference_number)
            if not validation['data']['isValid']:
                raise AppError(
                    message='Invalid bill reference',
                    code=ErrorTypes.VALIDATION_ERROR
                )

            # Fetch bill details for the last 12 months
            url = f"{cls.BASE_URL}/history/{validation['data']['type']}?refno={reference_number}"
            response = requests.get(url)
            
            if response.status_code != 200:
                raise AppError(
                    message='Failed to fetch bill history',
                    code=ErrorTypes.SERVICE_ERROR
                )

            # Parse and process historical data
            history_data = []
            yearly_total = 0
            monthly_avg = 0
            
            # Process the response data
            # Note: This is a placeholder - adjust according to actual API response
            if response.json().get('history'):
                history = response.json()['history']
                yearly_total = sum(month['units'] for month in history)
                monthly_avg = yearly_total / len(history) if history else 0
                history_data = [{
                    'month': item['month'],
                    'year': item['year'],
                    'units': item['units'],
                    'amount': item['amount'],
                    'dueDate': item['dueDate'],
                    'status': item['status']
                } for item in history]

            return cls.format_response({
                'history': history_data,
                'summary': {
                    'yearlyTotal': yearly_total,
                    'monthlyAverage': round(monthly_avg, 2),
                    'totalMonths': len(history_data),
                    'referenceNumber': reference_number
                }
            })

        except AppError:
            raise
        except Exception as e:
            raise AppError(
                message='Failed to process bill history',
                code=ErrorTypes.SERVER_ERROR,
                data={'original_error': str(e)},
            ) from e

    @staticmethod
    def _enhance_bill_data(bill_data: Dict[str, Any], system_sizing: Dict[str, float]) -> Dict[str, Any]:
        """Enhance bill data with calculated fields."""
        try:
            return {
                **bill_data,
                'customerName': bill_data.get('Name', ''),
                'unitsConsumed': int(bill_data.get('Units Consumed', 0)),
                'dueDate': bill_data.get('Due Date', ''),
                'issueDate': bill_data.get('Issue Date', ''),
                'amount': float(
                    bill_data.get('Payable Within Due Date', '0')
                    .replace('PKR ', '')
                    .replace(',', '')
                ),
                'systemSizing': system_sizing
            }
        except (ValueError, AttributeError) as e:
            raise AppError(
                message='Failed to process bill data',
                code='DATA_PROCESSING_ERROR',
                data={'error': str(e)},
            ) from e