import {MemoryObject, MemoryOffset, Uint8} from '../MemoryObject';
import {CRBTree} from './CRBTree';
import {CPair} from './CPair';

export type ResourceType = Uint8;//todo

export class CSimplePool implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 0;

  readonly resources = new CRBTree<ResourceType>(this.memory, this.offset, Uint8)
}
