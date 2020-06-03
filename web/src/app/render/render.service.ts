import {Injectable} from '@angular/core';
import {StatsService} from '../canvas/stats.service';

import * as BABYLON from 'babylonjs';
// import {BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {GameStateService} from '../gameState/game-state.service';

@Injectable({
  providedIn: 'root'
})
export class RenderService {
  element: HTMLCanvasElement;
  scene: BABYLON.Scene;
  camera: BABYLON.ArcRotateCamera;
  engine: BABYLON.Engine;
  active = true;

  constructor(private stats: StatsService, private state: GameStateService) {
    // this.scene = new BABYLON.Scene();

    // const geometry = new BABYLON.BoxGeometry(1, 1, 1);
    // const material = new MeshBasicMaterial({color: 0x00ff00});
    // const cube = new Mesh(geometry, material);
    // this.scene.add(cube);

    // this.camera.position.z = 5;

    this.render();
  }

  init(ele: HTMLCanvasElement) {
    if (this.element) {
      throw new Error('Already initialized!');
    }
    this.element = ele;
    this.engine = new BABYLON.Engine(ele, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    this.scene = new BABYLON.Scene(this.engine);
    this.camera = new BABYLON.ArcRotateCamera(
      'Camera',
      Math.PI / 2,
      Math.PI / 2,
      2,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    this.camera.position.z = 5;
    this.camera.attachControl(ele, true);

    const light1 = new BABYLON.HemisphericLight(
      'light1',
      new BABYLON.Vector3(1, 1, 0),
      this.scene
    );
    const light2 = new BABYLON.PointLight(
      'light2',
      new BABYLON.Vector3(0, 1, -1),
      this.scene
    );

    // This is where you create and manipulate meshes
    const sphere = BABYLON.MeshBuilder.CreateSphere(
      'sphere',
      {diameter: 2},
      this.scene
    );

    // window.addEventListener('resize', () => {
    // this.engine.resize();
    // });

    // this.renderer.setSize(this.element.width, this.element.height);
  }

  private render() {
    if (!this.engine || !this.active) {
      requestAnimationFrame(() => this.render());
      return;
    }
    this.stats.begin();

    this.updateScene();

    this.scene.render(true, false);

    this.stats.end();
    requestAnimationFrame(() => this.render());
  }

  resize(width: number, height: number) {
    if (!this.engine) {
      return;
    }
    this.engine.setSize(width, height);
    // this.camera.aspect = width / height;
    // this.camera.updateProjectionMatrix();
  }

  private updateScene() {

  }
}
