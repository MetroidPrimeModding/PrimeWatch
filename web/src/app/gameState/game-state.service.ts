import {Injectable} from '@angular/core';
import {CGameGlobalObjects} from '../../memory/prime1/CGameGlobalObjects';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private memoryBuffer = new ArrayBuffer(0x1800000);
  private memory = new DataView(this.memoryBuffer);
  readonly globalObjects = new CGameGlobalObjects(this.memory, () => 0x80457798);

  constructor() {
  }
}
