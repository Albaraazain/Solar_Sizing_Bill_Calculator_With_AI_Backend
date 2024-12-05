from django.contrib import admin
from .models import Panel, Inverter, PotentialCustomers, VariableCosts, BracketCosts

class PanelAdmin(admin.ModelAdmin):
    list_display = ('brand', 'price', 'power')
    
class InverterAdmin(admin.ModelAdmin):
    list_display = ('brand', 'price', 'power')
    
class PotentialCustomersAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'reference_number')    

class VariableCostsAdmin(admin.ModelAdmin):
    list_display = ('cost_name', 'cost')

class BracketCostsAdmin(admin.ModelAdmin):
    list_display = ('Type', 'SystemRange', 'cost')

# Register your models here.
admin.site.register(Panel, PanelAdmin)
admin.site.register(Inverter, InverterAdmin)
admin.site.register(PotentialCustomers, PotentialCustomersAdmin)
admin.site.register(VariableCosts, VariableCostsAdmin)
admin.site.register(BracketCosts, BracketCostsAdmin)