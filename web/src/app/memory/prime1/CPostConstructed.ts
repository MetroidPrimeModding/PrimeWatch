import {MemoryOffset, MemoryView, Uint32Enum} from '../MemoryObject';
import {EOcclusionState} from './CGameArea';

export class CPostConstructed {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get occlusionState(): Uint32Enum<EOcclusionState> {
    return new Uint32Enum<EOcclusionState>(this.memory, this.offset + 0x10DC);
  }
}
