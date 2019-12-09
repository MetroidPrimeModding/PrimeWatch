import {MemoryOffset, MemoryView, Uint32} from '../MemoryObject';
import {CRBTree} from './rstl/CRBTree';
import {CPair} from './rstl/CPair';
import {SObjectTag} from './SObjectTag';

export class CSimplePool {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  readonly size = 0;

  get resources(): CRBTree<CPair<SObjectTag, Uint32>> {
    return new CRBTree(this.memory, this.offset, (off) => {
      return new CPair(
        this.memory, off,
        SObjectTag.size,
        (off) => {
          return new SObjectTag(this.memory, off);
        },
        (off) => {
          return new Uint32(this.memory, off);
        }
      );
    });
  }
}
