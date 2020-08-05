import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {CompiledEnum, CompiledMember, CompiledStruct} from '@pwootage/bstruct/lib/BCompiler_JSON';
import {MemoryView} from './MemoryView';
import {MemoryObjectInstance, GameTypesService, MemoryObject} from './game-types.service';
import {MemoryWatcher} from './MemoryWatcher';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  // TODO: maybe delete these watches, they're probably unused
  readonly memoryWatches = new MemoryWatcher();
  readonly globalObjects: MemoryObjectInstance;
  readonly stateManager: MemoryObjectInstance;
  readonly selectedEntity = new ReplaySubject<MemoryObjectInstance>(1);

  private refreshSubject = new Subject<void>();
  private entitiesSubject = new ReplaySubject<MemoryObjectInstance[]>(1);
  private ipcRenderer: any;

  constructor(public types: GameTypesService) {
    this.ipcRenderer = (window as any).require('electron').ipcRenderer;

    this.globalObjects = {
      obj: types.lookup('CGameGlobalObjects'),
      offset: 0x80457798
    };
    this.stateManager = {
      obj: types.lookup('CStateManager'),
      offset: 0x8045A1A8
    };
    // register the global objects and state manager (we can ignore the results because they will remain permanently registered
    this.memoryWatches.registerMemoryObject(this.globalObjects);
    this.memoryWatches.registerMemoryObject(this.stateManager);

    this.refreshSubject.subscribe(() => {
      const start = new Date();
      this.parseEntities().then(() => {
        const end = new Date();
        console.log(`Done updating in ${+end - +start}ms`);
      });
    });
  }

  get onRefresh(): Observable<void> {
    return this.refreshSubject;
  }

  get entities(): Observable<MemoryObjectInstance[]> {
    return this.entitiesSubject;
  }

  refresh() {
    this.refreshSubject.next();
  }

  async readMemory(offset: number, length: number): Promise<MemoryView> {
    if (offset + length > 0x81800000) {
      throw new Error(`INVALID READ OFFSET + LEN ${offset.toString(16)}:${length}`);
    }
    // console.log(`Requesting ${offset.toString(16)}:${length}`);
    const result = await this.ipcRenderer.invoke('readMemory', offset, length);
    // console.log(`Got ${offset.toString(16)}:${length}`);
    const input = result.data as Uint8Array;
    const res = new MemoryView(
      this,
      new DataView(input.buffer),
      offset,
      length
    );
    return res;
  }

  async readObject(instance: MemoryObjectInstance): Promise<MemoryView> {
    let size = instance.obj.size;
    if (size === 0) {
      console.error(`Attempt to load 0-size object, reading 64 bytes instead: ${JSON.stringify(instance, null, 2)}`);
      size = 64;
    }
    return this.readMemory(instance.offset, size);
  }

  private async parseEntities() {
    const managerView = await this.readObject(this.stateManager);
    const objects = managerView.getMember(this.stateManager, 'allObjects');

    const objectsView = await this.readObject(objects);
    const first = objectsView.readPrimitiveMember(objects, 'firstID');
    // const size = this.readPrimitiveMember(objects, 'size');

    let count = 0;
    const entities: MemoryObjectInstance[] = [];
    let next = first;
    while (next !== 0xFFFF) {
      const entry = objectsView.getMemberArray(objects, 'list', next & 0x3FF);
      let entity = objectsView.getMember(entry, 'entity');
      const entityView = await this.readObject(entity);
      const vtable = entityView.readPrimitiveMember(entity, 'vtable');
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
      next = objectsView.readPrimitiveMember(entry, 'next');
      if (next === id) {
        console.log('next == id');
        break;
      }
    }

    this.entitiesSubject.next(entities);
  }

  recursiveMemberLookup(memberName: CompiledMember | string, obj: MemoryObjectInstance) {
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
}
