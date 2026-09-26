import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';
import { getApiBaseUrl } from '../../../../core/services/api-config';

@Component({
  selector: 'app-cta-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="final-cta-section" id="final-cta">
      <div class="container">
        
        <div class="cta-inner-card">
          <h2 class="cta-heading">{{ ctaHeading() }}</h2>
          
          <p class="cta-sub">
            {{ ctaSub() }}
          </p>

          <div class="cta-btn-group">
            <button type="button" class="btn btn-gold btn-lg" (click)="onExplore()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>{{ ctaBtnText() }}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .final-cta-section {
      background: #F8FAFC;
      padding-top: 2rem;
      padding-bottom: 4rem;
      border-top: 1px solid var(--slate-200);
    }

    .cta-inner-card {
      background: var(--primary-900);
      border-radius: var(--radius-lg);
      padding: 3.5rem 2rem;
      text-align: center;
      color: #FFFFFF;
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .cta-heading {
      font-size: clamp(1.85rem, 3.2vw, 2.5rem);
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }

    .cta-sub {
      font-size: 1rem;
      color: var(--slate-300);
      max-width: 580px;
      line-height: 1.55;
      margin-bottom: 2rem;
    }

    .cta-btn-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    @media (max-width: 600px) {
      .cta-btn-group {
        flex-direction: column;
        width: 100%;
      }
      .cta-btn-group .btn {
        width: 100%;
      }
    }
  `]
})
export class CtaBannerComponent implements OnInit {
  notificationService = inject(NotificationService);

  @Output() exploreRequested = new EventEmitter<void>();

  ctaHeading = signal<string>('Find Your Next Property Today');
  ctaSub = signal<string>('Connect with verified sellers, licensed dealers, and ground property scouts across top locations.');
  ctaBtnText = signal<string>('Explore Properties');

  ngOnInit(): void {
    fetch(`${getApiBaseUrl()}/settings/group/home`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          if (data.settings.cta_heading) this.ctaHeading.set(data.settings.cta_heading);
          if (data.settings.cta_sub) this.ctaSub.set(data.settings.cta_sub);
          if (data.settings.cta_btn_text) this.ctaBtnText.set(data.settings.cta_btn_text);
        }
      })
      .catch(() => {});
  }

  onExplore() {
    const el = document.getElementById('search-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    this.exploreRequested.emit();
  }
}
