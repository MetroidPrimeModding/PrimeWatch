import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {CompiledEnum, CompiledStruct} from '@pwootage/bstruct/lib/BCompiler_JSON';
import {MemoryView} from './MemoryView';
import {MemoryObjectInstance, GameTypesService} from "./game-types.service";

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private memoryBuffer = new ArrayBuffer(0x1800000);
  private memoryDataView = new DataView(this.memoryBuffer);
  private _memoryView = new MemoryView(this.memoryDataView);
  readonly globalObjects: MemoryObjectInstance;
  readonly stateManager: MemoryObjectInstance;

  private refreshSubject = new Subject<void>();

  constructor(private types: GameTypesService) {
    this.globalObjects = {
      obj: types.lookup('CGameGlobalObjects'),
      offset: 0x80457798
    };
    this.stateManager = {
      obj: types.lookup('CStateManager'),
      offset: 0x8045A1A8
    };

    (window as any).require('electron').ipcRenderer.send('loadTestData');
    (window as any).require('electron').ipcRenderer.on('loadTestData', (event, v) => {
      const input = v as Uint8Array;
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

  get memoryView(): MemoryView {
    return this._memoryView;
  }

  refresh() {
    this.refreshSubject.next();
  }
}
