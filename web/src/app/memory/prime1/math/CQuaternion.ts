import {Float32, MemoryObject, MemoryOffset, MemoryView} from '../../MemoryObject';

export class CQuaternion implements MemoryObject {
  static readonly size = 4 * 4;

  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get x(): Float32 {
    return new Float32(this.memory, this.offset);
  }

  get y(): Float32 {
    return new Float32(this.memory, this.offset + 0x4);
  }

  get z(): Float32 {
    return new Float32(this.memory, this.offset + 0x8);
  }

  get w(): Float32 {
    return new Float32(this.memory, this.offset + 0xC);
  }
}
