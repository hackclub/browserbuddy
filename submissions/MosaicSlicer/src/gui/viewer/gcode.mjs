import * as THREE from "three";
import { LineTubeGeometry } from "./LineTube.mjs";

export function parse(data) {
  let state = {x: 0, y: 0, z: 0, e: 0, f: 0, extruding: false, relative: false};
  const layers = [];

  let currentLayer = undefined;

  function newLayer(line) {
    currentLayer = {vertex: [], pathVertex: [], z: line.z};
    layers.push(currentLayer);
  }

  //Create lie segment between p1 and p2
  function addSegment(p1, p2) {
    if (currentLayer === undefined)
      newLayer(p1);

    if (state.extruding) {
      currentLayer.vertex.push(new THREE.Vector3(p1.x, p1.y, p1.z));
      currentLayer.vertex.push(new THREE.Vector3(p2.x, p2.y, p2.z));
    }
    else {
      currentLayer.pathVertex.push(new THREE.Vector3(p1.x, p1.y, p1.z));
      currentLayer.pathVertex.push(new THREE.Vector3(p2.x, p2.y, p2.z));
    }
  }

  function delta(v1, v2) {
    return state.relative ? v2 : v2 - v1;
  }

  function absolute(v1, v2) {
    return state.relative ? v1 + v2 : v2;
  }

  const lines = data.replace(/;.+/g, "").split("\n");

  for (let i = 0; i < lines.length; i++) {
    const tokens = lines[i].split(" ");
    const cmd = tokens[0].toUpperCase();

    //Arguments
    const args = {};
    tokens.splice(1).forEach(function(token) {
      if (token[0] !== undefined) {
        const key = token[0].toLowerCase();
        const value = parseFloat(token.substring(1));
        args[key] = value;
      }
    });

    //Process commands
    //G0/G1 – Linear Movement
    if (cmd === "G0" || cmd === "G1") {
      const line = {
        x: args.x !== undefined ? absolute(state.x, args.x) : state.x,
        y: args.y !== undefined ? absolute(state.y, args.y) : state.y,
        z: args.z !== undefined ? absolute(state.z, args.z) : state.z,
        e: args.e !== undefined ? absolute(state.e, args.e) : state.e,
        f: args.f !== undefined ? absolute(state.f, args.f) : state.f
      };

      //Layer change detection is or made by watching Z, it's made by watching when we extrude at a new Z position
      if (delta(state.e, line.e) > 0) {
        state.extruding = delta(state.e, line.e) > 0;

        if (currentLayer == undefined || line.z != currentLayer.z)
          newLayer(line);
      }

      addSegment(state, line);
      state = line;
    }
    else if (cmd === "G2" || cmd === "G3") {
      //G2/G3 - Arc Movement ( G2 clock wise and G3 counter clock wise )
      //console.warn( 'THREE.GCodeLoader: Arc command not supported' );
    }
    else if (cmd === "G90") {
      //G90: Set to Absolute Positioning
      state.relative = false;
    }
    else if (cmd === "G91") {
      //G91: Set to state.relative Positioning
      state.relative = true;
    }
    else if (cmd === "G92") {
      //G92: Set Position
      const line = state;
      line.x = args.x !== undefined ? args.x : line.x;
      line.y = args.y !== undefined ? args.y : line.y;
      line.z = args.z !== undefined ? args.z : line.z;
      line.e = args.e !== undefined ? args.e : line.e;
    }
    else {
      //console.warn( 'THREE.GCodeLoader: Command not supported:' + cmd );
    }
  }

  function addObject(vertex, extruding, i) {
    if (extruding) {
      const tube = new LineTubeGeometry();
      for (let v of vertex)
        tube.add({point: v, color: new THREE.Color(0xff0000), radius: 0.1});
      tube.finish();

      // const path = new THREE.CatmullRomCurve3(vertex)
      const mesh = new THREE.Mesh(
        tube,
        new THREE.MeshPhysicalMaterial({
          color: 0x1a5f5a,
          // A bit of constant light to dampen the shadows
          emissive: 0x1a5f5a,
          emissiveIntensity: 0.3
        })
      );
      object.add(mesh);
    }
  }

  const object = new THREE.Group();
  object.name = "gcode";

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    addObject(layer.vertex, true, i);
    addObject(layer.pathVertex, false, i);
  }

  object.rotation.set(-Math.PI / 2, 0, 0);

  return object;
}
