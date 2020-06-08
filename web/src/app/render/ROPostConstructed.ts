import {MemoryObjectInstance} from '../gameState/game-types.service';
import * as BABYLON from 'babylonjs';
import {GameStateService} from '../gameState/game-state.service';
import {RenderService} from './render.service';
import {RenderObject} from "./RenderObject";

export class ROPostConstructed extends RenderObject {
  private mesh: BABYLON.Mesh;

  constructor(
    public readonly mrea: number,
    render: RenderService,
    postconstructed: MemoryObjectInstance
  ) {
    super();
    this.mesh = this.createMeshForPostConstructed(render, postconstructed);
  }

  dispose() {
    this.mesh.dispose();
    this.mesh = null;
  }

  private createMeshForPostConstructed(render: RenderService, postconstructed: MemoryObjectInstance): BABYLON.Mesh {
    const octTreePtr = render.state.getMember(postconstructed, 'collision');
    const octTree = render.state.getMember(octTreePtr, 'value');
    const edgeCount = render.state.readPrimitiveMember(octTree, 'edgeCount');
    const polyCount = render.state.readPrimitiveMember(octTree, 'polyCount');
    const vertCount = render.state.readPrimitiveMember(octTree, 'vertCount');
    const materialOffset = render.state.getMember(octTree, 'materials').offset;
    const edgeOffset = render.state.getMember(octTree, 'edges').offset;
    const polyOffset = render.state.getMember(octTree, 'polyEdges').offset;
    const vertOffset = render.state.getMember(octTree, 'verts').offset;
    const vertFlagsOffset = render.state.getMember(octTree, 'vertMats').offset;
    const edgeFlagsOffset = render.state.getMember(octTree, 'edgeMatx').offset;
    const polyFlagsOffset = render.state.getMember(octTree, 'polyMats').offset;

    // const edges = this.state.getRawU16Buffer(edgeOffset, edgeCount * 2); // 2 u16 each
    // const poly = this.state.getRawU16Buffer(polyOffset, polyCount * 3); // 3 u16 each
    // const verts = this.state.getRawF32Buffer(vertOffset, vertCount * 3); // 3 f32 each

    const mem = render.state.memoryView;

    const mesh = new BABYLON.Mesh('area 0x' + this.mrea.toString(16), render.scene);

    const positions = new Float32Array(vertCount * 3);
    for (let i = 0; i < vertCount * 3; i++) {
      positions[i] = mem.f32(vertOffset + i * 4);
    }
    const indices = [];

    for (let i = 0; i < polyCount; i++) {
      const flags = mem.u32(materialOffset + mem.u8(polyFlagsOffset + i) * 4);
      const triEdges = [
        mem.u16(polyOffset + (i * 3) * 2),
        mem.u16(polyOffset + (i * 3 + 1) * 2),
        mem.u16(polyOffset + (i * 3 + 2) * 2)
      ];
      const line1 = [
        mem.u16(edgeOffset + (triEdges[0] * 2) * 2),
        mem.u16(edgeOffset + (triEdges[0] * 2 + 1) * 2),
      ];
      const line2: [number, number] = [
        mem.u16(edgeOffset + (triEdges[1] * 2) * 2),
        mem.u16(edgeOffset + (triEdges[1] * 2 + 1) * 2),
      ];
      const line3: [number, number] = [
        mem.u16(edgeOffset + (triEdges[2] * 2) * 2),
        mem.u16(edgeOffset + (triEdges[2] * 2 + 1) * 2),
      ];
      let i1 = line1[0];
      let i2: number;
      let otherLine: [number, number];
      let i3: number;
      if (line1[0] === line2[0]) {
        [i2, otherLine] = [line2[1], line3];
      } else if (line1[0] === line2[1]) {
        [i2, otherLine] = [line2[0], line3];
      } else if (line1[0] === line3[0]) {
        [i2, otherLine] = [line3[1], line2];
      } else {
        [i2, otherLine] = [line3[0], line2];
      }
      if (i2 === otherLine[0]) {
        i3 = otherLine[1];
      } else {
        i3 = otherLine[0];
      }

      if (flags & 0x2000000) {
        [i1, i2, i3] = [i3, i2, i1];
      }

      indices.push(i1, i2, i3);
    }

    const vertexData = new BABYLON.VertexData();

    vertexData.positions = positions;
    vertexData.indices = indices;

    vertexData.applyToMesh(mesh);
    mesh.material = render.collisionMat;

    return mesh;
  }
}
