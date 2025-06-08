let allAnnotations = {};
let currentlyEditing = null;

document.addEventListener('DOMContentLoaded', function() {
    loadAllAnnotations();

    document.getElementById('search').addEventListener('input', function() {
        filterAnnotations(this.value.toLowerCase());
    });
});

function loadAllAnnotations() {
    chrome.storage.local.get(['annotations'], function(result) {
        allAnnotations = result.annotations || {};
        displayAnnotations(allAnnotations);
    });
}

function displayAnnotations(annotations) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';
    
    let totalCount = 0;
    let annotationElements = [];
    
    for (const url in annotations) {
        const urlAnnotations = annotations[url];
        totalCount += urlAnnotations.length;

        urlAnnotations.forEach(annotation => {
            const element = createAnnotationElement(annotation, url);
            annotationElements.push(element);
        });
    }
    
    document.querySelector('#annotations-count p:first-child').textContent = totalCount;
    
    if (annotationElements.length === 0) {
        contentDiv.innerHTML = '<p style="text-align: center; margin-top: 40px; color: #666;">No annotations found</p>';
    } else {
        annotationElements.sort((a, b) => {
            const timeA = a.getAttribute('data-timestamp');
            const timeB = b.getAttribute('data-timestamp');
            return timeB - timeA;
        });
        
        annotationElements.forEach(element => {
            contentDiv.appendChild(element);
        });
    }
}

function createAnnotationElement(annotation, url) {
    const annotationElement = document.createElement('div');
    annotationElement.className = '__annotator-popover-inside';
    annotationElement.dataset.goto = annotation.id;
    annotationElement.setAttribute('data-timestamp', annotation.timestamp);
    annotationElement.setAttribute('data-url', url);
    
    const hostname = new URL(url).hostname;
    
    let highlightClass = '';
    if (annotation.color) {
        highlightClass = annotation.color.replace('__annotator-highlight-', '');
    }
    
    annotationElement.innerHTML = `
        <div class="__annotator-popover-note" contenteditable="false" spellcheck="false">
            <p class="website">${hostname}</p>
            <p class="highlightedText ${highlightClass}" data-original-text="${annotation.text}">${annotation.text}</p>
            <div class="note-content">${annotation.note !== annotation.text ? annotation.note : ''}</div>
        </div>
        <div class="__annotator-popover-actions">
            <div class="__annotator-popover-readmode-elements">
                <button class="__annotator-delete-button __annotator-actionbtn" style="padding-left: 8.875px; padding-right: 8.875px; padding-top: 8px; padding-bottom: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="14"><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/></svg>
                </button>
                <button class="__annotator-edit-button __annotator-actionbtn" style="padding-left: 8.875px; padding-right: 8.875px; padding-top: 8px; padding-bottom: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="14"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
                </button>
            </div>
            <div class="__annotator-popover-editmode-elements">
                <button class="__annotator-actionbtn __annotator-save-button" style="padding-left: 8.875px; padding-right: 8.875px; padding-top: 8px; padding-bottom: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="14"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                </button>
                <button class="__annotator-actionbtn __annotator-cancel-button" style="padding-left: 8px; padding-right: 8px; padding-top: 8px; padding-bottom: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="14"><path d="M125.7 160l50.3 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L48 224c-17.7 0-32-14.3-32-32L16 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>
                </button>
            </div>
            <div class="__annotator-popover-editmode-elements colorSelectors" style="margin-top: auto; margin-bottom: auto; gap: 12px;">
                <div id="__annotator-setcolor-red" class="__annotator-color-selector" style="background-color: #f93535;"></div>
                <div id="__annotator-setcolor-yellow" class="__annotator-color-selector __annotator-color-selected" style="background-color: #eeea00;"></div>
                <div id="__annotator-setcolor-green" class="__annotator-color-selector" style="background-color: #69ed2b;"></div>
                <div id="__annotator-setcolor-blue" class="__annotator-color-selector" style="background-color: #5e63f5;"></div>
                <div id="__annotator-setcolor-purple" class="__annotator-color-selector" style="background-color: #a846f3;"></div>
            </div>
            <div class="__annotator-popover-readmode-elements" style="margin-top: auto; margin-bottom: auto;">
                <span style="font-size: 12px; color: #666;">${getTimeAgo(new Date(annotation.timestamp))}</span>
            </div>
            <div class="__annotator-popover-readmode-elements">
                <button class="openInNewTab">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg>Open in new tab
                </button>
            </div>
        </div>
    `;
    
    annotationElement.querySelector('.openInNewTab').addEventListener('click', function() {
        openAnnotationInNewTab(url, annotation.id);
    });
    
    annotationElement.querySelector('.__annotator-delete-button').addEventListener('click', function() {
        deleteAnnotation(url, annotation.id);
    });
    
    annotationElement.querySelector('.__annotator-edit-button').addEventListener('click', function() {
        enableEditMode(annotationElement, annotation, url);
    });
    
    annotationElement.querySelector('.__annotator-save-button').addEventListener('click', function() {
        saveAnnotationEdit(annotationElement, url);
    });
    
    annotationElement.querySelector('.__annotator-cancel-button').addEventListener('click', function() {
        cancelAnnotationEdit(annotationElement, annotation);
    });
    
    const colorSelectors = annotationElement.querySelectorAll('.__annotator-color-selector');
    colorSelectors.forEach(selector => {
        if (selector.dataset.color === annotation.color) {
            selector.classList.add('__annotator-color-selected');
        }
        
        selector.addEventListener('click', function() {
            colorSelectors.forEach(s => s.classList.remove('__annotator-color-selected'));
            this.classList.add('__annotator-color-selected');
            
            const highlightedText = annotationElement.querySelector('.highlightedText');
            highlightedText.className = 'highlightedText ' + this.dataset.color.replace('__annotator-highlight-', '');
        });
    });
    
    return annotationElement;
}

function enableEditMode(element, annotation, url) {
    if (currentlyEditing && currentlyEditing !== element) {
        const annotationId = currentlyEditing.dataset.goto;
        const annotationUrl = currentlyEditing.getAttribute('data-url');
        const originalAnnotation = getAnnotationById(annotationId, annotationUrl);
        cancelAnnotationEdit(currentlyEditing, originalAnnotation);
    }
    
    currentlyEditing = element;
    
    const readModeElements = element.querySelectorAll('.__annotator-popover-readmode-elements');
    readModeElements.forEach(el => el.style.display = 'none');
    
    const editModeElements = element.querySelectorAll('.__annotator-popover-editmode-elements');
    editModeElements.forEach(el => el.style.display = 'block');
    
    const noteContent = element.querySelector('.note-content');
    noteContent.contentEditable = 'true';
    noteContent.focus();
    
    const colorSelectors = element.querySelectorAll('.__annotator-color-selector');
    colorSelectors.forEach(selector => {
        const colorId = selector.id;
        const colorClass = colorId.replace('__annotator-setcolor-', '__annotator-highlight-');
        selector.dataset.color = colorClass;
        
        selector.classList.remove('__annotator-color-selected');
        
        if (annotation.color === colorClass) {
            selector.classList.add('__annotator-color-selected');
        }
    });
    
    element.querySelector('.colorSelectors').style.display = 'flex';
}

function saveAnnotationEdit(element, url) {
    const annotationId = element.dataset.goto;
    const noteContent = element.querySelector('.note-content').innerHTML;
    const selectedColor = element.querySelector('.__annotator-color-selected').dataset.color;
    
    chrome.storage.local.get(['annotations'], function(result) {
        const annotations = result.annotations || {};
        const urlAnnotations = annotations[url] || [];
        
        const updatedAnnotations = urlAnnotations.map(a => {
            if (a.id === annotationId) {
                return {
                    ...a,
                    note: noteContent,
                    color: selectedColor,
                    lastEdited: Date.now()
                };
            }
            return a;
        });
        
        annotations[url] = updatedAnnotations;
        chrome.storage.local.set({annotations: annotations}, function() {
            allAnnotations = annotations;
            
            disableEditMode(element);
            displayAnnotations(annotations);
        });
    });
}

function cancelAnnotationEdit(element, annotation) {
    disableEditMode(element);
    
    if (annotation) {
        const highlightedText = element.querySelector('.highlightedText');
        const noteContent = element.querySelector('.note-content');
        
        if (annotation.color) {
            highlightedText.className = 'highlightedText ' + annotation.color.replace('__annotator-highlight-', '');
        } else {
            highlightedText.className = 'highlightedText';
        }
        
        noteContent.innerHTML = annotation.note !== annotation.text ? annotation.note : '';
    }
}

function disableEditMode(element) {
    const readModeElements = element.querySelectorAll('.__annotator-popover-readmode-elements');
    readModeElements.forEach(el => el.style.display = 'block');
    
    const editModeElements = element.querySelectorAll('.__annotator-popover-editmode-elements');
    editModeElements.forEach(el => el.style.display = 'none');
    
    const noteContent = element.querySelector('.note-content');
    noteContent.contentEditable = 'false';
    
    if (currentlyEditing === element) {
        currentlyEditing = null;
    }
}

function getAnnotationById(id, url) {
    const annotations = allAnnotations[url] || [];
    return annotations.find(a => a.id === id);
}

function deleteAnnotation(url, annotationId) {
    chrome.storage.local.get(['annotations'], function(result) {
        const annotations = result.annotations || {};
        const urlAnnotations = annotations[url] || [];
        
        const updatedAnnotations = urlAnnotations.filter(a => a.id !== annotationId);
        
        if (updatedAnnotations.length > 0) {
            annotations[url] = updatedAnnotations;
        } else {
            delete annotations[url];
        }
        
        chrome.storage.local.set({annotations: annotations}, function() {
            allAnnotations = annotations;
            displayAnnotations(annotations);
        });
    });
}

function openAnnotationInNewTab(url, annotationId) {
    chrome.tabs.create({url: url}, function(tab) {
        function checkLoaded() {
            chrome.tabs.sendMessage(tab.id, {
                action: 'goToAnnotation',
                annotationId: annotationId
            }, function(response) {
                if (chrome.runtime.lastError) {
                    setTimeout(checkLoaded, 200);
                }
            });
        }
        
        setTimeout(checkLoaded, 500);
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

function filterAnnotations(searchTerm) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';
    
    let totalFilteredCount = 0;
    let filteredElements = [];
    
    for (const url in allAnnotations) {
        const urlAnnotations = allAnnotations[url];
        const hostname = new URL(url).hostname;
        
        const filteredAnnotations = urlAnnotations.filter(annotation => {
            return (
                (annotation.text && annotation.text.toLowerCase().includes(searchTerm)) || 
                (annotation.note && annotation.note.toLowerCase().includes(searchTerm)) ||
                (hostname.toLowerCase().includes(searchTerm)) ||
                (annotation.color && annotation.color.toLowerCase().includes(searchTerm)) ||
                (getTimeAgo(new Date(annotation.timestamp)).toLowerCase().includes(searchTerm))
            );
        });
        
        totalFilteredCount += filteredAnnotations.length;
        
        filteredAnnotations.forEach(annotation => {
            const element = createAnnotationElement(annotation, url);
            filteredElements.push(element);
        });
    }
    
    document.querySelector('#annotations-count p:first-child').textContent = totalFilteredCount;
    
    if (filteredElements.length === 0) {
        contentDiv.innerHTML = '<p style="text-align: center; margin-top: 40px; color: #666;">No matching annotations found</p>';
    } else {
        filteredElements.sort((a, b) => {
            const timeA = a.getAttribute('data-timestamp');
            const timeB = b.getAttribute('data-timestamp');
            return timeB - timeA;
        });
        
        filteredElements.forEach(element => {
            contentDiv.appendChild(element);
        });
    }
}