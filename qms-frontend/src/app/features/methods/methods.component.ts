import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-methods", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Method Register</h2>
    <p>ISO 17025:2017 · Clause 7.2 — Selection, verification and validation of methods</p>
  </div>

  <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="stat-card" *ngFor="let c of statCards">
      <div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div>
      <div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div>
    </div>
  </div>

  <div class="toolbar-row">
    <div class="search-box">
      <mat-icon class="si">search</mat-icon>
      <input class="si-inp" [(ngModel)]="search" (input)="load()" placeholder="Search method ID, title, parameter…"/>
    </div>
    <select class="ns" [(ngModel)]="filterType" (change)="load()">
      <option value="">All types</option>
      <option value="STANDARD">Standard method</option>
      <option value="IN_HOUSE">In-house method</option>
      <option value="MODIFIED">Modified standard</option>
    </select>
    <select class="ns" [(ngModel)]="filterStatus" (change)="load()">
      <option value="">All status</option>
      <option value="ACTIVE">Active</option>
      <option value="UNDER_REVIEW">Under review</option>
      <option value="WITHDRAWN">Withdrawn</option>
    </select>
    <div class="toolbar-spacer"></div>
    <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> Add Method</button>
  </div>

  <!-- Validation due warning -->
  <div class="warn-banner" *ngIf="reviewDueCount > 0">
    <mat-icon>schedule</mat-icon>
    <span><strong>{{reviewDueCount}} method{{reviewDueCount>1?"s":""}} due for review.</strong>
      Methods must be periodically reviewed to ensure they remain fit for purpose — Cl. 7.2.1.1.</span>
  </div>

  <div class="tcard">
    <table class="htbl">
      <thead>
        <tr>
          <th>Method ID</th>
          <th>Title / Parameter</th>
          <th>Type <span class="cl">Cl.7.2.1</span></th>
          <th>Standard Ref.</th>
          <th>Matrix</th>
          <th>Validation <span class="cl">Cl.7.2.2</span></th>
          <th>Accreditation</th>
          <th>Working Range</th>
          <th>Review Due</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let m of methods" [class.row-review]="isOverdue(m.reviewDate)">
          <td><span class="id-chip">{{m.methodId}}</span></td>
          <td>
            <div class="m-title">{{m.title}}</div>
            <div class="m-sub">{{m.parameter}}</div>
          </td>
          <td><span class="type-badge" [class]="mt(m.methodType)">{{m.methodType?.replace('_',' ')}}</span></td>
          <td class="mono-sm">{{m.standardRef || "—"}}</td>
          <td class="muted">{{m.matrix || "—"}}</td>
          <td>
            <span class="val-badge" [class]="vs(m.validationStatus)">
              {{m.validationStatus?.replace('_',' ') || "—"}}
            </span>
            <div *ngIf="m.validationDate" class="m-sub">{{m.validationDate | date:"dd MMM yyyy"}}</div>
          </td>
          <td><span class="acc-badge" [class]="m.accreditationStatus">{{m.accreditationStatus}}</span></td>
          <td class="muted">{{m.workingRange || "—"}}</td>
          <td>
            <span [class.overdue-text]="isOverdue(m.reviewDate)">
              {{(m.reviewDate | date:"dd MMM yyyy") || "—"}}
            </span>
          </td>
          <td>
            <button class="icon-btn" (click)="edit(m)"><mat-icon style="font-size:16px;color:#94A3B8">edit</mat-icon></button>
          </td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!methods.length" class="empty">
      <mat-icon>science</mat-icon>
      <p>No methods registered yet.<br>Click <strong>Add Method</strong> to begin building your method register.</p>
    </div>
  </div>
</div>

<!-- ═══ METHOD DIALOG ═══ -->
<div *ngIf="showDialog" class="overlay" (click)="closeDialog()">
<div class="sheet" (click)="$event.stopPropagation()">

  <div class="sh-hdr">
    <div>
      <h3>{{editItem?.id ? "Edit Method" : "Register Method"}}</h3>
      <p>ISO 17025:2017 · Clause 7.2 — Method selection, verification and validation</p>
    </div>
    <button class="ib" (click)="closeDialog()"><mat-icon>close</mat-icon></button>
  </div>

  <div class="tabs">
    <button *ngFor="let t of tabs; let i=index" class="tab" [class.on]="activeTab===i" (click)="activeTab=i">
      <mat-icon>{{t.ic}}</mat-icon>{{t.lbl}}<span class="ctag">{{t.cl}}</span>
    </button>
  </div>

  <div class="sh-body">

    <!-- TAB 0 — METHOD IDENTITY Cl.7.2.1 -->
    <div *ngIf="activeTab===0">
      <div class="banner blue"><mat-icon>info_outline</mat-icon>
        <span><strong>Cl. 7.2.1</strong> — The laboratory shall use appropriate methods for all laboratory activities. Methods include sampling, handling, transport, storage, preparation and testing of items.</span>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Method ID <span class="rq">*</span></label>
          <input class="fi" [(ngModel)]="form.methodId" [readonly]="!!editItem?.id"/>
        </div>
        <div class="fc">
          <label class="fl">Method Type <span class="rq">*</span></label>
          <select class="fs" [(ngModel)]="form.methodType">
            <option value="STANDARD">Standard method — published IS/ISO/ASTM/BS</option>
            <option value="IN_HOUSE">In-house developed method</option>
            <option value="MODIFIED">Modified standard method</option>
          </select>
        </div>
      </div>
      <div class="ff">
        <label class="fl">Method Title <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.title"/>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Standard Reference <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Full reference including year — e.g. IS 3025 (Part 11):1983, ISO 5667-3:2018, ASTM D1293-18. Must match exactly what appears on the NABL scope certificate.</span></span></label>
          <input class="fi" [(ngModel)]="form.standardRef"/>
        </div>
        <div class="fc">
          <label class="fl">Accreditation Status</label>
          <select class="fs" [(ngModel)]="form.accreditationStatus">
            <option value="ACCREDITED">Accredited — in NABL scope</option>
            <option value="PENDING">Pending — applied for</option>
            <option value="INTERNAL_ONLY">Internal only — not in scope</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Parameter Measured <span class="rq">*</span></label>
          <input class="fi" [(ngModel)]="form.parameter"/>
        </div>
        <div class="fc">
          <label class="fl">Matrix / Sample Type</label>
          <input class="fi" [(ngModel)]="form.matrix"/>
        </div>
      </div>
      <div class="ff">
        <label class="fl">Scope Statement <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 7.2.1 — Define the scope of the method: what it measures, in what sample types, at what concentration range, and under what conditions. This appears in your NABL application.</span></span></label>
        <textarea class="fta" rows="3" [(ngModel)]="form.scope"></textarea>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">SOP Reference <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Reference to the internal SOP or work instruction that implements this method in your laboratory. e.g. SOP-CHEM-001. This document must be controlled per Cl. 8.3.</span></span></label>
          <input class="fi" [(ngModel)]="form.sopReference"/>
        </div>
        <div class="fc">
          <label class="fl">Responsible Person</label>
          <input class="fi" [(ngModel)]="form.responsiblePerson"/>
        </div>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Effective Date</label>
          <input class="fi" type="date" [(ngModel)]="form.effectiveDate"/>
        </div>
        <div class="fc">
          <label class="fl">Next Review Date</label>
          <input class="fi" type="date" [(ngModel)]="form.reviewDate"/>
        </div>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Status</label>
          <select class="fs" [(ngModel)]="form.status">
            <option value="ACTIVE">Active</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </div>
      <div class="ff">
        <label class="fl">Applicable To <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Which tests, certificates, or departments use this method. Assessors will cross-check that methods on test certificates exist in this register.</span></span></label>
        <textarea class="fta" rows="2" [(ngModel)]="form.applicableTo"></textarea>
      </div>
      <div class="ff">
        <label class="fl">Basis for Method Selection <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 7.2.1 — Document why this method was selected: regulatory requirement, customer specification, international standard, fitness for purpose. Required for in-house and modified methods especially.</span></span></label>
        <textarea class="fta" rows="2" [(ngModel)]="form.selectionBasis"></textarea>
      </div>
    </div>

    <!-- TAB 1 — VALIDATION / VERIFICATION Cl.7.2.2 -->
    <div *ngIf="activeTab===1">
      <div class="banner blue"><mat-icon>verified</mat-icon>
        <span><strong>Cl. 7.2.2</strong> — Standard methods require verification before use. In-house and modified methods require full validation. Performance characteristics must be recorded.</span>
      </div>

      <div class="fr">
        <div class="fc">
          <label class="fl">Activity Type <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Verification = confirming a published standard method performs as specified in your lab. Validation = full demonstration that an in-house or modified method is fit for purpose.</span></span></label>
          <select class="fs" [(ngModel)]="form.validationType">
            <option value="VERIFICATION">Verification — standard method, confirm in lab</option>
            <option value="VALIDATION">Validation — in-house or modified method</option>
          </select>
        </div>
        <div class="fc">
          <label class="fl">Status</label>
          <select class="fs" [(ngModel)]="form.validationStatus">
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="NOT_DONE">Not Done</option>
          </select>
        </div>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Date Completed</label>
          <input class="fi" type="date" [(ngModel)]="form.validationDate"/>
        </div>
        <div class="fc">
          <label class="fl">Validated / Verified By</label>
          <input class="fi" [(ngModel)]="form.validatedBy"/>
        </div>
      </div>
      <div class="ff">
        <label class="fl">Validation / Verification Report Reference <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Document reference for the full validation/verification report in your document control system. Assessors will ask to see this report. e.g. VAL-RPT-001.</span></span></label>
        <input class="fi" [(ngModel)]="form.validationRef"/>
      </div>

      <div class="sdiv">Parameters validated / verified <span class="itl">Cl. 7.2.2</span></div>
      <div class="check-grid">
        <div class="check-row"><input type="checkbox" id="vl" [(ngModel)]="form.valLinearity"/><label for="vl" class="ck-lbl">Linearity</label></div>
        <div class="check-row"><input type="checkbox" id="vp" [(ngModel)]="form.valPrecision"/><label for="vp" class="ck-lbl">Precision / Repeatability</label></div>
        <div class="check-row"><input type="checkbox" id="va" [(ngModel)]="form.valAccuracy"/><label for="va" class="ck-lbl">Accuracy / Trueness</label></div>
        <div class="check-row"><input type="checkbox" id="vs2" [(ngModel)]="form.valSelectivity"/><label for="vs2" class="ck-lbl">Selectivity / Specificity</label></div>
        <div class="check-row"><input type="checkbox" id="vd" [(ngModel)]="form.valLodLoq"/><label for="vd" class="ck-lbl">LOD / LOQ</label></div>
        <div class="check-row"><input type="checkbox" id="vr" [(ngModel)]="form.valRuggedness"/><label for="vr" class="ck-lbl">Ruggedness / Robustness</label></div>
        <div class="check-row"><input type="checkbox" id="vu" [(ngModel)]="form.valUncertainty"/><label for="vu" class="ck-lbl">Measurement Uncertainty</label></div>
      </div>
    </div>

    <!-- TAB 2 — PERFORMANCE CHARACTERISTICS -->
    <div *ngIf="activeTab===2">
      <div class="banner blue"><mat-icon>analytics</mat-icon>
        <span><strong>Cl. 7.2.2</strong> — Record the performance characteristics established during validation/verification. These values are used in uncertainty budgets and must match the reported results.</span>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Working Range <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">The concentration or measurement range over which the method has been validated and gives reliable results. Results outside this range must not be reported without justification.</span></span></label>
          <input class="fi" [(ngModel)]="form.workingRange"/>
        </div>
        <div class="fc">
          <label class="fl">Limit of Detection (LOD) <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Smallest measurable quantity that can be distinguished from blank/noise with defined statistical confidence. Typically 3σ of blank signal.</span></span></label>
          <input class="fi" [(ngModel)]="form.lod"/>
        </div>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Limit of Quantitation (LOQ) <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Smallest quantity that can be measured with acceptable precision and accuracy. Typically 10σ of blank signal. Results below LOQ should be reported as < LOQ.</span></span></label>
          <input class="fi" [(ngModel)]="form.loq"/>
        </div>
        <div class="fc">
          <label class="fl">Precision (RSD %) <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Relative Standard Deviation from repeatability study — multiple analyses of same sample under same conditions. e.g. RSD < 2% at 10 mg/L. Required for uncertainty estimation.</span></span></label>
          <input class="fi" [(ngModel)]="form.precisionRsd"/>
        </div>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Bias / Recovery (%) <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Systematic error — measured value vs true value. e.g. Recovery 98–102% from certified reference material. Used as a Type B uncertainty component.</span></span></label>
          <input class="fi" [(ngModel)]="form.biasPercent"/>
        </div>
        <div class="fc">
          <label class="fl">Expanded Uncertainty (k=2) <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Combined expanded measurement uncertainty at 95% confidence level (k=2). This value must be reported on test certificates per Cl. 7.8.6. e.g. ± 0.05 mg/L at 10 mg/L (k=2, ~95%).</span></span></label>
          <input class="fi" [(ngModel)]="form.uncertaintyK2"/>
        </div>
      </div>
    </div>

    <!-- TAB 3 — EQUIPMENT & DEVIATIONS Cl.7.2.1.5 -->
    <div *ngIf="activeTab===3">
      <div class="banner blue"><mat-icon>build</mat-icon>
        <span><strong>Cl. 7.2.1.5</strong> — Deviations from documented methods are only permitted if documented, technically justified, and authorised. <strong>Cl. 7.2.1.6</strong> — Inform customers of the method used.</span>
      </div>
      <div class="ff">
        <label class="fl">Required Equipment <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">List all equipment required by this method. Cross-references to Equipment Register (EQ IDs). Assessors verify the equipment exists, is calibrated, and assigned to authorised personnel.</span></span></label>
        <textarea class="fta" rows="4" [(ngModel)]="form.requiredEquipment"></textarea>
      </div>
      <div class="ff">
        <label class="fl">Required Reagents / Reference Materials <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Critical reagents, standards and reference materials required. Include CRM details, supplier, purity grade, and storage conditions where relevant.</span></span></label>
        <textarea class="fta" rows="4" [(ngModel)]="form.requiredReagents"></textarea>
      </div>
      <div class="ff">
        <label class="fl">Approved Deviations from Method <span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 7.2.1.5 — Any deviations from the published method must be technically justified, approved by the Technical Manager, documented here, and communicated to the customer. e.g. "Sample digestion time extended from 30 to 45 min — approved by TM on 01 Jan 2024, Ref: DEV-001."</span></span></label>
        <textarea class="fta" rows="4" [(ngModel)]="form.deviationsApproved"></textarea>
      </div>
      <div class="ff">
        <label class="fl">Notes</label>
        <textarea class="fta" rows="2" [(ngModel)]="form.notes"></textarea>
      </div>
    </div>

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
      <button *ngIf="activeTab===tabs.length-1" class="bp" (click)="save()"><mat-icon>save</mat-icon> Save Method</button>
    </div>
  </div>

</div>
</div>
`,
  styles: [`
    .page-wrap{padding:24px;max-width:1400px;margin:0 auto}
    .page-header{margin-bottom:18px}.page-header h2{font-size:1.25rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.page-header p{font-size:0.76rem;color:#94A3B8;margin:0}
    .toolbar-row{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
    .search-box{position:relative;flex:0 0 260px}.si{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;width:18px;height:18px;color:#94A3B8}
    .si-inp{width:100%;height:40px;padding:0 12px 0 36px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;outline:none;font-family:inherit;box-sizing:border-box}
    .si-inp:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1)}
    .toolbar-spacer{flex:1}
    .ns{height:40px;padding:0 28px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;cursor:pointer;outline:none}
    .btn-p{display:inline-flex;align-items:center;gap:5px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 14px;font-size:0.83rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p:hover{background:#0E7490}.btn-p mat-icon{font-size:17px;width:17px;height:17px}
    .warn-banner{display:flex;align-items:center;gap:10px;background:#FEF9C3;border:1px solid #FDE68A;border-radius:10px;padding:12px 16px;font-size:0.81rem;color:#92400E;margin-bottom:14px}
    .warn-banner mat-icon{color:#F59E0B;flex-shrink:0}
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .htbl{width:100%;border-collapse:collapse}
    .htbl th{text-align:left;padding:10px 14px;font-size:0.66rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;white-space:nowrap}
    .htbl td{padding:9px 14px;border-bottom:1px solid #F1F5F9;font-size:0.81rem;vertical-align:middle}
    .htbl tr:last-child td{border-bottom:none}.htbl tr:hover td{background:#F8FAFC}
    .row-review td{background:#FFFBEB}
    .cl{font-size:0.58rem;background:#F1F5F9;color:#94A3B8;padding:1px 4px;border-radius:3px;margin-left:3px;font-weight:600}
    .m-title{font-size:0.84rem;font-weight:600;color:#0D1B3E}
    .m-sub{font-size:0.69rem;color:#94A3B8;margin-top:1px}
    .muted{color:#64748b;font-size:0.79rem}
    .mono-sm{font-family:monospace;font-size:0.74rem;color:#475569}
    .overdue-text{color:#EF4444;font-weight:600}
    .id-chip{font-size:0.71rem;font-weight:600;background:#F0FDF4;color:#166534;padding:2px 8px;border-radius:6px}
    .type-badge{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase}
    .type-badge.STANDARD{background:#DCFCE7;color:#166534}
    .type-badge.IN_HOUSE,.type-badge.IN{background:#EDE9FE;color:#4C1D95}
    .type-badge.MODIFIED{background:#FEF9C3;color:#92400E}
    .val-badge{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase}
    .val-badge.COMPLETED{background:#DCFCE7;color:#166534}
    .val-badge.IN_PROGRESS,.val-badge.IN{background:#E0F2FE;color:#075985}
    .val-badge.NOT_DONE,.val-badge.NOT{background:#FEE2E2;color:#991B1B}
    .acc-badge{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase}
    .acc-badge.ACCREDITED{background:#DCFCE7;color:#166534}
    .acc-badge.PENDING{background:#FEF9C3;color:#92400E}
    .acc-badge.INTERNAL_ONLY{background:#F1F5F9;color:#64748b}
    .acc-badge.WITHDRAWN{background:#FEE2E2;color:#991B1B}
    .icon-btn{background:transparent;border:none;cursor:pointer;display:inline-flex;align-items:center;padding:4px;border-radius:6px}.icon-btn:hover{background:#F1F5F9}
    .empty{text-align:center;padding:60px;color:#94A3B8}.empty mat-icon{font-size:48px;width:48px;height:48px;display:block;margin:0 auto 12px}.empty p{font-size:0.84rem;line-height:1.6}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:780px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.71rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}.ib:hover{background:#F1F5F9}
    .tabs{display:flex;border-bottom:1px solid #E2E8F0;overflow-x:auto;padding:0 22px}
    .tab{display:flex;align-items:center;gap:5px;padding:11px 13px;background:transparent;border:none;border-bottom:2px solid transparent;cursor:pointer;font-size:0.76rem;font-weight:600;color:#94A3B8;white-space:nowrap;margin-bottom:-1px;font-family:inherit;transition:color .15s,border-color .15s}
    .tab mat-icon{font-size:14px;width:14px;height:14px}
    .tab .ctag{font-size:0.59rem;background:#F1F5F9;color:#94A3B8;padding:1px 5px;border-radius:4px;margin-left:2px}
    .tab.on{color:#0891B2;border-bottom-color:#0891B2}.tab.on .ctag{background:#EFF6FF;color:#3B82F6}
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 280px)}
    .sh-ftr{display:flex;align-items:center;justify-content:space-between;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .banner{display:flex;align-items:flex-start;gap:8px;border-radius:8px;padding:10px 13px;font-size:0.76rem;line-height:1.5;margin-bottom:15px}
    .banner mat-icon{font-size:15px;width:15px;height:15px;flex-shrink:0;margin-top:1px}
    .banner.blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF}.banner.blue mat-icon{color:#3B82F6}
    .sdiv{font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;padding:12px 0 8px;border-top:1px solid #F1F5F9;margin-top:6px;display:flex;align-items:center;gap:8px}
    .itl{font-size:0.62rem;background:#EFF6FF;color:#3B82F6;padding:2px 6px;border-radius:4px;text-transform:none;font-weight:600}
    .check-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px}
    .check-row{display:flex;align-items:center;gap:8px}
    .ck-lbl{font-size:0.81rem;color:var(--color-text-secondary, #475569);cursor:pointer}
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:inline-flex;align-items:center;gap:5px;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}
    .fi,.fs,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}
    .fi,.fs{height:40px;padding:0 12px}.fta{padding:9px 12px;resize:vertical}
    .fi:focus,.fs:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
    /* Tooltip */
    .tip-wrap{position:relative;display:inline-flex;align-items:center}
    .tip-ic{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:#DBEAFE;color:#1D4ED8;font-size:10px;font-weight:700;cursor:default;flex-shrink:0;font-style:normal;line-height:1;border:1px solid #BFDBFE}
    .tip-wrap:hover .tip-box{opacity:1;pointer-events:auto}
    .tip-box{position:fixed;background:#1E293B;color:#F1F5F9;font-size:0.72rem;line-height:1.55;padding:9px 12px;border-radius:8px;width:270px;z-index:9999;opacity:0;pointer-events:none;transition:opacity .15s;font-weight:400;white-space:normal;box-shadow:0 4px 16px rgba(0,0,0,.35)}
    .pdots{display:flex;align-items:center;gap:5px}.pd{width:8px;height:8px;border-radius:50%;background:#E2E8F0;transition:background .2s}.pd.on{background:#0891B2}
    .bp,.bop,.bg{display:inline-flex;align-items:center;gap:4px;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}
    .bp{background:#0891B2;color:#fff;border:none}.bp:hover{background:#0E7490}.bp mat-icon{font-size:16px;width:16px;height:16px}
    .bop{background:transparent;color:#0891B2;border:1.5px solid #0891B2}.bop mat-icon{font-size:15px;width:15px;height:15px}
    .bg{background:transparent;color:#64748b;border:1.5px solid #E2E8F0}.bg:hover{border-color:#94A3B8}.bg mat-icon{font-size:15px;width:15px;height:15px}
  `]
})
export class MethodsComponent implements OnInit {
  methods: any[] = [];
  statCards: any[] = [];
  search = ""; filterType = ""; filterStatus = "";
  reviewDueCount = 0;
  showDialog = false; editItem: any = null; activeTab = 0;
  form: any = {};

  tabs = [
    { lbl:"Method Identity",    ic:"science",    cl:"Cl.7.2.1"   },
    { lbl:"Validation",         ic:"verified",   cl:"Cl.7.2.2"   },
    { lbl:"Performance",        ic:"analytics",  cl:"Cl.7.2.2"   },
    { lbl:"Equipment & Limits", ic:"build",      cl:"Cl.7.2.1.5" },
  ];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); this.loadStats(); }

  loadStats() {
    this.api.get<any>("/methods/stats").subscribe({
      next: s => {
        this.statCards = [
          { label:"Total Methods",   value:s.total     ??0, icon:"science",      color:"#5B21B6", bg:"#EDE9FE" },
          { label:"Active",          value:s.active    ??0, icon:"check_circle", color:"#10B981", bg:"#DCFCE7" },
          { label:"Validated",       value:s.validated ??0, icon:"verified",     color:"#0891B2", bg:"#E0F2FE" },
          { label:"NABL Accredited", value:s.accredited??0, icon:"workspace_premium", color:"#F59E0B", bg:"#FEF3C7" },
        ];
      }, error: () => {}
    });
  }

  load() {
    this.api.get<any[]>("/methods", {
      q: this.search || null,
      type: this.filterType || null,
      status: this.filterStatus || null
    }).subscribe({
      next: r => {
        this.methods = r;
        this.reviewDueCount = r.filter((m: any) => this.isOverdue(m.reviewDate)).length;
      },
      error: e => { if (e.status !== 401) this.snack.open("Failed to load", "✕"); }
    });
  }

  openNew() {
    this.editItem = null; this.activeTab = 0;
    this.form = {
      methodType: "STANDARD", status: "ACTIVE",
      accreditationStatus: "PENDING",
      validationType: "VERIFICATION", validationStatus: "NOT_DONE"
    };
    this.showDialog = true;
  }

  edit(m: any) {
    this.editItem = m; this.activeTab = 0;
    this.form = { ...m };
    this.showDialog = true;
  }

  closeDialog() { this.showDialog = false; this.editItem = null; }

  save() {
    if (!this.form.methodId || !this.form.title || !this.form.parameter) {
      this.activeTab = 0;
      this.snack.open("Method ID, Title and Parameter are required", "✕", { duration: 3000 }); return;
    }
    this.api.post("/methods", this.form).subscribe({
      next: () => {
        this.snack.open("Method saved ✓", "");
        this.closeDialog();
        this.load(); this.loadStats();
      },
      error: () => this.snack.open("Error saving", "✕")
    });
  }

  isOverdue(d: string): boolean { return !!d && new Date(d) < new Date(); }

  mt(t: string): string { return t || ""; }
  vs(s: string): string { return s?.replace("_"," ") ? s : ""; }

  tipPos(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const box = el.querySelector(".tip-box") as HTMLElement;
    if (!box) return;
    const r = el.getBoundingClientRect();
    box.style.top  = (r.bottom + 6) + "px";
    box.style.left = Math.min(r.left, window.innerWidth - 280) + "px";
  }
}
