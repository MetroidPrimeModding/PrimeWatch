import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {MemoryObjectInstance} from '../gameState/game-types.service';

@Injectable()
export class MemoryObjectNavService {
  private stack: MemoryObjectInstance[] = [];
  private subject = new Subject<MemoryObjectInstance[]>();

  pushNavigation(obj: MemoryObjectInstance) {
    this.stack.push(obj);
    this.subject.next(this.stack);
  }

  popNavigation() {
    if (this.stack.length > 0) {
      this.stack.pop();
      this.subject.next(this.stack);
    }
  }

  get onNavigate(): Observable<MemoryObjectInstance[]> {
    return this.subject;
  }

  popTo(obj: MemoryObjectInstance) {
    while (this.stack.length > 0 && this.stack[this.stack.length - 1] != obj) {
      this.stack.pop();
    }
  }
}
