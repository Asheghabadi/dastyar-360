
import scrapy
import os

class GazetteSpider(scrapy.Spider):
    name = 'gazette'

    def start_requests(self):
        # Get the absolute path to the sample HTML file
        # This makes the spider independent of where it's run from
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        file_path = os.path.join(base_dir, 'sample_agahi.html')
        # Scrapy can handle file:/// paths for local testing
        url = 'file:///' + file_path.replace('\\', '/')
        self.logger.info(f'Starting to parse local file: {url}')
        yield scrapy.Request(url, self.parse_agahi)

    def parse_agahi(self, response):
        """This function parses the response and extracts the ad data."""
        self.logger.info(f'Successfully fetched {response.url}')
        
        # Using Scrapy's CSS selectors which are powerful
        title = response.css('h2#agahi-title::text').get()
        agahi_number = response.css('span#agahi-number::text').get()
        rooznameh_date = response.css('span#rooznameh-date::text').get()
        
        # For the text, we get all paragraphs inside the div and join them
        text_paragraphs = response.css('div#agahi-text p::text').getall()
        full_text = '\n'.join(p.strip() for p in text_paragraphs if p.strip())

        # Yielding the data as a dictionary, Scrapy handles the rest
        yield {
            'title': title.strip() if title else None,
            'agahi_number': agahi_number.strip() if agahi_number else None,
            'date': rooznameh_date.strip() if rooznameh_date else None,
            'text': full_text
        }
