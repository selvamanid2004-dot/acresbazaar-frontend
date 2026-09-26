import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';
import { getApiBaseUrl } from '../../../../core/services/api-config';

@Component({
  selector: 'app-cta-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta-banner.component.html',
  styleUrl: './cta-banner.component.css'
})
export class CtaBannerComponent implements OnInit {
  notificationService = inject(NotificationService);

  @Output() exploreRequested = new EventEmitter<void>();

  ctaHeading = signal<string>('Find Your Next Property Today');
  ctaSub = signal<string>('Connect with verified sellers, licensed dealers, and ground property scouts across top locations.');
  ctaBtnText = signal<string>('Explore Properties');

  ngOnInit(): void {
    fetch(`${getApiBaseUrl()}/settings/group/home`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          if (data.settings.cta_heading) this.ctaHeading.set(data.settings.cta_heading);
          if (data.settings.cta_sub) this.ctaSub.set(data.settings.cta_sub);
          if (data.settings.cta_btn_text) this.ctaBtnText.set(data.settings.cta_btn_text);
        }
      })
      .catch(() => {});
  }

  onExplore() {
    const el = document.getElementById('search-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    this.exploreRequested.emit();
  }
}
