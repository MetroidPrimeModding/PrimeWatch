import {MemoryOffset, MemoryView} from '../MemoryObject';
import {CObjectList} from './CObjectList';
import {CPlayer} from './entities/player/CPlayer';
import {CWorld} from './CWorld';
import {CCameraManager} from './CCameraManager';
import {CPlayerState} from './entities/player/CPlayerState';
import {CRandom16} from './CRandom16';

export class CStateManager {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get allObjects(): CObjectList {
    // const ptr = this.memory.u32(this.offset + 0x80C)
    const ptr = this.memory.u32(this.offset + 0x810);
    return new CObjectList(this.memory, ptr);
  }

  get player(): CPlayer {
    const ptr = this.memory.u32(this.offset + 0x84C);
    return new CPlayer(this.memory, ptr);
  }

  get world(): CWorld {
    const ptr = this.memory.u32(this.offset + 0x850);
    return new CWorld(this.memory, ptr);
  }

  get cameraManager(): CCameraManager {
    const ptr = this.memory.u32(this.offset + 0x870);
    return new CCameraManager(this.memory, ptr);
  }

  get playerState(): CPlayerState {
    let ptr = this.memory.u32(this.offset + 0x8B8);
    ptr = this.memory.u32(ptr);
    return new CPlayerState(this.memory, ptr);
  }

  get nextAreaID(): number {
    return this.memory.u32(this.offset + 0x8CC);
  }

  get prevAreaID(): number {
    return this.memory.u32(this.offset + 0x8D0);
  }

  get random(): CRandom16 {
    return new CRandom16(this.memory, this.offset + 0x8FC);
  }
}
