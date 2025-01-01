# EnergyCove/urls.py
from django.urls import path, include

urlpatterns = [
    path('', include('solar.urls')),
]