import construct = Reflect.construct;

export class MemoryView {
  constructor(readonly memory: DataView) {
  }

  fixOffset(offset: number): number {
    if (offset < 0x8000_0000) {
      throw new Error(`Invalid address ${offset.toString(16)}`)
    }
    const fixedOffset = offset & 0x7FFF_FFFF;
    if (fixedOffset > 0x1800000) {
      throw new Error(`Invalid address ${offset.toString(16)}`)
    }
    return fixedOffset;
  }

  u8(offset: number): number {
    this.fixOffset(offset);
    return this.memory.getUint8(this.fixOffset(offset));
  }

  s8(offset: number): number {
    return this.memory.getInt8(this.fixOffset(offset));
  }

  u16(offset: number): number {
    return this.memory.getUint16(this.fixOffset(offset));
  }

  s16(offset: number): number {
    return this.memory.getInt16(this.fixOffset(offset));
  }

  u32(offset: number): number {
    return this.memory.getUint32(this.fixOffset(offset));
  }

  s32(offset: number): number {
    return this.memory.getInt32(this.fixOffset(offset));
  }

  f32(offset: number): number {
    return this.memory.getFloat32(this.fixOffset(offset));
  }

  f64(offset: number): number {
    return this.memory.getFloat64(this.fixOffset(offset));
  }

  string(offset: number, length: number = -1): string {
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
        if (read == 0x00) {
          return res;
        } else {
          res += String.fromCharCode(read);
        }
      }
    }
  }
}

export class MemoryArray<T> {
  constructor(readonly view: MemoryView, readonly offset: number,
              readonly stride: number,
              readonly length: number,
              readonly construct: (number) => T) {
  }

  get(index: number) {
    return this.construct(this.offset + this.stride * index);
  }
}
