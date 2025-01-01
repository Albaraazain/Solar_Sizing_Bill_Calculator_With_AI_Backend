
from django.core.management.base import BaseCommand
from decimal import Decimal
from solar.models import VariableCosts, BracketCosts

class Command(BaseCommand):
    help = 'Creates default variable and bracket costs'

    def handle(self, *args, **kwargs):
        # Default variable costs
        default_costs = {
            'Net Metering': '50000.00',
            'Installation Cost per Watt': '10.00',
            'Frame Cost per Watt': '8.00',
            'Labor Cost': '5000.00'
        }

        for name, cost in default_costs.items():
            VariableCosts.objects.get_or_create(
                cost_name=name,
                defaults={'cost': Decimal(cost)}
            )

        # Default bracket costs
        brackets = [
            {
                'min_size': '0.00',
                'max_size': '5.00',
                'dc_cable': '15000.00',
                'ac_cable': '10000.00',
                'accessories': '20000.00'
            },
            {
                'min_size': '5.00',
                'max_size': '10.00',
                'dc_cable': '25000.00',
                'ac_cable': '15000.00',
                'accessories': '30000.00'
            },
            {
                'min_size': '10.00',
                'max_size': '999.00',
                'dc_cable': '35000.00',
                'ac_cable': '20000.00',
                'accessories': '40000.00'
            }
        ]

        for bracket in brackets:
            BracketCosts.objects.get_or_create(
                min_size=Decimal(bracket['min_size']),
                max_size=Decimal(bracket['max_size']),
                defaults={
                    'dc_cable': Decimal(bracket['dc_cable']),
                    'ac_cable': Decimal(bracket['ac_cable']),
                    'accessories': Decimal(bracket['accessories'])
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully created default costs'))