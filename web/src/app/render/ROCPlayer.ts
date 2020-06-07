import {RenderObject} from './RenderObject';
import {MemoryObjectInstance} from '../gameState/game-types.service';
import {RenderService} from './render.service';
import * as BABYLON from 'babylonjs';
import {createAABB} from './RenderUtils';

export class ROCPlayer extends RenderObject {
  private samusMesh: BABYLON.Mesh;
  private mat: BABYLON.StandardMaterial;

  constructor(entity: MemoryObjectInstance, render: RenderService) {
    super(entity, render);

    const aabbPrimitive = render.state.getMember(entity, 'collisionPrimitive');
    const aabb = render.state.getMember(aabbPrimitive, 'aabb');
    this.samusMesh = createAABB(`Entity 0x${this.uniqueID.toString(16)} box`, render, aabb, true);

    // Move the mesh
    const max = render.state.readVector3(render.state.getMember(aabb, 'max'));
    const pos = render.state.readVector3(render.state.getMember(entity, 'translation'));
    this.samusMesh.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);

    this.mat = new BABYLON.StandardMaterial('collisionMat', render.scene);
    this.mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    this.samusMesh.material = this.mat;
  }

  update(entity: MemoryObjectInstance) {
    // Do nothing
  }

  dispose() {
    this.samusMesh.dispose();
    this.samusMesh = null;
    this.mat.dispose();
    this.mat = null;
  }
}
