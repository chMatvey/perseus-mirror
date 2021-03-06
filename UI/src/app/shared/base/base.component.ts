import { Component, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  template: ''
})
export abstract class BaseComponent implements OnDestroy {

  private destroy$: ReplaySubject<void> = new ReplaySubject<void>(1);

  get ngUnsubscribe() {
    return this.destroy$.asObservable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
