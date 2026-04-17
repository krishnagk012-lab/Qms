import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // Attach JWT to every request except the login call itself
  if (token && !req.url.includes("/auth/login")) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (!req.url.includes("/auth/login")) {
        if (err.status === 401) {
          // Only auto-logout if the backend explicitly says the token is bad.
          // Check the error body — our JwtFilter writes a specific message.
          const msg: string = err.error?.error ?? "";
          const isTokenError =
            msg.toLowerCase().includes("token") ||
            msg.toLowerCase().includes("expired") ||
            msg.toLowerCase().includes("invalid");

          // Also logout if we have NO token at all (shouldn't happen, but guard)
          const hasNoToken = !auth.getToken();

          if (isTokenError || hasNoToken) {
            console.warn("Auth token invalid/expired — logging out");
            auth.logout();
          }
          // Otherwise (e.g. permission denied on specific endpoint) — do NOT logout
        }
      }
      return throwError(() => err);
    })
  );
};
