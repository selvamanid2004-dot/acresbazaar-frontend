import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Skip loading spinner for background heartbeat, activity tracking, or silent requests
  const isSilentRequest = 
    req.headers.has('X-Skip-Loading') ||
    req.url.includes('/activities/track') ||
    req.url.includes('/settings/group') ||
    req.url.includes('/chats/ai-assistant');

  if (!isSilentRequest) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!isSilentRequest) {
        loadingService.hide();
      }
    })
  );
};
