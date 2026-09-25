import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="close()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-left">
            <span class="modal-badge">SELECT ACCOUNT TYPE</span>
            <h2 class="modal-title">How would you like to register?</h2>
            <p class="modal-sub">Choose your account role to proceed to your dedicated registration portal</p>
          </div>
          <button type="button" class="close-btn" (click)="close()" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 3 User Types Selection Grid -->
        <div class="modal-body">
          <div class="options-grid">
            <!-- 1. Buyer -->
            <a [routerLink]="'/register/buyer'" class="selection-card buyer-card" (click)="selectOption('/register/buyer', $event)">
              <div class="card-icon-wrap buyer-accent">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div class="card-badge buyer-badge">BUYER PORTAL</div>
              <h3 class="card-title">1. Buyer</h3>
              <p class="card-desc">
                Browse verified residential properties, unlock exclusive owner contact details, legal records & Platinum listings.
              </p>
              <div class="card-action">
                <span>Register as Buyer</span>
                <span class="arrow">→</span>
              </div>
            </a>

            <!-- 2. Seller -->
            <a [routerLink]="'/seller/register'" class="selection-card seller-card" (click)="selectOption('/seller/register', $event)">
              <div class="card-icon-wrap seller-accent">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                </svg>
              </div>
              <div class="card-badge seller-badge">SELLER PORTAL</div>
              <h3 class="card-title">2. Seller</h3>
              <p class="card-desc">
                Sell your private property directly. All submitted listings are automatically published under the verified Platinum Plan.
              </p>
              <div class="card-action">
                <span>Register as Seller</span>
                <span class="arrow">→</span>
              </div>
            </a>

            <!-- 3. Dealer -->
            <a [routerLink]="'/dealer/register'" class="selection-card dealer-card" (click)="selectOption('/dealer/register', $event)">
              <div class="card-icon-wrap dealer-accent">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
                  <path d="M9 22v-4h6v4"></path>
                  <path d="M8 6h.01"></path>
                  <path d="M16 6h.01"></path>
                  <path d="M12 6h.01"></path>
                  <path d="M12 10h.01"></path>
                  <path d="M12 14h.01"></path>
                </svg>
              </div>
              <div class="card-badge dealer-badge">DEALER / AGENCY</div>
              <h3 class="card-title">3. Dealer</h3>
              <p class="card-desc">
                For brokers, agencies and builders. Showcase multi-unit commercial, residential & plotted inventory to qualified buyers.
              </p>
              <div class="card-action">
                <span>Register as Dealer</span>
                <span class="arrow">→</span>
              </div>
            </a>

            <!-- 4. Common People -->
            <a [routerLink]="'/register/common'" class="selection-card common-card" (click)="selectOption('/register/common', $event)">
              <div class="card-icon-wrap common-accent">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div class="card-badge common-badge">CITIZEN & SCOUT</div>
              <h3 class="card-title">4. Common People</h3>
              <p class="card-desc">
                For everyday citizens, scouts, and public seekers. Spot local property boards, earn cash rewards, and browse deals.
              </p>
              <div class="card-action">
                <span>Register as Common People</span>
                <span class="arrow">→</span>
              </div>
            </a>
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
      z-index: 9993;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
    }

    .modal-dialog {
      background: #15202B;
      border-radius: 20px;
      max-width: 1040px;
      width: 100%;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
      border: 1.5px solid rgba(212, 175, 55, 0.25);
      overflow: hidden;
      animation: modalIn 260ms cubic-bezier(0.16, 1, 0.3, 1);
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    @keyframes modalIn {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid #1E2D3D;
      background: #111A24;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .modal-badge {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #D4AF37;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
    }

    .modal-sub {
      font-size: 0.88rem;
      color: #94A3B8;
      margin: 0;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: #94A3B8;
      padding: 0.25rem;
      border-radius: 6px;
      cursor: pointer;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: #FFFFFF;
    }

    .modal-body {
      padding: 1.75rem;
    }

    /* Options Grid: 4 Options */
    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));
      gap: 1.15rem;
    }

    .selection-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      padding: 1.5rem;
      background: #0B1118;
      border: 1.5px solid #1E2D3D;
      border-radius: 16px;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      user-select: none;
      transition: all 0.25s ease;
      position: relative;
    }

    .selection-card:hover {
      border-color: #D4AF37;
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      background: #111A24;
    }

    .card-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.1rem;
    }

    .buyer-accent {
      background: rgba(59, 130, 246, 0.15);
      color: #60A5FA;
    }

    .seller-accent {
      background: rgba(212, 175, 55, 0.15);
      color: #E2C044;
    }

    .dealer-accent {
      background: rgba(168, 85, 247, 0.15);
      color: #C084FC;
    }

    .common-accent {
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
    }

    .card-badge {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 0.45rem;
    }

    .buyer-badge {
      background: rgba(59, 130, 246, 0.15);
      color: #93C5FD;
    }

    .seller-badge {
      background: rgba(212, 175, 55, 0.15);
      color: #F3E5AB;
    }

    .dealer-badge {
      background: rgba(168, 85, 247, 0.15);
      color: #E9D5FF;
    }

    .common-badge {
      background: rgba(16, 185, 129, 0.15);
      color: #6EE7B7;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 0.45rem 0;
    }

    .card-desc {
      font-size: 0.82rem;
      color: #94A3B8;
      line-height: 1.5;
      margin-bottom: 1.25rem;
      flex: 1;
    }

    .card-action {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.84rem;
      font-weight: 700;
      color: #D4AF37;
    }

    .selection-card:hover .arrow {
      transform: translateX(4px);
    }

    .arrow {
      transition: transform 0.2s ease;
    }

    @media (max-width: 768px) {
      .options-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterModalComponent {
  private router = inject(Router);

  @Input() isOpen: boolean = false;
  @Output() closeRequested = new EventEmitter<void>();

  selectOption(route: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.close();
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.router.navigateByUrl(route).then(success => {
      if (!success) {
        this.router.navigate([route]);
      }
    });
  }

  close(): void {
    this.closeRequested.emit();
  }
}
