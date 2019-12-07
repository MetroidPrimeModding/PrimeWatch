import {addOffset, getOffset, MemoryObject, MemoryObjectConstructor, MemoryOffset, Pointer, Uint32} from '../MemoryObject';

export class CRBTree<T extends MemoryObject> implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset, readonly clazz: MemoryObjectConstructor<T>, ...args: any[]) {
    this.args = args || [];
    this.treeSize = new Uint32(this.memory, addOffset(this.offset, 0x0));
    this.first = new Pointer<CRBTreeNode<T>>(this.memory, addOffset(this.offset, 0x4), CRBTreeNode, this.clazz, ...this.args);
    this.last = new Pointer<CRBTreeNode<T>>(this.memory, addOffset(this.offset, 0x4), CRBTreeNode, this.clazz, ...this.args);
    this.root = new Pointer<CRBTreeNode<T>>(this.memory, addOffset(this.offset, 0x4), CRBTreeNode, this.clazz, ...this.args);
  }

  private readonly args: any[];

  readonly size = 16;

  readonly treeSize: Uint32;
  readonly first: Pointer<CRBTreeNode<T>>;
  readonly last: Pointer<CRBTreeNode<T>>;
  readonly root: Pointer<CRBTreeNode<T>>;
}

export class CRBTreeNode<T extends MemoryObject> implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset, readonly clazz: MemoryObjectConstructor<T>, ...args: any[]) {
    this.args = args || [];
  }

  private readonly args: any[];

  get size() {
    return 16 + this.data.size;
  }

  readonly left = new Pointer(this.memory, addOffset(this.offset, 0x0), CRBTreeNode, this.clazz, ...this.args);
  readonly right = new Pointer(this.memory, addOffset(this.offset, 0x4), CRBTreeNode, this.clazz, ...this.args);
  readonly parent = new Pointer(this.memory, addOffset(this.offset, 0x8), CRBTreeNode, this.clazz, ...this.args);
  readonly redOrBlack = new Uint32(this.memory, addOffset(this.offset, 0xC));
  readonly data = new this.clazz(this.memory, addOffset(this.offset, 0x10), ...this.args);
}
