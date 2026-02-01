import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appImageFallback]'
})
export class ImageFallbackDirective implements OnInit {
  @Input() appImageFallback: string = '';

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit() {
    const img = this.el.nativeElement;
    img.onerror = () => {
      if (this.appImageFallback) {
        img.src = this.appImageFallback;
      }
    };
  }
}