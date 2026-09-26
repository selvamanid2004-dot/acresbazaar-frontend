import { Component, EventEmitter, Input, Output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavStateService } from '../../../core/services/nav-state.service';
import { NotificationService } from '../../services/notification.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

@Component({
  selector: 'app-membership-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './membership-modal.component.html',
  styleUrl: './membership-modal.component.css'
})
export class MembershipModalComponent implements OnInit {
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);

  @Input() isOpen: boolean = false;
  @Input() plan: 'gold' | 'platinum' = 'gold';
  @Output() closeRequested = new EventEmitter<void>();

  goldPlan = signal<{
    name: string;
    price: number;
    period?: string;
    badge?: string;
    description: string;
    benefits: string[];
    content?: string;
  }>({
    name: 'Gold Plan',
    price: 999,
    period: 'month',
    badge: 'VERIFIED BUYER ACCESS',
    description: 'Unlock verified owner numbers, scout discoveries, and complete property pricing details.',
    benefits: [
      'Unlock Property Details: Reveal exact property prices, price per sq.ft and complete area breakdown.',
      'Direct Contact Details: Access direct owner and verified dealer phone numbers & WhatsApp messaging.',
      'Exact Address & Location: View full street address, neighborhood landmarks, and geo-coordinates.',
      'Gold Scout Discoveries: Early access to off-market for-sale opportunities collected by our verified Scout network.',
      '25 Property Dossiers / Month: Download up to 25 verified property specification sheets and legal check summaries.'
    ],
    content: 'Essential membership for active property buyers & investors.'
  });

  platPlan = signal<{
    name: string;
    price: number;
    period?: string;
    badge?: string;
    description: string;
    benefits: string[];
    content?: string;
  }>({
    name: 'Platinum VIP Plan',
    price: 2499,
    period: 'year',
    badge: 'VIP ALL-ACCESS • UNLIMITED',
    description: 'VIP all-access tier for luxury estates, penthouses, developer allocations, and legal dossiers.',
    benefits: [
      'UNLIMITED Property Unlocks: Instant, unrestricted unlocks across Platinum Villas, Penthouses, Farmlands, and Commercial spaces.',
      'Full Legal Due-Diligence: Access certified title deed reports, encumbrance certificates, survey boundaries and RERA documentation.',
      'Direct Dealer & Developer VIP Hotline: Direct priority phone lines with guaranteed 30-minute callback from authorized principals.',
      'Escorted Private Site Visits: Complimentary dedicated concierge assistance and curated on-site property walkthroughs.',
      'Contract & Negotiation Guidance: Professional legal review assistance and escrow transaction support for high-value properties.'
    ],
    content: 'All-inclusive VIP access for luxury homes, estates & institutional investors.'
  });

  userData = {
    name: '',
    email: '',
    phone: ''
  };

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    fetch(`${getApiBaseUrl()}/plans`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.plans && Array.isArray(data.plans)) {
          const gold = data.plans.find((p: any) => p.planId === 'gold');
          if (gold) {
            this.goldPlan.set({
              name: gold.name,
              price: gold.price,
              period: gold.period || gold.billing_period || 'month',
              badge: gold.badge || 'VERIFIED BUYER ACCESS',
              description: gold.description,
              benefits: Array.isArray(gold.benefits) && gold.benefits.length > 0 ? gold.benefits : this.goldPlan().benefits,
              content: gold.content || gold.description
            });
          }
          const plat = data.plans.find((p: any) => p.planId === 'platinum');
          if (plat) {
            this.platPlan.set({
              name: plat.name,
              price: plat.price,
              period: plat.period || plat.billing_period || 'year',
              badge: plat.badge || 'VIP ALL-ACCESS • UNLIMITED',
              description: plat.description,
              benefits: Array.isArray(plat.benefits) && plat.benefits.length > 0 ? plat.benefits : this.platPlan().benefits,
              content: plat.content || plat.description
            });
          }
        }
      })
      .catch(() => {});
  }

  get effectivePlan(): 'gold' | 'platinum' {
    return this.plan || this.navStateService.selectedMembershipTier() || 'gold';
  }

  close() {
    this.closeRequested.emit();
  }

  onCompleteActivation(planType: 'gold' | 'platinum') {
    this.navStateService.activateMembership(planType);
    const planName = planType === 'gold' ? this.goldPlan().name : this.platPlan().name;
    this.notificationService.show(
      `${planName} Activated!`,
      `Welcome ${this.userData.name || 'valued member'}! All ${planType === 'gold' ? 'Gold' : 'Platinum'} property details, exact prices, and contacts are now UNLOCKED.`,
      planType === 'gold' ? 'gold' : 'success'
    );
    this.close();
  }
}
