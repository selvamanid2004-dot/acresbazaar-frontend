import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'info' | 'gold';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private currentToast = signal<ToastMessage | null>(null);

  getToast() {
    return this.currentToast.asReadonly();
  }

  show(title: string, message: string, type: 'success' | 'info' | 'gold' = 'info') {
    const toast: ToastMessage = {
      id: Date.now(),
      type,
      title,
      message
    };
    this.currentToast.set(toast);

    setTimeout(() => {
      if (this.currentToast()?.id === toast.id) {
        this.currentToast.set(null);
      }
    }, 4000);
  }

  dismiss() {
    this.currentToast.set(null);
  }
}
