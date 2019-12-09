import {Float32, MemoryObject, MemoryOffset, MemoryView} from '../../../MemoryObject';

export class CHealthInfo implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  health(): Float32 {
    return new Float32(this.memory, this.offset);
  }

  knockbackResistance(): Float32 {
    return new Float32(this.memory, this.offset + 0x4);
  }
}
