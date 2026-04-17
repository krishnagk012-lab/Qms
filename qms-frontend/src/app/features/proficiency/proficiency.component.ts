import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector:"app-proficiency", standalone:true,
  imports:[CommonModule,MatTableModule,MatIconModule,MatButtonModule],
  template:`
  <div class="page-wrap">
    <div class="page-header"><h2>Proficiency Testing</h2><p>ISO 17025:2017 · Clause 7.7 — Ensuring validity of results</p></div>

    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card" *ngFor="let c of statCards">
        <div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div>
        <div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div>
      </div>
    </div>

    <div class="mat-table-wrap">
      <table mat-table [dataSource]="results">
        <ng-container matColumnDef="resultId"><th mat-header-cell *matHeaderCellDef>Result ID</th><td mat-cell *matCellDef="let r"><span class="id-chip" style="background:#FCE7F3;color:#9D174D">{{r.resultId}}</span></td></ng-container>
        <ng-container matColumnDef="roundNo"><th mat-header-cell *matHeaderCellDef>Round</th><td mat-cell *matCellDef="let r">{{r.roundNo}}</td></ng-container>
        <ng-container matColumnDef="assignedValue"><th mat-header-cell *matHeaderCellDef>Assigned</th><td mat-cell *matCellDef="let r" style="font-family:monospace">{{r.assignedValue}}</td></ng-container>
        <ng-container matColumnDef="labResult"><th mat-header-cell *matHeaderCellDef>Lab Result</th><td mat-cell *matCellDef="let r" style="font-family:monospace"><strong>{{r.labResult}}</strong></td></ng-container>
        <ng-container matColumnDef="stdDev"><th mat-header-cell *matHeaderCellDef>Std Dev</th><td mat-cell *matCellDef="let r" style="font-size:0.78rem;color:#64748b;font-family:monospace">{{r.stdDev}}</td></ng-container>
        <ng-container matColumnDef="zScore">
          <th mat-header-cell *matHeaderCellDef>Z-Score Gauge</th>
          <td mat-cell *matCellDef="let r">
            <div *ngIf="r.zScore!=null" class="z-gauge">
              <div class="z-track">
                <div class="z-dot" [style.left]="zPct(r.zScore)+'%'" [style.background]="zColor(r.zScore)"></div>
              </div>
              <span class="z-val" [style.color]="zColor(r.zScore)">{{r.zScore>=0?"+":""}}{{r.zScore|number:"1.2-2"}}</span>
            </div>
            <span *ngIf="r.zScore==null" style="color:#94A3B8;font-size:0.78rem">Pending</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="zStatus"><th mat-header-cell *matHeaderCellDef>Assessment</th><td mat-cell *matCellDef="let r"><span class="chip" [class]="ptChip(r.zStatus)">{{r.zStatus??"PENDING"}}</span></td></ng-container>
        <ng-container matColumnDef="analyst"><th mat-header-cell *matHeaderCellDef>Analyst</th><td mat-cell *matCellDef="let r" style="font-size:0.82rem">{{r.analyst}}</td></ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row;columns:cols"></tr>
      </table>
      <div *ngIf="!results.length" class="empty-state" style="padding:60px;text-align:center">
        <mat-icon style="font-size:48px;width:48px;height:48px;color:#CBD5E1;display:block;margin:0 auto 12px">bar_chart</mat-icon>
        <p style="color:#94A3B8;margin:0">No PT results yet. Log results in <strong>Test Records → Proficiency Testing</strong> tab.</p>
      </div>
    </div>
  </div>`,
  styles:[`
    .z-gauge{display:flex;align-items:center;gap:8px}
    .z-track{flex:1;height:8px;background:linear-gradient(90deg,#FEE2E2 0%,#FEF3C7 25%,#DCFCE7 50%,#FEF3C7 75%,#FEE2E2 100%);border-radius:4px;position:relative}
    .z-dot{position:absolute;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2);top:-3px;transform:translateX(-50%)}
    .z-val{font-weight:700;font-size:0.8rem;font-family:monospace;min-width:42px}
    .empty-state mat-icon{display:block}
  `]
})
export class ProficiencyComponent implements OnInit {
  cols=["resultId","roundNo","assignedValue","labResult","stdDev","zScore","zStatus","analyst"];
  results:any[]=[]; statCards:any[]=[];

  constructor(private api:ApiService, private snack:MatSnackBar){}
  ngOnInit(){ this.load(); }

  load(){
    this.api.get<any[]>("/testing/pt").subscribe({
      next:r=>{
        this.results=r;
        const sat=r.filter(x=>x.zStatus==="SATISFACTORY").length;
        const q  =r.filter(x=>x.zStatus==="QUESTIONABLE").length;
        const u  =r.filter(x=>x.zStatus==="UNSATISFACTORY").length;
        const p  =r.filter(x=>!x.zStatus||x.zStatus==="PENDING").length;
        this.statCards=[
          {label:"Satisfactory",   value:sat,icon:"check_circle",  color:"#10B981",bg:"#DCFCE7"},
          {label:"Questionable",   value:q,  icon:"warning",       color:"#F59E0B",bg:"#FEF3C7"},
          {label:"Unsatisfactory", value:u,  icon:"cancel",        color:"#EF4444",bg:"#FEE2E2"},
          {label:"Pending",        value:p,  icon:"hourglass_empty",color:"#94A3B8",bg:"#F1F5F9"},
        ];
      },
      error:()=>this.snack.open("Failed to load PT results","✕")
    });
  }
  zColor(z:number){const a=Math.abs(z);return a<=2?"#10B981":a<=3?"#F59E0B":"#EF4444";}
  zPct(z:number){return Math.min(96,Math.max(4,((Math.max(-3.5,Math.min(3.5,z))+3.5)/7)*100));}
  ptChip(s:string){const m:any={SATISFACTORY:"chip-green",QUESTIONABLE:"chip-amber",UNSATISFACTORY:"chip-red",PENDING:"chip-gray"};return"chip "+(m[s]??"chip-gray");}
}
