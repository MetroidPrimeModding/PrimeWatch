import {Float64, MemoryOffset, MemoryView, Uint32} from '../MemoryObject';

export class CGameState {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get mlvlId(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x84);
  }

  get playtime(): Float64 {
    return new Float64(this.memory, this.offset + 0xA0);
  }
}
