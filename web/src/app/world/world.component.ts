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

  private async update() {
    const stateManager = this.state.stateManager;
    const stateManagerView = await this.state.readObject(stateManager);

    const world = stateManagerView.getMember(stateManager, 'world');
    const areas = stateManagerView.getMember(world, 'areas');
    const size = stateManagerView.readPrimitiveMember(areas, 'end');
    this.areas = [];
    for (let i = 0; i < size; i++) {
      const ptrToArea = stateManagerView.getMemberArray(areas, 'first', i);
      const ptrToAreaView = await this.state.readObject(ptrToArea);

      this.areas.push(ptrToAreaView.getMember(ptrToArea, 'value'));
      // this.areas.push(ptrToArea);
    }
  }
}
