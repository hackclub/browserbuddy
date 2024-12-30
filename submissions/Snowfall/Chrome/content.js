let isChristmasified = false;
let snowInterval;

// document.body.appendChild(garlandContainer);

function applyGarland() {
    if (document.getElementById('garland-container')) return;

    const garlandContainer = document.createElement("div");
    garlandContainer.id = "garland-container";

    // Create garlands (using a loop for multiple)
    let count = 0;
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 20; j++) {
            const garland = document.createElement("div");
            garland.className = "garland";
            garland.style.left = `${i * 10 + j * 0.5 - 0.5}%`; 
            garland.style.top = `${ -0.15 * ( ((j-10) * (j-10)) - 80) }%`; 
            garland.style.filter = 'hue-rotate('+Math.random() * 30 - 10+'deg)';
            garlandContainer.appendChild(garland);
            
            if (count % 11 == 0) {
                const light = document.createElement('div');
                light.className = 'garland light';
                light.innerText = '.';
                light.style.position = 'absolute';
                light.style.left = `${i * 10 + j * 0.5 - 0.5  + Math.random() * 1}%`;
                light.style.top = `${ -0.15 * ( ((j-10) * (j-10)) - 80) + Math.random() * 3 -4}%`;
                light.style.fontSize = Math.random() * 20 + 20 + 'px';
                light.style.opacity = Math.random();
                light.style.animation = `flicker ${Math.random() * 8 + 4}s linear infinite`;
                garlandContainer.appendChild(light);
            }

            // if (count % 4 == 0) {
            //     lightInterval = setInterval(() => {
            //         const light = document.createElement('div');
            //         light.className = 'light';
            //         light.innerText = '`';
            //         light.style.position = 'absolute';
            //         light.style.left = `${i * 10 + j * 0.5 - 0.5}%`;
            //         light.style.top = `${ -0.15 * ( ((j-10) * (j-10)) - 80) }%`;
            //         light.style.fontSize = Math.random() * 10 + 10 + 'px';
            //         light.style.opacity = Math.random();
            //         light.style.animation = `flicker 5s linear infinite`;
            //         garlandContainer.appendChild(light);
            
            //         setTimeout(() => light.remove(), 5000);
            //     }, 200);
            // }

            count++;
        }
    }

    document.body.appendChild(garlandContainer);
}

function applySnow() {
    if (document.getElementById('snow-container')) return;

    const container = document.createElement('div');
    container.id = 'snow-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';

    snowInterval = setInterval(() => {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerText = '❄️';
        snowflake.style.position = 'absolute';
        snowflake.style.left = Math.random() * window.innerWidth + 'px';
        snowflake.style.top = '-50px';
        snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
        snowflake.style.opacity = Math.random();
        snowflake.style.animation = `fall 5s linear infinite`;
        container.appendChild(snowflake);

        setTimeout(() => snowflake.remove(), 5000);
    }, 200);

    document.body.appendChild(container);
}

// function applyBackground() {
//     document.body.style.background = 'url(https://www.designyourway.net/blog/wp-content/uploads/2024/04/christmas-wallpaper-from-designyourway-1200x700.jpg) no-repeat center center fixed #FFF';
//     document.body.style.backgroundSize = 'cover';
//     document.body.style.opacity = '1.5';
// }

function removeDecorations() {
    // document.getElementById('christmas-lights-container')?.remove();
    document.getElementById('snow-container')?.remove();
    document.getElementById('garland-container')?.remove();
    // document.body.style.background = '';
    clearInterval(snowInterval);
}

function applyChristmasify() {
    if (isChristmasified) return;
    applySnow();
    applyGarland();
    isChristmasified = true;
}
  
function removeChristmasify() {
    if (!isChristmasified) return;
    removeDecorations();
    isChristmasified = false;
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'applyChristmasify') applyChristmasify();
    if (message.action === 'removeChristmasify') removeChristmasify();
});

document.addEventListener("mousemove", (event) => {
    const garlands = document.querySelectorAll(".garland");
    garlands.forEach((garland) => {
        const rect = garland.getBoundingClientRect();
        const distance = Math.hypot(
            event.clientX - (rect.left + rect.width / 2),
            event.clientY - (rect.top + rect.height / 2)
        );
  
        if (distance < 180) {
            garland.style.transform = `translateY(-${180-distance}px)`;
        } else {
            garland.style.transform = `translateY(0px)`;
        }
    });
});