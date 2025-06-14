/**
 * Listeners for actions (eg. slice button, file input, etc)
 */
import { export_stl, models } from "./viewer/model_viewer.mjs";
import { CuraEngine } from "../engine/index.mjs";
import { rpc_callbacks } from "../engine/handler.mjs";

import { sleep } from "./index.mjs";
import { sections } from "./sidebar.mjs";
import { update_sections, update_values } from "./settings.mjs";
import { load_file, save_file } from "./file.mjs";
import { active_containers } from "../settings/index.mjs";
import { format_gcode } from "../settings/formatter.mjs";

import { notify } from "./notifications.mjs";
import { stl_file_name } from "./file.mjs";

const drop_zone = document.getElementById("drop-zone");

const slice_button = document.getElementById("slice-button");
const cancel_button = document.getElementById("cancel-button");
const export_gcode_button = document.getElementById("export-gcode-button");
const file_input = document.getElementById("stl-file");

export const slice_button_div = document.getElementById("slice-button-container");
export const slice_progress_div = document.getElementById("slice-progress-container");
export const slice_export_div = document.getElementById("slice-export-container");

const slice_progress_bar = document.getElementById("slice-progress-bar");
const gcode_time_estimate = document.getElementById("gcode-time-estimate");
const material_estimate = document.getElementById("material-estimate");

export const cura_engine = new CuraEngine();
let exported_gcode = null;

export function set_active_state(active_div) {
  for (let div of [slice_button_div, slice_progress_div, slice_export_div])
    div.dataset.active = false;
  active_div.dataset.active = true;
}

export function clear_slice_state() {
  set_active_state(slice_button_div);
  if (cura_engine.active)
    cura_engine.cancel();
}

export function update_all(extruder_stack) {
  update_values(sections, extruder_stack);
  update_sections(sections, extruder_stack);
  clear_slice_state();
}

// ---- Slice
slice_button.addEventListener("click", async () => {
  if (Object.keys(models).length === 0) {
    notify("No STLs to Slice", "Please add one or more STL files to slice");
    return;
  }

  // we should move this to a function in a file called `slicer.mjs` or something like that

  exported_gcode = null;
  slice_progress_bar.style.width = "0%";
  gcode_time_estimate.innerText = "No Time Estimation";
  set_active_state(slice_progress_div);

  let settings = active_containers.export_settings();
  settings["/tmp/input/model.stl"] = {
    extruder_nr: "0"
  };

  settings["global"]["machine_start_gcode"] = format_gcode(settings["global"]["machine_start_gcode"]);
  settings["global"]["machine_end_gcode"] = format_gcode(settings["global"]["machine_end_gcode"]);

  console.log("Starting slice with settings:", settings);
  let gcode_header = "";
  rpc_callbacks.gcode_header = (header) => {
    gcode_header = header;
  };

  let stl = export_stl().buffer;
  let gcode_bytes = await cura_engine.slice({
    stl: stl,
    settings: settings
  });
  exported_gcode = new TextDecoder().decode(gcode_bytes);
  exported_gcode = gcode_header + "\n\n" + exported_gcode;

  await sleep(250);
  set_active_state(slice_export_div);
});
cancel_button.addEventListener("click", () => {
  cura_engine.cancel();
  set_active_state(slice_button_div);
});
export_gcode_button.addEventListener("click", () => {
  let stl_name = stl_file_name.replace(".", "_");
  let printer_name = active_containers.printer_id;
  let gcode_name = `${printer_name}_${stl_name}.gcode`;

  save_file(exported_gcode, gcode_name, "text/plain");
});

rpc_callbacks.progress = (progress) => {
  slice_progress_bar.style.width = `${progress * 100}%`;
};
rpc_callbacks.slice_info = (info) => {
  //time estimate
  let seconds = 0;
  for (let time of Object.values(info.time_estimates))
    seconds += time;

  let minutes = Math.floor(seconds / 60) % 60;
  let hours = Math.floor(seconds / 3600);
  let minutes_str = minutes === 1 ? "minute" : "minutes";
  let hours_str = hours === 1 ? "hour" : "hours";
  if (hours === 0)
    gcode_time_estimate.innerText = `${minutes} ${minutes_str}`;
  else
    gcode_time_estimate.innerText = `${hours} ${hours_str} ${minutes} ${minutes_str}`;

  //material estimate
  let total_length = 0;
  let total_mass = 0;
  for (let [extruder_id, material_volume] of Object.entries(info.material_estimates)) {
    let extruder_stack = active_containers.containers.extruders[extruder_id];
    let active_material = extruder_stack.active_profiles.material;
    let material_density = parseFloat(active_material.metadata.info.properties.density);

    let material_diameter = extruder_stack.resolve_setting("material_diameter");
    let material_cross_section = Math.PI * Math.pow(material_diameter / 2, 2);
    let volume_cubic_cm = material_volume / 1000;
    total_length += (material_volume / material_cross_section) / 1000;
    total_mass += material_density * volume_cubic_cm;
  }
  material_estimate.innerText = `${Math.round(total_mass)}g \u2022 ${total_length.toFixed(2)}m`;
};

// ---- File imports
file_input.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file)
    load_file(file);
});

//listeners for file drop
window.addEventListener("dragover", (event) => {
  event.preventDefault();
  drop_zone.style.display = "flex";
});

drop_zone.addEventListener("dragleave", (event) => {
  event.preventDefault();
  drop_zone.style.display = "none";
});

drop_zone.addEventListener("drop", (event) => {
  event.preventDefault();
  drop_zone.style.display = "none";

  const file = event.dataTransfer.files[0];

  if (file) {
    if (["stl", "3mf"].includes(file.name.split(".").pop()))
      load_file(file);
  }
});

set_active_state(slice_button_div);
