import {Float32, MemoryArray, MemoryOffset, MemoryView} from '../../MemoryObject';

export class CTransform {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get matrix(): MemoryArray<Float32> {
    return new MemoryArray(
      this.memory, this.offset,
      4, 12,
      (off) => new Float32(this.memory, off)
    )
  }
}
