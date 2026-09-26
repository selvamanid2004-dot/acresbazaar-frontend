import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../home/components/header/header.component';
import { FooterComponent } from '../home/components/footer/footer.component';
import { PropertyModalComponent } from '../../shared/components/property-modal/property-modal.component';
import { PostPropertyModalComponent } from '../../shared/components/post-property-modal/post-property-modal.component';
import { RegisterModalComponent } from '../../shared/components/register-modal/register-modal.component';
import { DealerModalComponent } from '../../shared/components/dealer-modal/dealer-modal.component';
import { MembershipModalComponent } from '../../shared/components/membership-modal/membership-modal.component';
import { ToastNotificationComponent } from '../../shared/components/toast-notification/toast-notification.component';
import { WishlistDrawerComponent } from '../../shared/components/wishlist-drawer/wishlist-drawer.component';
import { PropertyService } from '../../core/services/property.service';
import { NavStateService } from '../../core/services/nav-state.service';
import { NotificationService } from '../../shared/services/notification.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { Property } from '../../core/models/property.model';
import { AiChatbotComponent } from '../../shared/components/ai-chatbot/ai-chatbot.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    AiChatbotComponent,
    PropertyModalComponent,
    PostPropertyModalComponent,
    RegisterModalComponent,
    DealerModalComponent,
    MembershipModalComponent,
    ToastNotificationComponent,
    WishlistDrawerComponent
  ],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent implements OnInit {
  propertyService = inject(PropertyService);
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  wishlistService = inject(WishlistService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  activeProperty: Property | null = null;
  postModalOpen = false;

  ngOnInit() {
    // Listen to query parameters so ?property=<id> opens modal and browser back automatically closes it
    this.route.queryParams.subscribe(params => {
      const propId = params['property'];
      if (propId) {
        const prop = this.propertyService.getAllProperties().find(p => p.id === propId);
        if (prop) {
          this.activeProperty = prop;
        }
      } else {
        this.activeProperty = null;
      }
    });
  }

  getAccountRoute(): string {
    if (this.authService.isSellerAuthenticated()) return '/seller/properties';
    if (this.authService.isDealerAuthenticated()) return '/dealer/dashboard';
    if (this.authService.isAuthenticated()) return '/buyers';
    return '/login';
  }

  openDetailsModal(property: Property) {
    this.router.navigate([], {
      queryParams: { property: property.id },
      queryParamsHandling: 'merge'
    });
  }

  closeDetailsModal() {
    this.activeProperty = null;
    if (this.route.snapshot.queryParams['property']) {
      this.router.navigate([], {
        queryParams: { property: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  openPostPropertyModal() {
    this.postModalOpen = true;
    this.navStateService.openPostProperty();
  }

  closePostPropertyModal() {
    this.postModalOpen = false;
    this.navStateService.closePostProperty();
  }

  onContactAgent(property: Property) {
    const agentName = property.postedBy?.name || property.dealer?.name || 'Verified Advisor';
    const agentRole = property.postedBy?.role || 'Partner';
    this.notificationService.show(
      'Inquiry Dispatched',
      `Connecting you with ${agentName} (${agentRole}) for ${property.title}`,
      'success'
    );
    this.closeDetailsModal();
  }
}
