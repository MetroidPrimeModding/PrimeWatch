import {RenderService} from './render.service';
import {MemoryObjectInstance} from '../gameState/game-types.service';
import {ROCPhysicsActor} from './ROCPhysicsActor';
import {RenderObjectEntity, ROEntityUnknown} from './RenderObjectEntity';
import {ROCScriptTrigger} from './ROCScriptTrigger';
import {ROCPlayer} from './ROCPlayer';

export async function CreateROEntity(render: RenderService, instance: MemoryObjectInstance): Promise<RenderObjectEntity> {
  const view = await render.state.readObject(instance);
  if (instance.obj.name === 'CScriptTrigger') {
    return new ROCScriptTrigger(instance, view, render);
  }
  if (instance.obj.name === 'CPlayer') {
    return new ROCPlayer(instance, view, render);
  }

  const physicsActor = render.state.getSuper(instance, 'CPhysicsActor');
  if (physicsActor) {
    const isStandardCollider = view.readPrimitiveMember(physicsActor, 'standardCollider');
    if (isStandardCollider) {
      return new ROCPhysicsActor(instance, view, render);
    }
  }
  // Otherwise
  return new ROEntityUnknown(instance, view, render);
}
