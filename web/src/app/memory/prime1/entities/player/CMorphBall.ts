import {MemoryOffset, MemoryView} from '../../../MemoryObject';
import {CSpherePrimitive} from '../../math/CSpherePrimitive';

export class CMorphBall {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get collisionPrimitive(): CSpherePrimitive {
    return new CSpherePrimitive(this.memory, this.offset + 0x38);
  }
}
