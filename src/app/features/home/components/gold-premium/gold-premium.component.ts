import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-gold-premium',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="gold-premium-marketplace-section section-py" id="gold-premium-section">
      <div class="container">
        
        <div class="two-column-grid">
          
          <!-- LEFT: GOLD PROPERTIES -->
          <div class="tier-box gold-box">
            <div class="box-top">
              <span class="tier-pill gold-pill">SCOUT DISCOVERY</span>
              <div class="icon-circle gold-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
            </div>

            <h3 class="tier-title">GOLD PROPERTIES</h3>
            
            <p class="tier-desc">
              Discover property opportunities submitted by Property Scouts.
            </p>

            <ul class="benefit-points">
              <li>✓ Early-stage for-sale boards captured on-ground</li>
              <li>✓ Verified GPS location & contact numbers</li>
              <li>✓ Unlisted & off-market residential deals</li>
            </ul>

            <button type="button" class="btn btn-gold btn-tier" (click)="onExplore('Gold Properties')">
              <span>Explore Gold Properties</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <!-- RIGHT: PREMIUM PROPERTIES -->
          <div class="tier-box premium-box">
            <div class="box-top">
              <span class="tier-pill premium-pill">DIRECT LISTINGS</span>
              <div class="icon-circle premium-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
            </div>

            <h3 class="tier-title">PREMIUM PROPERTIES</h3>
            
            <p class="tier-desc">
              Explore detailed properties directly listed by sellers and dealers.
            </p>

            <ul class="benefit-points">
              <li>✓ Complete title documentation & RERA approvals</li>
              <li>✓ High-resolution photography & verified floor plans</li>
              <li>✓ Direct owner & authorized dealer contact</li>
            </ul>

            <button type="button" class="btn btn-primary btn-tier" (click)="onExplore('Premium Properties')">
              <span>Explore Premium Properties</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

        </div>

      </div>
    </section>
  `,
  styles: [`
    .gold-premium-marketplace-section {
      background: #FFFFFF;
      border-top: 1px solid var(--slate-200);
    }

    .two-column-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.75rem;
    }

    .tier-box {
      border-radius: var(--radius-lg);
      padding: 2.25rem 2rem;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--slate-200);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
    }

    .tier-box:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    /* Left Gold Box */
    .gold-box {
      background: linear-gradient(145deg, #FFFDF8 0%, #FAF5ED 100%);
      border-color: rgba(197, 168, 128, 0.45);
    }

    .gold-pill {
      background: rgba(197, 168, 128, 0.2);
      color: #8C6F47;
      border: 1px solid rgba(197, 168, 128, 0.4);
    }

    .gold-icon {
      background: var(--gold-500);
      color: var(--primary-950);
    }

    /* Right Premium Box */
    .premium-box {
      background: linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%);
      border-color: var(--slate-300);
    }

    .premium-pill {
      background: var(--slate-100);
      color: var(--primary-900);
      border: 1px solid var(--slate-300);
    }

    .premium-icon {
      background: var(--primary-900);
      color: #FFFFFF;
    }

    .box-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .tier-pill {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-xs);
    }

    .icon-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tier-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--primary-900);
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
    }

    .tier-desc {
      font-size: 0.95rem;
      color: var(--slate-600);
      line-height: 1.5;
      margin-bottom: 1.25rem;
    }

    .benefit-points {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.75rem;
      flex: 1;
    }

    .benefit-points li {
      font-size: 0.85rem;
      color: var(--slate-700);
      font-weight: 500;
    }

    .btn-tier {
      width: 100%;
      height: 46px;
      font-size: 0.95rem;
    }

    @media (max-width: 800px) {
      .two-column-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GoldPremiumComponent {
  notificationService = inject(NotificationService);

  @Output() tierChosen = new EventEmitter<string>();

  onExplore(tierName: string) {
    this.notificationService.show(tierName, `Filtering properties by ${tierName}`, 'gold');
    this.tierChosen.emit(tierName);
  }
}
