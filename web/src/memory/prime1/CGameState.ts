import {addOffset, Float64, MemoryObject, MemoryOffset, Uint32} from '../MemoryObject';

export class CGameState implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 0;

  readonly mlvlId = new Uint32(this.memory, addOffset(this.offset, 0x84));
  readonly playtime = new Float64(this.memory, addOffset(this.offset, 0xA0))
}
