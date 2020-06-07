import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameStateService} from '../gameState/game-state.service';
import {GameTypesService, MemoryObjectInstance} from '../gameState/game-types.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'pw-entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss']
})
export class EntitiesComponent implements OnInit, OnDestroy {
  entities: MemoryObjectInstance[] = [];
  vtables = new Map<number, string>();
  private sub = new Subscription();

  constructor(
    private state: GameStateService,
    private types: GameTypesService
  ) {
    this.sub.add(state.entities.subscribe((v) => this.update(v)));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private update(entities: MemoryObjectInstance[]) {
    this.entities = entities;
    for (const e of entities) {
      if (e.obj.type !== 'struct') {
        continue;
      }
      if (e.obj.vtable) {
        this.vtables.set(e.obj.vtable, e.obj.name);
      }
    }
  }
}
