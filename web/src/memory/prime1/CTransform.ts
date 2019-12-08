import {MemoryArray, MemoryView} from '../MemoryObject';

export class CTransform {
  constructor(readonly memory: MemoryView, readonly offset: number) {
  }

  matrix(): MemoryArray<number> {
    return new MemoryArray(
      this.memory, this.offset,
      4, 12,
      (off) => this.memory.f32(off)
    )
  }
}
