import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { MatIconModule } from "@angular/material/icon";

const TITLES: Record<string,string> = {
  dashboard:"Dashboard", documents:"Document Control", equipment:"Equipment & Calibration",
  personnel:"Personnel & Competency", testing:"Test Records", uncertainty:"Measurement Uncertainty",
  proficiency:"Proficiency Testing", audit:"Audit & CAPA", reports:"Reports & Certificates",
  risk:"Risk Management", users:"User Management"
};
const SUBTITLES: Record<string,string> = {
  documents:"ISO 17025 · Clause 8.3", equipment:"ISO 17025 · Clause 6.4",
  personnel:"ISO 17025 · Clause 6.2", testing:"ISO 17025 · Clauses 7.5–7.7",
  uncertainty:"ISO 17025 · Clause 7.6 — GUM method", proficiency:"ISO 17025 · Clause 7.7",
  audit:"ISO 17025 · Clauses 8.6–8.8", reports:"ISO 17025 · Clause 7.8",
  risk:"ISO 17025 · Clause 8.5", users:"Access control & roles"
};

@Component({
  selector: "app-topbar", standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <h1 class="page-title">{{title}}</h1>
        <span *ngIf="subtitle" class="page-sub">{{subtitle}}</span>
      </div>
      <div class="topbar-right">
        <span class="version-badge">v4.0</span>
        <mat-icon class="bell-icon">notifications_none</mat-icon>
      </div>
    </header>`,
  styles: [`
    .topbar { display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:60px;background:#fff;border-bottom:1px solid #E2E8F0;position:sticky;top:0;z-index:50; }
    .topbar-left { display:flex;align-items:baseline;gap:12px; }
    .page-title { font-size:1.05rem;font-weight:700;color:#0D1B3E;margin:0; }
    .page-sub { font-size:0.72rem;color:#94A3B8;white-space:nowrap; }
    .topbar-right { display:flex;align-items:center;gap:12px; }
    .version-badge { font-size:0.68rem;font-weight:600;background:#EFF6FF;color:#1D4ED8;padding:3px 8px;border-radius:20px; }
    .bell-icon { color:#94A3B8;cursor:pointer;font-size:22px;width:22px;height:22px;transition:color .15s; }
    .bell-icon:hover { color:#0D1B3E; }
  `]
})
export class TopbarComponent {
  title="Dashboard"; subtitle="";
  constructor(router: Router) {
    router.events.pipe(filter(e=>e instanceof NavigationEnd)).subscribe((e:any)=>{
      const seg=e.url.split("/").filter(Boolean).pop()??"dashboard";
      this.title   = TITLES[seg]  ?? (seg.charAt(0).toUpperCase()+seg.slice(1));
      this.subtitle= SUBTITLES[seg]??"";
    });
  }
}
