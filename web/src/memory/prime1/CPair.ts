import {MemoryObject, MemoryOffset} from '../MemoryObject';

export class CPair<A extends MemoryObject, B extends MemoryObject> implements MemoryObject {
  constructor(readonly a: A, readonly b: B, readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  get size(): number { return this.a.size + this.b.size};
}
