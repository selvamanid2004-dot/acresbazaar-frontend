import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { Property } from '../../../../core/models/property.model';
import { NavStateService } from '../../../../core/services/nav-state.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-featured-sections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-sections.component.html',
  styleUrl: './featured-sections.component.css'
})
export class FeaturedSectionsComponent {
  propertyService = inject(PropertyService);
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  router = inject(Router);

  @Output() propertySelected = new EventEmitter<Property>();

  platinumPlots = this.propertyService.getPlatinumPlots();
  platinumVillas = this.propertyService.getPlatinumVillas();
  newApartments = this.propertyService.getNewApartments();

  isUnlocked(item: Property): boolean {
    if (!this.authService.isAuthenticated()) return false;
    const active = this.authService.activeMembership() || this.navStateService.activeMembership();
    if (!active) return false;
    if (active === 'platinum') return true;
    return item.tier === 'gold';
  }

  onUnlockProperty(item: Property) {
    const tier: 'gold' | 'platinum' = item.tier === 'gold' ? 'gold' : 'platinum';
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/register/buyer'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    if (tier === 'gold') {
      this.router.navigate(['/plans/gold']);
    } else {
      this.router.navigate(['/plans/platinum']);
    }
  }

  onViewAll(event: Event, type: string) {
    event.preventDefault();
    this.notificationService.show(type, `Loading directory of ${type}. Membership required to view full property dossiers.`, 'info');
  }

  onDetails(item: Property) {
    this.propertySelected.emit(item);
  }
}
