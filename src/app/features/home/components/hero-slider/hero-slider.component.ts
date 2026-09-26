import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../../../core/services/property.service';
import { HeroSlide } from '../../../../core/models/property.model';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-slider.component.html',
  styleUrl: './hero-slider.component.css'
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
