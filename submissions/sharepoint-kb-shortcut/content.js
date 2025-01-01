function keydown(ev){
    const player = document.getElementsByClassName("oneplayer-root")[0];
    if (player.contains(ev.target) && ev.target !== player){
        ev.stopImmediatePropagation();
        const keys = {
            "ArrowLeft": document.querySelector('[aria-description*="Alt + J"]'),
            " ": document.querySelector('[aria-description*="Alt + K"]'),
            "ArrowRight": document.querySelector('[aria-description*="Alt + L"]'),

            "j": document.querySelector('[aria-description*="Alt + J"]'),
            "k": document.querySelector('[aria-description*="Alt + K"]'),
            "l": document.querySelector('[aria-description*="Alt + L"]'),

            "f": document.querySelector('[aria-description*="Alt + Enter"]'),
            "m": document.querySelector('[aria-description*="Alt + M"]'),
            "c": document.querySelector('[aria-description*="Alt + C"]'),
        }
        for (const key in keys){
            if (ev.key === key){
                keys[key].click();
            }
        }
    }
}
window.addEventListener("keydown", keydown, true);