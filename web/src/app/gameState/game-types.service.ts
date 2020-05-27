import {Injectable} from '@angular/core';
import {CompiledEnum, CompiledStruct} from '@pwootage/bstruct/lib/BCompiler_JSON';
import {MemoryOffset} from './MemoryView';
import * as PrimeDefs from '../../assets/prime-defs.json';

export interface GameDefs {
  enums: CompiledEnum[];
  structs: CompiledStruct[];
}

export class CompiledStructInstance {
  offset: MemoryOffset;
  type: CompiledStruct;
}

@Injectable({
  providedIn: 'root'
})
export class GameTypesService {
  types: GameDefs;
  tabe = new Map<string, CompiledStruct>();

  constructor() {
    this.types = PrimeDefs;
    for (const s of PrimeDefs.structs) {
      this.tabe.set(s.name, s);
    }
  }

  lookup(name: string): CompiledStruct | null {
    return this.tabe.get(name);
  }
}
