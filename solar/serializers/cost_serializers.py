from decimal import Decimal
from rest_framework import serializers
from ..models import BracketCosts, VariableCosts

class BracketCostsSerializer(serializers.ModelSerializer):
    min_size = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal('0.00'))
    max_size = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal('0.00'))
    dc_cable = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))
    ac_cable = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))
    accessories = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))

    class Meta:
        model = BracketCosts
        fields = '__all__'

class VariableCostsSerializer(serializers.ModelSerializer):
    cost = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))

    class Meta:
        model = VariableCosts
        fields = '__all__'