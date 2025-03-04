from django.contrib import admin
from .models import (
    Panel, Inverter, VariableCosts, BracketCosts, 
    Bill, Quote, Document, PotentialCustomers, StructureType
)

class PanelAdmin(admin.ModelAdmin):
    list_display = ('brand', 'price', 'power')
    
class InverterAdmin(admin.ModelAdmin):
    list_display = ('brand', 'price', 'power')
    
class PotentialCustomersAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'reference_number')    

class VariableCostsAdmin(admin.ModelAdmin):
    list_display = ('cost_name', 'cost')

class StructureTypeAdmin(admin.ModelAdmin):
    list_display = ('l2', 'custom_cost', 'abs_cost')

admin.site.register(StructureType, StructureTypeAdmin)

@admin.register(BracketCosts)
class BracketCostsAdmin(admin.ModelAdmin):
    list_display = ('get_system_range', 'dc_cable', 'ac_cable', 'accessories', 'created_at')
    list_filter = ('min_size', 'max_size')
    search_fields = ('min_size', 'max_size')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('min_size',)

    def get_system_range(self, obj):
        """Display system size range."""
        return f"{obj.min_size}kW - {obj.max_size}kW"
    get_system_range.short_description = 'System Range'

    fieldsets = (
        ('System Size Range', {
            'fields': ('min_size', 'max_size')
        }),
        ('Costs', {
            'fields': ('dc_cable', 'ac_cable', 'accessories')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

# Register your models here.
admin.site.register(Panel, PanelAdmin)
admin.site.register(Inverter, InverterAdmin)
admin.site.register(PotentialCustomers, PotentialCustomersAdmin)
admin.site.register(VariableCosts, VariableCostsAdmin)