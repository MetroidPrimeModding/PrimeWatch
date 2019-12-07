import {MemoryView} from '../MemoryObject';

export class CGameState {
  constructor(readonly memory: MemoryView, readonly offset: number) {
  }

  mlvlId(): number {
    return this.memory.u32(this.offset + 0x84);
  }

  playtime(): number {
    return this.memory.f64(this.offset + 0xA0)
  }
}
