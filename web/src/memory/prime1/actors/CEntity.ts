import {MemoryView} from '../../MemoryObject';

export class CEntity {
  static ACTIVE_MASK = 0x80;
  static GRAVEYARD_MASK = 0x40;
  static BLOCKED_MASK = 0x20;
  static USE_MASK = 0x10;

  constructor(readonly memory: MemoryView, readonly offset: number) {
  }

  vtable(): number {
    return this.memory.u32(this.offset);
  }

  areaID(): number {
    return this.memory.u32(this.offset + 0x4);
  }

  uniqueID(): number {
    return this.memory.u32(this.offset + 0x8);
  }

  editorID(): number {
    return this.memory.u32(this.offset + 0xC);
  }

  name(): string {
    return this.memory.string(this.offset + 0x10);
  }

  status(): number {
    return this.memory.u32(this.offset + 0x30);
  }
}

