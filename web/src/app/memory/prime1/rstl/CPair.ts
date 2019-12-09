import {MemoryObject, MemoryOffset, MemoryView} from '../../MemoryObject';

export class CPair<A, B> implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset,
              readonly stride: number,
              private constructA: (number) => A,
              private constructB: (number) => B) {
  }

  get a(): A {
    return this.constructA(this.offset);
  }

  get b(): B {
    return this.constructB(this.offset + this.stride);
  }
}
