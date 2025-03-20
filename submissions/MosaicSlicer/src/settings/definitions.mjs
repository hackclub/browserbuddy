import { get_json } from "../resources.mjs";

//module for resolving printer/extruder definitions, and their associated settings

//https://stackoverflow.com/a/34749873/21330993
function is_object(item) {
  return (item && typeof item === "object" && !Array.isArray(item));
}
export function merge_deep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (is_object(target) && is_object(source)) {
    for (const key in source) {
      if (is_object(source[key])) {
        if (!target[key]) Object.assign(target, {[key]: {}});
        merge_deep(target[key], source[key]);
      }
      else {
        Object.assign(target, {[key]: source[key]});
      }
    }
  }

  return merge_deep(target, ...sources);
}

function resolve_printer(printer_id, inheritance = []) {
  let printer = get_json(`definitions/${printer_id}.def.json`);
  inheritance.push(printer_id);
  if (printer.inherits)
    return merge_deep(resolve_printer(printer.inherits, inheritance), printer);
  else
    return printer;
}

function resolve_extruder(extruder_id, inheritance = []) {
  let extruder = get_json(`extruders/${extruder_id}.def.json`);
  inheritance.push(extruder_id);
  if (!extruder)
    extruder = get_json(`definitions/${extruder_id}.def.json`);
  if (extruder.inherits)
    return merge_deep(resolve_extruder(extruder.inherits, inheritance), extruder);
  else
    return extruder;
}

export function resolve_definitions(printer_id) {
  let printer_inheritance = [];
  let printer = resolve_printer(printer_id, printer_inheritance);
  printer.inheritance_chain = printer_inheritance;

  let extruder_data = printer.metadata.machine_extruder_trains;
  let extruders = {};
  for (let [extuder_num, extruder_id] of Object.entries(extruder_data)) {
    let extruder_inheritance = [];
    extruders[extuder_num] = resolve_extruder(extruder_id, extruder_inheritance);
    extruders[extuder_num].inheritance_chain = extruder_inheritance;
  }

  return {
    printer: printer,
    extruders: extruders
  };
}

export function resolve_settings(overrides, settings, resolved = {}) {
  for (let [id, setting] of Object.entries(settings)) {
    setting.id = id;
    if (setting.type !== "category") {
      if (typeof overrides[id] === "object")
        resolved[id] = merge_deep(setting, overrides[id]);
      else
        resolved[id] = setting;
    }
    if (setting.children)
      resolve_settings(overrides, setting.children, resolved);
  }

  return resolved;
}

export function resolve_machine_settings(printer_id) {
  let {printer, extruders} = resolve_definitions(printer_id);
  let printer_settings = resolve_settings(printer.overrides, printer.settings);
  let extuder_settings = {};
  for (let [id, extuder] of Object.entries(extruders))
    extuder_settings[id] = resolve_settings(extuder.overrides, extuder.settings);

  return {
    printer: printer_settings,
    extruders: extuder_settings
  };
}
