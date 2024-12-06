
from rest_framework import serializers
from decimal import Decimal
from .models import Panel, Inverter, BracketCosts, VariableCosts

class PanelSerializer(serializers.ModelSerializer):
    power = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))

    class Meta:
        model = Panel
        fields = '__all__'

class InverterSerializer(serializers.ModelSerializer):
    power = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))

    class Meta:
        model = Inverter
        fields = '__all__'

