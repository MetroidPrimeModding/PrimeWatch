import { Component } from '@angular/core';
import {RenderService} from "./render/render.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'web';

  constructor(private render: RenderService) {
  }

  onTabChange($event: number) {
    this.render.active = $event === 0;
  }
}
