import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { NotificationService } from '../../services/notification.service';

export type DealerStep = 'intent' | 'buy-categories' | 'buy-listings' | 'sell-form';

@Component({
  selector: 'app-dealer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="close()">
      <div class="modal-dialog" [class.wide-dialog]="step === 'buy-listings'" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <button 
              type="button" 
              class="back-btn" 
              *ngIf="step !== 'intent'" 
              (click)="handleBack()" 
              aria-label="Back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </button>
            
            <span class="modal-badge">DEALER & BROKER PORTAL</span>

            <h2 class="modal-title" *ngIf="step === 'intent'">What are you looking to do?</h2>
            <h2 class="modal-title" *ngIf="step === 'buy-categories'">Select Property Category to Buy / Source</h2>
            <h2 class="modal-title" *ngIf="step === 'buy-listings'">Available {{ selectedCategory }} Listings</h2>
            <h2 class="modal-title" *ngIf="step === 'sell-form'">Dealer Property Listing Flow</h2>
          </div>

          <button type="button" class="close-btn" (click)="close()" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Step 1: Intent Selection (Buy or Sell) -->
        <div class="modal-body step-intent" *ngIf="step === 'intent'">
          <p class="intent-subtitle">
            Welcome to the AcresBazaar Dealer Hub. Choose whether you want to source inventory for clients or list exclusive properties.
          </p>

          <div class="intent-cards-grid">
            <!-- Option 1: Buy -->
            <button type="button" class="intent-card" (click)="chooseIntent('buy')">
              <div class="intent-icon-box buy-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div class="intent-meta">
                <span class="intent-tag">INVENTORY SOURCING</span>
                <h3 class="intent-name">Buy / Source Properties</h3>
                <p class="intent-desc">
                  Browse verified residential, commercial, plots and newly launched projects to fulfill mandates for your high-net-worth buyers.
                </p>
                <div class="intent-cta">
                  <span>Explore Available Inventory</span>
                  <span class="arrow">→</span>
                </div>
              </div>
            </button>

            <!-- Option 2: Sell -->
            <button type="button" class="intent-card" (click)="chooseIntent('sell')">
              <div class="intent-icon-box sell-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div class="intent-meta">
                <span class="intent-tag gold-tag">EXCLUSIVE LISTINGS</span>
                <h3 class="intent-name">Sell / List Properties</h3>
                <p class="intent-desc">
                  Publish client properties, builder projects, or exclusive mandates directly to a nationwide network of active buyers.
                </p>
                <div class="intent-cta">
                  <span>Start Listing Flow</span>
                  <span class="arrow">→</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Step 2: Buy Flow - Category Selection -->
        <div class="modal-body step-categories" *ngIf="step === 'buy-categories'">
          <p class="category-hint">
            Select a property category below to inspect all available verified properties and developer allocations:
          </p>

          <div class="dealer-categories-grid">
            <button 
              type="button" 
              class="cat-card" 
              *ngFor="let cat of dealerBuyCategories" 
              (click)="selectBuyCategory(cat.name)">
              <div class="cat-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path *ngIf="cat.icon === 'home'" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <circle *ngIf="cat.icon === 'building'" cx="12" cy="12" r="10"></circle>
                  <rect *ngIf="cat.icon === 'briefcase'" width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
                  <polygon *ngIf="cat.icon === 'map'" points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <polygon *ngIf="cat.icon === 'castle'" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  <path *ngIf="cat.icon === 'sparkles'" d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"></path>
                </svg>
              </div>
              <div class="cat-info">
                <span class="cat-name">{{ cat.name }}</span>
                <span class="cat-sub">{{ cat.desc }}</span>
              </div>
              <span class="cat-arrow">→</span>
            </button>
          </div>
        </div>

        <!-- Step 3: Buy Flow - Filtered Listings Display -->
        <div class="modal-body step-listings" *ngIf="step === 'buy-listings'">
          <div class="listings-toolbar">
            <div class="toolbar-left">
              <span class="filter-pill active">{{ selectedCategory }}</span>
              <span class="results-count">{{ currentListings.length }} properties currently available</span>
            </div>
            <button type="button" class="btn btn-outline btn-xs" (click)="step = 'buy-categories'">
              Change Category
            </button>
          </div>

          <div class="listings-grid">
            <div class="dealer-property-card" *ngFor="let prop of currentListings">
              <div class="card-img-wrap">
                <img [src]="prop.imageUrl" [alt]="prop.title" loading="lazy" />
                <span class="tier-pill" [class.gold]="prop.tier === 'gold'" [class.plat]="prop.tier === 'platinum'">
                  {{ prop.tier | uppercase }}
                </span>
              </div>
              <div class="card-body">
                <div class="prop-price">{{ prop.priceDisplay }}</div>
                <h4 class="prop-title">{{ prop.title }}</h4>
                <div class="prop-loc">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{{ prop.location }}, {{ prop.city }}</span>
                </div>
                <div class="prop-specs-chips">
                  <span *ngIf="prop.specs.beds">{{ prop.specs.beds }} BHK</span>
                  <span *ngIf="prop.specs.builtUpArea">{{ prop.specs.builtUpArea }}</span>
                  <span *ngIf="prop.specs.plotSize">{{ prop.specs.plotSize }}</span>
                  <span *ngIf="prop.pricePerSqFt">{{ prop.pricePerSqFt }}</span>
                </div>
                <div class="card-actions-row">
                  <button type="button" class="btn btn-primary btn-sm btn-block" (click)="onViewProperty(prop)">
                    Inspect Property Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Sell Flow - Listing Form -->
        <div class="modal-body step-sell" *ngIf="step === 'sell-form'">
          <form (ngSubmit)="onSubmitListing()">
            <div class="form-grid">
              
              <!-- 1. Property Type -->
              <div class="form-group">
                <label class="form-label">Property Type *</label>
                <select class="form-input" [(ngModel)]="sellFormData.propertyType" name="propType" required>
                  <option value="Apartment">Apartment / High-Rise Unit</option>
                  <option value="Villa">Luxury Villa / House</option>
                  <option value="Plot">Plots / Land Parcel</option>
                  <option value="Commercial">Commercial Office / Retail</option>
                  <option value="Independent House">Independent Duplex / House</option>
                  <option value="Project">Gated Community Project</option>
                </select>
              </div>

              <!-- 2. Location -->
              <div class="form-group">
                <label class="form-label">Location / Micro-Market *</label>
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="e.g. Marina Boulevard, Sector 45" 
                  [(ngModel)]="sellFormData.location" 
                  name="location" 
                  required />
              </div>

              <!-- 3. Property Name / Title -->
              <div class="form-group full-col">
                <label class="form-label">Property Name / Title *</label>
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="e.g. 4 BHK Sovereign Waterfront Sky Duplex" 
                  [(ngModel)]="sellFormData.title" 
                  name="title" 
                  required />
              </div>

              <!-- 4. Price -->
              <div class="form-group">
                <label class="form-label">Price ($) *</label>
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="e.g. $1,450,000" 
                  [(ngModel)]="sellFormData.price" 
                  name="price" 
                  required />
              </div>

              <!-- 5. Area -->
              <div class="form-group">
                <label class="form-label">Area (sq.ft / dimensions) *</label>
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="e.g. 3,200 sq.ft or 50 x 60 ft" 
                  [(ngModel)]="sellFormData.area" 
                  name="area" 
                  required />
              </div>

              <!-- 6. Bedrooms (if applicable) -->
              <div class="form-group">
                <label class="form-label">Bedrooms (if applicable)</label>
                <select class="form-input" [(ngModel)]="sellFormData.bedrooms" name="bedrooms">
                  <option value="N/A">N/A (Plot / Commercial)</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5+">5+ BHK Luxury</option>
                </select>
              </div>

              <!-- 7. Contact Details -->
              <div class="form-group">
                <label class="form-label">Contact Details (Dealer / Broker) *</label>
                <input 
                  type="tel" 
                  class="form-input" 
                  placeholder="e.g. +1 (555) 345-9876" 
                  [(ngModel)]="sellFormData.contact" 
                  name="contact" 
                  required />
              </div>

              <!-- 8. Description -->
              <div class="form-group full-col">
                <label class="form-label">Description *</label>
                <textarea 
                  class="form-textarea" 
                  rows="3" 
                  placeholder="Provide details about legal title status, key amenities, road width, facing, and possession timeline..."
                  [(ngModel)]="sellFormData.description" 
                  name="description" 
                  required>
                </textarea>
              </div>

              <!-- 9. Property Images -->
              <div class="form-group full-col">
                <label class="form-label">Property Images</label>
                <div class="image-upload-dropzone" (click)="onUploadClick()">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                  <span class="upload-lead">Click or drag images to upload (JPEG, PNG, WebP)</span>
                  <span class="upload-sub">Upload up to 10 high-resolution photos for maximum buyer inquiries</span>
                </div>
              </div>

            </div>

            <div class="form-footer">
              <button type="button" class="btn btn-outline" (click)="handleBack()">
                Back
              </button>
              <button type="submit" class="btn btn-gold btn-submit">
                <span>Submit Listing</span>
                <span class="free-pill">FREE</span>
              </button>
            </div>
          </form>
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
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      max-width: 680px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xl);
      border: 1.5px solid var(--slate-200);
      overflow: hidden;
      animation: modalIn 260ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .wide-dialog {
      max-width: 960px;
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

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--primary-900);
      margin-bottom: 0.25rem;
      cursor: pointer;
    }

    .back-btn:hover {
      color: var(--gold-600);
    }

    .modal-badge {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--gold-600);
    }

    .modal-title {
      font-size: 1.38rem;
      font-weight: 800;
      color: var(--primary-900);
      line-height: 1.2;
    }

    .close-btn {
      color: var(--slate-400);
      padding: 0.25rem;
      border-radius: var(--radius-sm);
    }

    .close-btn:hover {
      color: var(--primary-900);
      background: var(--slate-200);
    }

    .modal-body {
      padding: 1.75rem 2rem;
      overflow-y: auto;
      flex: 1;
    }

    /* Step 1: Intent Cards */
    .intent-subtitle {
      font-size: 0.95rem;
      color: var(--slate-600);
      line-height: 1.55;
      margin-bottom: 1.75rem;
    }

    .intent-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .intent-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      padding: 1.75rem;
      background: var(--slate-50);
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .intent-card:hover {
      background: #FFFFFF;
      border-color: var(--primary-900);
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }

    .intent-icon-box {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .buy-box {
      background: rgba(11, 19, 43, 0.08);
      color: var(--primary-900);
    }

    .sell-box {
      background: var(--gold-light);
      color: #936B3B;
    }

    .intent-tag {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--primary-900);
      display: block;
      margin-bottom: 0.35rem;
    }

    .gold-tag {
      color: #936B3B;
    }

    .intent-name {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary-900);
      margin-bottom: 0.45rem;
    }

    .intent-desc {
      font-size: 0.85rem;
      color: var(--slate-600);
      line-height: 1.55;
      margin-bottom: 1.25rem;
      flex: 1;
    }

    .intent-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--primary-900);
    }

    .intent-card:hover .intent-cta {
      color: var(--gold-600);
    }

    .arrow {
      transition: transform var(--transition-fast);
    }

    .intent-card:hover .arrow {
      transform: translateX(4px);
    }

    /* Step 2: Categories */
    .category-hint {
      font-size: 0.95rem;
      color: var(--slate-600);
      margin-bottom: 1.5rem;
    }

    .dealer-categories-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .cat-card {
      display: flex;
      align-items: center;
      padding: 1rem 1.25rem;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      gap: 1rem;
      text-align: left;
      transition: all var(--transition-fast);
    }

    .cat-card:hover {
      background: #FFFFFF;
      border-color: var(--primary-900);
      box-shadow: var(--shadow-sm);
      transform: translateX(3px);
    }

    .cat-icon-wrap {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-sm);
      background: var(--slate-100);
      color: var(--primary-900);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cat-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .cat-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--primary-900);
    }

    .cat-sub {
      font-size: 0.75rem;
      color: var(--slate-500);
    }

    .cat-arrow {
      font-weight: 700;
      color: var(--slate-400);
    }

    .cat-card:hover .cat-arrow {
      color: var(--primary-900);
    }

    /* Step 3: Listings */
    .listings-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--slate-200);
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .filter-pill {
      background: var(--primary-900);
      color: #FFFFFF;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
    }

    .results-count {
      font-size: 0.88rem;
      color: var(--slate-600);
      font-weight: 600;
    }

    .btn-xs {
      padding: 0.3rem 0.75rem;
      font-size: 0.78rem;
    }

    .listings-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    .dealer-property-card {
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xs);
    }

    .card-img-wrap {
      position: relative;
      height: 140px;
      overflow: hidden;
    }

    .card-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .tier-pill {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: rgba(11, 19, 43, 0.9);
      color: #FFFFFF;
    }

    .tier-pill.plat {
      background: var(--primary-900);
      color: var(--gold-400);
      border: 1px solid var(--gold-400);
    }

    .tier-pill.gold {
      background: #936B3B;
      color: #FFFFFF;
    }

    .card-body {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .prop-price {
      font-family: var(--font-display);
      font-size: 1.18rem;
      font-weight: 800;
      color: var(--primary-900);
      margin-bottom: 0.25rem;
    }

    .prop-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--primary-900);
      margin-bottom: 0.35rem;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .prop-loc {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.78rem;
      color: var(--slate-500);
      margin-bottom: 0.75rem;
    }

    .prop-specs-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 1rem;
    }

    .prop-specs-chips span {
      font-size: 0.7rem;
      font-weight: 600;
      background: var(--slate-100);
      color: var(--slate-700);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    .btn-block {
      width: 100%;
    }

    /* Step 4: Sell Form */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.15rem;
      margin-bottom: 1.75rem;
    }

    .full-col {
      grid-column: 1 / -1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--primary-900);
      margin-bottom: 0.4rem;
    }

    .form-input {
      width: 100%;
      height: 44px;
      padding: 0 0.95rem;
      font-size: 0.9rem;
      font-family: inherit;
      color: var(--primary-950);
      background: var(--slate-50);
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--gold-500);
      background: #FFFFFF;
      box-shadow: 0 0 0 3px var(--gold-light);
    }

    .form-textarea {
      width: 100%;
      padding: 0.75rem 0.95rem;
      font-size: 0.9rem;
      font-family: inherit;
      color: var(--primary-950);
      background: var(--slate-50);
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-md);
      resize: vertical;
    }

    .image-upload-dropzone {
      border: 2px dashed var(--slate-300);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      text-align: center;
      background: var(--slate-50);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      color: var(--slate-500);
      transition: all var(--transition-fast);
    }

    .image-upload-dropzone:hover {
      border-color: var(--gold-500);
      background: var(--gold-light);
      color: var(--primary-900);
    }

    .upload-lead {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary-900);
    }

    .upload-sub {
      font-size: 0.75rem;
      color: var(--slate-500);
    }

    .form-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--slate-100);
    }

    .btn-submit {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.75rem;
    }

    .free-pill {
      background: var(--primary-900);
      color: var(--gold-400);
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }

    @media (max-width: 820px) {
      .listings-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .intent-cards-grid, .dealer-categories-grid, .form-grid {
        grid-template-columns: 1fr;
      }
      .listings-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DealerModalComponent {
  propertyService = inject(PropertyService);
  notificationService = inject(NotificationService);

  @Input() isOpen: boolean = false;
  @Output() closeRequested = new EventEmitter<void>();
  @Output() propertySelected = new EventEmitter<Property>();

  step: DealerStep = 'intent';
  selectedCategory: string = 'Residential';
  currentListings: Property[] = [];

  dealerBuyCategories = [
    { name: 'Residential', icon: 'home', desc: 'Villas, townhouses & family residences' },
    { name: 'Commercial', icon: 'briefcase', desc: 'Office spaces, tech parks & retail' },
    { name: 'Plots / Land', icon: 'map', desc: 'Township plots, farmlands & acres' },
    { name: 'Apartments', icon: 'building', desc: 'High-rise, skyline penthouses & flats' },
    { name: 'Villas', icon: 'castle', desc: 'Bespoke independent luxury estates' },
    { name: 'Independent Houses', icon: 'home', desc: 'Craftsman duplexes & standalone homes' },
    { name: 'Projects', icon: 'sparkles', desc: 'RERA approved newly launched developments' }
  ];

  sellFormData = {
    propertyType: 'Apartment',
    location: '',
    title: '',
    price: '',
    area: '',
    bedrooms: '3',
    description: '',
    contact: '',
    imagesUploaded: 0
  };

  chooseIntent(intent: 'buy' | 'sell') {
    if (intent === 'buy') {
      this.step = 'buy-categories';
    } else {
      this.step = 'sell-form';
    }
  }

  selectBuyCategory(catName: string) {
    this.selectedCategory = catName;
    this.currentListings = this.propertyService.getPropertiesByCategory(catName);
    this.step = 'buy-listings';
  }

  handleBack() {
    if (this.step === 'buy-listings') {
      this.step = 'buy-categories';
    } else if (this.step === 'buy-categories' || this.step === 'sell-form') {
      this.step = 'intent';
    }
  }

  close() {
    this.step = 'intent';
    this.closeRequested.emit();
  }

  onViewProperty(prop: Property) {
    this.propertySelected.emit(prop);
  }

  onUploadClick() {
    this.sellFormData.imagesUploaded = 4;
    this.notificationService.show('Images Selected', '4 high-resolution photos staged for upload.', 'info');
  }

  onSubmitListing() {
    this.notificationService.show(
      'Dealer Listing Submitted!',
      `Your listing for "${this.sellFormData.title || 'the property'}" has been published to the dealer network.`,
      'gold'
    );
    this.close();
  }
}
