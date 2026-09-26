import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section-header-wrapper" [class.dark-mode]="lightTheme">
      <div class="header-text-col">
        <div *ngIf="badgeText" class="section-badge">
          <span class="badge-dot"></span>
          {{ badgeText }}
        </div>
        <h2 class="section-title">{{ title }}</h2>
        <p *ngIf="subtitle" class="section-subtitle">{{ subtitle }}</p>
      </div>

      <div *ngIf="viewAllText" class="header-action-col">
        <a [href]="viewAllLink || '#'" class="view-all-link">
          <span>{{ viewAllText }}</span>
          <svg class="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .section-header-wrapper {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1.5rem;
      margin-bottom: 2.75rem;
      flex-wrap: wrap;
    }

    .header-text-col {
      max-width: 680px;
    }

    .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--gold-600);
      background: var(--gold-light);
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-full);
      margin-bottom: 0.75rem;
      border: 1px solid rgba(197, 168, 128, 0.3);
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--gold-500);
      box-shadow: 0 0 6px var(--gold-500);
    }

    .section-title {
      font-size: clamp(1.85rem, 3vw, 2.35rem);
      font-weight: 700;
      color: var(--navy-950);
      line-height: 1.2;
      margin-bottom: 0.5rem;
      letter-spacing: -0.025em;
    }

    .section-subtitle {
      font-size: 1rem;
      color: var(--slate-500);
      line-height: 1.6;
    }

    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--navy-950);
      padding: 0.6rem 1.2rem;
      border-radius: var(--radius-full);
      background: var(--slate-100);
      border: 1px solid var(--slate-200);
      transition: all var(--transition-base);
    }

    .view-all-link:hover {
      background: var(--navy-950);
      color: var(--white);
      border-color: var(--navy-950);
      transform: translateX(3px);
    }

    .arrow-icon {
      transition: transform var(--transition-base);
    }

    .view-all-link:hover .arrow-icon {
      transform: translateX(4px);
    }

    /* Light on dark backgrounds */
    .dark-mode .section-title {
      color: var(--white);
    }

    .dark-mode .section-subtitle {
      color: var(--slate-300);
    }

    .dark-mode .view-all-link {
      background: rgba(255, 255, 255, 0.1);
      color: var(--white);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .dark-mode .view-all-link:hover {
      background: var(--gold-500);
      color: var(--navy-950);
      border-color: var(--gold-500);
    }
  `]
})
export class SectionHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() badgeText?: string;
  @Input() viewAllText?: string;
  @Input() viewAllLink?: string;
  @Input() lightTheme: boolean = false;
}
