import {MemoryView} from '../MemoryObject';

export class CStateManager {
  constructor(readonly memory: MemoryView, readonly offset: number) {
  }

  allObjects(): CObjectList {
    // const ptr = this.memory.u32(this.offset + 0x80C)
    const ptr = this.memory.u32(this.offset + 0x810);
    return new CObjectList(this.memory, ptr);
  }

  player(): CPlayer {
    const ptr = this.memory.u32(this.offset + 0x84C);
    return new CPlayer(this.memory, ptr);
  }

  world(): CWorld {
    const ptr = this.memory.u32(this.offset + 0x850);
    return new CWorld(this.memory, ptr);
  }

  cameraManager(): CCameraManager {
    const ptr = this.memory.u32(this.offset + 0x870);
    return new CCameraManager(this.memory, ptr);
  }

  playerState(): CPlayerState {
    let ptr = this.memory.u32(this.offset + 0x8B8);
    ptr = this.memory.u32(ptr);
    return new CPlayerState(this.memory, ptr);
  }

  nextAreaID(): number {
    return this.memory.u32(this.offset + 0x8CC);
  }

  prevAreaID(): number {
    return this.memory.u32(this.offset + 0x8D0);
  }

  random(): CRandom16 {
    return new CRandom16(this.memory, this.offset + 0x8FC);
  }
}
