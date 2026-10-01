import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private debounceTimer: any = null;

  public isLoading$ = this.isLoadingSubject.asObservable();

  show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      // 250ms debounce prevents micro-flashing/blinking on fast click interactions & background requests
      if (!this.debounceTimer) {
        this.debounceTimer = setTimeout(() => {
          if (this.activeRequests > 0) {
            this.isLoadingSubject.next(true);
          }
          this.debounceTimer = null;
        }, 250);
      }
    }
  }

  hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    if (this.activeRequests === 0) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      this.isLoadingSubject.next(false);
    }
  }

  forceReset(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.activeRequests = 0;
    this.isLoadingSubject.next(false);
  }
}
