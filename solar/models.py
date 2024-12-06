from django.db import models
from datetime import datetime
from decimal import Decimal

# Create your models here.
class Panel(models.Model):
    brand = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    power = models.DecimalField(max_digits=10, decimal_places=2)
    default_choice = models.BooleanField(default=False)
    availability = models.BooleanField(default=True)
    
class Inverter(models.Model):
    brand = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    power = models.DecimalField(max_digits=10, decimal_places=2)
    availability = models.BooleanField(default=True)

class VariableCosts(models.Model):
    cost_name = models.CharField(max_length=100)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    
class PotentialCustomers(models.Model):
    id = models.AutoField(primary_key=True)  # Add this line
    name = models.CharField(max_length=15)
    phone = models.CharField(max_length=11)
    address = models.TextField()
    reference_number = models.CharField(max_length=14)
    date = models.DateTimeField(default=datetime.now)

class BracketCosts(models.Model):
    """Cost brackets for different system sizes."""
    min_size = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Minimum system size in kW"
    )
    max_size = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        default=Decimal('999.00'),
        help_text="Maximum system size in kW"
    )
    dc_cable = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=Decimal('15000.00'),
        help_text="DC cable cost for this bracket"
    )
    ac_cable = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=Decimal('10000.00'),
        help_text="AC cable cost for this bracket"
    )
    accessories = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=Decimal('20000.00'),
        help_text="Accessories cost for this bracket"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        null=True,  # Allow null temporarily
        blank=True
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        null=True,  # Allow null temporarily
        blank=True
    )

    class Meta:
        verbose_name = "Bracket Cost"
        verbose_name_plural = "Bracket Costs"
        unique_together = ('min_size', 'max_size')

    def __str__(self):
        return f"Size: {self.min_size}kW - {self.max_size}kW"
    
class Bill(models.Model):
    reference_number = models.CharField(max_length=100)
    customer_name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    units_consumed = models.IntegerField()
    issue_date = models.DateField()
    due_date = models.DateField()
    
class Quote(models.Model):
    id = models.AutoField(primary_key=True)  # Add this line
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE)
    system_size = models.DecimalField(max_digits=5, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

class Document(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)  # quote, agreement, invoice, report
    path = models.CharField(max_length=512)
    url = models.URLField(max_length=512)
    size = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    reference_number = models.CharField(max_length=100, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'path': self.path,
            'url': self.url,
            'size': self.size,
            'created_at': self.created_at.isoformat(),
            'modified_at': self.modified_at.isoformat(),
            'reference_number': self.reference_number,
            'metadata': self.metadata
        }