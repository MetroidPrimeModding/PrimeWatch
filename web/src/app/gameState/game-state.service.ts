import {Injectable} from '@angular/core';
import {CGameGlobalObjects} from '../../memory/prime1/CGameGlobalObjects';
import {MemoryView} from '../../memory/MemoryObject';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private memoryBuffer = new ArrayBuffer(0x1800000);
  private memoryDataView = new DataView(this.memoryBuffer);
  private memoryView = new MemoryView(this.memoryDataView);
  readonly globalObjects = new CGameGlobalObjects(this.memoryView, 0x80457798);

  constructor() {
    (<any> window).require('electron').ipcRenderer.send('loadTestData');
    (<any> window).require('electron').ipcRenderer.on('loadTestData', (event, v) => {
      const input = <Uint8Array> v;
      const out = new Uint8Array(this.memoryBuffer);
      out.set(input, 0);
    });
  }
}
