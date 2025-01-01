/// <reference types="svelte" />
declare global {
  const figma: PluginAPI;
  interface Window {
    figma: PluginAPI;
  }
}

export {};
