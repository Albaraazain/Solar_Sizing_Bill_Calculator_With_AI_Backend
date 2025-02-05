from django.http import JsonResponse

def health_check(request):
    """
    Basic health check endpoint that returns 200 OK.
    Used by Render.com to monitor the application's health.
    """
    return JsonResponse({"status": "healthy"}, status=200) 