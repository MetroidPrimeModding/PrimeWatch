import {MemoryObject, MemoryOffset, MemoryView, Uint32} from '../MemoryObject';
import {RSTLVector} from './rstl/RSTLVector';
import {RSTLAutoPtr} from './rstl/RSTLAutoPtr';
import {CGameArea} from './CGameArea';

export class CWorld implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get phase(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x4)
  }

  get mlvlID(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x8)
  }

  get strgID(): Uint32 {
    return new Uint32(this.memory, this.offset + 0xC)
  }

  get areas(): RSTLVector<RSTLAutoPtr<CGameArea>> {
    return new RSTLVector<RSTLAutoPtr<CGameArea>>(
      this.memory, this.offset + 0x18,
      RSTLAutoPtr.size,
      (offset) => new RSTLAutoPtr<CGameArea>(
        this.memory, offset,
        (areaOffset) => new CGameArea(this.memory, offset)
      )
    )
  }

  get relays(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x2C)
  }

  get currentAreaID(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x68)
  }
}
