import {addOffset, CString, MemoryObject, MemoryOffset, Uint32, Uint8} from '../../MemoryObject';

export class CEntity implements MemoryObject {
  static ACTIVE_MASK = 0x80;
  static GRAVEYARD_MASK = 0x40;
  static BLOCKED_MASK = 0x20;
  static USE_MASK = 0x10;

  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 0;

  readonly vtable = new Uint32(this.memory, addOffset(this.offset, 0x0));
  readonly areaID = new Uint32(this.memory, addOffset(this.offset, 0x4));
  readonly uniqueID = new Uint32(this.memory, addOffset(this.offset, 0x8));
  readonly editorID = new Uint32(this.memory, addOffset(this.offset, 0xC));
  readonly name = new CString(this.memory, addOffset(this.offset, 0x10));
  readonly status = new Uint8(this.memory, addOffset(this.offset, 0x30));
}

