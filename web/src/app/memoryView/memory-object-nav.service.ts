import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {MemoryObject} from '../memory/MemoryObject';

export interface NamedMemoryObject {
  name: string;
  obj: MemoryObject;
}

@Injectable()
export class MemoryObjectNavService {
  private stack: NamedMemoryObject[] = [];
  private subject = new Subject<NamedMemoryObject[]>();

  pushNavigation(obj: NamedMemoryObject) {
    this.stack.push(obj);
    this.subject.next(this.stack);
  }

  popNavigation() {
    if (this.stack.length > 0) {
      this.stack.pop();
      this.subject.next(this.stack);
    }
  }

  get onNavigate(): Observable<NamedMemoryObject[]> {
    return this.subject;
  }

  popTo(obj: NamedMemoryObject) {
    while (this.stack.length > 0 && this.stack[this.stack.length - 1] != obj) {
      this.stack.pop();
    }
  }
}
