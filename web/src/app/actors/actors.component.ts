import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameStateService} from "../gameState/game-state.service";
import {GameTypesService, MemoryObjectInstance} from "../gameState/game-types.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'pw-actors',
  templateUrl: './actors.component.html',
  styleUrls: ['./actors.component.scss']
})
export class ActorsComponent implements OnInit, OnDestroy {
  actors: MemoryObjectInstance[] = [];
  vtables = new Map<number, string>();
  private sub: Subscription;

  constructor(
    private state: GameStateService,
    private types: GameTypesService
  ) {
    this.update();
    this.sub = state.onRefresh.subscribe(() => this.update());
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private update() {
    const manager = this.state.stateManager;
    const objects = this.state.getMember(manager, 'allObjects');
    const first = this.state.readPrimitiveMember(objects, 'firstID');
    const size = this.state.readPrimitiveMember(objects, 'size');

    let emergency = 0;
    this.actors = [];
    this.vtables = new Map();
    let next = first;
    while (next !== 0xFFFF) {
      console.log(next.toString(16), (next & 0x3FF).toString(16));
      const entry = this.state.getMemberArray(objects, 'list', next & 0x3FF);
      let actor = this.state.getMember(entry, 'entity');
      const vtable = this.state.readPrimitiveMember(actor, 'vtable');
      const knownType = this.types.lookupVtable(vtable);
      if (knownType != null) {
        actor = {
          obj: knownType,
          offset: actor.offset
        };
      }
      this.actors.push(actor);
      this.vtables.set(vtable, (knownType || {name: 'unknown'}).name);


      emergency++;
      if (emergency > 1000) {
        console.log('EMERGENCY');
        break;
      }
      const id = next;
      next = this.state.readPrimitiveMember(entry, 'next');
      if (next === id) {
        console.log('next == id');
        break;
      }
    }
  }
}
