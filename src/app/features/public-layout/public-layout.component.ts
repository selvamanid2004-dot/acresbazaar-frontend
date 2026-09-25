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
  template: `
    <div class="app-layout-wrapper">
      <!-- Sticky Marketplace Header -->
      <app-header (postPropertyClicked)="openPostPropertyModal()"></app-header>

      <!-- Flipkart-Style Wishlist Drawer -->
      <app-wishlist-drawer></app-wishlist-drawer>

      <!-- Angular Router Outlet for Public Pages -->
      <main class="app-main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <app-footer></app-footer>

      <!-- Mobile Bottom Navigation Bar (Sticky for Phones) -->
      <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
        <div class="mobile-bottom-nav-inner">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="mobile-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Home</span>
          </a>

          <a routerLink="/all-residential" routerLinkActive="active" class="mobile-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Explore</span>
          </a>

          <button type="button" class="mobile-nav-item center-action" (click)="openPostPropertyModal()" aria-label="Post Property">
            <div class="nav-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span style="font-weight: 700; color: #070D1E;">Post</span>
          </button>

          <button type="button" class="mobile-nav-item" (click)="wishlistService.toggleDrawer()" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span *ngIf="wishlistService.wishlistCount() > 0" class="nav-badge-count">{{ wishlistService.wishlistCount() }}</span>
            <span>Saved</span>
          </button>

          <a [routerLink]="getAccountRoute()" routerLinkActive="active" class="mobile-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{{ authService.isAuthenticated() || authService.isSellerAuthenticated() || authService.isDealerAuthenticated() ? 'Account' : 'Login' }}</span>
          </a>
        </div>
      </nav>

      <!-- 24/7 AcresAI Assistant Chatbot Floating Widget -->
      <app-ai-chatbot></app-ai-chatbot>

      <!-- Global Modals with Deep Linking & Back Button Support -->
      <app-property-modal
        [property]="activeProperty"
        (closeRequested)="closeDetailsModal()"
        (contactAgent)="onContactAgent($event)">
      </app-property-modal>

      <!-- Post Property Modal -->
      <app-post-property-modal
        [isOpen]="postModalOpen || navStateService.postPropertyModalOpen()"
        (closeRequested)="closePostPropertyModal()">
      </app-post-property-modal>

      <!-- Register Modal -->
      <app-register-modal
        [isOpen]="navStateService.registerModalOpen()"
        (closeRequested)="navStateService.closeRegister()">
      </app-register-modal>

      <!-- Dealer Hub Modal -->
      <app-dealer-modal
        [isOpen]="navStateService.dealerModalOpen()"
        (closeRequested)="navStateService.closeDealerFlow()"
        (propertySelected)="openDetailsModal($event)">
      </app-dealer-modal>

      <!-- Membership Modal (Gold Plan & Platinum Plan Dedicated Modals) -->
      <app-membership-modal
        [isOpen]="navStateService.membershipModalOpen()"
        [plan]="navStateService.selectedMembershipTier()"
        (closeRequested)="navStateService.closeMembershipModal()">
      </app-membership-modal>

      <!-- Toast Notification -->
      <app-toast-notification></app-toast-notification>
    </div>
  `,
  styles: [`
    .app-layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #FFFFFF;
    }

    .app-main-content {
      flex: 1;
    }
  `]
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
