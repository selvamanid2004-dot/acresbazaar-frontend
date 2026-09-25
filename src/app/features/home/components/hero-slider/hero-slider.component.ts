import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../../../core/services/property.service';
import { HeroSlide } from '../../../../core/models/property.model';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-banner-section" id="hero-banner" (mouseenter)="pause()" (mouseleave)="resume()">
      <div class="slides-wrapper">
        
        <!-- Slide Items -->
        <div 
          *ngFor="let slide of slides(); let i = index" 
          class="slide-item" 
          [class.active]="activeIdx === i">

          <!-- Background Image with controlled subtle dark gradient overlay -->
          <div class="slide-image-layer">
            <img [src]="slide.imageUrl" [alt]="slide.titleHighlight" class="hero-bg-img" />
            <div class="hero-gradient-overlay"></div>
          </div>

          <!-- Hero Content Container -->
          <div class="container hero-container">
            <div class="hero-grid">
              
              <!-- Left Side Content -->
              <div class="hero-left-content">
                <span class="hero-small-label">{{ slide.categoryLabel }}</span>

                <h1 class="hero-heading">
                  {{ slide.titleHighlight }}
                </h1>

                <p class="hero-subtext">
                  {{ slide.description }}
                </p>

                <!-- Information Chips -->
                <div class="hero-chips-row">
                  <div class="info-chip">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span>{{ slide.priceStarting }}</span>
                  </div>

                  <div class="info-chip">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{{ slide.location }}</span>
                  </div>
                </div>

                <!-- CTA Buttons -->
                <div class="hero-buttons-row">
                  <button type="button" class="btn btn-gold" (click)="onPrimaryCta(slide)">
                    <span>{{ slide.ctaText }}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>

                  <button type="button" class="btn btn-outline-white" (click)="onSecondaryCta(slide)">
                    <span>{{ slide.secondaryCtaText }}</span>
                  </button>
                </div>
              </div>

              <!-- Right Side: Property Image Priority Space -->
              <div class="hero-right-space">
                <div class="slide-tag-pill">
                  <span class="pulse-dot"></span>
                  {{ slide.badge }}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      <!-- Slider Arrows (Previous / Next controls on both sides) -->
      <button type="button" class="slider-arrow arrow-prev" (click)="prev()" aria-label="Previous property">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button type="button" class="slider-arrow arrow-next" (click)="next()" aria-label="Next property">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <!-- Bottom Small Slider Indicators -->
      <div class="slider-dots-container">
        <button 
          *ngFor="let s of slides(); let dotIdx = index"
          type="button" 
          class="dot-indicator" 
          [class.active]="activeIdx === dotIdx"
          (click)="goTo(dotIdx)"
          [attr.aria-label]="'Go to slide ' + (dotIdx + 1)">
        </button>
      </div>
    </section>
  `,
  styles: [`
    .hero-banner-section {
      position: relative;
      width: 100%;
      height: 48vh;
      min-height: 420px;
      max-height: 520px;
      background: var(--primary-950);
      overflow: hidden;
    }

    .slides-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .slide-item {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      visibility: hidden;
      transition: opacity 600ms ease, transform 600ms ease;
    }

    .slide-item.active {
      opacity: 1;
      visibility: visible;
    }

    /* Image Layer & Subtle Dark Overlay */
    .slide-image-layer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .hero-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 30%;
    }

    .hero-gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(7, 13, 30, 0.88) 0%, rgba(7, 13, 30, 0.72) 42%, rgba(7, 13, 30, 0.25) 75%, rgba(7, 13, 30, 0.45) 100%);
    }

    .hero-container {
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      z-index: 5;
      padding-bottom: 4rem;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      width: 100%;
      align-items: center;
      gap: 2rem;
    }

    .hero-left-content {
      color: #FFFFFF;
      max-width: 620px;
    }

    .hero-small-label {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--gold-400);
      background: rgba(197, 168, 128, 0.2);
      border: 1px solid rgba(197, 168, 128, 0.4);
      padding: 0.2rem 0.65rem;
      border-radius: var(--radius-xs);
      margin-bottom: 0.75rem;
    }

    .hero-heading {
      font-size: clamp(1.85rem, 3.2vw, 2.75rem);
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.18;
      letter-spacing: -0.02em;
      margin-bottom: 0.65rem;
    }

    .hero-subtext {
      font-size: 0.95rem;
      color: var(--slate-300);
      line-height: 1.5;
      margin-bottom: 1.25rem;
      max-width: 520px;
    }

    .hero-chips-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.4rem;
      flex-wrap: wrap;
    }

    .info-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #FFFFFF;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(6px);
      padding: 0.35rem 0.8rem;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .info-chip svg {
      color: var(--gold-400);
    }

    .hero-buttons-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    /* Right Space */
    .hero-right-space {
      display: flex;
      justify-content: flex-end;
    }

    .slide-tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(11, 19, 43, 0.75);
      backdrop-filter: blur(8px);
      color: #FFFFFF;
      font-size: 0.8125rem;
      font-weight: 600;
      padding: 0.4rem 0.9rem;
      border-radius: var(--radius-full);
      border: 1px solid rgba(197, 168, 128, 0.4);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--gold-400);
      box-shadow: 0 0 6px var(--gold-400);
    }

    /* Side Arrow Controls */
    .slider-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all var(--transition-fast);
    }

    .slider-arrow:hover {
      background: var(--gold-500);
      color: var(--primary-950);
      border-color: var(--gold-500);
    }

    .arrow-prev { left: 1rem; }
    .arrow-next { right: 1rem; }

    /* Bottom Dots */
    .slider-dots-container {
      position: absolute;
      bottom: 4.25rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 10;
    }

    .dot-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.35);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .dot-indicator.active {
      width: 24px;
      border-radius: var(--radius-full);
      background: var(--gold-400);
    }

    @media (max-width: 900px) {
      .hero-banner-section {
        height: auto;
        min-height: 420px;
        padding-top: 2rem;
        padding-bottom: 3.5rem;
      }

      .hero-grid {
        grid-template-columns: 1fr;
      }

      .hero-right-space {
        display: none;
      }

      .hero-gradient-overlay {
        background: rgba(7, 13, 30, 0.82);
      }
    }
  `]
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  propertyService = inject(PropertyService);
  notificationService = inject(NotificationService);

  @Output() exploreNowClicked = new EventEmitter<void>();
  @Output() viewPropertiesClicked = new EventEmitter<void>();

  slides = this.propertyService.getHeroSlides();
  activeIdx = 0;
  private intervalRef: any = null;
  private isPaused = false;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.intervalRef = setInterval(() => {
      if (!this.isPaused) {
        this.next();
      }
    }, 5500);
  }

  stopAutoSlide() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  pause() { this.isPaused = true; }
  resume() { this.isPaused = false; }

  next() {
    this.activeIdx = (this.activeIdx + 1) % this.slides().length;
  }

  prev() {
    this.activeIdx = (this.activeIdx - 1 + this.slides().length) % this.slides().length;
  }

  goTo(idx: number) {
    this.activeIdx = idx;
    this.startAutoSlide();
  }

  onPrimaryCta(slide: HeroSlide) {
    this.exploreNowClicked.emit();
    this.notificationService.show(slide.categoryLabel, `Exploring ${slide.titleHighlight}...`, 'gold');
  }

  onSecondaryCta(slide: HeroSlide) {
    this.viewPropertiesClicked.emit();
    this.notificationService.show(slide.categoryLabel, `Viewing available properties`, 'info');
  }
}
