import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector:"app-documents", standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule,MatTableModule,MatPaginatorModule,
           MatButtonModule,MatIconModule,MatFormFieldModule,MatInputModule,MatTooltipModule],
  template:`
  <div class="page-wrap">
    <div class="page-header"><h2>Document Control</h2><p>ISO 17025:2017 · Clause 8.3</p></div>

    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card" *ngFor="let c of statCards">
        <div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div>
        <div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div>
      </div>
    </div>

    <div class="toolbar-row">
      <mat-form-field appearance="outline" class="no-hint" style="width:240px">
        <mat-label>Search</mat-label><mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="search" (ngModelChange)="load()"/>
      </mat-form-field>
      <div class="native-select-wrap">
        <select class="native-select" [(ngModel)]="filterCat" (ngModelChange)="load()">
          <option value="">All Categories</option>
          <option *ngFor="let c of categories" [value]="c">{{c}}</option>
        </select>
      </div>
      <div class="native-select-wrap">
        <select class="native-select" [(ngModel)]="filterStatus" (ngModelChange)="load()">
          <option value="">All Status</option>
          <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
        </select>
      </div>
      <div class="toolbar-spacer"></div>
      <button mat-stroked-button (click)="printRegister()" style="color:#0891B2;border-color:#0891B2">
        <mat-icon>picture_as_pdf</mat-icon> Print Register
      </button>
      <button mat-flat-button color="primary" (click)="openNew()"><mat-icon>add</mat-icon> New Document</button>
    </div>

    <div class="mat-table-wrap">
      <table mat-table [dataSource]="docs">
        <ng-container matColumnDef="docId"><th mat-header-cell *matHeaderCellDef>Doc ID</th><td mat-cell *matCellDef="let d"><span class="id-chip">{{d.docId}}</span></td></ng-container>
        <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>Title</th><td mat-cell *matCellDef="let d" style="max-width:280px"><strong>{{d.title}}</strong></td></ng-container>
        <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Category</th><td mat-cell *matCellDef="let d"><span class="chip chip-blue">{{d.category}}</span></td></ng-container>
        <ng-container matColumnDef="version"><th mat-header-cell *matHeaderCellDef>Ver.</th><td mat-cell *matCellDef="let d" style="color:#64748b;font-size:0.78rem">{{d.version}}</td></ng-container>
        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let d"><span class="chip" [class]="statusChip(d.status)">{{d.status}}</span></td></ng-container>
        <ng-container matColumnDef="reviewDue"><th mat-header-cell *matHeaderCellDef>Review Due</th>
          <td mat-cell *matCellDef="let d" [style.color]="isOverdue(d.reviewDue)?'#EF4444':''">
            {{d.reviewDue | date:"dd MMM yyyy"}}
          </td>
        </ng-container>
        <ng-container matColumnDef="owner"><th mat-header-cell *matHeaderCellDef>Owner</th><td mat-cell *matCellDef="let d" style="color:#64748b">{{d.owner}}</td></ng-container>
        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let d"><button mat-icon-button (click)="edit(d)" matTooltip="Edit"><mat-icon>edit</mat-icon></button></td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row;columns:cols"></tr>
      </table>
      <mat-paginator [length]="total" [pageSize]="15" [pageSizeOptions]="[10,15,25,50]" (page)="onPage($event)"/>
    </div>

    <!-- Dialog with NATIVE controls — no CDK overlay issues -->
    <div *ngIf="showDialog" class="dlg-backdrop" (click)="showDialog=false">
      <div class="dlg-panel" (click)="$event.stopPropagation()">
        <div class="dlg-head">
          <span>{{editDoc?.id ? "Edit Document" : "New Document"}}</span>
          <button mat-icon-button (click)="showDialog=false"><mat-icon>close</mat-icon></button>
        </div>
        <div class="dlg-body" *ngIf="docForm">
          <form [formGroup]="docForm">

            <div class="f-row">
              <div class="f-col">
                <label class="f-label">Doc ID *</label>
                <input class="f-input" formControlName="docId" [readonly]="!!editDoc?.id" placeholder="e.g. QP-001"/>
              </div>
              <div class="f-col">
                <label class="f-label">Version</label>
                <input class="f-input" formControlName="version" placeholder="v1.0"/>
              </div>
            </div>

            <div class="f-full">
              <label class="f-label">Title *</label>
              <input class="f-input" formControlName="title" placeholder="Document title"/>
            </div>

            <div class="f-row">
              <div class="f-col">
                <label class="f-label">Category</label>
                <select class="f-select" formControlName="category">
                  <option *ngFor="let c of categories" [value]="c">{{c}}</option>
                </select>
              </div>
              <div class="f-col">
                <label class="f-label">Status</label>
                <select class="f-select" formControlName="status">
                  <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
                </select>
              </div>
            </div>

            <div class="f-row">
              <div class="f-col">
                <label class="f-label">Issue Date</label>
                <input class="f-input" formControlName="issueDate" type="date"/>
              </div>
              <div class="f-col">
                <label class="f-label">Review Due</label>
                <input class="f-input" formControlName="reviewDue" type="date"/>
              </div>
            </div>

            <div class="f-full">
              <label class="f-label">Owner</label>
              <input class="f-input" formControlName="owner" placeholder="Document owner"/>
            </div>

          </form>
        </div>
        <div class="dlg-foot">
          <button mat-stroked-button (click)="showDialog=false">Cancel</button>
          <button mat-flat-button color="primary" (click)="save()">
            <mat-icon>save</mat-icon> Save Document
          </button>
        </div>
      </div>
    </div>
  </div>`,
  styles:[`
    .no-hint .mat-mdc-form-field-subscript-wrapper{display:none}
    .native-select-wrap{position:relative;display:inline-block}
    .native-select{height:40px;padding:0 32px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;color:#0F172A;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;cursor:pointer;outline:none}
    .native-select:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1)}
    .dlg-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center}
    .dlg-panel{background:#fff;border-radius:14px;width:540px;max-width:calc(100vw - 32px);box-shadow:0 24px 64px rgba(0,0,0,.22);display:flex;flex-direction:column;max-height:90vh}
    .dlg-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #E2E8F0;font-size:1rem;font-weight:700;color:#0D1B3E;flex-shrink:0}
    .dlg-body{padding:20px;overflow-y:auto;flex:1}
    .dlg-foot{display:flex;gap:8px;justify-content:flex-end;padding:12px 20px;border-top:1px solid #E2E8F0;flex-shrink:0}
    .f-row{display:flex;gap:12px;margin-bottom:14px}
    .f-col{flex:1;min-width:0}
    .f-full{margin-bottom:14px}
    .f-label{display:block;font-size:0.75rem;font-weight:600;color:#475569;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.3px}
    .f-input{width:100%;height:40px;padding:0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.87rem;color:#0F172A;outline:none;font-family:inherit;box-sizing:border-box;transition:border-color .15s,box-shadow .15s}
    .f-input:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .f-input[readonly]{background:#F8FAFC;color:#94A3B8;cursor:not-allowed}
    .f-select{width:100%;height:40px;padding:0 32px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.87rem;color:#0F172A;outline:none;font-family:inherit;box-sizing:border-box;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;cursor:pointer;transition:border-color .15s,box-shadow .15s}
    .f-select:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1)}
  `]
})
export class DocumentsComponent implements OnInit {
  cols=["docId","title","category","version","status","reviewDue","owner","actions"];
  docs:any[]=[]; total=0; search=""; filterCat=""; filterStatus="";
  showDialog=false; editDoc:any=null; docForm!:FormGroup; statCards:any[]=[];
  categories=["Testing","Calibration","Quality","Technical","Facilities","Audit","Safety"];
  statuses=["ACTIVE","DRAFT","UNDER_REVIEW","OBSOLETE"];

  constructor(private api:ApiService, private snack:MatSnackBar, private fb:FormBuilder){}
  ngOnInit(){ this.load(); this.loadStats(); }

  loadStats(){
    this.api.get<any>("/documents/stats").subscribe({
      next:s=>{ this.statCards=[
        {label:"Total",      value:s.total??0,     icon:"folder",      color:"#0891B2",bg:"#E0F7FA"},
        {label:"Active",     value:s.active??0,    icon:"check_circle",color:"#10B981",bg:"#DCFCE7"},
        {label:"Review Due", value:s.reviewDue??0, icon:"schedule",    color:"#F59E0B",bg:"#FEF3C7"},
        {label:"Draft",      value:s.draft??0,     icon:"edit_note",   color:"#94A3B8",bg:"#F1F5F9"},
      ];},
      error:()=>{}
    });
  }
  load(page=0){
    this.api.get<any>("/documents",{q:this.search||null,category:this.filterCat||null,status:this.filterStatus||null,page,size:15}).subscribe({
      next:r=>{ this.docs=r.content??[]; this.total=r.totalElements??0; },
      error:(e)=>{ if(e.status!==401) this.snack.open("Failed to load documents","✕"); }
    });
  }
  onPage(e:PageEvent){ this.load(e.pageIndex); }
  openNew(){
    this.editDoc={};
    this.docForm=this.fb.group({docId:["",Validators.required],title:["",Validators.required],version:["v1.0"],category:["Testing"],status:["DRAFT"],issueDate:[""],reviewDue:[""],owner:[""]});
    this.showDialog=true;
  }
  edit(d:any){
    this.editDoc={...d};
    this.docForm=this.fb.group({docId:[{value:d.docId,disabled:true}],title:[d.title,Validators.required],version:[d.version||"v1.0"],category:[d.category||"Testing"],status:[d.status||"DRAFT"],issueDate:[d.issueDate||""],reviewDue:[d.reviewDue||""],owner:[d.owner||""]});
    this.showDialog=true;
  }
  save(){
    if(this.docForm.invalid){ this.snack.open("Please fill required fields","⚠"); return; }
    this.api.post("/documents",this.docForm.getRawValue()).subscribe({
      next:()=>{ this.snack.open("Document saved ✓",""); this.showDialog=false; this.load(); this.loadStats(); },
      error:(e)=>this.snack.open(e.error?.error||"Error saving document","✕")
    });
  }
  statusChip(s:string){const m:any={ACTIVE:"chip chip-green",DRAFT:"chip chip-gray",UNDER_REVIEW:"chip chip-amber",OBSOLETE:"chip chip-red"};return m[s]??"chip chip-gray";}
  isOverdue(d:string){return d&&new Date(d)<new Date();}

  printRegister(){
    this.api.printPdf('/print/document-register');
  }
}
