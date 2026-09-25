import { Component, EventEmitter, Input, Output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavStateService } from '../../../core/services/nav-state.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-membership-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="close()">
      <div class="modal-dialog" [class.gold-dialog]="effectivePlan === 'gold'" [class.plat-dialog]="effectivePlan === 'platinum'" (click)="$event.stopPropagation()">
        
        <!-- Header: Strictly Single Plan (Gold OR Platinum) -->
        <div class="modal-header">
          <div class="header-left">
            <span class="modal-badge" *ngIf="effectivePlan === 'gold'">AcresBazaar MEMBERSHIP • {{ goldPlan().name | uppercase }}</span>
            <span class="modal-badge" *ngIf="effectivePlan === 'platinum'">AcresBazaar MEMBERSHIP • {{ platPlan().name | uppercase }}</span>
            
            <h2 class="modal-title" *ngIf="effectivePlan === 'gold'">{{ goldPlan().name }} Membership</h2>
            <h2 class="modal-title" *ngIf="effectivePlan === 'platinum'">{{ platPlan().name }} Membership</h2>

            <p class="modal-subtitle" *ngIf="effectivePlan === 'gold'">
              {{ goldPlan().description }}
            </p>
            <p class="modal-subtitle" *ngIf="effectivePlan === 'platinum'">
              {{ platPlan().description }}
            </p>
          </div>

          <button type="button" class="close-btn" (click)="close()" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Body: Dedicated Single Plan Content ONLY -->
        <div class="modal-body">
          
          <!-- SINGLE PLAN PRESENTATION: GOLD ONLY -->
          <div class="single-plan-view gold-single" *ngIf="effectivePlan === 'gold'">
            
            <!-- Plan Price & Tag Card -->
            <div class="plan-hero-box gold-hero-box">
              <div class="hero-box-left">
                <div class="tier-pill-label gold-pill-label">{{ goldPlan().badge || 'VERIFIED BUYER ACCESS' }}</div>
                <h3 class="tier-name">{{ goldPlan().name }}</h3>
                <p class="tier-summary">{{ goldPlan().content || goldPlan().description }}</p>
              </div>
              <div class="hero-box-price">
                <span class="currency">₹</span>
                <span class="price-digit">{{ goldPlan().price }}</span>
                <span class="price-period">/ {{ goldPlan().period || 'month' }}</span>
              </div>
            </div>

            <!-- Benefits & Access Details List -->
            <div class="benefits-container">
              <h4 class="benefits-title">{{ goldPlan().name }} Benefits & Access Details</h4>
              <ul class="benefits-list">
                <li *ngFor="let benefit of goldPlan().benefits">
                  <div class="check-box gold-check-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div class="benefit-desc">
                    <span>{{ benefit }}</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Activation / Subscription Form -->
            <form class="checkout-form" (ngSubmit)="onCompleteActivation('gold')">
              <h4 class="form-heading">Activate {{ goldPlan().name }} Access</h4>
              <p class="form-subheading">Enter your details to instantly activate your {{ goldPlan().name }} membership.</p>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-input" placeholder="e.g. David Vance" [(ngModel)]="userData.name" name="name" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address *</label>
                  <input type="email" class="form-input" placeholder="name@domain.com" [(ngModel)]="userData.email" name="email" required />
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Phone / WhatsApp *</label>
                  <input type="tel" class="form-input" placeholder="+1 (555) 234-5678" [(ngModel)]="userData.phone" name="phone" required />
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-outline" (click)="close()">Cancel</button>
                <button type="submit" class="btn btn-gold btn-cta">
                  <span>Choose {{ goldPlan().name }} (₹{{ goldPlan().price }}/{{ goldPlan().period || 'mo' }})</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </form>

          </div>

          <!-- SINGLE PLAN PRESENTATION: PLATINUM ONLY -->
          <div class="single-plan-view platinum-single" *ngIf="effectivePlan === 'platinum'">
            
            <!-- Plan Price & Tag Card -->
            <div class="plan-hero-box plat-hero-box">
              <div class="hero-box-left">
                <div class="tier-pill-label plat-pill-label">{{ platPlan().badge || 'VIP ALL-ACCESS • UNLIMITED' }}</div>
                <h3 class="tier-name plat-tier-name">{{ platPlan().name }}</h3>
                <p class="tier-summary plat-tier-sub">{{ platPlan().content || platPlan().description }}</p>
              </div>
              <div class="hero-box-price plat-hero-price">
                <span class="currency">₹</span>
                <span class="price-digit">{{ platPlan().price }}</span>
                <span class="price-period">/ {{ platPlan().period || 'year' }}</span>
              </div>
            </div>

            <!-- Benefits & Access Details List -->
            <div class="benefits-container">
              <h4 class="benefits-title">{{ platPlan().name }} Benefits & Access Details</h4>
              <ul class="benefits-list">
                <li *ngFor="let benefit of platPlan().benefits">
                  <div class="check-box plat-check-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div class="benefit-desc">
                    <span>{{ benefit }}</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Activation / Subscription Form -->
            <form class="checkout-form" (ngSubmit)="onCompleteActivation('platinum')">
              <h4 class="form-heading">Activate {{ platPlan().name }} Access</h4>
              <p class="form-subheading">Enter your details to instantly activate your {{ platPlan().name }} membership.</p>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-input" placeholder="e.g. Eleanor Vance" [(ngModel)]="userData.name" name="name" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address *</label>
                  <input type="email" class="form-input" placeholder="name@domain.com" [(ngModel)]="userData.email" name="email" required />
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Phone / WhatsApp *</label>
                  <input type="tel" class="form-input" placeholder="+1 (555) 345-6789" [(ngModel)]="userData.phone" name="phone" required />
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-outline" (click)="close()">Cancel</button>
                <button type="submit" class="btn btn-primary btn-cta plat-btn-cta">
                  <span>Choose {{ platPlan().name }} (₹{{ platPlan().price }}/{{ platPlan().period || 'yr' }})</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(7, 13, 30, 0.85);
      backdrop-filter: blur(8px);
      z-index: 9995;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
    }

    .modal-dialog {
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      max-width: 680px;
      width: 100%;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xl);
      border: 2px solid var(--slate-200);
      overflow: hidden;
      animation: modalIn 260ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .gold-dialog {
      border-color: rgba(197, 168, 128, 0.6);
    }

    .plat-dialog {
      border-color: var(--primary-900);
    }

    @keyframes modalIn {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--slate-200);
      background: var(--slate-50);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .modal-badge {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: var(--gold-600);
      text-transform: uppercase;
    }

    .modal-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--primary-900);
      line-height: 1.2;
    }

    .modal-subtitle {
      font-size: 0.88rem;
      color: var(--slate-600);
      margin-top: 0.25rem;
    }

    .close-btn {
      color: var(--slate-400);
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .close-btn:hover {
      color: var(--primary-900);
      background: var(--slate-200);
    }

    .modal-body {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
    }

    /* Single Plan Hero Box */
    .plan-hero-box {
      border-radius: var(--radius-lg);
      padding: 1.5rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.75rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .gold-hero-box {
      background: linear-gradient(135deg, #FFFDF8 0%, #FFFBEB 100%);
      border: 1.5px solid rgba(197, 168, 128, 0.7);
    }

    .plat-hero-box {
      background: var(--primary-900);
      border: 1.5px solid var(--gold-400);
      color: #FFFFFF;
    }

    .tier-pill-label {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 0.35rem;
    }

    .gold-pill-label {
      color: #B45309;
    }

    .plat-pill-label {
      color: var(--gold-400);
    }

    .tier-name {
      font-size: 1.55rem;
      font-weight: 800;
      color: var(--primary-900);
      margin-bottom: 0.25rem;
      line-height: 1.1;
    }

    .plat-tier-name {
      color: #FFFFFF;
    }

    .tier-summary {
      font-size: 0.85rem;
      color: var(--slate-600);
    }

    .plat-tier-sub {
      color: var(--slate-300);
    }

    .hero-box-price {
      display: flex;
      align-items: baseline;
      gap: 0.15rem;
    }

    .currency {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-900);
    }

    .plat-hero-price .currency {
      color: var(--gold-400);
    }

    .price-digit {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--primary-900);
      line-height: 1;
    }

    .plat-hero-price .price-digit {
      color: #FFFFFF;
    }

    .price-period {
      font-size: 0.85rem;
      color: var(--slate-500);
      margin-left: 0.25rem;
    }

    .plat-hero-price .price-period {
      color: var(--slate-300);
    }

    /* Benefits Container */
    .benefits-container {
      margin-bottom: 2rem;
    }

    .benefits-title {
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--primary-900);
      margin-bottom: 1rem;
    }

    .benefits-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .benefits-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .check-box {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    .gold-check-box {
      background: #FEF3C7;
      color: #B45309;
    }

    .plat-check-box {
      background: var(--primary-900);
      color: var(--gold-400);
    }

    .benefit-desc {
      font-size: 0.88rem;
      color: var(--slate-700);
      line-height: 1.45;
    }

    .benefit-desc strong {
      color: var(--primary-900);
      display: inline;
      margin-right: 0.35rem;
    }

    /* Checkout Form */
    .checkout-form {
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }

    .form-heading {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--primary-900);
      margin-bottom: 0.2rem;
    }

    .form-subheading {
      font-size: 0.82rem;
      color: var(--slate-600);
      margin-bottom: 1.25rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--primary-900);
      margin-bottom: 0.3rem;
    }

    .form-input {
      width: 100%;
      height: 42px;
      padding: 0 0.85rem;
      font-size: 0.88rem;
      font-family: inherit;
      color: var(--primary-950);
      background: #FFFFFF;
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--gold-500);
      box-shadow: 0 0 0 3px var(--gold-light);
    }

    .form-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.85rem;
      padding-top: 1rem;
      border-top: 1px solid var(--slate-200);
    }

    .btn-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-weight: 800;
      font-size: 0.92rem;
      padding: 0.65rem 1.35rem;
    }

    .plat-btn-cta {
      background: var(--primary-900);
      border-color: var(--primary-900);
    }

    .plat-btn-cta:hover {
      background: var(--primary-950);
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .plan-hero-box {
        flex-direction: column;
        align-items: flex-start;
      }
      .form-actions {
        flex-direction: column;
      }
      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class MembershipModalComponent implements OnInit {
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);

  @Input() isOpen: boolean = false;
  @Input() plan: 'gold' | 'platinum' = 'gold';
  @Output() closeRequested = new EventEmitter<void>();

  goldPlan = signal<{
    name: string;
    price: number;
    period?: string;
    badge?: string;
    description: string;
    benefits: string[];
    content?: string;
  }>({
    name: 'Gold Plan',
    price: 999,
    period: 'month',
    badge: 'VERIFIED BUYER ACCESS',
    description: 'Unlock verified owner numbers, scout discoveries, and complete property pricing details.',
    benefits: [
      'Unlock Property Details: Reveal exact property prices, price per sq.ft and complete area breakdown.',
      'Direct Contact Details: Access direct owner and verified dealer phone numbers & WhatsApp messaging.',
      'Exact Address & Location: View full street address, neighborhood landmarks, and geo-coordinates.',
      'Gold Scout Discoveries: Early access to off-market for-sale opportunities collected by our verified Scout network.',
      '25 Property Dossiers / Month: Download up to 25 verified property specification sheets and legal check summaries.'
    ],
    content: 'Essential membership for active property buyers & investors.'
  });

  platPlan = signal<{
    name: string;
    price: number;
    period?: string;
    badge?: string;
    description: string;
    benefits: string[];
    content?: string;
  }>({
    name: 'Platinum VIP Plan',
    price: 2499,
    period: 'year',
    badge: 'VIP ALL-ACCESS • UNLIMITED',
    description: 'VIP all-access tier for luxury estates, penthouses, developer allocations, and legal dossiers.',
    benefits: [
      'UNLIMITED Property Unlocks: Instant, unrestricted unlocks across Platinum Villas, Penthouses, Farmlands, and Commercial spaces.',
      'Full Legal Due-Diligence: Access certified title deed reports, encumbrance certificates, survey boundaries and RERA documentation.',
      'Direct Dealer & Developer VIP Hotline: Direct priority phone lines with guaranteed 30-minute callback from authorized principals.',
      'Escorted Private Site Visits: Complimentary dedicated concierge assistance and curated on-site property walkthroughs.',
      'Contract & Negotiation Guidance: Professional legal review assistance and escrow transaction support for high-value properties.'
    ],
    content: 'All-inclusive VIP access for luxury homes, estates & institutional investors.'
  });

  userData = {
    name: '',
    email: '',
    phone: ''
  };

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    fetch('http://localhost:5001/api/plans')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.plans && Array.isArray(data.plans)) {
          const gold = data.plans.find((p: any) => p.planId === 'gold');
          if (gold) {
            this.goldPlan.set({
              name: gold.name,
              price: gold.price,
              period: gold.period || gold.billing_period || 'month',
              badge: gold.badge || 'VERIFIED BUYER ACCESS',
              description: gold.description,
              benefits: Array.isArray(gold.benefits) && gold.benefits.length > 0 ? gold.benefits : this.goldPlan().benefits,
              content: gold.content || gold.description
            });
          }
          const plat = data.plans.find((p: any) => p.planId === 'platinum');
          if (plat) {
            this.platPlan.set({
              name: plat.name,
              price: plat.price,
              period: plat.period || plat.billing_period || 'year',
              badge: plat.badge || 'VIP ALL-ACCESS • UNLIMITED',
              description: plat.description,
              benefits: Array.isArray(plat.benefits) && plat.benefits.length > 0 ? plat.benefits : this.platPlan().benefits,
              content: plat.content || plat.description
            });
          }
        }
      })
      .catch(() => {});
  }

  get effectivePlan(): 'gold' | 'platinum' {
    return this.plan || this.navStateService.selectedMembershipTier() || 'gold';
  }

  close() {
    this.closeRequested.emit();
  }

  onCompleteActivation(planType: 'gold' | 'platinum') {
    this.navStateService.activateMembership(planType);
    const planName = planType === 'gold' ? this.goldPlan().name : this.platPlan().name;
    this.notificationService.show(
      `${planName} Activated!`,
      `Welcome ${this.userData.name || 'valued member'}! All ${planType === 'gold' ? 'Gold' : 'Platinum'} property details, exact prices, and contacts are now UNLOCKED.`,
      planType === 'gold' ? 'gold' : 'success'
    );
    this.close();
  }
}
