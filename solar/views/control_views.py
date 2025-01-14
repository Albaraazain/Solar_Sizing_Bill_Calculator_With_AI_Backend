from django.shortcuts import render, redirect
from django.urls import reverse
from solar.invoice_generator.Bill_Reader import bill_reader
from solar.invoice_generator.invoicemaker import generate_invoice
from solar.invoice_generator.bill_verify import verify_bill
from solar.invoice_generator.bill_parser_ind import parse_electricity_bill_industrial
from solar.invoice_generator.bill_parser_gen import parse_electricity_bill_general
from solar.models import Panel, Inverter, PotentialCustomers, VariableCosts, BracketCosts
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
        variableCosts.objects.update_or_create(
            cost_name='Frame Cost per Watt', defaults={'cost': data['pricePerWatt']}
        )
        variableCosts.objects.update_or_create(
            cost_name='Installation Cost per Watt', defaults={'cost': data['installationCost']}
        )
        variableCosts.objects.update_or_create(
            cost_name='Net Metering', defaults={'cost': data['netMetering']}
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
        frame_cost = variableCosts.objects.filter(cost_name='Frame Cost per Watt').first()
        installation_cost = variableCosts.objects.filter(cost_name='Installation Cost per Watt').first()
        net_metering = variableCosts.objects.filter(cost_name='Net Metering').first()
        print(net_metering.cost)
        response_data = {
            'frame_cost_per_watt': frame_cost.cost if frame_cost else '',
            'installation_cost_per_watt': installation_cost.cost if installation_cost else '',
            'net_metering': net_metering.cost if net_metering else ''
        }
        return JsonResponse(response_data, safe=False)