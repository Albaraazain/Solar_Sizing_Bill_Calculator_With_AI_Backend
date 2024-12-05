# solar/services/document_service.py
from typing import Dict, Any, Optional, List
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from django.template.loader import render_to_string
from django.conf import settings
import logging

# Import base service and error handling
from .base_service import BaseService
from ..middleware.error_handler import AppError

# Import models
from ..models import Document

logger = logging.getLogger(__name__)

class DocumentService(BaseService):
    """Service for handling document generation and management."""

    DOCUMENT_TYPES = {
        'quote': 'templates/pdf/quote_template.html',
        'agreement': 'templates/pdf/agreement_template.html',
        'invoice': 'templates/pdf/invoice_template.html',
        'report': 'templates/pdf/report_template.html'
    }

    @classmethod
    def generate_quote_pdf(cls, quote_data: Dict[str, Any], 
                          template_override: Optional[str] = None) -> str:
        """
        Generate PDF quote document.
        
        Args:
            quote_data: Dictionary containing quote information
            template_override: Optional custom template path
            
        Returns:
            Path to generated PDF file
        """
        try:
            template = template_override or cls.DOCUMENT_TYPES['quote']
            html_content = render_to_string(template, {
                'quote': quote_data,
                'company_info': cls._get_company_info(),
                'generated_date': datetime.now()
            })

            filename = f"quote_{quote_data.get('reference_number')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            output_path = os.path.join(settings.MEDIA_ROOT, 'quotes', filename)

            cls._ensure_directory_exists(os.path.dirname(output_path))
            cls._generate_pdf(html_content, output_path)

            return output_path

        except Exception as e:
            cls.handle_error(e, 'PDF_GENERATION_ERROR', 'Failed to generate quote PDF')
            raise  # Re-raise to satisfy return type

    @classmethod
    def generate_agreement(cls, agreement_data: Dict[str, Any]) -> str:
        """Generate installation agreement PDF."""
        try:
            template = cls.DOCUMENT_TYPES['agreement']
            html_content = render_to_string(template, {
                'agreement': agreement_data,
                'company_info': cls._get_company_info(),
                'generated_date': datetime.now(),
                'terms_and_conditions': cls._get_terms_and_conditions()
            })

            filename = f"agreement_{agreement_data.get('reference_number')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            output_path = os.path.join(settings.MEDIA_ROOT, 'agreements', filename)

            cls._ensure_directory_exists(os.path.dirname(output_path))
            cls._generate_pdf(html_content, output_path)

            return output_path

        except Exception as e:
            cls.handle_error(e, 'PDF_GENERATION_ERROR', 'Failed to generate agreement PDF')
            raise

    @classmethod
    def generate_invoice(cls, invoice_data: Dict[str, Any]) -> str:
        """Generate customer invoice PDF."""
        try:
            template = cls.DOCUMENT_TYPES['invoice']
            html_content = render_to_string(template, {
                'invoice': invoice_data,
                'company_info': cls._get_company_info(),
                'payment_info': cls._get_payment_info(),
                'generated_date': datetime.now()
            })

            filename = f"invoice_{invoice_data.get('number')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            output_path = os.path.join(settings.MEDIA_ROOT, 'invoices', filename)

            cls._ensure_directory_exists(os.path.dirname(output_path))
            cls._generate_pdf(html_content, output_path)

            return output_path

        except Exception as e:
            cls.handle_error(e, 'PDF_GENERATION_ERROR', 'Failed to generate invoice PDF')
            raise

    @classmethod
    def generate_report(cls, report_data: Dict[str, Any], report_type: str) -> str:
        """Generate various types of reports."""
        try:
            template = cls.DOCUMENT_TYPES['report']
            html_content = render_to_string(template, {
                'report': report_data,
                'report_type': report_type,
                'company_info': cls._get_company_info(),
                'generated_date': datetime.now()
            })

            filename = f"report_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            output_path = os.path.join(settings.MEDIA_ROOT, 'reports', filename)

            cls._ensure_directory_exists(os.path.dirname(output_path))
            cls._generate_pdf(html_content, output_path)

            return output_path

        except Exception as e:
            cls.handle_error(e, 'PDF_GENERATION_ERROR', 'Failed to generate report PDF')
            raise

    @staticmethod
    def _generate_pdf(html_content: str, output_path: str) -> None:
        """Generate PDF from HTML content."""
        try:
            pdf = canvas.Canvas(output_path, pagesize=letter)
            # Add content to PDF
            pdf.save()
        except Exception as e:
            raise AppError(
                message='Failed to generate PDF',
                code='PDF_ERROR',
                data={'error': str(e)}
            )

    @staticmethod
    def _ensure_directory_exists(directory: str) -> None:
        """Create directory if it doesn't exist."""
        os.makedirs(directory, exist_ok=True)

    @staticmethod
    def _get_company_info() -> Dict[str, str]:
        """Get company information for documents."""
        return {
            'name': settings.COMPANY_NAME,
            'address': settings.COMPANY_ADDRESS,
            'phone': settings.CONTACT_PHONE,
            'email': settings.CONTACT_EMAIL,
            'website': settings.WEBSITE_URL,
            'registration': settings.COMPANY_REGISTRATION,
            'tax_id': settings.TAX_ID
        }

    @staticmethod
    def _get_payment_info() -> Dict[str, str]:
        """Get payment information for invoices."""
        return {
            'bank_name': settings.BANK_NAME,
            'account_name': settings.BANK_ACCOUNT_NAME,
            'account_number': settings.BANK_ACCOUNT_NUMBER,
            'iban': settings.BANK_IBAN,
            'swift_code': settings.BANK_SWIFT
        }

    @staticmethod
    def _get_terms_and_conditions() -> str:
        """Get terms and conditions for agreements."""
        terms_path = os.path.join(settings.BASE_DIR, 'templates', 'legal', 'terms.txt')
        try:
            with open(terms_path, 'r') as file:
                return file.read()
        except FileNotFoundError:
            return "Standard terms and conditions apply."

    @classmethod
    def create_document(
        cls,
        document_type: str,
        data: Dict[str, Any],
        template_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new document of specified type.
        
        Args:
            document_type: Type of document to create (quote/agreement/invoice/report)
            data: Document data
            template_override: Optional custom template path
            
        Returns:
            Dict containing document information including path
        """
        try:
            if document_type not in cls.DOCUMENT_TYPES and not template_override:
                raise AppError(
                    message=f'Invalid document type: {document_type}',
                    code='INVALID_TYPE'
                )

            generator_map = {
                'quote': cls.generate_quote_pdf,
                'agreement': cls.generate_agreement,
                'invoice': cls.generate_invoice,
                'report': cls.generate_report
            }

            generator = generator_map.get(document_type)
            if not generator:
                raise AppError(
                    message=f'No generator for document type: {document_type}',
                    code='INVALID_TYPE'
                )

            document_path = generator(data, template_override) if template_override else generator(data)

            return cls.format_response({
                'path': document_path,
                'url': cls._get_document_url(document_path),
                'type': document_type,
                'created_at': datetime.now().isoformat()
            })

        except Exception as e:
            cls.handle_error(e, 'DOCUMENT_CREATE_ERROR', 'Failed to create document')
            raise

    @classmethod
    def get_document(cls, document_path: str) -> Dict[str, Any]:
        """
        Get document information.
        
        Args:
            document_path: Path to the document
            
        Returns:
            Dict containing document information
        """
        try:
            if not os.path.exists(document_path):
                raise AppError(
                    message='Document not found',
                    code='NOT_FOUND',
                    data={'path': document_path}
                )

            file_stats = os.stat(document_path)
            return cls.format_response({
                'path': document_path,
                'url': cls._get_document_url(document_path),
                'size': file_stats.st_size,
                'created_at': datetime.fromtimestamp(file_stats.st_ctime).isoformat(),
                'modified_at': datetime.fromtimestamp(file_stats.st_mtime).isoformat()
            })

        except Exception as e:
            cls.handle_error(e, 'DOCUMENT_FETCH_ERROR', 'Failed to get document')
            raise

    @classmethod
    def delete_document(cls, document_path: str) -> bool:
        """
        Delete a document.
        
        Args:
            document_path: Path to the document to delete
            
        Returns:
            True if document was deleted successfully
        """
        try:
            if not os.path.exists(document_path):
                raise AppError(
                    message='Document not found',
                    code='NOT_FOUND',
                    data={'path': document_path}
                )

            os.remove(document_path)
            return True

        except Exception as e:
            cls.handle_error(e, 'DOCUMENT_DELETE_ERROR', 'Failed to delete document')
            raise

    @staticmethod
    def _get_document_url(document_path: str) -> str:
        """Convert document path to URL."""
        relative_path = os.path.relpath(document_path, settings.MEDIA_ROOT)
        return f"{settings.MEDIA_URL}{relative_path}"

    @classmethod
    def bulk_delete_documents(cls, document_paths: List[str]) -> Dict[str, List[str]]:
        """
        Delete multiple documents.
        
        Args:
            document_paths: List of paths to documents to delete
            
        Returns:
            Dict containing lists of successfully and unsuccessfully deleted documents
        """
        results = {
            'success': [],
            'failed': []
        }

        for path in document_paths:
            try:
                if cls.delete_document(path):
                    results['success'].append(path)
                else:
                    results['failed'].append(path)
            except Exception:
                results['failed'].append(path)

        return cls.format_response(results)

    @classmethod
    def get_document_types(cls) -> List[str]:
        """Get list of available document types."""
        return list(cls.DOCUMENT_TYPES.keys())

    @classmethod
    def validate_template(cls, template_path: str) -> bool:
        """
        Validate a template file.
        
        Args:
            template_path: Path to template to validate
            
        Returns:
            True if template is valid
            
        Raises:
            AppError: If template is invalid
        """
        try:
            if not os.path.exists(template_path):
                raise AppError(
                    message='Template not found',
                    code='NOT_FOUND'
                )

            # Add template validation logic here
            # For now, just check if it's an HTML file
            if not template_path.endswith('.html'):
                raise AppError(
                    message='Invalid template format',
                    code='INVALID_FORMAT'
                )

            return True

        except Exception as e:
            cls.handle_error(e, 'TEMPLATE_ERROR', 'Failed to validate template')
            raise

    @staticmethod
    def get_documents(document_type=None, page=1, page_size=10, search=None, sort_by='-created_at'):
        """
        Get a paginated list of documents with optional filtering and sorting.
        
        Args:
            document_type (str, optional): Filter by document type
            page (int): Page number for pagination
            page_size (int): Number of items per page
            search (str, optional): Search term to filter documents
            sort_by (str): Field to sort by (prefix with - for descending)
            
        Returns:
            dict: Response containing paginated document list and metadata
        """
        try:
            # Calculate offset for pagination
            offset = (page - 1) * page_size

            # Build query filters
            filters = {}
            if document_type:
                filters['type'] = document_type
            if search:
                filters['name__icontains'] = search

            # Get total count for pagination
            total_count = Document.objects.filter(**filters).count()

            # Get documents with pagination and sorting
            sort_field = sort_by[1:] if sort_by.startswith('-') else sort_by
            sort_direction = '-' if sort_by.startswith('-') else ''
            
            documents = Document.objects.filter(**filters)\
                .order_by(f'{sort_direction}{sort_field}')\
                [offset:offset+page_size]

            # Format response
            return {
                'success': True,
                'data': {
                    'documents': [doc.to_dict() for doc in documents],
                    'pagination': {
                        'page': page,
                        'page_size': page_size,
                        'total_count': total_count,
                        'total_pages': -(-total_count // page_size)  # Ceiling division
                    }
                }
            }

        except Exception as e:
            logger.exception("Error getting documents")
            raise AppError(
                message='Failed to retrieve documents',
                code='RETRIEVAL_ERROR',
                data={'error': str(e)}
            )