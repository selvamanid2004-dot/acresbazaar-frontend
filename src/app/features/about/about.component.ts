import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavStateService } from '../../core/services/nav-state.service';
import { getApiBaseUrl } from '../../core/services/api-config';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-page-wrapper">
      
      <!-- About Hero Banner -->
      <section class="about-hero" [style.background-image]="aboutBannerImage()">
        <div class="about-hero-overlay"></div>
        <div class="container" style="position: relative; z-index: 2;">
          <div class="about-hero-inner">
            <span class="about-tag">{{ aboutData()?.about_tag || 'COMPANY PROFILE' }}</span>
            <h1 class="about-main-title">{{ aboutData()?.about_heading || 'About AcresBazaar' }}</h1>
            <p class="about-hero-sub">
              {{ aboutData()?.about_description || 'Making Property Discovery Simple, Transparent and Rewarding.' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Who We Are Section -->
      <section class="who-we-are-section">
        <div class="container">
          <div class="content-panel">
            <div class="panel-badge">WHO WE ARE</div>
            <p class="who-we-are-lead">
              {{ aboutData()?.who_we_are_lead || 'AcresBazaar is a modern real-estate property discovery platform designed to bring buyers, property owners, dealers and property scouts together in one digital ecosystem.' }}
            </p>
            <p class="who-we-are-body">
              {{ aboutData()?.who_we_are_body || 'Our goal is to make discovering properties easier by bringing property opportunities, detailed listings and useful property information into a single platform.' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Mission & Vision Dual Columns -->
      <section class="mission-vision-section">
        <div class="container">
          <div class="mission-vision-grid">
            
            <!-- Mission Card -->
            <div class="mv-card">
              <div class="mv-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="22" y1="12" x2="18" y2="12"></line>
                  <line x1="6" y1="12" x2="2" y2="12"></line>
                  <line x1="12" y1="6" x2="12" y2="2"></line>
                  <line x1="12" y1="22" x2="12" y2="18"></line>
                </svg>
              </div>
              <h2 class="mv-title">OUR MISSION</h2>
              <p class="mv-text">
                {{ aboutData()?.mission || 'To simplify the way people discover and connect with real-estate opportunities while creating better visibility for property owners and new opportunities for property scouts.' }}
              </p>
            </div>

            <!-- Vision Card -->
            <div class="mv-card">
              <div class="mv-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h2 class="mv-title">OUR VISION</h2>
              <p class="mv-text">
                {{ aboutData()?.vision || 'To build a trusted and community-driven property discovery network where every genuine property opportunity can reach the right buyer.' }}
              </p>
            </div>

          </div>
        </div>
      </section>

      <!-- What Makes Us Different (4 Feature Blocks) -->
      <section class="difference-section">
        <div class="container">
          
          <div class="section-head-center">
            <span class="small-pill">INNOVATION & VALUE</span>
            <h2 class="difference-heading">WHAT MAKES US DIFFERENT</h2>
            <p class="difference-sub">
              Four cornerstones that set the AcresBazaar marketplace apart from traditional listings.
            </p>
          </div>

          <div class="diff-grid">
            
            <!-- Block 1: Property Discovery -->
            <div class="diff-card">
              <div class="diff-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 class="diff-title">Property Discovery</h3>
              <p class="diff-desc">
                Find residential properties, plots, villas, apartments and other real-estate opportunities in one place.
              </p>
            </div>

            <!-- Block 2: Gold Properties -->
            <div class="diff-card">
              <div class="diff-icon gold-accent">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3 class="diff-title">Gold Properties</h3>
              <p class="diff-desc">
                Discover property opportunities submitted through our Property Scout network.
              </p>
            </div>

            <!-- Block 3: Premium Properties -->
            <div class="diff-card">
              <div class="diff-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 class="diff-title">Premium Properties</h3>
              <p class="diff-desc">
                Explore detailed property listings provided by sellers and authorized dealers.
              </p>
            </div>

            <!-- Block 4: Property Scout Network -->
            <div class="diff-card">
              <div class="diff-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
              </div>
              <h3 class="diff-title">Property Scout Network</h3>
              <p class="diff-desc">
                Enable everyday property discoveries to become useful digital property opportunities.
              </p>
            </div>

          </div>

        </div>
      </section>

      <!-- Professional Bottom CTA -->
      <section class="about-bottom-cta">
        <div class="container">
          <div class="cta-box">
            <h2 class="cta-title">Ready to Find Your Next Property?</h2>
            <p class="cta-text">
              Browse thousands of verified plots, villas, apartments and scout discoveries.
            </p>
            <button type="button" class="btn btn-gold btn-lg" (click)="onExplore()">
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
    .about-page-wrapper {
      background: #FFFFFF;
      min-height: 80vh;
    }

    /* About Hero */
    .about-hero {
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

    .about-hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 13, 30, 0.82) 0%, rgba(13, 27, 62, 0.92) 100%);
      z-index: 1;
    }

    .about-hero-inner {
      max-width: 780px;
      margin: 0 auto;
    }

    .about-tag {
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

    .about-main-title {
      font-size: clamp(2.2rem, 4vw, 3.2rem);
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 0.85rem;
    }

    .about-hero-sub {
      font-size: 1.15rem;
      color: var(--slate-300);
      line-height: 1.5;
    }

    /* Who We Are */
    .who-we-are-section {
      padding: 4rem 0 2rem 0;
    }

    .content-panel {
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-lg);
      padding: 2.75rem 3rem;
      max-width: 960px;
      margin: 0 auto;
      box-shadow: var(--shadow-xs);
    }

    .panel-badge {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--primary-900);
      margin-bottom: 1rem;
      display: inline-block;
      border-bottom: 2px solid var(--gold-500);
      padding-bottom: 0.25rem;
    }

    .who-we-are-lead {
      font-size: 1.22rem;
      font-weight: 600;
      color: var(--primary-900);
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .who-we-are-body {
      font-size: 1.05rem;
      color: var(--slate-600);
      line-height: 1.65;
    }

    /* Mission & Vision */
    .mission-vision-section {
      padding: 2rem 0 3.5rem 0;
    }

    .mission-vision-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.75rem;
      max-width: 960px;
      margin: 0 auto;
    }

    .mv-card {
      background: #FFFFFF;
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-lg);
      padding: 2.25rem;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-base);
    }

    .mv-card:hover {
      border-color: var(--primary-900);
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }

    .mv-icon-box {
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

    .mv-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--primary-900);
      letter-spacing: 0.02em;
      margin-bottom: 0.75rem;
    }

    .mv-text {
      font-size: 0.95rem;
      color: var(--slate-600);
      line-height: 1.6;
    }

    /* What Makes Us Different */
    .difference-section {
      background: var(--slate-50);
      border-top: 1px solid var(--slate-200);
      border-bottom: 1px solid var(--slate-200);
      padding: 4.5rem 0;
    }

    .section-head-center {
      text-align: center;
      max-width: 640px;
      margin: 0 auto 3rem auto;
    }

    .small-pill {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--primary-900);
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      padding: 0.2rem 0.65rem;
      border-radius: var(--radius-xs);
      letter-spacing: 0.08em;
      display: inline-block;
      margin-bottom: 0.6rem;
    }

    .difference-heading {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--primary-900);
      letter-spacing: -0.01em;
      margin-bottom: 0.5rem;
    }

    .difference-sub {
      font-size: 0.95rem;
      color: var(--slate-500);
    }

    .diff-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .diff-card {
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-base);
    }

    .diff-card:hover {
      border-color: var(--primary-900);
      transform: translateY(-4px);
      box-shadow: var(--shadow-sm);
    }

    .diff-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      background: var(--slate-100);
      color: var(--primary-900);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .gold-accent {
      background: var(--gold-light);
      color: #936B3B;
    }

    .diff-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--primary-900);
      margin-bottom: 0.5rem;
    }

    .diff-desc {
      font-size: 0.88rem;
      color: var(--slate-600);
      line-height: 1.55;
    }

    /* Bottom CTA */
    .about-bottom-cta {
      padding: 4rem 0;
    }

    .cta-box {
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

    .cta-text {
      font-size: 1rem;
      color: var(--slate-300);
      margin-bottom: 2rem;
    }

    @media (max-width: 900px) {
      .diff-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-panel {
        padding: 2rem 1.5rem;
      }
    }

    @media (max-width: 600px) {
      .mission-vision-grid, .diff-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AboutComponent implements OnInit {
  navStateService = inject(NavStateService);
  aboutData = signal<any>({});
  aboutBannerImage = signal<string>('');

  ngOnInit(): void {
    this.loadAboutContent();
  }

  loadAboutContent(): void {
    fetch(`${getApiBaseUrl()}/settings/group/about?_t=${Date.now()}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          const bannerUrl = data.settings.about_banner_img;
          // Always update — clear to '' if deleted (empty string) or set new URL
          this.aboutBannerImage.set(bannerUrl ? `url("${bannerUrl}")` : '');

          this.aboutData.set({
            about_tag: data.settings.about_tag || 'COMPANY PROFILE',
            about_heading: data.settings.about_title || data.settings.about_headline || 'About AcresBazaar',
            about_description: data.settings.about_description || data.settings.about_story || 'Making Property Discovery Simple, Transparent and Rewarding.',
            who_we_are_lead: data.settings.who_we_are_lead,
            who_we_are_body: data.settings.who_we_are_body,
            mission: data.settings.about_mission,
            vision: data.settings.about_vision
          });
        }
      })
      .catch(() => {});
  }

  onExplore() {
    this.navStateService.setView('home', 'explore-properties');
  }
}
