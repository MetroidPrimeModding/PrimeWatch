import {MemoryObjectInstance} from '../gameState/game-types.service';
import {RenderService} from './render.service';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import NAMES from '../../assets/editor_names.json';

export abstract class RenderObject implements BABYLON.IDisposable {
  readonly uniqueID: number;
  readonly editorID: number;
  readonly name: string;

  nameText: GUI.TextBlock;

  constructor(
    public entity: MemoryObjectInstance,
    render: RenderService
  ) {
    const entitySuper = render.state.getSuper(entity, 'CEntity');
    const gameState = render.state.getMember(render.state.globalObjects, 'gameState');
    const world = render.state.readPrimitiveMember(gameState, 'mlvlID');

    this.uniqueID = render.state.readPrimitiveMember(entitySuper, 'uniqueID');
    this.editorID = render.state.readPrimitiveMember(entitySuper, 'editorID');
    this.name = render.state.readString(render.state.getMember(entitySuper, 'name'));

    const names = NAMES;
    const worldNames = NAMES[world] || {};

    this.nameText = new GUI.TextBlock();
    this.nameText.text = worldNames[this.editorID] || this.name || this.editorID.toString(16);
    this.nameText.color = 'white';
    this.nameText.outlineColor = 'black';
    this.nameText.outlineWidth = 2;
    render.gui.addControl(this.nameText);

    this.nameText.isVisible = false;
  }

  abstract update(render: RenderService, entity: MemoryObjectInstance);

  dispose(): void {
    this.nameText.dispose();
    this.nameText = null;
  }
}

export class ROEntityUnknown extends RenderObject {
  constructor(entity: MemoryObjectInstance, render: RenderService) {
    super(entity, render);
  }

  dispose(): void {
    super.dispose();
  }

  update(render: RenderService, entity: MemoryObjectInstance) {
  }
}
