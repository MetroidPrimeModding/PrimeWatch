import { Component, OnInit } from '@angular/core';
import {GameStateService} from "../gameState/game-state.service";
import {Subscription} from "rxjs";
import {GameTypesService, MemoryObjectInstance} from "../gameState/game-types.service";

interface Worlds {
  name: string;
}

@Component({
  selector: 'pw-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss']
})
export class WorldComponent implements OnInit {
  private sub: Subscription;

  // world: MemoryObjectInstance;
  areas: MemoryObjectInstance[];

  constructor(private state: GameStateService, private types: GameTypesService) {
    this.update();
    this.sub = state.onRefresh.subscribe(() => this.update());
  }

  ngOnInit(): void {
  }

  private update() {
    const stateManager = this.state.stateManager;
    const world = this.state.getMember(stateManager, 'world');
    const areas = this.state.getMember(world, 'areas');
    const size = this.state.readPrimitiveMember(areas, 'end');
    this.areas = [];
    for (let i = 0; i < size; i++) {
      const ptrToArea = this.state.getMemberArray(areas, 'first', i);
      this.areas.push(this.state.getMember(ptrToArea, 'value'));
      // this.areas.push(ptrToArea);
    }
  }
}
