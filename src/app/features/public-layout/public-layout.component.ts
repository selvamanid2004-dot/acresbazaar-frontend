import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
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
import { Property } from '../../core/models/property.model';
import { AiChatbotComponent } from '../../shared/components/ai-chatbot/ai-chatbot.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
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
