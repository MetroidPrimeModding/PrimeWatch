import {MemoryView} from '../MemoryObject';
import {CSimplePool} from './CSimplePool';
import {CGameState} from './CGameState';

export class CGameGlobalObjects {
  constructor(readonly memory: MemoryView, readonly offset: number) {
  }

  mainPool(): CSimplePool {
    return new CSimplePool(this.memory, this.offset + 0xCC);
  }

  gameState(): CGameState {
    const ptr = this.memory.u32(this.offset + 0x134);
    return new CGameState(this.memory, ptr);
  }
}
