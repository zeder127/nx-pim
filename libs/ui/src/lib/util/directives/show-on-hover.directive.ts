import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

@Directive({
  selector: '[pimShowOnHover]',
})
export class ShowOnHoverDirective implements OnInit, OnChanges, OnDestroy {
  @Input() containerSelector: string;
  /**
   * Additional condition for showing the host element
   */
  @Input() additionalShowOn: boolean;

  private mouseenterSubscription: Subscription;
  private mouseleaveSubscription: Subscription;
  private hostEl: HTMLElement;

  constructor(private hostElementRef: ElementRef) {}

  ngOnInit() {
    this.hostEl = this.hostElementRef.nativeElement;
    this.hostEl.style.display = 'none';
    const containerElement = !this.containerSelector
      ? this.hostEl.parentElement
      : document.querySelector(this.containerSelector);
    if (containerElement) {
      this.mouseenterSubscription = fromEvent(containerElement, 'mouseenter').subscribe(
        () => (this.hostEl.style.display = '')
      );
      this.mouseleaveSubscription = fromEvent(containerElement, 'mouseleave').subscribe(
        () => {
          if (!this.additionalShowOn) this.hostEl.style.display = 'none';
        }
      );
    }
  }

  ngOnChanges({ additionalCondition }: SimpleChanges) {
    if (this.hostEl && !!additionalCondition && !additionalCondition.isFirstChange())
      this.hostEl.style.display = additionalCondition.currentValue ? '' : 'none';
  }

  ngOnDestroy() {
    this.mouseenterSubscription.unsubscribe();
    this.mouseleaveSubscription.unsubscribe();
  }
}
