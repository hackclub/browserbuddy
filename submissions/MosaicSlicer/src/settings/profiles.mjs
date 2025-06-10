import { ini_files } from "../resources.mjs";

export const profile_types = ["intent", "quality", "variant"];

export function resolve_profiles(definition) {
  let profiles = {};
  let inheritance = [...definition.inheritance_chain].reverse();

  for (let profile_type of profile_types) {
    profiles[profile_type] = {};
    for (let [filename, profile] of Object.entries(ini_files[profile_type])) {
      let profile_id = filename.split("/").at(-1).replace(".inst.cfg", "");
      let priority = inheritance.indexOf(profile.general.definition);
      if (priority === -1)
        continue;
      profile.priority = priority;
      profile.id = profile_id;
      profiles[profile_type][profile_id] = profile;
    }
  }

  return profiles;
}

function check_filter(profile, filters) {
  for (let [filter_key, filter_value] of Object.entries(filters)) {
    if (filter_value === undefined)
      continue;
    if (filter_value === null) {
      if (profile.metadata[filter_key] == null)
        continue;
      else
        return false;
    }
    if (profile.metadata[filter_key] !== filter_value)
      return false;
  }
  return true;
}

//filters might be: {material:"", variant:"", quality_type:""}
export function filter_profiles(profiles, filters = {}) {
  let filtered = {};
  for (let profile of Object.values(profiles)) {
    if (check_filter(profile, filters))
      filtered[profile.id] = profile;
  }

  if (Object.keys(filtered).length === 0)
    filtered = profiles;

  let max_priority = 0;
  for (let profile of Object.values(filtered))
    max_priority = Math.max(max_priority, profile.priority);
  for (let profile of Object.values(filtered)) {
    if (profile.priority < max_priority)
      delete filtered[profile.id];
  }
  return filtered;
}
