import {MemoryOffset, MemoryView} from '../../MemoryObject';
import {CVector3f} from '../math/CVector3f';
import {CAABBPrimitive} from '../math/CAABBPrimitive';
import {CQuaternion} from '../math/CQuaternion';

export class CPhysicsActor {
  constructor(readonly memory: MemoryView, readonly offset: MemoryOffset) {
  }

  get constantForce(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0xFC);
  }

  get angularMomentum(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x108);
  }

  get velocity(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x138);
  }

  get angularVelocity(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x144);
  }

  get momentum(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x150);
  }

  get force(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x15C);
  }

  get impulse(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x168);
  }

  get torque(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x174);
  }

  get angularImpulse(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x180);
  }

  get collisionPrimitive(): CAABBPrimitive {
    return new CAABBPrimitive(this.memory, this.offset + 0x1c0);
  }

  get primitiveOffset(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x1E8);
  }

  get translation(): CVector3f {
    return new CVector3f(this.memory, this.offset + 0x1F4);
  }

  get orientation(): CQuaternion {
    return new CQuaternion(this.memory, this.offset + 0x200);
  }
}
