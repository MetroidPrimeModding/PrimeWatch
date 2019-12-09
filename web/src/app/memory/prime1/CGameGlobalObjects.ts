import {MemoryObject, MemoryOffset, MemoryView} from '../MemoryObject';
import {CSimplePool} from './CSimplePool';
import {CGameState} from './CGameState';

export class CGameGlobalObjects implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get mainPool(): CSimplePool {
    return new CSimplePool(this.memory, this.offset + 0xCC);
  }

  get gameState(): CGameState {
    const ptr = this.memory.u32(this.offset + 0x134);
    return new CGameState(this.memory, ptr);
  }
}
