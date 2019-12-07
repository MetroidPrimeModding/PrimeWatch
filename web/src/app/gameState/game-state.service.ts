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
    (<any> window).require('electron').ipcRenderer.send('loadTestData');
    (<any> window).require('electron').ipcRenderer.on('loadTestData', (event, v) => {
      const input = <Uint8Array> v;
      const out = new Uint8Array(this.memoryBuffer);
      out.set(input, 0);
    });
  }
}
