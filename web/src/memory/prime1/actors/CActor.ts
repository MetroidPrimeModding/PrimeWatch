import {MemoryOffset} from '../../MemoryObject';
import {CEntity} from './CEntity';
import {CTransform} from '../CTransform';

export class CActor extends CEntity {
  constructor(memory: DataView, offset: MemoryOffset) {
    super(memory, offset);
  }

  readonly size = 0;

  readonly transform = new CTransform(this.memory, this.offset);
}
