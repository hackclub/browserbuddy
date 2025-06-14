/**
 * File I/O
 */
import { load_model } from "./viewer/model_viewer.mjs";

export let stl_file_name = null;

async function b64_decode(b64) {
  var data_url = "data:application/octet-binary;base64," + b64;
  let r = await fetch(data_url);
  return await r.arrayBuffer();
}

/**
 * Handle file imports (only STLs for now)
 * @param {File} file File object to import
 */
export function load_file(file) {
  const reader = new FileReader();
  reader.file_name = file.name;

  reader.onload = (e) => {
    const array_buffer = reader.result;
    stl_file_name = reader.file_name;
    load_model(array_buffer, stl_file_name.endsWith(".stl") ? "stl" : "3mf");
  };

  reader.readAsArrayBuffer(file);
}

/**
 * Save raw blob data to file
 * @param {BlobPart} data
 * @param {string} filename
 * @param {string} type eg. "text/plain"
 */
export function save_file(data, filename, type) {
  let blob = new Blob([data], {type: type});
  let a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  a.style.display = "none";

  document.body.append(a);
  a.click();
  a.remove();
}

export function check_for_stl() {
  if (!window.chrome || !window.chrome.runtime)
    return;
  chrome.runtime.sendMessage({cmd: "get_model"}, async (response) => {
    if (!response)
      return;
    let [file_name, stl_b64] = response;
    let stl_data = await b64_decode(stl_b64);
    console.log(stl_data, stl_data);
    let file_type = file_name.split(".").at(-1).toLowerCase();
    load_model(stl_data, file_type);
  });
}
