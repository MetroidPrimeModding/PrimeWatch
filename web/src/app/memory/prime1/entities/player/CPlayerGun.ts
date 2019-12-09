import {MemoryObject, MemoryOffset, MemoryView} from '../../../MemoryObject';

export class CPlayerGun implements MemoryObject {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

}
