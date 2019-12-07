import "reflect-metadata"

export class MemoryItem {
  private littleEndian = false;
  constructor(private memory: DataView, private offset: number) {
  }

  s8(offset: number = 0): number {
    return this.memory.getInt8(this.offset + offset);
  }

  u8(offset: number = 0): number {
    return this.memory.getUint8(this.offset + offset)
  }

  s16(offset: number = 0): number {
    return this.memory.getInt16(this.offset + offset, this.littleEndian);
  }

  u16(offset: number = 0): number {
    return this.memory.getUint16(this.offset + offset, this.littleEndian)
  }

  s32(offset: number = 0): number {
    return this.memory.getInt32(this.offset + offset, this.littleEndian);
  }

  u32(offset: number = 0): number {
    return this.memory.getUint32(this.offset + offset, this.littleEndian)
  }

  f32(offset: number = 0): number {
    return this.memory.getFloat32(this.offset + offset, this.littleEndian)
  }

  f64(offset: number = 0): number {
    return this.memory.getFloat64(this.offset + offset, this.littleEndian)
  }

  string(length: number = -1, offset: number = 0): string {
    if (length >= 0) {
      let res = '';
      for (let i = 0; i < length; i++) {
        res += String.fromCharCode(this.u8(offset + i));
      }
      return res;
    } else {
      let res = '';
      for (let i = 0;; i++) {
        const read = this.u8(offset + i);
        if (read == 0x00) {
          return res;
        } else {
          res += String.fromCharCode();
        }
      }
    }

  }
}

const OffsetSymbol = Symbol("MemoryOffset");

export function MemoryObject(offset: number) {

}
