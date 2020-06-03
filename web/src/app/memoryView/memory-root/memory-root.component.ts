import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameStateService} from '../../gameState/game-state.service';
import {Subscription} from 'rxjs';
import {MemoryObjectInstance} from '../../gameState/game-types.service';

@Component({
  selector: 'pw-memory-root',
  templateUrl: './memory-root.component.html',
  styleUrls: ['./memory-root.component.scss'],
  providers: []
})
export class MemoryRootComponent implements OnInit, OnDestroy {
  private sub: Subscription;

  constructor(public gameState: GameStateService) {

  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sub = null;
  }
}
