export interface MemoryObject {
  readonly offset: MemoryOffset;
}

export interface MemoryObjectPrimitive {
  readonly value: number | string;
}

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
        if (read == 0x00) {
          return res;
        } else {
          res += String.fromCharCode(read);
        }
      }
    }
  }
}

export class MemoryArray<T> implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset,
              readonly stride: number,
              readonly length: number,
              readonly construct: (MemoryOffset) => T) {
  }

  get(index: number) {
    return this.construct(this.offset + this.stride * index);
  }
}

export class Uint8 implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }


  get value(): number {
    return this.memory.u8(this.offset);
  }
}

export class Int8 implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }


  get value(): number {
    return this.memory.s8(this.offset);
  }
}

export class Uint16 implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }


  get value(): number {
    return this.memory.u16(this.offset);
  }
}

export class Int16 implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }


  get value(): number {
    return this.memory.s16(this.offset);
  }
}

export class Uint32 implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }


  get value(): number {
    return this.memory.u32(this.offset);
  }
}

export class Int32 implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get value(): number {
    return this.memory.s32(this.offset);
  }
}

export class Uint32Bit implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset, readonly bit: number) {
    if (bit < 0) {
      throw new Error('Bit must be at least 0');
    }
    if (bit > 31) {
      throw new Error('Bit must be at at most 31');
    }
  }


  get value(): number {
    return (this.memory.u32(this.offset) >> this.bit) & 0x1;
  }
}

type StandardEnum<T> = {
  [id: string]: T | string;
  [nu: number]: string;
}

export class Uint32Enum<T extends number> implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get value(): T {
    return <T> this.memory.s32(this.offset);
  }
}

export class Float32 implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get value(): number {
    return this.memory.f32(this.offset);
  }
}

export class Float64 implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get value(): number {
    return this.memory.f64(this.offset);
  }
}

export class MemoryString implements MemoryObject, MemoryObjectPrimitive {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset, readonly length: number = -1) {
  }

  get value(): string {
    return this.memory.string(this.offset, this.length);
  }
}
