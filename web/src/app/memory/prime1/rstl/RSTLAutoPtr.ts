import {MemoryObject, MemoryOffset, MemoryView, Uint32, Uint8} from '../../MemoryObject';

export class RSTLAutoPtr<T> implements MemoryObject {
  static readonly size = 8;

  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset,
              readonly construct: (MemoryOffset) => T) {
  }

  get unknown(): Uint32 {
    return new Uint32(this.memory, this.offset);
  }

  get referenced(): Uint8 {
    return new Uint8(this.memory, this.offset);
  }

  get data(): T {
    const ptr = this.memory.u32(this.offset + 0x4);
    return this.construct(ptr);
  }
}
