const body = document.querySelector("body");

const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Pangolin&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

function createFloatingWindow() {
    const floatingWindow = document.createElement("div");
    floatingWindow.className = 'floating-window';
    floatingWindow.style.cssText = `
    box-sizing: border-box;
    position: fixed;
    top: 20px;
    left: 20px;
    width: 700px;
    height: 450px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(15px);
    border: 1px solid #ccc;
    border-radius: 20px;
    z-index: 10000;
    display: block;
    font-family: 'Pangolin', cursive;
  `;

    const header = document.createElement("div");
    header.style.cssText = `
    box-sizing: border-box;
    padding: 10px;
    color: #FFFDD4;
    background: #FF7676;
    border-bottom: 1px solid #ccc;
    border-radius: 20px 20px 0 0;
    cursor: move;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
    header.innerHTML = `
        <span style="cursor:move;">Dodo Sketch</span>
        <div style="display:flex;gap:10px;align-items:center;">
            <label class="switch" style="position:relative;display:inline-block;width:30px;height:17px;">
                <input type="checkbox" style="opacity:0;width:0;height:0;">
                <span class="slider" style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#FFFDD4;border-radius:17px;transition:.4s;">
                    <span style="position:absolute;content:'';height:13px;width:13px;left:2px;bottom:2px;background-color:#FF7676;border-radius:50%;transition:.4s;"></span>
                </span>
            </label>
            <button style="cursor:pointer;border:none;background:none;font-size:20px;color:#FFFDD4;padding:0;margin:0;">×</button>
        </div>
    `;

    const content = document.createElement("div");
    content.style.cssText = `
    box-sizing: border-box;
    padding: 10px;
    font-family: 'Pangolin', cursive;
    flex: 1;
    overflow: auto;
  `;

    const editableArea = document.createElement('div');
    editableArea.id = 'interface';
    editableArea.contentEditable = 'true';
    editableArea.style.cssText = `
    box-sizing: border-box;
    width: 100%;
    height: 375px;
    color: #333;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    font-family: inherit;
    resize: none;
    border: 1px dashed #ccc;
    padding: 16px;
    overflow: auto;
  `;
    content.appendChild(editableArea);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'file-input';
    fileInput.multiple = true;
    fileInput.hidden = true;

    floatingWindow.appendChild(header);
    floatingWindow.appendChild(content);
    floatingWindow.appendChild(fileInput);

    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        width: 15px;
        height: 15px;
        cursor: se-resize;
        background: #FF7676;
        border-radius: 0 0 20px 0;
    `;
    floatingWindow.appendChild(resizeHandle);

    const colorToggle = header.querySelector('input[type="checkbox"]');
    const slider = header.querySelector('.slider span');
    
    colorToggle.addEventListener('change', function() {
        const editableArea = floatingWindow.querySelector('#interface');
        editableArea.style.color = this.checked ? '#FFFDD4' : '#333';
        slider.style.transform = this.checked ? 'translateX(13px)' : 'translateX(0)';
    });

    let isResizing = false;
    resizeHandle.addEventListener('mousedown', initResize);

    function initResize(e) {
        isResizing = true;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    function resize(e) {
        if (!isResizing) return;
        const width = e.clientX - floatingWindow.offsetLeft;
        const height = e.clientY - floatingWindow.offsetTop;
        floatingWindow.style.width = width + 'px';
        floatingWindow.style.height = height + 'px';
        editableArea.style.height = (height - 75) + 'px';
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    header.addEventListener("mousedown", (e) => {
        body.style.userSelect = 'none';
        isDragging = true;
        initialX = e.clientX - floatingWindow.offsetLeft;
        initialY = e.clientY - floatingWindow.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            floatingWindow.style.left = currentX + "px";
            floatingWindow.style.top = currentY + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        body.style.userSelect = 'auto';
        isDragging = false;
    });

    header.querySelector('button').addEventListener('click', () => {
        floatingWindow.style.display = 'none';
    });

    body.appendChild(floatingWindow);

    const dropArea = floatingWindow.querySelector('#interface');
    const file = floatingWindow.querySelector('#file-input');

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropArea.addEventListener('dragover', preventDefaults);
    dropArea.addEventListener('dragenter', preventDefaults);
    dropArea.addEventListener('dragleave', preventDefaults);
    dropArea.addEventListener('drop', handleDrop);

    function handleDrop(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        dropArea.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        if (files.length) {
            file.files = files;
            handleFiles(files, dropArea);
        }
    }

    function handleFiles(files, dropArea) {
        for (const file of files) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function () {
                const preview = document.createElement('img');
                preview.style.display = 'inline-block';
                preview.style.maxWidth = '100%';
                preview.style.maxHeight = '200px';
                preview.style.objectFit = 'contain';
                preview.src = reader.result;
                dropArea.appendChild(preview);
            };
        }
    }

    dropArea.addEventListener('dragover', () => {
        dropArea.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    });

    editableArea.addEventListener('input', () => {
        chrome.storage.sync.set({
            'content': editableArea.innerHTML,
            'color': editableArea.style.color
        });
    });

    chrome.storage.sync.get(['content', 'color'], (result) => {
        if (result.content) {
            editableArea.innerHTML = result.content;
        }
        if (result.color) {
            editableArea.style.color = result.color;
            colorToggle.checked = result.color === '#FFFDD4';
            slider.style.transform = colorToggle.checked ? 'translateX(13px)' : 'translateX(0)';
        }
    });

    colorToggle.addEventListener('change', function() {
        const color = this.checked ? '#FFFDD4' : '#333';
        editableArea.style.color = color;
        slider.style.transform = this.checked ? 'translateX(13px)' : 'translateX(0)';
        chrome.storage.sync.set({ 'color': color });
    });

    return floatingWindow;
}


if (body) {
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'createFloatingWindow') {
            const existingWindow = document.querySelector('.floating-window');
            if (!existingWindow) {
                body.appendChild(createFloatingWindow());
            } else if (existingWindow.style.display === 'none') {
                existingWindow.style.display = 'block';
            }
        }
    });
}