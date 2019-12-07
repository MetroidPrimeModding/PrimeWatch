export interface MemoryObjectConstructor<T extends MemoryObject> {
  new(memory: DataView, offset: MemoryOffset, ...args: any[]): T;
}

export interface MemoryObject {
  readonly memory: DataView;
  readonly offset: MemoryOffset;
  readonly size: number;
}

export type MemoryOffset = number | (() => number);

export function addOffset(base: MemoryOffset, offset: MemoryOffset): MemoryOffset {
  if (typeof base == 'number') {
    if (typeof offset == 'number') {
      return base + offset;
    } else {
      return () => base + offset();
    }
  } else if (typeof offset == 'number') {
    return () => base() + offset;
  } else {
    return base() + offset();
  }
}

export function getOffset(offset: MemoryOffset): number {
  if (typeof offset == 'number') {
    return offset & 0x7FFFFFFF;
  } else {
    return offset() & 0x7FFFFFFF;
  }
}

export class CString implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset, readonly length: number = -1) {
  }

  readonly size = 1;

  get value(): string {
    if (length >= 0) {
      let res = '';
      for (let i = 0; i < length; i++) {
        res += String.fromCharCode(this.memory.getInt8(getOffset(this.offset) + i));
      }
      return res;
    } else {
      let res = '';
      for (let i = 0; ; i++) {
        const read = this.memory.getInt8(getOffset(this.offset) + i);
        if (read == 0x00) {
          return res;
        } else {
          res += String.fromCharCode(read);
        }
      }
    }
  }
}

export class Uint8 implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 1;

  get value(): number {
    return this.memory.getUint8(getOffset(this.offset));
  }
}

export class Int8 implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 1;

  get value(): number {
    return this.memory.getInt8(getOffset(this.offset));
  }
}

export class Uint16 implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 2;

  get value(): number {
    return this.memory.getUint16(getOffset(this.offset), false);
  }
}

export class Int16 implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 2;

  get value(): number {
    return this.memory.getInt16(getOffset(this.offset), false);
  }
}

export class Uint32 implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 4;

  get value(): number {
    return this.memory.getUint32(getOffset(this.offset), false);
  }
}

export class Int32 implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 4;

  get value(): number {
    return this.memory.getInt32(getOffset(this.offset), false);
  }
}

export class Float32 implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 4;

  get value(): number {
    return this.memory.getFloat32(getOffset(this.offset), false);
  }
}

export class Float64 implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 8;

  get value(): number {
    return this.memory.getFloat64(getOffset(this.offset), false);
  }
}

export class Pointer<T extends MemoryObject> implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset, readonly clazz: MemoryObjectConstructor<T>, ...args:any[]) {
    this.args = args || [];
  }
  private readonly args: any[];

  readonly size = 4;

  get value(): T  { return new this.clazz(this.memory, () => this.rawValue, ...this.args); }

  get rawValue(): number {
    return this.memory.getUint32(getOffset(this.offset), false);
  }
}

export class RCPointerData<T extends MemoryObject> implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset, readonly clazz: MemoryObjectConstructor<T>, ...args:any[]) {
    this.args = args || [];
  }
  private readonly args: any[];

  readonly size = 4;

  readonly refcount = new Uint32(this.memory, addOffset(this.offset, 0x4));

  get value(): T  { return new this.clazz(this.memory, () => this.rawValue, ...this.args); }

  get rawValue(): number {
    return this.memory.getUint32(getOffset(this.offset), false);
  }
}

export class MemoryArray<T extends MemoryObject> implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset, readonly length: number, readonly stride: number, readonly clazz: MemoryObjectConstructor<T>, ...args:any[]) {
    this.args = args || [];
  }
  private readonly args: any[];

  readonly size = this.length * this.stride;

  get(index: number): T {
    return new this.clazz(this.memory, addOffset(this.offset, index * this.stride));
  }

  get rawValue(): number {
    return this.memory.getUint32(getOffset(this.offset), false);
  }
}
