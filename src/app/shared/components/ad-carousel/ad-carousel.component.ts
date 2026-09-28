import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityService } from '../../../core/services/activity.service';

export interface AdSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  highlightPrice?: string;
}

@Component({
  selector: 'app-ad-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ad-carousel.component.html',
  styleUrls: ['./ad-carousel.component.css']
})
export class AdCarouselComponent implements OnInit, OnDestroy {
  private activityService = inject(ActivityService);

  @Input() autoPlay = true;
  @Input() intervalMs = 5000;
  @Input() slides: AdSlide[] = [
    {
      id: 'ad-1',
      title: 'Luxury Villas & Waterfront Estates',
      subtitle: 'Verified listings with guaranteed clear titles and pre-approved home loans.',
      badge: 'Featured Promotion',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/properties',
      buttonText: 'Explore Collection',
      highlightPrice: 'From ₹1.2 Cr'
    },
    {
      id: 'ad-2',
      title: 'Zero Brokerage New Launch Projects',
      subtitle: 'Direct developer pricing with exclusive early-bird cashbacks and flexible payment plans.',
      badge: 'Hot Deal',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/properties',
      buttonText: 'View Launches',
      highlightPrice: 'Save up to ₹2.5 Lakhs'
    },
    {
      id: 'ad-3',
      title: 'Sell Your Property 3x Faster',
      subtitle: 'Get matched with 10,000+ active buyers and verified dealers in your city.',
      badge: 'For Sellers',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/seller/add-property',
      buttonText: 'Post Free Property',
      highlightPrice: '100% Free Listing'
    }
  ];

  currentIndex = 0;
  private timer: any;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    if (this.autoPlay && this.slides.length > 1) {
      this.stopAutoPlay();
      this.timer = setInterval(() => {
        this.nextSlide();
      }, this.intervalMs);
    }
  }

  stopAutoPlay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.startAutoPlay(); // reset timer on manual click
  }

  onAdClick(slide: AdSlide): void {
    this.activityService.track('AD_CLICK', slide.id, { title: slide.title, link: slide.linkUrl });
  }
}
