
import scrapy
import os

class BrandSpider(scrapy.Spider):
    name = 'brand'

    def start_requests(self):
        # Get the absolute path to the sample HTML file
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        file_path = os.path.join(base_dir, 'sample_brand_search.html')
        url = 'file:///' + file_path.replace('\\', '/')
        self.logger.info(f'Starting to parse local file: {url}')
        yield scrapy.Request(url, self.parse_brands)

    def parse_brands(self, response):
        """This function parses the brand search result page."""
        self.logger.info(f'Successfully fetched {response.url}')
        
        # Find the table body and iterate over each row
        table_body = response.css('table#result-table tbody')
        for row in table_body.css('tr'):
            cells = row.css('td')
            if len(cells) == 4:
                yield {
                    'title': cells[0].css('::text').get(default='').strip(),
                    'reg_number': cells[1].css('::text').get(default='').strip(),
                    'status': cells[2].css('::text').get(default='').strip(),
                    'owner': cells[3].css('::text').get(default='').strip(),
                }
