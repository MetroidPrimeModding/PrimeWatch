import {MemoryOffset, MemoryView, Uint32} from '../MemoryObject';

export class CRandom16 {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  seed(): Uint32 {
    return new Uint32(this.memory, this.offset);
  }
}
