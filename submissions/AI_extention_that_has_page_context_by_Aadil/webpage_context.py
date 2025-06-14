import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import re

class WebpageContextExtractor:
    def __init__(self):
        self.browser = None
        self.initialize_browser()
        
    def initialize_browser(self):
        """Initialize headless browser for content extraction"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--no-sandbox")
            
            service = Service(ChromeDriverManager().install())
            self.browser = webdriver.Chrome(service=service, options=chrome_options)
        except Exception as e:
            print(f"Error initializing browser: {e}")
    
    def get_current_url(self):
        """Get the URL of the current active tab (implementation depends on OS/browser)"""
        # This is a placeholder. You may need to use browser extensions or APIs
        # to get the actual current URL from the user's browser
        return self.browser.current_url if self.browser else None
    
    def extract_content_from_url(self, url):
        """Extract content from the given URL"""
        if not url:
            return "No URL provided"
        
        try:
            self.browser.get(url)
            page_source = self.browser.page_source
            return self._process_html_content(page_source, url)
        except Exception as e:
            return f"Error extracting content: {e}"
    
    def extract_content_from_html(self, html_content):
        """Process raw HTML content"""
        if not html_content:
            return "No HTML content provided"
        
        return self._process_html_content(html_content)
    
    def _process_html_content(self, html_content, url=None):
        """Process HTML content to extract all text information"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
        
        # Extract title
        title = soup.title.string if soup.title else "No title found"
        
        # Extract meta description
        meta_desc = ""
        meta_tag = soup.find("meta", attrs={"name": "description"})
        if meta_tag and meta_tag.get("content"):
            meta_desc = meta_tag.get("content")
        
        # Extract all text from the page
        all_text = soup.get_text(separator='\n', strip=True)
        
        # Combine the extracted information
        summary = f"Title: {title}\n\n"
        if url:
            summary += f"URL: {url}\n\n"
        if meta_desc:
            summary += f"Description: {meta_desc}\n\n"
            
        summary += "Page Content:\n\n"
        summary += all_text
        
        return summary
    
    def close(self):
        """Close the browser instance"""
        if self.browser:
            self.browser.quit()
