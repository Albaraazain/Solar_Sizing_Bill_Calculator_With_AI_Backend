# solar/views/public_views.py
import logging
from django.views.generic import TemplateView, View
from django.http import Http404, JsonResponse
from django.shortcuts import render
from django.conf import settings

from ..services.quote_service import QuoteService
from ..services.bill_service import BillService
from ..services.customer_service import CustomerService
from ..services.notification_service import NotificationService
from ..middleware.error_handler import AppError

logger = logging.getLogger(__name__)

class IndexView(TemplateView):
    """Main landing page view."""
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            'title': 'Solar Panel Installation - Energy Cove',
            'meta_description': 'Get professional solar panel installation services. '
                              'Calculate your savings and get a free quote today.',
            'company_info': {
                'name': settings.COMPANY_NAME,
                'phone': settings.CONTACT_PHONE,
                'email': settings.CONTACT_EMAIL,
                'address': settings.COMPANY_ADDRESS
            }
        })
        return context

class QuotationView(TemplateView):
    """Solar system quotation page."""
    template_name = 'quotation.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        reference_number = self.request.GET.get('ref')

        if not reference_number:
            raise Http404("Reference number is required")

        try:
            # Get bill details
            bill_response = BillService.get_bill_details(reference_number)
            if not bill_response['success']:
                raise Http404("Bill not found")

            # Generate quote
            quote_response = QuoteService.generate_quote(bill_response['data'])
            if not quote_response['success']:
                raise Http404("Could not generate quote")

            context.update({
                'title': f'Solar Quote - {reference_number}',
                'reference_number': reference_number,
                'bill_data': bill_response['data'],
                'quote_data': quote_response['data']
            })
            return context

        except Exception as e:
            logger.exception(f"Error rendering quote page: {str(e)}")
            raise Http404("Could not generate quotation")

    def post(self, request, *args, **kwargs):
        """Handle quote form submission."""
        try:
            # Validate request data
            reference_number = request.POST.get('reference_number')
            name = request.POST.get('name')
            email = request.POST.get('email')
            phone = request.POST.get('phone')

            if not all([reference_number, name, email, phone]):
                return JsonResponse({
                    'success': False,
                    'error': {
                        'message': 'All fields are required',
                        'code': 'VALIDATION_ERROR'
                    }
                }, status=400)

            # Get quote data
            quote_response = QuoteService.generate_quote(reference_number)  # Ensure the method exists in QuoteService
            if not quote_response['success']:
                raise AppError(
                    message='Quote not found',
                    code='NOT_FOUND'
                )

            # Save customer data
            customer_data = {
                'name': name,
                'email': email,
                'phone': phone,
                'reference_number': reference_number
            }
            customer_response = CustomerService.add_customer(customer_data)

            # Send email notification
            if email:
                NotificationService.send_quote_email(
                    quote_data=quote_response['data'],
                    recipient=email
                )

            return JsonResponse({
                'success': True,
                'message': 'Quote submitted successfully'
            })

        except AppError as e:
            return JsonResponse({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=400)
        except Exception as e:
            logger.exception(f"Error processing quote submission: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR'
                }
            }, status=500)

class ContactView(View):
    """Contact form handling view."""

    def post(self, request):
        """Handle contact form submission."""
        try:
            name = request.POST.get('name')
            email = request.POST.get('email')
            message = request.POST.get('message')
            phone = request.POST.get('phone')

            if not all([name, email, message]):
                return JsonResponse({
                    'success': False,
                    'error': {
                        'message': 'Name, email and message are required',
                        'code': 'VALIDATION_ERROR'
                    }
                }, status=400)

            # Send notification to staff
            NotificationService.send_email(
                recipient=settings.CONTACT_EMAIL,
                subject=f"New Contact Form Submission - {name}",
                html_content=self._format_contact_email(
                    name=name,
                    email=email,
                    message=message,
                    phone=phone
                )
            )

            # Send confirmation to user
            NotificationService.send_email(
                recipient=email,
                subject=f"Thank you for contacting {settings.COMPANY_NAME}",
                html_content=self._format_confirmation_email(name)
            )

            return JsonResponse({
                'success': True,
                'message': 'Message sent successfully'
            })

        except Exception as e:
            logger.exception(f"Error processing contact form: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': {
                    'message': 'Failed to send message',
                    'code': 'SERVER_ERROR'
                }
            }, status=500)

    def _format_contact_email(self, name, email, message, phone=None):
        """Format contact form email for staff."""
        return f"""
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            {'<p><strong>Phone:</strong> ' + phone + '</p>' if phone else ''}
            <p><strong>Message:</strong></p>
            <p>{message}</p>
        """

    def _format_confirmation_email(self, name):
        """Format confirmation email for user."""
        return f"""
            <h2>Thank you for contacting {settings.COMPANY_NAME}</h2>
            <p>Dear {name},</p>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p>Best regards,<br>{settings.COMPANY_NAME} Team</p>
        """