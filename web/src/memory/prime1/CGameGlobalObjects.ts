import {MemoryObject, addOffset, MemoryOffset, Uint8, Pointer} from '../MemoryObject';
import {CSimplePool} from './CSimplePool';
import {CGameState} from './CGameState';

export class CGameGlobalObjects implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 0;
  readonly testOff = new Uint8(this.memory, 0x00);
  readonly mainPool = new CSimplePool(this.memory, addOffset(this.offset, 0xCC));
  readonly gameState = new Pointer(this.memory, addOffset(this.offset, 0x134), CGameState)
}
