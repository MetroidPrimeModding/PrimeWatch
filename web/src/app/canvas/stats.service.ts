import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  stats: any;

  constructor() {
    this.stats = new (window as any).Stats();
    document.body.appendChild(this.stats.dom);
  }

  begin() {
    this.stats.begin();
  }

  end() {
    this.stats.end();
  }
}
