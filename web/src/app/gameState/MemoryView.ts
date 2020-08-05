import {MemoryObjectInstance} from './game-types.service';
import {CompiledMember} from '@pwootage/bstruct/lib/BCompiler_JSON';
import {GameStateService} from './game-state.service';

export type MemoryOffset = number;

export class MemoryView {
  constructor(
    private state: GameStateService,
    readonly memory: DataView,
    readonly offset: number,
    readonly length: number
  ) {
  }

  fixOffset(offset: MemoryOffset): number | null {
    if (offset < this.offset) {
      // TODO: return null
      // return null;
      throw new Error(`Invalid address ${offset.toString(16)}`);
    }
    const fixedOffset = offset - this.offset;
    if (fixedOffset > this.length) {
      // return null;
      throw new Error(`Invalid address ${offset.toString(16)}`);
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

  getMember(obj: MemoryObjectInstance, memberName: CompiledMember | string): MemoryObjectInstance {
    const member = this.state.recursiveMemberLookup(memberName, obj);
    if (member == null) {
      return null;
    }
    const memberType = this.state.types.lookup(member.type);
    if (memberType == null) {
      return null;
    }
    const offset = obj.offset + member.offset;
    if (member.pointer) {
      const ptr = this.u32(offset);
      return {obj: memberType, offset: ptr};
    } else {
      return {obj: memberType, offset};
    }
  }

  readPrimitiveMember(obj: MemoryObjectInstance, memberName: CompiledMember | string): number | null {
    const member = this.state.recursiveMemberLookup(memberName, obj);
    const memberType = this.state.types.lookup(member.type);
    if (memberType.type !== 'primitive') {
      return null;
    }

    let toRead = obj.offset + member.offset;
    if (member.pointer) {
      toRead = this.u32(toRead);
    }
    // TODO: this will fail if it's a pointer. Need to call an async read.
    let value = memberType.read(this, toRead);

    if (member.bit != null && typeof (value) === 'number') {
      value = (value >> (member.bit)) & ((1 << member.bitLength) - 1);
    }
    return value;
  }

  readVector3(instance: MemoryObjectInstance): [number, number, number] {
    if (instance.obj.name !== 'CVector3f') {
      throw new Error('Attempt to read a non-vector as a vector');
    }
    return [
      this.readPrimitiveMember(instance, 'x'),
      this.readPrimitiveMember(instance, 'y'),
      this.readPrimitiveMember(instance, 'z')
    ];
  }

  getMemberArray(obj: MemoryObjectInstance, memberName: CompiledMember | string, index: number): MemoryObjectInstance {
    let member: CompiledMember;
    if (typeof (memberName) === 'string') {
      member = this.state.types.lookupMember(obj.obj, memberName);
    } else {
      member = memberName;
    }
    const memberType = this.state.types.lookup(member.type);
    const offset = obj.offset + member.offset;
    if (member.pointer) {
      const ptr = this.u32(offset);
      return {obj: memberType, offset: ptr + memberType.size * index};
    } else {
      return {obj: memberType, offset: offset + memberType.size * index};
    }
  }

  readTransformPos(instance: MemoryObjectInstance): [number, number, number] {
    if (instance.obj.name !== 'CTransform') {
      throw new Error('Attempt to read a non-vector as a vector');
    }
    return [
      this.readPrimitiveMember(instance, 'posX'),
      this.readPrimitiveMember(instance, 'posY'),
      this.readPrimitiveMember(instance, 'posZ')
    ];
  }

  readString(instance: MemoryObjectInstance, length: number = -1): string | null {
    if (instance.obj.name !== 'u8') {
      throw new Error('Attempt to read a non-u8 as a string');
    }
    if (instance.offset === 0) {
      return null;
    }
    return this.string(instance.offset, length);
  }
}
