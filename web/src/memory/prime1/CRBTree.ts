import {MemoryView} from '../MemoryObject';

export class CRBTree<T> {
  constructor(readonly memory: MemoryView, readonly offset: number, private construct: (number) => T) {
  }

  treeSize(): number {
    return this.memory.u32(0x0);
  }

  first(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset + 0x4);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }

  last(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset + 0x8);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }

  root(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset + 0xC);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }


}

export class CRBTreeNode<T> {
  constructor(readonly memory: MemoryView, readonly offset: number, private construct: (number) => T) {
  }

  private readonly args: any[];

  size(): number {
    return this.memory.u32(this.offset);
  }

  left(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }

  right(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset + 0x4);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }

  parent(): CRBTreeNode<T> {
    const ptr = this.memory.u32(this.offset + 0x8);
    return new CRBTreeNode<T>(this.memory, ptr, this.construct);
  }

  redOrBlack(): number {
    return this.memory.u32(this.offset + 0xC);
  }

  data(): T {
    const ptr = this.memory.u32(this.offset + 0x10);
    return this.construct(ptr);
  }
}
