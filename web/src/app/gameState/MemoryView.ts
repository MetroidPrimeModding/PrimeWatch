export type MemoryOffset = number;

export class MemoryView {
  constructor(readonly memory: DataView) {
  }

  fixOffset(offset: MemoryOffset): number | null {
    if (offset < 0x8000_0000) {
      return null;
      // throw new Error(`Invalid address ${offset.toString(16)}`);
    }
    const fixedOffset = offset & 0x7FFF_FFFF;
    if (fixedOffset > 0x1800000) {
      return null;
      // throw new Error(`Invalid address ${offset.toString(16)}`);
    }
    return fixedOffset;
  }

  u8(offset: MemoryOffset): number {
    const fixedOffset = this.fixOffset(offset);
    if (fixedOffset == null) {
      return 0;
    }
    return this.memory.getUint8(fixedOffset);
  }

  s8(offset: MemoryOffset): number {
    const fixedOffset = this.fixOffset(offset);
    if (fixedOffset == null) {
      return 0;
    }
    return this.memory.getInt8(fixedOffset);
  }

  u16(offset: MemoryOffset): number {
    const fixedOffset = this.fixOffset(offset);
    if (fixedOffset == null) {
      return 0;
    }
    return this.memory.getUint16(fixedOffset);
  }

  s16(offset: MemoryOffset): number {
    const fixedOffset = this.fixOffset(offset);
    if (fixedOffset == null) {
      return 0;
    }
    return this.memory.getInt16(fixedOffset);
  }

  u32(offset: MemoryOffset): number {
    const fixedOffset = this.fixOffset(offset);
    if (fixedOffset == null) {
      return 0;
    }
    return this.memory.getUint32(fixedOffset);
  }

  s32(offset: MemoryOffset): number {
    const fixedOffset = this.fixOffset(offset);
    if (fixedOffset == null) {
      return 0;
    }
    return this.memory.getInt32(fixedOffset);
  }

  f32(offset: MemoryOffset): number {
    const fixedOffset = this.fixOffset(offset);
    if (fixedOffset == null) {
      return 0;
    }
    return this.memory.getFloat32(fixedOffset);
  }

  f64(offset: MemoryOffset): number {
    const fixedOffset = this.fixOffset(offset);
    if (fixedOffset == null) {
      return 0;
    }
    return this.memory.getFloat64(fixedOffset);
  }

  string(offset: MemoryOffset, length: number = -1): string {
    const fixedOffset = this.fixOffset(offset);
    if (length >= 0) {
      let res = '';
      for (let i = 0; i < length; i++) {
        res += String.fromCharCode(this.memory.getInt8(fixedOffset + i));
      }
      return res;
    } else {
      let res = '';
      for (let i = 0; ; i++) {
        const read = this.memory.getInt8(fixedOffset + i);
        if (read === 0x00) {
          return res;
        } else {
          res += String.fromCharCode(read);
        }
      }
    }
  }
}
