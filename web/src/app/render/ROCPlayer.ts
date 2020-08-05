import {RenderObjectEntity} from './RenderObjectEntity';
import {MemoryObjectInstance} from '../gameState/game-types.service';
import {RenderService} from './render.service';
import * as BABYLON from 'babylonjs';
import {createAABB, createTiledAABB} from './RenderUtils';
import * as GUI from 'babylonjs-gui';
import {MemoryView} from '../gameState/MemoryView';

export class ROCPlayer extends RenderObjectEntity {
  private samusMesh: BABYLON.Mesh;
  private mat: BABYLON.StandardMaterial;

  constructor(entity: MemoryObjectInstance, view: MemoryView, render: RenderService) {
    super(entity, view, render);

    const aabbPrimitive = view.getMember(entity, 'collisionPrimitive');
    const aabb = view.getMember(aabbPrimitive, 'aabb');
    this.samusMesh = createAABB(`Entity 0x${this.uniqueID.toString(16)} box`, render, aabb, view, true);

    // Move the mesh
    const pos = view.readVector3(view.getMember(entity, 'translation'));
    this.samusMesh.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);

    this.mat = new BABYLON.StandardMaterial('collisionMat', render.scene);
    this.mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    this.samusMesh.material = this.mat;
    this.samusMesh.metadata = this;

    this.nameText.linkWithMesh(this.samusMesh);
    this.nameText.isVisible = true;
  }

  async update(render: RenderService): Promise<void> {
    const view = await render.state.readObject(this.entity);
    const pos = view.readVector3(view.getMember(this.entity, 'translation'));
    this.samusMesh.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  }

  dispose() {
    super.dispose();
    this.samusMesh.dispose();
    this.samusMesh = null;
    this.mat.dispose();
    this.mat = null;
  }

  get isPickable(): boolean {
    return true;
  }

  onPick(render: RenderService) {
    super.onPick(render);
    console.log(`PICKED ${this.nameText.text}`);
  }
}
