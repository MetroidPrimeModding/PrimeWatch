import {MemoryObject, MemoryOffset, MemoryString, MemoryView, Uint32} from '../../MemoryObject';

export class CEntity implements MemoryObject {
  static ACTIVE_MASK = 0x80;
  static GRAVEYARD_MASK = 0x40;
  static BLOCKED_MASK = 0x20;
  static USE_MASK = 0x10;

  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get vtable(): Uint32 {
    return new Uint32(this.memory, this.offset);
  }

  get areaID(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x4);
  }

  get uniqueID(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x8);
  }

  get editorID(): Uint32 {
    return new Uint32(this.memory, this.offset + 0xC);
  }

  get name(): MemoryString {
    return new MemoryString(this.memory, this.offset + 0x10);
  }

  get status(): Uint32 {
    return new Uint32(this.memory, this.offset + 0x30);
  }
}

