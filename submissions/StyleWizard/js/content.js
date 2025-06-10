lastMouseX = 0;
lastMouseY = 0;

started = false;
clickedButton = false;


document.addEventListener("mousemove", (event) => {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
})

function openStyleDialog(element) {
    const dialog = document.createElement("div");
    dialog.innerHTML = `
        <div id="styleWizardPopup" style="position: fixed;top:20%;left:30%;background:rgb(255, 228, 196);padding:20px;z-index:9999;box-shadow:0 0 10px rgba(0,0,0,0.5);border:4px solid #3b3b5a;border-radius: 10px;font-family: ui-sans-serif,system-ui,sans-serif;color: black;">
            
            <input type="checkbox" id="SWisbgColor">
            <label>Background Color: <input type="color" id="SWbgColor"></label> <br>

            <input type="checkbox" id="SWiselementColor">
            <label>Element Color: <input type="color" id="SWelementColor"></label> <br>

            <input type="checkbox" id="SWisFont">
            <label>Font:  <select id="SWfont">
            <option value="Arial" style="font-family: Arial;">Arial</option>
            <option value="Arial Black" style="font-family: Arial Black;">Arial Black</option>
            <option value="Century Gothic" style="font-family: Century Gothic;">Century Gothic</option>
            <option value="Comic Sans MS" style="font-family: Comic Sans MS;">Comic Sans MS</option>
            <option value="Courier New" style="font-family: Courier New;">Courier New</option>
            <option value="Garamond" style="font-family: Garamond;">Garamond</option>
            <option value="Georgia" style="font-family: Georgia;">Georgia</option>
            <option value="Impact" style="font-family: Impact;">Impact</option>
            <option value="Lucida Console" style="font-family: Lucida Console;">Lucida Console</option>
            <option value="Palatino Linotype" style="font-family: Palatino Linotype;">Palatino Linotype</option>
            <option value="Tahoma" style="font-family: Tahoma;">Tahoma</option>
            <option value="Times New Roman" style="font-family: Times New Roman;">Times New Roman</option>
            <option value="Trebuchet MS" style="font-family: Trebuchet MS;">Trebuchet MS</option>
            <option value="Verdana" style="font-family: Verdana;">Verdana</option>
            </select></label> <br>

            <input type="checkbox" id="SWisfontSize">
            <label>Font Size: <input type="number" id="SWfontSize" value="24" max="1024" min="1"></label><br>
            <br>

            <input type="checkbox" id="SWisremove">
            <label>Remove this element</label> <br>
            <br>

            <button id="SWapply" style="background:rgb(255, 217, 168);border:2px solid #3b3b5a;border-radius: 4px;font-family: ui-sans-serif,system-ui,sans-serif;color:black;">OK</button>
            <button id="SWcancel" style="background:rgb(255, 217, 168);border:2px solid #3b3b5a;border-radius: 4px;font-family: ui-sans-serif,system-ui,sans-serif;color:black;">Cancel</button>
            </div>
    
    `;
    document.body.appendChild(dialog);

    document.getElementById("SWapply").onclick = () => {
        clickedButton = true;
        applyStyles(element);
        dialog.remove();
        started = false;

    };

    document.getElementById("SWcancel").onclick = () => {
        clickedButton = true;
        dialog.remove();
        started = false;

    };
} 

function applyStyles(element) {
    
    const elementColor = document.getElementById("SWelementColor").value;
    const bgColor = document.getElementById("SWbgColor").value;
    const font = document.getElementById("SWfont").value;
    const fontSize = document.getElementById("SWfontSize").value;

    if (element) {
        
        if (document.getElementById("SWisbgColor").checked){
            element.style.backgroundColor = bgColor;
        }
        if (document.getElementById("SWiselementColor").checked){
            element.style.color = elementColor;
        }

        if (document.getElementById("SWisFont").checked){
            element.style.fontFamily = font;
        }

        if (document.getElementById("SWisfontSize").checked){
            element.style.fontSize = `${fontSize}px`;
        }

        if (document.getElementById("SWisremove").checked){
            element.remove();
        }
        
        element = null;
    }
    
}

const getOS = () => {
     const userAgent = window.navigator.userAgent;
     os = "unknown";
 
     if (userAgent.indexOf("Win") !== -1) os = "Windows";
     else if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
     else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
 
     return os;
 
};
 

document.addEventListener("click", function(event){

    if (started == false && clickedButton == false) {
        os = getOS();
        if ((os == "Windows" && event.ctrlKey) || (os == "MacOS" && event.metaKey) || (os == "Linux" && event.ctrlKey)) {
            started = true;
            let selectedElement = document.elementFromPoint(lastMouseX, lastMouseY);
        
            if (selectedElement) {
                let selector = selectedElement.tagName.toLowerCase();
                if (selectedElement.id) selector += `#${selectedElement.id}`;
                if (selectedElement.className) selector += `.${selectedElement.className.split(" ").join(".")}`;
                console.log(selectedElement.className);
                openStyleDialog(selectedElement);
            }
        }
    } else {
        clickedButton = false;
    }
    
});
