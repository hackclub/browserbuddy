import { active_containers } from "../settings/index.mjs";
import Fuse from "fuse.js";

export const fuse = new Fuse([], {
  keys: ["label"],
  threshold: 0.25
});

const search_input = document.getElementById("setting-search");

function show_all_settings() {
  let setting_elements = sections.querySelectorAll("div[data-setting_id]");
  let section_elements = sections.getElementsByClassName("section");
  for (let i = 0; i < setting_elements.length; i++) {
    let setting_div = setting_elements[i];
    setting_div.dataset.should_show = true;
  }
  for (let i = 0; i < section_elements.length; i++) {
    let section_div = section_elements[i];
    section_div.dataset.closed = section_div.dataset.was_closed;
    section_div.dataset.should_show = true;
    delete section_div.dataset.was_closed;
  }
}

function filter_settings(query) {
  if (query === "") {
    show_all_settings();
    return;
  }

  let container_stack = active_containers.containers.global;
  let results = fuse.search(query);
  let result_categories = new Set();
  let result_ids = [];

  for (let result of results) {
    let setting = result.item;
    let setting_category = container_stack.setting_categories[setting.id];
    result_categories.add(setting_category);
    result_ids.push(setting.id);
  }

  let setting_elements = sections.querySelectorAll("div[data-setting_id]");
  let section_elements = sections.getElementsByClassName("section");

  for (let i = 0; i < setting_elements.length; i++) {
    let setting_div = setting_elements[i];
    setting_div.dataset.should_show = false;
  }
  for (let setting_id of result_ids) {
    let setting_div = sections.querySelector(`div[data-setting_id="${setting_id}"]`);
    while (!setting_div.classList.contains("settings-group")) {
      setting_div.dataset.should_show = true;
      setting_div = setting_div.parentElement;
    }
  }

  for (let i = 0; i < section_elements.length; i++) {
    let section_div = section_elements[i];
    let category_id = section_div.dataset.category_id;
    if (!section_div.dataset.was_closed)
      section_div.dataset.was_closed = section_div.dataset.closed === "true";

    let children_showing = !!section_div.querySelector(`div[data-is_enabled="true"][data-should_show="true"]`);
    let should_show = result_categories.has(category_id) && children_showing;

    section_div.dataset.closed = !should_show;
    section_div.dataset.should_show = should_show;
  }
}
search_input.addEventListener("input", () => {
  filter_settings(search_input.value);
});
