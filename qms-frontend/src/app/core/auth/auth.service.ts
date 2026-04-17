import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";

export interface User { username: string; fullName: string; role: string; email: string; token: string; }

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly TOKEN_KEY = "qms_token";
  private readonly USER_KEY  = "qms_user";

  currentUser = signal<User | null>(this._stored());

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap(res => {
        const user: User = { ...res.data, token: res.data.token };
        localStorage.setItem(this.TOKEN_KEY, user.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(["/login"]);
  }

  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  isLoggedIn(): boolean { return !!this.getToken(); }
  hasRole(...roles: string[]): boolean { return roles.includes(this.currentUser()?.role ?? ""); }

  private _stored(): User | null {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY) ?? "null"); }
    catch { return null; }
  }
}
