import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.requestBrowserPermission();
  }

  /**
   * Request browser permission for push notifications
   */
  async requestBrowserPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      }
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }
    return false;
  }

  /**
   * Push an in-app and browser notification
   */
  notify(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', link?: string): void {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      link
    };

    const current = this.notificationsSubject.getValue();
    this.notificationsSubject.next([newNotif, ...current]);

    // Show native browser desktop notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico'
        });
      } catch (e) {
        // Fallback silently
      }
    }
  }

  markAllAsRead(): void {
    const updated = this.notificationsSubject.getValue().map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}
