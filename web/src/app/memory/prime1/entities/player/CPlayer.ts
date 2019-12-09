import {Float32, MemoryOffset, MemoryView, Uint32, Uint8} from '../../../MemoryObject';
import {CPlayerGun} from './CPlayerGun';
import {CMorphBall} from './CMorphBall';
import {CPlayerCameraBob} from './CPlayerCameraBob';

export class CPlayer {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get jumpState(): Uint8 {
    return new Uint8(this.memory, this.offset + 0x258);
  }

  get sjTimer(): Float32 {
    return new Float32(this.memory, this.offset + 0x28C);
  }

  get cameraState(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x2F4);
  }

  get morphState(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x2F8);
  }

  get gun(): CPlayerGun {
    const ptr = this.memory.u32(this.offset + 0x490);
    return new CPlayerGun(this.memory, ptr)
  }

  get morphBall(): CMorphBall {
    const ptr = this.memory.u32(this.offset + 0x768);
    return new CMorphBall(this.memory, ptr)
  }

  get cameraBob(): CPlayerCameraBob {
    const ptr = this.memory.u32(this.offset + 0x76C);
    return new CPlayerCameraBob(this.memory, ptr)
  }
}
