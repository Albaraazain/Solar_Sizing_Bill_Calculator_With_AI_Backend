# solar/services/bill_parser/industrial_parser.py
from typing import Dict
from .base_parser import BillParser

class IndustrialBillParser(BillParser):
    """Parser for industrial consumer electricity bills."""
    
    def extract_name(self) -> str:
        name_section = self.soup.find(
            string=lambda s: "NAME & ADDRESS" in s if s else False
        )
        if not name_section:
            return "Not Found"
            
        name_td = name_section.find_next("td")
        return (name_td.get_text(strip=True).replace("\n", "") 
                if name_td else "Not Found")

    def extract_monthly_units(self) -> Dict[str, str]:
        # Find table with monthly data
        tables = self.soup.find_all("table")
        target_table = None
        
        for table in tables:
            headers = [td.get_text(strip=True).upper() 
                      for td in table.find_all("td")]
            if "MONTH" in headers and "KWH UNITS" in headers:
                target_table = table
                break

        if not target_table:
            return {month: "0" for month in self.year_data}

        # Process table rows
        monthly_units = {}
        rows = target_table.find_all("tr")[1:]  # Skip header
        
        for row in rows:
            cells = row.find_all("td")
            if len(cells) >= 3:  # Industrial bills have MDI column
                month = (cells[0].get_text(strip=True)[:3] + 
                        cells[0].get_text(strip=True)[-2:])
                units = cells[2].get_text(strip=True)  # KWH Units in third column
                if month in self.year_data:
                    monthly_units[month] = units if units.isdigit() else "0"

        # Ensure all months are covered
        return {month: monthly_units.get(month, "0") 
                for month in self.year_data}