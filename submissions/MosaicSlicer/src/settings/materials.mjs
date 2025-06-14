import { cura_resources, get_resource } from "../resources.mjs";

export const parsed_materials = {};

const xml_parser = new DOMParser();

const __material_metadata_setting_map = {
  "GUID": "material_guid",
  "material": "material_type",
  "brand": "material_brand"
};
const __material_properties_setting_map = {"diameter": "material_diameter"};

const __material_settings_setting_map = {
  "print temperature": "default_material_print_temperature",
  "heated bed temperature": "default_material_bed_temperature",
  "standby temperature": "material_standby_temperature",
  "processing temperature graph": "material_flow_temp_graph",
  "print cooling": "cool_fan_speed",
  "retraction amount": "retraction_amount",
  "retraction speed": "retraction_speed",
  "adhesion tendency": "material_adhesion_tendency",
  "surface energy": "material_surface_energy",
  "build volume temperature": "build_volume_temperature",
  "anti ooze retract position": "material_anti_ooze_retracted_position",
  "anti ooze retract speed": "material_anti_ooze_retraction_speed",
  "break preparation position": "material_break_preparation_retracted_position",
  "break preparation speed": "material_break_preparation_speed",
  "break preparation temperature": "material_break_preparation_temperature",
  "break position": "material_break_retracted_position",
  "flush purge speed": "material_flush_purge_speed",
  "flush purge length": "material_flush_purge_length",
  "end of filament purge speed": "material_end_of_filament_purge_speed",
  "end of filament purge length": "material_end_of_filament_purge_length",
  "maximum park duration": "material_maximum_park_duration",
  "no load move factor": "material_no_load_move_factor",
  "break speed": "material_break_speed",
  "break temperature": "material_break_temperature"
};

const __unmapped_settings = ["hardware compatible", "hardware recommended"];

const __keep_serialized_settings = [ // Settings irrelevant to Cura, but that could be present in the files so we must store them and keep them serialized.
  "relative extrusion",
  "flow sensor detection margin",
  "different material purge volume",
  "same material purge volume",
  "end of print purge volume",
  "end of filament purge volume",
  "purge anti ooze retract position",
  "purge drop retract position",
  "purge retract speed",
  "purge unretract speed",
  "purge anti ooze dwell time",
  "purge drop dwell time",
  "dwell time before break preparation move",
  "pressure release dwell time",
  "tainted print core max temperature",
  "recommend cleaning after n prints",
  "maximum heated bed temperature",
  "material bed adhesion temperature",
  "maximum heated chamber temperature",
  "shrinkage percentage",
  "move to die distance"
];

const __material_translations = {
  "PLA": "generic_pla",
  "ABS": "generic_abs",
  "CPE": "generic_cpe",
  "CPE+": "generic_cpe_plus",
  "Nylon": "generic_nylon",
  "PC": "generic_pc",
  "TPU": "generic_tpu"
};

//this is a reimplementation of the corresponding function in the original cura source code
//https://github.com/Ultimaker/Cura/blob/f468cd5150440c007aeebbc163bf569f055bb4c0/plugins/XmlMaterialProfile/XmlMaterialProfile.py#L523
//todo: please refactor
function setting_entry(entry) {
  let key = entry.getAttribute("key") ?? null;
  if (key == "processing temperature graph") {
    // This setting has no setting text but subtags.
    let graph_nodes = entry.querySelectorAll("point");
    let graph_points = [];
    for (let graph_node in graph_nodes) {
      let flow = parseFloat(graph_node.flow ?? null);
      let temperature = parseFloat(graph_node.temperature ?? null);
      graph_points.push([flow, temperature]);
    }
    return graph_points.toString();
  }
  else {
    return entry.textContent;
  }
}
export function deserialize_xml(material_xml) {
  const data = xml_parser.parseFromString(material_xml, "text/xml");

  let metadata = {};
  metadata.reserialize_settings = {};

  let common_setting_values = {};

  metadata.name = "Unknown Material"; // In case the name tag is missing.

  for (let entry of data.querySelectorAll("metadata>*")) {
    let tag_name = entry.tagName;
    if (tag_name == "name") {
      let brand = entry.getElementsByTagName("brand")[0];
      let material = entry.getElementsByTagName("material")[0];
      let color = entry.getElementsByTagName("color")[0];
      let label = entry.getElementsByTagName("label")[0];

      if (label != null && label.textContent != null)
        metadata.name = label.textContent;
      else {
        if (material.textContent == null)
          metadata.name = "Unknown Material";
        if (color.textContent != "Generic")
          metadata.name = `${color.textContent} ${material.textContent}`;
        else
          metadata.name = material.textContent;
      }
      metadata.brand = brand.textContent ?? "Unknown Brand";
      metadata.material = material.textContent ?? "Unknown Type";
      metadata.color_name = color.textContent ?? "Unknown Color";
      continue;
    }

    if (tag_name == "setting_version")
      continue;
    metadata[tag_name] = entry.textContent;

    for (let tag_name in metadata) {
      if (tag_name in __material_metadata_setting_map)
        common_setting_values[__material_metadata_setting_map[tag_name]] = metadata[tag_name];
    }
  }

  if (typeof metadata.description === "undefined")
    metadata.description = "";

  if (typeof metadata.adhesion_info === "undefined")
    metadata.adhesion_info = "";

  let property_values = {};
  let properties = data.querySelectorAll("properties>*");
  for (let entry of properties) {
    let tag_name = entry.tagName;
    property_values[tag_name] = entry.textContent;

    if (tag_name in __material_properties_setting_map)
      common_setting_values[__material_properties_setting_map[tag_name]] = entry.textContent;
  }
  metadata.approximate_diameter = Math.round(
    parseFloat("diameter" in property_values ? property_values.diameter : 2.85)
  ).toString(); // In mm
  metadata.properties = property_values;
  metadata.definition = "fdmprinter";

  let common_compatibility = true;
  let settings = data.querySelectorAll("settings>setting");
  for (let entry of settings) {
    let key = entry.getAttribute("key") ?? null;
    if (key in __material_settings_setting_map)
      common_setting_values[__material_settings_setting_map[key]] = setting_entry(entry);
    else if (key in __unmapped_settings) {
      if (key == "hardware compatible")
        common_compatibility = ["yes", "unknown"].includes(entry.textContent);
    }
    else if (__keep_serialized_settings.includes(key)) {
      metadata.reserialize_settings[key] = entry.textContent;
    }
  }
  metadata.compatible = common_compatibility;

  let machine_settings = [];
  let machine_elements = data.querySelectorAll("settings>machine");
  for (let machine_element of machine_elements) {
    let machine_setting = {
      ids: [],
      settings: {}
    };
    for (let child of machine_element.children) {
      if (child.tagName === "machine_identifier")
        machine_setting.ids.push(child.getAttribute("product"));
      else if (child.tagName === "setting") {
        let key = child.getAttribute("key") ?? null;
        let setting_key = __material_settings_setting_map[key];
        machine_setting.settings[setting_key] = setting_entry(child);
      }
    }
    machine_settings.push(machine_setting);
  }

  // This is not in the original implementation
  metadata.common_setting_values = common_setting_values;
  metadata.machine_settings = machine_settings;

  return metadata;
}

export function parse_material(material_id) {
  let material_xml = get_resource(`materials/${material_id}.xml.fdm_material`, true);
  let material = deserialize_xml(material_xml);
  material.id = material_id;
  return material;
}

export function load_all_materials() {
  for (let path in cura_resources) {
    if (!path.endsWith(".xml.fdm_material"))
      continue;

    let path_split = path.split("/");
    let material_id = path_split.at(-1).split(".")[0];
    let material = parse_material(material_id);
    parsed_materials[material_id] = material;
  }
}

export function get_material_type(material) {
  return __material_translations[material.material];
}

export function material_to_profile(material, printer_id) {
  let material_type = __material_translations[material.material];

  let values = material.common_setting_values;
  for (let {ids, settings} of material.machine_settings) {
    if (!ids.includes(printer_id))
      continue;
    Object.assign(values, settings);
  }

  return {
    general: {
      name: material.name,
      definition: material.definition
    },
    metadata: {
      material: material_type,
      type: "material",
      info: material
    },
    values: material.common_setting_values,
    id: material.id
  };
}
