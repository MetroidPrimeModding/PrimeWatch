import { Component, OnInit } from '@angular/core';
import {GameStateService} from "../gameState/game-state.service";

@Component({
  selector: 'pw-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

  constructor(private state: GameStateService) { }

  ngOnInit() {
  }

  loadFromGame() {
    this.state.refresh();
  }

  printMemoryStats() {
    this.state.memoryWatches.printStats();
  }
}
