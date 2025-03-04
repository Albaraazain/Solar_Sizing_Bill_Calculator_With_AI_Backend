from django.shortcuts import render, redirect
from django.urls import reverse
from solar.invoice_generator.invoicemaker import generate_invoice
from solar.invoice_generator.bill_verify import verify_bill
from solar.invoice_generator.bill_parser_ind import parse_electricity_bill_industrial
from solar.invoice_generator.bill_parser_gen import parse_electricity_bill_general
from solar.models import Panel, Inverter, PotentialCustomers, VariableCosts, BracketCosts, StructureType
import math
from django.http import JsonResponse
from django.contrib.auth.decorators import user_passes_test
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json


#@user_passes_test(lambda u: u.is_staff)
def control_panel(request):
    return render(request, 'solar/control_panel.html')

#@user_passes_test(lambda u: u.is_staff)
def panels(request):
    if request.method == 'GET':
        panels = Panel.objects.all().values()
        return JsonResponse(list(panels), safe=False)
    elif request.method == 'POST':
        data = json.loads(request.body)
        panel = Panel.objects.create(
            brand=data['brand'],
            price=data['price'],
            power=data['power'],
        )
        return JsonResponse({'message': 'Panel added successfully!'})

def set_default_panel(request, panel_id):
    # Set all default_choice fields to False
    Panel.objects.update(default_choice=False)

    # Set the selected panel's default_choice to True
    try:
        panel = Panel.objects.get(id=panel_id)
        panel.default_choice = True
        panel.save()
        return JsonResponse({'success': True})
    except Panel.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Panel not found'}, status=404)

#@user_passes_test(lambda u: u.is_staff)
def inverters(request):
    if request.method == 'GET':
        inverters = Inverter.objects.all().values()
        return JsonResponse(list(inverters), safe=False)
    elif request.method == 'POST':
        data = json.loads(request.body)
        inverter = Inverter.objects.create(
            brand=data['brand'],
            price=data['price'],
            power=data['power'],
            availability=data['availability']
        )
        return JsonResponse({'message': 'Inverter added successfully!'})

#@user_passes_test(lambda u: u.is_staff)
def customers(request):
    customers = PotentialCustomers.objects.all().values()
    return JsonResponse(list(customers), safe=False)

@csrf_exempt
#@user_passes_test(lambda u: u.is_staff)
def panel_list(request):
    if request.method == 'GET':
        panels = Panel.objects.all().values()
        return JsonResponse(list(panels), safe=False)
    elif request.method == 'POST':
        data = json.loads(request.body)
        panel = Panel.objects.create(
            brand=data['brand'],
            price=data['price'],
            power=data['power'],
            availability=data['availability']
        )
        return JsonResponse({"id": panel.id}, status=201)

@csrf_exempt
#@user_passes_test(lambda u: u.is_staff)
def panel_detail(request, id):
    panel = get_object_or_404(Panel, id=id)
    if request.method == 'PUT':
        data = json.loads(request.body)
        panel.brand = data['brand']
        panel.price = data['price']
        panel.power = data['power']
        panel.availability = data['availability']
        panel.save()
        return JsonResponse({"id": panel.id}, status=200)
    elif request.method == 'DELETE':
        panel.delete()
        return JsonResponse({"id": id}, status=200)

@csrf_exempt
#@user_passes_test(lambda u: u.is_staff)
def inverter_list(request):
    if request.method == 'GET':
        inverters = Inverter.objects.all().values()
        return JsonResponse(list(inverters), safe=False)
    elif request.method == 'POST':
        data = json.loads(request.body)
        inverter = Inverter.objects.create(
            brand=data['brand'],
            price=data['price'],
            power=data['power'],
            availability=data['availability']
        )
        return JsonResponse({"id": inverter.id}, status=201)

@csrf_exempt
#@user_passes_test(lambda u: u.is_staff)
def inverter_detail(request, id):
    inverter = get_object_or_404(Inverter, id=id)
    if request.method == 'PUT':
        data = json.loads(request.body)
        inverter.brand = data['brand']
        inverter.price = data['price']
        inverter.power = data['power']
        inverter.availability = data['availability']
        inverter.save()
        return JsonResponse({"id": inverter.id}, status=200)
    elif request.method == 'DELETE':
        inverter.delete()
        return JsonResponse({"id": id}, status=200)

@csrf_exempt
#@user_passes_test(lambda u: u.is_staff)
def set_prices(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        VariableCosts.objects.update_or_create(
            cost_name='Frame Cost per Watt', defaults={'cost': data['pricePerWatt']}
        )
        VariableCosts.objects.update_or_create(
            cost_name='Installation Cost per Watt', defaults={'cost': data['installationCost']}
        )
        VariableCosts.objects.update_or_create(
            cost_name='Net Metering', defaults={'cost': data['netMetering']}
        )
        VariableCosts.objects.update_or_create(
            cost_name='DC Wire Roll', defaults={'cost': data['dcRoll']}
        )
        VariableCosts.objects.update_or_create(
            cost_name='AC Cable', defaults={'cost': data['acCable']}
        )
        VariableCosts.objects.update_or_create(
            cost_name='Transport Cost', defaults={'cost': data['transport']}
        )
        VariableCosts.objects.update_or_create(
            cost_name='Accessories', defaults={'cost': data['accessories']}
        )
        VariableCosts.objects.update_or_create(
            cost_name='Labor Cost', defaults={'cost': data['labor']}
        )
        StructureType.objects.update_or_create(
            pk=1,  # Assuming there's only one record
            defaults={
                'l2': data['l2'],
                'custom_cost': data['customCost'],
                'abs_cost': data['absCost']
            }
        )
        return JsonResponse({"status": "success"}, status=200)

@csrf_exempt
#@user_passes_test(lambda u: u.is_staff)
def customer_list(request):
    if request.method == 'GET':
        customers = PotentialCustomers.objects.all().values()
        return JsonResponse(list(customers), safe=False)

@csrf_exempt
#@user_passes_test(lambda u: u.is_staff)
def get_prices(request):
    if request.method == 'GET':
        structure = StructureType.objects.first()
        installation_cost = VariableCosts.objects.filter(cost_name='Installation Cost per Watt').first()
        net_metering = VariableCosts.objects.filter(cost_name='Net Metering').first()
        dc_roll_cost = VariableCosts.objects.filter(cost_name='DC Wire Roll').first()
        ac_wire_cost = VariableCosts.objects.filter(cost_name='AC Cable').first()
        transport_cost = VariableCosts.objects.filter(cost_name='Transport Cost').first()
        accessories_cost = VariableCosts.objects.filter(cost_name='Accessories').first()
        labour_cost = VariableCosts.objects.filter(cost_name='Labor Cost').first()
        l2 = structure.l2 if structure else ''
        #print(net_metering.cost)
        response_data = {
            'custom_frame_cost_per_watt': structure.custom_cost if structure.custom_cost else '',
            'abs_frame_cost_per_watt': structure.abs_cost if structure else '',
            'installation_cost_per_watt': installation_cost.cost if installation_cost else '',
            'net_metering': net_metering.cost if net_metering else '',
            'dc_roll_cost': dc_roll_cost.cost if dc_roll_cost else '',
            'ac_wire_cost': ac_wire_cost.cost if ac_wire_cost else '',
            'transport_cost': transport_cost.cost if transport_cost else '',
            'accessories_cost': accessories_cost.cost if accessories_cost else '',
            'labour_cost': labour_cost.cost if labour_cost else '',
            'l2': l2
        }
        return JsonResponse(response_data, safe=False)