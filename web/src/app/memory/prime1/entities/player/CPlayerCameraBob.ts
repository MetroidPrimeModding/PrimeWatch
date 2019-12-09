import {Float32, MemoryObject, MemoryOffset, MemoryView} from '../../../MemoryObject';
import {CTransform} from '../../math/CTransform';

export class CPlayerCameraBob implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get cameraBobTransform(): CTransform {
    return new CTransform(this.memory, this.offset + 0x2C);
  }

  get bobMagnitude(): Float32 {
    return new Float32(this.memory, this.offset + 0x10);
  }

  get bobTimeScale(): Float32 {
    return new Float32(this.memory, this.offset + 0x18);
  }
}
