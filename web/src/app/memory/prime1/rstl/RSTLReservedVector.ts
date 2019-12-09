import {MemoryArray, MemoryOffset, MemoryView, Uint32} from '../../MemoryObject';

export class RSTLVector<T> {
  static readonly size = 12;

  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset,
              readonly stride: number,
              readonly capacity: number,
              readonly construct: (MemoryOffset) => T) {
  }


  get size(): Uint32 {
    return new Uint32(this.memory, this.offset);
  }

  get array(): MemoryArray<T> {
    return new MemoryArray<T>(
      this.memory, this.offset + 0x4,
      this.stride, this.capacity,
      this.construct
    )
  }
}
