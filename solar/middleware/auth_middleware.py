# solar/middleware/auth_middleware.py
from django.http import JsonResponse
from django.conf import settings
import jwt
from datetime import datetime, timedelta
from functools import wraps

class AuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip auth for certain paths
        if self.should_skip_auth(request.path):
            return self.get_response(request)

        # Verify token
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return JsonResponse({
                'success': False,
                'message': 'Authentication required'
            }, status=401)

        try:
            # Extract token
            token = auth_header.split(' ')[1]
            # Verify token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            # Add user info to request
            request.user_id = payload.get('user_id')
            
            # Check if token needs refresh
            exp = datetime.fromtimestamp(payload['exp'])
            if exp - datetime.now() < timedelta(hours=1):
                new_token = generate_token(payload['user_id'])
                response = self.get_response(request)
                response['X-New-Token'] = new_token
                return response

        except jwt.ExpiredSignatureError:
            return JsonResponse({
                'success': False,
                'message': 'Token has expired'
            }, status=401)
        except (jwt.InvalidTokenError, IndexError):
            return JsonResponse({
                'success': False,
                'message': 'Invalid token'
            }, status=401)

        return self.get_response(request)

    def should_skip_auth(self, path):
        """Define paths that don't need authentication"""
        EXEMPT_PATHS = [
            '/api/auth/login',
            '/api/auth/register',
            '/api/auth/refresh',
            '/api/bill/validate',
            '/admin/',
            '/',  # Your frontend routes
        ]
        return any(path.startswith(exempt_path) for exempt_path in EXEMPT_PATHS)


