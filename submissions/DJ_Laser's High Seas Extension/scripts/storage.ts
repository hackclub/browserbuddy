export const FAVOURITE_ITEMS_KEY = "favouriteItems" as const;
export const EXT_SHOP_ITEMS_KEY = "shopItems" as const;
export const EXT_NUM_DOUBLOONS_KEY = "numDoubloons" as const;
export const EXT_CACHED_SHIPS_KEY = "cachedShips" as const;

type StorageKeymap = {
  [FAVOURITE_ITEMS_KEY]: string[];
  [EXT_SHOP_ITEMS_KEY]: ShopItem[];
  [EXT_NUM_DOUBLOONS_KEY]: number;
  [EXT_CACHED_SHIPS_KEY]: ShipData[];
};

export type StorageKey = {
  [T in keyof StorageKeymap]: T;
}[keyof StorageKeymap];

export type StorageValue<K extends StorageKey> = StorageKeymap[K];

export async function getStorageItem<K extends StorageKey>(
  key: K,
  storage: browser.storage.StorageArea,
): Promise<StorageValue<K> | undefined> {
  return (await storage.get(key))[key];
}

export async function setStorageItem<K extends StorageKey>(
  key: K,
  value: StorageValue<K>,
  storage: browser.storage.StorageArea,
): Promise<void> {
  await storage.set({
    [key]: value,
  });
}

export async function getCacheItem<K extends StorageKey>(
  key: K,
): Promise<StorageValue<K> | undefined> {
  return await getStorageItem(key, browser.storage.local);
}

export async function setCacheItem<K extends StorageKey>(
  key: K,
  value: StorageValue<K>,
): Promise<void> {
  await setStorageItem(key, value, browser.storage.local);
}

export async function getFavouriteItems(): Promise<string[] | undefined> {
  return await getStorageItem(FAVOURITE_ITEMS_KEY, browser.storage.sync);
}

export async function syncFavouriteItems(
  favouriteItems: string[],
): Promise<void> {
  await setStorageItem(
    FAVOURITE_ITEMS_KEY,
    favouriteItems,
    browser.storage.sync,
  );
}

export interface ShopItem {
  id: string;
  priceUs: number;
  priceGlobal: number;
}

export async function getShopItemsMap(): Promise<
  Map<string, ShopItem> | undefined
> {
  const items = await getCacheItem(EXT_SHOP_ITEMS_KEY);
  if (!items) return undefined;

  return new Map(items.map((item) => [item.id, item]));
}

type ShipStatus = "shipped" | "staged";

export interface SourceShipData {
  id: string;
  title: string;
  credited_hours: number;
  total_hours: number;
  paidOut: boolean;
  doubloonPayout: number | undefined;
  shipStatus: ShipStatus;
  reshippedFromId: string | null;
  reshippedToId: string | null;
  screenshotUrl: string;
  deploymentUrl: string;
  repoUrl: string;
}

interface ShipUpdate {
  id: string;
  credited_hours: number;
  shipStatus: ShipStatus;
  doubloonPayout: number;
  paidOut: boolean;
}

export interface ShipData {
  title: string;
  // The hours spent to get `totalDoubloons` (only includes paid out updates)
  // used for calculating doubloons per hour
  paidHours: number;
  totalDoubloons: number;
  // Null for non paid out initial ships or those that have 0 hours somehow
  doubloonsPerHour: number | null;
  screenshotUrl: string;
  deploymentUrl: string;
  repoUrl: string;
  updates: ShipUpdate[];
}

export function parseShipData(sourceData: SourceShipData[]): ShipData[] {
  const sourceMap = new Map<string, SourceShipData>();
  for (const ship of sourceData) {
    sourceMap.set(ship.id, ship);
  }

  const ships: ShipData[] = [];
  for (const ship of sourceMap.values()) {
    // This is an update to a previous ship
    if (ship.reshippedFromId !== null) continue;

    const shipUpdates: ShipUpdate[] = [];
    let currentShip = ship;
    while (true) {
      shipUpdates.push({
        id: currentShip.id,
        credited_hours: currentShip.credited_hours,
        shipStatus: currentShip.shipStatus,
        doubloonPayout: currentShip.doubloonPayout ?? 0,
        paidOut: currentShip.paidOut,
      });

      // This is the latest ship in the update chain, use it to get the mian ship values
      if (!currentShip.reshippedToId) break;
      const maybeShip = sourceMap.get(currentShip.reshippedToId);

      if (!maybeShip) {
        console.error(
          `Could not find ship id ${currentShip.reshippedToId}, required by ship ${currentShip.id}`,
        );
        // This is the latest ship in the chain before lookup failed, so use this one
        break;
      } else {
        currentShip = maybeShip;
      }
    }

    const totalDoubloons = shipUpdates.reduce<number>(
      (total, ship) => total + ship.doubloonPayout,
      0,
    );

    const paidHours = shipUpdates.reduce<number>(
      (total, ship) => total + (ship.paidOut ? ship.credited_hours : 0),
      0,
    );

    const doubloonsPerHour =
      totalDoubloons > 0 && paidHours > 0 ? totalDoubloons / paidHours : null;

    ships.push({
      title: currentShip.title,
      paidHours,
      totalDoubloons,
      doubloonsPerHour,
      screenshotUrl: currentShip.screenshotUrl,
      deploymentUrl: currentShip.deploymentUrl,
      repoUrl: currentShip.repoUrl,
      updates: shipUpdates,
    });
  }

  return ships;
}
