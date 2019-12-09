import {MemoryOffset, MemoryView, Uint32} from '../../MemoryObject';

export class RSTLVector<T> {
  static readonly size = 12;

  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset,
              readonly stride: number,
              readonly construct: (MemoryOffset) => T) {
  }

  get end(): Uint32 {
    return new Uint32(this.memory, this.offset);
  }

  get size(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x4);
  }

  get first(): MemoryOffset {
    return this.memory.u32(this.offset + 0x8);
  }

  get(index: number) {
    return this.construct(this.first + this.stride * index);
  }
}
