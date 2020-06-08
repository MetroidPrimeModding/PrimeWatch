import {Component, OnInit} from '@angular/core';
import {GameStateService} from "../gameState/game-state.service";
import {MemoryObjectInstance} from "../gameState/game-types.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'pw-selected-object',
  templateUrl: './selected-object.component.html',
  styleUrls: ['./selected-object.component.scss']
})
export class SelectedObjectComponent implements OnInit {
  current: MemoryObjectInstance;
  private sub: Subscription;

  constructor(
    private state: GameStateService
  ) {
    this.sub = state.selectedEntity.subscribe((v) => this.current = v);
  }

  ngOnInit(): void {
  }

}
