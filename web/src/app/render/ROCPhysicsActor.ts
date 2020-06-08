import {RenderObjectEntity} from './RenderObjectEntity';
import {MemoryObjectInstance} from '../gameState/game-types.service';
import {RenderService} from './render.service';
import * as BABYLON from 'babylonjs';
import {createAABB} from './RenderUtils';

export class ROCPhysicsActor extends RenderObjectEntity {
  private mesh: BABYLON.Mesh;
  private mat: BABYLON.StandardMaterial;

  constructor(entity: MemoryObjectInstance, render: RenderService) {
    super(entity, render);
    const physicsActor = render.state.getSuper(entity, 'CPhysicsActor');

    const translation = render.state.getMember(physicsActor, 'translation');
    const pos = render.state.readVector3(translation);

    const aabbPrimitive = render.state.getMember(physicsActor, 'collisionPrimitive');
    const aabb = render.state.getMember(aabbPrimitive, 'aabb');
    this.mesh = createAABB(`Entity 0x${this.uniqueID.toString(16)} box`, render, aabb);
    this.mesh.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);

    this.mat = new BABYLON.StandardMaterial('collisionMat', render.scene);
    this.mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    this.mat.ambientColor = this.mat.diffuseColor;
    this.mat.emissiveColor = this.mat.diffuseColor;
    this.mat.specularColor = this.mat.diffuseColor;
    this.mesh.material = this.mat;
    this.mesh.metadata = this;

    this.nameText.linkWithMesh(this.mesh);
    this.nameText.color = '#888';
    this.nameText.isVisible = true;
  }

  update(render: RenderService, entity: MemoryObjectInstance) {
    // Do nothing
  }

  dispose() {
    super.dispose();
    this.mesh.dispose();
    this.mesh = null;
    this.mat.dispose();
    this.mat = null;
  }

  get isPickable(): boolean {
    return true;
  }

  onDeselect(render: RenderService) {
    super.onDeselect(render);
    this.mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    this.mat.ambientColor = this.mat.diffuseColor;
    this.mat.emissiveColor = this.mat.diffuseColor;
    this.mat.specularColor = this.mat.diffuseColor;
    this.nameText.color = '#888';
  }

  onSelect(render: RenderService) {
    super.onSelect(render);
    this.mat.diffuseColor = new BABYLON.Color3(1.0, 0.4, 0.4);
    this.mat.ambientColor = this.mat.diffuseColor;
    this.mat.emissiveColor = this.mat.diffuseColor;
    this.mat.specularColor = this.mat.diffuseColor;
    this.nameText.color = '#FFF';
  }
}
