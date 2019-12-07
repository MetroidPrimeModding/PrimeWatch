import {addOffset, Float32, MemoryArray, MemoryObject, MemoryOffset} from '../MemoryObject';

export class CTransform implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 0;

  readonly matrix = new MemoryArray(this.memory, addOffset(this.offset, 0x0), 12, 4, Float32)
}
