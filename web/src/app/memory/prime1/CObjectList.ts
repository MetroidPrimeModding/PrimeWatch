import {MemoryArray, MemoryObject, MemoryOffset, MemoryView, Uint16, Uint32} from '../MemoryObject';
import {CEntity} from './entities/CEntity';

export class CObjectList implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get list(): MemoryArray<SObjectListEntry> {
    return new MemoryArray<SObjectListEntry>(
      this.memory, this.offset + 0x4,
      SObjectListEntry.size, 1024,
      (off) => new SObjectListEntry(this.memory, off)
    );
  }

  get typeEnum(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x2004);
  }

  get firstId(): Uint16 {
    return new Uint16(this.memory, this.offset + 0x2008);
  }

  get size(): Uint16 {
    return new Uint16(this.memory, this.offset + 0x200A);
  }
}

export class SObjectListEntry implements MemoryObject {
  static readonly size = 8;

  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get entity(): CEntity {
    const ptr = this.memory.u32(this.offset);
    return new CEntity(this.memory, ptr);
  }

  get next(): Uint16 {
    return new Uint16(this.memory, this.offset + 0x4);
  }

  get prev(): Uint16 {
    return new Uint16(this.memory, this.offset + 0x6);
  }
}
