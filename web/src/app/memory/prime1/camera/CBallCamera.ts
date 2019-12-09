import {MemoryOffset, MemoryView} from '../../MemoryObject';
import {CGameCamera} from './CGameCamera';

export class CBallCamera  extends CGameCamera {
  constructor(memory: MemoryView, offset: MemoryOffset) {
    super(memory, offset);
  }
}
