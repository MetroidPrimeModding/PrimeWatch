import {Component, OnInit, ViewChild} from '@angular/core';
import {StatsService} from './stats.service';
import {RenderService} from '../render/render.service';

@Component({
  selector: 'pw-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  @ViewChild('canvasElement', {static: true}) canvas: any;
  @ViewChild('canvasWrapper', {static: true}) canvasWrapper: any;

  constructor(private render: RenderService) {
  }

  ngOnInit() {
    this.onResize();
    requestAnimationFrame(() => {
      this.onResize();
    });
    this.render.init(this.canvas.nativeElement);
  }

  onResize($event?: UIEvent) {
    this.setHeight();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.render.resize(this.canvasWrapper.nativeElement.offsetWidth, this.canvasWrapper.nativeElement.offsetHeight);
      });
    });
  }

  private setHeight() {
    const wrapper = this.canvasWrapper.nativeElement as HTMLDivElement;
    wrapper.style.height = (window.innerHeight - wrapper.getBoundingClientRect().top - 1) + 'px';
    // const canvas = this.canvas.nativeElement as HTMLCanvasElement;
    // canvas.width = wrapper.clientWidth;
    // canvas.height = wrapper.clientHeight;
  }
}
