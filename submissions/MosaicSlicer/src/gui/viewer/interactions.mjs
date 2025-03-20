/**
 * Manage interactions in viewer
 */
import * as renderer from "./renderer.mjs";

import { tab_strip } from "../tabs.mjs";

import * as THREE from "three";

var raycaster = new THREE.Raycaster();

/**
 * @typedef {Object} SceneObject
 * @property {THREE.Mesh} mesh
 * @property {() => {}} onclick
 * @property {() => {}} onclickout When another object is clicked after this one
 * @property {(event: Event) => void} ondrag
 */

/**
 * @type {SceneObject}
 */
export const SceneObject = {
  mesh: null,
  onclick: null,
  onclickout: null,
  ondrag: null
};

/**
 * @type {Record<string, SceneObject>}
 */
export var scene_objects = {};

/**
 * Check if mouse is colliding with any `SceneObject` in the viewer
 * @param {number} mouse_x
 * @param {number} mouse_y
 * @returns {string | null} UUID of object, otherwise `null`
 */
function get_mouse_intersects(mouse_x, mouse_y) {
  var mouse = new THREE.Vector2(
    mouse_x / renderer.view_width * 2 - 1,
    -(mouse_y / renderer.view_height * 2 - 1)
  );
  raycaster.setFromCamera(mouse, renderer.camera);

  let intersects = raycaster.intersectObjects(Array.from(Object.values(scene_objects), (model) => model.mesh), true);
  if (intersects.length > 0)
    return intersects[0].object.uuid;
  return null;
}

var currently_held = null;
var last_held = null;
renderer.viewport.addEventListener("mousedown", (e) => {
  let intersection = get_mouse_intersects(e.clientX, e.clientY - tab_strip.clientHeight);
  if (intersection) {
    if (last_held && last_held != currently_held) {
      if (scene_objects[last_held].onclickout)
        scene_objects[last_held].onclickout();
    }
    last_held = currently_held;
    currently_held = intersection;
    renderer.controls.enabled = false;
  }
  else {
    // currently_held = null;
  }
});
renderer.viewport.addEventListener("mousemove", (e) => {
  if (currently_held) {
    if (scene_objects[currently_held].ondrag != null)
      scene_objects[currently_held].ondrag(e);
  }
});
renderer.viewport.addEventListener("mouseup", (e) => {
  if (currently_held) {
    if (scene_objects[currently_held].onclick != null) {
      // Check if mouse is still over model
      let intersection = get_mouse_intersects(e.clientX, e.clientY - tab_strip.clientHeight);
      if (intersection == currently_held)
        scene_objects[currently_held].onclick(e);
    }
  }
  renderer.controls.enabled = true;

  currently_held = null;
});
