# solar/frontend_urls.py
from django.urls import path
from .views.public_views import IndexView, QuotationView

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('bill-review/', IndexView.as_view(), name='bill-review'),
    path('quote/', IndexView.as_view(), name='quote'),
    path('quotation/', QuotationView.as_view(), name='quotation'),
]