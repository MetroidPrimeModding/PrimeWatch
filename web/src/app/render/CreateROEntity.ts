import {RenderService} from './render.service';
import {MemoryObjectInstance} from '../gameState/game-types.service';
import {ROCPhysicsActor} from './ROCPhysicsActor';
import {RenderObjectEntity, ROEntityUnknown} from './RenderObjectEntity';
import {ROCScriptTrigger} from './ROCScriptTrigger';
import {ROCPlayer} from "./ROCPlayer";

export function CreateROEntity(render: RenderService, instance: MemoryObjectInstance): RenderObjectEntity {
  if (instance.obj.name === 'CScriptTrigger') {
    return new ROCScriptTrigger(instance, render);
  }
  if (instance.obj.name === 'CPlayer') {
    return new ROCPlayer(instance, render);
  }

  // const physicsActor = render.state.getSuper(instance, 'CPhysicsActor');
  // if (physicsActor) {
  //   return new ROCPhysicsActor(physicsActor, render);
  // }
  // Otherwise
  return new ROEntityUnknown(instance, render);
}
