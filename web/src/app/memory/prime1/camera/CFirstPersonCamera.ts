import {MemoryOffset, MemoryView} from '../../MemoryObject';
import {CTransform} from '../math/CTransform';
import {CGameCamera} from './CGameCamera';

export class CFirstPersonCamera extends CGameCamera {
  constructor(memory: MemoryView, offset: MemoryOffset) {
    super(memory, offset);
  }

  gunFollowXf(): CTransform {
    return new CTransform(this.memory, this.offset +0x190);
  }
}
