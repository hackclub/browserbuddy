import json
import os
import socket
import threading
import time

class BrowserExtensionInterface:
    def __init__(self, port=9222):
        self.port = port
        self.server_socket = None
        self.client_socket = None
        self.current_html = ""
        self.current_url = ""
        self.running = False
        self.connection_thread = None
    
    def start_server(self):
        """Start a socket server to receive HTML content from browser extension"""
        self.running = True
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            self.server_socket.bind(('localhost', self.port))
            self.server_socket.listen(1)
            self.connection_thread = threading.Thread(target=self._accept_connections)
            self.connection_thread.daemon = True
            self.connection_thread.start()
            print(f"Browser extension interface listening on port {self.port}")
        except Exception as e:
            print(f"Error starting browser extension server: {e}")
            self.running = False
    
    def _accept_connections(self):
        """Accept connections from the browser extension"""
        while self.running:
            try:
                self.client_socket, _ = self.server_socket.accept()
                data = b""
                while self.running:
                    chunk = self.client_socket.recv(4096)
                    if not chunk:
                        break
                    data += chunk
                
                if data:
                    # Assume the data is JSON with an 'html' field
                    try:
                        json_data = json.loads(data.decode('utf-8'))
                        if 'html' in json_data:
                            self.current_html = json_data['html']
                        if 'url' in json_data:
                            self.current_url = json_data['url']
                            print(f"Received content from: {self.current_url}")
                    except json.JSONDecodeError:
                        # If not JSON, assume it's raw HTML
                        self.current_html = data.decode('utf-8', errors='replace')
                        print("Received raw HTML content (not JSON formatted)")
                
                self.client_socket.close()
            except socket.error as e:
                if self.running:  # Only log if we're still supposed to be running
                    print(f"Socket error: {e}")
                time.sleep(1)
            except Exception as e:
                if self.running:
                    print(f"Unexpected error in connection handling: {e}")
                time.sleep(1)
    
    def get_current_html(self):
        """Get the most recently received HTML content"""
        return self.current_html
    
    def get_current_url(self):
        """Get the most recently received URL"""
        return self.current_url
    
    def has_content(self):
        """Check if we have any HTML content"""
        return bool(self.current_html.strip())
    
    def stop_server(self):
        """Stop the server"""
        self.running = False
        if self.client_socket:
            try:
                self.client_socket.close()
            except:
                pass
        if self.server_socket:
            try:
                self.server_socket.close()
            except:
                pass
        if self.connection_thread and self.connection_thread.is_alive():
            self.connection_thread.join(timeout=1)
        print("Browser extension interface stopped")
