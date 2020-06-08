import {RenderObject} from './RenderObject';
import {createAABB} from './RenderUtils';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {MemoryObjectInstance} from '../gameState/game-types.service';
import {RenderService} from './render.service';

export class ROCScriptTrigger extends RenderObject {
  private mesh: BABYLON.Mesh;
  private mat: BABYLON.StandardMaterial;
  private hasConnections = true;

  constructor(entity: MemoryObjectInstance, render: RenderService) {
    super(entity, render);
    const aabb = render.state.getMember(entity, 'bounds');
    this.mesh = createAABB(`Entity 0x${this.uniqueID.toString(16)} box`, render, aabb);
    const pos = render.state.readTransformPos(render.state.getMember(entity, 'transform'));
    this.mesh.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);

    this.mat = new BABYLON.StandardMaterial(`Entity 0x${this.uniqueID.toString(16)} material`, render.scene);
    this.mat.diffuseColor = new BABYLON.Color3(1, 0, 1);
    this.mat.ambientColor = this.mat.diffuseColor;
    this.mat.emissiveColor = this.mat.diffuseColor;
    this.mat.specularColor = this.mat.diffuseColor;

    this.mat.diffuseTexture = render.assets.gridTexture;
    this.mat.opacityTexture = render.assets.gridTexture;
    // this.mat.ambientTexture = render.assets.gridTexture;
    // this.mat.emissiveTexture = render.assets.gridTexture;
    // this.mat.specularTexture = render.assets.gridTexture;
    this.mat.alpha = 0.4;
    // this.mat.alphaMode = BABYLON.Material.MODE
    this.mesh.material = this.mat;
    this.mesh.actionManager = new BABYLON.ActionManager(render.scene);
    this.mesh.actionManager.registerAction(new BABYLON.SetValueAction(
      BABYLON.ActionManager.OnPointerOverTrigger,
      this.nameText,
      'isVisible',
      true
    ));
    this.mesh.actionManager.registerAction(new BABYLON.SetValueAction(
      BABYLON.ActionManager.OnPointerOverTrigger,
      this.mat,
      'alpha',
      1
    ));
    this.mesh.actionManager.registerAction(new BABYLON.SetValueAction(
      BABYLON.ActionManager.OnPointerOutTrigger,
      this.mat,
      'alpha',
      0.4
    ));
    this.mesh.actionManager.registerAction(new BABYLON.SetValueAction(
      BABYLON.ActionManager.OnPointerOutTrigger,
      this.nameText,
      'isVisible',
      false
    ));

    this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPickTrigger,
      (event) => {
        console.log(`PICKED ${this.nameText.text}`);
      }
    ));

    this.nameText.linkWithMesh(this.mesh);

    // Force initial update
    this.updateColor(render, entity);
    this.update(render, entity);
  }

  dispose(): void {
    super.dispose();
    this.mesh.dispose();
    this.mesh = null;
    this.mat.dispose();
    this.mat = null;
  }

  update(render: RenderService, entity: MemoryObjectInstance) {
    if (!this.hasConnections) {
      return;
    }
    const active = render.state.readPrimitiveMember(entity, 'active');
    this.mesh.isVisible = !!active;
  }

  private updateColor(render: RenderService, entity: MemoryObjectInstance) {
    const connections = render.state.getMember(entity, 'connections');
    const connCount = render.state.readPrimitiveMember(connections, 'end');
    if (connCount === 0) {
      this.mesh.isVisible = false;
      this.hasConnections = false;
    }

    if (render.state.readPrimitiveMember(entity, 'detectPlayer')) {
      this.mat.diffuseColor = new BABYLON.Color3(0, 1, 0);
      this.mat.ambientColor = this.mat.diffuseColor;
      this.mat.emissiveColor = this.mat.diffuseColor;
      this.mat.specularColor = this.mat.diffuseColor;
    }
  }
}
