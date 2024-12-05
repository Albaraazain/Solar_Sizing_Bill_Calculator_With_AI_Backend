from django.urls import path

from solar import views

app_name = 'solar'

urlpatterns = [
    path('bill/validate/', views.validate_reference, name='validate_reference'),
    path('bill/details/<str:reference_number>/', views.get_bill_details, name='get_bill_details'),
    path('bill/analyze/', views.analyze_bill, name='analyze_bill'),
    path('bill/history/<str:reference_number>/', views.get_bill_history, name='bill_history'),
    path('quote/generate/', views.generate_quote, name='generate_quote'),
    path('quote/details/<str:quote_id>/', views.get_quote_details, name='quote_details'),
]

# EnergyCove/urls.py
from django.urls import path, include

urlpatterns = [
    path('api/', include('solar.urls')),
    path('', include('solar.frontend_urls')),  # For serving frontend
]