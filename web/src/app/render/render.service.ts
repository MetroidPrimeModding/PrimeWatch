import {Injectable} from '@angular/core';
import {StatsService} from '../canvas/stats.service';

import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {GameStateService} from '../gameState/game-state.service';
import {MemoryObjectInstance} from '../gameState/game-types.service';
import {ROPostConstructed} from './ROPostConstructed';
import {RenderObjectEntity} from './RenderObjectEntity';
import {AssetsService} from './assets.service';
import {CreateROEntity} from './CreateROEntity';
import {RenderObject} from "./RenderObject";

@Injectable({
  providedIn: 'root'
})
export class RenderService {
  element: HTMLCanvasElement;
  scene: BABYLON.Scene;
  camera: BABYLON.ArcRotateCamera;
  engine: BABYLON.Engine;
  gui: GUI.AdvancedDynamicTexture;
  active = true;

  areaMeshes = new Map<number, ROPostConstructed>();
  entities = new Map<number, RenderObjectEntity>();
  collisionMat: BABYLON.StandardMaterial;
  selected: RenderObject | null;

  constructor(
    public stats: StatsService,
    public state: GameStateService,
    public assets: AssetsService
  ) {
    // this.scene = new BABYLON.Scene();

    // const geometry = new BABYLON.BoxGeometry(1, 1, 1);
    // const material = new MeshBasicMaterial({color: 0x00ff00});
    // const cube = new Mesh(geometry, material);
    // this.scene.add(cube);

    // this.camera.position.z = 5;

    this.state.onRefresh.subscribe(() => {
      this.updateSceneFromState();
    });

    this.state.entities.subscribe((entities) => {
      this.updateEntities(entities);
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
    this.assets.load(this.scene);

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

    this.collisionMat = new BABYLON.StandardMaterial('collisionMat', this.scene);
    // this.collisionMat.backFaceCulling = false;

    this.gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      'mainGui',
      true,
      this.scene
    );

    this.scene.onPointerDown = () => {
      const hit = this.pickCast();
      console.log(hit);
      if (hit.pickedMesh) {
        const meta = hit.pickedMesh.metadata;
        if (meta instanceof RenderObject) {
          meta.onPick();
          if (this.selected !== meta) {
            if (this.selected != null) {
              this.selected.onDeselect();
            }
            this.selected = meta;
            meta.onSelect();
          }
        } else {
          if (this.selected != null) {
            this.selected.onDeselect();
            this.selected = null;
          }
        }
      } else {
        if (this.selected != null) {
          this.selected.onDeselect();
          this.selected = null;
        }
      }
    };
  }

  private pickCast() {
    const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, BABYLON.Matrix.Identity(), this.camera);

    return this.scene.pickWithRay(ray, (mesh) => {
      return mesh.isPickable && mesh.isVisible && mesh.metadata && mesh.metadata.isPickable;
    }, false);
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
        const obj = new ROPostConstructed(mrea, this, postconstructed);
        this.areaMeshes.set(mrea, obj);
      }
    }
  }

  private updateEntities(entities: MemoryObjectInstance[]) {
    const unknown = new Set<number>(this.entities.keys());
    for (const entity of entities) {
      const entitySuper = this.state.getSuper(entity, 'CEntity');
      const uid = this.state.readPrimitiveMember(entitySuper, 'uniqueID');
      unknown.delete(uid);
      if (this.entities.has(uid)) {
        this.entities.get(uid).update(this, entity);
      } else {
        const newEntity = CreateROEntity(this, entity);
        this.entities.set(uid, newEntity);
      }
    }

    for (const id of unknown) {
      const v = this.entities.get(id);
      if (v) {
        v.dispose();
      }
      this.entities.delete(id);
    }
    const player = this.entities.get(0x4000000);
    if (player) {
      const pos = this.state.readTransformPos(this.state.getMember(player.entity, 'transform'));
      this.camera.target = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
      this.camera.position = this.camera.target.add(new BABYLON.Vector3(0, 4, 1));
    }
  }
}
