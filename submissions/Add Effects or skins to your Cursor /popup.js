
document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['cursorSkin', 'cursorEffect', 'effectSize', 'effectColor', 'effectOpacity'], function(data) {
    if (data.cursorSkin) {
      document.querySelectorAll('.skin-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.id === data.cursorSkin);
      });
    }
    
    if (data.cursorEffect) {
      document.querySelectorAll('.effect-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.id === data.cursorEffect);
      });
    }
    
    if (data.effectSize) document.getElementById('size').value = data.effectSize;
    if (data.effectColor) document.getElementById('color').value = data.effectColor;
    if (data.effectOpacity) document.getElementById('opacity').value = data.effectOpacity;
  });
  
  // Cursor skin buttons
  document.querySelectorAll('.skin-btn').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.skin-btn').forEach(btn => btn.classList.remove('selected'));
      this.classList.add('selected');
      
      const skin = this.id;
      chrome.storage.sync.set({cursorSkin: skin});
      
      // Send message to content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateCursor",
          skin: skin
        });
      });
    });
  });
  
