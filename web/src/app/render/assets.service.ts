import { Injectable } from '@angular/core';
import * as BABYLON from 'babylonjs';

@Injectable({
  providedIn: 'root'
})
export class AssetsService {
  gridTexture: BABYLON.Texture;

  constructor() {
  }

  load(scene: BABYLON.Scene) {
    this.gridTexture = new BABYLON.Texture(
      'assets/textures/grid.png',
      scene,
      true,
      false,
      BABYLON.Texture.NEAREST_SAMPLINGMODE
    );
    this.gridTexture.hasAlpha = true;
    // this.gridTexture.uScale = 3;
    // this.gridTexture.vScale = 3;
  }
}
