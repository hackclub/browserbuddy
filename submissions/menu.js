document.getElementById('youtube').addEventListener(
    "click", function(){
        const query= document.getElementById("input").value;
        if (query) {
            
            const youtube_search=`https://www.youtube.com/search?q=${ encodeURIComponent(query)}`;
            chrome.tabs.create( {url: youtube_search});
        }
    }
);

document.getElementById('gg-maps').addEventListener(
    "click", function(){
        const query= document.getElementById("input").value;
        if (query) {
            
            const gg_maps_search=`https://www.google.com/maps?q=${ encodeURIComponent(query)}`;
            chrome.tabs.create( {url: gg_maps_search});
        }
    }
);

document.getElementById('wikipedia').addEventListener(
    "click", function(){
        const query= document.getElementById("input").value;
        if (query) {
            
            const wikipedia_search=`https://www.wikipedia.org/wiki/Special:Search?search=${ encodeURIComponent(query)}`;
            chrome.tabs.create( {url: wikipedia_search});
        }
    }
);



document.getElementById('chatgpt').addEventListener(
    "click", function(){
        const query= document.getElementById("input").value;
        if (query) {
            
            const chatgpt_search=`https://chatgpt.com/search?q=${ encodeURIComponent(query)}`;
            chrome.tabs.create( {url: chatgpt_search});
        }
    }
);