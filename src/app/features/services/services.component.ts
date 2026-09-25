import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavStateService } from '../../core/services/nav-state.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="services-page-wrapper">
      
      <!-- Services Hero Header -->
      <section class="services-hero" [style.background-image]="servicesBannerImage()">
        <div class="services-hero-overlay"></div>
        <div class="container" style="position: relative; z-index: 2;">
          <div class="services-hero-inner">
            <span class="services-tag">{{ servicesTag() }}</span>
            <h1 class="services-main-title">{{ servicesHeading() }}</h1>
            <p class="services-hero-sub">
              {{ servicesSubheading() }}
            </p>
          </div>
        </div>
      </section>

      <!-- Service Cards Section -->
      <section class="services-grid-section section-py">
        <div class="container">

          <!-- Dynamic Database Services -->
          <div class="services-grid" *ngIf="dynamicServices().length > 0">
            <div *ngFor="let svc of dynamicServices(); let i = index" class="service-card" [class.highlight-gold]="i === 1">
              <div class="service-number">0{{ i + 1 }}</div>
              <div class="service-icon-box" [class.gold-icon]="i === 1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 class="service-title">{{ svc.name }}</h3>
              <p class="service-desc">{{ svc.short_desc || svc.full_desc }}</p>
              <button type="button" class="service-action-btn" (click)="onExplore('Residential')">
                <span>Inquire Details</span>
                <span class="arrow">→</span>
              </button>
            </div>
          </div>

          <!-- Fallback Services -->
          <div class="services-grid" *ngIf="dynamicServices().length === 0">
            
            <!-- Service 1: Property Discovery -->
            <div class="service-card">
              <div class="service-number">01</div>
              <div class="service-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 class="service-title">Property Discovery</h3>
              <p class="service-desc">
                Search and discover residential properties, plots, villas, apartments and other real-estate opportunities.
              </p>
              <button type="button" class="service-action-btn" (click)="onExplore('Residential')">
                <span>Find Properties</span>
                <span class="arrow">→</span>
              </button>
            </div>

            <!-- Service 2: Gold Property Listings -->
            <div class="service-card highlight-gold">
              <div class="service-number">02</div>
              <div class="service-icon-box gold-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3 class="service-title">Gold Property Listings</h3>
              <p class="service-desc">
                Discover property opportunities collected through our Property Scout network.
              </p>
              <button type="button" class="service-action-btn" (click)="onExplore('Gold')">
                <span>Explore Gold Tiers</span>
                <span class="arrow">→</span>
              </button>
            </div>

            <!-- Service 3: Premium Property Listings -->
            <div class="service-card">
              <div class="service-number">03</div>
              <div class="service-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 class="service-title">Premium Property Listings</h3>
              <p class="service-desc">
                Explore detailed properties with comprehensive information, images, verified specifications, and authorized dealer support.
              </p>
              <button type="button" class="service-action-btn" (click)="onExplore('Premium')">
                <span>View Premium Portfolios</span>
                <span class="arrow">→</span>
              </button>
            </div>

            <!-- Service 4: Property Scout Network -->
            <div class="service-card">
              <div class="service-number">04</div>
              <div class="service-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
              </div>
              <h3 class="service-title">Property Scout Network</h3>
              <p class="service-desc">
                Crowdsourced property spotting program empowering citizens to capture for-sale boards and earn verified bounties.
              </p>
              <button type="button" class="service-action-btn" (click)="onExplore('Scout')">
                <span>Join Scout Network</span>
                <span class="arrow">→</span>
              </button>
            </div>

            <!-- Service 5: Dealer & Builder Showcase -->
            <div class="service-card">
              <div class="service-number">05</div>
              <div class="service-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
                  <path d="M9 22v-4h6v4"></path>
                </svg>
              </div>
              <h3 class="service-title">Dealer & Builder Showcase</h3>
              <p class="service-desc">
                Dedicated digital presence and marketing tools for licensed real estate brokers, developers and authorized regional builders.
              </p>
              <button type="button" class="service-action-btn" (click)="onExplore('Dealers')">
                <span>Partner with Us</span>
                <span class="arrow">→</span>
              </button>
            </div>

            <!-- Service 6: Due-Diligence & Verification -->
            <div class="service-card">
              <div class="service-number">06</div>
              <div class="service-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="m9 15 2 2 4-4"></path>
                </svg>
              </div>
              <h3 class="service-title">Title & RERA Due-Diligence</h3>
              <p class="service-desc">
                Multi-point legal title clearance verification, land dimension validation, and transparent compliance assistance for buyers.
              </p>
              <button type="button" class="service-action-btn" (click)="onExplore('Verification')">
                <span>Learn Verification Standards</span>
                <span class="arrow">→</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      <!-- Bottom Call To Action -->
      <section class="services-cta-section">
        <div class="container">
          <div class="cta-banner">
            <h2 class="cta-title">Find Your Next Property Through AcresBazaar</h2>
            <p class="cta-sub">Search thousands of verified listings across prime plots, villas, and apartments.</p>
            <button type="button" class="btn btn-gold btn-lg" (click)="onExplore('Home')">
              <span>Explore Properties</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .services-page-wrapper {
      background: #FFFFFF;
      min-height: 80vh;
    }

    /* Hero */
    .services-hero {
      background: var(--primary-900);
      background-size: cover;
      background-position: center;
      color: #FFFFFF;
      padding: 5rem 0 4rem 0;
      border-bottom: 1px solid var(--slate-800);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .services-hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 13, 30, 0.82) 0%, rgba(13, 27, 62, 0.92) 100%);
      z-index: 1;
    }

    .services-hero-inner {
      max-width: 780px;
      margin: 0 auto;
    }

    .services-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: var(--gold-400);
      background: rgba(197, 168, 128, 0.15);
      border: 1px solid rgba(197, 168, 128, 0.35);
      padding: 0.25rem 0.8rem;
      border-radius: var(--radius-xs);
      display: inline-block;
      margin-bottom: 1rem;
    }

    .services-main-title {
      font-size: clamp(2.2rem, 4vw, 3.2rem);
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 0.85rem;
    }

    .services-hero-sub {
      font-size: 1.15rem;
      color: var(--slate-300);
      line-height: 1.5;
    }

    /* Grid */
    .services-grid-section {
      background: var(--slate-50);
      border-bottom: 1px solid var(--slate-200);
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.75rem;
    }

    .service-card {
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      padding: 2.25rem 2rem;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-base);
    }

    .service-card:hover {
      border-color: var(--primary-900);
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .highlight-gold {
      border-color: rgba(197, 168, 128, 0.45);
      background: linear-gradient(180deg, #FFFFFF 0%, #FFFDF8 100%);
    }

    .service-number {
      position: absolute;
      top: 1.5rem;
      right: 1.75rem;
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--slate-300);
    }

    .service-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      background: var(--slate-100);
      color: var(--primary-900);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .gold-icon {
      background: var(--gold-light);
      color: #936B3B;
    }

    .service-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-900);
      margin-bottom: 0.65rem;
      line-height: 1.3;
    }

    .service-desc {
      font-size: 0.92rem;
      color: var(--slate-600);
      line-height: 1.6;
      margin-bottom: 1.75rem;
      flex: 1;
    }

    .service-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--primary-900);
      padding: 0.35rem 0;
      cursor: pointer;
      align-self: flex-start;
      transition: color var(--transition-fast);
    }

    .service-action-btn:hover {
      color: var(--gold-600);
    }

    .service-action-btn .arrow {
      transition: transform var(--transition-fast);
    }

    .service-action-btn:hover .arrow {
      transform: translateX(4px);
    }

    /* Bottom CTA */
    .services-cta-section {
      padding: 4rem 0;
      background: #FFFFFF;
    }

    .cta-banner {
      background: var(--primary-900);
      border-radius: var(--radius-lg);
      padding: 3.5rem 2rem;
      text-align: center;
      color: #FFFFFF;
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: var(--shadow-md);
    }

    .cta-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 0.6rem;
    }

    .cta-sub {
      font-size: 1rem;
      color: var(--slate-300);
      margin-bottom: 2rem;
    }

    @media (max-width: 980px) {
      .services-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 600px) {
      .services-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ServicesComponent implements OnInit {
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  servicesHeading = signal<string>('Our Services');
  servicesSubheading = signal<string>('Everything you need to discover, list and connect with real-estate opportunities.');
  servicesTag = signal<string>('REAL ESTATE SOLUTIONS');
  servicesBannerImage = signal<string>('');
  dynamicServices = signal<any[]>([]);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    fetch(`http://localhost:5001/api/settings/group/service?_t=${Date.now()}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          const bannerUrl = data.settings.service_banner_img;
          // Always update — clear to '' if deleted, set new URL if present
          this.servicesBannerImage.set(bannerUrl ? `url("${bannerUrl}")` : '');

          if (data.settings.services_tag) {
            this.servicesTag.set(data.settings.services_tag);
          }

          const heading = data.settings.service_title || data.settings.service_overview;
          if (heading) this.servicesHeading.set(heading);

          const sub = data.settings.services_subheading;
          if (sub) this.servicesSubheading.set(sub);

          const list = [];
          if (data.settings.service_1) {
            list.push({ name: 'Residential & Plots', short_desc: data.settings.service_1 });
          }
          if (data.settings.service_2) {
            list.push({ name: 'Luxury Homes & Villas', short_desc: data.settings.service_2 });
          }
          if (data.settings.service_3) {
            list.push({ name: 'Commercial & Farm Lands', short_desc: data.settings.service_3 });
          }
          if (data.settings.service_4) {
            list.push({ name: 'Property Scout & Verification', short_desc: data.settings.service_4 });
          }
          if (list.length > 0) {
            this.dynamicServices.set(list);
          }
        }
      })
      .catch(() => {});
  }

  onExplore(type: string) {
    if (type === 'Home' || type === 'Residential') {
      this.navStateService.setView('home', 'explore-properties');
    } else if (type === 'Gold') {
      this.navStateService.setView('home', 'gold-premium-section');
    } else if (type === 'Premium') {
      this.navStateService.setView('home', 'platinum-villas');
    } else if (type === 'Scout') {
      this.navStateService.setView('home', 'property-scout');
    } else {
      this.navStateService.setView('home', 'search-section');
    }
  }
}
