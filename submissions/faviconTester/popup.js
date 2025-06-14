const browserAPI = window.chrome || window.browser; // Gère les deux navigateurs

document.getElementById("previewBtn").addEventListener("click", function() {
    let title = document.getElementById("title").value.trim();
    let faviconFile = document.getElementById("faviconFile").files[0];

    if (title === "") {
        title = "Untitled website test";
    }

    if (!faviconFile) {
        openPreviewTab(title, "icon.png");
        return;
    }

    let reader = new FileReader();
    reader.onload = function(event) {
        let img = new Image();
        img.src = event.target.result;

        img.onload = function() {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");

            let size = Math.min(img.width, img.height, 128);
            canvas.width = size;
            canvas.height = size;
            ctx.drawImage(img, 0, 0, size, size);

            let resizedFavicon = canvas.toDataURL("image/png");
            openPreviewTab(title, resizedFavicon);
        };
    };
    reader.readAsDataURL(faviconFile);
});

function openPreviewTab(title, favicon) {
    browserAPI.tabs.create({
        url: `preview.html?title=${encodeURIComponent(title)}&favicon=${encodeURIComponent(favicon)}`
    });
}
