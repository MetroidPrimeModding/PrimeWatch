import {RenderService} from './render.service';
import {MemoryObjectInstance} from '../gameState/game-types.service';
import * as BABYLON from 'babylonjs';
import {MemoryView} from '../gameState/MemoryView';

export function createTiledAABB(name: string,
                                render: RenderService,
                                aabb: MemoryObjectInstance,
                                view: MemoryView, setOrginToMin?: boolean): BABYLON.Mesh {
  const min = view.readVector3(view.getMember(aabb, 'min'));
  const max = view.readVector3(view.getMember(aabb, 'max'));

  const size = [
    max[0] - min[0],
    max[1] - min[1],
    max[2] - min[2]
  ];


  const mesh = BABYLON.MeshBuilder.CreateTiledBox(
    name,
    {
      tileSize: 2,
      height: size[1],
      width: size[0],
      depth: size[2],
    },
    render.scene
  );

  if (setOrginToMin) {
    mesh.setPivotMatrix(BABYLON.Matrix.Translation(
      min[0] + size[0] / 2,
      min[1] + size[1] / 2,
      min[2] + size[2] / 2
      ),
      false
    );
  }
  return mesh;
}

export function createAABB(name: string,
                           render: RenderService,
                           aabb: MemoryObjectInstance,
                           view: MemoryView,
                           setOrginToMin?: boolean): BABYLON.Mesh {
  const min = view.readVector3(view.getMember(aabb, 'min'));
  const max = view.readVector3(view.getMember(aabb, 'max'));

  const size = [
    max[0] - min[0],
    max[1] - min[1],
    max[2] - min[2]
  ];


  const mesh = BABYLON.MeshBuilder.CreateBox(
    name,
    {
      height: size[1],
      width: size[0],
      depth: size[2],
    },
    render.scene
  );

  if (setOrginToMin) {
    mesh.setPivotMatrix(BABYLON.Matrix.Translation(
      min[0] + size[0] / 2,
      min[1] + size[1] / 2,
      min[2] + size[2] / 2
      ),
      false
    )
    ;
  }
  return mesh;
}
