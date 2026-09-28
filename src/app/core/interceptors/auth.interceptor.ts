import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Retrieve token from localStorage
  const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('auth_token');

  let authReq = req;
  if (token && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle unauthorized errors gracefully
      if (error.status === 401) {
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user');
      }
      return throwError(() => error);
    })
  );
};
