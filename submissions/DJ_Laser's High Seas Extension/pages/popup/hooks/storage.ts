import { use, useCallback, useEffect, useState } from "react";
import { type StorageKey, type StorageValue } from "../../../scripts/storage";

type StorageAreaName = "local" | "sync";
type StorageCache = {
  [K in StorageAreaName]: Promise<{
    [L in StorageKey]: StorageValue<L> | undefined;
  }>;
};

type StorageChange = {
  [K in StorageKey]?: {
    oldValue: StorageValue<K> | undefined;
    newValue: StorageValue<K> | undefined;
  };
};

const storageItems: StorageCache = {
  local: browser.storage.local.get(null),
  sync: browser.storage.sync.get(null),
} as StorageCache;

function useStorageItem<K extends StorageKey>(
  key: K,
  areaName: StorageAreaName,
): StorageValue<K> | undefined {
  const initial = use(storageItems[areaName])[key];
  const [current, setCurrent] = useState(initial);

  const storageListener = useCallback(
    (changes: StorageChange) => {
      if (changes[key]) setCurrent(changes[key].newValue);
    },
    [key],
  );

  useEffect(() => {
    const storage = browser.storage[areaName];
    storage.onChanged.addListener(storageListener);

    return () => storage.onChanged.removeListener(storageListener);
  }, [storageListener, areaName]);

  return current;
}

export function useCacheItem<K extends StorageKey>(
  key: K,
): StorageValue<K> | undefined {
  return useStorageItem(key, "local");
}

export function useSyncItem<K extends StorageKey>(
  key: K,
): StorageValue<K> | undefined {
  return useStorageItem(key, "sync");
}
