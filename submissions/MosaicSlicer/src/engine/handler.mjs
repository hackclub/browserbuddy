//code for interfacing with the cura engine worker

let rpc_promises = {};
export let cura_worker = null;
export let rpc_callbacks = {};

function wait_for_worker(worker) {
  return new Promise(resolve => {
    let callback = (event) => {
      if (event.data !== true) return;
      resolve();
      worker.removeEventListener("message", callback);
    };
    worker.addEventListener("message", callback);
  });
}

async function create_worker() {
  if (!cura_worker) {
    cura_worker = new Worker(new URL("./worker/index.mjs", import.meta.url), {type: "module"});
    await wait_for_worker(cura_worker);
    cura_worker.addEventListener("message", handle_msg);
  }
}

export function kill_worker() {
  cura_worker.terminate();
  cura_worker = null;
  for (let promise of Object.values(rpc_promises))
    promise.reject(new Error("worker was killed"));
}

function handle_msg(event) {
  let msg = event.data;
  let type = msg.shift();
  if (type === "callback") {
    let callback = msg.shift();
    if (rpc_callbacks[callback])
      rpc_callbacks[callback](...msg);
  }
  else if (type === "resolve") {
    let func_name = msg.shift();
    rpc_promises[func_name].resolve(...msg);
  }
  else if (type === "error") {
    let func_name = msg.shift();
    rpc_promises[func_name].reject(...msg);
  }
}

function rpc_call(func_name, ...args) {
  return new Promise((resolve, reject) => {
    rpc_promises[func_name] = {resolve, reject};
    cura_worker.postMessage([func_name, args]);
  });
}

export async function run_cura(new_args) {
  await create_worker();
  return await rpc_call("cura_engine", new_args);
}

export async function import_files(base_dir, files) {
  await create_worker();
  return await rpc_call("import_files", base_dir, files);
}

export async function read_file(file_path) {
  await create_worker();
  return await rpc_call("get_file", file_path);
}
