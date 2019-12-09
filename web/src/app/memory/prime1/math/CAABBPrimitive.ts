import {CAABB} from './CAABB';
import {MemoryOffset, MemoryView} from '../../MemoryObject';

export class CAABBPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get aabb(): CAABB {
    return new CAABB(this.memory, this.offset + 0x10);
  }
}
