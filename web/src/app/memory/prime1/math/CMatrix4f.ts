import {Float32, MemoryArray, MemoryOffset, MemoryView} from '../../MemoryObject';

export class CMatrix4f {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get matrix(): MemoryArray<Float32> {
    return new MemoryArray(
      this.memory, this.offset,
      4, 16,
      (off) => new Float32(this.memory, off)
    )
  }
}
