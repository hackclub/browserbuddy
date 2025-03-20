import * as cura from "./cura.mjs";
import * as vfs from "./vfs.mjs";

//all the code in this directory runs inside a separate worker

const rpc_functions = {
  "cura_engine": cura.run_cura_engine,
  "import_files": vfs.import_files,
  "get_file": vfs.get_file
};

globalThis.addEventListener("message", (event) => {
  let [func_name, args] = event.data;
  try {
    let ret = rpc_functions[func_name](...args);
    self.postMessage(["resolve", func_name, ret]);
  }
  catch (e) {
    self.postMessage(["error", func_name, e]);
  }
});

//notify the host that the worker has finished loading
globalThis.postMessage(true);
globalThis.worker = {cura, vfs};
