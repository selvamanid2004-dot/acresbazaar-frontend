import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavStateService } from '../../core/services/nav-state.service';
import { getApiBaseUrl } from '../../core/services/api-config';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit {
  navStateService = inject(NavStateService);
  aboutData = signal<any>({});
  aboutBannerImage = signal<string>('');

  ngOnInit(): void {
    this.loadAboutContent();
  }

  loadAboutContent(): void {
    fetch(`${getApiBaseUrl()}/settings/group/about?_t=${Date.now()}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          const bannerUrl = data.settings.about_banner_img;
          // Always update — clear to '' if deleted (empty string) or set new URL
          this.aboutBannerImage.set(bannerUrl ? `url("${bannerUrl}")` : '');

          this.aboutData.set({
            about_tag: data.settings.about_tag || 'COMPANY PROFILE',
            about_heading: data.settings.about_title || data.settings.about_headline || 'About AcresBazaar',
            about_description: data.settings.about_description || data.settings.about_story || 'Making Property Discovery Simple, Transparent and Rewarding.',
            who_we_are_lead: data.settings.who_we_are_lead,
            who_we_are_body: data.settings.who_we_are_body,
            mission: data.settings.about_mission,
            vision: data.settings.about_vision
          });
        }
      })
      .catch(() => {});
  }

  onExplore() {
    this.navStateService.setView('home', 'explore-properties');
  }
}
