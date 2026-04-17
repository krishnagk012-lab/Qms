import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSliderModule } from "@angular/material/slider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({ selector:"app-risk", standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule,MatTableModule,MatButtonModule,MatIconModule,MatSliderModule,MatTooltipModule],
  template:`
  <div class="page-wrap">
    <div class="page-header"><h2>Risk Management</h2><p>ISO 17025:2017 · Clause 8.5 — Risks & Opportunities</p></div>
    <div class="toolbar-row"><div class="toolbar-spacer"></div><button mat-flat-button color="accent" (click)="openNew()"><mat-icon>add</mat-icon> Add Risk</button></div>
    <div class="mat-table-wrap">
      <table mat-table [dataSource]="risks">
        <ng-container matColumnDef="riskId"><th mat-header-cell *matHeaderCellDef>Risk ID</th><td mat-cell *matCellDef="let r"><span class="id-chip" style="background:#EDE9FE;color:#5B21B6">{{r.riskId}}</span></td></ng-container>
        <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>Description</th><td mat-cell *matCellDef="let r" style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{r.description}}</td></ng-container>
        <ng-container matColumnDef="area"><th mat-header-cell *matHeaderCellDef>Area</th><td mat-cell *matCellDef="let r">{{r.area}}</td></ng-container>
        <ng-container matColumnDef="score"><th mat-header-cell *matHeaderCellDef>L × I</th>
          <td mat-cell *matCellDef="let r"><span style="font-size:0.78rem;color:#64748b">{{r.likelihood}}×{{r.impact}}=</span><span class="score-badge" [style.background]="scoreBg(r.riskScore)" [style.color]="scoreColor(r.riskScore)">{{r.riskScore}}</span></td>
        </ng-container>
        <ng-container matColumnDef="level"><th mat-header-cell *matHeaderCellDef>Level</th><td mat-cell *matCellDef="let r"><span class="chip" [class]="levelChip(r.level)">{{r.level}}</span></td></ng-container>
        <ng-container matColumnDef="treatment"><th mat-header-cell *matHeaderCellDef>Treatment</th><td mat-cell *matCellDef="let r" style="font-size:0.82rem">{{r.treatment}}</td></ng-container>
        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r"><span class="chip" [class]="r.status==='CLOSED'?'chip-green':'chip-amber'">{{r.status}}</span></td></ng-container>
        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let r"><button mat-icon-button (click)="edit(r)" matTooltip="Edit"><mat-icon>edit</mat-icon></button></td></ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row;columns:cols"></tr>
      </table>
      <div *ngIf="!risks.length" style="padding:40px;text-align:center;color:#94A3B8">No risks found. Click Add Risk to get started.</div>
    </div>
    <div *ngIf="showDialog" class="dlg-backdrop" (click)="showDialog=false">
      <div class="dlg-panel" (click)="$event.stopPropagation()">
        <div class="dlg-head">{{editItem?.id?"Edit Risk":"Add Risk"}}<button mat-icon-button (click)="showDialog=false"><mat-icon>close</mat-icon></button></div>
        <div class="dlg-body" *ngIf="riskForm">
          <form [formGroup]="riskForm">
            <div class="f-row">
              <div class="f-col"><label class="f-label">Risk ID *</label><input class="f-input" formControlName="riskId" [readonly]="!!editItem?.id" placeholder="RSK-001"/></div>
              <div class="f-col"><label class="f-label">Area</label><select class="f-select" formControlName="area"><option *ngFor="let a of areas" [value]="a">{{a}}</option></select></div>
            </div>
            <div class="f-full"><label class="f-label">Description *</label><textarea class="f-textarea" formControlName="description" rows="3" placeholder="Describe the risk..."></textarea></div>
            <div class="slider-section">
              <div class="slider-item"><label class="f-label">Likelihood: <strong>{{riskForm.get("likelihood")?.value}}</strong></label><mat-slider min="1" max="5" step="1" showTickMarks discrete style="width:100%"><input matSliderThumb formControlName="likelihood"/></mat-slider></div>
              <div class="slider-item"><label class="f-label">Impact: <strong>{{riskForm.get("impact")?.value}}</strong></label><mat-slider min="1" max="5" step="1" showTickMarks discrete style="width:100%"><input matSliderThumb formControlName="impact"/></mat-slider></div>
            </div>
            <div class="score-preview" [style.background]="scoreBg(riskForm.get('likelihood')?.value * riskForm.get('impact')?.value)">
              Risk Score: <strong>{{riskForm.get("likelihood")?.value * riskForm.get("impact")?.value}}</strong> — {{scoreLabel(riskForm.get("likelihood")?.value * riskForm.get("impact")?.value)}}
            </div>
            <div class="f-row" style="margin-top:14px">
              <div class="f-col"><label class="f-label">Treatment</label><select class="f-select" formControlName="treatment"><option value="MITIGATE">Mitigate</option><option value="ACCEPT">Accept</option><option value="TRANSFER">Transfer</option><option value="AVOID">Avoid</option></select></div>
              <div class="f-col"><label class="f-label">Status</label><select class="f-select" formControlName="status"><option value="OPEN">Open</option><option value="CLOSED">Closed</option></select></div>
            </div>
            <div class="f-full"><label class="f-label">Control Measure</label><textarea class="f-textarea" formControlName="controlMeasure" rows="2" placeholder="Control measures in place..."></textarea></div>
          </form>
        </div>
        <div class="dlg-foot"><button mat-stroked-button (click)="showDialog=false">Cancel</button><button mat-flat-button color="primary" (click)="save()"><mat-icon>save</mat-icon> Save Risk</button></div>
      </div>
    </div>
  </div>`,
  styles:[`.score-badge{font-size:0.8rem;font-weight:800;padding:3px 10px;border-radius:20px;margin-left:2px}.slider-section{display:flex;gap:20px;margin-bottom:12px}.slider-item{flex:1}.score-preview{padding:12px 16px;border-radius:8px;font-size:0.9rem;color:#0F172A;margin-bottom:4px;transition:background .2s}`]
})
export class RiskComponent implements OnInit {
  cols=["riskId","description","area","score","level","treatment","status","actions"];
  risks:any[]=[]; showDialog=false; editItem:any=null; riskForm!:FormGroup;
  areas=["Personnel","Calibration","Facilities","Technical","Documents","Quality","IT/Data","Testing"];
  constructor(private api:ApiService, private snack:MatSnackBar, private fb:FormBuilder){}
  ngOnInit(){ this.load(); }
  load(){ this.api.get<any[]>("/quality/risks").subscribe({next:r=>this.risks=r,error:(e)=>{if(e.status!==401)this.snack.open("Failed to load risks","✕");}}); }
  openNew(){ this.editItem={};this.riskForm=this.fb.group({riskId:["",Validators.required],description:["",Validators.required],area:["Personnel"],likelihood:[3],impact:[3],treatment:["MITIGATE"],status:["OPEN"],controlMeasure:[""]});this.showDialog=true; }
  edit(r:any){ this.editItem={...r};this.riskForm=this.fb.group({riskId:[{value:r.riskId,disabled:true}],description:[r.description,Validators.required],area:[r.area],likelihood:[r.likelihood??3],impact:[r.impact??3],treatment:[r.treatment],status:[r.status],controlMeasure:[r.controlMeasure||""]});this.showDialog=true; }
  save(){ if(this.riskForm.invalid)return;this.api.post("/quality/risks",this.riskForm.getRawValue()).subscribe({next:()=>{this.snack.open("Saved ✓","");this.showDialog=false;this.load();},error:()=>this.snack.open("Error","✕")}); }
  scoreBg(s:number){return s>=12?"#FEE2E2":s>=6?"#FEF3C7":"#DCFCE7";}
  scoreColor(s:number){return s>=12?"#991B1B":s>=6?"#92400E":"#166534";}
  scoreLabel(s:number){return s>=12?"HIGH RISK":s>=6?"MEDIUM RISK":"LOW RISK";}
  levelChip(l:string){const m:any={HIGH:"chip-red",MEDIUM:"chip-amber",LOW:"chip-green"};return"chip "+(m[l]??"chip-gray");}
}
