import { writable } from "svelte/store";
import type { StorageItemKey } from "wxt/storage";

// In theory, it should be possible to remove the storageItem.watch call
// and only listen to changes in the svelte store,
// but then the changes don't propagate from popup to content/background.
// Improvements welcome!
function createStore<T>(value: T, storageKey: StorageItemKey) {
  const { subscribe, set } = writable<T | null>(null);

  const storageItem = storage.defineItem<T>(storageKey, {
    fallback: value,
  });

  storageItem.getValue().then(set);

  storageItem.watch(set);

  return {
    subscribe,
    set: (value: T) => {
      storageItem.setValue(value);
    },
  };
}

export const wakaApiKey = createStore("", "local:apiKey");
export const figmaApiKey = createStore("", "local:figmaApiKey");
export const apiUrl = createStore(
  "https://api.wakatime.com/api/v1",
  "local:apiUrl"
);
