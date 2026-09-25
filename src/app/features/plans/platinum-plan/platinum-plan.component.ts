import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-platinum-plan',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="plan-page-container">
      <div class="plan-wrapper">
        <!-- Back Button -->
        <button type="button" class="back-nav-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back
        </button>

        <!-- Header -->
        <div class="plan-header">
          <span class="plan-badge">AcresBazaar MEMBERSHIP</span>
          <h1 class="plan-title">{{ planData().name }}</h1>
          <p class="plan-subtitle">
            {{ planData().description }}
          </p>
        </div>

        <!-- Plan Card -->
        <div class="plan-card platinum-border">
          <div class="plan-pricing-banner">
            <div class="pricing-info">
              <span class="tier-pill">{{ planData().badge || 'VIP ALL-ACCESS TIER' }}</span>
              <h2 class="tier-heading">{{ planData().name }}</h2>
              <p class="tier-desc">Unrestricted access to high-value assets and off-market inventory.</p>
            </div>
            <div class="price-display">
              <span class="curr">₹</span>
              <span class="amount">{{ planData().price }}</span>
              <span class="period">/ {{ planData().billing_period }}</span>
            </div>
          </div>

          <!-- Benefits List -->
          <div class="benefits-section">
            <h3>{{ planData().name }} Benefits & Privileges</h3>
            <ul class="benefits-list">
              <li *ngFor="let b of planData().benefits">
                <div class="icon-check">✦</div>
                <div>
                  <span>{{ b.benefit_text || b }}</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- Dynamic Promotional Banner if configured -->
          <div *ngIf="planData().content" style="margin: 0 36px 24px; padding: 14px 18px; border-radius: 10px; background: rgba(56, 189, 248, 0.08); border: 1px dashed rgba(56, 189, 248, 0.3); color: #38BDF8; font-size: 0.92rem; line-height: 1.5; display: flex; align-items: center; gap: 8px;">
            <span>✨</span>
            <span>{{ planData().content }}</span>
          </div>

          <!-- Action Button -->
          <div class="action-area">
            <div *ngIf="isCurrentPlan()" class="current-plan-status">
              <span class="active-dot"></span> You currently have an active {{ planData().name }}
            </div>

            <button
              *ngIf="!isCurrentPlan()"
              type="button"
              class="subscribe-btn"
              [disabled]="isProcessing()"
              (click)="subscribePlatinum()"
            >
              <span *ngIf="!isProcessing()">Activate {{ planData().name }} (₹{{ planData().price }}/{{ planData().billing_period }})</span>
              <span *ngIf="isProcessing()">Activating VIP Membership...</span>
            </button>

            <p class="terms-note">Cancel anytime. Instant activation upon confirmation.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plan-page-container {
      min-height: calc(100vh - 80px);
      padding: 40px 20px 80px;
      background: linear-gradient(180deg, #090E14 0%, #101923 100%);
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .plan-wrapper {
      max-width: 800px;
      margin: 0 auto;
    }

    .back-nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #E2E8F0;
      padding: 10px 18px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.92rem;
      margin-bottom: 30px;
      transition: all 0.2s ease;
    }

    .back-nav-btn:hover {
      background: rgba(56, 189, 248, 0.15);
      border-color: #38BDF8;
      color: #38BDF8;
      transform: translateX(-3px);
    }

    .plan-header {
      text-align: center;
      margin-bottom: 36px;
    }

    .plan-badge {
      display: inline-block;
      color: #38BDF8;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .plan-title {
      color: #FFFFFF;
      font-size: 2.2rem;
      font-weight: 800;
      margin: 0 0 14px;
      letter-spacing: -0.02em;
    }

    .plan-subtitle {
      color: #94A3B8;
      font-size: 1rem;
      line-height: 1.6;
      max-width: 640px;
      margin: 0 auto;
    }

    .plan-card {
      background: #121C27;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }

    .platinum-border {
      border: 2px solid rgba(56, 189, 248, 0.45);
    }

    .plan-pricing-banner {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(18, 28, 39, 0.9) 100%);
      padding: 32px 36px;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .tier-pill {
      display: inline-block;
      background: rgba(56, 189, 248, 0.2);
      color: #38BDF8;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 8px;
    }

    .tier-heading {
      color: #FFFFFF;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 6px;
    }

    .tier-desc {
      color: #94A3B8;
      font-size: 0.9rem;
      margin: 0;
    }

    .price-display {
      display: flex;
      align-items: baseline;
      color: #38BDF8;
    }

    .curr {
      font-size: 1.8rem;
      font-weight: 700;
    }

    .amount {
      font-size: 3.2rem;
      font-weight: 800;
      line-height: 1;
      margin: 0 4px;
    }

    .period {
      color: #94A3B8;
      font-size: 1rem;
    }

    .benefits-section {
      padding: 36px;
    }

    .benefits-section h3 {
      color: #FFFFFF;
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0 0 20px;
    }

    .benefits-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .benefits-list li {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .icon-check {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(56, 189, 248, 0.18);
      color: #38BDF8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .benefits-list strong {
      display: block;
      color: #FFFFFF;
      font-size: 0.96rem;
      margin-bottom: 2px;
    }

    .benefits-list span {
      color: #94A3B8;
      font-size: 0.88rem;
      line-height: 1.4;
    }

    .action-area {
      padding: 0 36px 36px;
      text-align: center;
    }

    .subscribe-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #38BDF8 0%, #0284C7 100%);
      color: #0B1118;
      border: none;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 10px 25px rgba(56, 189, 248, 0.3);
    }

    .subscribe-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 14px 30px rgba(56, 189, 248, 0.45);
      background: linear-gradient(135deg, #7DD3FC 0%, #0369A1 100%);
    }

    .subscribe-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .current-plan-status {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ADE80;
      padding: 14px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 12px;
    }

    .active-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #4ADE80;
      box-shadow: 0 0 10px #4ADE80;
    }

    .terms-note {
      color: #64748B;
      font-size: 0.84rem;
      margin-top: 14px;
    }
  `]
})
export class PlatinumPlanComponent implements OnInit {
  isProcessing = signal<boolean>(false);

  planData = signal<any>({
    name: 'Platinum Elite Membership',
    price: 129,
    billing_period: 'month',
    badge: 'MOST VALUABLE',
    description: 'Exclusive off-market inventory, priority site viewings, dedicated property lawyer, and unmetered owner connections.',
    benefits: [
      { benefit_text: 'Everything in Gold, plus exclusive private luxury listings' },
      { benefit_text: 'Unlimited instant owner contacts without monthly cap' },
      { benefit_text: 'Dedicated relationship manager & VIP private site visits' },
      { benefit_text: 'End-to-end legal title verification & advocate contract drafting' },
      { benefit_text: 'Zero buyer brokerage guarantee on verified network properties' },
      { benefit_text: 'Early 48-hour access to high-yield off-market property releases' }
    ]
  });

  constructor(
    private authService: AuthService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlan();
  }

  loadPlan(): void {
    fetch('http://localhost:5001/api/plans/platinum')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.plan) {
          const p = data.plan;
          const rawBenefits = Array.isArray(p.benefits) ? p.benefits : [];
          const mappedBenefits = rawBenefits.map((b: any) => {
            if (typeof b === 'string') return { benefit_text: b };
            return b;
          });

          this.planData.set({
            name: p.name || 'Platinum Elite Membership',
            price: p.price !== undefined ? p.price : 129,
            billing_period: p.period || p.billing_period || 'month',
            badge: p.badge || 'MOST VALUABLE',
            description: p.description || this.planData().description,
            benefits: mappedBenefits.length > 0 ? mappedBenefits : this.planData().benefits,
            content: p.content || ''
          });
        }
      })
      .catch(() => {});
  }

  isCurrentPlan(): boolean {
    return this.authService.activeMembership() === 'platinum';
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  subscribePlatinum(): void {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.authService.setMembership('platinum');
      this.isProcessing.set(false);
      alert('Congratulations! Platinum VIP Plan membership has been activated for your account.');
    }, 600);
  }
}
