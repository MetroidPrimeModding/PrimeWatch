import {MemoryObject, MemoryOffset, MemoryView, Uint32, Uint32Bit, Uint32Enum} from '../MemoryObject';
import {CPostConstructed} from './CPostConstructed';

export enum EPhase {
  LoadHeader,
  LoadSecSizes,
  ReserveSections,
  LoadDataSections,
  WaitForFinish
}

export enum EChain {
  Invalid = -1,
  ToDeallocate,
  Deallocated,
  Loading,
  Alive,
  AliveJudgement
}

export enum EOcclusionState {
  Occluded,
  Visible
}

export class CGameArea implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get selfIDX(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x4);
  }

  get nameStrg(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x8);
  }

  get mrea(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x84);
  }

  get areaID(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x88);
  }

  get postConstructedBool(): Uint32Bit {
    return new Uint32Bit(this.memory, this.offset + 0xF0, 24);
  }

  get active(): Uint32Bit {
    return new Uint32Bit(this.memory, this.offset + 0xF0, 25);
  }

  get tokensReady(): Uint32Bit {
    return new Uint32Bit(this.memory, this.offset + 0xF0, 26);
  }

  get loadPaused(): Uint32Bit {
    return new Uint32Bit(this.memory, this.offset + 0xF0, 27);
  }

  get validated(): Uint32Bit {
    return new Uint32Bit(this.memory, this.offset + 0xF0, 28);
  }

  get phase(): Uint32Enum<EPhase> {
    return new Uint32Enum<EPhase>(this.memory, this.offset + 0xF4);
  }

  get loadTransactions(): Uint32 {
    return new Uint32(this.memory, this.offset + 0xF8);
  }

  get curChain(): Uint32Enum<EChain> {
    return new Uint32Enum<EChain>(this.memory, this.offset + 0x138);
  }

  get postConstructed(): CPostConstructed {
    const ptr = this.memory.u32(this.offset + 0x12C);
    return new CPostConstructed(this.memory, ptr);
  }
}
