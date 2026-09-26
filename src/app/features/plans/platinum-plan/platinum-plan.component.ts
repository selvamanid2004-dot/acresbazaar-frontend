import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

@Component({
  selector: 'app-platinum-plan',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './platinum-plan.component.html',
  styleUrl: './platinum-plan.component.css'
})
export class PlatinumPlanComponent implements OnInit {
  isProcessing = signal<boolean>(false);

  planData = signal<any>({
    name: 'Platinum Elite Membership',
    price: 129,
    billing_period: 'month',
    badge: 'MOST VALUABLE',
    description: 'Exclusive off-market inventory, priority site viewings, dedicated property lawyer, and unmetered owner connections.',
    benefits: [
      { benefit_text: 'Everything in Gold, plus exclusive private luxury listings' },
      { benefit_text: 'Unlimited instant owner contacts without monthly cap' },
      { benefit_text: 'Dedicated relationship manager & VIP private site visits' },
      { benefit_text: 'End-to-end legal title verification & advocate contract drafting' },
      { benefit_text: 'Zero buyer brokerage guarantee on verified network properties' },
      { benefit_text: 'Early 48-hour access to high-yield off-market property releases' }
    ]
  });

  constructor(
    private authService: AuthService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlan();
  }

  loadPlan(): void {
    fetch(`${getApiBaseUrl()}/plans/platinum`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.plan) {
          const p = data.plan;
          const rawBenefits = Array.isArray(p.benefits) ? p.benefits : [];
          const mappedBenefits = rawBenefits.map((b: any) => {
            if (typeof b === 'string') return { benefit_text: b };
            return b;
          });

          this.planData.set({
            name: p.name || 'Platinum Elite Membership',
            price: p.price !== undefined ? p.price : 129,
            billing_period: p.period || p.billing_period || 'month',
            badge: p.badge || 'MOST VALUABLE',
            description: p.description || this.planData().description,
            benefits: mappedBenefits.length > 0 ? mappedBenefits : this.planData().benefits,
            content: p.content || ''
          });
        }
      })
      .catch(() => {});
  }

  isCurrentPlan(): boolean {
    return this.authService.activeMembership() === 'platinum';
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  subscribePlatinum(): void {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.authService.setMembership('platinum');
      this.isProcessing.set(false);
      alert('Congratulations! Platinum VIP Plan membership has been activated for your account.');
    }, 600);
  }
}
