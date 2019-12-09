import {CAABB} from './CAABB';
import {MemoryObject, MemoryOffset, MemoryView} from '../../MemoryObject';

export class CAABBPrimitive implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get aabb(): CAABB {
    return new CAABB(this.memory, this.offset + 0x10);
  }
}
