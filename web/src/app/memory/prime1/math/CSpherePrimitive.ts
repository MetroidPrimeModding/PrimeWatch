import {Float32, MemoryOffset, MemoryView} from '../../MemoryObject';
import {CVector3f} from './CVector3f';

export class CSpherePrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get origin(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x10);
  }

  get radius(): Float32 {
    return new Float32(this.memory, this.offset + 0x1C);
  }
}
