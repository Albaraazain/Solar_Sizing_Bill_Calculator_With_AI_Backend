# solar/services/bill_parser/__init__.py
"""Bill parsing package for handling different types of electricity bills."""

from .base_parser import BillParser
from .general_parser import GeneralBillParser
from .industrial_parser import IndustrialBillParser

__all__ = [
    'BillParser',
    'GeneralBillParser',
    'IndustrialBillParser'
]

def get_parser_for_bill(bill_type: str, html_content: str) -> BillParser:
    """Factory function to get appropriate parser for bill type."""
    parser_map = {
        'general': GeneralBillParser,
        'industrial': IndustrialBillParser
    }
    
    parser_class = parser_map.get(bill_type, GeneralBillParser)
    return parser_class(html_content)