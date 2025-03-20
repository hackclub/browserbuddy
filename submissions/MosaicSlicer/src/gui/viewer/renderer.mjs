// Three.js setup for STL viewer and GCode viewer
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const viewport = document.getElementById("viewer");

export var view_width = viewport.clientWidth;
export var view_height = viewport.clientHeight;

// ---- Scene
export const scene = new THREE.Scene();

export class AxesBoxesGroup extends THREE.Group {
  constructor(length) {
    super();
    this.x_box = this.create_box(length, 1, 1, 0xff0000);
    this.x_box.position.set(length / 2, 0, 0);
    this.y_box = this.create_box(1, length, 1, 0x00ff00);
    this.y_box.position.set(0, 0, -length / 2);
    this.z_box = this.create_box(1, 1, length, 0x0000ff);
    this.z_box.position.set(0, length / 2, 0);
  }

  create_box(width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, depth, height);
    const material = new THREE.MeshBasicMaterial({color: color});
    const box = new THREE.Mesh(geometry, material);
    this.add(box);
    return box;
  }
}

export const axes_boxes = new AxesBoxesGroup(20);
scene.add(axes_boxes);

// ---- Camera
export const camera = new THREE.PerspectiveCamera(
  75,
  view_width / view_height
);
camera.position.x = 150;
camera.position.y = 150;
camera.position.z = 150;

// ---- Renderer
export const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.getElementById("stl-viewer"),
  alpha: true
});
renderer.setClearColor(0xffffff, 0);
renderer.setSize(view_width, view_height);

// ---- Controls
export const controls = new OrbitControls(camera, renderer.domElement);

// ---- Three.js Updating and Rendering
function resize() {
  if (viewport.clientWidth === view_width && viewport.clientHeight === view_height)
    return;
  if (viewport.clientWidth === 0 && viewport.clientHeight === 0)
    return;
  if (view_width === 0 && view_height === 0)
    return;

  view_width = viewport.clientWidth;
  view_height = viewport.clientHeight;

  camera.aspect = view_width / view_height;
  camera.updateProjectionMatrix();

  renderer.setSize(view_width, view_height);
  render();
}

function render() {
  renderer.render(scene, camera);
}

export function animate() {
  resize();
  requestAnimationFrame(animate);
  controls.update();
  render();
}
