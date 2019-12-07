import {Injectable} from '@angular/core';
import {StatsService} from '../canvas/stats.service';

import {BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {CGameGlobalObjects} from '../../memory/prime1/CGameGlobalObjects';

@Injectable({
  providedIn: 'root'
})
export class RenderService {
  element: HTMLCanvasElement;
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;

  constructor(private stats: StatsService) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({color: 0x00ff00});
    const cube = new Mesh(geometry, material);
    this.scene.add(cube);

    this.camera.position.z = 5;

    this.render();
  }

  init(ele: HTMLCanvasElement) {
    if (this.element) {
      throw new Error('Already initialized!');
    }
    this.element = ele;
    this.renderer = new WebGLRenderer({
      canvas: this.element
    });

    // this.renderer.setSize(this.element.width, this.element.height);
  }

  private render() {
    if (!this.renderer) {
      requestAnimationFrame(() => this.render());
      return;
    }
    this.stats.begin();

    this.updateScene();

    this.renderer.render(this.scene, this.camera);

    this.stats.end();
    requestAnimationFrame(() => this.render());
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private updateScene() {

    const memory = new DataView(new ArrayBuffer(1));
    let test = new CGameGlobalObjects(memory, () => 0);
    console.log(test);

  }
}
