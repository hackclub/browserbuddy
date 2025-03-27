document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title") || "Untitled website test";
    const favicon = params.get("favicon") || "icon.png";

    document.title = title;

    let link = document.createElement("link");
    link.rel = "icon";
    link.href = favicon;
    document.head.appendChild(link);
});
