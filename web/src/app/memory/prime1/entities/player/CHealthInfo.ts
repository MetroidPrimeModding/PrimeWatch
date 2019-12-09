import {Float32, MemoryOffset, MemoryView} from '../../../MemoryObject';

export class CHealthInfo {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  health(): Float32 {
    return new Float32(this.memory, this.offset);
  }

  knockbackResistance(): Float32 {
    return new Float32(this.memory, this.offset + 0x4);
  }
}
