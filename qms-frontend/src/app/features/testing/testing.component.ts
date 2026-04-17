import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({ selector:"app-testing", standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule,MatTableModule,MatTabsModule,MatButtonModule,MatIconModule,MatFormFieldModule,MatInputModule,MatTooltipModule],
  template:`
  <div class="page-wrap">
    <div class="page-header"><h2>Test Records & Proficiency Testing</h2><p>ISO 17025:2017 · Clauses 7.5–7.7</p></div>
    <mat-tab-group animationDuration="200ms">
      <mat-tab label="Test Records">
        <div class="toolbar-row" style="margin-top:14px">
          <mat-form-field appearance="outline" class="no-hint" style="width:230px"><mat-label>Search records</mat-label><mat-icon matPrefix>search</mat-icon><input matInput [(ngModel)]="search" (ngModelChange)="loadTests()"/></mat-form-field>
          <div class="ns-wrap"><select class="ns" [(ngModel)]="filterResult" (ngModelChange)="loadTests()"><option value="">All Results</option><option *ngFor="let r of resultOpts" [value]="r">{{r}}</option></select></div>
          <div class="toolbar-spacer"></div>
          <button mat-flat-button color="primary" (click)="openNew()"><mat-icon>add</mat-icon> New Record</button>
        </div>
        <div class="mat-table-wrap">
          <table mat-table [dataSource]="tests">
            <ng-container matColumnDef="testId"><th mat-header-cell *matHeaderCellDef>Test ID</th><td mat-cell *matCellDef="let t"><span class="id-chip" style="background:#DCFCE7;color:#166534">{{t.testId}}</span></td></ng-container>
            <ng-container matColumnDef="testName"><th mat-header-cell *matHeaderCellDef>Test Name</th><td mat-cell *matCellDef="let t"><strong>{{t.testName}}</strong></td></ng-container>
            <ng-container matColumnDef="sampleId"><th mat-header-cell *matHeaderCellDef>Sample ID</th><td mat-cell *matCellDef="let t" style="font-size:0.78rem;color:#64748b">{{t.sampleId}}</td></ng-container>
            <ng-container matColumnDef="client"><th mat-header-cell *matHeaderCellDef>Client</th><td mat-cell *matCellDef="let t" style="font-size:0.82rem">{{t.client}}</td></ng-container>
            <ng-container matColumnDef="startDate"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let t" style="font-size:0.78rem;color:#64748b">{{t.startDate|date:"dd MMM"}}</td></ng-container>
            <ng-container matColumnDef="analyst"><th mat-header-cell *matHeaderCellDef>Analyst</th><td mat-cell *matCellDef="let t" style="font-size:0.82rem">{{t.analyst}}</td></ng-container>
            <ng-container matColumnDef="result"><th mat-header-cell *matHeaderCellDef>Result</th><td mat-cell *matCellDef="let t"><span class="chip" [class]="resultChip(t.result)">{{t.result}}</span></td></ng-container>
            <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let t"><button mat-icon-button (click)="editTest(t)" matTooltip="Edit"><mat-icon>edit</mat-icon></button></td></ng-container>
            <tr mat-header-row *matHeaderRowDef="testCols"></tr>
            <tr mat-row *matRowDef="let row;columns:testCols"></tr>
          </table>
          <div *ngIf="!tests.length" style="padding:40px;text-align:center;color:#94A3B8">No test records found</div>
        </div>
      </mat-tab>
      <mat-tab label="Proficiency Testing (PT)">
        <div class="toolbar-row" style="margin-top:14px"><div class="toolbar-spacer"></div><button mat-flat-button color="primary" (click)="openPT()"><mat-icon>add</mat-icon> Log PT Result</button></div>
        <div class="mat-table-wrap">
          <table mat-table [dataSource]="ptResults">
            <ng-container matColumnDef="resultId"><th mat-header-cell *matHeaderCellDef>Result ID</th><td mat-cell *matCellDef="let r"><span class="id-chip" style="background:#FCE7F3;color:#9D174D">{{r.resultId}}</span></td></ng-container>
            <ng-container matColumnDef="roundNo"><th mat-header-cell *matHeaderCellDef>Round</th><td mat-cell *matCellDef="let r">{{r.roundNo}}</td></ng-container>
            <ng-container matColumnDef="assignedValue"><th mat-header-cell *matHeaderCellDef>Assigned</th><td mat-cell *matCellDef="let r" style="font-family:monospace">{{r.assignedValue}}</td></ng-container>
            <ng-container matColumnDef="labResult"><th mat-header-cell *matHeaderCellDef>Lab Result</th><td mat-cell *matCellDef="let r" style="font-family:monospace"><strong>{{r.labResult}}</strong></td></ng-container>
            <ng-container matColumnDef="zScore"><th mat-header-cell *matHeaderCellDef>Z-Score</th>
              <td mat-cell *matCellDef="let r">
                <div *ngIf="r.zScore!=null" style="display:flex;align-items:center;gap:6px">
                  <div style="flex:1;height:8px;background:linear-gradient(90deg,#EF4444 0%,#F59E0B 25%,#10B981 50%,#F59E0B 75%,#EF4444 100%);border-radius:4px;position:relative;min-width:80px">
                    <div style="position:absolute;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.2);top:-3px;transform:translateX(-50%)" [style.left]="zPct(r.zScore)+'%'" [style.background]="zColor(r.zScore)"></div>
                  </div>
                  <span [style.color]="zColor(r.zScore)" style="font-weight:700;font-size:0.8rem;min-width:40px">{{r.zScore>=0?'+':''}}{{r.zScore|number:"1.2-2"}}</span>
                </div>
                <span *ngIf="r.zScore==null" style="color:#94A3B8;font-size:0.78rem">Pending</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="zStatus"><th mat-header-cell *matHeaderCellDef>Assessment</th><td mat-cell *matCellDef="let r"><span class="chip" [class]="ptChip(r.zStatus)">{{r.zStatus??"PENDING"}}</span></td></ng-container>
            <ng-container matColumnDef="analyst"><th mat-header-cell *matHeaderCellDef>Analyst</th><td mat-cell *matCellDef="let r" style="font-size:0.82rem">{{r.analyst}}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="ptCols"></tr>
            <tr mat-row *matRowDef="let row;columns:ptCols"></tr>
          </table>
          <div *ngIf="!ptResults.length" style="padding:60px;text-align:center;color:#94A3B8">No PT results yet. Click Log PT Result to get started.</div>
        </div>
      </mat-tab>
    </mat-tab-group>

    <!-- Test dialog -->
    <div *ngIf="showDialog" class="dlg-backdrop" (click)="showDialog=false">
      <div class="dlg-panel" (click)="$event.stopPropagation()">
        <div class="dlg-head">{{editItem?.id?"Edit Test":"New Test Record"}}<button mat-icon-button (click)="showDialog=false"><mat-icon>close</mat-icon></button></div>
        <div class="dlg-body" *ngIf="testForm">
          <form [formGroup]="testForm">
            <div class="f-row">
              <div class="f-col"><label class="f-label">Test ID *</label><input class="f-input" formControlName="testId" [readonly]="!!editItem?.id" placeholder="TR-001"/></div>
              <div class="f-col"><label class="f-label">Result</label><select class="f-select" formControlName="result"><option *ngFor="let r of resultOpts" [value]="r">{{r}}</option></select></div>
            </div>
            <div class="f-full"><label class="f-label">Test Name *</label><input class="f-input" formControlName="testName" placeholder="e.g. pH determination"/></div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Sample ID</label><input class="f-input" formControlName="sampleId" placeholder="Sample reference"/></div>
              <div class="f-col"><label class="f-label">Client</label><input class="f-input" formControlName="client" placeholder="Client name"/></div>
            </div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Start Date</label><input class="f-input" formControlName="startDate" type="date"/></div>
              <div class="f-col"><label class="f-label">End Date</label><input class="f-input" formControlName="endDate" type="date"/></div>
            </div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Analyst</label><input class="f-input" formControlName="analyst" placeholder="Analyst name"/></div>
              <div class="f-col"><label class="f-label">Method</label><input class="f-input" formControlName="method" placeholder="e.g. IS 3025"/></div>
            </div>
          </form>
        </div>
        <div class="dlg-foot"><button mat-stroked-button (click)="showDialog=false">Cancel</button><button mat-flat-button color="primary" (click)="save()"><mat-icon>save</mat-icon> Save</button></div>
      </div>
    </div>

    <!-- PT dialog -->
    <div *ngIf="showPTDialog" class="dlg-backdrop" (click)="showPTDialog=false">
      <div class="dlg-panel" style="width:460px" (click)="$event.stopPropagation()">
        <div class="dlg-head">Log PT Result<button mat-icon-button (click)="showPTDialog=false"><mat-icon>close</mat-icon></button></div>
        <div class="dlg-body" *ngIf="ptForm">
          <form [formGroup]="ptForm">
            <div class="f-row">
              <div class="f-col"><label class="f-label">Round No</label><input class="f-input" formControlName="roundNo" placeholder="2025-R1"/></div>
              <div class="f-col"><label class="f-label">Analyst</label><input class="f-input" formControlName="analyst" placeholder="Analyst name"/></div>
            </div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Assigned Value *</label><input class="f-input" formControlName="assignedValue" type="number" placeholder="e.g. 7.02"/></div>
              <div class="f-col"><label class="f-label">Lab Result *</label><input class="f-input" formControlName="labResult" type="number" placeholder="e.g. 7.04"/></div>
            </div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Std Deviation σ</label><input class="f-input" formControlName="stdDev" type="number" step="0.001" placeholder="e.g. 0.05"/></div>
              <div class="f-col"><label class="f-label">Uncertainty U</label><input class="f-input" formControlName="uncertainty" type="number" placeholder="optional"/></div>
            </div>
            <div *ngIf="ptForm.get('assignedValue')?.value && ptForm.get('stdDev')?.value" class="z-preview-box" [style.background]="previewBg()">
              z-score = <strong>{{calcZ()|number:"1.3-3"}}</strong> — {{previewLabel()}}
            </div>
          </form>
        </div>
        <div class="dlg-foot"><button mat-stroked-button (click)="showPTDialog=false">Cancel</button><button mat-flat-button color="primary" (click)="savePT()"><mat-icon>save</mat-icon> Save PT Result</button></div>
      </div>
    </div>
  </div>`,
  styles:[`.no-hint .mat-mdc-form-field-subscript-wrapper{display:none}.ns-wrap{display:inline-block}.ns{height:40px;padding:0 32px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;color:#0F172A;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;cursor:pointer;outline:none}.z-preview-box{padding:12px 16px;border-radius:8px;font-size:0.9rem;text-align:center;font-weight:600;margin-top:8px;transition:background .2s;color:#0F172A}`]
})
export class TestingComponent implements OnInit {
  testCols=["testId","testName","sampleId","client","startDate","analyst","result","actions"];
  ptCols=["resultId","roundNo","assignedValue","labResult","zScore","zStatus","analyst"];
  tests:any[]=[]; ptResults:any[]=[]; search=""; filterResult="";
  showDialog=false; editItem:any=null; testForm!:FormGroup;
  showPTDialog=false; ptForm!:FormGroup;
  resultOpts=["PASS","FAIL","IN_PROGRESS","INCONCLUSIVE","PENDING_REVIEW"];
  constructor(private api:ApiService, private snack:MatSnackBar, private fb:FormBuilder){}
  ngOnInit(){ this.loadTests(); this.loadPT(); }
  loadTests(){ this.api.get<any>("/testing",{q:this.search||null,result:this.filterResult||null,size:50}).subscribe({next:r=>this.tests=r.content??r,error:(e)=>{if(e.status!==401)this.snack.open("Failed","✕");}}); }
  loadPT(){ this.api.get<any[]>("/testing/pt").subscribe({next:r=>this.ptResults=r,error:()=>{}}); }
  openNew(){ this.editItem={};this.testForm=this.fb.group({testId:["",Validators.required],testName:["",Validators.required],sampleId:[""],client:[""],startDate:[new Date().toISOString().slice(0,10)],endDate:[""],analyst:[""],result:["IN_PROGRESS"],method:[""]});this.showDialog=true; }
  editTest(t:any){ this.editItem={...t};this.testForm=this.fb.group({testId:[{value:t.testId,disabled:true}],testName:[t.testName,Validators.required],sampleId:[t.sampleId||""],client:[t.client||""],startDate:[t.startDate||""],endDate:[t.endDate||""],analyst:[t.analyst||""],result:[t.result],method:[t.method||""]});this.showDialog=true; }
  save(){ if(this.testForm.invalid)return;this.api.post("/testing",this.testForm.getRawValue()).subscribe({next:()=>{this.snack.open("Saved ✓","");this.showDialog=false;this.loadTests();},error:()=>this.snack.open("Error","✕")}); }
  openPT(){ this.ptForm=this.fb.group({roundNo:[""],analyst:[""],assignedValue:[null,Validators.required],labResult:[null,Validators.required],stdDev:[0.05,Validators.required],uncertainty:[null]});this.showPTDialog=true; }
  calcZ():number{ const f=this.ptForm?.value;if(!f?.stdDev||f.stdDev===0)return 0;return(f.labResult-f.assignedValue)/f.stdDev; }
  previewBg(){ const z=Math.abs(this.calcZ());return z<=2?"#DCFCE7":z<=3?"#FEF3C7":"#FEE2E2"; }
  previewLabel(){ const z=Math.abs(this.calcZ());return z<=2?"✓ Satisfactory":z<=3?"⚠ Questionable":"✕ Unsatisfactory"; }
  savePT(){ if(this.ptForm.invalid)return;this.api.post("/testing/pt",this.ptForm.value).subscribe({next:()=>{this.snack.open("PT result saved ✓","");this.showPTDialog=false;this.loadPT();},error:()=>this.snack.open("Error","✕")}); }
  resultChip(r:string){const m:any={PASS:"chip-green",FAIL:"chip-red",IN_PROGRESS:"chip-teal",PENDING_REVIEW:"chip-amber",INCONCLUSIVE:"chip-gray"};return"chip "+(m[r]??"chip-gray");}
  zColor(z:number){const a=Math.abs(z);return a<=2?"#10B981":a<=3?"#F59E0B":"#EF4444";}
  zPct(z:number){return Math.min(96,Math.max(4,((Math.max(-3.5,Math.min(3.5,z))+3.5)/7)*100));}
  ptChip(s:string){const m:any={SATISFACTORY:"chip-green",QUESTIONABLE:"chip-amber",UNSATISFACTORY:"chip-red",PENDING:"chip-gray"};return"chip "+(m[s]??"chip-gray");}
}
