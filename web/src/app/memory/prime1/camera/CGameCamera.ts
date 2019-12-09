import {Float32, MemoryOffset, MemoryView, Uint32} from '../../MemoryObject';
import {CActor} from '../entities/CActor';
import {CMatrix4f} from '../math/CMatrix4f';
import {CTransform} from '../math/CTransform';

export class CGameCamera extends CActor {
  constructor(memory: MemoryView, offset: MemoryOffset) {
    super(memory, offset);
  }

  watchedObject(): Uint32 {
    return new Uint32(this.memory, this.offset + 0xE8);
  }

  perspectiveMatrixs(): CMatrix4f {
    return new CMatrix4f(this.memory, this.offset + 0xEC);
  }

  get camTransform(): CTransform {
    return new CTransform(this.memory, this.offset + 0x12C);
  }

  get currentFoV(): Float32 {
    return new Float32(this.memory,this.offset + 0x15C)
  }
  get znear(): Float32 {
    return new Float32(this.memory,this.offset + 0x160)
  }
  get zfar(): Float32 {
    return new Float32(this.memory,this.offset + 0x164)
  }
  get aspect(): Float32 {
    return new Float32(this.memory,this.offset + 0x168)
  }
  get fov(): Float32 {
    return new Float32(this.memory,this.offset + 0x184)
  }
}
