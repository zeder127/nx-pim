import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({ template: '' })
export class AutoUnsubscriber implements OnDestroy {
  protected destroy$ = new Subject();
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.next();
  }

  protected autoUnsubscribe<T>() {
    return takeUntil<T>(this.destroy$);
  }
}
