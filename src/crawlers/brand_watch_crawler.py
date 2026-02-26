
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

# A simple HTML to XML converter to make it parsable by ElementTree
# (Reusing the same robust parser from the previous crawler)
class HTMLtoXMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root = None
        self.stack = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if self.root is None:
            self.root = ET.Element(tag, attrs_dict)
            self.stack.append(self.root)
        else:
            element = ET.SubElement(self.stack[-1], tag, attrs_dict)
            self.stack.append(element)

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1].tag == tag:
            self.stack.pop()

    def handle_data(self, data):
        if self.stack and data.strip():
            self.stack[-1].text = (self.stack[-1].text or '') + data

    def feed(self, data):
        super().feed(data)
        return self.root

def parse_brands_from_html(html_content):
    """Parses the HTML content of a brand search result page."""
    try:
        parser = HTMLtoXMLParser()
        root = parser.feed(html_content)

        if root is None:
            return {"error": "Failed to parse HTML."}

        brands_list = []
        # Find the table with the id 'result-table' and then its body
        table = root.find(".//table[@id='result-table']/tbody")
        
        if table is not None:
            # Iterate over each table row (tr)
            for row in table.findall('tr'):
                cells = row.findall('td')
                if len(cells) == 4: # Ensure it's a valid data row
                    brand_data = {
                        'title': cells[0].text.strip() if cells[0].text else '',
                        'reg_number': cells[1].text.strip() if cells[1].text else '',
                        'status': cells[2].text.strip() if cells[2].text else '',
                        'owner': cells[3].text.strip() if cells[3].text else ''
                    }
                    brands_list.append(brand_data)
        
        return brands_list

    except Exception as e:
        return {"error": f"An error occurred during parsing: {e}"}

if __name__ == "__main__":
    try:
        with open("c:\\Users\\Administrator\\Documents\\dastyar-360\\src\\crawlers\\sample_brand_search.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        
        print("--- Parsing local brand search HTML file ---")
        parsed_data = parse_brands_from_html(html_content)
        
        if isinstance(parsed_data, list):
            for i, brand in enumerate(parsed_data, 1):
                print(f"\n--- Brand #{i} ---")
                print(f"  Title: {brand['title']}")
                print(f"  Registration Number: {brand['reg_number']}")
                print(f"  Status: {brand['status']}")
                print(f"  Owner: {brand['owner']}")
        else:
            print(parsed_data) # Print error if any

    except FileNotFoundError:
        print("Error: sample_brand_search.html not found.")
    except Exception as e:
        print(f"An error occurred: {e}")
