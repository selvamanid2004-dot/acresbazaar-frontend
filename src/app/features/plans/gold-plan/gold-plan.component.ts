import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

@Component({
  selector: 'app-gold-plan',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gold-plan.component.html',
  styleUrl: './gold-plan.component.css'
})
export class GoldPlanComponent implements OnInit {
  isProcessing = signal<boolean>(false);

  planData = signal<any>({
    name: 'Gold Membership',
    price: 49,
    billing_period: 'month',
    badge: 'POPULAR',
    description: 'Curated verified listings with direct owner connection and essential RERA title documentation.',
    benefits: [
      { benefit_text: 'Browse unlimited verified residential & commercial properties' },
      { benefit_text: 'Access owner contact details directly (up to 25/month)' },
      { benefit_text: 'Verified RERA document check on selected properties' },
      { benefit_text: 'Email & WhatsApp alerts for price drops in your areas' },
      { benefit_text: 'Standard concierge assistance during business hours' }
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
    fetch(`${getApiBaseUrl()}/plans/gold`)
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
            name: p.name || 'Gold Membership',
            price: p.price !== undefined ? p.price : 49,
            billing_period: p.period || p.billing_period || 'month',
            badge: p.badge || 'POPULAR',
            description: p.description || this.planData().description,
            benefits: mappedBenefits.length > 0 ? mappedBenefits : this.planData().benefits,
            content: p.content || ''
          });
        }
      })
      .catch(() => {});
  }

  isCurrentPlan(): boolean {
    return this.authService.activeMembership() === 'gold';
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  subscribeGold(): void {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.authService.setMembership('gold');
      this.isProcessing.set(false);
      alert('Congratulations! Gold Plan membership has been activated for your account.');
    }, 600);
  }
}
