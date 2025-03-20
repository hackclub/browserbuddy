export * as definitions from "./definitions.mjs";
export * as materials from "./materials.mjs";
export * as profiles from "./profiles.mjs";
export * as containers from "./containers.mjs";
export * as formatter from "./formatter.mjs";

import { ContainerStackGroup } from "./containers.mjs";

export let active_containers = null;
export function load_container(printer_id) {
  active_containers = new ContainerStackGroup(printer_id);
}
