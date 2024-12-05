# solar/utils/auth.py
from datetime import datetime, timedelta
from functools import wraps

from django.http import JsonResponse
import jwt

from EnergyCove import settings


def generate_token(user_id, expiry_hours=24):
    """Generate a new JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.now() + timedelta(hours=expiry_hours),
        'iat': datetime.now()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def auth_required(view_func):
    """Decorator for views that require authentication"""
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        if not hasattr(request, 'user_id'):
            return JsonResponse({
                'success': False,
                'message': 'Authentication required'
            }, status=401)
        return view_func(request, *args, **kwargs)
    return wrapped_view
