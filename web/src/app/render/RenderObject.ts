import * as BABYLON from 'babylonjs';

export class RenderObject implements BABYLON.IDisposable {
  dispose(): void {
  }

  get isPickable(): boolean {
    return false;
  }

  onPick() {
  }

  onDeselect() {
  }

  onSelect() {
  }
}
