import {MemoryObjectInstance} from '../gameState/game-types.service';
import * as BABYLON from 'babylonjs';
import {GameStateService} from '../gameState/game-state.service';
import {RenderService} from './render.service';
import {RenderObject} from "./RenderObject";
import {MemoryView} from "../gameState/MemoryView";

export class ROPostConstructed extends RenderObject {
  constructor(
    public readonly mrea: number,
    render: RenderService,
    private mesh: BABYLON.Mesh
  ) {
    super();
  }

  static async createMeshForPostConstructed(mrea: number, render: RenderService, postconstructed: MemoryObjectInstance): Promise<BABYLON.Mesh> {
    const postConstrcutedView = await render.state.readObject(postconstructed);
    const octTreePtr = postConstrcutedView.getMember(postconstructed, 'collision');
    const octTreePtrView = await render.state.readObject(octTreePtr);

    const octTree = octTreePtrView.getMember(octTreePtr, 'value');
    const octTreeView = await render.state.readObject(octTree);

    const edgeCount = octTreeView.readPrimitiveMember(octTree, 'edgeCount');
    const polyCount = octTreeView.readPrimitiveMember(octTree, 'polyCount');
    const vertCount = octTreeView.readPrimitiveMember(octTree, 'vertCount');
    const materialOffset = octTreeView.getMember(octTree, 'materials').offset;
    const edgeOffset = octTreeView.getMember(octTree, 'edges').offset;
    const polyOffset = octTreeView.getMember(octTree, 'polyEdges').offset;
    const vertOffset = octTreeView.getMember(octTree, 'verts').offset;
    const vertFlagsOffset = octTreeView.getMember(octTree, 'vertMats').offset;
    const edgeFlagsOffset = octTreeView.getMember(octTree, 'edgeMatx').offset;
    const polyFlagsOffset = octTreeView.getMember(octTree, 'polyMats').offset;

    // const edges = this.state.getRawU16Buffer(edgeOffset, edgeCount * 2); // 2 u16 each
    // const poly = this.state.getRawU16Buffer(polyOffset, polyCount * 3); // 3 u16 each
    // const verts = this.state.getRawF32Buffer(vertOffset, vertCount * 3); // 3 f32 each

    const octTreeStart = materialOffset;
    const octTreeEnd = vertOffset + vertCount * 4 * 3;
    const octTreeDataView = await render.state.readMemory(octTreeStart, octTreeEnd);

    const mesh = new BABYLON.Mesh('area 0x' + mrea.toString(16), render.scene);

    const positions = new Float32Array(vertCount * 3);
    for (let i = 0; i < vertCount * 3; i++) {
      positions[i] = octTreeDataView.f32(vertOffset + i * 4);
    }
    const indices = [];

    for (let i = 0; i < polyCount; i++) {
      const flags = octTreeDataView.u32(materialOffset + octTreeDataView.u8(polyFlagsOffset + i) * 4);
      const triEdges = [
        octTreeDataView.u16(polyOffset + (i * 3) * 2),
        octTreeDataView.u16(polyOffset + (i * 3 + 1) * 2),
        octTreeDataView.u16(polyOffset + (i * 3 + 2) * 2)
      ];
      const line1 = [
        octTreeDataView.u16(edgeOffset + (triEdges[0] * 2) * 2),
        octTreeDataView.u16(edgeOffset + (triEdges[0] * 2 + 1) * 2),
      ];
      const line2: [number, number] = [
        octTreeDataView.u16(edgeOffset + (triEdges[1] * 2) * 2),
        octTreeDataView.u16(edgeOffset + (triEdges[1] * 2 + 1) * 2),
      ];
      const line3: [number, number] = [
        octTreeDataView.u16(edgeOffset + (triEdges[2] * 2) * 2),
        octTreeDataView.u16(edgeOffset + (triEdges[2] * 2 + 1) * 2),
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

  dispose() {
    this.mesh.dispose();
    this.mesh = null;
  }
}
