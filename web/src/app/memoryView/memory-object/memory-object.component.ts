import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MemoryObject} from '../../memory/MemoryObject';
import {GameStateService} from '../../gameState/game-state.service';
import {Subscription} from 'rxjs';
import {MemoryObjectNavService, NamedMemoryObject} from '../memory-object-nav.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pw-memory-object',
  templateUrl: './memory-object.component.html',
  styleUrls: ['./memory-object.component.scss']
})
export class MemoryObjectComponent implements OnInit, OnDestroy {
  private _memoryObject: NamedMemoryObject;
  @Input()
  set memoryObject(ele: NamedMemoryObject) {
    this._memoryObject = ele;
    this.calcChildren();
  }

  children: NamedMemoryObject[];

  get memoryObject(): NamedMemoryObject {
    return this._memoryObject;
  }

  private sub: Subscription;

  constructor(private gameState: GameStateService, private changeDetectorRef: ChangeDetectorRef, private navService: MemoryObjectNavService) {
  }

  ngOnInit() {
    this.sub = this.gameState.onRefresh.subscribe(() => {
      this.calcChildren();
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sub = null;
  }

  private calcChildren() {
    this.children = [];
    // @ts-ignore
    for (let prop of Object.getOwnPropertyNames(this._memoryObject.obj.__proto__)) {
      const child = this._memoryObject.obj[prop];
      if (child.offset !== undefined) {
        this.children.push({
          name: prop,
          obj: child
        });
      }
    }
  }

  goToChild(child: NamedMemoryObject) {
    this.navService.pushNavigation(child);
  }
}
