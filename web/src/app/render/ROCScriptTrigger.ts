import {RenderObject} from './RenderObject';
import {createAABB} from './RenderUtils';
import * as BABYLON from 'babylonjs';
import {MemoryObjectInstance} from '../gameState/game-types.service';
import {RenderService} from './render.service';

export class ROCScriptTrigger extends RenderObject {
  private mesh: BABYLON.Mesh;
  private mat: BABYLON.StandardMaterial;

  constructor(entity: MemoryObjectInstance, render: RenderService) {
    super(entity, render);
    const aabb = render.state.getMember(entity, 'bounds');
    this.mesh = createAABB('Entity 0x' + this.uniqueID.toString(16) + ' box', render, aabb);
    const pos = render.state.readTransformPos(render.state.getMember(entity, 'transform'));
    this.mesh.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);

    this.mat = new BABYLON.StandardMaterial('collisionMat', render.scene);
    this.mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    this.mat.ambientColor = this.mat.diffuseColor;
    this.mat.emissiveColor = this.mat.diffuseColor;
    this.mat.specularColor = this.mat.diffuseColor;

    this.mat.diffuseTexture = render.assets.gridTexture;
    this.mat.opacityTexture = render.assets.gridTexture;
    // this.mat.ambientTexture = render.assets.gridTexture;
    // this.mat.emissiveTexture = render.assets.gridTexture;
    // this.mat.specularTexture = render.assets.gridTexture;
    this.mat.alpha = 0.5;
    // this.mat.alphaMode = BABYLON.Material.MODE
    this.mesh.material = this.mat;
  }

  dispose(): void {
    this.mesh.dispose();
    this.mesh = null;
    this.mat.dispose();
    this.mat = null;
  }

  update(entity: MemoryObjectInstance) {
  }
}
