import { clean_globals, eval_py, PythonNameError, setup_ctx } from "../python.mjs";
import { merge_deep, resolve_definitions, resolve_settings } from "./definitions.mjs";
import { get_material_type, material_to_profile, parsed_materials } from "./materials.mjs";
import { filter_profiles, resolve_profiles } from "./profiles.mjs";

//classes for "container stacks" that represent the inheritance of profiles
//https://github.com/Ultimaker/Cura/wiki/Container-Stacks

export class ContainerStack {
  constructor(name, defintion, parent) {
    this.name = name;
    this.definition = defintion;
    this.parent = parent;
    this.parent_meta = this.parent.definitions.printer.metadata;
    this.type = this.definition.metadata.type;

    this.profile_order = ["user", "custom", "intent", "quality", "material", "variant"];
    this.active_profiles = {
      user: {values: {}},
      custom: null,
      intent: null,
      quality: null,
      material: null,
      variant: null
    };
    this.filters = {
      material: undefined,
      variant: undefined,
      quality_type: undefined
    };
    this.bound_py_funcs = {
      extruderValues: this.py_extruderValues.bind(this),
      extruderValue: this.py_extruderValue.bind(this),
      anyExtruderWithMaterial: this.py_anyExtruderWithMaterial.bind(this),
      anyExtruderNrWithOrDefault: this.py_anyExtruderNrWithOrDefault.bind(this),
      resolveOrValue: this.py_resolveOrValue.bind(this),
      defaultExtruderPosition: this.py_defaultExtruderPosition.bind(this),
      valueFromContainer: this.py_valueFromContainer.bind(this),
      valueFromExtruderContainer: this.py_valueFromExtruderContainer.bind(this)
    };
    this.setup_py_api();

    this.cache = new Map();
    this.settings = resolve_settings(this.definition.overrides, this.definition.settings);
    this.setting_categories = this.find_categories();
    this.materials = this.available_materials();
    this.profiles = this.available_profiles();
  }

  //clear memoization cache and python variables
  clear_cache() {
    this.cache.clear();
    clean_globals(this.name);
  }

  //memoization to improve performance
  resolve_setting(setting_id, call_resolve = true, ctx = null) {
    if (ctx === null)
      ctx = this.name;
    let key = `${setting_id},${call_resolve},${ctx}`;
    if (this.cache.has(key))
      return this.cache.get(key);
    let ret = this._resolve_setting(setting_id, call_resolve, ctx);
    this.cache.set(key, ret);
    return ret;
  }
  _resolve_setting(setting_id, call_resolve, ctx, profile_num = 0) {
    let setting = this.settings[setting_id];
    if (typeof setting !== "undefined" && setting.resolve && call_resolve)
      return this.resolve_py_expression(setting.resolve, call_resolve, ctx);

    //we've run out of profiles to check on this container stack
    if (profile_num === this.profile_order.length) {
      //check the setting definitions first
      if (typeof setting !== "undefined") {
        let value = setting.value ?? setting.default_value;
        if (typeof value !== "undefined")
          return this.resolve_value(value, setting, call_resolve, ctx);
      }
      //otherwise check the global stack
      if (this.type === "machine")
        throw new ReferenceError("setting value not set: " + setting_id);
      return this.parent.containers.global.resolve_setting(setting_id, call_resolve, ctx);
    }

    let profile_type = this.profile_order[profile_num];
    let profile = this.active_profiles[profile_type];
    if (profile == null || profile.values[setting_id] == null)
      return this._resolve_setting(setting_id, call_resolve, ctx, profile_num + 1);

    setting = this.resolve_setting_definition(setting_id);
    return this.resolve_value(profile.values[setting_id], setting, call_resolve, ctx);
  }
  resolve_setting_definition(setting_id) {
    let setting = this.settings[setting_id];
    if (typeof setting !== "undefined")
      return setting;
    setting = this.parent.containers.global.settings[setting_id];
    if (typeof setting !== "undefined")
      return setting;
    throw TypeError(`setting ${setting_id} not found`);
  }
  resolve_extruder_num(extruder, call_resolve, ctx) {
    while (!is_int(extruder))
      extruder = this.resolve_py_expression(extruder, call_resolve, ctx);
    if (extruder == "-1")
      extruder = this.py_defaultExtruderPosition();
    return extruder;
  }
  resolve_value(value, setting, call_resolve, ctx) {
    if (typeof value === "string") {
      //explicit python expressions
      if (value.startsWith("="))
        return this.resolve_py_expression(value.substring(1), call_resolve, ctx);
      //array types
      if (setting.type[0] === "[" && setting.type.at(-1) === "]")
        return this.resolve_py_expression(value, call_resolve, ctx);
      //unexpected string in these types
      if (["float", "int", "bool"].includes(setting.type))
        return this.resolve_py_expression(value, call_resolve, ctx);
      //unresolved extruder number expression
      if (["extruder", "optional_extruder"].includes(setting.type) && !is_int(value))
        return this.resolve_extruder_num(value, call_resolve, ctx);
      //unexpected enum value
      if (setting.type === "enum" && !Object.keys(setting.options).includes(value))
        return this.resolve_py_expression(value, call_resolve, ctx);
    }
    return value;
  }
  resolve_py_expression(expression, call_resolve, ctx) {
    //check if the expression is a constant
    if (is_num(expression))
      return parseFloat(expression);
    if (expression === "True")
      return true;
    if (expression === "False")
      return false;
    //check if the expression is just a single variable
    let selected_stack = this.parent.containers[ctx] || this.parent.containers.extruders[ctx];
    if (is_var(expression))
      return selected_stack.resolve_setting(expression, call_resolve);

    let vars = {};
    while (true) {
      try {
        return eval_py(expression, ctx, vars);
      }
      catch (py_error) {
        if (!(py_error instanceof PythonNameError))
          throw py_error;
        vars = {};
        vars[py_error.var_name] = selected_stack.resolve_setting(py_error.var_name, call_resolve, ctx);
      }
    }
  }

  //these functions are called from the python formulas
  setup_py_api() {
    setup_ctx(this.name, this.bound_py_funcs);
  }
  py_extruderValues(key) {
    let ret = [];
    for (let extruder_stack of Object.values(this.parent.containers.extruders))
      ret.push(extruder_stack.resolve_setting(key, false));
    return ret;
  }
  py_extruderValue(extruder, key) {
    extruder = this.resolve_extruder_num(extruder, false);
    let extruder_stack = this.parent.containers.extruders[extruder];
    if (typeof extruder_stack === "undefined")
      return null;
    return extruder_stack.resolve_setting(key, false);
  }
  py_anyExtruderWithMaterial(filter = null) {
    for (let [extruder_num, extruder_stack] of Object.entries(this.parent.containers.extruders)) {
      if (filter == null)
        return extruder_num;
      if (extruder_stack.resolve_setting(filter, false))
        return extruder_num;
    }
    return this.py_defaultExtruderPosition();
  }
  py_anyExtruderNrWithOrDefault(filter = null) {
    return this.py_anyExtruderWithMaterial(filter);
  }
  py_resolveOrValue(key) {
    return this.parent.containers.global.resolve_setting(key);
  }
  py_defaultExtruderPosition() {
    //the behavior of this is not correct
    return "0";
  }
  py_valueFromContainer(key, index) {
    return this.parent.containers.global._resolve_setting(key, true, "global", index);
  }
  py_valueFromExtruderContainer(extruder, key, index) {
    extruder = this.resolve_extruder_num(extruder, false);
    let extruder_stack = this.parent.containers.extruders[extruder];
    if (typeof extruder_stack === "undefined")
      return null;
    return extruder_stack._resolve_setting(key, true, extruder_stack.name, index);
  }

  is_setting_enabled(setting_id) {
    let setting = this.resolve_setting_definition(setting_id);
    if (typeof setting.enabled === "undefined")
      return true;
    if (typeof setting.enabled === "boolean")
      return setting.enabled;
    return this.resolve_py_expression(setting.enabled, true, this.name);
  }

  set_material(material_id = null) {
    if (this.type === "machine")
      throw TypeError("material profile not allowed on global container");
    let material = this.materials[material_id];
    if (!material_id)
      material = this.preferred_material();
    this.filters.material = material.id.replace("_175", "");
    this.active_profiles.material = material_to_profile(material, this.parent.printer_id);
  }
  set_quality(quality_id = null) {
    let quality = this.profiles.quality[quality_id];
    if (!quality_id)
      quality = this.preferred_quality();
    this.active_profiles.quality = quality;
    if (quality)
      this.filters.quality_type = quality.metadata.quality_type;
    else
      this.filters.quality_type = null;
  }
  set_variant(variant_id = null) {
    let variant = this.profiles.variant[variant_id];
    if (!variant_id)
      variant = this.preferred_variant();
    this.active_profiles.variant = variant;
    if (variant)
      this.filters.variant = variant.general.name;
    else
      this.filters.variant = null;
  }

  available_materials() {
    let excluded_materials = this.parent_meta.exclude_materials;
    let approx_diameter = Math.round(this.resolve_setting("material_diameter") || 1.75);
    let available_materials = {};
    for (let [material_name, material] of Object.entries(parsed_materials)) {
      let material_base_name = material_name.split("_175")[0];
      if (excluded_materials.includes(material_base_name))
        continue;
      if (material.approximate_diameter != approx_diameter)
        continue;
      available_materials[material_name] = material;
    }
    return available_materials;
  }
  available_qualities() {
    let qualities = this.available_profiles().quality;
    return filter_profiles(qualities, {
      material: this.filters.material,
      variant: this.filters.variant
    });
  }
  available_variants() {
    let variants = this.available_profiles().variant;
    return filter_profiles(variants, {
      material: this.filters.material,
      quality_type: this.filters.quality_type
    });
  }
  resolve_profile_inheritance(profiles, key_1, key_2) {
    let resolved = {};
    for (let profile of Object.values(profiles)) {
      let meta_value = profile[key_1][key_2];
      if (!resolved[meta_value])
        resolved[meta_value] = {};
      resolved[meta_value] = merge_deep(resolved[meta_value], profile);
    }
    return resolved;
  }

  preferred_material() {
    let preferred = this.parent.preferred.material;
    for (let [material_id, material] of Object.entries(this.materials)) {
      if (material_id.startsWith(preferred))
        return material;
    }
    for (let material of Object.values(this.materials)) {
      let type = get_material_type(material);
      if (type === preferred)
        return material;
    }
    return this.materials[0];
  }
  preferred_quality() {
    let preferred_type = this.parent.preferred.quality_type;
    let qualities = Object.values(this.available_qualities());
    for (let quality of qualities) {
      if (quality.metadata.quality_type === preferred_type)
        return quality;
    }
    return null;
  }
  preferred_variant() {
    let preferred_name = this.parent.preferred.variant;
    let variants = Object.values(this.available_variants());
    for (let variant of variants) {
      if (variant.metadata.hardware_type === "nozzle" && this.type === "machine")
        continue;
      if (variant.general.name === preferred_name)
        return variant;
    }
    return null;
  }

  set_preferred_profiles() {
    if (this.type !== "machine")
      this.set_material();
    this.set_variant();
    this.set_quality();
  }

  available_profiles() {
    let profiles = {};
    let definitions = [
      this.parent.definitions.printer,
      ...Object.values(this.parent.definitions.extruders)
    ];
    for (let definition of definitions)
      profiles = merge_deep(profiles, resolve_profiles(definition));
    return profiles;
  }

  find_categories(category_map = {}, settings = null, category_id = null) {
    if (settings == null)
      settings = this.definition.settings;
    for (let [setting_id, setting] of Object.entries(settings)) {
      if (setting.type === "category") {
        this.find_categories(category_map, setting.children, setting_id);
        continue;
      }
      if (setting.children)
        this.find_categories(category_map, setting.children, category_id);
      category_map[setting_id] = category_id;
    }
    return category_map;
  }

  get_quality(quality_type) {
    for (let quality of Object.values(this.available_qualities())) {
      if (quality.metadata.quality_type === quality_type)
        return quality;
    }
    return null;
  }
}

export class ContainerStackGroup {
  constructor(printer_id) {
    this.set_printer(printer_id);
  }

  set_printer(printer_id) {
    this.printer_id = printer_id;
    this.definitions = resolve_definitions(printer_id);

    let printer_metadata = this.definitions.printer.metadata;
    this.preferred = {
      material: printer_metadata.preferred_material,
      quality_type: printer_metadata.preferred_quality_type,
      variant: printer_metadata.preferred_variant_name
    };

    let global_stack = new ContainerStack("global", this.definitions.printer, this);
    global_stack.set_preferred_profiles();
    this.containers = {
      global: global_stack,
      extruders: {}
    };

    for (let [extuder_id, extruder] of Object.entries(this.definitions.extruders)) {
      let extruder_stack = new ContainerStack(extuder_id, extruder, this);
      extruder_stack.set_preferred_profiles();
      this.containers.extruders[extuder_id] = extruder_stack;
    }
  }

  export_settings() {
    let settings = {
      "global": {}
    };
    for (let [extruder_id, extruder_stack] of Object.entries(this.containers.extruders)) {
      settings[`extruder.${extruder_id}`] = {};
      for (let [setting_id, category_id] of Object.entries(extruder_stack.setting_categories)) {
        if (category_id !== "machine_settings")
          continue;
        let value = extruder_stack.resolve_setting(setting_id);
        settings[`extruder.${extruder_id}`][setting_id] = value;
      }
    }

    let global_stack = this.containers.global;
    for (let [setting_id, category_id] of Object.entries(global_stack.setting_categories)) {
      let setting = global_stack.settings[setting_id];
      if (category_id === "machine_settings") {
        let value = global_stack.resolve_setting(setting_id);
        settings.global[setting_id] = value;
      }
      else if (setting.settable_per_extruder) {
        for (let [extruder_id, extruder_stack] of Object.entries(this.containers.extruders)) {
          let value = extruder_stack.resolve_setting(setting_id);
          settings[`extruder.${extruder_id}`][setting_id] = value;
        }
      }

      let extruder_stack = this.containers.extruders[0];
      let value = extruder_stack.resolve_setting(setting_id);
      settings.global[setting_id] = value;
    }

    return settings;
  }

  update_settings() {
    let start = performance.now();
    let global_stack = this.containers.global;

    global_stack.clear_cache();
    for (let [setting_id, category_id] of Object.entries(global_stack.setting_categories)) {
      if (category_id !== "machine_settings")
        continue;
      global_stack.resolve_setting(setting_id);
    }

    for (let extruder_stack of Object.values(this.containers.extruders)) {
      extruder_stack.clear_cache();
      for (let [setting_id, category_id] of Object.entries(extruder_stack.setting_categories)) {
        if (category_id !== "machine_settings")
          continue;
        extruder_stack.resolve_setting(setting_id);
      }
      for (let [setting_id, category_id] of Object.entries(global_stack.setting_categories)) {
        if (category_id === "machine_settings")
          continue;
        extruder_stack.resolve_setting(setting_id);
      }
    }

    let end = performance.now();
    console.log("updated settings in", Math.round((end - start) * 100) / 100, "ms");
  }

  allowed_quality_types() {
    let all_qualities = [];
    let all_stacks = [this.containers.global, ...Object.values(this.containers.extruders)];
    for (let extruder_stack of all_stacks) {
      let available_qualities = extruder_stack.available_qualities();
      let quality_types = new Set();
      for (let quality of Object.values(available_qualities))
        quality_types.add(quality.metadata.quality_type);
      all_qualities[extruder_stack.name] = quality_types;
    }

    if (all_qualities.length === 0)
      return [];
    if (all_qualities.length === 1)
      return Array.from(all_qualities[0]);
    return set_intersect(...all_qualities);
  }
}

function is_int(str) {
  return /^[-\d]*$/.test(str);
}
function is_num(str) {
  return /^-?\d+(\.\d+)?$/.test(str);
}
function is_var(str) {
  return /^[a-zA-Z_][a-zA-Z_\d]*$/.test(str);
}

//https://stackoverflow.com/a/70291510
function set_intersect(set_a, set_b, ...args) {
  const result = new Set([...set_a].filter((i) => set_b.has(i)));
  if (args.length === 0)
    return result;
  return set_intersect(result, args.shift(), ...args);
}
