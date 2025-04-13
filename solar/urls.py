# solar/urls.py
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views.frontend_views import SPAView
from .views import control_views
from solar.views.control_views import calculate_quote, generate_quote_pdf


# Main URL patterns
urlpatterns = [
    path('control_panel/', control_views.control_panel, name='control_panel'),
    path('api/panels/', control_views.panel_list),
    path('api/panels/<int:id>/', control_views.panel_detail),
    path('api/inverters/', control_views.inverter_list),
    path('api/inverters/<int:id>/', control_views.inverter_detail),
    path('api/customers/', control_views.customer_list),
    path('api/set-prices/', control_views.set_prices),
    path('api/get-prices/', control_views.get_prices, name='get_prices'),
    path('api/set-default-panel/<int:panel_id>/', control_views.set_default_panel, name='set_default_panel'),
    # API routes
    path('api/', include('solar.api_urls')),
    path('api/calculate-quote/', calculate_quote, name='calculate_quote'),
    path('api/generate-quote-pdf/', generate_quote_pdf, name='generate_quote_pdf'),
    
    # Serve frontend
    path('', SPAView.as_view(), name='spa'),
    # Catch all unknown paths and let frontend router handle them
    re_path(r'^(?!api/).*$', SPAView.as_view(), name='spa-routes'),

]