import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-gold-premium',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gold-premium.component.html',
  styleUrl: './gold-premium.component.css'
})
export class GoldPremiumComponent {
  notificationService = inject(NotificationService);

  @Output() tierChosen = new EventEmitter<string>();

  onExplore(tierName: string) {
    this.notificationService.show(tierName, `Filtering properties by ${tierName}`, 'gold');
    this.tierChosen.emit(tierName);
  }
}
