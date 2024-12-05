# solar/services/base_service.py
from typing import Any, Dict, List, Optional, Union
from ..middleware.error_handler import AppError, ErrorTypes

class BaseService:
    """Base class for all services providing common functionality."""
    
    @classmethod
    def handle_error(cls, error: Exception, code: str, message: str = '', data: Optional[Dict] = None) -> None:
        """
        Handle errors consistently across services
        
        Args:
            error: The original exception
            code: Error code
            message: Optional custom message
            data: Optional additional error data
        
        Raises:
            AppError: Transformed application error
        """
        if isinstance(error, AppError):
            raise error
        
        raise AppError(
            message=message or str(error),
            code=code,
            data=data or {'original_error': str(error)}
        )
    
    @staticmethod
    def validate_data(data: Dict[str, Any], required_fields: List[str]) -> None:
        """
        Validate that all required fields are present in data.
        
        Args:
            data: Dictionary containing data to validate
            required_fields: List of field names that must be present
            
        Raises:
            AppError: If any required fields are missing
        """
        if missing_fields := [
            field for field in required_fields if field not in data
        ]:
            raise AppError(
                message='Missing required fields',
                code=ErrorTypes.VALIDATION_ERROR,
                data={'missing_fields': missing_fields}
            )
            
    @staticmethod 
    def format_response(data: Any, message: Optional[str] = None) -> Dict[str, Any]:
        """
        Format standard response structure.
        
        Args:
            data: Response data to format
            message: Optional success message
            
        Returns:
            Dict containing formatted response
        """
        response = {
            'success': True,
            'data': data
        }
        if message:
            response['message'] = message
        return response
