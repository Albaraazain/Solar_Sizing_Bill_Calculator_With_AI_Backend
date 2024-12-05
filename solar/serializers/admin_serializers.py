# path: solar/serializers/admin_serializers.py
from rest_framework import serializers
from ..models import Panel, Inverter, PotentialCustomers

class PanelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Panel
        fields = ['id', 'brand', 'power', 'price', 'default_choice', 'availability']
        read_only_fields = ['id']

    def validate_power(self, value):
        if value <= 0:
            raise serializers.ValidationError("Power must be greater than 0")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

class InverterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inverter
        fields = ['id', 'brand', 'power', 'price', 'availability']
        read_only_fields = ['id']

    def validate_power(self, value):
        if value <= 0:
            raise serializers.ValidationError("Power must be greater than 0")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PotentialCustomers
        fields = ['id', 'name', 'phone', 'address', 'reference_number', 'created_at']
        read_only_fields = ['id', 'created_at']

class PriceConfigurationSerializer(serializers.Serializer):
    frame_cost_per_watt = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0
    )
    installation_cost_per_watt = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0
    )
    net_metering = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0
    )
    labor_cost = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0
    )