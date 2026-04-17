import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { ApiService } from "../../core/api/api.service";
import { AuthService } from "../../core/auth/auth.service";

interface StatCard { label:string; value:string|number; icon:string; color:string; bg:string; trend:string; trendColor:string; }

@Component({
  selector:"app-dashboard", standalone:true,
  imports:[CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template:`
  <div class="page-wrap">
    <div class="welcome-banner">
      <div class="wb-left">
        <h2>Welcome back, {{auth.currentUser()?.fullName ?? "User"}}</h2>
        <p>{{today | date:'EEEE, d MMMM yyyy'}} · QMS Suite ISO 17025:2017</p>
      </div>
      <div class="wb-right">
        <div class="readiness-ring">
          <svg viewBox="0 0 36 36"><circle class="track" cx="18" cy="18" r="15.9"/><circle class="fill" cx="18" cy="18" r="15.9" [style.stroke-dasharray]="readiness+' 100'"/></svg>
          <span>{{readiness}}%</span>
        </div>
        <div><div class="rb-label">Readiness</div><div class="rb-sub">Audit score</div></div>
      </div>
    </div>

    <div class="stat-grid">
      <div *ngFor="let c of cards" class="stat-card">
        <div class="icon-box" [style.background]="c.bg">
          <mat-icon [style.color]="c.color">{{c.icon}}</mat-icon>
        </div>
        <div class="val">{{c.value}}</div>
        <div class="lbl">{{c.label}}</div>
        <div class="trend" [style.color]="c.trendColor">{{c.trend}}</div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="qms-card">
        <div class="qms-card-header"><h3>Quick actions</h3></div>
        <div class="qms-card-body qa-list">
          <a *ngFor="let a of actions" [routerLink]="a.route" class="qa-item">
            <div class="qa-icon" [style.background]="a.bg"><mat-icon [style.color]="a.color">{{a.icon}}</mat-icon></div>
            <div><div class="qa-title">{{a.title}}</div><div class="qa-sub">{{a.sub}}</div></div>
            <mat-icon class="qa-arrow">chevron_right</mat-icon>
          </a>
        </div>
      </div>
      <div class="qms-card">
        <div class="qms-card-header"><h3>Module overview</h3></div>
        <div class="qms-card-body">
          <div *ngFor="let m of modules" class="mod-row">
            <mat-icon class="mod-icon" [style.color]="m.color">{{m.icon}}</mat-icon>
            <div class="mod-info"><div class="mod-name">{{m.name}}</div><div class="mod-clause">{{m.clause}}</div></div>
            <div class="mod-bar-wrap"><div class="mod-bar" [style.width]="m.pct+'%'" [style.background]="m.color"></div></div>
            <span class="chip" [class]="m.chipClass">{{m.status}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  styles:[`
    .welcome-banner { background:linear-gradient(135deg,#0D1B3E,#1A2F5A);border-radius:12px;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;color:#fff; }
    .wb-left h2 { font-size:1.15rem;font-weight:700;margin:0 0 4px; }
    .wb-left p  { font-size:0.78rem;color:rgba(255,255,255,0.5);margin:0; }
    .wb-right   { display:flex;align-items:center;gap:14px; }
    .readiness-ring { position:relative;width:56px;height:56px; }
    .readiness-ring svg { transform:rotate(-90deg); }
    .readiness-ring .track { fill:none;stroke:rgba(255,255,255,0.15);stroke-width:3; }
    .readiness-ring .fill  { fill:none;stroke:#00BCD4;stroke-width:3;stroke-linecap:round;transition:stroke-dasharray .6s; }
    .readiness-ring span   { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700; }
    .rb-label { font-size:0.82rem;font-weight:600; }
    .rb-sub   { font-size:0.7rem;color:rgba(255,255,255,0.45); }
    .dash-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
    .qa-list   { display:flex;flex-direction:column;gap:4px;padding-top:4px; }
    .qa-item   { display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;text-decoration:none;color:inherit;transition:background .15s;cursor:pointer; }
    .qa-item:hover { background:#F8FAFC; }
    .qa-icon   { width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .qa-icon mat-icon { font-size:18px;width:18px;height:18px; }
    .qa-title  { font-size:0.85rem;font-weight:500;color:#0F172A; }
    .qa-sub    { font-size:0.72rem;color:#94A3B8; }
    .qa-arrow  { color:#CBD5E1;font-size:18px;width:18px;height:18px;margin-left:auto; }
    .mod-row   { display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F1F5F9; }
    .mod-row:last-child { border-bottom:none; }
    .mod-icon  { font-size:18px;width:18px;height:18px;flex-shrink:0; }
    .mod-info  { flex:0 0 130px; }
    .mod-name  { font-size:0.82rem;font-weight:500;color:#0F172A; }
    .mod-clause { font-size:0.68rem;color:#94A3B8; }
    .mod-bar-wrap { flex:1;height:5px;background:#F1F5F9;border-radius:3px;overflow:hidden; }
    .mod-bar   { height:100%;border-radius:3px;transition:width .6s; }
    @media(max-width:768px){.dash-grid{grid-template-columns:1fr;}}
  `]
})
export class DashboardComponent implements OnInit {
  today=new Date(); readiness=88; cards:StatCard[]=[];
  constructor(private api:ApiService, public auth:AuthService){}
  ngOnInit(){
    this.api.get<any>("/dashboard/stats").subscribe({
      next:s=>{
        const d=s.documents??{}, e=s.equipment??{}, q=s.quality??{};
        const issues=(e.overdue??0)+(q.open??0);
        this.readiness=Math.max(60,100-issues*3);
        this.cards=[
          {label:"Documents",    value:d.total??0,       icon:"description",          color:"#0891B2",bg:"#E0F7FA",trend:`${d.reviewDue??0} review due`,     trendColor:d.reviewDue>0?"#F59E0B":"#10B981"},
          {label:"Equipment",    value:e.overdue??0,     icon:"precision_manufacturing",color:"#EF4444",bg:"#FEE2E2",trend:`${e.dueSoon??0} due soon`,        trendColor:"#F59E0B"},
          {label:"Open NCRs",    value:q.open??0,        icon:"report_problem",       color:"#F59E0B",bg:"#FEF3C7",trend:`${q.inProgress??0} in progress`,    trendColor:"#0891B2"},
          {label:"Active Tests", value:s.testing?.active??0,icon:"science",           color:"#10B981",bg:"#DCFCE7",trend:`${s.reports?.issued??0} issued`,    trendColor:"#10B981"},
          {label:"Staff",        value:s.personnel?.active??0,icon:"people",          color:"#8B5CF6",bg:"#EDE9FE",trend:"Active members",                    trendColor:"#8B5CF6"},
          {label:"PT Pending",   value:s.testing?.ptPending??0,icon:"bar_chart",      color:"#EC4899",bg:"#FCE7F3",trend:"Needs submission",                  trendColor:"#EC4899"},
        ];
      },
      error:()=>console.warn("Dashboard stats unavailable")
    });
  }
  actions=[
    {title:"New Document",      sub:"Add to register",     icon:"note_add",           color:"#0891B2",bg:"#E0F7FA",route:"/documents"},
    {title:"Log Calibration",   sub:"Equipment update",    icon:"build",              color:"#10B981",bg:"#DCFCE7",route:"/equipment"},
    {title:"Raise NCR",         sub:"Non-conformance",     icon:"report",             color:"#EF4444",bg:"#FEE2E2",route:"/audit"},
    {title:"Log PT Result",     sub:"Proficiency testing", icon:"analytics",          color:"#8B5CF6",bg:"#EDE9FE",route:"/proficiency"},
    {title:"New Test Record",   sub:"Test management",     icon:"science",            color:"#F59E0B",bg:"#FEF3C7",route:"/testing"},
    {title:"Generate Report",   sub:"Certificate / report",icon:"picture_as_pdf",     color:"#EC4899",bg:"#FCE7F3",route:"/reports"},
  ];
  modules=[
    {name:"Document Control",  clause:"Cl. 8.3",icon:"description",          color:"#0891B2",pct:90,status:"Active",    chipClass:"chip chip-teal"},
    {name:"Equipment",         clause:"Cl. 6.4",icon:"precision_manufacturing",color:"#10B981",pct:75,status:"3 due",   chipClass:"chip chip-amber"},
    {name:"Test Records",      clause:"Cl. 7.5",icon:"science",               color:"#8B5CF6",pct:85,status:"Active",   chipClass:"chip chip-purple"},
    {name:"Audit & CAPA",      clause:"Cl. 8.6",icon:"checklist",             color:"#EF4444",pct:70,status:"2 open",   chipClass:"chip chip-red"},
    {name:"Proficiency",       clause:"Cl. 7.7",icon:"bar_chart",             color:"#EC4899",pct:60,status:"Pending",  chipClass:"chip chip-gray"},
    {name:"Risk Management",   clause:"Cl. 8.5",icon:"warning",               color:"#F59E0B",pct:80,status:"Monitored",chipClass:"chip chip-amber"},
  ];
}
