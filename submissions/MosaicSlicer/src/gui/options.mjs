/**
 * Options bar
 */

import { active_containers } from "../settings/index.mjs";
import { update_all } from "./actions.mjs";

const printer_button = document.getElementById("printer-button");
const printer_name = document.getElementById("printer-name");
const printers_dropdown = document.getElementById("printers-dropdown");
const printers_list = document.getElementById("printers-list");
const printer_item_template = document.getElementById("printer-item-template");

const extruders_button = document.getElementById("extruders-button");
const filament_name = document.getElementById("filament-name");
const nozzle_name = document.getElementById("nozzle-name");
const extruders_dropdown = document.getElementById("extruders-dropdown");
const material_brand_select = document.getElementById("material-brand-select");
const material_select = document.getElementById("material-select");
const nozzle_select = document.getElementById("nozzle-select");

export function update_options_text() {
  printer_button.dataset.printer_id = active_containers.printer_id;
  printer_name.innerText = active_containers.definitions.printer.name;

  let extruder_stack = app.settings.active_containers.containers.extruders[0];
  let material_info = extruder_stack.active_profiles.material.metadata.info;
  let material_name = `${material_info.brand} ${material_info.name}`;
  filament_name.innerText = material_name;

  let variant_profile = extruder_stack.active_profiles.variant;
  if (variant_profile)
    nozzle_name.innerHTML = variant_profile.general.name;
}

export function populate_material_dropdowns() {
  let extruder_stack = app.settings.active_containers.containers.extruders[0];
  let material_info = extruder_stack.active_profiles.material.metadata.info;
  let materials = {};
  for (let material of Object.values(extruder_stack.available_materials())) {
    if (typeof materials[material.brand] === "undefined")
      materials[material.brand] = [];
    materials[material.brand].push(material);
  }

  //make sure generic filaments are at the top
  let brands = Object.keys(materials).sort();
  brands.unshift(brands.splice(brands.indexOf("Generic"), 1)[0]);

  if (!material_brand_select.value) {
    for (let brand of brands) {
      let option = document.createElement("option");
      option.value = brand;
      option.innerText = brand;
      material_brand_select.append(option);
    }
    material_brand_select.value = material_info.brand;
  }

  if (!material_select.value) {
    let selected_brand = material_brand_select.value;
    let materials_list = Object.values(materials[selected_brand]).sort(
      (a, b) => a.name.localeCompare(b.name)
    );
    material_select.replaceChildren();
    for (let material of materials_list) {
      let option = document.createElement("option");
      option.value = material.id;
      option.innerText = material.name;
      material_select.append(option);
      if (material.id === material_info.id)
        material_select.value = material_info.id;
    }
  }
}

export function populate_nozzle_dropdowns() {
  let extruder_stack = app.settings.active_containers.containers.extruders[0];
  let variants = Object.values(extruder_stack.available_variants());
  variants = variants.sort((a, b) => a.general.name.localeCompare(b.general.name));

  for (let variant of variants) {
    let option = document.createElement("option");
    option.value = variant.id;
    option.innerText = variant.general.name;
    nozzle_select.append(option);
  }
  nozzle_select.value = extruder_stack.active_profiles.variant.id;
}

export function load_options() {
  //hide dropdowns
  printers_dropdown.dataset.hidden = true;
  extruders_dropdown.dataset.hidden = true;

  update_options_text();
  populate_material_dropdowns();
  populate_nozzle_dropdowns();
}

printer_button.onclick = () => {
  printers_dropdown.dataset.hidden = printers_dropdown.dataset.hidden === "false";
};
extruders_button.onclick = () => {
  extruders_dropdown.dataset.hidden = extruders_dropdown.dataset.hidden === "false";
};

nozzle_select.onchange = () => {
  let extruder_stack = app.settings.active_containers.containers.extruders[0];
  extruder_stack.set_variant(nozzle_select.value);
  update_all(extruder_stack);
  update_options_text();
};

material_brand_select.onchange = () => {
  material_select.value = null;
  populate_material_dropdowns();
  material_select.value = null;
};

material_select.onchange = () => {
  let extruder_stack = app.settings.active_containers.containers.extruders[0];
  extruder_stack.set_material(material_select.value);
  update_all(extruder_stack);
  update_options_text();
};
