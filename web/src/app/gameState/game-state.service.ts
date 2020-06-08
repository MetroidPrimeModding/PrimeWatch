import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {CompiledEnum, CompiledMember, CompiledStruct} from '@pwootage/bstruct/lib/BCompiler_JSON';
import {MemoryView} from './MemoryView';
import {MemoryObjectInstance, GameTypesService, MemoryObject} from './game-types.service';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private memoryBuffer = new ArrayBuffer(0x1800000);
  private memoryDataView = new DataView(this.memoryBuffer);
  private _memoryView = new MemoryView(this.memoryDataView);
  readonly globalObjects: MemoryObjectInstance;
  readonly stateManager: MemoryObjectInstance;
  readonly selectedEntity = new ReplaySubject<MemoryObjectInstance>(1);

  private refreshSubject = new Subject<void>();
  private entitiesSubject = new ReplaySubject<MemoryObjectInstance[]>(1);

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

    this.refreshSubject.subscribe(() => {
      this.parseEntities();
    });
  }

  get onRefresh(): Observable<void> {
    return this.refreshSubject;
  }

  get entities(): Observable<MemoryObjectInstance[]> {
    return this.entitiesSubject;
  }

  get memoryView(): MemoryView {
    return this._memoryView;
  }

  refresh() {
    this.refreshSubject.next();
  }

  getMember(obj: MemoryObjectInstance, memberName: CompiledMember | string): MemoryObjectInstance {
    const member = this.recursiveMemberLookup(memberName, obj);
    if (member == null) {
      return null;
    }
    const memberType = this.types.lookup(member.type);
    if (memberType == null) {
      return null;
    }
    const offset = obj.offset + member.offset;
    if (member.pointer) {
      const ptr = this.memoryView.u32(offset);
      return {obj: memberType, offset: ptr};
    } else {
      return {obj: memberType, offset};
    }
  }

  getSuper(inst: MemoryObjectInstance, superName?: string): MemoryObjectInstance | null {
    if (inst.obj.name === superName) {
      return inst;
    }
    if (!superName) {
      if (inst.obj.type !== 'struct') {
        return null;
      }
      if (inst.obj.extends == null || inst.obj.extends.length === 0) {
        return null;
      }
      const superType = this.types.lookup(inst.obj.extends[0]);
      return {obj: superType, offset: inst.offset};
    }
    let current = inst;
    while (current) {
      if (current.obj.type !== 'struct') {
        return null;
      }
      if (current.obj.extends == null || current.obj.extends.length === 0) {
        return null;
      }
      const supName = current.obj.extends[0];
      const sup = this.types.lookup(supName);
      if (sup == null) {
        return null;
      } else if (sup.name === superName) {
        return {obj: sup, offset: inst.offset};
      } else {
        current = {obj: sup, offset: inst.offset};
      }
    }
    return null;
  }

  readPrimitiveMember(obj: MemoryObjectInstance, memberName: CompiledMember | string): number | null {
    const member = this.recursiveMemberLookup(memberName, obj);
    const memberType = this.types.lookup(member.type);
    if (memberType.type !== 'primitive') {
      return null;
    }

    let toRead = obj.offset + member.offset;
    if (member.pointer) {
      toRead = this.memoryView.u32(toRead);
    }
    let value = memberType.read(this.memoryView, toRead);

    if (member.bit != null && typeof (value) === 'number') {
      value = (value >> (member.bit)) & ((1 << member.bitLength) - 1);
    }
    return value;
  }

  readVector3(instance: MemoryObjectInstance): [number, number, number] {
    if (instance.obj.name !== 'CVector3f') {
      throw new Error('Attempt to read a non-vector as a vector');
    }
    return [
      this.readPrimitiveMember(instance, 'x'),
      this.readPrimitiveMember(instance, 'y'),
      this.readPrimitiveMember(instance, 'z')
    ];
  }

  getMemberArray(obj: MemoryObjectInstance, memberName: CompiledMember | string, index: number): MemoryObjectInstance {
    let member: CompiledMember;
    if (typeof (memberName) === 'string') {
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

  private parseEntities() {
    const manager = this.stateManager;
    const objects = this.getMember(manager, 'allObjects');
    const first = this.readPrimitiveMember(objects, 'firstID');
    // const size = this.readPrimitiveMember(objects, 'size');

    let count = 0;
    const entities: MemoryObjectInstance[] = [];
    let next = first;
    while (next !== 0xFFFF) {
      const entry = this.getMemberArray(objects, 'list', next & 0x3FF);
      let entity = this.getMember(entry, 'entity');
      const vtable = this.readPrimitiveMember(entity, 'vtable');
      const knownType = this.types.lookupVtable(vtable);
      if (knownType != null) {
        entity = {
          obj: knownType,
          offset: entity.offset
        };
      }
      entities.push(entity);

      count++;
      if (count > 1000) {
        console.log('EMERGENCY');
        break;
      }
      const id = next;
      next = this.readPrimitiveMember(entry, 'next');
      if (next === id) {
        console.log('next == id');
        break;
      }
    }

    this.entitiesSubject.next(entities);
  }

  readTransformPos(instance: MemoryObjectInstance): [number, number, number] {
    if (instance.obj.name !== 'CTransform') {
      throw new Error('Attempt to read a non-vector as a vector');
    }
    return [
      this.readPrimitiveMember(instance, 'posX'),
      this.readPrimitiveMember(instance, 'posY'),
      this.readPrimitiveMember(instance, 'posZ')
    ];
  }

  readString(instance: MemoryObjectInstance, length: number = -1): string | null {
    if (instance.obj.name !== 'u8') {
      throw new Error('Attempt to read a non-u8 as a string');
    }
    if (instance.offset === 0) {
      return null;
    }
    return this.memoryView.string(instance.offset, length);
  }

  private recursiveMemberLookup(memberName: CompiledMember | string, obj: MemoryObjectInstance) {
    let member: CompiledMember;
    if (typeof (memberName) === 'string') {
      let current = obj;
      while (current) {
        member = this.types.lookupMember(current.obj, memberName);
        if (member != null) {
          break;
        }
        current = this.getSuper(current);
      }
    } else {
      member = memberName;
    }
    return member;
  }
}
