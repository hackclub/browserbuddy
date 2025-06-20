(function() {
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    function fireEvent() {
        window.dispatchEvent(new CustomEvent("custom:navigation", {
            detail: { url: location.href }
        }));
    }

    history.pushState = function(...args) {
        origPush.apply(this, args);
        fireEvent();
    };

    history.replaceState = function(...args) {
        origReplace.apply(this, args);
        fireEvent();
    };

    window.addEventListener("popstate", fireEvent);
})();
