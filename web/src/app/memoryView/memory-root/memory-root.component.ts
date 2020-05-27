import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameStateService} from '../../gameState/game-state.service';
import {MemoryObjectNavService} from '../memory-object-nav.service';
import {Subscription} from 'rxjs';
import {CompiledStructInstance} from '../../gameState/game-types.service';

@Component({
  selector: 'pw-memory-root',
  templateUrl: './memory-root.component.html',
  styleUrls: ['./memory-root.component.scss'],
  providers: [MemoryObjectNavService]
})
export class MemoryRootComponent implements OnInit, OnDestroy {
  stack: CompiledStructInstance[] = [];

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

  popTo(obj: CompiledStructInstance | null) {
    this.navService.popTo(obj);
  }
}
