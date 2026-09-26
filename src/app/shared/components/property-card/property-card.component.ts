import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="property-card" [class.platinum-card]="property.tier === 'platinum'">
      <!-- Media Header -->
      <div class="card-media">
        <img [src]="property.imageUrl" [alt]="property.title" class="property-img" loading="lazy" />
        
        <div class="media-overlay"></div>

        <!-- Top Badges -->
        <div class="badge-row">
          <span *ngIf="property.tier === 'platinum'" class="badge badge-platinum">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Platinum
          </span>

          <span *ngIf="property.isNewLaunch" class="badge badge-emerald">
            New Launch
          </span>

          <span *ngIf="property.tier === 'gold'" class="badge badge-gold">
            Gold Scout
          </span>

          <span *ngIf="property.specs.reraApproved" class="badge badge-blue">
            RERA
          </span>
        </div>

        <!-- Favorite / Bookmark Button -->
        <button 
          type="button" 
          class="bookmark-btn" 
          [class.active]="isBookmarked" 
          (click)="toggleBookmark($event)" 
          [attr.aria-label]="isBookmarked ? 'Remove bookmark' : 'Bookmark property'">
          <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="isBookmarked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
          </svg>
        </button>

        <!-- Price Float on Media -->
        <div class="media-price-tag">
          <span class="price-val">{{ property.priceDisplay }}</span>
          <span *ngIf="property.pricePerSqFt" class="price-sub">{{ property.pricePerSqFt }}</span>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <div class="location-row">
          <svg class="pin-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span class="location-text">{{ property.location }}, {{ property.city }}</span>
        </div>

        <h3 class="property-title" [title]="property.title">
          {{ property.title }}
        </h3>

        <p class="property-desc">
          {{ property.shortDescription }}
        </p>

        <!-- Specification Pills -->
        <div class="specs-grid">
          <!-- Plot specific specs -->
          <ng-container *ngIf="property.type === 'plot'">
            <div class="spec-item" *ngIf="property.specs.plotSize">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              </svg>
              <span>{{ property.specs.plotSize }}</span>
            </div>
            <div class="spec-item" *ngIf="property.specs.facing">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
              <span>{{ property.specs.facing }}</span>
            </div>
          </ng-container>

          <!-- Residential / Villa / Apartment specs -->
          <ng-container *ngIf="property.type !== 'plot'">
            <div class="spec-item" *ngIf="property.specs.beds">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 4v16"></path>
                <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                <path d="M2 17h20"></path>
                <path d="M6 8v9"></path>
              </svg>
              <span>{{ property.specs.beds }} BHK</span>
            </div>

            <div class="spec-item" *ngIf="property.specs.baths">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-2.12 0l-.88.88a1.5 1.5 0 0 0 0 2.12L6 9"></path>
                <path d="M10 5a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v2a8 8 0 0 0 16 0v-2a2 2 0 0 0-2-2h-4V7a2 2 0 0 0-2-2Z"></path>
              </svg>
              <span>{{ property.specs.baths }} Baths</span>
            </div>

            <div class="spec-item" *ngIf="property.specs.sqft">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 3H3v18h18V3Z"></path>
                <path d="M21 9H9v12"></path>
              </svg>
              <span>{{ property.specs.sqft }} sq.ft</span>
            </div>
          </ng-container>
        </div>

        <!-- Footer / Action Row -->
        <div class="card-action-row">
          <div class="posted-by-info">
            <span class="posted-label">Listed by</span>
            <span class="poster-name">
              {{ property.postedBy?.name || property.dealer?.name || 'Verified Partner' }}
              <svg *ngIf="property.postedBy?.verified" class="verified-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
              </svg>
            </span>
          </div>

          <button type="button" class="btn-details" (click)="onViewDetails()">
            <span>View Details</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .property-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--slate-200);
      transition: all var(--transition-smooth);
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .property-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl);
      border-color: rgba(197, 168, 128, 0.5);
    }

    .platinum-card {
      border-color: rgba(197, 168, 128, 0.25);
    }

    .card-media {
      position: relative;
      width: 100%;
      height: 230px;
      overflow: hidden;
      background: var(--slate-900);
    }

    .property-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .property-card:hover .property-img {
      transform: scale(1.08);
    }

    .media-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(11, 19, 43, 0.4) 0%, transparent 40%, rgba(11, 19, 43, 0.8) 100%);
    }

    .badge-row {
      position: absolute;
      top: 1rem;
      left: 1rem;
      right: 3.8rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      z-index: 2;
    }

    .badge-platinum {
      background-color: var(--primary-900);
      color: var(--gold-400);
      border: 1px solid var(--gold-border);
    }

    .badge-emerald {
      background-color: #ECFDF5;
      color: #047857;
      border: 1px solid #A7F3D0;
    }

    .badge-gold {
      background-color: #FFFBEB;
      color: #B45309;
      border: 1px solid #FDE68A;
    }

    .badge-blue {
      background-color: #EFF6FF;
      color: #1D4ED8;
      border: 1px solid #BFDBFE;
    }

    .bookmark-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(11, 19, 43, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      line-height: 1;
      z-index: 2;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all var(--transition-base);
    }

    .bookmark-btn:hover {
      background: var(--white);
      color: var(--navy-950);
      transform: scale(1.1);
    }

    .bookmark-btn.active {
      background: var(--gold-500);
      color: var(--navy-950);
      border-color: var(--gold-500);
    }

    .media-price-tag {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      z-index: 2;
      color: var(--white);
    }

    .price-val {
      font-size: 1.4rem;
      font-weight: 800;
      font-family: var(--font-display);
      display: block;
      line-height: 1.1;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }

    .price-sub {
      font-size: 0.75rem;
      color: var(--gold-400);
      font-weight: 500;
    }

    .card-body {
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .location-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8125rem;
      color: var(--slate-500);
      margin-bottom: 0.5rem;
    }

    .pin-icon {
      color: var(--gold-600);
      flex-shrink: 0;
    }

    .location-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }

    .property-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--navy-950);
      line-height: 1.35;
      margin-bottom: 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color var(--transition-fast);
    }

    .property-card:hover .property-title {
      color: var(--gold-600);
    }

    .property-desc {
      font-size: 0.875rem;
      color: var(--slate-500);
      line-height: 1.5;
      margin-bottom: 1.1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.6rem;
    }

    .specs-grid {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.6rem;
      padding-top: 0.85rem;
      padding-bottom: 1rem;
      border-top: 1px dashed var(--slate-200);
      border-bottom: 1px dashed var(--slate-200);
      margin-bottom: 1.1rem;
      min-height: 48px;
    }

    .spec-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--slate-700);
      background: var(--slate-50);
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--slate-200);
      line-height: 1.2;
    }

    .spec-item svg {
      color: var(--gold-600);
      flex-shrink: 0;
    }

    .card-action-row {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding-top: 0.25rem;
    }

    .posted-by-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .posted-label {
      font-size: 0.7rem;
      color: var(--slate-400);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .poster-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--slate-800);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .verified-icon {
      color: var(--emerald-500);
      flex-shrink: 0;
    }

    .btn-details {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--navy-950);
      background: var(--slate-100);
      padding: 0.55rem 1rem;
      border-radius: var(--radius-md);
      transition: all var(--transition-base);
      flex-shrink: 0;
    }

    .btn-details:hover {
      background: var(--navy-950);
      color: var(--white);
      transform: translateX(2px);
    }

    .btn-details svg {
      transition: transform var(--transition-base);
    }

    .btn-details:hover svg {
      transform: translateX(3px);
    }
  `]
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;
  @Output() viewDetails = new EventEmitter<Property>();
  @Output() bookmarkToggled = new EventEmitter<{ property: Property; bookmarked: boolean }>();

  isBookmarked: boolean = false;

  toggleBookmark(event: Event) {
    event.stopPropagation();
    this.isBookmarked = !this.isBookmarked;
    this.bookmarkToggled.emit({ property: this.property, bookmarked: this.isBookmarked });
  }

  onViewDetails() {
    this.viewDetails.emit(this.property);
  }
}
