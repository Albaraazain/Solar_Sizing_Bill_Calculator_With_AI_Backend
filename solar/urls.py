# solar/urls.py
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views.frontend_views import SPAView

# Main URL patterns
urlpatterns = [
    # API routes
    path('api/', include('solar.api_urls')),
    
    # Serve frontend
    path('', SPAView.as_view(), name='spa'),
    # Catch all unknown paths and let frontend router handle them
    re_path(r'^(?!api/).*$', SPAView.as_view(), name='spa-routes'),

]