import { loadMicroPython } from "@micropython/micropython-webassembly-pyscript";
import mp_wasm from "@micropython/micropython-webassembly-pyscript/micropython.wasm";

export const micropython = await loadMicroPython({
  url: mp_wasm,
  pystack: 1024 * 1024,
  heapsize: 16 * 1024 * 1024,
  stdout: py_stdout
});
const name_error_regex = /NameError: name '(\S+)' isn't defined/;

let last_print = "";
function py_stdout(msg) {
  last_print = msg;
}

export class PythonNameError extends Error {
  constructor(message) {
    super(message);
    this.var_name = message.match(name_error_regex)[1];
  }
}

export function clean_globals(ctx) {
  let ctx_name = `ctx_${ctx}`;
  if (!micropython.globals.get(ctx_name))
    return;
  app.python.micropython.runPython(
    `for key, val in ${ctx_name}.items():\n  if not callable(val) and not type(val) is types.ModuleType: del ${ctx_name}[key]`
  );
}

export function eval_py(expression, ctx, vars = {}, use_eval = true) {
  let ctx_name = `ctx_${ctx}`;
  if (!micropython.globals.get(ctx_name))
    micropython.runPython(`${ctx_name} = {}`);

  for (let [var_name, value] of Object.entries(vars)) {
    let var_name_str = JSON.stringify(var_name);
    let value_str = JSON.stringify(JSON.stringify(value));
    micropython.runPython(`${ctx_name}[${var_name_str}] = json.loads(${value_str})`);
  }

  try {
    let expression_str = JSON.stringify(expression);
    if (use_eval)
      micropython.runPython(`print(json.dumps(eval(${expression_str}, ${ctx_name})))`);
    else
      micropython.runPython(`exec(${expression_str}, ${ctx_name})`);
  }
  catch (py_error) {
    if (name_error_regex.test(py_error.message))
      throw new PythonNameError(py_error.message);
    else
      throw py_error;
  }
  return JSON.parse(last_print);
}

export function setup() {
  micropython.runPython(`import math, json, usys, types`);
  micropython.runPython(`def print_debug(*args): print(*args, file=usys.stderr)`);
}

export function setup_ctx(ctx, py_api) {
  const py_api_private = {};
  for (let py_func in py_api) {
    py_api_private[py_func] = (...args) => {
      return JSON.stringify(py_api[py_func](...args));
    };
  }

  micropython.registerJsModule(`__cura_api_${ctx}`, py_api_private);
  micropython.runPython(`import __cura_api_${ctx}`);
  micropython.runPython(`cura_api_${ctx} = {}`);
  for (let py_func in py_api) {
    let func_name_str = JSON.stringify(py_func);
    micropython.runPython(`def __tmp_func(*args): return json.loads(__cura_api_${ctx}.${py_func}(*args))`);
    micropython.runPython(`cura_api_${ctx}[${func_name_str}] = __tmp_func`);
    micropython.globals.delete("__tmp_func");
  }

  let ctx_name = `ctx_${ctx}`;
  if (!micropython.globals.get(ctx_name))
    micropython.runPython(`${ctx_name} = dict(**cura_api_${ctx}, math=math)`);
}

setup();
