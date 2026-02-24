
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

# A simple HTML to XML converter to make it parsable by ElementTree
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

def parse_agahi_from_html(html_content):
    """Parses the HTML content of an 'agahi' page and extracts key information."""
    try:
        # ElementTree needs well-formed XML, so we use a simple parser to convert HTML
        parser = HTMLtoXMLParser()
        root = parser.feed(html_content)

        if root is None:
            return {"error": "Failed to parse HTML."}

        # --- Extracting data using find --- 
        # ElementTree's find is basic and works best with simple paths.
        # It doesn't fully support CSS selectors like '#agahi-title'.
        # We need to iterate to find elements by id.
        
        agahi_data = {}
        
        title_element = root.find(".//h2[@id='agahi-title']")
        if title_element is not None:
            agahi_data['title'] = title_element.text.strip()

        number_element = root.find(".//span[@id='agahi-number']")
        if number_element is not None:
            agahi_data['number'] = number_element.text.strip()

        date_element = root.find(".//span[@id='rooznameh-date']")
        if date_element is not None:
            agahi_data['date'] = date_element.text.strip()

        # For the main text, we combine all paragraphs within the div
        text_div = root.find(".//div[@id='agahi-text']")
        if text_div is not None:
            paragraphs = [p.text.strip() for p in text_div.findall('p') if p.text]
            agahi_data['text'] = '\n'.join(paragraphs)

        return agahi_data

    except Exception as e:
        return {"error": f"An error occurred during parsing: {e}"}

if __name__ == "__main__":
    try:
        with open("c:\\Users\\Administrator\\Documents\\dastyar-360\\src\\crawlers\\sample_agahi.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        
        print("--- Parsing local HTML file ---")
        parsed_data = parse_agahi_from_html(html_content)
        
        # Pretty print the result
        for key, value in parsed_data.items():
            print(f"{key.capitalize()}: {value}")

    except FileNotFoundError:
        print("Error: sample_agahi.html not found.")
    except Exception as e:
        print(f"An error occurred: {e}")
