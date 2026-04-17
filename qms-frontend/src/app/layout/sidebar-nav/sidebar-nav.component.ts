import { Component, OnInit } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AuthService } from "../../core/auth/auth.service";
import { filter } from "rxjs/operators";

interface SubItem { label: string; route: string; clause?: string; }
interface NavGroup {
  label: string; icon: string; key: string;
  route?: string;
  children?: SubItem[];
  badge?: number; badgeColor?: string;
  sectionLabel?: string;
}

@Component({
  selector: "app-sidebar-nav", standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatIconModule, MatTooltipModule],
  template: `
<nav class="sidebar">

  <div class="brand">
    <div class="brand-icon"><mat-icon>biotech</mat-icon></div>
    <div>
      <div class="brand-name">QMS Suite</div>
      <div class="brand-sub">ISO 17025 : 2017</div>
    </div>
  </div>

  <div class="nav-body">
    <ng-container *ngFor="let g of nav">

      <div *ngIf="g.sectionLabel" class="section-label">{{g.sectionLabel}}</div>

      <!-- Flat item -->
      <a *ngIf="!g.children"
         [routerLink]="g.route"
         routerLinkActive="active"
         class="nav-item">
        <mat-icon class="nav-icon">{{g.icon}}</mat-icon>
        <span class="nav-label">{{g.label}}</span>
        <span *ngIf="g.badge" class="nav-badge" [style.background]="g.badgeColor||'#EF4444'">{{g.badge}}</span>
      </a>

      <!-- Expandable item -->
      <div *ngIf="g.children">
        <div class="nav-item nav-parent"
             [class.open]="isOpen(g.key)"
             [class.active-parent]="isActiveParent(g.key)"
             (click)="toggle(g.key)">
          <mat-icon class="nav-icon">{{g.icon}}</mat-icon>
          <span class="nav-label">{{g.label}}</span>
          <span *ngIf="g.badge" class="nav-badge" [style.background]="g.badgeColor||'#EF4444'">{{g.badge}}</span>
          <mat-icon class="arrow" [class.rotated]="isOpen(g.key)">chevron_right</mat-icon>
        </div>
        <div class="sub-wrap" [class.expanded]="isOpen(g.key)">
          <a *ngFor="let c of g.children"
             [routerLink]="c.route"
             routerLinkActive="sub-active"
             [routerLinkActiveOptions]="{exact: true}"
             class="sub-item">
            <span class="sub-dot"></span>
            <span class="sub-label">{{c.label}}</span>
            <span *ngIf="c.clause" class="sub-clause">{{c.clause}}</span>
          </a>
        </div>
      </div>

    </ng-container>
  </div>

  <div class="sidebar-footer">
    <div class="user-avatar">{{initials}}</div>
    <div class="user-info">
      <div class="user-name">{{auth.currentUser()?.fullName}}</div>
      <div class="user-role">{{auth.currentUser()?.role | titlecase}}</div>
    </div>
    <button class="logout-btn" (click)="auth.logout()" matTooltip="Sign out">
      <mat-icon>logout</mat-icon>
    </button>
  </div>
</nav>
`,
  styles: [`
    .sidebar { position:fixed;top:0;left:0;width:256px;height:100vh;background:#0D1B3E;display:flex;flex-direction:column;z-index:100;overflow-y:auto; }
    .brand { display:flex;align-items:center;gap:10px;padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,.08); }
    .brand-icon { width:36px;height:36px;background:rgba(0,188,212,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .brand-icon mat-icon { color:#00BCD4;font-size:20px;width:20px;height:20px; }
    .brand-name { color:#fff;font-size:0.95rem;font-weight:700;line-height:1.2; }
    .brand-sub  { color:#00BCD4;font-size:0.6rem;letter-spacing:.6px;margin-top:1px; }
    .nav-body { flex:1;padding:8px 8px 4px; }
    .section-label { font-size:0.58rem;font-weight:700;color:rgba(255,255,255,.25);letter-spacing:1px;text-transform:uppercase;padding:12px 10px 4px; }
    .nav-item { display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;color:rgba(255,255,255,.52);text-decoration:none;font-size:0.82rem;font-weight:500;transition:background .13s,color .13s;cursor:pointer;user-select:none; }
    .nav-item:hover { background:rgba(255,255,255,.07);color:rgba(255,255,255,.85); }
    .nav-item.active { background:rgba(0,188,212,.15);color:#00BCD4; }
    .nav-item.active .nav-icon { color:#00BCD4; }
    .nav-parent.open { color:rgba(255,255,255,.82); }
    .nav-parent.active-parent { background:rgba(0,188,212,.08); }
    .nav-parent.active-parent .nav-icon { color:rgba(0,188,212,.7); }
    .nav-icon { font-size:17px;width:17px;height:17px;color:rgba(255,255,255,.38);flex-shrink:0; }
    .nav-parent.open .nav-icon { color:rgba(255,255,255,.65); }
    .nav-label { flex:1;white-space:nowrap; }
    .nav-badge { font-size:0.6rem;font-weight:700;color:#fff;padding:1px 5px;border-radius:10px;min-width:16px;text-align:center;flex-shrink:0; }
    .arrow { font-size:15px;width:15px;height:15px;color:rgba(255,255,255,.25);flex-shrink:0;transition:transform .18s ease; }
    .arrow.rotated { transform:rotate(90deg);color:rgba(255,255,255,.5); }
    .sub-wrap { overflow:hidden;max-height:0;transition:max-height .22s ease; }
    .sub-wrap.expanded { max-height:320px; }
    .sub-item { display:flex;align-items:center;gap:8px;padding:6px 10px 6px 34px;border-radius:6px;margin:1px 0;color:rgba(255,255,255,.38);text-decoration:none;font-size:0.78rem;font-weight:500;transition:background .1s,color .12s;cursor:pointer; }
    .sub-item:hover { background:rgba(255,255,255,.05);color:rgba(255,255,255,.72); }
    .sub-item.sub-active { background:rgba(0,188,212,.1);color:#00BCD4; }
    .sub-dot { width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0;opacity:.5; }
    .sub-item.sub-active .sub-dot { opacity:1; }
    .sub-label { flex:1; }
    .sub-clause { font-size:0.58rem;color:rgba(255,255,255,.18);font-weight:600;white-space:nowrap; }
    .sub-item.sub-active .sub-clause { color:rgba(0,188,212,.45); }
    .sidebar-footer { padding:11px 13px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:9px; }
    .user-avatar { width:30px;height:30px;border-radius:50%;background:#00BCD4;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;flex-shrink:0; }
    .user-info { flex:1;min-width:0; }
    .user-name { color:#fff;font-size:0.76rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .user-role { color:rgba(255,255,255,.38);font-size:0.62rem; }
    .logout-btn { background:transparent;border:none;color:rgba(255,255,255,.3);cursor:pointer;padding:4px;border-radius:6px;display:flex;align-items:center;transition:color .15s; }
    .logout-btn:hover { color:#EF4444; }
    .logout-btn mat-icon { font-size:17px;width:17px;height:17px; }
  `]
})
export class SidebarNavComponent implements OnInit {
  constructor(public auth: AuthService, private router: Router) {}

  openMenus = new Set<string>(["equipment"]);

  nav: NavGroup[] = [
    { sectionLabel:"Overview",    label:"Dashboard",   icon:"dashboard",               key:"dashboard",   route:"/dashboard" },
    { sectionLabel:"Management",  label:"Documents",   icon:"description",             key:"documents",   route:"/documents" },
    {                              label:"Scope",       icon:"workspace_premium",       key:"scope",        route:"/scope"       },
    {                              label:"Organisation", icon:"account_tree",            key:"organisation", route:"/organisation"},
    {                              label:"Facilities",  icon:"domain",                  key:"facilities",  route:"/facilities" },
    {
      label:"Equipment", icon:"precision_manufacturing", key:"equipment",
      children:[
        { label:"Equipment Register",   route:"/equipment",             clause:"Cl. 6.4"    },
        { label:"Calibration Schedule", route:"/equipment/schedule",    clause:"Cl. 6.4.7"  },
        { label:"Calibration History",  route:"/equipment/cal-history", clause:"Cl. 6.4.13e"},
        { label:"Maintenance Log",      route:"/equipment/maintenance", clause:"Cl. 6.4.13g"},
      ]
    },
    {
      label:"Personnel", icon:"people", key:"personnel",
      children:[
        { label:"Staff Records",    route:"/personnel",          clause:"Cl. 6.2"   },
        { label:"Training Records", route:"/personnel/training", clause:"Cl. 6.2.5" },
      ]
    },
    {                              label:"Suppliers",   icon:"business",                key:"suppliers",    route:"/suppliers"   },
    { sectionLabel:"Technical",   label:"Methods",      icon:"biotech",                  key:"methods",     route:"/methods"     },
    {                              label:"Samples",     icon:"science",                 key:"samples",      route:"/samples"     },
    {                              label:"Traceability", icon:"link",                   key:"traceability", route:"/traceability"},
    {                              label:"Test Records", icon:"science",       key:"testing",     route:"/testing"     },
    {                              label:"Uncertainty",  icon:"show_chart",    key:"uncertainty", route:"/uncertainty" },
    {                              label:"Proficiency",  icon:"bar_chart",     key:"proficiency", route:"/proficiency" },
    {
      sectionLabel:"Quality",
      label:"Quality", icon:"checklist", key:"quality",
      children:[
        { label:"NCR & CAPA",    route:"/audit", clause:"Cl. 8.6" },
        { label:"Risk Register", route:"/risk",  clause:"Cl. 8.5" },
      ]
    },
    {
      label:"Reports", icon:"picture_as_pdf", key:"reports",
      children:[
        { label:"Certificates",    route:"/reports", clause:"Cl. 7.8" },
      ]
    },
    { sectionLabel:"Admin",       label:"Users",       icon:"manage_accounts",         key:"users",       route:"/users"       },
  ];

  ngOnInit() {
    this.syncOpen(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.syncOpen(e.urlAfterRedirects));
  }

  syncOpen(url: string) {
    for (const g of this.nav) {
      if (g.children?.some(c => url.startsWith(c.route))) {
        this.openMenus.add(g.key);
      }
    }
  }

  toggle(key: string) {
    this.openMenus.has(key) ? this.openMenus.delete(key) : this.openMenus.add(key);
  }

  isOpen(key: string): boolean { return this.openMenus.has(key); }

  isActiveParent(key: string): boolean {
    const g = this.nav.find(n => n.key === key);
    return !!g?.children?.some(c => this.router.url.startsWith(c.route));
  }

  get initials(): string {
    return (this.auth.currentUser()?.fullName ?? "U")
      .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  }
}
