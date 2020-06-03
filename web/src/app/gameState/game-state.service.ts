import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {CompiledEnum, CompiledMember, CompiledStruct} from '@pwootage/bstruct/lib/BCompiler_JSON';
import {MemoryView} from './MemoryView';
import {MemoryObjectInstance, GameTypesService, MemoryObject} from "./game-types.service";

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

  getMember(obj: MemoryObjectInstance, memberName: CompiledMember | string): MemoryObjectInstance {
    let member: CompiledMember;
    if (typeof(memberName) === 'string') {
      member = this.types.lookupMember(obj.obj, memberName);
    } else {
      member = memberName;
    }
    const memberType = this.types.lookup(member.type);
    const offset = obj.offset + member.offset;
    if (member.pointer) {
      const ptr = this.memoryView.u32(offset);
      return {obj: memberType, offset: ptr};
    } else {
      return {obj: memberType, offset};
    }
  }

  readPrimitiveMember(obj: MemoryObjectInstance, memberName: CompiledMember | string): number | null {
    let member: CompiledMember;
    if (typeof(memberName) === 'string') {
      member = this.types.lookupMember(obj.obj, memberName);
    } else {
      member = memberName;
    }
    const memberType = this.types.lookup(member.type);
    if (memberType.type !== 'primitive') {
      return null;
    }

    let toRead = obj.offset + member.offset;
    if (member.pointer) {
      toRead = this.memoryView.u32(toRead);
    }
    let value = memberType.read(this.memoryView, toRead);

    if (member.bit != null && typeof(value) === 'number') {
      value = (value >> (member.bit - 24)) & ((1 << member.bitLength) - 1);
    }
    return value;
  }

  getMemberArray(obj: MemoryObjectInstance, memberName: CompiledMember | string, index: number): MemoryObjectInstance {
    let member: CompiledMember;
    if (typeof(memberName) === 'string') {
      member = this.types.lookupMember(obj.obj, memberName);
    } else {
      member = memberName;
    }
    const memberType = this.types.lookup(member.type);
    const offset = obj.offset + member.offset;
    if (member.pointer) {
      const ptr = this.memoryView.u32(offset);
      return {obj: memberType, offset: ptr + memberType.size * index};
    } else {
      return {obj: memberType, offset: offset + memberType.size * index};
    }
  }
}
