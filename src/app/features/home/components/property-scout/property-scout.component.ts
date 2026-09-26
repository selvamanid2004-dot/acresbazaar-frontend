import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-property-scout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="scout-banner-section section-py" id="property-scout">
      <div class="container">
        
        <!-- Horizontal Promotional Banner -->
        <div class="scout-horizontal-card">
          
          <div class="scout-content-col">
            <span class="scout-tag">PROPERTY SCOUT PROGRAM</span>
            
            <h2 class="scout-title">
              See a Property for Sale?
            </h2>

            <p class="scout-desc">
              Capture the property board, submit the details and earn rewards when your property lead is approved.
            </p>

            <button type="button" class="btn btn-gold btn-scout" (click)="onBecomeScout()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <circle cx="11" cy="14" r="2"></circle>
              </svg>
              <span>Become a Property Scout</span>
            </button>
          </div>

          <!-- Right Side: Discovery Visual Card -->
          <div class="scout-visual-col">
            <div class="discovery-badge-card">
              <div class="badge-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
              </div>
              <div class="badge-texts">
                <strong>Snap & Earn</strong>
                <span>Upload on-ground for-sale boards</span>
              </div>
            </div>

            <div class="discovery-badge-card highlight">
              <div class="badge-icon-wrap gold-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div class="badge-texts">
                <strong>Instant Lead Bounties</strong>
                <span>Direct payout on verification</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  `,
  styles: [`
    .scout-banner-section {
      background: #F8FAFC;
      border-top: 1px solid var(--slate-200);
    }

    .scout-horizontal-card {
      background: var(--primary-900);
      border-radius: var(--radius-lg);
      padding: 2.75rem 3rem;
      display: grid;
      grid-template-columns: 1.3fr 0.9fr;
      align-items: center;
      gap: 2.5rem;
      color: #FFFFFF;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
    }

    .scout-horizontal-card::after {
      content: '';
      position: absolute;
      right: -80px;
      bottom: -80px;
      width: 260px;
      height: 260px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(197, 168, 128, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }

    .scout-content-col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .scout-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: var(--gold-400);
      background: rgba(197, 168, 128, 0.15);
      border: 1px solid rgba(197, 168, 128, 0.3);
      padding: 0.2rem 0.65rem;
      border-radius: var(--radius-xs);
      margin-bottom: 0.75rem;
    }

    .scout-title {
      font-size: clamp(1.85rem, 3vw, 2.35rem);
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }

    .scout-desc {
      font-size: 1rem;
      color: var(--slate-300);
      line-height: 1.6;
      margin-bottom: 1.75rem;
      max-width: 540px;
    }

    .btn-scout {
      padding: 0.75rem 1.65rem;
      font-size: 0.95rem;
      font-weight: 700;
    }

    /* Right Visual Badges */
    .scout-visual-col {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .discovery-badge-card {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      backdrop-filter: blur(6px);
      transition: all var(--transition-fast);
    }

    .discovery-badge-card:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateX(4px);
    }

    .discovery-badge-card.highlight {
      border-color: rgba(197, 168, 128, 0.4);
      background: rgba(197, 168, 128, 0.12);
    }

    .badge-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      flex-shrink: 0;
    }

    .gold-wrap {
      background: var(--gold-500);
      color: var(--primary-950);
    }

    .badge-texts {
      display: flex;
      flex-direction: column;
    }

    .badge-texts strong {
      font-size: 0.95rem;
      color: #FFFFFF;
    }

    .badge-texts span {
      font-size: 0.78rem;
      color: var(--slate-300);
    }

    @media (max-width: 900px) {
      .scout-horizontal-card {
        grid-template-columns: 1fr;
        padding: 2rem 1.5rem;
        gap: 1.75rem;
      }
    }
  `]
})
export class PropertyScoutComponent {
  notificationService = inject(NotificationService);

  @Output() becomeScoutRequested = new EventEmitter<void>();

  onBecomeScout() {
    this.notificationService.show('Property Scout', 'Opening Scout registration and verification portal...', 'gold');
    this.becomeScoutRequested.emit();
  }
}
