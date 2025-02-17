// Replace all images with random cat images from Cataas
const replaceWithCats = () => {
    const images = document.querySelectorAll("img:not([data-cat-replaced])");

    images.forEach(img => {
        const width = img.naturalWidth || 300; // Default width if undefined
        const height = img.naturalHeight || 300; // Default height if undefined
        const uniqueParam = `random=${Math.random()}`;
        const fontSize = 30; // Font size in pixels
        const color = 'white'; // Font color
        const background = 'black'; // Background color for better readability
        const newSrc = `https://cataas.com/cat/cute?width=${width}&height=${height}&size=${fontSize}&color=${color}&s=${background}&${uniqueParam}`;

        img.src = newSrc;
        img.srcset = `${newSrc} 1x, ${newSrc} 2x`; // Adjust for responsive images
        img.setAttribute('data-cat-replaced', 'true'); // Mark the image as replaced

        // Handle the load event to ensure the new image is loaded correctly
        img.onload = () => {
            img.width = width;
            img.height = height;
        };
    });
};

// Replace images on page load
replaceWithCats();

// Observe and replace dynamically added images (e.g., infinite scroll)
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.tagName === 'IMG' && !node.hasAttribute('data-cat-replaced')) {
                replaceWithCats();
            }
        });
    });
});
observer.observe(document.body, { childList: true, subtree: true });

console.log('Content script loaded');