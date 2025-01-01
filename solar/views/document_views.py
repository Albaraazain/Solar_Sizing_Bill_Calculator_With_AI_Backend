# solar/views/document_views.py
import logging
import mimetypes
from django.http import FileResponse, Http404
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from ..services.document_service import DocumentService
from ..services.notification_service import NotificationService
from ..middleware.error_handler import AppError

logger = logging.getLogger(__name__)

class DocumentGenerateView(APIView):
    """API endpoint for generating documents."""

    def post(self, request):
        try:
            # Validate request
            document_type = request.data.get('type')
            if not document_type:
                raise AppError(
                    message='Document type is required',
                    code='VALIDATION_ERROR'
                )

            # Generate document
            response = DocumentService.create_document(
                document_type=document_type,
                data=request.data.get('data', {}),
                template_override=request.data.get('template')
            )

            # Send email if requested
            if request.data.get('send_email'):
                if email := request.data.get('email'):
                    NotificationService.send_email(
                        recipient=email,
                        subject=f"Your {document_type.title()} Document",
                        html_content=f"Please find your {document_type} attached.",
                        attachments=[response['data']['path']]  # Fixed parameter
                    )

            return Response(response)

        except AppError as e:
            logger.warning(f"Document generation failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error generating document")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DocumentDownloadView(APIView):
    """API endpoint for downloading documents."""

    def get(self, request, document_path):
        try:
            return self._extracted_from_get_4(document_path)
        except Http404:
            raise
        except Exception as e:
            logger.exception("Error downloading document")
            return Response({
                'success': False,
                'error': {
                    'message': 'Failed to download document',
                    'code': 'DOWNLOAD_ERROR'
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # TODO Rename this here and in `get`
    def _extracted_from_get_4(self, document_path):
        # Get document info
        document = DocumentService.get_document(document_path)
        if not document['success']:
            raise Http404('Document not found')

        # Get file path
        file_path = document['data']['path']

        # Determine content type
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = 'application/octet-stream'

        # Return file response
        response = FileResponse(
            open(file_path, 'rb'),
            content_type=content_type
        )
        response['Content-Disposition'] = f'attachment; filename="{document_path}"'
        return response

    def delete(self, request, document_path):
        try:
            response = DocumentService.delete_document(document_path)
            return Response({
                'success': True,
                'message': 'Document deleted successfully'
            })

        except AppError as e:
            logger.warning(f"Document deletion failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error deleting document")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR',
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DocumentListView(APIView):
    """API endpoint for listing and managing documents."""

# solar/views/document_views.py (continued)
    def get(self, request):
        try:
            return self._extracted_from_get_4(request)
        except ValueError:
            return Response({
                'success': False,
                'error': {
                    'message': 'Invalid pagination parameters',
                    'code': 'VALIDATION_ERROR'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error listing documents")
            return Response({
                'success': False,
                'error': {
                    'message': 'Failed to list documents',
                    'code': 'LIST_ERROR'
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # TODO Rename this here and in `get`
    def _extracted_from_get_4(self, request):
        # Get query parameters
        document_type = request.query_params.get('type')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        search = request.query_params.get('search')
        sort_by = request.query_params.get('sort_by', '-created_at')

        response = DocumentService.get_documents(  # Ensure the method exists in DocumentService
            document_type=document_type,
            page=page,
            page_size=page_size,
            search=search,
            sort_by=sort_by
        )

        return Response(response)

    def post(self, request):
        """Bulk operations on documents."""
        try:
            return self._extracted_from_post_(request)
        except AppError as e:
            logger.warning(f"Bulk document operation failed: {str(e)}")
            return Response({
                'success': False,
                'error': {
                    'message': str(e),
                    'code': e.code,
                    'data': e.data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error in bulk document operation")
            return Response({
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred',
                    'code': 'SERVER_ERROR'
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # TODO Rename this here and in `post`
    def _extracted_from_post_(self, request):
        operation = request.data.get('operation')
        document_paths = request.data.get('documents', [])

        if not operation or not document_paths:
            raise AppError(
                message='Operation and documents are required',
                code='VALIDATION_ERROR'
            )

        if operation != 'delete':
            raise AppError(
                message=f'Invalid operation: {operation}',
                code='INVALID_OPERATION'
            )

        response = DocumentService.bulk_delete_documents(document_paths)
        return Response(response)