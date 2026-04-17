import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class ApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  private url(path: string) { return `${this.base}${path}`; }

  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => v != null && (p = p.set(k, v)));
    return this.http.get<{ data: T }>(this.url(path), { params: p }).pipe(map(r => r.data));
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<{ data: T }>(this.url(path), body).pipe(map(r => r.data));
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<{ data: T }>(this.url(path), body).pipe(map(r => r.data));
  }

  patch<T>(path: string, body: any = {}): Observable<T> {
    return this.http.patch<{ data: T }>(this.url(path), body).pipe(map(r => r.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<{ data: T }>(this.url(path)).pipe(map(r => r.data));
  }

  /** Opens a PDF in a new browser tab (inline) */
  printPdf(printPath: string): void {
    const token = localStorage.getItem("qms_token");
    // Fetch as blob so we can pass the JWT header
    this.http.get(this.url(printPath), {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        // Revoke after 60s to free memory
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: () => alert("Could not generate PDF. Please try again.")
    });
  }
}
