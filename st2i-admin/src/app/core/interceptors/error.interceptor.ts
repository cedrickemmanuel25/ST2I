import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if ([401].includes(err.status)) {
        // Auto-logout if 401 response returned from API
        authService.logout();
      }

      const error = err.error?.detail || err.error?.message || err.statusText || 'Unknown Error';
      console.error('API Error:', err);
      return throwError(() => error);
    })
  );
};
