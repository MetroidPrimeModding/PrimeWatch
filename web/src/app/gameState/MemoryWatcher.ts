import {MemoryObjectInstance} from './game-types.service';

export class MemoryWatcher {
  // TODO: tree?
  private list: MemoryWatch[] = [];

  constructor() {
  }

  register(watch: MemoryWatch) {
    console.log(`Registering ${watch.toString()}`);
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].start < watch.start) {
        this.list.splice(i, 0, watch);
        return;
      }
    }
    this.list.push(watch);
  }

  registerMemoryObject(obj: MemoryObjectInstance): MemoryWatch {
    const watch = new MemoryWatch(
      `${obj.obj.name}@${obj.offset.toString(16)}`,
      obj.offset,
      obj.offset + obj.obj.size
    );
    this.register(watch);
    return watch;
  }

  deregister(watch: MemoryWatch) {
    console.log(`Deregistering ${watch.toString()}`);
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i] === watch) {
        this.list.splice(i, 1);
      }
    }
  }

  printStats() {
    let totalMemory = 0;
    const watchCount = this.list.length;
    for (const item of this.list) {
      totalMemory += item.end - item.start;
    }
    console.log(`Memory watches: ${watchCount} watches totaling ${totalMemory} bytes`);
  }
}

export class MemoryWatch {
  constructor(
    public readonly name: string,
    public readonly start: number,
    public readonly end: number
  ) {
  }

  toString() {
    return `${this.name}[${this.start.toString(16)}:${this.end.toString(16)}]`;
  }
}
