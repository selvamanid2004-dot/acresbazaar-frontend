import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavStateService } from '../../../../core/services/nav-state.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PropertyService } from '../../../../core/services/property.service';
import { getApiBaseUrl } from '../../../../core/services/api-config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  propertyService = inject(PropertyService);
  router = inject(Router);

  contactInfo = signal<{ email?: string; phone?: string; address?: string } | null>(null);
  websiteLogo = signal<string | null>(null);
  brandName = signal<string>('AcresBazaar');
  brandSub = signal<string>('PREMIUM PROPERTIES');

  constructor() {
    // Load contact info
    fetch(`${getApiBaseUrl()}/settings/group/contact`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          this.contactInfo.set({
            email: data.settings.contact_email,
            phone: data.settings.contact_phone,
            address: data.settings.contact_address
          });
        }
      })
      .catch(() => {});

    // Load logo & branding
    fetch(`${getApiBaseUrl()}/settings/group/logo`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const logo = data?.settings?.website_logo || data?.settings?.logo_url;
        if (logo && logo.trim()) {
          this.websiteLogo.set(logo.trim());
        }
        const name = data?.settings?.brand_name || data?.settings?.website_name;
        if (name && name.trim()) {
          this.brandName.set(name.trim());
        }
        const sub = data?.settings?.brand_sub;
        if (sub && sub.trim()) {
          this.brandSub.set(sub.trim());
        }
      })
      .catch(() => {});
  }

  onNavView(event: Event, view: 'about' | 'services' | 'buyers') {
    event.preventDefault();
    this.navStateService.setView(view);
  }

  onDealer(event: Event) {
    event.preventDefault();
    this.navStateService.openDealerFlow();
  }

  onRegister(event: Event) {
    event.preventDefault();
    this.navStateService.openRegister();
  }

  onPostProp(event: Event) {
    event.preventDefault();
    const commonSession = localStorage.getItem('aura_common_session');
    const authSession = localStorage.getItem('aura_auth_session');
    const sellerSession = localStorage.getItem('aura_seller_session');
    if (commonSession || authSession || sellerSession) {
      this.router.navigate(['/snap-property/upload']);
    } else {
      this.router.navigate(['/snap-property/register']);
    }
  }

  onGoldMembership(event: Event) {
    event.preventDefault();
    this.router.navigate(['/plans/gold']);
  }

  onPlatinumMembership(event: Event) {
    event.preventDefault();
    this.router.navigate(['/plans/platinum']);
  }

  onHomeSection(event: Event, sectionId: string) {
    event.preventDefault();
    this.navStateService.setView('home', sectionId);
  }

  onNavContact(event: Event) {
    event.preventDefault();
    this.router.navigate(['/contact']);
  }

  onLink(event: Event, name: string) {
    if ((event.target as HTMLElement).getAttribute('href') === '#') {
      event.preventDefault();
      this.notificationService.show('Directory', `Viewing ${name}`, 'info');
    }
  }

  onSocial(event: Event, platform: string) {
    event.preventDefault();
    this.notificationService.show('Social', `Navigating to official ${platform} page`, 'info');
  }
}
