import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-personnel", standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule,
            MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Personnel & Competency</h2>
    <p>ISO 17025:2017 · Clause 6.2 — Personnel competence, authorisation and supervision</p>
  </div>

  <!-- Stats -->
  <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="stat-card" *ngFor="let c of statCards">
      <div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div>
      <div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div>
    </div>
  </div>

  <!-- Toolbar -->
  <div class="toolbar-row">
    <div class="search-box">
      <mat-icon class="si">search</mat-icon>
      <input class="si-inp" [(ngModel)]="search" (ngModelChange)="loadStaff()" placeholder="Search name, designation, department…"/>
    </div>
    <select class="ns" [(ngModel)]="filterDept" (ngModelChange)="loadStaff()">
      <option value="">All Departments</option>
      <option *ngFor="let d of departments" [value]="d">{{d}}</option>
    </select>
    <select class="ns" [(ngModel)]="filterCompetency" (ngModelChange)="loadStaff()">
      <option value="">All competency status</option>
      <option value="COMPETENT">Competent</option>
      <option value="UNDER_SUPERVISION">Under Supervision</option>
      <option value="REQUIRES_TRAINING">Requires Training</option>
      <option value="NOT_YET_ASSESSED">Not Yet Assessed</option>
    </select>
    <div class="toolbar-spacer"></div>
    <button class="btn-p" (click)="openNew()"><mat-icon>person_add</mat-icon> Add Staff</button>
  </div>

  <!-- Table -->
  <div class="tcard">
    <table mat-table [dataSource]="staff">

      <ng-container matColumnDef="empId">
        <th mat-header-cell *matHeaderCellDef>ID</th>
        <td mat-cell *matCellDef="let p">
          <span class="id-chip">{{p.empId}}</span>
          <div *ngIf="p.employeeType && p.employeeType!=='INTERNAL'" class="emp-type">{{p.employeeType}}</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="fullName">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let p">
          <div class="p-name">{{p.fullName}}</div>
          <div class="p-sub">{{p.designation}}</div>
          <div class="p-sub" *ngIf="p.reportingTo" style="color:#94A3B8">Reports to: {{p.reportingTo}}</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="department">
        <th mat-header-cell *matHeaderCellDef>Department</th>
        <td mat-cell *matCellDef="let p">
          <span class="dept-chip">{{p.department || "—"}}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="qualification">
        <th mat-header-cell *matHeaderCellDef>Qualification</th>
        <td mat-cell *matCellDef="let p" style="font-size:0.79rem;color:#475569">
          {{p.qualification || "—"}}
          <div *ngIf="p.experienceYears" class="p-sub">{{p.experienceYears}} yrs exp.</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="competency">
        <th mat-header-cell *matHeaderCellDef>Competency <span class="cl">Cl.6.2.3</span></th>
        <td mat-cell *matCellDef="let p">
          <span class="cbadge" [class]="cc(p.competencyStatus)">{{p.competencyStatus || "NOT ASSESSED"}}</span>
          <div *ngIf="p.nextCompetencyReview" class="p-sub" [class.overdue-text]="isOverdue(p.nextCompetencyReview)">
            Review: {{p.nextCompetencyReview | date:"dd MMM yy"}}
          </div>
        </td>
      </ng-container>

      <ng-container matColumnDef="supervision">
        <th mat-header-cell *matHeaderCellDef>Supervision <span class="cl">Cl.6.2.5d</span></th>
        <td mat-cell *matCellDef="let p">
          <span class="sbadge2" [class]="sl(p.supervisionLevel)">{{p.supervisionLevel || "—"}}</span>
          <div *ngIf="p.supervisedBy" class="p-sub">By: {{p.supervisedBy}}</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="authorisation">
        <th mat-header-cell *matHeaderCellDef>Authorisation <span class="cl">Cl.6.2.5e</span></th>
        <td mat-cell *matCellDef="let p">
          <div *ngIf="p.authorisedDate" style="font-size:0.77rem;color:#0D1B3E">
            {{p.authorisedDate | date:"dd MMM yyyy"}}
          </div>
          <div *ngIf="p.authorisationExpiry" class="p-sub" [class.overdue-text]="isOverdue(p.authorisationExpiry)">
            Expires: {{p.authorisationExpiry | date:"dd MMM yy"}}
          </div>
          <div *ngIf="!p.authorisedDate" class="p-sub">Not authorised</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let p">
          <span class="stbadge" [class]="ps(p.status)">{{p.status}}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let p">
          <button mat-icon-button (click)="print(p)" matTooltip="Print personnel record" style="color:#0891B2">
            <mat-icon style="font-size:17px">picture_as_pdf</mat-icon>
          </button>
          <button mat-icon-button (click)="edit(p)" matTooltip="Edit record">
            <mat-icon style="font-size:17px;color:#94A3B8">edit</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let r; columns:cols"></tr>
    </table>

    <div *ngIf="!staff.length" class="empty">
      <mat-icon>people</mat-icon>
      <p>No staff registered.<br>Click <strong>Add Staff</strong> to begin.</p>
    </div>
  </div>
</div>

<!-- ═══ DIALOG ═══ -->
<div *ngIf="showDialog" class="overlay" (click)="closeDialog()">
<div class="sheet" (click)="$event.stopPropagation()">

  <div class="sh-hdr">
    <div>
      <h3>{{editItem?.id ? "Edit Personnel Record" : "Register Staff Member"}}</h3>
      <p>ISO 17025:2017 · Clause 6.2 — Personnel competence and authorisation</p>
    </div>
    <button class="ib" (click)="closeDialog()"><mat-icon>close</mat-icon></button>
  </div>

  <!-- Tabs -->
  <div class="tabs">
    <button *ngFor="let t of tabs; let i=index" class="tab" [class.on]="activeTab===i" (click)="activeTab=i">
      <mat-icon>{{t.ic}}</mat-icon>{{t.lbl}}<span class="ctag">{{t.cl}}</span>
    </button>
  </div>

  <div class="sh-body" *ngIf="pForm">
    <form [formGroup]="pForm">

      <!-- TAB 0 — IDENTITY -->
      <div *ngIf="activeTab===0">
        <div class="banner blue"><mat-icon>info_outline</mat-icon>
          <span><strong>Cl. 6.2.1</strong> — All personnel, internal or external, who could influence laboratory activities must be documented and act impartially.</span>
        </div>
        <div class="fr">
          <div class="fc">
            <div class="lbl-row"><label class="fl">Employee ID <span class="rq">*</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Unique identifier assigned by the lab — e.g. EMP-001. Used on all training and authorisation records. Cannot be changed after creation.</span></span></div>
            <input class="fi" formControlName="empId" [readonly]="!!editItem?.id" placeholder=""/>
          </div>
          <div class="fc">
            <div class="lbl-row"><label class="fl">Employee Type <span class="it">Cl.6.2.1</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.1 — All personnel who could influence laboratory activities must be documented, whether internal (permanent), external (visiting expert), or contract (temporary).</span></span></div>
            <select class="fs" formControlName="employeeType">
              <option value="INTERNAL">Internal — permanent staff</option>
              <option value="EXTERNAL">External — visiting expert</option>
              <option value="CONTRACT">Contract — temporary</option>
            </select>
          </div>
        </div>
        <div class="ff">
          <div class="lbl-row"><label class="fl">Full Name <span class="rq">*</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Full legal name as it appears on official documents and test certificates. This name will appear on reports and authorisation records.</span></span></div>
          <input class="fi" formControlName="fullName" placeholder=""/>
        </div>
        <div class="fr">
          <div class="fc">
            <div class="lbl-row"><label class="fl">Designation / Job Title <span class="rq">*</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Official job title as per appointment letter — e.g. Senior Analyst, Laboratory Manager, Technical Officer. Used in authorisation records and test certificates.</span></span></div>
            <input class="fi" formControlName="designation" placeholder=""/>
          </div>
          <div class="fc">
            <label class="fl">Department</label>
            <select class="fs" formControlName="department">
              <option *ngFor="let d of departments" [value]="d">{{d}}</option>
            </select>
          </div>
        </div>
        <div class="fr">
          <div class="fc">
            <label class="fl">Email</label>
            <input class="fi" formControlName="email" type="email" placeholder="name@lab.com"/>
          </div>
          <div class="fc">
            <label class="fl">Phone</label>
            <input class="fi" formControlName="phone" placeholder="+91 9XXXXXXXXX"/>
          </div>
        </div>
        <div class="fr">
          <div class="fc">
            <label class="fl">Date of Joining</label>
            <input class="fi" formControlName="joinedDate" type="date"/>
          </div>
          <div class="fc">
            <label class="fl">Employment Status</label>
            <select class="fs" formControlName="status">
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive / Left</option>
            </select>
          </div>
        </div>
      </div>

      <!-- TAB 1 — COMPETENCE (Cl. 6.2.2 & 6.2.3) -->
      <div *ngIf="activeTab===1">
        <div class="banner blue"><mat-icon>school</mat-icon>
          <span><strong>Cl. 6.2.2</strong> — Document competence requirements for each function. <strong>Cl. 6.2.3</strong> — Ensure personnel are competent to perform activities and evaluate deviations.</span>
        </div>

        <div class="sdiv">Education & qualifications <span class="itl">Cl. 6.2.2</span></div>
        <div class="fr">
          <div class="fc">
            <div class="lbl-row"><label class="fl">Highest Qualification</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.2 — Highest academic qualification relevant to the role, e.g. M.Sc Chemistry, B.E. Instrumentation, Ph.D. Microbiology.</span></span></div>
            <input class="fi" formControlName="qualification" placeholder=""/>
          </div>
          <div class="fc">
            <div class="lbl-row"><label class="fl">Years of Relevant Experience</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Total years of relevant laboratory or technical experience. Include only experience directly applicable to the current role.</span></span></div>
            <input class="fi" formControlName="experienceYears" type="number" min="0" placeholder=""/>
          </div>
        </div>
        <div class="ff">
          <div class="lbl-row"><label class="fl">Technical Knowledge <span class="it">Cl.6.2.2</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.2 — Specific technical knowledge relevant to the role: instruments operated, analytical methods known, standards familiar with (ISO, ASTM), software skills, uncertainty estimation experience.</span></span></div>
          <textarea class="fta" formControlName="technicalKnowledge" rows="3"
            placeholder=""></textarea>
        </div>
        <div class="ff">
          <div class="lbl-row"><label class="fl">Skills & Competencies <span class="it">Cl.6.2.2</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.2 — Practical skills: instrument operation and basic maintenance, standard solution preparation, data analysis, internal auditing, etc.</span></span></div>
          <textarea class="fta" formControlName="skills" rows="3"
            placeholder=""></textarea>
        </div>
        <div class="ff">
          <div class="lbl-row"><label class="fl">Competence Requirements for this Role <span class="rq-col">Cl.6.2.2</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.2 — Minimum requirements for education, qualification, training, technical knowledge, skills and experience needed to perform this function. Assessors will check that the person meets these requirements.</span></span></div>
          <textarea class="fta" formControlName="competenceRequirements" rows="3"
            placeholder=""></textarea>
        </div>

        <div class="sdiv">Competency assessment <span class="itl">Cl. 6.2.3</span></div>
        <div class="fr">
          <div class="fc">
            <div class="lbl-row"><label class="fl">Competency Status</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.3 — Current assessed status. Competent = independently verified able to perform assigned activities. Under Supervision = working towards competency. Requires Training = identified gap needs addressing.</span></span></div>
            <select class="fs" formControlName="competencyStatus">
              <option value="COMPETENT">Competent — assessed and authorised</option>
              <option value="UNDER_SUPERVISION">Under Supervision — not yet independent</option>
              <option value="REQUIRES_TRAINING">Requires Training — gap identified</option>
              <option value="NOT_YET_ASSESSED">Not Yet Assessed</option>
            </select>
          </div>
        </div>
        <div class="fr">
          <div class="fc">
            <div class="lbl-row"><label class="fl">Assessment Date</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.3 — Date competency was formally assessed. Assessment methods may include: practical demonstration, written test, witnessed test, review of proficiency test results.</span></span></div>
            <input class="fi" formControlName="competencyAssessedDate" type="date"/>
          </div>
          <div class="fc">
            <div class="lbl-row"><label class="fl">Assessed By</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Name and designation of the person who carried out the competency assessment — typically the Lab Manager, Technical Manager, or Quality Officer.</span></span></div>
            <input class="fi" formControlName="competencyAssessedBy" placeholder=""/>
          </div>
        </div>
        <div class="fr">
          <div class="fc">
            <label class="fl">Last Competency Review</label>
            <input class="fi" formControlName="lastCompetencyReview" type="date"/>
          </div>
          <div class="fc">
            <div class="lbl-row"><label class="fl">Next Competency Review Due <span class="it">Cl.6.2.5f</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.5(f) — Monitoring competence of personnel. Typically annual review. Triggered by: new methods, equipment changes, proficiency test failures, customer complaints, or extended absence.</span></span></div>
            <input class="fi" formControlName="nextCompetencyReview" type="date"/>
          </div>
        </div>
        <div class="ff">
          <div class="lbl-row"><label class="fl">Competency Notes / Gaps <span class="it">Cl.6.2.5f</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.5(f) — Record competency monitoring observations: proficiency test performance, identified skill gaps, training actions taken, and outcomes of re-assessment.</span></span></div>
          <textarea class="fta" formControlName="competencyNotes" rows="3"
            placeholder=""></textarea>
        </div>
      </div>

      <!-- TAB 2 — DUTIES & SUPERVISION (Cl. 6.2.4 & 6.2.5d) -->
      <div *ngIf="activeTab===2">
        <div class="banner blue"><mat-icon>assignment_ind</mat-icon>
          <span><strong>Cl. 6.2.4</strong> — Management shall communicate duties, responsibilities and authorities. <strong>Cl. 6.2.5(d)</strong> — Supervision of personnel shall be documented.</span>
        </div>

        <div class="sdiv">Duties & responsibilities <span class="itl">Cl. 6.2.4</span></div>
        <div class="fr">
          <div class="fc">
            <div class="lbl-row"><label class="fl">Job Description Reference <span class="it">Cl.6.2.4</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.4 — Reference to the documented job description in the QMS document control system, e.g. JD-ANALYST-001. The job description must document duties, responsibilities and authorities.</span></span></div>
            <input class="fi" formControlName="jobDescriptionRef" placeholder=""/>
            <span class="fh">Reference to the documented job description in the QMS</span>
          </div>
          <div class="fc">
            <div class="lbl-row"><label class="fl">Reports To</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Name and designation of the direct line manager. Establishes the chain of responsibility and supervision as required by Cl. 6.2.4.</span></span></div>
            <input class="fi" formControlName="reportingTo" placeholder=""/>
          </div>
        </div>
        <div class="ff">
          <div class="lbl-row"><label class="fl">Key Responsibilities <span class="it">Cl.6.2.4</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.4 — Document the duties and responsibilities formally communicated to this person. Assessors will verify that staff are aware of their own responsibilities. List the main functions clearly.</span></span></div>
          <textarea class="fta" formControlName="responsibilities" rows="4"
            placeholder=""></textarea>
        </div>

        <div class="sdiv">Supervision <span class="itl">Cl. 6.2.5(d)</span></div>
        <div class="fr">
          <div class="fc">
            <div class="lbl-row"><label class="fl">Supervision Level <span class="it">Cl.6.2.5d</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.5(d) — Current supervision requirement. Independent: no oversight needed for routine work. Supervised: outputs reviewed by senior. Trainee: direct oversight required for all activities.</span></span></div>
            <select class="fs" formControlName="supervisionLevel">
              <option value="INDEPENDENT">Independent — works without supervision</option>
              <option value="SUPERVISED">Supervised — works under oversight</option>
              <option value="TRAINEE">Trainee — requires direct supervision</option>
            </select>
          </div>
          <div class="fc">
            <div class="lbl-row"><label class="fl">Supervised By</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Name of the supervisor responsible for overseeing this person's laboratory activities. Required when supervision level is Supervised or Trainee.</span></span></div>
            <input class="fi" formControlName="supervisedBy" placeholder=""/>
          </div>
        </div>
      </div>

      <!-- TAB 3 — AUTHORISATION (Cl. 6.2.5e & 6.2.6) -->
      <div *ngIf="activeTab===3">
        <div class="banner blue"><mat-icon>verified_user</mat-icon>
          <span><strong>Cl. 6.2.5(e)</strong> — Authorisation of personnel. <strong>Cl. 6.2.6</strong> — Laboratory shall authorise personnel for specific activities: method development, result analysis, report review and authorisation.</span>
        </div>

        <div class="sdiv">Authorisation details <span class="itl">Cl. 6.2.5(e) · Cl. 6.2.6</span></div>
        <div class="fr">
          <div class="fc">
            <div class="lbl-row"><label class="fl">Authorisation Date</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.5(e) — Date on which management formally authorised this person to perform laboratory activities. Authorisation must be given before the person independently performs authorised activities.</span></span></div>
            <input class="fi" formControlName="authorisedDate" type="date"/>
          </div>
          <div class="fc">
            <div class="lbl-row"><label class="fl">Authorised By</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Name and designation of the person who granted authorisation — typically the Laboratory Manager or Technical Manager. This person accepts responsibility for the authorisation decision.</span></span></div>
            <input class="fi" formControlName="authorisedBy" placeholder=""/>
          </div>
        </div>
        <div class="fr">
          <div class="fc">
            <div class="lbl-row"><label class="fl">Authorisation Expiry Date</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Date when the current authorisation expires and must be renewed. Typically 12 months. Authorisation should be reviewed when: methods change, equipment changes, or competency concerns arise.</span></span></div>
            <input class="fi" formControlName="authorisationExpiry" type="date"/>
            <span class="fh">Authorisation should be periodically reviewed — typically annual</span>
          </div>
        </div>

        <div class="ff">
          <div class="lbl-row"><label class="fl">Authorised Activities <span class="rq-col">Cl. 6.2.6</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2.6 — List specific activities authorised per sub-clause: (a) method development/modification/validation, (b) analysis of results including conformity statements, (c) report review and authorisation. Be specific — assessors cross-reference this list against signed test reports.</span></span></div>
          <textarea class="fta" formControlName="authorisedActivities" rows="6"
            placeholder=""></textarea>
          <span class="fh">Be specific — assessors will verify that activities performed match authorisations on file</span>
        </div>

        <div class="info-box">
          <mat-icon>info</mat-icon>
          <div>
            <strong>NABL requirement</strong>
            <p>During assessment, NABL assessors will cross-reference this authorisation list against actual test reports and calibration records signed by this person. Ensure activities performed are explicitly listed above.</p>
          </div>
        </div>
      </div>

    </form>
  </div>

  <div class="sh-ftr">
    <div class="pdots">
      <span *ngFor="let t of tabs; let i=index" class="pd" [class.on]="i<=activeTab"></span>
      <span style="font-size:0.73rem;color:#94A3B8;margin-left:8px">{{activeTab+1}} / {{tabs.length}}</span>
    </div>
    <div style="display:flex;gap:8px">
      <button class="bg" (click)="closeDialog()">Cancel</button>
      <button *ngIf="activeTab>0" class="bg" (click)="activeTab=activeTab-1"><mat-icon>arrow_back</mat-icon> Back</button>
      <button *ngIf="activeTab<tabs.length-1" class="bop" (click)="activeTab=activeTab+1">Next <mat-icon>arrow_forward</mat-icon></button>
      <button *ngIf="activeTab===tabs.length-1" class="bp" (click)="save()"><mat-icon>save</mat-icon> Save Record</button>
    </div>
  </div>

</div>
</div>
`,
  styles: [`
    .page-wrap{padding:24px;max-width:1400px;margin:0 auto}
    .page-header{margin-bottom:18px}.page-header h2{font-size:1.25rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.page-header p{font-size:0.76rem;color:#94A3B8;margin:0}
    .toolbar-row{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
    .search-box{position:relative;flex:0 0 280px}.si{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;width:18px;height:18px;color:#94A3B8}
    .si-inp{width:100%;height:40px;padding:0 12px 0 36px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;outline:none;font-family:inherit;box-sizing:border-box}
    .si-inp:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1)}
    .toolbar-spacer{flex:1}
    .ns{height:40px;padding:0 28px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;cursor:pointer;outline:none}
    .btn-p{display:inline-flex;align-items:center;gap:6px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 16px;font-size:0.84rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p:hover{background:#0E7490}.btn-p mat-icon{font-size:18px;width:18px;height:18px}
    /* Table */
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .p-name{font-size:0.84rem;font-weight:600;color:#0D1B3E}
    .p-sub{font-size:0.69rem;color:#94A3B8;margin-top:1px}
    .emp-type{font-size:0.62rem;font-weight:600;background:#FEF9C3;color:#92400E;padding:1px 6px;border-radius:4px;margin-top:2px;display:inline-block}
    .overdue-text{color:#EF4444 !important;font-weight:600}
    .id-chip{font-size:0.72rem;font-weight:600;background:#EDE9FE;color:#5B21B6;padding:2px 8px;border-radius:6px}
    .dept-chip{font-size:0.72rem;font-weight:600;background:#E0F2FE;color:#075985;padding:2px 8px;border-radius:6px}
    .cl{font-size:0.58rem;background:#F1F5F9;color:#94A3B8;padding:1px 5px;border-radius:4px;margin-left:4px;font-weight:600}
    .cbadge{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .cbadge.comp{background:#DCFCE7;color:#166534}.cbadge.sup{background:#E0F2FE;color:#075985}
    .cbadge.train{background:#FEF9C3;color:#92400E}.cbadge.none{background:#F1F5F9;color:#64748b}
    .sbadge2{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .sbadge2.ind{background:#DCFCE7;color:#166534}.sbadge2.sup2{background:#E0F2FE;color:#075985}.sbadge2.tr{background:#FEF9C3;color:#92400E}.sbadge2.def{background:#F1F5F9;color:#64748b}
    .stbadge{font-size:0.7rem;font-weight:600;padding:3px 9px;border-radius:20px}
    .stbadge.act{background:#DCFCE7;color:#166534}.stbadge.lea{background:#FEF9C3;color:#92400E}.stbadge.ina{background:#F1F5F9;color:#64748b}
    .empty{text-align:center;padding:60px;color:#94A3B8}.empty mat-icon{font-size:48px;width:48px;height:48px;display:block;margin:0 auto 12px}.empty p{font-size:0.84rem;line-height:1.6}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:780px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.71rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}.ib:hover{background:#F1F5F9}
    .tabs{display:flex;border-bottom:1px solid #E2E8F0;overflow-x:auto;padding:0 22px}
    .tab{display:flex;align-items:center;gap:5px;padding:11px 12px;background:transparent;border:none;border-bottom:2px solid transparent;cursor:pointer;font-size:0.76rem;font-weight:600;color:#94A3B8;white-space:nowrap;margin-bottom:-1px;font-family:inherit;transition:color .15s,border-color .15s}
    .tab mat-icon{font-size:14px;width:14px;height:14px}
    .tab .ctag{font-size:0.59rem;background:#F1F5F9;color:#94A3B8;padding:1px 5px;border-radius:4px;margin-left:2px}
    .tab.on{color:#0891B2;border-bottom-color:#0891B2}.tab.on .ctag{background:#EFF6FF;color:#3B82F6}
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 280px)}
    /* Banners */
    .banner{display:flex;align-items:flex-start;gap:8px;border-radius:8px;padding:10px 13px;font-size:0.76rem;line-height:1.5;margin-bottom:15px}
    .banner mat-icon{font-size:15px;width:15px;height:15px;flex-shrink:0;margin-top:1px}
    .banner.blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF}.banner.blue mat-icon{color:#3B82F6}
    .sdiv{font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;padding:12px 0 8px;border-top:1px solid #F1F5F9;margin-top:6px;display:flex;align-items:center;gap:8px}
    .itl{font-size:0.62rem;background:#EFF6FF;color:#3B82F6;padding:2px 6px;border-radius:4px;text-transform:none;font-weight:600}
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:block;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}.rq-col{font-size:0.62rem;color:#F59E0B;text-transform:none;font-weight:500;margin-left:4px}
    .it{font-size:0.59rem;background:#EFF6FF;color:#3B82F6;padding:1px 5px;border-radius:4px;margin-left:3px;text-transform:none;font-weight:600}
    .fi,.fs,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}
    .fi,.fs{height:40px;padding:0 12px}.fta{padding:9px 12px;resize:vertical}
    .fi:focus,.fs:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
    .fh{font-size:0.65rem;color:#94A3B8;margin-top:2px;display:block;line-height:1.4}
    .info-box{display:flex;gap:10px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px 14px;font-size:0.78rem;color:#166534;margin-top:12px}
    .info-box mat-icon{font-size:18px;width:18px;height:18px;flex-shrink:0;color:#16A34A;margin-top:1px}
    .info-box strong{display:block;margin-bottom:3px}.info-box p{margin:0;font-size:0.73rem;opacity:.8}
    /* Footer */
    .sh-ftr{display:flex;align-items:center;justify-content:space-between;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .pdots{display:flex;align-items:center;gap:5px}.pd{width:8px;height:8px;border-radius:50%;background:#E2E8F0;transition:background .2s}.pd.on{background:#0891B2}
    .bp,.bop,.bg{display:inline-flex;align-items:center;gap:4px;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}
    .bp{background:#0891B2;color:#fff;border:none}.bp:hover{background:#0E7490}.bp mat-icon{font-size:16px;width:16px;height:16px}
    .bop{background:transparent;color:#0891B2;border:1.5px solid #0891B2}.bop mat-icon{font-size:15px;width:15px;height:15px}
    .bg{background:transparent;color:#64748b;border:1.5px solid #E2E8F0}.bg:hover{border-color:#94A3B8}.bg mat-icon{font-size:15px;width:15px;height:15px}
    /* Info tooltip */
    .lbl-row{display:flex;align-items:center;gap:5px;margin-bottom:4px}
    .lbl-row .fl{margin-bottom:0}
    .tip-wrap{position:relative;display:inline-flex;align-items:center}
    .tip-ic{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:#DBEAFE;color:#1D4ED8;font-size:10px;font-weight:700;cursor:default;flex-shrink:0;font-style:normal;line-height:1;font-family:var(--font-sans);border:1px solid #BFDBFE}
    .tip-wrap{position:relative;display:inline-flex;align-items:center}
    .tip-wrap:hover .tip-box{opacity:1;pointer-events:auto}
    .tip-box{position:fixed;background:#1E293B;color:#F1F5F9;font-size:0.72rem;line-height:1.55;padding:9px 12px;border-radius:8px;width:270px;z-index:9999;opacity:0;pointer-events:none;transition:opacity .15s;font-weight:400;white-space:normal;box-shadow:0 4px 16px rgba(0,0,0,.35);top:var(--tip-y,0);left:var(--tip-x,0)}
  `]
})
export class PersonnelComponent implements OnInit {
  cols = ["empId","fullName","department","qualification","competency","supervision","authorisation","status","actions"];
  staff: any[] = [];
  statCards: any[] = [];
  search = ""; filterDept = ""; filterCompetency = "";
  showDialog = false; editItem: any = null; activeTab = 0;
  pForm!: FormGroup;

  departments = ["Chemistry Lab","Physics Lab","Microbiology","Environmental Lab","QC Department","Calibration","Management","Administration"];

  tabs = [
    { lbl:"Identity",       ic:"badge",          cl:"Cl.6.2.1"  },
    { lbl:"Competence",     ic:"school",         cl:"Cl.6.2.2-3"},
    { lbl:"Duties",         ic:"assignment_ind", cl:"Cl.6.2.4-5"},
    { lbl:"Authorisation",  ic:"verified_user",  cl:"Cl.6.2.6"  },
  ];

  constructor(private api: ApiService, private snack: MatSnackBar, private fb: FormBuilder) {}
  ngOnInit() { this.loadStaff(); this.loadStats(); }

  loadStats() {
    this.api.get<any>("/personnel/stats").subscribe({
      next: s => {
        this.statCards = [
          { label:"Total Staff",        value:s.total       ??0, icon:"people",         color:"#5B21B6", bg:"#EDE9FE" },
          { label:"Active",             value:s.active      ??0, icon:"how_to_reg",     color:"#10B981", bg:"#DCFCE7" },
          { label:"On Leave",           value:s.onLeave     ??0, icon:"event_busy",     color:"#F59E0B", bg:"#FEF3C7" },
          { label:"Training Overdue",   value:s.trainingOverdue??0, icon:"warning",     color:"#EF4444", bg:"#FEE2E2" },
        ];
      }, error: () => {}
    });
  }

  loadStaff() {
    this.api.get<any>("/personnel", {
      q: this.search || null,
      department: this.filterDept || null,
      status: null,
      page: 0, size: 100
    }).subscribe({
      next: r => { this.staff = r.content ?? r; },
      error: e => { if (e.status !== 401) this.snack.open("Failed to load", "✕"); }
    });
  }

  openNew() { this.editItem = {}; this.activeTab = 0; this.buildForm({}); this.showDialog = true; }
  edit(p: any) { this.editItem = {...p}; this.activeTab = 0; this.buildForm(p); this.showDialog = true; }
  closeDialog() { this.showDialog = false; this.editItem = null; }

  buildForm(p: any) {
    this.pForm = this.fb.group({
      empId:                  [p.empId || "", Validators.required],
      employeeType:           [p.employeeType || "INTERNAL"],
      fullName:               [p.fullName || "", Validators.required],
      designation:            [p.designation || "", Validators.required],
      department:             [p.department || this.departments[0]],
      email:                  [p.email || ""],
      phone:                  [p.phone || ""],
      joinedDate:             [p.joinedDate || ""],
      status:                 [p.status || "ACTIVE"],
      qualification:          [p.qualification || ""],
      competenceRequirements: [p.competenceRequirements || ""],
      technicalKnowledge:     [p.technicalKnowledge || ""],
      skills:                 [p.skills || ""],
      experienceYears:        [p.experienceYears || ""],
      competencyStatus:       [p.competencyStatus || "NOT_YET_ASSESSED"],
      competencyAssessedDate: [p.competencyAssessedDate || ""],
      competencyAssessedBy:   [p.competencyAssessedBy || ""],
      lastCompetencyReview:   [p.lastCompetencyReview || ""],
      nextCompetencyReview:   [p.nextCompetencyReview || ""],
      competencyNotes:        [p.competencyNotes || ""],
      jobDescriptionRef:      [p.jobDescriptionRef || ""],
      responsibilities:       [p.responsibilities || ""],
      reportingTo:            [p.reportingTo || ""],
      supervisionLevel:       [p.supervisionLevel || "SUPERVISED"],
      supervisedBy:           [p.supervisedBy || ""],
      authorisedDate:         [p.authorisedDate || ""],
      authorisedBy:           [p.authorisedBy || ""],
      authorisationExpiry:    [p.authorisationExpiry || ""],
      authorisedActivities:   [p.authorisedActivities || ""],
    });
  }

  save() {
    if (this.pForm.invalid) {
      this.activeTab = 0; this.pForm.markAllAsTouched();
      this.snack.open("Fill required fields on Identity tab", "✕", { duration: 3000 }); return;
    }
    this.api.post("/personnel", this.pForm.value).subscribe({
      next: () => { this.snack.open("Saved ✓", ""); this.closeDialog(); this.loadStaff(); this.loadStats(); },
      error: () => this.snack.open("Error saving", "✕")
    });
  }

  isOverdue(d: string): boolean { return !!d && new Date(d) < new Date(); }

  cc(s: string): string {
    if (!s) return "none";
    if (s === "COMPETENT") return "comp";
    if (s === "UNDER_SUPERVISION") return "sup";
    if (s === "REQUIRES_TRAINING") return "train";
    return "none";
  }
  sl(s: string): string {
    if (!s) return "def";
    if (s === "INDEPENDENT") return "ind";
    if (s === "SUPERVISED") return "sup2";
    if (s === "TRAINEE") return "tr";
    return "def";
  }
  ps(s: string): string {
    if (s === "ACTIVE") return "act";
    if (s === "ON_LEAVE") return "lea";
    return "ina";
  }

  tipPos(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const box = el.querySelector('.tip-box') as HTMLElement;
    if (!box) return;
    const r = el.getBoundingClientRect();
    const tx = Math.min(r.left, window.innerWidth - 280);
    const ty = r.bottom + 6;
    box.style.top  = ty + 'px';
    box.style.left = tx + 'px';
  }
  print(p: any) { this.api.printPdf("/print/personnel/" + p.empId); }
}
