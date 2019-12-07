import {MemoryView} from '../MemoryObject';
import {CRBTree} from './CRBTree';
import {CPair} from './CPair';
import {SObjectTag} from './SObjectTag';

export class CSimplePool {
  constructor(readonly memory: MemoryView, readonly offset: number) {
  }

  readonly size = 0;

  resources(): CRBTree<CPair<SObjectTag, number>> {
    return new CRBTree(this.memory, this.offset, (off) => {
      return new CPair(
        this.memory, off,
        SObjectTag.size,
        (off) => {
          return new SObjectTag(this.memory, off);
        },
        (off) => {
          return this.memory.u32(off);
        }
      );
    });
  }
}
