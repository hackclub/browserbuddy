import {
  sendMessageToAllScripts,
  type Message,
  type NullMessage,
  type SetFavoutitesMessage,
  type VisitedSiteMessage,
} from "./messaging";
import {
  EXT_CACHED_SHIPS_KEY,
  EXT_NUM_DOUBLOONS_KEY,
  EXT_SHOP_ITEMS_KEY,
  FAVOURITE_ITEMS_KEY,
  getCacheItem,
  getFavouriteItems,
  parseShipData,
  setCacheItem,
  syncFavouriteItems,
  type ShopItem,
  type SourceShipData,
  type StorageKey,
  type StorageValue,
} from "./storage";

async function notifyIfCacheUpdated<K extends StorageKey>(
  key: K,
  newData: StorageValue<K>,
) {
  const data = await getCacheItem(key);

  if (data !== newData) {
    setCacheItem(key, newData);
    sendMessageToAllScripts({
      id: "injectUpdatedData",
    });
  }
}

function updateStorage(key: string, value: string) {
  switch (key) {
    case FAVOURITE_ITEMS_KEY: {
      const favouriteItems = JSON.parse(value);
      if (!favouriteItems || !Array.isArray(favouriteItems)) break;

      console.log("Updating synced favourites: ", favouriteItems);
      syncFavouriteItems(favouriteItems);
      break;
    }

    case "cache.personTicketBalance": {
      const numDoubloons = JSON.parse(value)?.value;
      if (!Number.isInteger(numDoubloons)) break;

      console.log("Updating cached doubloons amount: ", numDoubloons);
      notifyIfCacheUpdated(EXT_NUM_DOUBLOONS_KEY, numDoubloons);
      break;
    }

    case "cache.shopItems": {
      const itemData = JSON.parse(value).value;
      if (!itemData || !Array.isArray(itemData)) break;

      const shopItems = (itemData as ShopItem[]).map<ShopItem>((item) => ({
        id: item.id,
        priceUs: item.priceUs,
        priceGlobal: item.priceGlobal,
      }));

      console.log("Updating cached shop items: ", shopItems);
      notifyIfCacheUpdated(EXT_SHOP_ITEMS_KEY, shopItems);
      break;
    }

    case "cache.ships": {
      const shipData: SourceShipData[] = JSON.parse(value).value;
      if (!shipData || !Array.isArray(shipData)) {
        console.log("Ship cache cleared");
        break;
      }

      const ships = parseShipData(shipData);

      console.log("Updating cached ship data: ", ships);
      notifyIfCacheUpdated(EXT_CACHED_SHIPS_KEY, ships);
      break;
    }
  }
}

browser.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    switch (message.id) {
      case "visitedSite": {
        handlevisitedSiteMessage(message).then((message) =>
          sendResponse(message),
        );
        return true;
      }

      case "storageUpdated":
        updateStorage(message.key, message.value);
        break;

      case "null":
        break;

      default:
        console.error("Unknown internal message: ", message);
    }
  },
);

browser.runtime.onMessageExternal.addListener((message: Message) => {
  switch (message.id) {
    case "storageUpdated":
      updateStorage(message.key, message.value);
      break;

    case "null":
      break;

    default:
      console.error("Unknown external message: ", message);
  }
});

async function handlevisitedSiteMessage(
  message: VisitedSiteMessage,
): Promise<SetFavoutitesMessage | NullMessage> {
  const cachedFavourites = await getFavouriteItems();

  for (const [key, value] of message.localStorage) {
    if (key === FAVOURITE_ITEMS_KEY && cachedFavourites) {
      // Don't set synced favourites to this, it might be outdated
      continue;
    }

    updateStorage(key, value);
  }

  const syncedFavourites = await getFavouriteItems();
  if (!syncedFavourites) return { id: "null" };

  console.log("Setting local favourites to synced value: ", syncedFavourites);
  return {
    id: "setFavourites",
    value: syncedFavourites,
  };
}
