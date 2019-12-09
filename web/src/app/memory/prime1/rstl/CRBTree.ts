import {MemoryOffset, MemoryView, Uint32} from '../../MemoryObject';

export class CRBTree<T> {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset, private construct: (MemoryOffset) => T) {
  }

  get treeSize(): Uint32 {
    return new Uint32(this.memory, this.offset);
  }

  get first(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset + 0x4);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }

  get last(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset + 0x8);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }

  get root(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset + 0xC);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }
}

export class CRBTreeNode<T> {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset, private construct: (MemoryOffset) => T) {
  }

  private readonly args: any[];

  get size(): number {
    return this.memory.u32(this.offset);
  }

  get left(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }

  get right(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset + 0x4);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }

  get parent(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset + 0x8);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }

  get redOrBlack(): Uint32 {
    return new Uint32(this.memory, this.offset + 0xC);
  }

  get data(): T {
    const ptr = this.memory.u32(this.offset + 0x10);
    return this.construct(ptr);
  }
}
