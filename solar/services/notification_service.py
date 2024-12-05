# solar/services/notification_service.py
from typing import Dict, Any, List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from django.template.loader import render_to_string
import logging

from .base_service import BaseService
from ..middleware.error_handler import AppError

logger = logging.getLogger(__name__)

class NotificationService(BaseService):
    """Service for handling notifications and alerts."""

    EMAIL_TEMPLATES = {
        'quote': 'email/quote.html',
        'welcome': 'email/welcome.html',
        'status_update': 'email/status_update.html',
        'installation': 'email/installation.html'
    }

    @classmethod
    def send_quote_email(cls, quote_data: Dict[str, Any], recipient: str) -> bool:
        """Send quote details via email."""
        try:
            subject = "Your Solar System Quote"
            template = cls.EMAIL_TEMPLATES['quote']
            
            html_content = render_to_string(template, {
                'quote': quote_data,
                'company_name': settings.COMPANY_NAME,
                'contact_email': settings.CONTACT_EMAIL,
                'contact_phone': settings.CONTACT_PHONE
            })

            return cls.send_email(recipient, subject, html_content)

        except Exception as e:
            cls.handle_error(e, 'EMAIL_ERROR', 'Failed to send quote email')
            return False  # Ensure a boolean is returned

    @classmethod
    def send_welcome_email(cls, customer_data: Dict[str, Any]) -> bool:
        """Send welcome email to new customer."""
        try:
            subject = f"Welcome to {settings.COMPANY_NAME}"
            template = cls.EMAIL_TEMPLATES['welcome']
            
            html_content = render_to_string(template, {
                'customer': customer_data,
                'company_name': settings.COMPANY_NAME,
                'contact_info': {
                    'email': settings.CONTACT_EMAIL,
                    'phone': settings.CONTACT_PHONE,
                    'address': settings.COMPANY_ADDRESS
                }
            })

            return cls.send_email(customer_data['email'], subject, html_content)

        except Exception as e:
            cls.handle_error(e, 'EMAIL_ERROR', 'Failed to send welcome email')
            return False  # Ensure a boolean is returned

    @classmethod
    def send_status_update(cls, customer_email: str, status_data: Dict[str, Any]) -> bool:
        """Send status update notification."""
        try:
            subject = f"Update on Your Solar Installation"
            template = cls.EMAIL_TEMPLATES['status_update']
            
            html_content = render_to_string(template, {
                'status': status_data,
                'company_name': settings.COMPANY_NAME,
                'contact_info': {
                    'email': settings.CONTACT_EMAIL,
                    'phone': settings.CONTACT_PHONE
                }
            })

            return cls.send_email(customer_email, subject, html_content)

        except Exception as e:
            cls.handle_error(e, 'EMAIL_ERROR', 'Failed to send status update')
            return False  # Ensure a boolean is returned

    @classmethod
    def send_bulk_email(cls, recipients: List[str], subject: str, 
                       template_name: str, template_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send bulk emails."""
        try:
            if template_name not in cls.EMAIL_TEMPLATES:
                raise AppError(
                    message=f'Template {template_name} not found',
                    code='TEMPLATE_ERROR'
                )

            template = cls.EMAIL_TEMPLATES[template_name]
            html_content = render_to_string(template, template_data)

            results = {
                'success': [],
                'failed': []
            }

            for recipient in recipients:
                try:
                    if cls.send_email(recipient, subject, html_content):
                        results['success'].append(recipient)
                    else:
                        results['failed'].append(recipient)
                except Exception:
                    results['failed'].append(recipient)

            return cls.format_response(results)

        except Exception as e:
            raise AppError(
                message='Failed to send bulk emails',
                code='BULK_EMAIL_ERROR'
            ) from e

    @classmethod
    def send_email(cls, recipient: str, subject: str, html_content: str, 
                  attachments: Optional[List[str]] = None, cc: Optional[List[str]] = None) -> bool:
        """Send individual email."""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = settings.EMAIL_HOST_USER
            msg['To'] = recipient
            if cc:
                msg['Cc'] = ', '.join(cc)

            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)

            with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
                server.starttls()
                server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                server.send_message(msg)

            return True

        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False  # Ensure a boolean is returned

    @classmethod
    def create_email_template(cls, template_name: str, template_content: str) -> bool:
        """Create new email template."""
        try:
            if template_name in cls.EMAIL_TEMPLATES:
                raise AppError(
                    message=f'Template {template_name} already exists',
                    code='DUPLICATE_ERROR'
                )

            # In a real application, you might store templates in database
            # or filesystem. For now, we'll just add to the dictionary
            cls.EMAIL_TEMPLATES[template_name] = template_content
            return True

        except Exception as e:
            cls.handle_error(e, 'TEMPLATE_ERROR', 'Failed to create template')
            return False  # Ensure a boolean is returned