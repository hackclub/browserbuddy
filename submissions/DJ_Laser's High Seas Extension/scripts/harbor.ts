import { sendMessageToWorker } from "./messaging";
import {
  EXT_CACHED_SHIPS_KEY,
  EXT_NUM_DOUBLOONS_KEY,
  FAVOURITE_ITEMS_KEY,
  getCacheItem,
  getShopItemsMap,
  type ShipData,
  type ShopItem,
} from "./storage";
import {
  getAvgDoubloonsPerProject,
  getAvgHoursPerProject,
  getDoubloonsPerHour,
  getTotalDoubloons,
  getTotalHours,
  htmlToNode,
  isShipShipped,
  truncateTo,
} from "./util";

function setupObservers(onPageChange: () => void) {
  window.addEventListener("load", function () {
    // Run it once when page loads
    onPageChange();
  });

  // Notify when the url of the single page app changes
  let previousUrl = "";
  const observer = new MutationObserver(function () {
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      onPageChange();
    }
  });

  observer.observe(document, { subtree: true, childList: true });

  // Firefox doesn't support externally_connectable messaging
  window.addEventListener("message", (event) => {
    if (
      ![
        "https://highseas.hackclub.com",
        "https://high-seas.hackclub.dev",
      ].includes(event.origin)
    )
      return;
    const message = event.data;

    if (
      message &&
      message.id === "storageUpdated" &&
      typeof message.key === "string" &&
      typeof message.value === "string"
    ) {
      sendMessageToWorker(message);
    }
  });

  // Inject script to observe when localstorage is updated
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/storageListener.js");
  script.dataset.id = chrome.runtime.id;
  script.onload = function () {
    (this as HTMLScriptElement).remove();
  };
  (document.head || document.documentElement).appendChild(script);

  // Listen for data updated and reload the scripts
  browser.runtime.onMessage.addListener((message: Message) => {
    switch (message.id) {
      case "injectUpdatedData":
        injectPage();
        break;

      case "null":
        break;

      default:
        console.error("Unknown internal message: ", message);
    }
  });
}

function getLocalStorage(): [string, string][] {
  const pairs: [string, string][] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || key === "setItem") continue;

    pairs.push([key, localStorage[key]]);
  }

  return pairs;
}

async function sendVisitedMessage() {
  const response: Message = await sendMessageToWorker({
    id: "visitedSite",
    localStorage: getLocalStorage(),
  });

  if (response.id === "setFavourites") {
    localStorage.setItem(FAVOURITE_ITEMS_KEY, JSON.stringify(response.value));
  }
}

let shipyardInterval: number | null = null;

async function injectPage() {
  const path = window.location.pathname;
  if (shipyardInterval) {
    clearInterval(shipyardInterval);
    shipyardInterval = 0;
  }

  switch (path) {
    case "/shop": {
      const [currentDoubloons = 0, shopItems, ships] = await Promise.all([
        getCacheItem(EXT_NUM_DOUBLOONS_KEY),
        getShopItemsMap(),
        getCacheItem(EXT_CACHED_SHIPS_KEY),
      ]);

      if (!ships) {
        injectShopWarning();
        return;
      }

      injectShop(currentDoubloons, shopItems ?? new Map(), ships);
      break;
    }

    case "/shipyard": {
      shipyardInterval = null;
      const ships = (await getCacheItem(EXT_CACHED_SHIPS_KEY)) ?? [];
      // If there are no shipped ships, don't do anything
      if (ships.filter((ship) => isShipShipped(ship)).length == 0) return;
      injectShipyard(ships);

      // If its not null, we started a new interval or changed the page
      if (shipyardInterval === null) {
        //@ts-expect-error Extension.js is silly and includes nodejs types
        shipyardInterval = setInterval(() => injectShipyard(ships), 10);
      }

      break;
    }
  }
}

const SHIP_DOUBLOONS_PREFIX = "DJLASER-doubloonsPerHour-shipped-ship-";
function injectDoubloonsPerHour(
  doubloonsElement: HTMLSpanElement,
  shipIdx: number,
  doubloonsPerHour: number,
) {
  const elementId = SHIP_DOUBLOONS_PREFIX + shipIdx;
  if (document.getElementById(elementId)) return;

  const doubloonsPerHourElement = document.createElement("span");
  doubloonsPerHourElement.innerText = `(${doubloonsPerHour} per hour)`;
  doubloonsPerHourElement.id = elementId;

  doubloonsElement.parentElement!.appendChild(doubloonsPerHourElement);
}

const SHIP_ESTIMATED_DOUBLOONS_PREFIX =
  "DJLASER-estimatedDoubloons-shipped-ship-";

function pill(text: string, image: string) {
  return `<span id="" class="inline-flex items-center gap-1 rounded-full px-2 border text-sm leading-none text-gray-600 bg-gray-50 border-gray-500/10 false " data-sentry-component="Pill" data-sentry-source-file="pill.tsx" style="vertical-align: middle;">${image}<span class="inline-block py-1">${text}</span></span>`;
}

function doubloonsPill(text: string) {
  return pill(
    text,
    `<img alt="doubloons" loading="lazy" width="16" height="20" decoding="async" data-nimg="1" src="/_next/static/media/doubloon.fd63888b.svg" style="color: transparent;">`,
  );
}

function timePill(text: string) {
  return pill(
    text,
    `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="clock" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="20" height="20" style="display: inline-block; vertical-align: middle;"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M26 16c0 5.523-4.477 10-10 10S6 21.523 6 16 10.477 6 16 6s10 4.477 10 10zm2 0c0 6.627-5.373 12-12 12S4 22.627 4 16 9.373 4 16 4s12 5.373 12 12z"></path><path d="M15.64 17a1 1 0 0 1-1-1V9a1 1 0 0 1 2 0v7a1 1 0 0 1-1 1z"></path><path d="M21.702 19.502a1 1 0 0 1-1.366.366l-5.196-3a1 1 0 0 1 1-1.732l5.196 3a1 1 0 0 1 .366 1.366z"></path></g></svg>`,
  );
}

const SHIPYARD_STATS_ID = "DJLASER-shipyard-stats";
const SHIPYARD_STATS_CLASSES =
  "rounded-lg bg-card text-card-foreground shadow-sm bg-blend-color-burn flex flex-col gap-2 items-start items-start p-4";

// Returns true if inject was sucessful
function injectStats(ships: ShipData[]): boolean {
  if (document.getElementById(SHIPYARD_STATS_ID)) return true;

  const shipContainerElement = (
    document.getElementById("harbor-tab-scroll-element") as HTMLDivElement
  )?.children[1].children[0].children[1].children[4].children[0];
  if (!shipContainerElement) return false;

  const doubloonsPerProject = getAvgDoubloonsPerProject(ships);
  const hoursPerProject = getAvgHoursPerProject(ships);
  const doubloonsPerHour = getDoubloonsPerHour(ships);
  const doubloonsEarned = getTotalDoubloons(ships);
  const timeSpent = getTotalHours(ships);

  const showAverage = ships.length > 0;

  const statsElement = htmlToNode(
    `<div id="${SHIPYARD_STATS_ID}" class="${SHIPYARD_STATS_CLASSES}">
      <div class="flex flex-wrap items-center gap-3 text-sm">
      <h2 class="text-xl font-semibold text-center">All Time:</h2>
        ${doubloonsPill(`${doubloonsEarned} doubloons earned`)}
        ${timePill(`${truncateTo(timeSpent, 10)} hours shipped`)}
      </div>
      ${
        showAverage
          ? `
      <div class="flex flex-wrap items-center gap-3 text-sm">
        <h2 class="text-xl font-semibold text-center">Average:</h2>
        ${doubloonsPill(`${truncateTo(doubloonsPerHour, 10)} per hour`)}
        ${doubloonsPill(`${truncateTo(doubloonsPerProject, 10)} per project`)}
        ${timePill(`${truncateTo(hoursPerProject, 10)} hours per project`)}
      </div>`
          : ""
      }
    </div>`,
  );

  shipContainerElement.insertBefore(
    statsElement,
    shipContainerElement.children[1],
  );

  return true;
}

// Returns true if inject was sucessful
function injectShipyard(ships: ShipData[]): boolean {
  // If this is on the page, we don't need to re render
  if (
    document.getElementById(SHIP_DOUBLOONS_PREFIX + "0") ||
    document.getElementById(SHIP_ESTIMATED_DOUBLOONS_PREFIX + "0")
  )
    return true;

  const injectSucessful = injectStats(ships);
  if (!injectSucessful) return false;

  const shippedShipElements = document.querySelectorAll(
    "[id^='shipped-ship-']",
  );

  for (const [shipIdx, shipElement] of shippedShipElements.entries()) {
    const shipImage = (
      shipElement.querySelector("div > img") as HTMLImageElement
    ).src;

    const shipTitle = (
      shipElement.querySelectorAll("h2")[1] as HTMLHeadingElement
    ).innerText;

    // Ship doesn't have the data id in the html, so filter based on title and screenshot
    const matchingShips = ships.filter(
      (ship) => ship.title === shipTitle && ship.screenshotUrl === shipImage,
    );

    if (matchingShips.length === 0) {
      console.error(
        `No ships found with title: ${shipTitle} and screenshot: ${shipImage}`,
      );
      continue;
    } else if (matchingShips.length > 1) {
      console.error(
        `Found ${matchingShips.length} ships: ${shipTitle} and screenshot: ${shipImage}`,
      );
      continue;
    }

    const shipData = matchingShips[0];

    const doubloonsElement = shipElement.querySelector(
      "img[alt=doubloons] + span",
    ) as HTMLSpanElement | null;

    if (doubloonsElement && shipData.doubloonsPerHour) {
      injectDoubloonsPerHour(
        doubloonsElement,
        shipIdx,
        truncateTo(shipData.doubloonsPerHour, 10),
      );
    }
  }

  return true;
}

const SHOP_WARNING_ID = "DJLASER-shipsNotFoundWarning";
const SHOP_WARNING_CLASSES =
  "mx-auto px-3 py-2 w-fit rounded-lg bg-card text-card-foreground shadow-sm bg-blend-color-burn flex flex-nowrap items-center gap-3";

// Returns true if inject was sucessful
function injectShopWarning(): boolean {
  if (document.getElementById(SHOP_WARNING_ID)) return true;

  const tabsElement = document.querySelector(`[role="tablist"]`);
  if (!tabsElement) return false;

  const warningElement = htmlToNode(
    `<div id="${SHOP_WARNING_ID}" class="${SHOP_WARNING_CLASSES}">
      <img src="${browser.runtime.getURL("/icons/icon.svg")}" class="w-6 h-6 rounded-sm" />
      <h2 class="w-full text-xl font-semibold">Can't calculate doubloons per hour, please visit the shipyard</h2>
    </div>`,
  );

  tabsElement.nextSibling!.insertBefore(
    warningElement,
    tabsElement.nextSibling!.firstChild,
  );

  return true;
}

// Returns true if inject was sucessful
function injectShop(
  currentDoubloons: number,
  shopItems: Map<string, ShopItem>,
  ships: ShipData[],
): boolean {
  const regionElement = document.getElementById("region-select")
    ?.children[1] as HTMLSelectElement;
  if (!regionElement) return false;

  regionElement.addEventListener("change", injectPage);

  // Region 1 is US, everywhere else uses global prices
  const useUsPrices = regionElement.value === "1";

  const shopElement = document.getElementById("harbor-tab-scroll-element")!;
  const items = shopElement.querySelectorAll("[id^='item_']");

  const doubloonsPerHour = getDoubloonsPerHour(ships);
  if (!isFinite(doubloonsPerHour) || doubloonsPerHour === 0) return true;

  for (const item of items) {
    const itemData = shopItems.get(item.id);
    if (!itemData) continue;

    const itemPrice = useUsPrices ? itemData.priceUs : itemData.priceGlobal;
    if (itemPrice > currentDoubloons) {
      const doubloonsNeeded = itemPrice - currentDoubloons;
      const hoursLeft = doubloonsNeeded / doubloonsPerHour;
      const hoursFormatted =
        hoursLeft < 1 ? truncateTo(hoursLeft, 10) : Math.trunc(hoursLeft);

      const disabledButton = item.children[2].children[0] as HTMLButtonElement;
      disabledButton.innerText = `${hoursFormatted} hours to go`;
    }

    const hoursWorth = truncateTo(itemPrice / doubloonsPerHour, 10);

    const hoursText = item.children[0].children[3]
      .children[1] as HTMLSpanElement;
    hoursText.innerText = `(${hoursWorth} hours worth)`;
  }

  return true;
}

sendVisitedMessage();
setupObservers(
  // on url change
  injectPage,
);
