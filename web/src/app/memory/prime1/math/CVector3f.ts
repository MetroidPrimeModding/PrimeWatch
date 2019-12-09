import {Float32, MemoryOffset, MemoryView} from '../../MemoryObject';


export class CVector3f {
  static readonly size = 4 * 3;

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
}
