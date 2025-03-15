document.querySelector('#navbar button').addEventListener('click', function() {
    window.open('annotations.html', '_blank');
});

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        
        document.querySelector('#search').placeholder = 'Search in this tab';
        
        chrome.storage.local.get(['annotations'], function(result) {
            const annotations = result.annotations || {};
            const urlAnnotations = annotations[currentUrl] || [];
            
            document.querySelector('#annotations-count p:first-child').textContent = urlAnnotations.length;
            
            const contentDiv = document.querySelector('#content');
            contentDiv.innerHTML = '';
            
            if (urlAnnotations.length === 0) {
                contentDiv.innerHTML = '<p style="text-align: center; margin-top: 40px; color: #666;">No annotations for this page</p>';
            } else {
                urlAnnotations.forEach(annotation => {
                    const annotationElement = createAnnotationElement(annotation);
                    contentDiv.appendChild(annotationElement);
                    
                    annotationElement.querySelector('.goToAnnotation').addEventListener('click', function() {
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                action: 'goToAnnotation',
                                annotationId: annotation.id
                            });
                            
                            window.close();
                        });
                    });
                    
                    annotationElement.querySelector('.__annotator-delete-button').addEventListener('click', function() {
                        deleteAnnotation(currentUrl, annotation.id);
                    });
                });
            }
        });
    });
});

function createAnnotationElement(annotation) {
    const annotationElement = document.createElement('div');
    annotationElement.className = '__annotator-popover-inside';
    annotationElement.dataset.goto = annotation.id;
    
    let highlightClass = '';
    if (annotation.color) {
        highlightClass = annotation.color.replace('__annotator-highlight-', '');
    }
    
    annotationElement.innerHTML = `
        <div class="__annotator-popover-note" contenteditable="false" spellcheck="false">
            <p class="highlightedText ${highlightClass}">${annotation.text}</p>
            ${annotation.note !== annotation.text ? annotation.note : ''}
        </div>
        <div class="__annotator-popover-actions">
            <div class="__annotator-popover-readmode-elements">
                <button class="__annotator-delete-button __annotator-actionbtn" style="padding-left: 8.875px; padding-right: 8.875px; padding-top: 8px; padding-bottom: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="14"><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/></svg>
                </button>
            </div>
            <div class="__annotator-popover-readmode-elements" style="margin-top: auto; margin-bottom: auto;">
                <span style="font-size: 12px; color: #666;">${getTimeAgo(new Date(annotation.timestamp))}</span>
            </div>
            <div>
                <button class="goToAnnotation">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-corner-down-right"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>Go to annotation
                </button>
            </div>
        </div>
    `;
    
    return annotationElement;
}

function deleteAnnotation(url, annotationId) {
    chrome.storage.local.get(['annotations'], function(result) {
        const annotations = result.annotations || {};
        const urlAnnotations = annotations[url] || [];
        
        const updatedAnnotations = urlAnnotations.filter(a => a.id !== annotationId);
        
        annotations[url] = updatedAnnotations;
        chrome.storage.local.set({annotations: annotations}, function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'removeAnnotation',
                    annotationId: annotationId
                });
            });
            
            location.reload();
        });
    });
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

document.getElementById('search').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    const seeAllBtn = document.getElementById('seeAllBtn');
    if (seeAllBtn) {
        seeAllBtn.style.display = searchTerm.length > 0 ? 'none' : '';
    }

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        
        chrome.storage.local.get(['annotations'], function(result) {
            const annotations = result.annotations || {};
            const urlAnnotations = annotations[currentUrl] || [];
            
            const contentDiv = document.querySelector('#content');
            contentDiv.innerHTML = '';
            
            const filteredAnnotations = urlAnnotations.filter(annotation => {
                return (
                    (annotation.text && annotation.text.toLowerCase().includes(searchTerm)) || 
                    (annotation.note && annotation.note.toLowerCase().includes(searchTerm)) || 
                    (annotation.color && annotation.color.toLowerCase().includes(searchTerm)) ||
                    (getTimeAgo(new Date(annotation.timestamp)).toLowerCase().includes(searchTerm))
                );
            });
            
            document.querySelector('#annotations-count p:first-child').textContent = filteredAnnotations.length;
            
            if (filteredAnnotations.length === 0) {
                contentDiv.innerHTML = '<p style="text-align: center; margin-top: 40px; color: #666;">No matching annotations found</p>';
            } else {
                filteredAnnotations.forEach(annotation => {
                    const annotationElement = createAnnotationElement(annotation);
                    contentDiv.appendChild(annotationElement);
                    
                    annotationElement.querySelector('.goToAnnotation').addEventListener('click', function() {
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                action: 'goToAnnotation',
                                annotationId: annotation.id
                            });
                            
                            window.close();
                        });
                    });
                    
                    annotationElement.querySelector('.__annotator-delete-button').addEventListener('click', function() {
                        deleteAnnotation(currentUrl, annotation.id);
                    });
                });
            }
        });
    });
});