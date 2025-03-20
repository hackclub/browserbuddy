import EmscriptenRuntime from "../../../dist/compiled/CuraEngine.mjs";

export const runtime = await EmscriptenRuntime();

export function run_cura_engine(new_args) {
  globalThis.__progress_cb = progress_cb.bind(this);
  globalThis.__slice_info_cb = slice_info_cb.bind(this);
  globalThis.__gcode_header_cb = gcode_header_cb.bind(this);
  globalThis.__engine_info_cb = engine_info_cb.bind(this);

  let args = [
    "slice",
    "--progress_cb",
    "__progress_cb",
    "--slice_info_cb",
    "__slice_info_cb",
    "--gcode_header_cb",
    "__gcode_header_cb",
    "--engine_info_cb",
    "__engine_info_cb",
    ...new_args
  ];
  console.log("Launching CuraEngine with arguments:", args.join(" "));
  return runtime.callMain(args);
}

function progress_cb(progress) {
  self.postMessage(["callback", "progress", progress]);
}
function slice_info_cb(info) {
  self.postMessage(["callback", "slice_info", info]);
}
function gcode_header_cb(gcode_b64) {
  self.postMessage(["callback", "gcode_header", gcode_b64]);
}
function engine_info_cb(engine_info) {
  self.postMessage(["callback", "engine_info", engine_info]);
}
