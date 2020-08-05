import {MemoryObjectInstance} from '../gameState/game-types.service';
import {RenderService} from './render.service';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import NAMES from '../../assets/editor_names.json';
import {RenderObject} from './RenderObject';
import {MemoryWatch} from '../gameState/MemoryWatcher';
import {MemoryView} from '../gameState/MemoryView';

export abstract class RenderObjectEntity extends RenderObject {
  readonly uniqueID: number;
  readonly editorID: number;
  readonly name: string;
  nameText: GUI.TextBlock;

  private readonly watch: MemoryWatch;

  protected constructor(
    public entity: MemoryObjectInstance,
    view: MemoryView,
    private render: RenderService
  ) {
    super();
    this.watch = render.state.memoryWatches.registerMemoryObject(entity);

    const entitySuper = render.state.getSuper(entity, 'CEntity');
    // TODO: parse name and pass it in to constructor
    // const gameState = view.getMember(render.state.globalObjects, 'gameState');
    // const world = render.state.readPrimitiveMember(gameState, 'mlvlID');
    // const names = NAMES;
    // const worldNames = NAMES[world] || {};

    this.uniqueID = view.readPrimitiveMember(entitySuper, 'uniqueID');
    this.editorID = view.readPrimitiveMember(entitySuper, 'editorID');
    // THis name is never right anyway
    // this.name = view.readString(view.getMember(entitySuper, 'name'));

    this.nameText = new GUI.TextBlock();
    // TODO: parse name and pass it in to constructor
    const prettyName = /*worldNames[this.editorID] ||*/ this.name || this.editorID.toString(16);
    this.nameText.text = prettyName + '\n' + this.entity.obj.name;
    this.nameText.color = 'white';
    this.nameText.outlineColor = 'black';
    this.nameText.outlineWidth = 2;
    render.gui.addControl(this.nameText);

    this.nameText.isVisible = false;
  }

  abstract async update(render: RenderService): Promise<void>;

  onPick(render: RenderService) {
    render.state.selectedEntity.next(this.entity);
  }

  dispose(): void {
    super.dispose();
    this.render.state.memoryWatches.deregister(this.watch);
    this.nameText.dispose();
    this.nameText = null;
  }
}

export class ROEntityUnknown extends RenderObjectEntity {
  constructor(entity: MemoryObjectInstance, view: MemoryView, render: RenderService) {
    super(entity, view, render);
  }

  dispose(): void {
    super.dispose();
  }

  async update(render: RenderService): Promise<void> {
  }
}
