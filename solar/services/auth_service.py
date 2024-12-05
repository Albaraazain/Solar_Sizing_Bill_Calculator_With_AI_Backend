# solar/services/auth_service.py
from typing import Dict, Any, Tuple, Union
from datetime import datetime, timedelta, timezone
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
import jwt

from .base_service import BaseService
from ..middleware.error_handler import AppError

User = get_user_model()

class AuthService(BaseService):
    """Service for handling authentication and authorization."""

    TOKEN_TYPE_ACCESS = 'access'
    TOKEN_TYPE_REFRESH = 'refresh'

    @classmethod
    def login(cls, username: str, password: str) -> Dict[str, Any]:
        """
        Authenticate user and generate tokens.
        
        Args:
            username: User's username
            password: User's password
            
        Returns:
            Dict containing tokens and user data
            
        Raises:
            AppError: If authentication fails
        """
        try:
            cls.validate_data({'username': username, 'password': password}, 
                            ['username', 'password'])

            user = authenticate(username=username, password=password)
            if not user:
                raise AppError(
                    message='Invalid credentials',
                    code='AUTHENTICATION_ERROR'
                )

            access_token, refresh_token = cls._generate_tokens(user)

            return cls.format_response({
                'token': access_token,
                'refreshToken': refresh_token,
                'user': {
                    'id': user.pk,  # Use pk instead of id
                    'username': user.username,
                    'email': user.email,
                    'isStaff': user.is_staff
                }
            })
            
        except Exception as e:
            cls.handle_error(e, 'LOGIN_ERROR', 'Login failed')
            # Add explicit return for type checker
            return {'success': False, 'error': str(e)}

    @classmethod
    def refresh_token(cls, refresh_token: str) -> Dict[str, str]:
        """
        Generate new access token using refresh token.
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            Dict containing new tokens
            
        Raises:
            AppError: If refresh token is invalid
        """
        try:
            # Verify refresh token
            payload = jwt.decode(
                refresh_token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )

            # Check token type
            if payload.get('type') != cls.TOKEN_TYPE_REFRESH:
                raise AppError('Invalid token type', 'TOKEN_ERROR')

            user = User.objects.get(pk=payload['user_id'])
            access_token, new_refresh = cls._generate_tokens(user)

            return cls.format_response({
                'token': access_token,
                'refreshToken': new_refresh
            })

        except (jwt.InvalidTokenError, User.DoesNotExist) as e:
            raise AppError(
                message='Invalid refresh token',
                code='TOKEN_ERROR',
                data={'error': str(e)},
            ) from e
        except Exception as e:
            cls.handle_error(e, 'REFRESH_ERROR', 'Token refresh failed')
            # Add explicit return for type checker
            return {'token': '', 'refreshToken': ''}

    @classmethod
    def _generate_tokens(cls, user: Any) -> Tuple[str, str]:
        """
        Generate access and refresh tokens for user.
        
        Args:
            user: User object to generate tokens for
            
        Returns:
            Tuple of (access_token, refresh_token)
        """
        # Access token - short lived
        access_payload = {
            'user_id': user.pk,
            'type': cls.TOKEN_TYPE_ACCESS,
            'exp': datetime.now(timezone.utc) + timedelta(hours=1),
            'iat': datetime.now(timezone.utc),
        }

        # Refresh token - long lived
        refresh_payload = {
            'user_id': user.pk,
            'type': cls.TOKEN_TYPE_REFRESH,
            'exp': datetime.now(timezone.utc) + timedelta(days=7),
            'iat': datetime.now(timezone.utc),
        }

        access_token = jwt.encode(
            access_payload,
            settings.SECRET_KEY,
            algorithm='HS256'
        )

        refresh_token = jwt.encode(
            refresh_payload,
            settings.SECRET_KEY,
            algorithm='HS256'
        )

        return access_token, refresh_token

    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """
        Verify JWT token and return payload.
        
        Args:
            token: JWT token to verify
            
        Returns:
            Dict containing token payload
            
        Raises:
            AppError: If token is invalid
        """
        try:
            return jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
        except jwt.ExpiredSignatureError as e:
            raise AppError('Token has expired', 'TOKEN_EXPIRED') from e
        except jwt.InvalidTokenError as e:
            raise AppError(
                'Invalid token', 'TOKEN_INVALID', {'error': str(e)}
            ) from e