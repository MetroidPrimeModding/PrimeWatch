import {Component, OnInit, ViewChild} from '@angular/core';
import {StatsService} from "./stats.service";
import {RenderService} from "../render/render.service";

@Component({
  selector: 'pw-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  @ViewChild("canvasElement", {static: true}) canvas: any;
  @ViewChild("canvasWrapper", {static: true}) canvasWrapper: any;

  constructor(private render: RenderService) {
  }

  ngOnInit() {
    this.render.init(this.canvas.nativeElement);
  }

  onResize($event: UIEvent) {
    this.render.resize(this.canvasWrapper.nativeElement.offsetWidth, this.canvasWrapper.nativeElement.offsetHeight);
  }
}
