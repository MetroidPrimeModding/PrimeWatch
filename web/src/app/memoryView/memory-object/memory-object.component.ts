import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {GameStateService} from '../../gameState/game-state.service';
import {BehaviorSubject, merge, Observable, Subscription} from 'rxjs';
import {CompiledMember} from '@pwootage/bstruct/lib/BCompiler_JSON';
import {MemoryObjectInstance, GameTypesService, MemoryObject} from '../../gameState/game-types.service';
import {CollectionViewer, DataSource, SelectionChange} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {map} from 'rxjs/operators';

export class DynamicFlatNode {
  constructor(public parent: MemoryObjectInstance,
              public member: CompiledMember,
              public memberType: MemoryObject,
              public level: number) {
  }
}

export class CompiledStructDataSource implements DataSource<DynamicFlatNode> {
  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

  get data(): DynamicFlatNode[] {
    return this.dataChange.value;
  }

  set data(value: DynamicFlatNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(private _treeControl: FlatTreeControl<DynamicFlatNode>,
              private gameState: GameStateService,
              private types: GameTypesService) {
  }

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if ((change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed) {
        this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
      }
    });

    return merge(
      collectionViewer.viewChange,
      this.dataChange,
      this.gameState.onRefresh
    ).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void {
  }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed.slice().reverse().forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: DynamicFlatNode, expand: boolean) {
    const parent = node.parent;
    const member = node.member;
    const index = this.data.indexOf(node);
    if (index < 0) {
      return;
    }
    // TODO: this, maybe
    // if (!children || index < 0) { // If no children, or cannot find the node, no op
    //   return;
    // }
    if (expand) {
      const newInstance = this.gameState.getMember(parent, member);

      const nodes = this.generateMembersForType(newInstance, node.level + 1);
      this.data.splice(index + 1, 0, ...nodes);
    } else {
      let count = 0;
      for (let i = index + 1; i < this.data.length
      && this.data[i].level > node.level; i++, count++) {
      }
      this.data.splice(index + 1, count);
    }

    // notify the change
    this.dataChange.next(this.data);
  }

  generateMembersForType(instance: MemoryObjectInstance, level: number): DynamicFlatNode[] {
    if (instance.obj.type === 'struct') {
      const members: DynamicFlatNode[] = [];

      if (instance.obj.extends) {
        for (const ext of instance.obj.extends) {
          members.push(
            new DynamicFlatNode(instance, {
              type: ext,
              offset: 0x0,
              name: 'super'
            }, this.types.lookup(ext), level)
          );
        }
      }
      for (const child of instance.obj.members) {
        members.push(
          new DynamicFlatNode(instance, child, this.types.lookup(child.type), level)
        );
      }

      return members;
    } else {
      return [];
    }
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pw-memory-object',
  templateUrl: './memory-object.component.html',
  styleUrls: ['./memory-object.component.scss']
})
export class MemoryObjectComponent implements OnInit, OnDestroy {
  private _instance: MemoryObjectInstance;

  @Input()
  set memoryObject(value: MemoryObjectInstance) {
    this._instance = value;
    this.dataSource.data = this.dataSource.generateMembersForType(this.memoryObject, 0);
  }

  get memoryObject(): MemoryObjectInstance {
    return this._instance;
  }

  treeControl: FlatTreeControl<DynamicFlatNode>;
  dataSource: CompiledStructDataSource;
  private sub: Subscription;

  getLevel = (node: DynamicFlatNode) => node.level;
  isExpandable = (node: DynamicFlatNode) => node.memberType.type === 'struct';
  isStruct = (_: number, _nodeData: DynamicFlatNode) => _nodeData.memberType.type === 'struct';
  isEnum = (_: number, _nodeData: DynamicFlatNode) => _nodeData.memberType.type === 'enum';
  isPrimitive = (_: number, _nodeData: DynamicFlatNode) => _nodeData.memberType.type === 'primitive';
  // isVector = (_: number, _nodeData: DynamicFlatNode) => _nodeData.memberType.name == 'CVector3f';

  constructor(
    public gameState: GameStateService,
    private types: GameTypesService,
    private changeDetectorRef: ChangeDetectorRef) {
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new CompiledStructDataSource(this.treeControl, gameState, types);
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

  readPrimitive(parent: MemoryObjectInstance, member: CompiledMember): string {
    const value = this.gameState.readPrimitiveMember(parent, member);
    let valueString: string;
    if (member.type === 'bool') {
      valueString = (!!value).toString();
    } else if (member.type[0] === 'u') {
      valueString = '0x' + value.toString(16);
    } else {
      valueString = value.toString();
    }
    return valueString;
  }

  readEnum(parent: MemoryObjectInstance, member: CompiledMember, memberType: MemoryObject): string {
    if (memberType.type !== 'enum') {
      return 'bad type ' + memberType.type;
    }
    const view = this.gameState.memoryView;
    let toRead = parent.offset + member.offset;
    if (member.pointer) {
      toRead = this.gameState.memoryView.u32(toRead);
    }
    let value: number;
    switch (memberType.size) {
      case 1:
        value = this.gameState.memoryView.s8(toRead);
        break;
      case 2:
        value = this.gameState.memoryView.s16(toRead);
        break;
      default:
      case 4:
        value = this.gameState.memoryView.s32(toRead);
        break;
    }
    const enumValue = memberType.values
      .find(v => v.value === value) || {name: '???'};
    return `${enumValue.name} (${value})`;
  }
}
