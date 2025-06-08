import { eval_py, setup_ctx } from "../python.mjs";
import { active_containers } from "./index.mjs";

//this file contains a parser for cura's conditional gcode and formulas inside gcode
//it works by converting the gcode file to a python program that prints out the formatted gcode

//see also:
//https://github.com/Ultimaker/Cura/wiki/Start-End-G%E2%80%90Code
//https://github.com/Ultimaker/Cura/blob/0273ef49f192f59cf8291cb9b631af218dd30f41/plugins/CuraEngineBackend/StartSliceJob.py#L65

export const instruction_regex =
  /{(?<condition>if|else|elif|endif)?\s*(?<expression>.*?)\s*(?:,\s*(?<extruder_nr_expr>.*?))?\s*}/;

const py_api = {
  resolve: (expression, extruder_nr) => {
    let stack;
    if (extruder_nr === "-1")
      stack = active_containers.containers.global;
    else if (active_containers.containers.extruders[extruder_nr])
      stack = active_containers.containers.extruders[extruder_nr];
    else
      throw TypeError("gcode expression error: extruder_nr not found: " + extruder_nr);
    return stack.resolve_py_expression(expression, true, stack.name);
  }
};

export function format_gcode(gcode) {
  //use the regex to get chunks from gcode
  let remaining_text = gcode;
  let chunks = [];
  while (remaining_text.length > 0) {
    let match = instruction_regex.exec(remaining_text);
    if (match != null) {
      let next_index = match.index + match[0].length;
      chunks.push(remaining_text.substring(0, match.index));
      chunks.push(match.groups);
      remaining_text = remaining_text.substring(next_index);
    }
    else {
      chunks.push(remaining_text);
      break;
    }
  }

  //generate a python script from those chunks
  let lines = [[0, `gcode = ""`]];
  let indent = 0;
  for (let chunk of chunks) {
    let expression_str = JSON.stringify(chunk.expression);
    let extruder_nr_str = JSON.stringify(chunk.extruder_nr_expr ?? "-1");

    if (typeof chunk === "string")
      lines.push([indent, `gcode += ${JSON.stringify(chunk)}`]);
    else if (chunk.condition == null)
      lines.push([indent, `gcode += str(resolve(${expression_str}, ${extruder_nr_str}))`]);
    else if (chunk.condition === "if") {
      lines.push([indent, `if resolve(${expression_str}, ${extruder_nr_str}):`]);
      indent += 2;
    }
    else if (chunk.condition === "elif")
      lines.push([indent - 2, `elif resolve(${expression_str}, ${extruder_nr_str}):`]);
    else if (chunk.condition === "else")
      lines.push([indent - 2, `else:`]);
    else if (chunk.condition === "endif")
      indent -= 2;
  }

  let python_str = "import json\n";
  for (let [indent, line] of lines)
    python_str += " ".repeat(indent) + line + "\n";
  python_str += `print(json.dumps(gcode))`;

  //evaluate the python script
  return eval_py(python_str, "formatter", {}, false);
}

setup_ctx("formatter", py_api);
