import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector:"app-reports", standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule,MatTableModule,MatButtonModule,
           MatIconModule,MatFormFieldModule,MatInputModule,MatTooltipModule],
  template:`
  <div class="page-wrap">
    <div class="page-header"><h2>Reports & Certificates</h2><p>ISO 17025:2017 · Clause 7.8 — Reporting of results</p></div>

    <!-- Approval banner -->
    <div *ngIf="pendingCount > 0" class="approval-banner">
      <mat-icon>pending_actions</mat-icon>
      <span><strong>{{pendingCount}} certificate{{pendingCount>1?'s':''}} awaiting approval.</strong> Review and approve below to issue them.</span>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat-card" *ngFor="let c of statCards">
        <div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div>
        <div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div>
      </div>
    </div>

    <div class="toolbar-row">
      <mat-form-field appearance="outline" class="no-hint" style="width:240px">
        <mat-label>Search reports</mat-label><mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="search" (ngModelChange)="load()"/>
      </mat-form-field>
      <div class="ns-wrap"><select class="ns" [(ngModel)]="filterStatus" (ngModelChange)="load()">
        <option value="">All Status</option>
        <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
      </select></div>
      <div class="toolbar-spacer"></div>
      <button mat-flat-button color="primary" (click)="openNew()"><mat-icon>add</mat-icon> New Certificate</button>
    </div>

    <div class="mat-table-wrap">
      <table mat-table [dataSource]="reports">
        <ng-container matColumnDef="reportNo">
          <th mat-header-cell *matHeaderCellDef>Report No</th>
          <td mat-cell *matCellDef="let r"><span class="id-chip" style="background:#FCE7F3;color:#9D174D">{{r.reportNo}}</span></td>
        </ng-container>
        <ng-container matColumnDef="reportType">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let r"><span class="chip chip-blue">{{r.reportType}}</span></td>
        </ng-container>
        <ng-container matColumnDef="testName">
          <th mat-header-cell *matHeaderCellDef>Test / Analysis</th>
          <td mat-cell *matCellDef="let r">{{r.testName}}</td>
        </ng-container>
        <ng-container matColumnDef="client">
          <th mat-header-cell *matHeaderCellDef>Client</th>
          <td mat-cell *matCellDef="let r" style="font-size:0.82rem">{{r.client}}</td>
        </ng-container>
        <ng-container matColumnDef="issueDate">
          <th mat-header-cell *matHeaderCellDef>Issued</th>
          <td mat-cell *matCellDef="let r" style="font-size:0.78rem;color:#64748b">{{r.issueDate|date:"dd MMM yyyy"}}</td>
        </ng-container>
        <ng-container matColumnDef="analyst">
          <th mat-header-cell *matHeaderCellDef>Analyst</th>
          <td mat-cell *matCellDef="let r" style="font-size:0.82rem">{{r.analyst}}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let r"><span class="chip" [class]="statusChip(r.status)">{{r.status}}</span></td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let r">
            <div style="display:flex;align-items:center;gap:4px">
              <!-- Approve button — only for PENDING_APPROVAL -->
              <button *ngIf="r.status==='PENDING_APPROVAL'"
                mat-flat-button color="primary"
                style="height:30px;font-size:0.75rem;padding:0 10px;min-width:0;border-radius:6px"
                (click)="approve(r)" matTooltip="Approve and issue this certificate">
                <mat-icon style="font-size:14px;width:14px;height:14px;margin-right:3px">check_circle</mat-icon>
                Approve
              </button>
              <!-- Reject button — only for PENDING_APPROVAL -->
              <button *ngIf="r.status==='PENDING_APPROVAL'"
                mat-stroked-button
                style="height:30px;font-size:0.75rem;padding:0 10px;min-width:0;border-radius:6px;color:#EF4444;border-color:#EF4444"
                (click)="reject(r)" matTooltip="Return to Draft">
                <mat-icon style="font-size:14px;width:14px;height:14px;margin-right:3px">undo</mat-icon>
                Return
              </button>
              <!-- Submitted for approval badge -->
              <span *ngIf="r.status==='ISSUED'" class="chip chip-green" style="font-size:0.7rem">
                <mat-icon style="font-size:12px;width:12px;height:12px;vertical-align:middle">verified</mat-icon>
                Issued
              </span>
              <!-- Print certificate -->
              <button *ngIf="r.status==='ISSUED'" mat-icon-button
                (click)="print(r)" matTooltip="Print / Download Certificate"
                style="color:#0891B2">
                <mat-icon style="font-size:18px">picture_as_pdf</mat-icon>
              </button>
              <!-- Edit -->
              <button mat-icon-button (click)="edit(r)" matTooltip="Edit">
                <mat-icon style="font-size:18px;color:#94A3B8">edit</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row;columns:cols"
            [class.pending-row]="row.status==='PENDING_APPROVAL'"></tr>
      </table>
      <div *ngIf="!reports.length" style="padding:40px;text-align:center;color:#94A3B8">
        No reports found. Click <strong>New Certificate</strong> to create one.
      </div>
    </div>

    <!-- Approval confirm dialog -->
    <div *ngIf="showApproveDialog" class="dlg-backdrop" (click)="showApproveDialog=false">
      <div class="dlg-panel" style="width:440px" (click)="$event.stopPropagation()">
        <div class="dlg-head">Approve Certificate<button mat-icon-button (click)="showApproveDialog=false"><mat-icon>close</mat-icon></button></div>
        <div class="dlg-body" *ngIf="approveTarget">
          <div class="approve-info">
            <div class="ai-row"><span class="ai-label">Report No</span><span class="id-chip" style="background:#FCE7F3;color:#9D174D">{{approveTarget.reportNo}}</span></div>
            <div class="ai-row"><span class="ai-label">Test</span><span>{{approveTarget.testName}}</span></div>
            <div class="ai-row"><span class="ai-label">Client</span><span>{{approveTarget.client}}</span></div>
            <div class="ai-row"><span class="ai-label">Analyst</span><span>{{approveTarget.analyst}}</span></div>
            <div class="ai-row"><span class="ai-label">Issue Date</span><span>{{approveTarget.issueDate|date:"dd MMM yyyy"}}</span></div>
          </div>
          <div class="approve-notice">
            <mat-icon>info</mat-icon>
            Approving will change the status to <strong>ISSUED</strong> and the certificate will be officially released. This action is logged in the audit trail.
          </div>
          <div class="f-full" style="margin-top:14px">
            <label class="f-label">Authorised By (confirm your name)</label>
            <input class="f-input" [(ngModel)]="authorisedBy" placeholder="Enter your name to confirm"/>
          </div>
        </div>
        <div class="dlg-foot">
          <button mat-stroked-button (click)="showApproveDialog=false">Cancel</button>
          <button mat-flat-button color="primary" (click)="confirmApprove()" [disabled]="!authorisedBy?.trim()">
            <mat-icon>check_circle</mat-icon> Approve & Issue
          </button>
        </div>
      </div>
    </div>

    <!-- New / Edit dialog -->
    <div *ngIf="showDialog" class="dlg-backdrop" (click)="showDialog=false">
      <div class="dlg-panel" (click)="$event.stopPropagation()">
        <div class="dlg-head">{{editItem?.id?"Edit Report":"New Certificate"}}<button mat-icon-button (click)="showDialog=false"><mat-icon>close</mat-icon></button></div>
        <div class="dlg-body" *ngIf="reportForm">
          <form [formGroup]="reportForm">
            <div class="f-row">
              <div class="f-col"><label class="f-label">Report No *</label><input class="f-input" formControlName="reportNo" [readonly]="!!editItem?.id" placeholder="TC-2025-001"/></div>
              <div class="f-col"><label class="f-label">Type</label>
                <select class="f-select" formControlName="reportType">
                  <option *ngFor="let t of types" [value]="t">{{t}}</option>
                </select>
              </div>
            </div>
            <div class="f-full"><label class="f-label">Test / Analysis</label><input class="f-input" formControlName="testName" placeholder="e.g. pH of drinking water"/></div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Client</label><input class="f-input" formControlName="client" placeholder="Client / organisation"/></div>
              <div class="f-col"><label class="f-label">Sample ID</label><input class="f-input" formControlName="sampleId" placeholder="Sample reference"/></div>
            </div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Issue Date</label><input class="f-input" formControlName="issueDate" type="date"/></div>
              <div class="f-col"><label class="f-label">Validity</label><input class="f-input" formControlName="validity" placeholder="e.g. 6 months from issue"/></div>
            </div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Analyst</label><input class="f-input" formControlName="analyst" placeholder="Analyst name"/></div>
              <div class="f-col"><label class="f-label">Authorised By</label><input class="f-input" formControlName="authorisedBy" placeholder="Signatory"/></div>
            </div>
            <div class="f-full"><label class="f-label">Status</label>
              <select class="f-select" formControlName="status">
                <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
              </select>
            </div>
          </form>
        </div>
        <div class="dlg-foot">
          <button mat-stroked-button (click)="showDialog=false">Cancel</button>
          <button mat-flat-button color="primary" (click)="save()"><mat-icon>save</mat-icon> Save</button>
        </div>
      </div>
    </div>
  </div>`,
  styles:[`
    .no-hint .mat-mdc-form-field-subscript-wrapper{display:none}
    .ns-wrap{display:inline-block}
    .ns{height:40px;padding:0 32px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;color:#0F172A;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;cursor:pointer;outline:none}
    .approval-banner{background:#FEF9C3;border:1px solid #FDE68A;border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:10px;margin-bottom:16px;color:#92400E}
    .approval-banner mat-icon{color:#F59E0B;flex-shrink:0}
    .pending-row .mat-mdc-cell{background:#FFFBEB !important}
    .approve-info{background:#F8FAFC;border-radius:8px;padding:14px 16px;margin-bottom:14px}
    .ai-row{display:flex;align-items:center;gap:12px;padding:5px 0;border-bottom:1px solid #F1F5F9;font-size:0.85rem}
    .ai-row:last-child{border-bottom:none}
    .ai-label{font-size:0.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.3px;min-width:90px}
    .approve-notice{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:10px 14px;display:flex;gap:8px;align-items:flex-start;font-size:0.82rem;color:#1E40AF}
    .approve-notice mat-icon{font-size:16px;width:16px;height:16px;color:#3B82F6;flex-shrink:0;margin-top:1px}
  `]
})
export class ReportsComponent implements OnInit {
  cols=["reportNo","reportType","testName","client","issueDate","analyst","status","actions"];
  reports:any[]=[]; search=""; filterStatus=""; statCards:any[]=[];
  showDialog=false; editItem:any=null; reportForm!:FormGroup;
  showApproveDialog=false; approveTarget:any=null; authorisedBy="";
  pendingCount=0;
  statuses=["DRAFT","PENDING_APPROVAL","ISSUED","AMENDED","WITHDRAWN"];
  types=["TEST_REPORT","TEST_CERTIFICATE","CALIBRATION_CERTIFICATE"];

  constructor(private api:ApiService, private snack:MatSnackBar, private fb:FormBuilder){}
  ngOnInit(){ this.load(); this.loadStats(); }

  loadStats(){
    this.api.get<any>("/reports/stats").subscribe({
      next:s=>{
        this.pendingCount = s.pending ?? 0;
        this.statCards=[
          {label:"Issued",           value:s.issued??0,  icon:"verified",       color:"#10B981",bg:"#DCFCE7"},
          {label:"Pending Approval", value:s.pending??0, icon:"pending_actions", color:"#F59E0B",bg:"#FEF3C7"},
          {label:"Draft",            value:s.draft??0,   icon:"edit_note",      color:"#94A3B8",bg:"#F1F5F9"},
        ];
      },
      error:()=>{}
    });
  }
  load(){
    this.api.get<any>("/reports",{q:this.search||null,status:this.filterStatus||null,size:50}).subscribe({
      next:r=>this.reports=r.content??r,
      error:(e)=>{ if(e.status!==401) this.snack.open("Failed to load reports","✕"); }
    });
  }
  openNew(){
    this.editItem={};
    this.reportForm=this.fb.group({
      reportNo:["",Validators.required],reportType:["TEST_CERTIFICATE"],
      testName:[""],client:[""],sampleId:[""],
      issueDate:[new Date().toISOString().slice(0,10)],
      validity:["6 months from issue"],analyst:[""],authorisedBy:[""],
      status:["DRAFT"]
    });
    this.showDialog=true;
  }
  edit(r:any){
    this.editItem={...r};
    this.reportForm=this.fb.group({
      reportNo:[{value:r.reportNo,disabled:true}],reportType:[r.reportType],
      testName:[r.testName||""],client:[r.client||""],sampleId:[r.sampleId||""],
      issueDate:[r.issueDate||""],validity:[r.validity||""],
      analyst:[r.analyst||""],authorisedBy:[r.authorisedBy||""],status:[r.status]
    });
    this.showDialog=true;
  }
  save(){
    if(this.reportForm.invalid) return;
    this.api.post("/reports",this.reportForm.getRawValue()).subscribe({
      next:()=>{ this.snack.open("Saved ✓",""); this.showDialog=false; this.load(); this.loadStats(); },
      error:()=>this.snack.open("Error saving","✕")
    });
  }

  approve(r:any){
    this.approveTarget=r;
    this.authorisedBy=r.authorisedBy||"";
    this.showApproveDialog=true;
  }
  confirmApprove(){
    if(!this.approveTarget||!this.authorisedBy?.trim()) return;
    // First update authorisedBy if changed, then approve
    const save$ = this.api.post<any>("/reports",{
      ...this.approveTarget, authorisedBy:this.authorisedBy, status:"PENDING_APPROVAL"
    });
    save$.subscribe({
      next:()=>{
        this.api.patch<any>(`/reports/${this.approveTarget.reportNo}/approve`,{}).subscribe({
          next:()=>{
            this.snack.open("✓ Certificate approved and issued!","");
            this.showApproveDialog=false;
            this.approveTarget=null;
            this.load(); this.loadStats();
          },
          error:(e)=>this.snack.open(e.error?.error||"Approval failed","✕")
        });
      },
      error:()=>this.snack.open("Error","✕")
    });
  }
  reject(r:any){
    if(!confirm(`Return "${r.reportNo}" to Draft?`)) return;
    this.api.patch<any>(`/reports/${r.reportNo}/reject`,{}).subscribe({
      next:()=>{ this.snack.open("Returned to Draft",""); this.load(); this.loadStats(); },
      error:(e)=>this.snack.open(e.error?.error||"Error","✕")
    });
  }

  print(r:any){
    this.api.printPdf('/print/certificate/'+r.reportNo);
  }

  statusChip(s:string){
    const m:any={ISSUED:"chip-green",DRAFT:"chip-gray",PENDING_APPROVAL:"chip-amber",AMENDED:"chip-purple",WITHDRAWN:"chip-red"};
    return "chip "+(m[s]??"chip-gray");
  }
}
