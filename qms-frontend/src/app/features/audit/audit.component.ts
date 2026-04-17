import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({ selector:"app-audit", standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule,MatTableModule,MatButtonModule,MatIconModule,MatFormFieldModule,MatInputModule,MatTabsModule,MatTooltipModule],
  template:`
  <div class="page-wrap">
    <div class="page-header"><h2>Audit & CAPA</h2><p>ISO 17025:2017 · Clauses 8.6–8.8</p></div>
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card" *ngFor="let c of statCards"><div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div><div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div></div>
    </div>
    <div class="toolbar-row">
      <mat-form-field appearance="outline" class="no-hint" style="width:230px"><mat-label>Search NCRs</mat-label><mat-icon matPrefix>search</mat-icon><input matInput [(ngModel)]="search" (ngModelChange)="loadNCRs()"/></mat-form-field>
      <div class="native-select-wrap"><select class="native-select" [(ngModel)]="filterStatus" (ngModelChange)="loadNCRs()"><option value="">All Status</option><option *ngFor="let s of ncrStatuses" [value]="s">{{s}}</option></select></div>
      <div class="toolbar-spacer"></div>
      <button mat-flat-button color="warn" (click)="openNew()"><mat-icon>report</mat-icon> Raise NCR</button>
    </div>
    <div class="mat-table-wrap">
      <table mat-table [dataSource]="ncrs">
        <ng-container matColumnDef="ncrId"><th mat-header-cell *matHeaderCellDef>NCR ID</th><td mat-cell *matCellDef="let n"><span class="id-chip" style="background:#FEE2E2;color:#991B1B">{{n.ncrId}}</span></td></ng-container>
        <ng-container matColumnDef="finding"><th mat-header-cell *matHeaderCellDef>Finding</th><td mat-cell *matCellDef="let n" style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{n.finding}}</td></ng-container>
        <ng-container matColumnDef="area"><th mat-header-cell *matHeaderCellDef>Area</th><td mat-cell *matCellDef="let n"><span class="chip chip-blue">{{n.area}}</span></td></ng-container>
        <ng-container matColumnDef="severity"><th mat-header-cell *matHeaderCellDef>Severity</th><td mat-cell *matCellDef="let n"><span class="chip" [class]="n.severity==='MAJOR'?'chip-red':'chip-amber'">{{n.severity}}</span></td></ng-container>
        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let n"><span class="chip" [class]="ncrChip(n.status)">{{n.status}}</span></td></ng-container>
        <ng-container matColumnDef="raisedDate"><th mat-header-cell *matHeaderCellDef>Raised</th><td mat-cell *matCellDef="let n" style="font-size:0.78rem;color:#64748b">{{n.raisedDate|date:"dd MMM yyyy"}}</td></ng-container>
        <ng-container matColumnDef="assignee"><th mat-header-cell *matHeaderCellDef>Assignee</th><td mat-cell *matCellDef="let n">{{n.assignee}}</td></ng-container>
        <ng-container matColumnDef="dueDate"><th mat-header-cell *matHeaderCellDef>Due</th><td mat-cell *matCellDef="let n" [style.color]="isOverdue(n.dueDate)&&n.status!=='CLOSED'?'#EF4444':''">{{n.dueDate|date:"dd MMM yyyy"}}</td></ng-container>
        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let n"><button mat-icon-button (click)="editNCR(n)" matTooltip="Edit"><mat-icon>edit</mat-icon></button></td></ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row;columns:cols"></tr>
      </table>
      <div *ngIf="!ncrs.length" style="padding:40px;text-align:center;color:#94A3B8">No NCRs found</div>
    </div>
    <div *ngIf="showDialog" class="dlg-backdrop" (click)="showDialog=false">
      <div class="dlg-panel" style="width:580px" (click)="$event.stopPropagation()">
        <div class="dlg-head">{{editItem?.id?"Edit NCR":"Raise NCR"}}<button mat-icon-button (click)="showDialog=false"><mat-icon>close</mat-icon></button></div>
        <div class="dlg-body" *ngIf="ncrForm">
          <form [formGroup]="ncrForm">
            <div class="f-row">
              <div class="f-col"><label class="f-label">NCR ID *</label><input class="f-input" formControlName="ncrId" [readonly]="!!editItem?.id" placeholder="NCR-001"/></div>
              <div class="f-col"><label class="f-label">Severity</label><select class="f-select" formControlName="severity"><option value="MAJOR">MAJOR</option><option value="MINOR">MINOR</option><option value="OBSERVATION">OBSERVATION</option></select></div>
            </div>
            <div class="f-full"><label class="f-label">Finding *</label><textarea class="f-textarea" formControlName="finding" rows="3" placeholder="Describe the non-conformance..."></textarea></div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Area</label><select class="f-select" formControlName="area"><option *ngFor="let a of areas" [value]="a">{{a}}</option></select></div>
              <div class="f-col"><label class="f-label">Status</label><select class="f-select" formControlName="status"><option *ngFor="let s of ncrStatuses" [value]="s">{{s}}</option></select></div>
            </div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Raised Date</label><input class="f-input" formControlName="raisedDate" type="date"/></div>
              <div class="f-col"><label class="f-label">Due Date</label><input class="f-input" formControlName="dueDate" type="date"/></div>
            </div>
            <div class="f-full"><label class="f-label">Assignee</label><input class="f-input" formControlName="assignee" placeholder="Assigned to"/></div>
            <div class="f-full"><label class="f-label">Root Cause</label><textarea class="f-textarea" formControlName="rootCause" rows="2" placeholder="Root cause analysis..."></textarea></div>
            <div class="f-full"><label class="f-label">Corrective Action</label><textarea class="f-textarea" formControlName="correctiveAction" rows="2" placeholder="Corrective action taken..."></textarea></div>
          </form>
        </div>
        <div class="dlg-foot"><button mat-stroked-button (click)="showDialog=false">Cancel</button><button mat-flat-button color="warn" (click)="save()">Save NCR</button></div>
      </div>
    </div>
  </div>`,
  styles:[`.no-hint .mat-mdc-form-field-subscript-wrapper{display:none}.native-select-wrap{display:inline-block}.native-select{height:40px;padding:0 32px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;color:#0F172A;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;cursor:pointer;outline:none}`]
})
export class AuditComponent implements OnInit {
  cols=["ncrId","finding","area","severity","status","raisedDate","assignee","dueDate","actions"];
  ncrs:any[]=[]; search=""; filterStatus=""; statCards:any[]=[];
  showDialog=false; editItem:any=null; ncrForm!:FormGroup;
  ncrStatuses=["OPEN","IN_PROGRESS","CLOSED"];
  areas=["Calibration","Testing","Documents","Personnel","Facilities","Quality","IT/Data"];
  constructor(private api:ApiService, private snack:MatSnackBar, private fb:FormBuilder){}
  ngOnInit(){ this.loadNCRs(); this.loadStats(); }
  loadStats(){ this.api.get<any>("/quality/stats").subscribe({next:s=>{this.statCards=[{label:"Open NCRs",value:s.open??0,icon:"report_problem",color:"#EF4444",bg:"#FEE2E2"},{label:"In Progress",value:s.inProgress??0,icon:"pending",color:"#F59E0B",bg:"#FEF3C7"},{label:"Closed",value:s.closed??0,icon:"check_circle",color:"#10B981",bg:"#DCFCE7"},{label:"High Risk",value:s.highRisk??0,icon:"priority_high",color:"#EF4444",bg:"#FEE2E2"}];},error:()=>{}}); }
  loadNCRs(){ this.api.get<any>("/quality/ncrs",{q:this.search||null,status:this.filterStatus||null,size:50}).subscribe({next:r=>this.ncrs=r.content??r,error:()=>this.snack.open("Failed to load NCRs","✕")}); }
  openNew(){this.editItem={};this.ncrForm=this.fb.group({ncrId:["",Validators.required],finding:["",Validators.required],area:["Testing"],severity:["MINOR"],status:["OPEN"],raisedDate:[new Date().toISOString().slice(0,10)],dueDate:[""],assignee:[""],rootCause:[""],correctiveAction:[""]});this.showDialog=true;}
  editNCR(n:any){this.editItem={...n};this.ncrForm=this.fb.group({ncrId:[{value:n.ncrId,disabled:true}],finding:[n.finding,Validators.required],area:[n.area],severity:[n.severity],status:[n.status],raisedDate:[n.raisedDate||""],dueDate:[n.dueDate||""],assignee:[n.assignee||""],rootCause:[n.rootCause||""],correctiveAction:[n.correctiveAction||""]});this.showDialog=true;}
  save(){if(this.ncrForm.invalid)return;this.api.post("/quality/ncrs",this.ncrForm.getRawValue()).subscribe({next:()=>{this.snack.open("NCR saved","✓");this.showDialog=false;this.loadNCRs();this.loadStats();},error:()=>this.snack.open("Error","✕")});}
  ncrChip(s:string){const m:any={OPEN:"chip-red",IN_PROGRESS:"chip-amber",CLOSED:"chip-green"};return"chip "+(m[s]??"chip-gray");}
  isOverdue(d:string){return d&&new Date(d)<new Date();}

  printNcr(n:any){
    this.api.printPdf('/print/ncr/'+n.ncrId);
  }
}
