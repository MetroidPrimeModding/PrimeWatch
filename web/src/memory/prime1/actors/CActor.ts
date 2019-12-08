import {MemoryView} from '../../MemoryObject';
import {CEntity} from './CEntity';
import {CTransform} from '../CTransform';

export class CActor extends CEntity {
  constructor(memory: MemoryView, offset: number) {
    super(memory, offset);
  }

  transform(): CTransform {
    return new CTransform(this.memory, this.offset + 0x34);
  }
}
