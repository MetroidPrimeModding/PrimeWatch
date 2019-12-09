import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameStateService} from '../../gameState/game-state.service';
import {MemoryObjectNavService, NamedMemoryObject} from '../memory-object-nav.service';
import {MemoryObject} from '../../memory/MemoryObject';
import {Subscription} from 'rxjs';

@Component({
  selector: 'pw-memory-root',
  templateUrl: './memory-root.component.html',
  styleUrls: ['./memory-root.component.scss'],
  providers: [MemoryObjectNavService]
})
export class MemoryRootComponent implements OnInit, OnDestroy {
  stack: NamedMemoryObject[] = [];

  private sub: Subscription;

  constructor(public gameState: GameStateService, public navService: MemoryObjectNavService) {

  }

  ngOnInit() {
    this.sub = this.navService.onNavigate.subscribe((stack) => {
      this.stack = stack;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sub = null;
  }

  popTo(obj: NamedMemoryObject | null) {
    this.navService.popTo(obj);
  }
}
