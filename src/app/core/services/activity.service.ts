import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE } from './api-config';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface UserActivityPayload {
  userId?: string;
  userRole?: string;
  actionType: 'VIEW_PROPERTY' | 'SEARCH' | 'FILTER' | 'SAVE_WISHLIST' | 'CONTACT_SELLER' | 'SUBMIT_PROPERTY' | 'AD_CLICK' | string;
  entityId?: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${API_BASE}/activities`;

  /**
   * Track user activity seamlessly in the background
   */
  track(actionType: string, entityId?: string, details?: any): void {
    const buyer = this.authService.currentBuyer();
    const seller = this.authService.currentSeller();
    const dealer = this.authService.currentDealer();

    const activeUser = buyer || seller || dealer;
    const role = seller ? 'SELLER' : dealer ? 'DEALER' : buyer ? 'BUYER' : 'ANONYMOUS';

    const payload: UserActivityPayload = {
      userId: (activeUser as any)?.id,
      userRole: role,
      actionType,
      entityId,
      details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : undefined
    };

    // Header to skip visual loading spinner for silent background tracking
    const headers = new HttpHeaders({ 'X-Skip-Loading': 'true' });

    this.http.post(`${this.apiUrl}/track`, payload, { headers })
      .pipe(
        catchError(() => {
          // Fail silently for activity tracking so UX is never interrupted
          return of(null);
        })
      )
      .subscribe();
  }

  getRecentActivities(role?: string, limit = 20) {
    const params: any = { limit: limit.toString() };
    if (role) params.role = role;
    return this.http.get<any>(`${this.apiUrl}/recent`, { params });
  }

  getActivitySummary() {
    return this.http.get<any>(`${this.apiUrl}/summary`);
  }
}
