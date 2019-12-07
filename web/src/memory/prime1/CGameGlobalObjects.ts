import {MemoryItem, addOffset, MemoryOffset, Uint8} from '../MemoryObject';
import {CSimplePool} from './CSimplePool';

export class CGameGlobalObjects implements MemoryItem {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 0;
  readonly testOff = new Uint8(this.memory, 0x00);
  readonly mainPool = new CSimplePool(this.memory, addOffset(this.offset, 0xCC));
}
