import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavStateService } from '../../core/services/nav-state.service';
import { NotificationService } from '../../shared/services/notification.service';
import { getApiBaseUrl } from '../../core/services/api-config';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  servicesHeading = signal<string>('Our Services');
  servicesSubheading = signal<string>('Everything you need to discover, list and connect with real-estate opportunities.');
  servicesTag = signal<string>('REAL ESTATE SOLUTIONS');
  servicesBannerImage = signal<string>('');
  dynamicServices = signal<any[]>([]);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    fetch(`${getApiBaseUrl()}/settings/group/service?_t=${Date.now()}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          const bannerUrl = data.settings.service_banner_img;
          // Always update — clear to '' if deleted, set new URL if present
          this.servicesBannerImage.set(bannerUrl ? `url("${bannerUrl}")` : '');

          if (data.settings.services_tag) {
            this.servicesTag.set(data.settings.services_tag);
          }

          const heading = data.settings.service_title || data.settings.service_overview;
          if (heading) this.servicesHeading.set(heading);

          const sub = data.settings.services_subheading;
          if (sub) this.servicesSubheading.set(sub);

          const list = [];
          if (data.settings.service_1) {
            list.push({ name: 'Residential & Plots', short_desc: data.settings.service_1 });
          }
          if (data.settings.service_2) {
            list.push({ name: 'Luxury Homes & Villas', short_desc: data.settings.service_2 });
          }
          if (data.settings.service_3) {
            list.push({ name: 'Commercial & Farm Lands', short_desc: data.settings.service_3 });
          }
          if (data.settings.service_4) {
            list.push({ name: 'Property Scout & Verification', short_desc: data.settings.service_4 });
          }
          if (list.length > 0) {
            this.dynamicServices.set(list);
          }
        }
      })
      .catch(() => {});
  }

  onExplore(type: string) {
    if (type === 'Home' || type === 'Residential') {
      this.navStateService.setView('home', 'explore-properties');
    } else if (type === 'Gold') {
      this.navStateService.setView('home', 'gold-premium-section');
    } else if (type === 'Premium') {
      this.navStateService.setView('home', 'platinum-villas');
    } else if (type === 'Scout') {
      this.navStateService.setView('home', 'property-scout');
    } else {
      this.navStateService.setView('home', 'search-section');
    }
  }
}
