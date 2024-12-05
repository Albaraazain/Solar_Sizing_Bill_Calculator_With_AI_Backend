# solar/services/bill_parser/base_parser.py

from abc import ABC, abstractmethod
from bs4 import BeautifulSoup
import datetime

class BillParser(ABC):
    def __init__(self, html_content):
        self.soup = BeautifulSoup(html_content, "html.parser")
        self.year_data = []
    
    @abstractmethod
    def extract_name(self):
        pass
    
    @abstractmethod
    def extract_monthly_units(self):
        pass
    
    def generate_year_data(self, issue_date_str):
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        try:
            issue_date = datetime.datetime.strptime(issue_date_str, "%d %b %y")
            start_month_index = issue_date.month - 1
            start_year = issue_date.year - 1
            self.year_data = []

            for i in range(12):
                month = months[(start_month_index + i) % 12]
                year = start_year if (start_month_index + i) < 12 else start_year + 1
                self.year_data.append(f"{month}{year % 100:02d}")

            return self.year_data
        except Exception as e:
            print(f"Error generating year data: {e}")
            return []

    def parse_bill(self):
        try:
            result = {
                "Name": self.extract_name(),
                "Payable Within Due Date": self.extract_payable_within_due_date(),
                "Units Consumed": self.extract_units_consumed(),
                "Issue Date": self.extract_issue_date(),
                "Due Date": self.extract_due_date(),
                "Monthly Units": self.extract_monthly_units(),
            }
            
            # Calculate additional metrics
            if result["Monthly Units"]:
                result["Total Yearly Units"] = sum(int(units) for units in result["Monthly Units"].values() if units.isdigit())
                result["Max Units"] = max(int(units) for units in result["Monthly Units"].values() if units.isdigit())
            
            return result
        except Exception as e:
            print(f"Error parsing bill: {e}")
            return None