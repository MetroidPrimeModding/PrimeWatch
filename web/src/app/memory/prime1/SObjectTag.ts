import {MemoryObject, MemoryOffset, MemoryView, Uint32} from '../MemoryObject';

export class SObjectTag implements MemoryObject {
  static readonly size = 0x8;

  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get fourCC(): Uint32 {
    return new Uint32(this.memory, this.offset);
  }

  get id(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x4);
  }
}
