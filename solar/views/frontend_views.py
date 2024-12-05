# solar/views/frontend_views.py
from django.views.generic import TemplateView
from django.conf import settings

class SPAView(TemplateView):
    """
    Base view to serve the frontend SPA.
    All frontend routes will be handled by the JavaScript router.
    """
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            'api_url': settings.API_URL,
            'debug': settings.DEBUG,
        })
        return context