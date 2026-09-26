import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavStateService } from '../../../../core/services/nav-state.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PropertyService } from '../../../../core/services/property.service';
import { getApiBaseUrl } from '../../../../core/services/api-config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="marketplace-footer" id="contact">
      <div class="container footer-container">
        
        <div class="footer-columns-grid">
          
          <!-- Column 1: Brand -->
          <div class="brand-col">
            <div class="brand-line" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <img *ngIf="websiteLogo()" [src]="websiteLogo()" alt="Logo" style="max-height: 34px; max-width: 140px; object-fit: contain;" />
              <span class="footer-logo">{{ brandName() }}</span>
              <span class="footer-tagline">{{ brandSub() }}</span>
            </div>
            <p class="brand-desc">
              Real-estate discovery marketplace connecting buyers with verified residential plots, luxury villas, modern apartments, and scout-spotted opportunities.
            </p>

            <div class="social-row">
              <a href="#" class="social-btn" (click)="onSocial($event, 'LinkedIn')" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="#" class="social-btn" (click)="onSocial($event, 'Twitter / X')" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" class="social-btn" (click)="onSocial($event, 'Instagram')" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          <!-- Column 2: Company -->
          <div class="links-col">
            <h4 class="col-head">Company</h4>
            <ul class="col-links">
              <li><a href="#about" (click)="onNavView($event, 'about')">About</a></li>
              <li><a href="#services" (click)="onNavView($event, 'services')">Services</a></li>
              <li><a href="#contact" (click)="onNavContact($event)">Contact</a></li>
            </ul>
          </div>

          <!-- Column 3: For Buyers -->
          <div class="links-col">
            <h4 class="col-head">For Buyers</h4>
            <ul class="col-links">
              <li><a href="#buyers" (click)="onNavView($event, 'buyers')">Buyer Portal</a></li>
              <li><a href="#membership-gold" (click)="onGoldMembership($event)">{{ propertyService.goldPlan().name }} (₹{{ propertyService.goldPlan().price }}/{{ propertyService.goldPlan().period }})</a></li>
              <li><a href="#membership-platinum" (click)="onPlatinumMembership($event)">{{ propertyService.platinumPlan().name }} (₹{{ propertyService.platinumPlan().price }}/{{ propertyService.platinumPlan().period }})</a></li>
              <li><a href="#search-section" (click)="onHomeSection($event, 'search-section')">Search Properties</a></li>
              <li><a href="#gold-premium-section" (click)="onHomeSection($event, 'gold-premium-section')">Gold Properties</a></li>
              <li><a href="#gold-premium-section" (click)="onHomeSection($event, 'gold-premium-section')">Premium Properties</a></li>
            </ul>
          </div>

          <!-- Column 4: For Sellers -->
          <div class="links-col">
            <h4 class="col-head">For Sellers</h4>
            <ul class="col-links">
              <li><a href="#" (click)="onPostProp($event)">Snap Property (Spot & Earn)</a></li>
              <li><a href="#" (click)="onRegister($event)">Seller Registration</a></li>
              <li><a href="#" (click)="onLink($event, 'Manage Properties')">Manage Properties</a></li>
            </ul>
          </div>

          <!-- Column 5: For Dealers -->
          <div class="links-col">
            <h4 class="col-head">For Dealers</h4>
            <ul class="col-links">
              <li><a href="#dealers" (click)="onDealer($event)">Dealer Hub (Buy / Sell)</a></li>
              <li><a href="#" (click)="onRegister($event)">Dealer Registration</a></li>
              <li><a href="#" (click)="onPostProp($event)">Post Property</a></li>
            </ul>
          </div>

          <!-- Column 6: Support -->
          <div class="links-col">
            <h4 class="col-head">Support</h4>
            <ul class="col-links">
              <li><a href="#" (click)="onLink($event, 'Help')">Help</a></li>
              <li><a href="#" (click)="onLink($event, 'Terms')">Terms</a></li>
              <li><a href="#" (click)="onLink($event, 'Privacy')">Privacy</a></li>
            </ul>
          </div>
        </div>

        <!-- Corporate Contact Details Strip from Database -->
        <div class="footer-contact-strip" *ngIf="contactInfo()">
          <div class="contact-strip-item" *ngIf="contactInfo()?.phone">
            <span class="contact-label">Helpline:</span>
            <span class="contact-val">{{ contactInfo()?.phone }}</span>
          </div>
          <div class="contact-strip-item" *ngIf="contactInfo()?.email">
            <span class="contact-label">Email:</span>
            <span class="contact-val">{{ contactInfo()?.email }}</span>
          </div>
          <div class="contact-strip-item" *ngIf="contactInfo()?.address">
            <span class="contact-label">Corporate Office:</span>
            <span class="contact-val">{{ contactInfo()?.address }}</span>
          </div>
        </div>

        <!-- Bottom Copyright -->
        <div class="footer-bottom">
          <p>© 2026 AcresBazaar. All rights reserved. RERA Registered & Compliant.</p>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    .marketplace-footer {
      background: var(--primary-950);
      color: #FFFFFF;
      border-top: 1px solid var(--slate-800);
      padding-top: 3.5rem;
      padding-bottom: 2rem;
    }

    .footer-columns-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1.2fr 1.2fr 1.2fr 1fr;
      gap: 2.5rem;
      margin-bottom: 2.75rem;
    }

    .brand-col {
      display: flex;
      flex-direction: column;
    }

    .brand-line {
      display: flex;
      flex-direction: column;
      margin-bottom: 0.85rem;
    }

    .footer-logo {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.1;
    }

    .footer-tagline {
      font-size: 0.62rem;
      color: var(--gold-400);
      letter-spacing: 0.16em;
      font-weight: 700;
    }

    .brand-desc {
      font-size: 0.85rem;
      color: var(--slate-400);
      line-height: 1.55;
      margin-bottom: 1.25rem;
      max-width: 320px;
    }

    .social-row {
      display: flex;
      gap: 0.5rem;
    }

    .social-btn {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--slate-300);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .social-btn:hover {
      background: var(--gold-500);
      color: var(--primary-950);
      border-color: var(--gold-500);
    }

    .links-col {
      display: flex;
      flex-direction: column;
    }

    .col-head {
      font-size: 0.9rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 1rem;
      letter-spacing: -0.01em;
    }

    .col-links {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .col-links a {
      font-size: 0.84rem;
      color: var(--slate-400);
      transition: color var(--transition-fast);
    }

    .col-links a:hover {
      color: var(--gold-400);
    }

    .footer-contact-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 1.75rem;
      padding: 1.25rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.85rem;
      color: var(--slate-300);
      margin-bottom: 1rem;
    }

    .contact-strip-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .contact-label {
      color: var(--gold-400);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .contact-val {
      color: #FFFFFF;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1.5rem;
      font-size: 0.8rem;
      color: var(--slate-500);
      text-align: center;
    }

    @media (max-width: 1040px) {
      .footer-columns-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
      }
      .brand-col {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 640px) {
      .footer-columns-grid {
        grid-template-columns: 1fr 1fr;
      }
      .footer-contact-strip {
        flex-direction: column;
        gap: 0.65rem;
      }
    }
  `]
})
export class FooterComponent {
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  propertyService = inject(PropertyService);
  router = inject(Router);

  contactInfo = signal<{ email?: string; phone?: string; address?: string } | null>(null);
  websiteLogo = signal<string | null>(null);
  brandName = signal<string>('AcresBazaar');
  brandSub = signal<string>('PREMIUM PROPERTIES');

  constructor() {
    // Load contact info
    fetch(`${getApiBaseUrl()}/settings/group/contact`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          this.contactInfo.set({
            email: data.settings.contact_email,
            phone: data.settings.contact_phone,
            address: data.settings.contact_address
          });
        }
      })
      .catch(() => {});

    // Load logo & branding
    fetch(`${getApiBaseUrl()}/settings/group/logo`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const logo = data?.settings?.website_logo || data?.settings?.logo_url;
        if (logo && logo.trim()) {
          this.websiteLogo.set(logo.trim());
        }
        const name = data?.settings?.brand_name || data?.settings?.website_name;
        if (name && name.trim()) {
          this.brandName.set(name.trim());
        }
        const sub = data?.settings?.brand_sub;
        if (sub && sub.trim()) {
          this.brandSub.set(sub.trim());
        }
      })
      .catch(() => {});
  }

  onNavView(event: Event, view: 'about' | 'services' | 'buyers') {
    event.preventDefault();
    this.navStateService.setView(view);
  }

  onDealer(event: Event) {
    event.preventDefault();
    this.navStateService.openDealerFlow();
  }

  onRegister(event: Event) {
    event.preventDefault();
    this.navStateService.openRegister();
  }

  onPostProp(event: Event) {
    event.preventDefault();
    const commonSession = localStorage.getItem('aura_common_session');
    const authSession = localStorage.getItem('aura_auth_session');
    const sellerSession = localStorage.getItem('aura_seller_session');
    if (commonSession || authSession || sellerSession) {
      this.router.navigate(['/snap-property/upload']);
    } else {
      this.router.navigate(['/snap-property/register']);
    }
  }

  onGoldMembership(event: Event) {
    event.preventDefault();
    this.router.navigate(['/plans/gold']);
  }

  onPlatinumMembership(event: Event) {
    event.preventDefault();
    this.router.navigate(['/plans/platinum']);
  }

  onHomeSection(event: Event, sectionId: string) {
    event.preventDefault();
    this.navStateService.setView('home', sectionId);
  }

  onNavContact(event: Event) {
    event.preventDefault();
    this.router.navigate(['/contact']);
  }

  onLink(event: Event, name: string) {
    if ((event.target as HTMLElement).getAttribute('href') === '#') {
      event.preventDefault();
      this.notificationService.show('Directory', `Viewing ${name}`, 'info');
    }
  }

  onSocial(event: Event, platform: string) {
    event.preventDefault();
    this.notificationService.show('Social', `Navigating to official ${platform} page`, 'info');
  }
}
