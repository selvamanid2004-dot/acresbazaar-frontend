import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-property-scout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-scout.component.html',
  styleUrl: './property-scout.component.css'
})
export class PropertyScoutComponent {
  notificationService = inject(NotificationService);

  @Output() becomeScoutRequested = new EventEmitter<void>();

  onBecomeScout() {
    this.notificationService.show('Property Scout', 'Opening Scout registration and verification portal...', 'gold');
    this.becomeScoutRequested.emit();
  }
}
