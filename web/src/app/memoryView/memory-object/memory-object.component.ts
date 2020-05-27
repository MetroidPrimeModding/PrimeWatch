import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {GameStateService} from '../../gameState/game-state.service';
import {Subscription} from 'rxjs';
import {MemoryObjectNavService} from '../memory-object-nav.service';
import {CompiledMember, CompiledStruct} from '@pwootage/bstruct/lib/BCompiler_JSON';
import {CompiledStructInstance, GameTypesService} from '../../gameState/game-types.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pw-memory-object',
  templateUrl: './memory-object.component.html',
  styleUrls: ['./memory-object.component.scss']
})
export class MemoryObjectComponent implements OnInit, OnDestroy {
  @Input()
  memoryObject: CompiledStructInstance;

  private sub: Subscription;

  constructor(
    private gameState: GameStateService,
    private types: GameTypesService,
    private changeDetectorRef: ChangeDetectorRef,
    private navService: MemoryObjectNavService) {
  }

  ngOnInit() {
    this.sub = this.gameState.onRefresh.subscribe(() => {
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sub = null;
  }

  goToChild(child: CompiledMember) {
    this.navService.pushNavigation({
      offset: this.memoryObject.offset + child.offset,
      type: this.types.lookup(child.type)
    });
  }
}
