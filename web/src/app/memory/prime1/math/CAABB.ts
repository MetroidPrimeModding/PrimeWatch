import {CVector3f} from './CVector3f';
import {MemoryObject, MemoryOffset, MemoryView} from '../../MemoryObject';

export class CAABB implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get min(): CVector3f {
    return new CVector3f(this.memory, this.offset);
  }

  get max(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0xC);
  }
}
