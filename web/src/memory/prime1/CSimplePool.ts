import {MemoryItem, MemoryOffset} from '../MemoryObject';

export class CSimplePool implements MemoryItem {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 0;
}
