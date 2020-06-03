import {Injectable} from '@angular/core';
import {StatsService} from '../canvas/stats.service';

import * as BABYLON from 'babylonjs';
// import {BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {GameStateService} from '../gameState/game-state.service';
import {MemoryObjectInstance} from "../gameState/game-types.service";

@Injectable({
  providedIn: 'root'
})
export class RenderService {
  element: HTMLCanvasElement;
  scene: BABYLON.Scene;
  camera: BABYLON.ArcRotateCamera;
  engine: BABYLON.Engine;
  active = true;

  areaMeshes = new Map<number, BABYLON.Mesh>();
  collisionMat: BABYLON.StandardMaterial;

  constructor(private stats: StatsService, private state: GameStateService) {
    // this.scene = new BABYLON.Scene();

    // const geometry = new BABYLON.BoxGeometry(1, 1, 1);
    // const material = new MeshBasicMaterial({color: 0x00ff00});
    // const cube = new Mesh(geometry, material);
    // this.scene.add(cube);

    // this.camera.position.z = 5;

    this.state.onRefresh.subscribe(() => {
      this.updateSceneFromState();
    });

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
    this.camera.upVector = new BABYLON.Vector3(0, 0, 1);
    this.camera.position.z = 5;
    this.camera.panningSensibility = 50;
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
      {diameter: 1},
      this.scene
    );

    this.collisionMat = new BABYLON.StandardMaterial('collisionMat', this.scene);
    this.collisionMat.backFaceCulling = false;

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

  private updateSceneFromState() {
    const stateManager = this.state.stateManager;
    const world = this.state.getMember(stateManager, 'world');
    const areas = this.state.getMember(world, 'areas');
    const size = this.state.readPrimitiveMember(areas, 'end');

    for (let i = 0; i < size; i++) {
      const ptrToArea = this.state.getMemberArray(areas, 'first', i);
      const area = this.state.getMember(ptrToArea, 'value');
      const mrea = this.state.readPrimitiveMember(area, 'mrea');
      const postconstructed = this.state.getMember(area, 'postConstructed');
      if (postconstructed.offset === 0) {
        if (this.areaMeshes.has(mrea)) {
          this.areaMeshes.get(mrea).dispose();
          this.areaMeshes.delete(mrea);
        }
      } else {
        if (this.areaMeshes.has(mrea)) {
          continue;
        }
        const mesh = this.createMeshForPostConstructed(mrea, postconstructed);
        this.areaMeshes.set(mrea, mesh);
      }
    }
  }

  private createMeshForPostConstructed(mrea: number, postconstructed: MemoryObjectInstance): BABYLON.Mesh {
    const octTreePtr = this.state.getMember(postconstructed, 'collision');
    const octTree = this.state.getMember(octTreePtr, 'value');
    const edgeCount = this.state.readPrimitiveMember(octTree, 'edgeCount');
    const polyCount = this.state.readPrimitiveMember(octTree, 'polyCount');
    const vertCount = this.state.readPrimitiveMember(octTree, 'vertCount');
    const edgeOffset = this.state.getMember(octTree, 'edges').offset;
    const polyOffset = this.state.getMember(octTree, 'polyEdges').offset;
    const vertOffset = this.state.getMember(octTree, 'verts').offset;

    // const edges = this.state.getRawU16Buffer(edgeOffset, edgeCount * 2); // 2 u16 each
    // const poly = this.state.getRawU16Buffer(polyOffset, polyCount * 3); // 3 u16 each
    // const verts = this.state.getRawF32Buffer(vertOffset, vertCount * 3); // 3 f32 each

    const mem = this.state.memoryView;

    const mesh = new BABYLON.Mesh('area 0x' + mrea.toString(16), this.scene);

    const positions = new Float32Array(vertCount * 3);
    for (let i = 0; i < vertCount * 3; i++) {
      positions[i] = mem.f32(vertOffset + i * 4);
    }
    const indices = [];

    for (let i = 0; i < polyCount; i++) {
      const triEdges = [
        mem.u16(polyOffset + (i * 3) * 2),
        mem.u16(polyOffset + (i * 3 + 1) * 2),
        mem.u16(polyOffset + (i * 3 + 2) * 2)
      ];
      const line1 = [
        mem.u16(edgeOffset + (triEdges[0] * 2) * 2),
        mem.u16(edgeOffset + (triEdges[0] * 2 + 1) * 2),
      ];
      const line2: [number, number] = [
        mem.u16(edgeOffset + (triEdges[1] * 2) * 2),
        mem.u16(edgeOffset + (triEdges[1] * 2 + 1) * 2),
      ];
      const line3: [number, number] = [
        mem.u16(edgeOffset + (triEdges[2] * 2) * 2),
        mem.u16(edgeOffset + (triEdges[2] * 2 + 1) * 2),
      ];
      const i1 = line1[0];
      let i2: number;
      let otherLine: [number, number];
      let i3: number;
      if (line1[0] === line2[0]) {
        [i2, otherLine] = [line2[1], line3];
      } else if (line1[0] === line2[1]) {
        [i2, otherLine] = [line2[0], line3];
      } else if (line1[0] === line3[0]) {
        [i2, otherLine] = [line3[1], line2];
      } else {
        [i2, otherLine] = [line3[0], line2];
      }
      if (i2 === otherLine[0]) {
        i3 = otherLine[1];
      } else {
        i3 = otherLine[0];
      }

      indices.push(i1, i2, i3);
    }

    const vertexData = new BABYLON.VertexData();

    vertexData.positions = positions;
    vertexData.indices = indices;

    vertexData.applyToMesh(mesh);
    mesh.material = this.collisionMat;

    return mesh;
  }
}
