import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../core/models/property.model';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-card" (click)="onSelect()" role="button" tabindex="0">
      <div class="image-wrapper">
        <img [src]="category.imageUrl" [alt]="category.name" class="category-img" loading="lazy" />
        <div class="category-overlay"></div>
      </div>

      <div class="card-content">
        <div class="icon-circle">
          <!-- Dynamically select icon based on category iconName -->
          <ng-container [ngSwitch]="category.iconName">
            <svg *ngSwitchCase="'home'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <svg *ngSwitchCase="'map'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
              <line x1="9" y1="3" x2="9" y2="18"></line>
              <line x1="15" y1="6" x2="15" y2="21"></line>
            </svg>
            <svg *ngSwitchCase="'castle'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 20v-7.5a1.5 1.5 0 0 0-1.5-1.5H19V8a2 2 0 0 0-2-2h-2V3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3H7a2 2 0 0 0-2 2v3H3.5A1.5 1.5 0 0 0 2 12.5V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"></path>
              <path d="M10 18v4"></path>
              <path d="M14 18v4"></path>
            </svg>
            <svg *ngSwitchCase="'building'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
              <path d="M9 22v-4h6v4"></path>
              <path d="M8 6h.01"></path>
              <path d="M16 6h.01"></path>
              <path d="M8 10h.01"></path>
              <path d="M16 10h.01"></path>
              <path d="M8 14h.01"></path>
              <path d="M16 14h.01"></path>
            </svg>
            <svg *ngSwitchCase="'warehouse'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"></path>
              <path d="M6 18h12"></path>
              <path d="M6 14h12"></path>
              <rect width="12" height="12" x="6" y="10"></rect>
            </svg>
            <svg *ngSwitchDefault width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </ng-container>
        </div>

        <div class="category-meta">
          <h3 class="category-title">{{ category.name }}</h3>
          <span class="category-count">{{ category.count }}</span>
        </div>

        <div class="arrow-indicator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-card {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-smooth);
      background: var(--white);
      border: 1px solid var(--slate-200);
      height: 220px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .category-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-xl);
      border-color: var(--gold-500);
    }

    .image-wrapper {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .category-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .category-card:hover .category-img {
      transform: scale(1.08);
    }

    .category-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(11, 19, 43, 0.15) 0%, rgba(11, 19, 43, 0.85) 75%, rgba(11, 19, 43, 0.95) 100%);
      transition: background 300ms ease;
    }

    .category-card:hover .category-overlay {
      background: linear-gradient(180deg, rgba(11, 19, 43, 0.25) 0%, rgba(11, 19, 43, 0.88) 60%, rgba(7, 13, 30, 0.98) 100%);
    }

    .card-content {
      position: relative;
      z-index: 2;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gold-400);
      flex-shrink: 0;
      transition: all var(--transition-base);
    }

    .category-card:hover .icon-circle {
      background: var(--gold-500);
      color: var(--navy-950);
      transform: scale(1.06);
    }

    .category-meta {
      flex: 1;
      min-width: 0;
    }

    .category-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--white);
      margin-bottom: 0.2rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.01em;
    }

    .category-count {
      font-size: 0.8125rem;
      color: var(--gold-400);
      font-weight: 500;
      display: block;
    }

    .arrow-indicator {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--white);
      flex-shrink: 0;
      transition: all var(--transition-base);
      opacity: 0.7;
    }

    .category-card:hover .arrow-indicator {
      opacity: 1;
      background: var(--white);
      color: var(--navy-950);
      transform: translateX(3px);
    }
  `]
})
export class CategoryCardComponent {
  @Input({ required: true }) category!: Category;
  @Output() selectCategory = new EventEmitter<Category>();

  onSelect() {
    this.selectCategory.emit(this.category);
  }
}
