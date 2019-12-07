import {MemoryView} from '../MemoryObject';

export class CPair<A , B > {
  constructor(readonly memory: MemoryView, readonly offset: number,
              readonly stride: number,
              private constructA: (number) => A,
              private constructB: (number) => B) {
  }

  a(): A {
    return this.constructA(this.offset);
  }

  b(): B {
    return this.constructB(this.offset + this.stride);
  }
}
