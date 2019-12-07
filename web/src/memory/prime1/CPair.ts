import {MemoryItem, MemoryOffset} from '../MemoryObject';

export class CPair<A extends MemoryItem, B extends MemoryItem> implements MemoryItem {
  constructor(readonly a: A, readonly b: B, readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  get size(): number { return this.a.size + this.b.size};
}
