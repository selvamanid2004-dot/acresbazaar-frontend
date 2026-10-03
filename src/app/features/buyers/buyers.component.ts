import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { NavStateService } from '../../core/services/nav-state.service';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-buyers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="buyers-page-wrapper">
      
      <!-- Top Navigation & Breadcrumbs Bar -->
      <section class="buyer-top-nav">
        <div class="container">
          <div class="nav-bar-inner">
            <button type="button" class="btn-back" (click)="onBackToHome()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to Home</span>
            </button>

            <nav class="breadcrumb-nav" aria-label="Breadcrumb">
              <ol class="breadcrumb-list">
                <li><a routerLink="/" class="crumb-link">Home</a></li>
                <li class="crumb-sep">/</li>
                <li><span class="crumb-current">For Buyers</span></li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <!-- Buyers Hero Banner -->
      <section class="buyers-hero">
        <div class="container">
          <div class="buyers-hero-inner">
            <span class="buyers-tag">FOR PROPERTY BUYERS</span>
            <h1 class="buyers-main-title">Find Your Ideal Property with Confidence</h1>
            <p class="buyers-hero-sub">
              Access verified residential apartments, private villas, plots, independent houses, commercial spaces, and farm lands with dedicated Gold and Platinum membership tiers.
            </p>
          </div>
        </div>
      </section>

      <!-- Key Services Available for Buyers -->
      <section class="buyer-services-section">
        <div class="container">
          <div class="services-header">
            <span class="sub-label">BUYER SERVICES & ADVANTAGES</span>
            <h2 class="sec-title">What We Provide for Buyers</h2>
          </div>

          <div class="buyer-advantages-grid">
            <div class="advantage-card">
              <div class="advantage-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <h3 class="advantage-title">100% Verified Titles</h3>
              <p class="advantage-desc">
                Every listed property undergoes legal document verification, land boundary checks, and local zoning clearances.
              </p>
            </div>

            <div class="advantage-card">
              <div class="advantage-icon gold-bg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3 class="advantage-title">0% Brokerage Options</h3>
              <p class="advantage-desc">
                Direct connections with authorized developers and verified property owners with zero middleman commissions.
              </p>
            </div>

            <div class="advantage-card">
              <div class="advantage-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect>
                </svg>
              </div>
              <h3 class="advantage-title">Assisted Site Visits</h3>
              <p class="advantage-desc">
                Schedule personal escorted site visits or access high-definition drone video walkthroughs with neighborhood dossiers.
              </p>
            </div>

            <div class="advantage-card">
              <div class="advantage-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              </div>
              <h3 class="advantage-title">Institutional Legal Support</h3>
              <p class="advantage-desc">
                Full downloadable title reports, encumbrance certificates, and deed verification dossiers for complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- BUYER WISHLIST SECTION (VISIBLE FOR BUYERS)                  -->
      <!-- ============================================================ -->
      <section class="buyer-wishlist-section" *ngIf="wishlistService.isLoggedIn" id="buyer-wishlist">
        <div class="container">
          <div class="section-head-center">
            <span class="sub-label">YOUR SAVED INVENTORY</span>
            <h2 class="sec-title">My Wishlist</h2>
            <p class="sec-sub">
              {{ wishlistService.wishlistCount() }} {{ wishlistService.wishlistCount() === 1 ? 'property' : 'properties' }} saved to your account.
            </p>
          </div>

          <!-- Empty State -->
          <div *ngIf="wishlistService.wishlistCount() === 0" class="wishlist-empty-box">
            <div class="wishlist-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h3 class="empty-head">Your Wishlist is Empty</h3>
            <p class="empty-sub">Save properties you like and find them here later.</p>
            <button type="button" class="btn btn-browse-action" (click)="onBrowseCategories()">
              Browse Properties
            </button>
          </div>

          <!-- Wishlist Cards Grid -->
          <div *ngIf="wishlistService.wishlistCount() > 0" class="wishlist-buyer-grid">
            <div *ngFor="let item of wishlistService.getWishlistProperties()" class="wishlist-prop-card">
              <!-- Property Image with Heart -->
              <div class="wishlist-prop-img-wrap" (click)="onViewWishlistProperty(item)">
                <img [src]="item.imageUrl" (error)="onImgError($event, item.category)" [alt]="item.title" loading="lazy" />
                <span class="wishlist-type-tag" *ngIf="item.category || item.type">
                  {{ formatCategoryName(item.category || item.type) }}
                </span>
                <button 
                  type="button" 
                  class="wishlist-heart-btn" 
                  (click)="onRemoveWishlistItem($event, item.id)" 
                  title="Remove from Wishlist" 
                  aria-label="Remove from Wishlist"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              <!-- Property Details -->
              <div class="wishlist-prop-body">
                <h4 class="wishlist-prop-title" (click)="onViewWishlistProperty(item)" [title]="item.title">
                  {{ item.title }}
                </h4>
                <div class="wishlist-prop-location" [title]="(item.location || '') + (item.city ? ', ' + item.city : '')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{{ item.location }}{{ item.city ? ', ' + item.city : '' }}</span>
                </div>
                <div class="wishlist-prop-price">
                  {{ item.priceDisplay }}
                </div>
                <button type="button" class="btn btn-view-prop-action" (click)="onViewWishlistProperty(item)">
                  View Property
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- ALL 7 PROPERTY CATEGORIES FOR BUYERS                         -->
      <!-- ============================================================ -->
      <section class="buyer-categories-section" id="buyer-categories">
        <div class="container">
          
          <div class="section-head-center">
            <span class="sub-label">EXPLORE BY CATEGORY</span>
            <h2 class="sec-title">Property Categories for Buyers</h2>
            <p class="sec-sub">
              Every category contains dedicated <strong>Gold Plan</strong> and <strong>Platinum VIP Plan</strong> property listings.
            </p>
          </div>

          <div class="categories-card-grid">
            <div class="buyer-cat-card" *ngFor="let cat of buyerCategories">
              
              <div class="cat-img-wrap" (click)="onOpenCategory(cat.slug)">
                <img [src]="cat.imageUrl" [alt]="cat.name" loading="lazy" />
                <div class="cat-img-gradient"></div>
                <span class="cat-pill-count">{{ cat.count }}</span>
              </div>

              <div class="cat-card-details">
                <h3 class="cat-card-title" (click)="onOpenCategory(cat.slug)">{{ cat.name }}</h3>
                <p class="cat-card-desc">{{ cat.description }}</p>

                <!-- Dedicated Two Plan Buttons -->
                <div class="plan-sub-links">
                  <button 
                    type="button" 
                    class="btn-plan-link gold-link" 
                    (click)="onOpenCategoryPlan(cat.slug, 'gold')">
                    <span class="dot gold-dot"></span>
                    <span>Gold Plan</span>
                  </button>
                  <button 
                    type="button" 
                    class="btn-plan-link plat-link" 
                    (click)="onOpenCategoryPlan(cat.slug, 'platinum')">
                    <span class="dot plat-dot"></span>
                    <span>Platinum Plan</span>
                  </button>
                </div>

                <button type="button" class="btn btn-outline-dark btn-block mt-3" (click)="onOpenCategory(cat.slug)">
                  Explore {{ cat.name }} →
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- ============================================================ -->
      <!-- FEATURED LOCKED BUYER INVENTORY PREVIEW                     -->
      <!-- ============================================================ -->
      <section class="locked-preview-section">
        <div class="container">
          
          <div class="section-head-center">
            <span class="sub-label">EXCLUSIVE BUYER INVENTORY</span>
            <h2 class="sec-title">Featured Property Discovery</h2>
            <p class="sec-sub">
              Property images are publicly previewed below. Specific details, verified pricing, exact addresses, and owner contacts are protected and unlocked via membership.
            </p>
          </div>

          <div class="preview-properties-grid">
            <div class="preview-prop-card" *ngFor="let prop of previewProperties">
              
              <!-- Property Image Prominently Visible -->
              <div class="preview-img-box">
                <img [src]="prop.imageUrl" (error)="onImgError($event, prop.category)" alt="Property preview" loading="lazy" />
                <span class="preview-badge" [class.gold-badge]="prop.tier === 'gold'" [class.plat-badge]="prop.tier !== 'gold'">
                  {{ prop.tier === 'gold' ? 'Gold Property' : 'Platinum Property' }}
                </span>
              </div>

              <!-- Strictly Locked Card Body: NO title, NO price, NO address exposed -->
              <div class="preview-locked-body">
                <div class="lock-icon" [class.gold-icon]="prop.tier === 'gold'" [class.plat-icon]="prop.tier !== 'gold'">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                
                <h4 class="locked-title">Property Details Locked</h4>
                <p class="locked-sub">
                  Unlock full property information with a membership plan.
                </p>

                <button 
                  type="button" 
                  class="btn btn-unlock-preview" 
                  [class.btn-gold]="prop.tier === 'gold'"
                  [class.btn-plat]="prop.tier !== 'gold'"
                  (click)="onUnlockProperty(prop)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                  </svg>
                  <span>Unlock Property Details</span>
                </button>

                <span class="plan-price-hint">
                  {{ prop.tier === 'gold' ? (propertyService.goldPlan().name + ' • ₹' + propertyService.goldPlan().price + '/' + propertyService.goldPlan().period) : (propertyService.platinumPlan().name + ' • ₹' + propertyService.platinumPlan().price + '/' + propertyService.platinumPlan().period) }}
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- Bottom Buyer Advisory CTA -->
      <section class="buyer-cta-section">
        <div class="container">
          <div class="cta-inner-card">
            <h2 class="cta-title">Need Personalized Help Finding a Property?</h2>
            <p class="cta-text">
              Our professional buyer advisors will shortlist properties that match your budget, preferred metropolitan corridor, and investment timeline.
            </p>
            <div class="cta-actions">
              <button type="button" class="btn btn-gold btn-lg" (click)="onRequestAdvisor()">
                Request Free Buyer Advisory
              </button>
              <button type="button" class="btn btn-outline-white btn-lg" (click)="onBackToHome()">
                Explore Marketplace Home
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .buyers-page-wrapper {
      background: #FFFFFF;
      min-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    /* Top Nav Bar */
    .buyer-top-nav {
      background: #FFFFFF;
      border-bottom: 1px solid var(--slate-200);
      padding: 0.85rem 0;
    }

    .nav-bar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--primary-900);
      background: var(--slate-100);
      border: 1px solid var(--slate-300);
      padding: 0.45rem 1rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-back:hover {
      background: var(--primary-900);
      color: #FFFFFF;
      border-color: var(--primary-900);
    }

    .breadcrumb-nav {
      font-size: 0.85rem;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .crumb-link {
      color: var(--slate-500);
      font-weight: 600;
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .crumb-link:hover {
      color: var(--primary-900);
    }

    .crumb-sep {
      color: var(--slate-400);
    }

    .crumb-current {
      color: var(--primary-900);
      font-weight: 700;
    }

    /* Hero */
    .buyers-hero {
      background: var(--primary-900);
      color: #FFFFFF;
      padding: 4.5rem 0 3.5rem 0;
      border-bottom: 1px solid var(--slate-800);
      text-align: center;
    }

    .buyers-hero-inner {
      max-width: 820px;
      margin: 0 auto;
    }

    .buyers-tag {
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

    .buyers-main-title {
      font-size: clamp(2.2rem, 4vw, 3.2rem);
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 0.85rem;
    }

    .buyers-hero-sub {
      font-size: 1.12rem;
      color: var(--slate-300);
      line-height: 1.55;
    }

    /* Advantages */
    .buyer-services-section {
      padding: 3.5rem 0 3rem 0;
      background: var(--slate-50);
      border-bottom: 1px solid var(--slate-200);
    }

    .services-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .sub-label {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--primary-900);
      display: block;
      margin-bottom: 0.35rem;
    }

    .sec-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--primary-900);
    }

    .sec-sub {
      font-size: 0.95rem;
      color: var(--slate-600);
      margin-top: 0.35rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .buyer-advantages-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .advantage-card {
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      padding: 1.75rem 1.5rem;
      box-shadow: var(--shadow-xs);
    }

    .advantage-icon {
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

    .gold-bg {
      background: var(--gold-light);
      color: #936B3B;
    }

    .advantage-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--primary-900);
      margin-bottom: 0.5rem;
    }

    .advantage-desc {
      font-size: 0.88rem;
      color: var(--slate-600);
      line-height: 1.55;
    }

    /* ========================================= */
    /* ALL 7 CATEGORIES SECTION                  */
    /* ========================================= */
    .buyer-categories-section {
      padding: 4rem 0;
      background: #FFFFFF;
      border-bottom: 1px solid var(--slate-200);
    }

    .section-head-center {
      text-align: center;
      margin-bottom: 2.75rem;
    }

    .categories-card-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.75rem;
    }

    .buyer-cat-card {
      background: #FFFFFF;
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
    }

    .buyer-cat-card:hover {
      border-color: var(--primary-900);
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .cat-img-wrap {
      position: relative;
      height: 180px;
      cursor: pointer;
      overflow: hidden;
    }

    .cat-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 400ms ease;
    }

    .buyer-cat-card:hover .cat-img-wrap img {
      transform: scale(1.06);
    }

    .cat-img-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(11, 19, 43, 0.75) 100%);
    }

    .cat-pill-count {
      position: absolute;
      bottom: 0.75rem;
      left: 0.75rem;
      font-size: 0.72rem;
      font-weight: 800;
      color: #FFFFFF;
      background: rgba(11, 19, 43, 0.8);
      backdrop-filter: blur(4px);
      padding: 0.25rem 0.65rem;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .cat-card-details {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .cat-card-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary-900);
      margin-bottom: 0.4rem;
      cursor: pointer;
      transition: color var(--transition-fast);
    }

    .cat-card-title:hover {
      color: var(--gold-600);
    }

    .cat-card-desc {
      font-size: 0.88rem;
      color: var(--slate-600);
      line-height: 1.5;
      margin-bottom: 1.25rem;
      flex: 1;
    }

    .plan-sub-links {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .btn-plan-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.78rem;
      font-weight: 800;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--slate-200);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .gold-link {
      background: var(--gold-light);
      border-color: rgba(197, 168, 128, 0.5);
      color: #714E23;
    }

    .gold-link:hover {
      background: #EFE4D2;
      border-color: #936B3B;
    }

    .plat-link {
      background: #0B132B;
      border-color: #0B132B;
      color: #FFFFFF;
    }

    .plat-link:hover {
      background: #1A264F;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .gold-dot {
      background: #936B3B;
    }

    .plat-dot {
      background: #38BDF8;
    }

    /* ========================================= */
    /* FEATURED LOCKED INVENTORY PREVIEW         */
    /* ========================================= */
    .locked-preview-section {
      padding: 4.5rem 0;
      background: #FAF8F5;
      border-bottom: 1px solid var(--slate-200);
    }

    .preview-properties-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .preview-prop-card {
      background: #FFFFFF;
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
    }

    .preview-prop-card:hover {
      border-color: var(--primary-900);
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .preview-img-box {
      position: relative;
      height: 220px;
      overflow: hidden;
      background: var(--slate-900);
    }

    .preview-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 400ms ease;
    }

    .preview-prop-card:hover .preview-img-box img {
      transform: scale(1.05);
    }

    .preview-badge {
      position: absolute;
      top: 0.85rem;
      left: 0.85rem;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 4px;
      color: #FFFFFF;
    }

    .gold-badge {
      background: linear-gradient(135deg, #C5A880 0%, #936B3B 100%);
    }

    .plat-badge {
      background: #0B132B;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    .preview-locked-body {
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex: 1;
    }

    .lock-icon {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.85rem;
    }

    .gold-icon {
      background: rgba(197, 168, 128, 0.2);
      color: #936B3B;
    }

    .plat-icon {
      background: var(--primary-900);
      color: #FFFFFF;
    }

    .locked-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--primary-900);
      margin-bottom: 0.35rem;
    }

    .locked-sub {
      font-size: 0.85rem;
      color: var(--slate-600);
      line-height: 1.45;
      margin-bottom: 1.35rem;
      max-width: 260px;
    }

    .btn-unlock-preview {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: 100%;
      padding: 0.7rem 1.25rem;
      font-size: 0.88rem;
      font-weight: 800;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      border: none;
    }

    .btn-unlock-preview.btn-gold {
      background: linear-gradient(135deg, #C5A880 0%, #936B3B 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(147, 107, 59, 0.25);
    }

    .btn-unlock-preview.btn-gold:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(147, 107, 59, 0.35);
    }

    .btn-unlock-preview.btn-plat {
      background: #0B132B;
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(11, 19, 43, 0.3);
    }

    .btn-unlock-preview.btn-plat:hover {
      transform: translateY(-2px);
      background: #141F42;
    }

    .plan-price-hint {
      font-size: 0.72rem;
      font-weight: 700;
      color: #936B3B;
      margin-top: 0.75rem;
    }

    /* CTA */
    .buyer-cta-section {
      padding: 3.5rem 0 5rem 0;
      background: #FFFFFF;
    }

    .cta-inner-card {
      background: var(--primary-900);
      border-radius: var(--radius-lg);
      padding: 3.5rem 2rem;
      text-align: center;
      color: #FFFFFF;
      max-width: 860px;
      margin: 0 auto;
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
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-outline-white {
      border: 1.5px solid rgba(255, 255, 255, 0.4);
      color: #FFFFFF;
      background: transparent;
      padding: 0.65rem 1.5rem;
      border-radius: var(--radius-sm);
      font-weight: 700;
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .btn-outline-white:hover {
      background: #FFFFFF;
      color: var(--primary-900);
    }

    /* Buyer Wishlist Section */
    .buyer-wishlist-section {
      padding: 3rem 0;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .wishlist-empty-box {
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 3.5rem 1.5rem;
      text-align: center;
      max-width: 500px;
      margin: 0 auto;
    }

    .wishlist-empty-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }

    .empty-head {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .empty-sub {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0 0 1.5rem 0;
    }

    .btn-browse-action {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 0.75rem 1.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-browse-action:hover {
      background: #1e293b;
      transform: translateY(-1px);
    }

    .wishlist-buyer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .wishlist-prop-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
    }

    .wishlist-prop-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      transform: translateY(-3px);
    }

    .wishlist-prop-img-wrap {
      position: relative;
      width: 100%;
      height: 190px;
      background: #e2e8f0;
      overflow: hidden;
      cursor: pointer;
    }

    .wishlist-prop-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .wishlist-prop-card:hover .wishlist-prop-img-wrap img {
      transform: scale(1.04);
    }

    .wishlist-type-tag {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(15, 23, 42, 0.85);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.3px;
      padding: 3px 8px;
      border-radius: 6px;
      backdrop-filter: blur(4px);
      text-transform: capitalize;
    }

    .wishlist-heart-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 2;
    }

    .wishlist-heart-btn:hover {
      transform: scale(1.1);
      background: #fef2f2;
    }

    .wishlist-prop-body {
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .wishlist-prop-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    .wishlist-prop-title:hover {
      color: #2563eb;
    }

    .wishlist-prop-location {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wishlist-prop-price {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }

    .btn-view-prop-action {
      width: 100%;
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 0.7rem 1rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: auto;
    }

    .btn-view-prop-action:hover {
      background: #1e293b;
      transform: translateY(-1px);
    }

    @media (max-width: 1024px) {
      .categories-card-grid, .preview-properties-grid, .wishlist-buyer-grid {
        grid-template-columns: 1fr 1fr;
      }
      .buyer-advantages-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .categories-card-grid, .preview-properties-grid, .buyer-advantages-grid, .wishlist-buyer-grid {
        grid-template-columns: 1fr;
      }
      .nav-bar-inner {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class BuyersComponent implements OnInit {
  wishlistService = inject(WishlistService);
  propertyService = inject(PropertyService);
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  router = inject(Router);

  @Output() propertySelected = new EventEmitter<Property>();

  // All 7 Dedicated Categories
  buyerCategories = [
    { 
      name: 'All Residential', 
      slug: 'all-residential', 
      count: '4,970+ Units',
      description: 'Apartments, private duplexes, and luxury residential estates.',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Plots', 
      slug: 'plots', 
      count: '1,250+ Plots',
      description: 'Clear-title residential and commercial development parcels.',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Villas', 
      slug: 'villas', 
      count: '890+ Villas',
      description: 'Gated community villas and independent luxury trophy estates.',
      imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Apartments / Flats', 
      slug: 'apartments', 
      count: '3,120+ Flats',
      description: 'High-rise condominiums, penthouses, and modern city flats.',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Independent Houses', 
      slug: 'independent-houses', 
      count: '960+ Houses',
      description: 'Standalone multi-story homes, duplexes, and private bungalows.',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Commercial Spaces', 
      slug: 'commercial', 
      count: '780+ Spaces',
      description: 'High-yield corporate offices, retail showrooms, and plazas.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Farm Lands', 
      slug: 'farm-lands', 
      count: '420+ Acres',
      description: 'Fertile agro-estates, organic farming parcels, and ranches.',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
    }
  ];

  previewProperties: Property[] = [];

  ngOnInit() {
    // Select sample properties from both Gold and Platinum across categories
    const all = this.propertyService.getAllProperties();
    const goldSample = all.filter(p => p.tier === 'gold').slice(0, 3);
    const platSample = all.filter(p => p.tier === 'platinum' || p.tier === 'premium').slice(0, 3);
    this.previewProperties = [...goldSample, ...platSample];
  }

  onOpenCategory(slug: string) {
    this.router.navigate(['/buyers', slug]);
  }

  onOpenCategoryPlan(slug: string, plan: 'gold' | 'platinum') {
    this.router.navigate(['/buyers', slug, plan]);
  }

  onUnlockProperty(prop: Property) {
    const tier: 'gold' | 'platinum' = prop.tier === 'gold' ? 'gold' : 'platinum';
    if (tier === 'gold') {
      this.router.navigate(['/plans/gold']);
    } else {
      this.router.navigate(['/plans/platinum']);
    }
  }

  onViewWishlistProperty(item: Property) {
    this.router.navigate([], {
      queryParams: { property: item.id },
      queryParamsHandling: 'merge'
    });
  }

  onRemoveWishlistItem(event: Event, propertyId: string) {
    event.stopPropagation();
    this.wishlistService.removeFromWishlist(propertyId);
  }

  onBrowseCategories() {
    const el = document.getElementById('buyer-categories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/']);
    }
  }

  formatCategoryName(cat?: string): string {
    if (!cat) return 'Property';
    return cat.replace(/-/g, ' ');
  }

  onRequestAdvisor() {
    this.notificationService.show(
      'Advisor Requested',
      'A personal buyer advisor will reach out to understand your specifications within 2 business hours.',
      'gold'
    );
  }

  onBackToHome() {
    this.router.navigate(['/']);
  }

  onImgError(e: Event, category?: string) {
    const target = e.target as HTMLImageElement;
    if (target) {
      const cat = (category || '').toLowerCase();
      if (cat.includes('plot') || cat.includes('land')) {
        target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';
      } else if (cat.includes('villa') || cat.includes('estate') || cat.includes('house')) {
        target.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80';
      } else if (cat.includes('apartment') || cat.includes('flat')) {
        target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
      } else if (cat.includes('commercial') || cat.includes('office') || cat.includes('retail')) {
        target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
      } else if (cat.includes('farm')) {
        target.src = 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&q=80';
      } else {
        target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
      }
    }
  }
}
