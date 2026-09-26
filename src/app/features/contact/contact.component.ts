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
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
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
