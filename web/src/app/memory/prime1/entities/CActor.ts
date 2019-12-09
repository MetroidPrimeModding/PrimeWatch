import {MemoryOffset, MemoryView} from '../../MemoryObject';
import {CEntity} from './CEntity';
import {CTransform} from '../math/CTransform';

export class CActor extends CEntity {
  constructor(memory: MemoryView, offset: MemoryOffset) {
    super(memory, offset);
  }

  get transform(): CTransform {
    return new CTransform(this.memory, this.offset + 0x34);
  }
}
