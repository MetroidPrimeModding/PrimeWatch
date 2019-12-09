import {Injectable} from '@angular/core';
import {CGameGlobalObjects} from '../memory/prime1/CGameGlobalObjects';
import {MemoryView} from '../memory/MemoryObject';
import {CStateManager} from '../memory/prime1/CStateManager';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private memoryBuffer = new ArrayBuffer(0x1800000);
  private memoryDataView = new DataView(this.memoryBuffer);
  private memoryView = new MemoryView(this.memoryDataView);
  readonly globalObjects = new CGameGlobalObjects(this.memoryView, 0x80457798);
  readonly stateManager = new CStateManager(this.memoryView, 0x8045A1A8);

  private refreshSubject = new Subject<void>();

  constructor() {
    (<any> window).require('electron').ipcRenderer.send('loadTestData');
    (<any> window).require('electron').ipcRenderer.on('loadTestData', (event, v) => {
      const input = <Uint8Array> v;
      const out = new Uint8Array(this.memoryBuffer);
      out.set(input, 0);
      setTimeout(() => {
        this.refresh();
      });
    });
  }

  get onRefresh(): Observable<void> {
    return this.refreshSubject;
  }

  refresh() {
    this.refreshSubject.next();
  }
}
