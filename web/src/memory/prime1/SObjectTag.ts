import {MemoryView} from '../MemoryObject';

export class SObjectTag {
  static readonly size = 0x8;

  constructor(readonly memory: MemoryView, readonly offset: number) {
  }
}
