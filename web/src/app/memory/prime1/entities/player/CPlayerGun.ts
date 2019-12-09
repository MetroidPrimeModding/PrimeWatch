import {MemoryOffset, MemoryView} from '../../../MemoryObject';

export class CPlayerGun {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

}
