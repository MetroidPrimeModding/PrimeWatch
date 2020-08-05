import {RenderObjectEntity} from './RenderObjectEntity';
import {createTiledAABB} from './RenderUtils';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {MemoryObjectInstance} from '../gameState/game-types.service';
import {RenderService} from './render.service';
import {MemoryView} from '../gameState/MemoryView';

export class ROCScriptTrigger extends RenderObjectEntity {
  private mesh: BABYLON.Mesh;
  private mat: BABYLON.StandardMaterial;
  private hasConnections = true;

  constructor(entity: MemoryObjectInstance, view: MemoryView, render: RenderService) {
    super(entity, view, render);
    const aabb = view.getMember(entity, 'bounds');
    this.mesh = createTiledAABB(`Entity 0x${this.uniqueID.toString(16)} box`, render, aabb, view);
    const pos = view.readTransformPos(view.getMember(entity, 'transform'));
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
    this.mesh.metadata = this;

    this.nameText.linkWithMesh(this.mesh);

    // Force initial update
    this.updateColor(render, view);
    this.update(render);
  }

  get isPickable(): boolean {
    return true;
  }

  onPick(render: RenderService) {
    super.onPick(render);
    console.log(`PICKED ${this.nameText.text}`);
  }

  onDeselect(render: RenderService) {
    super.onDeselect(render);
    this.nameText.isVisible = false;
    this.mat.alpha = 0.4;
  }

  onSelect(render: RenderService) {
    super.onSelect(render);
    this.nameText.isVisible = true;
    this.mat.alpha = 1;
  }

  dispose(): void {
    super.dispose();
    this.mesh.dispose();
    this.mesh = null;
    this.mat.dispose();
    this.mat = null;
  }

  async update(render: RenderService): Promise<void> {
    if (!this.hasConnections) {
      return;
    }
    const view = await render.state.readObject(this.entity);
    const active = view.readPrimitiveMember(this.entity, 'active');
    this.mesh.isVisible = !!active;
  }

  private updateColor(render: RenderService, view: MemoryView) {
    const connections = view.getMember(this.entity, 'connections');
    const connCount = view.readPrimitiveMember(connections, 'end');
    if (connCount === 0) {
      this.mesh.isVisible = false;
      this.hasConnections = false;
    }

    if (
      view.readPrimitiveMember(this.entity, 'detectPlayer') ||
      view.readPrimitiveMember(this.entity, 'detectMorphedPlayer') ||
      view.readPrimitiveMember(this.entity, 'detectUnmorphedPlayer')
    ) {
      this.mat.diffuseColor = new BABYLON.Color3(0, 1, 0);
      this.mat.ambientColor = this.mat.diffuseColor;
      this.mat.emissiveColor = this.mat.diffuseColor;
      this.mat.specularColor = this.mat.diffuseColor;
    }
  }
}
