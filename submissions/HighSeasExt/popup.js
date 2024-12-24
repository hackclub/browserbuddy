console.log("popup.js");
import "./bp.js";

const sir = document.getElementById("sir");
const sirV = document.getElementById("sir-v");

sirV.addEventListener("click", () => {
    sir.click();
});

sir.addEventListener("change", () => {
    browser.storage.local.set({
        showItemRatings: sir.checked
    });
});

const bott = document.getElementById("bot");
const botV = document.getElementById("bot-v");

botV.addEventListener("click", () => {
    bott.click();
});

bott.addEventListener("change", () => {
    browser.storage.local.set({
        bot: bott.checked
    });
});

const infoc = document.getElementById("info");
const infoV = document.getElementById("info-v");

infoV.addEventListener("click", () => {
    infoc.click();
});

infoc.addEventListener("change", () => {
    browser.storage.local.set({
        info: infoc.checked
    })
});

const iw = document.getElementById("iw");
const iwV = document.getElementById("iw-v");

iwV.addEventListener("click", () => {
    iw.click();
});

iw.addEventListener("change", () => {
    browser.storage.local.set({
        itemWorth: iw.checked
    })
});

const away = document.getElementById("away");
const awayV = document.getElementById("away-v");

awayV.addEventListener("click", () => {
    away.click();
});

away.addEventListener("change", () => {
    browser.storage.local.set({
        hoursAway: away.checked
    });
});

browser.storage.local.get("showItemRatings").then(({
    showItemRatings
}) => {
    sir.checked = showItemRatings;
});

browser.storage.local.get("bot").then(({
    bot
}) => {
    bott.checked = bot;
});

browser.storage.local.get("info").then(({
    info
}) => {
    infoc.checked = info;
});

browser.storage.local.get("itemWorth").then(({
    itemWorth
}) => {
    iw.checked = itemWorth;
});

browser.storage.local.get("hoursAway").then(({
    hoursAway
}) => {
    away.checked = hoursAway;
});

document.getElementById("sir-s").onclick = () => {
    sirV.click();
}

document.getElementById("bot-s").onclick = () => {
    botV.click();
}

document.getElementById("info-s").onclick = () => {
    infoV.click();
}

document.getElementById("iw-s").onclick = () => {
    iwV.click();
}

document.getElementById("away-s").onclick = () => {
    awayV.click();
}