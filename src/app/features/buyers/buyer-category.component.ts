import { Component, EventEmitter, OnInit, OnDestroy, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { NavStateService } from '../../core/services/nav-state.service';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-buyer-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="buyer-cat-container">
      
      <!-- Top Navigation & Breadcrumbs Bar -->
      <section class="cat-nav-bar">
        <div class="container">
          <div class="nav-bar-inner">
            <!-- Dynamic Back Button based on depth -->
            <button type="button" class="btn-back" (click)="goBack()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>{{ backButtonLabel }}</span>
            </button>

            <!-- Breadcrumb Trail -->
            <nav class="breadcrumb-nav" aria-label="Breadcrumb">
              <ol class="breadcrumb-list">
                <li><a routerLink="/" class="crumb-link">Home</a></li>
                <li class="crumb-sep">/</li>
                <li><a routerLink="/buyers" class="crumb-link">For Buyers</a></li>
                <li class="crumb-sep">/</li>
                <li *ngIf="!currentTier"><span class="crumb-current">{{ currentMeta.title }}</span></li>
                <ng-container *ngIf="currentTier">
                  <li><a [routerLink]="['/buyers', currentCategory]" class="crumb-link">{{ currentMeta.title }}</a></li>
                  <li class="crumb-sep">/</li>
                  <li><span class="crumb-current">{{ currentTier === 'gold' ? 'Gold Plan' : 'Platinum Plan' }}</span></li>
                </ng-container>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <!-- Category Hero Section -->
      <section class="cat-hero">
        <div class="container">
          <div class="cat-hero-inner">
            <span class="cat-eyebrow">BUYER EXCLUSIVE PORTFOLIO</span>
            <h1 class="cat-title">
              {{ currentMeta.title }}
              <span *ngIf="currentTier === 'gold'" class="tier-hero-suffix"> — Gold Plan</span>
              <span *ngIf="currentTier === 'platinum'" class="tier-hero-suffix"> — Platinum Plan</span>
            </h1>
            <p class="cat-desc">{{ currentMeta.description }}</p>
            <div class="cat-meta-pills">
              <span class="cat-count-pill">{{ totalCategoryCount }} Available for Buyers</span>
              <span class="plan-indicator-pill" *ngIf="currentTier">
                Filtered to {{ currentTier === 'gold' ? 'Gold Plan Only' : 'Platinum VIP Only' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Switcher Tabs (All 7 Categories) -->
      <section class="cat-switcher-bar">
        <div class="container">
          <div class="switcher-inner">
            <span class="switcher-label">Category:</span>
            <div class="switcher-tabs">
              <button 
                type="button" 
                class="switch-tab" 
                *ngFor="let cat of buyerCategories" 
                [class.active]="isCurrentCategory(cat.slug)"
                (click)="switchCategory(cat.slug)">
                {{ cat.name }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Plan Filter Navigation (All Plans vs Gold vs Platinum) -->
      <section class="plan-filter-bar">
        <div class="container">
          <div class="plan-filter-inner">
            <span class="filter-label">Plan Category:</span>
            <div class="plan-filter-tabs">
              <button 
                type="button" 
                class="plan-tab" 
                [class.active]="!currentTier"
                (click)="switchTier(null)">
                All Plans (Gold & Platinum)
              </button>
              <button 
                type="button" 
                class="plan-tab gold-tab" 
                [class.active]="currentTier === 'gold'"
                (click)="switchTier('gold')">
                {{ propertyService.goldPlan().name }} (₹{{ propertyService.goldPlan().price }}/{{ propertyService.goldPlan().period }})
              </button>
              <button 
                type="button" 
                class="plan-tab plat-tab" 
                [class.active]="currentTier === 'platinum'"
                (click)="switchTier('platinum')">
                {{ propertyService.platinumPlan().name }} (₹{{ propertyService.platinumPlan().price }}/{{ propertyService.platinumPlan().period }})
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Active Membership Banner (if user has unlocked session) -->
      <section class="membership-status-bar" *ngIf="navStateService.activeMembership() as plan">
        <div class="container">
          <div class="status-banner" [class.gold-status]="plan === 'gold'" [class.plat-status]="plan === 'platinum'">
            <div class="status-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>
                <strong>{{ plan === 'gold' ? (propertyService.goldPlan().name + ' Active (₹' + propertyService.goldPlan().price + '/' + propertyService.goldPlan().period + ')') : (propertyService.platinumPlan().name + ' Active (₹' + propertyService.platinumPlan().price + '/' + propertyService.platinumPlan().period + ')') }}:</strong>
                {{ plan === 'gold' ? 'Gold property dossiers and seller contacts are unlocked.' : 'All Gold & Platinum VIP property dossiers, exact prices and contacts are unlocked.' }}
              </span>
            </div>
            <button type="button" class="btn btn-outline-dark btn-xs" (click)="relockForDemo()">
              Relock Details (Demo)
            </button>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- SECTION A: GOLD PLAN SECTION                                 -->
      <!-- ============================================================ -->
      <section class="plan-showcase-section gold-showcase-section" id="gold-plan" *ngIf="!currentTier || currentTier === 'gold'">
        <div class="container">
          
          <!-- Gold Plan Section Header -->
          <div class="plan-section-header gold-header">
            <div class="plan-header-left">
              <div class="plan-badge-pill gold-badge-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>{{ propertyService.goldPlan().name | uppercase }} • ₹{{ propertyService.goldPlan().price }}/{{ propertyService.goldPlan().period | uppercase }}</span>
              </div>
              <h2 class="plan-section-title gold-title">{{ propertyService.goldPlan().name }} — {{ currentMeta.title }}</h2>
              <p class="plan-section-desc">
                {{ propertyService.goldPlan().description }}
              </p>
            </div>

            <div class="plan-header-right">
              <div class="plan-price-callout gold-price-callout">
                <div class="callout-price-tag">
                  <span class="callout-curr">₹{{ propertyService.goldPlan().price }}</span>
                  <span class="callout-period">/{{ propertyService.goldPlan().period }}</span>
                </div>
                <button 
                  type="button" 
                  class="btn btn-gold-header"
                  (click)="openMembershipModal('gold')">
                  <span *ngIf="!isGoldUnlocked">Unlock {{ propertyService.goldPlan().name }} (₹{{ propertyService.goldPlan().price }}/{{ propertyService.goldPlan().period }})</span>
                  <span *ngIf="isGoldUnlocked">{{ propertyService.goldPlan().name }} Active ✓</span>
                </button>
                <a *ngIf="!currentTier" [routerLink]="['/buyers', currentCategory, 'gold']" class="plan-deep-link">
                  Open Dedicated Gold Page →
                </a>
              </div>
            </div>
          </div>

          <!-- Gold Properties Grid -->
          <div class="properties-grid" *ngIf="goldProperties.length > 0; else noGoldProps">
            <div class="buyer-property-card gold-card-border" *ngFor="let prop of goldProperties">
              
              <!-- 1. Property Image Prominently Visible -->
              <div class="card-media-box">
                <img [src]="prop.imageUrl" alt="Property image" class="prop-img" loading="lazy" />
                <div class="media-badges-overlay">
                  <span class="plan-pill-tag gold-pill-tag">Gold Property</span>
                </div>
              </div>

              <!-- 2. Card Content Area: Strict Locked State vs Unlocked State -->
              <div class="card-body-box">

                <!-- UNLOCKED VIEW (when isGoldUnlocked is true) -->
                <div class="unlocked-details" *ngIf="isGoldUnlocked; else goldLockedTpl">
                  <div class="unlocked-header">
                    <div class="revealed-price-group">
                      <div class="price-val">{{ prop.priceDisplay }}</div>
                      <div class="price-sqft" *ngIf="prop.pricePerSqFt">{{ prop.pricePerSqFt }}</div>
                    </div>
                    <span class="access-badge gold-access-badge">GOLD UNLOCKED</span>
                  </div>

                  <h3 class="prop-title">{{ prop.title }}</h3>

                  <div class="revealed-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span><strong>Exact Address:</strong> {{ prop.exactAddress || prop.location + ', ' + prop.city }}</span>
                  </div>

                  <div class="specs-pills">
                    <span class="pill" *ngIf="prop.specs.beds">{{ prop.specs.beds }} BHK</span>
                    <span class="pill" *ngIf="prop.specs.builtUpArea">{{ prop.specs.builtUpArea }}</span>
                    <span class="pill" *ngIf="prop.specs.plotSize">{{ prop.specs.plotSize }}</span>
                    <span class="pill" *ngIf="prop.specs.status">{{ prop.specs.status }}</span>
                  </div>

                  <p class="prop-summary">{{ prop.shortDescription }}</p>

                  <div class="revealed-contact-card">
                    <span class="contact-lbl">Direct Contact:</span>
                    <span class="contact-who">{{ prop.postedBy?.name || prop.dealer?.name || 'Verified Partner' }} ({{ prop.postedBy?.role || 'Partner' }})</span>
                    <span class="contact-num">{{ prop.contactPhone || prop.postedBy?.phone || prop.dealer?.phone || '+1 (555) 019-2834' }}</span>
                  </div>

                  <button type="button" class="btn btn-primary btn-block" (click)="onViewFullDetails(prop)">
                    View Full Property Dossier
                  </button>
                </div>

                <!-- STRICT LOCKED TEMPLATE: NO title, NO price, NO address, NO specs exposed in DOM -->
                <ng-template #goldLockedTpl>
                  <div class="clean-locked-card-body gold-locked-theme">
                    <div class="lock-circle gold-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    
                    <h4 class="locked-main-heading">Property Details Locked</h4>
                    <p class="locked-main-sub">
                      Unlock full property information with a membership plan.
                    </p>

                    <button 
                      type="button" 
                      class="btn btn-unlock-gold" 
                      (click)="openMembershipModal('gold', prop)">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                      </svg>
                      <span>Unlock Property Details</span>
                    </button>
                    
                    <span class="locked-tier-pill">{{ propertyService.goldPlan().name }} • ₹{{ propertyService.goldPlan().price }}/{{ propertyService.goldPlan().period }}</span>
                  </div>
                </ng-template>

              </div>

            </div>
          </div>

          <ng-template #noGoldProps>
            <div class="empty-plan-notice">
              <p>No {{ propertyService.goldPlan().name }} properties currently listed in this category.</p>
            </div>
          </ng-template>

        </div>
      </section>

      <!-- ============================================================ -->
      <!-- SECTION B: PLATINUM PLAN SECTION                             -->
      <!-- ============================================================ -->
      <section class="plan-showcase-section platinum-showcase-section" id="platinum-plan" *ngIf="!currentTier || currentTier === 'platinum'">
        <div class="container">
          
          <!-- Platinum Plan Section Header -->
          <div class="plan-section-header platinum-header">
            <div class="plan-header-left">
              <div class="plan-badge-pill plat-badge-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>{{ propertyService.platinumPlan().name | uppercase }} • ₹{{ propertyService.platinumPlan().price }}/{{ propertyService.platinumPlan().period | uppercase }}</span>
              </div>
              <h2 class="plan-section-title plat-title">{{ propertyService.platinumPlan().name }} — {{ currentMeta.title }}</h2>
              <p class="plan-section-desc">
                {{ propertyService.platinumPlan().description }}
              </p>
            </div>

            <div class="plan-header-right">
              <div class="plan-price-callout plat-price-callout">
                <div class="callout-price-tag">
                  <span class="callout-curr plat-curr">₹{{ propertyService.platinumPlan().price }}</span>
                  <span class="callout-period">/{{ propertyService.platinumPlan().period }}</span>
                </div>
                <button 
                  type="button" 
                  class="btn btn-plat-header"
                  (click)="openMembershipModal('platinum')">
                  <span *ngIf="!isPlatinumUnlocked">Unlock {{ propertyService.platinumPlan().name }} (₹{{ propertyService.platinumPlan().price }}/{{ propertyService.platinumPlan().period }})</span>
                  <span *ngIf="isPlatinumUnlocked">{{ propertyService.platinumPlan().name }} Active ✓</span>
                </button>
                <a *ngIf="!currentTier" [routerLink]="['/buyers', currentCategory, 'platinum']" class="plan-deep-link plat-deep-link">
                  Open Dedicated Platinum Page →
                </a>
              </div>
            </div>
          </div>

          <!-- Platinum Properties Grid -->
          <div class="properties-grid" *ngIf="platinumProperties.length > 0; else noPlatProps">
            <div class="buyer-property-card plat-card-border" *ngFor="let prop of platinumProperties">
              
              <!-- 1. Property Image Prominently Visible -->
              <div class="card-media-box">
                <img [src]="prop.imageUrl" alt="Property image" class="prop-img" loading="lazy" />
                <div class="media-badges-overlay">
                  <span class="plan-pill-tag plat-pill-tag">Platinum Property</span>
                </div>
              </div>

              <!-- 2. Card Content Area: Strict Locked State vs Unlocked State -->
              <div class="card-body-box">

                <!-- UNLOCKED VIEW (when isPlatinumUnlocked is true) -->
                <div class="unlocked-details" *ngIf="isPlatinumUnlocked; else platLockedTpl">
                  <div class="unlocked-header">
                    <div class="revealed-price-group">
                      <div class="price-val plat-price-val">{{ prop.priceDisplay }}</div>
                      <div class="price-sqft" *ngIf="prop.pricePerSqFt">{{ prop.pricePerSqFt }}</div>
                    </div>
                    <span class="access-badge plat-access-badge">PLATINUM UNLOCKED</span>
                  </div>

                  <h3 class="prop-title">{{ prop.title }}</h3>

                  <div class="revealed-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span><strong>Exact Address:</strong> {{ prop.exactAddress || prop.location + ', ' + prop.city }}</span>
                  </div>

                  <div class="specs-pills">
                    <span class="pill" *ngIf="prop.specs.beds">{{ prop.specs.beds }} BHK</span>
                    <span class="pill" *ngIf="prop.specs.builtUpArea">{{ prop.specs.builtUpArea }}</span>
                    <span class="pill" *ngIf="prop.specs.plotSize">{{ prop.specs.plotSize }}</span>
                    <span class="pill" *ngIf="prop.specs.status">{{ prop.specs.status }}</span>
                  </div>

                  <p class="prop-summary">{{ prop.shortDescription }}</p>

                  <div class="revealed-contact-card plat-contact-card">
                    <span class="contact-lbl">Direct VIP Concierge:</span>
                    <span class="contact-who">{{ prop.postedBy?.name || prop.dealer?.name || 'Verified Partner' }} ({{ prop.postedBy?.role || 'Partner' }})</span>
                    <span class="contact-num plat-contact-num">{{ prop.contactPhone || prop.postedBy?.phone || prop.dealer?.phone || '+1 (555) 019-2834' }}</span>
                  </div>

                  <button type="button" class="btn btn-primary btn-block" (click)="onViewFullDetails(prop)">
                    View Full Property Dossier
                  </button>
                </div>

                <!-- STRICT LOCKED TEMPLATE: NO title, NO price, NO address, NO specs exposed in DOM -->
                <ng-template #platLockedTpl>
                  <div class="clean-locked-card-body plat-locked-theme">
                    <div class="lock-circle plat-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    
                    <h4 class="locked-main-heading">Property Details Locked</h4>
                    <p class="locked-main-sub">
                      Unlock full property information with a membership plan.
                    </p>

                    <button 
                      type="button" 
                      class="btn btn-unlock-plat" 
                      (click)="openMembershipModal('platinum', prop)">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                      </svg>
                      <span>Unlock Property Details</span>
                    </button>
                    
                    <span class="locked-tier-pill plat-pill">Platinum VIP Plan • $129/mo</span>
                  </div>
                </ng-template>

              </div>

            </div>
          </div>

          <ng-template #noPlatProps>
            <div class="empty-plan-notice">
              <p>No Platinum Plan properties currently listed in this category.</p>
            </div>
          </ng-template>

        </div>
      </section>

      <!-- Bottom Membership Prompt Banner (Two Distinct Options) -->
      <section class="bottom-membership-callout" *ngIf="!navStateService.activeMembership()">
        <div class="container">
          <div class="callout-grid-split">
            
            <!-- Gold Plan Card -->
            <div class="callout-plan-card gold-callout">
              <div class="callout-badge-row">
                <span class="gold-badge-label">{{ propertyService.goldPlan().name | uppercase }}</span>
                <span class="badge-price-label">₹{{ propertyService.goldPlan().price }} / {{ propertyService.goldPlan().period }}</span>
              </div>
              <h3 class="callout-card-title">Verified Buyer Portfolio</h3>
              <p class="callout-card-desc">
                {{ propertyService.goldPlan().description }}
              </p>
              <button type="button" class="btn btn-callout-gold" (click)="openMembershipModal('gold')">
                <span>Choose {{ propertyService.goldPlan().name }} (₹{{ propertyService.goldPlan().price }}/{{ propertyService.goldPlan().period }})</span>
              </button>
            </div>

            <!-- Platinum Plan Card -->
            <div class="callout-plan-card plat-callout">
              <div class="callout-badge-row">
                <span class="plat-badge-label">{{ propertyService.platinumPlan().name | uppercase }}</span>
                <span class="badge-price-label plat-price-color">₹{{ propertyService.platinumPlan().price }} / {{ propertyService.platinumPlan().period }}</span>
              </div>
              <h3 class="callout-card-title plat-title-color">VIP Investor All-Access</h3>
              <p class="callout-card-desc plat-desc-color">
                {{ propertyService.platinumPlan().description }}
              </p>
              <button type="button" class="btn btn-callout-plat" (click)="openMembershipModal('platinum')">
                <span>Choose {{ propertyService.platinumPlan().name }} (₹{{ propertyService.platinumPlan().price }}/{{ propertyService.platinumPlan().period }})</span>
              </button>
            </div>

          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .buyer-cat-container {
      background: #FFFFFF;
      min-height: 85vh;
      display: flex;
      flex-direction: column;
    }

    /* Top Nav Bar */
    .cat-nav-bar {
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
      flex-wrap: wrap;
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
    .cat-hero {
      background: var(--primary-900);
      color: #FFFFFF;
      padding: 3.5rem 0 3rem 0;
      border-bottom: 1px solid var(--slate-800);
      text-align: center;
    }

    .cat-hero-inner {
      max-width: 840px;
      margin: 0 auto;
    }

    .cat-eyebrow {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: var(--gold-400);
      background: rgba(197, 168, 128, 0.15);
      border: 1px solid rgba(197, 168, 128, 0.35);
      padding: 0.25rem 0.8rem;
      border-radius: var(--radius-xs);
      display: inline-block;
      margin-bottom: 0.85rem;
    }

    .cat-title {
      font-size: clamp(2rem, 3.8vw, 3.2rem);
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }

    .tier-hero-suffix {
      color: var(--gold-300);
    }

    .cat-desc {
      font-size: 1.05rem;
      color: var(--slate-300);
      line-height: 1.55;
      margin-bottom: 1.25rem;
    }

    .cat-meta-pills {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .cat-count-pill {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--gold-300);
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 0.35rem 1rem;
      border-radius: 9999px;
    }

    .plan-indicator-pill {
      font-size: 0.82rem;
      font-weight: 700;
      color: #FFFFFF;
      background: rgba(197, 168, 128, 0.25);
      border: 1px solid var(--gold-400);
      padding: 0.35rem 1rem;
      border-radius: 9999px;
    }

    /* Category Switcher Tabs */
    .cat-switcher-bar {
      background: var(--slate-50);
      border-bottom: 1px solid var(--slate-200);
      padding: 0.85rem 0;
    }

    .switcher-inner {
      display: flex;
      align-items: center;
      gap: 1rem;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .switcher-inner::-webkit-scrollbar { display: none; }

    .switcher-label {
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--primary-900);
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .switcher-tabs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .switch-tab {
      padding: 0.45rem 0.95rem;
      font-size: 0.82rem;
      font-weight: 700;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--slate-200);
      background: #FFFFFF;
      color: var(--slate-700);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }

    .switch-tab:hover {
      border-color: var(--primary-900);
      color: var(--primary-900);
    }

    .switch-tab.active {
      background: var(--primary-900);
      border-color: var(--primary-900);
      color: #FFFFFF;
    }

    /* Plan Filter Bar */
    .plan-filter-bar {
      background: #FFFFFF;
      border-bottom: 1px solid var(--slate-200);
      padding: 0.85rem 0;
    }

    .plan-filter-inner {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-label {
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--primary-900);
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .plan-filter-tabs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .plan-tab {
      padding: 0.45rem 1rem;
      font-size: 0.84rem;
      font-weight: 700;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--slate-200);
      background: var(--slate-50);
      color: var(--slate-700);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .plan-tab:hover {
      border-color: var(--primary-900);
      color: var(--primary-900);
    }

    .plan-tab.active {
      background: var(--primary-900);
      border-color: var(--primary-900);
      color: #FFFFFF;
    }

    .plan-tab.gold-tab.active {
      background: linear-gradient(135deg, #C5A880 0%, #936B3B 100%);
      border-color: #936B3B;
      color: #FFFFFF;
    }

    .plan-tab.plat-tab.active {
      background: #0B132B;
      border-color: var(--gold-400);
      color: #FFFFFF;
    }

    /* Membership Status Bar */
    .membership-status-bar {
      padding: 1rem 0;
      background: #FFFFFF;
    }

    .status-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1.5rem;
      border-radius: var(--radius-md);
      gap: 1rem;
      flex-wrap: wrap;
    }

    .gold-status {
      background: var(--gold-light);
      border: 1.5px solid rgba(197, 168, 128, 0.6);
      color: #714E23;
    }

    .plat-status {
      background: var(--primary-900);
      border: 1.5px solid var(--gold-400);
      color: #FFFFFF;
    }

    .status-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.88rem;
    }

    .btn-xs {
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-outline-dark {
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
    }

    /* ========================================= */
    /* PLAN SHOWCASE SECTIONS                    */
    /* ========================================= */
    .plan-showcase-section {
      padding: 3rem 0 3.5rem 0;
    }

    .gold-showcase-section {
      background: #FAF8F5;
      border-bottom: 2px solid rgba(197, 168, 128, 0.25);
    }

    .platinum-showcase-section {
      background: #0B132B;
      color: #FFFFFF;
    }

    /* Plan Header */
    .plan-section-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 2rem;
      margin-bottom: 2.25rem;
      padding-bottom: 1.5rem;
      border-bottom: 1.5px solid var(--slate-200);
    }

    .gold-header {
      border-bottom-color: rgba(197, 168, 128, 0.35);
    }

    .platinum-header {
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }

    .plan-header-left {
      max-width: 720px;
    }

    .plan-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      padding: 0.3rem 0.85rem;
      border-radius: 9999px;
      margin-bottom: 0.75rem;
    }

    .gold-badge-pill {
      background: rgba(197, 168, 128, 0.2);
      color: #835B27;
      border: 1px solid rgba(197, 168, 128, 0.45);
    }

    .plat-badge-pill {
      background: rgba(255, 255, 255, 0.12);
      color: #E2E8F0;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }

    .plan-section-title {
      font-size: clamp(1.6rem, 2.5vw, 2.1rem);
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 0.5rem;
    }

    .gold-title {
      color: var(--primary-900);
    }

    .plat-title {
      color: #FFFFFF;
    }

    .plan-section-desc {
      font-size: 0.95rem;
      line-height: 1.55;
    }

    .gold-showcase-section .plan-section-desc {
      color: var(--slate-600);
    }

    .platinum-showcase-section .plan-section-desc {
      color: var(--slate-300);
    }

    .plan-header-right {
      flex-shrink: 0;
    }

    .plan-price-callout {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.6rem;
    }

    .callout-price-tag {
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
    }

    .callout-curr {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 900;
      color: #936B3B;
      line-height: 1;
    }

    .plat-curr {
      color: #FFFFFF;
    }

    .callout-period {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--slate-500);
    }

    .platinum-showcase-section .callout-period {
      color: var(--slate-400);
    }

    .btn-gold-header {
      background: linear-gradient(135deg, #C5A880 0%, #936B3B 100%);
      color: #FFFFFF;
      font-weight: 800;
      font-size: 0.88rem;
      padding: 0.6rem 1.25rem;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(147, 107, 59, 0.25);
      transition: all var(--transition-fast);
    }

    .btn-gold-header:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(147, 107, 59, 0.35);
    }

    .btn-plat-header {
      background: linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%);
      color: var(--primary-900);
      font-weight: 800;
      font-size: 0.88rem;
      padding: 0.6rem 1.25rem;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
      transition: all var(--transition-fast);
    }

    .btn-plat-header:hover {
      transform: translateY(-2px);
      background: #FFFFFF;
      box-shadow: 0 6px 18px rgba(255, 255, 255, 0.25);
    }

    .plan-deep-link {
      font-size: 0.8rem;
      font-weight: 700;
      color: #936B3B;
      text-decoration: underline;
      cursor: pointer;
    }

    .plat-deep-link {
      color: var(--gold-300);
    }

    /* Properties Grid */
    .properties-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .buyer-property-card {
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
    }

    .gold-card-border {
      border: 1.5px solid rgba(197, 168, 128, 0.4);
    }

    .gold-card-border:hover {
      border-color: #936B3B;
      box-shadow: 0 12px 30px rgba(147, 107, 59, 0.18);
      transform: translateY(-4px);
    }

    .plat-card-border {
      border: 1.5px solid rgba(255, 255, 255, 0.18);
    }

    .plat-card-border:hover {
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
      transform: translateY(-4px);
    }

    /* Media Box */
    .card-media-box {
      position: relative;
      height: 220px;
      overflow: hidden;
      background: var(--slate-900);
    }

    .prop-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 400ms ease;
    }

    .buyer-property-card:hover .prop-img {
      transform: scale(1.05);
    }

    .media-badges-overlay {
      position: absolute;
      top: 0.85rem;
      left: 0.85rem;
      display: flex;
      gap: 0.4rem;
      z-index: 2;
    }

    .plan-pill-tag {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.65rem;
      border-radius: 4px;
    }

    .gold-pill-tag {
      background: linear-gradient(135deg, #C5A880 0%, #936B3B 100%);
      color: #FFFFFF;
    }

    .plat-pill-tag {
      background: var(--primary-900);
      border: 1px solid rgba(255, 255, 255, 0.4);
      color: #FFFFFF;
    }

    /* Card Body Box */
    .card-body-box {
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      position: relative;
    }

    /* ========================================= */
    /* CLEAN LOCKED STATE UI (ZERO LEAKAGE)      */
    /* ========================================= */
    .clean-locked-card-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 1rem 0.5rem;
      flex: 1;
    }

    .lock-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.85rem;
    }

    .gold-circle {
      background: rgba(197, 168, 128, 0.2);
      color: #936B3B;
    }

    .plat-circle {
      background: var(--primary-900);
      color: #FFFFFF;
    }

    .locked-main-heading {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--primary-900);
      margin-bottom: 0.4rem;
    }

    .locked-main-sub {
      font-size: 0.85rem;
      color: var(--slate-600);
      line-height: 1.45;
      margin-bottom: 1.35rem;
      max-width: 260px;
    }

    .btn-unlock-gold {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: 100%;
      padding: 0.7rem 1.25rem;
      font-size: 0.88rem;
      font-weight: 800;
      background: linear-gradient(135deg, #C5A880 0%, #936B3B 100%);
      color: #FFFFFF;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(147, 107, 59, 0.25);
      transition: all var(--transition-fast);
    }

    .btn-unlock-gold:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(147, 107, 59, 0.35);
    }

    .btn-unlock-plat {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: 100%;
      padding: 0.7rem 1.25rem;
      font-size: 0.88rem;
      font-weight: 800;
      background: var(--primary-900);
      color: #FFFFFF;
      border: 1px solid var(--slate-800);
      border-radius: var(--radius-md);
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(11, 19, 43, 0.3);
      transition: all var(--transition-fast);
    }

    .btn-unlock-plat:hover {
      transform: translateY(-2px);
      background: #131C38;
      box-shadow: 0 6px 18px rgba(11, 19, 43, 0.4);
    }

    .locked-tier-pill {
      font-size: 0.72rem;
      font-weight: 700;
      color: #936B3B;
      margin-top: 0.75rem;
    }

    .plat-pill {
      color: var(--slate-600);
    }

    /* Unlocked View Styles */
    .unlocked-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .unlocked-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 0.65rem;
    }

    .price-val {
      font-family: var(--font-display);
      font-size: 1.55rem;
      font-weight: 800;
      color: var(--primary-900);
      line-height: 1;
    }

    .plat-price-val {
      color: var(--primary-900);
    }

    .price-sqft {
      font-size: 0.8rem;
      color: var(--slate-500);
      font-weight: 600;
      margin-top: 0.15rem;
    }

    .access-badge {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
    }

    .gold-access-badge {
      background: rgba(197, 168, 128, 0.2);
      color: #835B27;
      border: 1px solid rgba(197, 168, 128, 0.4);
    }

    .plat-access-badge {
      background: rgba(11, 19, 43, 0.08);
      color: var(--primary-900);
      border: 1px solid var(--primary-900);
    }

    .prop-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--primary-900);
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }

    .revealed-row {
      display: flex;
      align-items: flex-start;
      gap: 0.4rem;
      font-size: 0.84rem;
      color: var(--slate-600);
      margin-bottom: 0.85rem;
    }

    .specs-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 0.85rem;
    }

    .pill {
      font-size: 0.74rem;
      font-weight: 600;
      color: var(--slate-700);
      background: var(--slate-100);
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
    }

    .prop-summary {
      font-size: 0.86rem;
      color: var(--slate-600);
      line-height: 1.55;
      margin-bottom: 1.25rem;
    }

    .revealed-contact-card {
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .contact-lbl {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--slate-500);
      display: block;
    }

    .contact-who {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--primary-900);
    }

    .contact-num {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--gold-600);
    }

    .plat-contact-num {
      color: var(--primary-900);
    }

    .btn-block {
      width: 100%;
    }

    .empty-plan-notice {
      background: rgba(255, 255, 255, 0.05);
      border: 1px dashed var(--slate-400);
      border-radius: var(--radius-lg);
      padding: 3rem;
      text-align: center;
      font-size: 0.95rem;
      color: var(--slate-500);
    }

    /* Bottom Membership Prompt */
    .bottom-membership-callout {
      padding: 3.5rem 0 5rem 0;
      background: #FFFFFF;
    }

    .callout-grid-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .callout-plan-card {
      border-radius: var(--radius-xl);
      padding: 2.75rem 2.25rem;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lg);
      transition: all var(--transition-base);
    }

    .gold-callout {
      background: #FFFDF9;
      border: 2px solid rgba(197, 168, 128, 0.6);
      color: var(--primary-900);
    }

    .gold-callout:hover {
      box-shadow: 0 12px 32px rgba(147, 107, 59, 0.2);
      transform: translateY(-4px);
    }

    .plat-callout {
      background: var(--primary-900);
      border: 2px solid var(--gold-400);
      color: #FFFFFF;
    }

    .plat-callout:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
      transform: translateY(-4px);
    }

    .callout-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .gold-badge-label {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      background: rgba(197, 168, 128, 0.2);
      color: #835B27;
      border: 1px solid rgba(197, 168, 128, 0.5);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
    }

    .plat-badge-label {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      background: rgba(255, 255, 255, 0.15);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
    }

    .badge-price-label {
      font-size: 1.1rem;
      font-weight: 800;
      color: #936B3B;
    }

    .plat-price-color {
      color: #FFFFFF;
    }

    .callout-card-title {
      font-size: 1.55rem;
      font-weight: 800;
      margin-bottom: 0.65rem;
      line-height: 1.25;
    }

    .gold-callout .callout-card-title {
      color: var(--primary-900);
    }

    .plat-title-color {
      color: #FFFFFF;
    }

    .callout-card-desc {
      font-size: 0.92rem;
      line-height: 1.55;
      margin-bottom: 1.5rem;
    }

    .gold-callout .callout-card-desc {
      color: var(--slate-600);
    }

    .plat-desc-color {
      color: var(--slate-300);
    }

    .btn-callout-gold {
      background: linear-gradient(135deg, #C5A880 0%, #936B3B 100%);
      color: #FFFFFF;
      font-weight: 800;
      font-size: 0.95rem;
      padding: 0.85rem 1.5rem;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(147, 107, 59, 0.25);
      transition: all var(--transition-fast);
      width: 100%;
    }

    .btn-callout-gold:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(147, 107, 59, 0.35);
    }

    .btn-callout-plat {
      background: #FFFFFF;
      color: var(--primary-900);
      font-weight: 800;
      font-size: 0.95rem;
      padding: 0.85rem 1.5rem;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
      transition: all var(--transition-fast);
      width: 100%;
    }

    .btn-callout-plat:hover {
      transform: translateY(-2px);
      background: #F1F5F9;
      box-shadow: 0 6px 20px rgba(255, 255, 255, 0.25);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .properties-grid {
        grid-template-columns: 1fr 1fr;
      }
      .plan-section-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .plan-header-right {
        width: 100%;
      }
      .plan-price-callout {
        align-items: flex-start;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .callout-grid-split {
        grid-template-columns: 1fr;
      }
      .properties-grid {
        grid-template-columns: 1fr;
      }
      .nav-bar-inner {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class BuyerCategoryComponent implements OnInit, OnDestroy {
  propertyService = inject(PropertyService);
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  @Output() propertySelected = new EventEmitter<Property>();

  currentCategory = 'all-residential';
  currentTier: 'gold' | 'platinum' | null = null;
  private routeSub?: Subscription;

  // All 7 Dedicated Categories
  buyerCategories = [
    { name: 'All Residential', slug: 'all-residential' },
    { name: 'Plots', slug: 'plots' },
    { name: 'Villas', slug: 'villas' },
    { name: 'Apartments / Flats', slug: 'apartments' },
    { name: 'Independent Houses', slug: 'independent-houses' },
    { name: 'Commercial Spaces', slug: 'commercial' },
    { name: 'Farm Lands', slug: 'farm-lands' }
  ];

  get currentMeta() {
    return this.propertyService.getCategoryMetadata(this.currentCategory);
  }

  get goldProperties(): Property[] {
    return this.propertyService.getGoldPropertiesByCategory(this.currentCategory);
  }

  get platinumProperties(): Property[] {
    return this.propertyService.getPlatinumPropertiesByCategory(this.currentCategory);
  }

  get totalCategoryCount(): string {
    const total = this.goldProperties.length + this.platinumProperties.length;
    return `${total} Verified Properties`;
  }

  get isGoldUnlocked(): boolean {
    if (!this.authService.isAuthenticated()) return false;
    const mem = this.authService.activeMembership() || this.navStateService.activeMembership();
    return mem === 'gold' || mem === 'platinum';
  }

  get isPlatinumUnlocked(): boolean {
    if (!this.authService.isAuthenticated()) return false;
    const mem = this.authService.activeMembership() || this.navStateService.activeMembership();
    return mem === 'platinum';
  }

  get backButtonLabel(): string {
    if (this.currentTier) {
      return `Back to ${this.currentMeta.title}`;
    }
    return 'Back to For Buyers';
  }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      if (params['category']) {
        this.currentCategory = params['category'];
        this.navStateService.selectedCategorySlug.set(this.currentCategory);
      }
      if (params['tier'] && (params['tier'] === 'gold' || params['tier'] === 'platinum')) {
        this.currentTier = params['tier'];
      } else {
        this.currentTier = null;
      }
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  goBack() {
    if (this.currentTier) {
      // Step back from /buyers/:category/:tier to /buyers/:category
      this.router.navigate(['/buyers', this.currentCategory]);
    } else {
      // Step back from /buyers/:category to /buyers
      this.router.navigate(['/buyers']);
    }
  }

  isCurrentCategory(slug: string): boolean {
    return this.currentCategory.toLowerCase() === slug.toLowerCase();
  }

  switchCategory(slug: string) {
    if (this.currentTier) {
      this.router.navigate(['/buyers', slug, this.currentTier]);
    } else {
      this.router.navigate(['/buyers', slug]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchTier(tier: 'gold' | 'platinum' | null) {
    if (tier) {
      this.router.navigate(['/buyers', this.currentCategory, tier]);
    } else {
      this.router.navigate(['/buyers', this.currentCategory]);
    }
  }

  openMembershipModal(tier: 'gold' | 'platinum', property?: Property) {
    if (tier === 'gold') {
      this.router.navigate(['/plans/gold']);
    } else {
      this.router.navigate(['/plans/platinum']);
    }
  }

  onViewFullDetails(prop: Property) {
    this.propertySelected.emit(prop);
    this.router.navigate([], {
      queryParams: { property: prop.id },
      queryParamsHandling: 'merge'
    });
  }

  relockForDemo() {
    this.authService.logout();
    this.navStateService.activeMembership.set(null);
    this.notificationService.show('Session Reset', 'Property details have been re-locked for demonstration.', 'info');
  }
}
