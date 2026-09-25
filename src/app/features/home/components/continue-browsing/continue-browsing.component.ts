import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-continue-browsing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="continue-browsing-section">
      <div class="container">
        <div class="browsing-bar">
          <span class="browsing-title">Continue Browsing:</span>
          
          <div class="options-row">
            <button 
              type="button" 
              *ngFor="let opt of options" 
              class="browse-chip" 
              (click)="onOptionClick(opt)">
              <span class="chip-dot"></span>
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .continue-browsing-section {
      padding-top: 0.25rem;
      padding-bottom: 2rem;
      background: #FFFFFF;
    }

    .browsing-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      padding: 0.65rem 1.25rem;
      border-radius: var(--radius-md);
      flex-wrap: wrap;
    }

    .browsing-title {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--primary-900);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }

    .options-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .browse-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--slate-700);
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-full);
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .browse-chip:hover {
      background: var(--primary-900);
      border-color: var(--primary-900);
      color: #FFFFFF;
    }

    .chip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--gold-500);
    }
  `]
})
export class ContinueBrowsingComponent {
  notificationService = inject(NotificationService);

  @Output() optionSelected = new EventEmitter<string>();

  options = [
    { label: 'New Launch Properties', targetId: 'new-launches' },
    { label: 'Properties Near You', targetId: 'explore-properties' },
    { label: 'Premium Properties', targetId: 'platinum-villas' },
    { label: 'Plots & Land', targetId: 'platinum-plots' }
  ];

  onOptionClick(opt: { label: string; targetId: string }) {
    const el = document.getElementById(opt.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    this.notificationService.show('Browsing', `Navigated to ${opt.label}`, 'info');
    this.optionSelected.emit(opt.label);
  }
}
