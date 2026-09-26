import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-continue-browsing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './continue-browsing.component.html',
  styleUrl: './continue-browsing.component.css'
})
export class ContinueBrowsingComponent {
  notificationService = inject(NotificationService);

  @Output() optionSelected = new EventEmitter<string>();

  options = [
    { label: 'New Launch Properties', targetId: 'new-launches' },
    { label: 'Properties Near You', targetId: 'explore-properties' },
    { label: 'Premium Properties', targetId: 'platinum-villas' },
    { label: 'Plots & Land', targetId: 'platinum-plots' }
  ];

  onOptionClick(opt: { label: string; targetId: string }) {
    const el = document.getElementById(opt.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    this.notificationService.show('Browsing', `Navigated to ${opt.label}`, 'info');
    this.optionSelected.emit(opt.label);
  }
}
