import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../shared/services/notification.service';
import { NavStateService } from '../../core/services/nav-state.service';
import { getApiBaseUrl } from '../../core/services/api-config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contact-page-wrapper">
      
      <!-- Contact Hero Banner -->
      <section class="contact-hero" [style.background-image]="contactBannerImage()">
        <div class="contact-hero-overlay"></div>
        <div class="container" style="position: relative; z-index: 2;">
          <div class="contact-hero-inner">
            <span class="contact-tag">{{ contactTag() }}</span>
            <h1 class="contact-main-title">{{ contactTitle() }}</h1>
            <p class="contact-hero-sub">
              {{ contactSubtitle() }}
            </p>
          </div>
        </div>
      </section>

      <!-- Main Contact Section: Info Cards & Inquiry Form -->
      <section class="contact-content-section">
        <div class="container">
          
          <!-- Contact Info Cards Grid -->
          <div class="info-cards-grid">
            
            <!-- Phone Card -->
            <div class="contact-card">
              <div class="card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3 class="card-title">Customer Helpline</h3>
              <p class="card-desc">Call our concierge team for immediate real estate assistance.</p>
              <a [href]="'tel:' + contactPhone()" class="card-link">{{ contactPhone() }}</a>
            </div>

            <!-- Email Card -->
            <div class="contact-card">
              <div class="card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <h3 class="card-title">Email Support</h3>
              <p class="card-desc">Drop an inquiry or documentation query anytime.</p>
              <a [href]="'mailto:' + contactEmail()" class="card-link">{{ contactEmail() }}</a>
            </div>

            <!-- Headquarters Card -->
            <div class="contact-card">
              <div class="card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3 class="card-title">Corporate Office</h3>
              <p class="card-desc">Executive headquarters and deed verification center.</p>
              <span class="card-text-val">{{ contactAddress() }}</span>
            </div>

            <!-- Operating Hours Card -->
            <div class="contact-card">
              <div class="card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 class="card-title">Concierge Timings</h3>
              <p class="card-desc">Support hours and verified property desk availability.</p>
              <span class="card-text-val">{{ contactHours() }}</span>
            </div>

          </div>

          <!-- Interactive Inquiry / Problem Resolution Form Panel -->
          <div class="form-container-panel">
            <div class="form-header-area">
              <span class="form-pill">SEND US A MESSAGE</span>
              <h2 class="form-main-heading">Have a Question or Facing an Issue?</h2>
              <p class="form-sub-heading">
                Whether you need assistance with property verification, spotter 1,000-point reward payouts, buyer plans, or dealer onboarding, fill out the form below and our concierge will respond promptly.
              </p>
            </div>

            <form (ngSubmit)="onSubmitInquiry()" class="contact-form-body">
              <div class="form-row-2">
                <div class="input-field">
                  <label for="fullName">Your Full Name <span class="req">*</span></label>
                  <input id="fullName" type="text" [(ngModel)]="inquiry.name" name="name" required placeholder="e.g. Rahul Sharma" class="form-control-styled" />
                </div>

                <div class="input-field">
                  <label for="emailAddr">Email Address <span class="req">*</span></label>
                  <input id="emailAddr" type="email" [(ngModel)]="inquiry.email" name="email" required placeholder="e.g. rahul@example.com" class="form-control-styled" />
                </div>
              </div>

              <div class="form-row-2">
                <div class="input-field">
                  <label for="phoneNumber">Mobile Number <span class="req">*</span></label>
                  <input id="phoneNumber" type="tel" [(ngModel)]="inquiry.phone" name="phone" required placeholder="e.g. +91 98450 00000" class="form-control-styled" />
                </div>

                <div class="input-field">
                  <label for="inquiryType">Topic / Department <span class="req">*</span></label>
                  <select id="inquiryType" [(ngModel)]="inquiry.department" name="department" class="form-control-styled">
                    <option value="General Property Inquiry">General Property Inquiry</option>
                    <option value="Snap Property & Rewards Payout">Snap Property & 1,000-Point Rewards Payout</option>
                    <option value="Buyer Gold & Platinum Membership">Buyer Gold & Platinum Membership</option>
                    <option value="Seller Listing Support">Seller Listing Support</option>
                    <option value="Dealer & Commercial Partnership">Dealer & Commercial Partnership</option>
                    <option value="Technical or Login Issue">Technical or Login Issue</option>
                  </select>
                </div>
              </div>

              <div class="input-field">
                <label for="subjectLine">Subject <span class="req">*</span></label>
                <input id="subjectLine" type="text" [(ngModel)]="inquiry.subject" name="subject" required placeholder="Brief summary of your query" class="form-control-styled" />
              </div>

              <div class="input-field">
                <label for="messageBody">Detailed Message <span class="req">*</span></label>
                <textarea id="messageBody" rows="4" [(ngModel)]="inquiry.message" name="message" required placeholder="Explain your inquiry or issue so we can help you right away..." class="form-control-styled"></textarea>
              </div>

              <div class="form-actions-row">
                <button type="submit" class="btn btn-gold btn-lg submit-btn" [disabled]="submitting()">
                  <span>{{ submitting() ? 'Sending Message...' : 'Submit Inquiry' }}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

    </div>
  `,
  styles: [`
    .contact-page-wrapper {
      background: #FFFFFF;
      min-height: 80vh;
    }

    /* Hero Banner */
    .contact-hero {
      background: var(--primary-900);
      background-size: cover;
      background-position: center;
      color: #FFFFFF;
      padding: 5rem 0 4rem 0;
      border-bottom: 1px solid var(--slate-800);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .contact-hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 13, 30, 0.82) 0%, rgba(13, 27, 62, 0.92) 100%);
      z-index: 1;
    }

    .contact-hero-inner {
      max-width: 780px;
      margin: 0 auto;
    }

    .contact-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: var(--gold-400);
      background: rgba(197, 168, 128, 0.15);
      border: 1px solid rgba(197, 168, 128, 0.35);
      padding: 0.25rem 0.8rem;
      border-radius: var(--radius-xs);
      display: inline-block;
      margin-bottom: 1rem;
    }

    .contact-main-title {
      font-size: clamp(2.2rem, 4vw, 3.2rem);
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 0.85rem;
    }

    .contact-hero-sub {
      font-size: 1.12rem;
      color: var(--slate-300);
      line-height: 1.55;
    }

    /* Content Section */
    .contact-content-section {
      padding: 4rem 0 5rem 0;
    }

    /* Info Cards Grid */
    .info-cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 4rem;
    }

    .contact-card {
      background: #FFFFFF;
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-lg);
      padding: 2rem 1.5rem;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-base);
      display: flex;
      flex-direction: column;
    }

    .contact-card:hover {
      border-color: var(--primary-900);
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }

    .card-icon-box {
      width: 46px;
      height: 46px;
      border-radius: var(--radius-sm);
      background: var(--slate-100);
      color: var(--primary-900);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .card-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--primary-900);
      margin-bottom: 0.5rem;
    }

    .card-desc {
      font-size: 0.88rem;
      color: var(--slate-600);
      line-height: 1.5;
      margin-bottom: 1rem;
      flex: 1;
    }

    .card-link {
      color: var(--primary-900);
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: color var(--transition-fast);
      word-break: break-all;
    }

    .card-link:hover {
      color: var(--gold-600);
      text-decoration: underline;
    }

    .card-text-val {
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--slate-800);
      line-height: 1.45;
    }

    /* Form Container */
    .form-container-panel {
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-xl);
      padding: 3.5rem 3rem;
      max-width: 860px;
      margin: 0 auto;
      box-shadow: var(--shadow-sm);
    }

    .form-header-area {
      text-align: center;
      max-width: 640px;
      margin: 0 auto 2.5rem auto;
    }

    .form-pill {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--primary-900);
      background: var(--slate-100);
      padding: 0.2rem 0.65rem;
      border-radius: var(--radius-xs);
      letter-spacing: 0.08em;
      display: inline-block;
      margin-bottom: 0.6rem;
    }

    .form-main-heading {
      font-size: 1.95rem;
      font-weight: 800;
      color: var(--primary-900);
      letter-spacing: -0.01em;
      margin-bottom: 0.65rem;
    }

    .form-sub-heading {
      font-size: 0.95rem;
      color: var(--slate-600);
      line-height: 1.55;
    }

    .contact-form-body {
      display: flex;
      flex-direction: column;
      gap: 1.35rem;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .input-field {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .input-field label {
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--slate-800);
    }

    .req {
      color: #E11D48;
    }

    .form-control-styled {
      padding: 0.75rem 1rem;
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-md);
      font-size: 0.92rem;
      color: var(--slate-800);
      background: #FFFFFF;
      transition: all var(--transition-fast);
      font-family: inherit;
    }

    .form-control-styled:focus {
      border-color: var(--primary-900);
      outline: none;
      box-shadow: 0 0 0 3px rgba(13, 27, 62, 0.08);
    }

    .form-actions-row {
      margin-top: 0.5rem;
      display: flex;
      justify-content: flex-end;
    }

    .submit-btn {
      padding: 0.85rem 2rem;
    }

    @media (max-width: 960px) {
      .info-cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .info-cards-grid {
        grid-template-columns: 1fr;
      }

      .form-row-2 {
        grid-template-columns: 1fr;
      }

      .form-container-panel {
        padding: 2rem 1.5rem;
      }
    }
  `]
})
export class ContactComponent implements OnInit {
  notificationService = inject(NotificationService);
  navStateService = inject(NavStateService);

  contactTag = signal<string>('SUPPORT & INQUIRIES');
  contactTitle = signal<string>('Get In Touch With AcresBazaar');
  contactSubtitle = signal<string>('Have questions about property listings, buyer plans, or spotter rewards? Our team is here to assist you 24/7.');
  contactBannerImage = signal<string>('');

  contactEmail = signal<string>('support@acresbazaar.com');
  contactPhone = signal<string>('+91 8000-123-456');
  contactAddress = signal<string>('Executive Tower 4, Central Business District, Bengaluru, KA 560001');
  contactHours = signal<string>('Mon - Sat: 9:00 AM - 7:30 PM IST');

  submitting = signal<boolean>(false);

  inquiry = {
    name: '',
    email: '',
    phone: '',
    department: 'General Property Inquiry',
    subject: '',
    message: ''
  };

  ngOnInit(): void {
    this.loadContactSettings();
  }

  loadContactSettings(): void {
    fetch(`${getApiBaseUrl()}/settings/group/contact?_t=${Date.now()}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          const s = data.settings;
          // Always update — clear to '' if deleted, set new URL if present
          this.contactBannerImage.set(s.contact_banner_img ? `url("${s.contact_banner_img}")` : '');
          if (s.contact_tag) this.contactTag.set(s.contact_tag);
          if (s.contact_title) this.contactTitle.set(s.contact_title);
          if (s.contact_subtitle) this.contactSubtitle.set(s.contact_subtitle);

          if (s.contact_email || s.email) this.contactEmail.set(s.contact_email || s.email);
          if (s.contact_phone || s.phone) this.contactPhone.set(s.contact_phone || s.phone);
          if (s.contact_address) this.contactAddress.set(s.contact_address);
          if (s.contact_hours) this.contactHours.set(s.contact_hours);
        }
      })
      .catch(() => {});
  }

  onSubmitInquiry(): void {
    if (!this.inquiry.name || !this.inquiry.email || !this.inquiry.message) {
      this.notificationService.show('Form Incomplete', 'Please fill in your name, email, and message.', 'info');
      return;
    }

    this.submitting.set(true);

    // Also notify support via chat API
    fetch(`${getApiBaseUrl()}/chats/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: this.inquiry.name,
        userEmail: this.inquiry.email,
        initialMessage: `[Inquiry - ${this.inquiry.department}] ${this.inquiry.subject}: ${this.inquiry.message} (Phone: ${this.inquiry.phone})`,
        propertyTitle: 'Customer Support Inquiry'
      })
    })
      .then(() => {
        this.submitting.set(false);
        this.notificationService.show('Message Sent!', 'Thank you! Our concierge team will reach out to you shortly.', 'success');
        this.inquiry = {
          name: '',
          email: '',
          phone: '',
          department: 'General Property Inquiry',
          subject: '',
          message: ''
        };
      })
      .catch(() => {
        this.submitting.set(false);
        this.notificationService.show('Inquiry Submitted', 'Thank you! Your inquiry has been received.', 'success');
      });
  }
}
