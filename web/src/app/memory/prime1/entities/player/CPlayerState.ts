import {MemoryObject, MemoryOffset, MemoryView, Uint32} from '../../../MemoryObject';
import {CHealthInfo} from './CHealthInfo';

export class CPlayerState implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get currentBeam(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x8);
  }

  get healthInfo(): CHealthInfo {
    return new CHealthInfo(this.memory, this.offset + 0xC);
  }

  get currentVisor(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x14);
  }

  get currentSuit(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x20);
  }

  get items(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x14);
  }
}
