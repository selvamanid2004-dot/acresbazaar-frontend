import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { Category } from '../../../../core/models/property.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NavStateService } from '../../../../core/services/nav-state.service';

@Component({
  selector: 'app-property-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="explore-categories-section" id="explore-properties">
      <div class="container">
        
        <!-- Section Title -->
        <div class="section-title-row">
          <h2 class="title-text">Explore Properties</h2>
          <span class="subtitle-text">Browse properties across top categories</span>
        </div>

        <!-- Horizontal Compact Categories Cards -->
        <div class="categories-scroll-track">
          <div 
            *ngFor="let cat of categories(); let i = index" 
            class="compact-cat-card" 
            [class.primary-category-card]="i === 0"
            (click)="onCategoryClick(cat)" 
            role="button" 
            tabindex="0"
            [attr.aria-label]="'Explore ' + cat.name">
            
            <div class="cat-icon-frame">
              <img [src]="cat.imageUrl" [alt]="cat.name" class="cat-thumb" loading="lazy" />
            </div>

            <div class="cat-info">
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-count">{{ cat.count }}</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .explore-categories-section {
      padding-top: 1.75rem;
      padding-bottom: 2rem;
      background: #FFFFFF;
    }

    .section-title-row {
      display: flex;
      align-items: baseline;
      gap: 0.85rem;
      margin-bottom: 1.25rem;
    }

    .title-text {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--primary-900);
      letter-spacing: -0.01em;
    }

    .subtitle-text {
      font-size: 0.875rem;
      color: var(--slate-500);
    }

    /* Compact Horizontal Cards (7 items) */
    .categories-scroll-track {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.75rem;
    }

    .compact-cat-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      padding: 0.65rem 0.75rem;
      cursor: pointer;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-base);
      min-width: 0;
      height: 100%;
    }

    .compact-cat-card:hover {
      border-color: var(--primary-900);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .compact-cat-card.primary-category-card {
      border-color: rgba(197, 168, 128, 0.7);
      background: #FFFDF9;
    }

    .compact-cat-card.primary-category-card:hover {
      border-color: var(--primary-900);
      background: #FFFFFF;
    }

    .cat-icon-frame {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      flex-shrink: 0;
      background: var(--slate-100);
    }

    .cat-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cat-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .cat-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--primary-900);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.25;
    }

    .cat-count {
      font-size: 0.72rem;
      color: var(--slate-500);
      font-weight: 500;
    }

    @media (max-width: 1180px) {
      .categories-scroll-track {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (max-width: 768px) {
      .categories-scroll-track {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .categories-scroll-track {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PropertyCategoriesComponent {
  propertyService = inject(PropertyService);
  notificationService = inject(NotificationService);
  navStateService = inject(NavStateService);
  router = inject(Router);

  @Output() categoryChosen = new EventEmitter<Category>();

  categories = this.propertyService.getCategories();

  onCategoryClick(cat: Category) {
    this.notificationService.show(cat.name, `Opening dedicated ${cat.name} page...`, 'gold');
    this.navStateService.selectedCategorySlug.set(cat.slug);
    this.router.navigate(['/' + cat.slug]);
    this.categoryChosen.emit(cat);
  }
}
