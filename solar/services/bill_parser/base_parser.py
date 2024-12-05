# solar/services/bill_parser/base_parser.py
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup

class BillParser(ABC):
    """Abstract base class for bill parsers."""
    
    def __init__(self, html_content: str):
        self.soup = BeautifulSoup(html_content, "html.parser")
        self.year_data = []
        self.issue_date = None

    @abstractmethod
    def extract_name(self) -> str:
        """Extract customer name from bill."""
        pass

    @abstractmethod
    def extract_monthly_units(self) -> Dict[str, str]:
        """Extract monthly consumption units."""
        pass

    def parse_bill(self) -> Optional[Dict[str, Any]]:
        """Parse bill and extract all relevant information."""
        try:
            # Extract issue date first as it's needed for year data
            self.issue_date = self.extract_issue_date()
            if self.issue_date:
                self.year_data = self.generate_year_data(self.issue_date)

            result = {
                "Name": self.extract_name(),
                "Payable Within Due Date": self.extract_payable_amount(),
                "Units Consumed": self.extract_units_consumed(),
                "Issue Date": self.issue_date,
                "Due Date": self.extract_due_date(),
                "Subdivision": self.extract_subdivision(),
                "Monthly Units": self.extract_monthly_units()
            }

            # Calculate aggregates
            if result["Monthly Units"]:
                if monthly_units := [
                    int(units)
                    for units in result["Monthly Units"].values()
                    if units.isdigit()
                ]:
                    result["Total Yearly Units"] = sum(monthly_units)
                    result["Max Units"] = max(monthly_units)

            return result
        except Exception as e:
            print(f"Error parsing bill: {e}")
            return None

    def extract_payable_amount(self) -> str:
        """Extract payable amount from bill."""
        section = self.soup.find(string=lambda s: "PAYABLE WITHIN DUE DATE" in s if s else False)
        if not section:
            return "Not Found"
            
        parent_td = section.find_parent("td")
        if not parent_td:
            return "Not Found"
            
        amount_td = parent_td.find_next_sibling("td")
        return amount_td.get_text(strip=True) if amount_td else "Not Found"

    def extract_units_consumed(self) -> str:
        """Extract current month's units consumed."""
        units_section = self.soup.find('b', string=lambda text: bool(text and 'UNITS CONSUMED' in text))
        if not units_section:
            return "Not Found"
            
        units_td = units_section.find_next('td')
        return units_td.get_text(strip=True) if units_td else "Not Found"

    def extract_due_date(self) -> str:
        """Extract bill due date."""
        header_row = self._find_date_header_row()
        if not header_row:
            return "Not Found"

        data_row = header_row.find_next_sibling("tr")
        if not data_row:
            return "Not Found"

        headers = [td.get_text(strip=True).upper() for td in header_row.find_all("td")]
        try:
            due_idx = headers.index("DUE DATE")
            return data_row.find_all("td")[due_idx].get_text(strip=True)
        except (ValueError, IndexError):
            return "Not Found"

    def extract_issue_date(self) -> str:
        """Extract bill issue date."""
        header_row = self._find_date_header_row()
        if not header_row:
            return "Not Found"

        data_row = header_row.find_next_sibling("tr")
        if not data_row:
            return "Not Found"

        headers = [td.get_text(strip=True).upper() for td in header_row.find_all("td")]
        try:
            issue_idx = headers.index("ISSUE DATE")
            return data_row.find_all("td")[issue_idx].get_text(strip=True)
        except (ValueError, IndexError):
            return "Not Found"

    def extract_subdivision(self) -> str:
        """Extract subdivision information."""
        section = self.soup.find(string=lambda s: "SUB DIVISION" in s if s else False)
        if not section:
            return "Not Found"
            
        parent_td = section.find_parent("td")
        if not parent_td:
            return "Not Found"
            
        subdivision_td = parent_td.find_next_sibling("td")
        return subdivision_td.get_text(strip=True) if subdivision_td else "Not Found"

    def _find_date_header_row(self):
        """Helper to find the row containing date headers."""
        for tr in self.soup.find_all("tr"):
            headers = [td.get_text(strip=True).upper() for td in tr.find_all("td")]
            if "ISSUE DATE" in headers and "DUE DATE" in headers:
                return tr
        return None

    def generate_year_data(self, issue_date_str: str) -> List[str]:
        """Generate list of month-year combinations based on issue date."""
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        try:
            return self._compute_month_year_combinations(issue_date_str, months)
        except Exception as e:
            print(f"Error generating year data: {e}")
            return []

    def _compute_month_year_combinations(self, issue_date_str: str, months: List[str]) -> List[str]:
        """Compute the list of month-year combinations for the past 12 months."""
        issue_date = datetime.strptime(issue_date_str, "%d %b %y")
        start_month_index = issue_date.month - 1
        start_year = issue_date.year - 1
        year_data = []

        for i in range(12):
            month = months[(start_month_index + i) % 12]
            year = start_year if (start_month_index + i) < 12 else start_year + 1
            year_data.append(f"{month}{year % 100:02d}")

        return year_data