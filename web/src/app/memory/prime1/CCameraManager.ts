import {MemoryOffset, MemoryView} from '../MemoryObject';
import {CFirstPersonCamera} from './camera/CFirstPersonCamera';
import {CBallCamera} from './camera/CBallCamera';

export class CCameraManager {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  firstPerson(): CFirstPersonCamera {
    const ptr = this.memory.u32(this.offset + 0x7C);
    return new CFirstPersonCamera(this.memory, ptr);
  }

  ball(): CBallCamera {
    const ptr = this.memory.u32(this.offset + 0x7C);
    return new CBallCamera(this.memory, ptr);
  }
}
