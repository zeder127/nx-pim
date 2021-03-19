import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

@Directive({
  selector: '[pimShowOnHover]',
})
export class ShowOnHoverDirective implements OnInit, OnDestroy {
  @Input() containerSelector: string;

  private mouseenterSubscription: Subscription;
  private mouseleaveSubscription: Subscription;

  constructor(private hostElementRef: ElementRef) {
    console.log('directive');
  }

  ngOnInit() {
    const hostEl: HTMLElement = this.hostElementRef.nativeElement;
    hostEl.style.display = 'none';
    const containerElement = !this.containerSelector
      ? hostEl.parentElement
      : document.querySelector(this.containerSelector);
    if (containerElement) {
      this.mouseenterSubscription = fromEvent(containerElement, 'mouseenter').subscribe(
        () => (hostEl.style.display = '')
      );
      this.mouseleaveSubscription = fromEvent(containerElement, 'mouseleave').subscribe(
        () => (hostEl.style.display = 'none')
      );
    }
  }

  ngOnDestroy() {
    this.mouseenterSubscription.unsubscribe();
    this.mouseleaveSubscription.unsubscribe();
  }
}
