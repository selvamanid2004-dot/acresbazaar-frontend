import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="toastService.getToast()() as toast" class="toast-wrapper" [ngClass]="'toast-' + toast.type">
      <div class="toast-icon">
        <svg *ngIf="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <svg *ngIf="toast.type === 'gold'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <svg *ngIf="toast.type === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>

      <div class="toast-body">
        <strong class="toast-title">{{ toast.title }}</strong>
        <span class="toast-text">{{ toast.message }}</span>
      </div>

      <button type="button" class="toast-close" (click)="toastService.dismiss()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .toast-wrapper {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.9rem;
      background: var(--navy-950);
      color: var(--white);
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xl);
      border: 1px solid rgba(255, 255, 255, 0.15);
      animation: slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 420px;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .toast-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toast-success .toast-icon {
      background: var(--emerald-light);
      color: var(--emerald-500);
    }

    .toast-gold .toast-icon {
      background: var(--gold-light);
      color: var(--gold-400);
    }

    .toast-info .toast-icon {
      background: rgba(37, 99, 235, 0.2);
      color: #60A5FA;
    }

    .toast-body {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .toast-title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--white);
    }

    .toast-text {
      font-size: 0.8125rem;
      color: var(--slate-300);
    }

    .toast-close {
      color: var(--slate-400);
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
    }

    .toast-close:hover {
      color: var(--white);
    }

    @media (max-width: 640px) {
      .toast-wrapper {
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
      }
    }
  `]
})
export class ToastNotificationComponent {
  toastService = inject(NotificationService);
}
