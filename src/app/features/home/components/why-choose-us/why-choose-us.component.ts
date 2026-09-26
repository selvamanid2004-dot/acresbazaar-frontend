import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="why-us-marketplace-section section-py" id="about">
      <div class="container">
        
        <div class="section-heading-centered">
          <span class="small-tag">MARKETPLACE ADVANTAGE</span>
          <h2 class="section-title">Why Choose AcresBazaar?</h2>
          <p class="section-desc">
            A trusted real estate discovery marketplace built for transparency, ground-verified listings, and direct connections.
          </p>
        </div>

        <!-- 4 Clean Feature Items -->
        <div class="four-features-grid">
          
          <!-- 1: Verified Properties -->
          <div class="feature-item">
            <div class="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
            </div>
            <h3 class="feature-title">Verified Properties</h3>
            <p class="feature-text">
              Every plot, villa, and apartment undergoes legal title due-diligence and RERA status verification.
            </p>
          </div>

          <!-- 2: Easy Property Search -->
          <div class="feature-item">
            <div class="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <path d="m19 5 2 2-2 2-2-2 2-2Z"></path>
              </svg>
            </div>
            <h3 class="feature-title">Easy Property Search</h3>
            <p class="feature-text">
              Intuitive search filters by location, budget, and category to help you discover properties in seconds.
            </p>
          </div>

          <!-- 3: Gold & Premium Listings -->
          <div class="feature-item">
            <div class="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
            </div>
            <h3 class="feature-title">Gold & Premium Listings</h3>
            <p class="feature-text">
              Clear distinction between ground scout-spotted off-market deals and verified direct dealer portfolios.
            </p>
          </div>

          <!-- 4: Property Scout Rewards -->
          <div class="feature-item">
            <div class="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
            </div>
            <h3 class="feature-title">Property Scout Rewards</h3>
            <p class="feature-text">
              Crowd-sourced network empowering anyone to submit property boards and earn verified referral bounties.
            </p>
          </div>

        </div>

      </div>
    </section>
  `,
  styles: [`
    .why-us-marketplace-section {
      background: #FFFFFF;
      border-top: 1px solid var(--slate-200);
    }

    .section-heading-centered {
      text-align: center;
      max-width: 640px;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 2.75rem;
    }

    .small-tag {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--primary-900);
      background: var(--slate-100);
      padding: 0.2rem 0.65rem;
      border-radius: var(--radius-xs);
      letter-spacing: 0.08em;
      display: inline-block;
      margin-bottom: 0.6rem;
    }

    .section-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--primary-900);
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin-bottom: 0.5rem;
    }

    .section-desc {
      font-size: 0.95rem;
      color: var(--slate-500);
      line-height: 1.55;
    }

    .four-features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .feature-item {
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-base);
    }

    .feature-item:hover {
      border-color: var(--primary-900);
      transform: translateY(-3px);
      box-shadow: var(--shadow-sm);
    }

    .feature-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      color: var(--primary-900);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
      transition: all var(--transition-base);
    }

    .feature-item:hover .feature-icon-box {
      background: var(--primary-900);
      color: var(--gold-400);
      border-color: var(--primary-900);
    }

    .feature-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--primary-900);
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }

    .feature-text {
      font-size: 0.875rem;
      color: var(--slate-600);
      line-height: 1.55;
    }

    @media (max-width: 1024px) {
      .four-features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .four-features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WhyChooseUsComponent {}
