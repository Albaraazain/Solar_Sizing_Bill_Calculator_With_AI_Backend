# solar/api_urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from solar.views import (
    dashboard_views,
    document_views,
    auth_views
)
from .views import (
    bill_views,
    quote_views,
    customer_views,
    admin_views,
    public_views
)
from .views.health_views import health_check

# Create routers for viewsets
admin_router = DefaultRouter()
admin_router.register(r'panels', admin_views.PanelViewSet)
admin_router.register(r'inverters', admin_views.InverterViewSet)

# Public equipment router
equipment_router = DefaultRouter()
equipment_router.register(r'panels', public_views.PublicPanelViewSet)
equipment_router.register(r'inverters', public_views.PublicInverterViewSet)

urlpatterns = [
    # Bill endpoints
    path('bill/validate/', bill_views.BillValidateAPIView.as_view(), name='bill-validate'),
    path('bill/details/<str:reference_number>/', bill_views.BillDetailsAPIView.as_view(), name='bill-details'),
    path('bill/analyze/', bill_views.BillAnalyzeAPIView.as_view(), name='bill-analyze'),
    path('bill/history/<str:reference_number>/', bill_views.BillHistoryAPIView.as_view(), name='bill-history'),

    # Quote endpoints
    path('quote/generate/', quote_views.QuoteGenerateAPIView.as_view(), name='quote-generate'),
    path('quote/details/<str:quote_id>/', quote_views.QuoteDetailsAPIView.as_view(), name='quote-details'),
    path('quote/save/', quote_views.QuoteSaveAPIView.as_view(), name='quote-save'),
    path('quote/generate-pdf/', quote_views.QuoteGeneratePDFAPIView.as_view(), name='quote-generate-pdf'),

    # Customer endpoints
    path('customers/', customer_views.CustomerListAPIView.as_view(), name='customer-list'),
    path('customers/<str:reference_number>/', customer_views.CustomerDetailAPIView.as_view(), name='customer-detail'),
    path('customers/bulk-create/', customer_views.CustomerBulkCreateAPIView.as_view(), name='customer-bulk-create'),
    path('customers/stats/', customer_views.CustomerStatsAPIView.as_view(), name='customer-stats'),

    # Equipment endpoints (public)
    path('equipment/', include(equipment_router.urls)),

    # Admin endpoints
    path('admin/', include([
        path('', include(admin_router.urls)),
        path('prices/', admin_views.PriceConfigurationView.as_view(), name='price-configuration'),
        path('dashboard/', include([
            path('stats/', dashboard_views.DashboardMetricsView.as_view(), name='dashboard-stats'),
            path('charts/', dashboard_views.DashboardChartsView.as_view(), name='dashboard-charts'),
            path('summary/', dashboard_views.DashboardSummaryView.as_view(), name='dashboard-summary'),
        ])),
    ])),

    # Document endpoints
    path('documents/', include([
        path('generate/', document_views.DocumentGenerateView.as_view(), name='document-generate'),
        path('<str:document_path>/', document_views.DocumentDownloadView.as_view(), name='document-download'),
        path('', document_views.DocumentListView.as_view(), name='document-list'),
    ])),

    # Auth endpoints
    path('auth/', include([
        path('login/', auth_views.LoginView.as_view(), name='auth-login'),
        path('refresh/', auth_views.RefreshTokenView.as_view(), name='auth-refresh'),
    ])),

    path('health/', health_check, name='health_check'),
]