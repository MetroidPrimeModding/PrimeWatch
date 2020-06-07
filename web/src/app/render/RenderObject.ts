import {MemoryObjectInstance} from '../gameState/game-types.service';
import {RenderService} from './render.service';
import * as BABYLON from 'babylonjs';

export abstract class RenderObject implements BABYLON.IDisposable {
  readonly uniqueID: number;

  constructor(
    public entity: MemoryObjectInstance,
    render: RenderService
  ) {
    const entitySuper = render.state.getSuper(entity, 'CEntity');
    this.uniqueID = render.state.readPrimitiveMember(entitySuper, 'uniqueID');
  }

  abstract update(entity: MemoryObjectInstance);

  abstract dispose(): void;
}

export class ROEntityUnknown extends RenderObject {
  constructor(entity: MemoryObjectInstance, render: RenderService) {
    super(entity, render);
  }

  dispose(): void {
  }

  update(entity: MemoryObjectInstance) {
  }
}
