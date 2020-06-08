import * as BABYLON from 'babylonjs';
import {RenderService} from "./render.service";

export class RenderObject implements BABYLON.IDisposable {
  dispose(): void {
  }

  get isPickable(): boolean {
    return false;
  }

  get position(): [number, number, number] | null {
    return null;
  }

  onPick(render: RenderService) {
  }

  onDeselect(render: RenderService) {
  }

  onSelect(render: RenderService) {
  }
}
