import {addOffset, MemoryObject, MemoryOffset, Pointer, RCPointer} from '../MemoryObject';

export class CStateManager implements MemoryObject {
  constructor(readonly memory: DataView, readonly offset: MemoryOffset) {
  }

  readonly size = 0;

  //    game_ptr<CObjectList> allObjs = game_ptr<CObjectList>(ptr(), 0x80C);
  readonly allObjs = new Pointer(this.memory, addOffset(this.offset, 0x80C), CObjectList);
  readonly player = new Pointer(this.memory, addOffset(this.offset, 0x80C), CPlayer);
  readonly world = new Pointer(this.memory, addOffset(this.offset, 0x80C), CWorld);
  readonly cameraManager = new Pointer(this.memory, addOffset(this.offset, 0x80C), CCameraManager);
  readonly playerState = new RCPointer(this.memory, addOffset(this.offset, 0x80C), CPlayerState);

  readonly nextAreaID = game_u32(ptr(), 0x8CC);
  readonly prevAreaID = game_u32(ptr(), 0x8D0);
  readonly random = CRandom16(ptr(), 0x8FC);
}
