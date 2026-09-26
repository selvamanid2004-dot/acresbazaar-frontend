import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { Property } from '../../../../core/models/property.model';
import { NavStateService } from '../../../../core/services/nav-state.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-new-launch-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-launch-section.component.html',
  styleUrl: './new-launch-section.component.css'
})
export class NewLaunchSectionComponent {
  propertyService = inject(PropertyService);
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  router = inject(Router);

  @Output() propertySelected = new EventEmitter<Property>();

  newLaunches = this.propertyService.getNewLaunches();

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

  onViewAll(event: Event) {
    event.preventDefault();
    this.notificationService.show('New Launches', 'Displaying catalogue of active launches. Membership required to view full details.', 'info');
  }

  onDetails(item: Property) {
    this.propertySelected.emit(item);
  }
}
