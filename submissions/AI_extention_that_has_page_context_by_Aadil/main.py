# ...existing code...

# Import the webpage context modules
from webpage_context import WebpageContextExtractor
from browser_extension import BrowserExtensionInterface

# ...existing code...

class BrowserBuddy:
    def __init__(self):
        # ...existing code...
        
        # Initialize the webpage context extractor
        self.webpage_extractor = WebpageContextExtractor()
        
        # Initialize the browser extension interface
        self.browser_interface = BrowserExtensionInterface()
        self.browser_interface.start_server()
        print("Browser Buddy initialized with webpage context capability")
        print("Waiting for browser extension to send page content...")
        
        # ...existing code...
    
    def get_webpage_context(self):
        """Get context from the current webpage"""
        html_content = self.browser_interface.get_current_html()
        if html_content:
            context = self.webpage_extractor.extract_content_from_html(html_content)
            url = self.browser_interface.get_current_url()
            if url:
                return f"Current webpage: {url}\n\n{context}"
            return context
        else:
            return "No webpage content available. Please make sure the browser extension is installed and active."
    
    def include_webpage_context(self, query):
        """Enhance the query with current webpage context"""
        if not self.browser_interface.has_content():
            return query  # Return original query if no context available
        
        context = self.get_webpage_context()
        enhanced_query = f"Based on the following webpage context:\n\n{context}\n\nUser query: {query}"
        return enhanced_query
    
    # Add this method to your existing request handling to include webpage context
    def handle_request_with_context(self, query):
        enhanced_query = self.include_webpage_context(query)
        # Use your existing request handling method with the enhanced query
        return self.handle_request(enhanced_query)
    
    # ...existing code...
    
    def close(self):
        # ...existing code...
        print("Closing Browser Buddy...")
        self.webpage_extractor.close()
        self.browser_interface.stop_server()
        print("Browser Buddy closed successfully")

# ...existing code...
