# solar/views/__init__.py
"""Views package for handling API and frontend requests."""

from .admin_views import (
    PanelViewSet,
    InverterViewSet,
    PriceConfigurationView,
    # DashboardStatsView
)
from .bill_views import (
    BillValidateAPIView,
    BillDetailsAPIView,
    BillAnalyzeAPIView
)
from .customer_views import (
    CustomerListAPIView,
    CustomerDetailAPIView,
    CustomerBulkCreateAPIView,
    CustomerStatsAPIView
)
from .quote_views import (
    QuoteGenerateAPIView,
    QuoteDetailsAPIView,
    QuoteSaveAPIView
)
from .document_views import (
    DocumentGenerateView,
    DocumentDownloadView,
    DocumentListView
)
from .dashboard_views import (
    DashboardMetricsView,
    DashboardChartsView,
    DashboardSummaryView
)
from .public_views import (
    IndexView,
    QuotationView,
    ContactView
)

__all__ = [
    # Admin Views
    'PanelViewSet',
    'InverterViewSet',
    'PriceConfigurationView',
    # 'DashboardStatsView',
    
    # Bill Views
    'BillValidateAPIView',
    'BillDetailsAPIView',
    'BillAnalyzeAPIView',
    
    # Customer Views
    'CustomerListAPIView',
    'CustomerDetailAPIView',
    'CustomerBulkCreateAPIView',
    'CustomerStatsAPIView',
    
    # Quote Views
    'QuoteGenerateAPIView',
    'QuoteDetailsAPIView',
    'QuoteSaveAPIView',
    
    # Document Views
    'DocumentGenerateView',
    'DocumentDownloadView',
    'DocumentListView',
    
    # Dashboard Views
    'DashboardMetricsView',
    'DashboardChartsView',
    'DashboardSummaryView',
    
    # Public Views
    'IndexView',
    'QuotationView',
    'ContactView'
]