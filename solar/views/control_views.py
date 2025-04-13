from django.shortcuts import render, redirect
from django.urls import reverse
from solar.invoice_generator.invoicemaker import generate_invoice
from solar.invoice_generator.bill_verify import verify_bill
from solar.invoice_generator.bill_parser_ind import parse_electricity_bill_industrial
from solar.invoice_generator.bill_parser_gen import parse_electricity_bill_general
from solar.models import Panel, Inverter, PotentialCustomers, VariableCosts, BracketCosts, StructureType
import math
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.decorators import user_passes_test
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json
from decimal import Decimal
from datetime import datetime


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

@csrf_exempt
def calculate_quote(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        system_size_kw = Decimal(data.get('system_size', 0))  # Convert to Decimal
        system_size_watts = system_size_kw * 1000  # Convert to watts
        l2 = data.get('l2', 0)  # Get the L2 value from the request

        # Get the panel based on the provided ID or use default if no ID provided
        panel_id = data.get('panel_id')
        if panel_id:
            panel = get_object_or_404(Panel, id=panel_id)
        else:
            panel = Panel.objects.filter(default_choice=True).first()
            if not panel:
                return JsonResponse({'error': 'No panel selected and no default panel found'}, status=404)

        # Calculate the number of panels needed (ceiling)
        num_panels = math.ceil(system_size_watts / panel.power)
        panel_cost = system_size_watts * panel.price
        panel_brand = panel.brand  
        
        # Get the selected inverter and its cost
        inverter_id = data.get('inverter_id')
        inverter = Inverter.objects.filter(id=inverter_id).first()
        if not inverter:
            return JsonResponse({'error': 'Inverter not found'}, status=404)
        inverter_cost = inverter.price
        inverter_power = inverter.power
        inverter_brand = inverter.brand

        # Get costs from inputs
        frame_cost = Decimal(data.get('frame_cost', 0))
        installation_cost = Decimal(data.get('installation_cost', 0)) * system_size_watts
        transportation_cost = Decimal(data.get('transportation_cost', 0))
        dc_cable_cost = Decimal(data.get('dc_cable_cost', 0))
        ac_cable_cost = Decimal(data.get('ac_cable_cost', 0))
        accessories_cost = Decimal(data.get('accessories_cost', 0))
        labor_cost = Decimal(data.get('labor_cost', 0))
        net_metering_cost = Decimal(data.get('net_metering_cost', 0))

        # Calculate total frame cost based on L2 value
        if l2 == 'True':
            total_frame_cost = frame_cost * math.ceil(num_panels / 2)
        else:
            total_frame_cost = frame_cost * system_size_watts

        # Calculate total costs
        total_variable_costs = (installation_cost + transportation_cost + dc_cable_cost + 
                                ac_cable_cost + accessories_cost + labor_cost + net_metering_cost)
        total_cost = panel_cost + inverter_cost + total_variable_costs + total_frame_cost

        # Include these costs in the response
        return JsonResponse({
            'num_panels': num_panels,
            'panel_cost': panel_cost,
            'panel_power': panel.power,
            'inverter_cost': inverter_cost,
            'installation_cost': installation_cost,
            'total_frame_cost': total_frame_cost,   
            'transportation_cost': transportation_cost,
            'dc_cable_cost': dc_cable_cost,
            'ac_cable_cost': ac_cable_cost,
            'accessories_cost': accessories_cost,
            'labor_cost': labor_cost,
            'net_metering_cost': net_metering_cost,
            'total_cost': total_cost,
            'inverter_power': inverter_power,
            'inverter_brand': inverter_brand,
            'panel_brand': panel_brand,
            'total_frame_cost': total_frame_cost
        }, status=200)

@csrf_exempt
def generate_quote_pdf(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Extract all the editable field values from the request
            customer_name = data.get('customer_name', '')
            customer_address = data.get('customer_address', '')
            customer_whatsapp = data.get('customer_whatsapp', '')
            system_size = data.get('system_size', 0)
            num_panels = data.get('num_panels', 0)
            panel_brand = data.get('panel_brand', '')
            panel_power = data.get('panel_power', 0)
            panel_cost = data.get('panel_cost', 0)
            inverter_power = data.get('inverter_power', 0)
            inverter_brand = data.get('inverter_brand', '')
            inverter_cost = data.get('inverter_cost', 0)
            installation_cost = data.get('installation_cost', 0)
            transportation_cost = data.get('transportation_cost', 0)
            dc_cable_cost = data.get('dc_cable_cost', 0)
            ac_cable_cost = data.get('ac_cable_cost', 0)
            accessories_cost = data.get('accessories_cost', 0)
            labor_cost = data.get('labor_cost', 0)
            net_metering_cost = data.get('net_metering_cost', 0)
            frame_cost = data.get('frame_cost', 0)
            total_cost = data.get('total_cost', 0)
            
            print("Received data for PDF generation:", data)
            
            # Calculate electrical_and_mechanical_costs (labor + accessories)
            electrical_and_mechanical_costs = float(labor_cost) + float(accessories_cost)
            
            # Calculate cabling_costs (DC + AC cables)
            cabling_costs = float(dc_cable_cost) + float(ac_cable_cost)
            
            try:
                from solar.invoice_generator.invoicemaker import generate_invoice
                
                print("About to call generate_invoice with:")
                print(f"system_size: {system_size}")
                print(f"panel_amount: {num_panels}")
                print(f"panel_power: {panel_power}")
                print(f"price_of_inverter: {inverter_cost}")
                print(f"brand_of_inverter: {inverter_brand}")
                print(f"price_of_panels: {panel_cost}")
                print(f"netmetering_costs: {net_metering_cost}")
                print(f"installation_costs: {installation_cost}")
                print(f"cabling_costs: {cabling_costs}")
                print(f"structure_costs: {frame_cost}")
                print(f"electrical_and_mechanical_costs: {electrical_and_mechanical_costs}")
                print(f"total_cost: {total_cost}")
                print(f"customer_name: {customer_name}")
                print(f"customer_address: {customer_address}")
                print(f"customer_contact: {customer_whatsapp}")
                
                # Generate the PDF using the invoice generator function
                pdf_path = generate_invoice(
                    system_size=system_size,
                    panel_amount=num_panels,
                    panel_power=panel_power,
                    price_of_inverter=inverter_cost,
                    brand_of_inverter=inverter_brand,
                    price_of_panels=panel_cost,
                    netmetering_costs=net_metering_cost,
                    installation_costs=installation_cost,
                    cabling_costs=cabling_costs, 
                    structure_costs=frame_cost,
                    electrical_and_mechanical_costs=electrical_and_mechanical_costs,
                    total_cost=total_cost,
                    customer_name=customer_name,
                    customer_address=customer_address,
                    customer_contact=customer_whatsapp
                )
                
                print(f"PDF generation successful. Path: {pdf_path}")
                
                # Return the PDF file
                with open(pdf_path, 'rb') as pdf:
                    response = HttpResponse(pdf.read(), content_type='application/pdf')
                    response['Content-Disposition'] = f'attachment; filename="Quote_{customer_name}_{datetime.now().strftime("%Y-%m-%d")}.pdf"'
                    return response
                    
            except Exception as e:
                import traceback
                print("Error in generate_invoice function:")
                print(traceback.format_exc())
                return JsonResponse({'error': str(e)}, status=500)
                
        except Exception as e:
            import traceback
            print("Error processing request:")
            print(traceback.format_exc())
            return JsonResponse({'error': f'Error processing request: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)

