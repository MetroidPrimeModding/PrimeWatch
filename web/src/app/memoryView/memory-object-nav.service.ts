import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {CompiledStructInstance} from '../gameState/game-types.service';

@Injectable()
export class MemoryObjectNavService {
  private stack: CompiledStructInstance[] = [];
  private subject = new Subject<CompiledStructInstance[]>();

  pushNavigation(obj: CompiledStructInstance) {
    this.stack.push(obj);
    this.subject.next(this.stack);
  }

  popNavigation() {
    if (this.stack.length > 0) {
      this.stack.pop();
      this.subject.next(this.stack);
    }
  }

  get onNavigate(): Observable<CompiledStructInstance[]> {
    return this.subject;
  }

  popTo(obj: CompiledStructInstance) {
    while (this.stack.length > 0 && this.stack[this.stack.length - 1] != obj) {
      this.stack.pop();
    }
  }
}
