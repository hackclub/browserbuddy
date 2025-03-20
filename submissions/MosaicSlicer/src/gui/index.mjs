import "/styles/index.scss";

export * as actions from "./actions.mjs";
export * as file from "./file.mjs";
export * as icons from "./icons.mjs";
export * as notifications from "./notifications.mjs";
export * as options from "./options.mjs";
export * as search from "./search.mjs";
export * as settings from "./settings.mjs";
export * as sidebar from "./sidebar.mjs";
export * as tabs from "./tabs.mjs";
export * as viewer from "./viewer/viewer.mjs";

import { check_for_stl } from "./file.mjs";
import { load_sidebar } from "./sidebar.mjs";
import { start_model_viewer } from "./viewer/model_viewer.mjs";

import { load_options } from "./options.mjs";

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function start_gui() {
  load_sidebar();
  load_options();
  start_model_viewer();

  //hardcoded sleeps are bad practice usually,
  //but in this case there are some layout shifts with the three.js canvas that need to be hidden
  await sleep(100);
  document.getElementById("loading").style.animation = "blur-out 0.25s";
  await sleep(250);
  document.getElementById("loading").style.display = "none";

  check_for_stl();
}

DocumentFragment.prototype.get_slot = function(slot_name) {
  return this.querySelector(`[slot='${slot_name}']`);
};
