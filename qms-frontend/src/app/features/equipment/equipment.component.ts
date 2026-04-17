import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-equipment", standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule,
            MatPaginatorModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
<div class="page-wrap">

  <div class="page-header">
    <h2>Equipment & Calibration</h2>
    <p>ISO 17025:2017 · Clause 6.4 — Equipment records per Cl. 6.4.13(a–h)</p>
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
      <input class="si-inp" [(ngModel)]="search" (ngModelChange)="load()" placeholder="Search ID, name, serial number…"/>
    </div>
    <select class="ns" [(ngModel)]="filterStatus" (ngModelChange)="load()">
      <option value="">All Status</option>
      <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
    </select>
    <div class="toolbar-spacer"></div>
    <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> Add Equipment</button>
  </div>

  <div class="tcard">
    <table mat-table [dataSource]="equipment">
      <ng-container matColumnDef="eqId">
        <th mat-header-cell *matHeaderCellDef>EQ ID</th>
        <td mat-cell *matCellDef="let e">
          <span class="id-chip" style="background:#EFF6FF;color:#1D4ED8;font-size:0.75rem">{{e.eqId}}</span>
          <div *ngIf="e.calLabelNo" style="font-size:0.62rem;color:#94A3B8;margin-top:2px">Label: {{e.calLabelNo}}</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Equipment</th>
        <td mat-cell *matCellDef="let e">
          <div style="font-weight:600;font-size:0.84rem;color:#0D1B3E">{{e.name}}</div>
          <div style="font-size:0.71rem;color:#94A3B8">{{e.make}} {{e.model}}<span *ngIf="e.serialNo"> · S/N: {{e.serialNo}}</span></div>
          <div *ngIf="e.measRange" style="font-size:0.68rem;color:#3B82F6;margin-top:1px">Range: {{e.measRange}}</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="location">
        <th mat-header-cell *matHeaderCellDef>Location</th>
        <td mat-cell *matCellDef="let e" style="font-size:0.81rem">
          {{e.location || '—'}}
          <div *ngIf="e.assignedTo" style="font-size:0.69rem;color:#94A3B8">{{e.assignedTo}}</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let e">
          <span class="sbadge" [class]="sc(e.status)">{{e.status || '—'}}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="calibration">
        <th mat-header-cell *matHeaderCellDef>Calibration</th>
        <td mat-cell *matCellDef="let e">
          <div style="font-size:0.73rem;color:#64748b"><span style="color:#94A3B8">Last: </span>{{(e.lastCal|date:'dd MMM yy')||'—'}}</div>
          <div class="ncal" [class.ov]="isOverdue(e.nextCal)" [class.ds]="!isOverdue(e.nextCal)&&isSoon(e.nextCal)">
            <mat-icon *ngIf="isOverdue(e.nextCal)||isSoon(e.nextCal)" style="font-size:11px;width:11px;height:11px">{{isOverdue(e.nextCal)?'warning':'schedule'}}</mat-icon>
            <span style="color:#94A3B8">Next: </span>{{(e.nextCal|date:'dd MMM yy')||'—'}}
          </div>
          <div *ngIf="e.calCertNo" style="font-size:0.63rem;color:#3B82F6;margin-top:1px">Cert: {{e.calCertNo}}</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="calSource">
        <th mat-header-cell *matHeaderCellDef>Cal. Source</th>
        <td mat-cell *matCellDef="let e" style="font-size:0.77rem;color:#475569">
          {{e.calSource || '—'}}
          <div *ngIf="e.sopReference" style="font-size:0.65rem;color:#94A3B8">SOP: {{e.sopReference}}</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let e">
          <button mat-icon-button (click)="print(e)" matTooltip="Print Calibration Record" style="color:#0891B2">
            <mat-icon style="font-size:17px">picture_as_pdf</mat-icon>
          </button>
          <button mat-icon-button (click)="edit(e)" matTooltip="Edit Equipment Record">
            <mat-icon style="font-size:17px;color:#94A3B8">edit</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let r; columns:cols" [class.row-ov]="isOverdue(r.nextCal)"></tr>
    </table>

    <div *ngIf="!equipment.length" class="empty">
      <mat-icon>build_circle</mat-icon>
      <p>No equipment registered.<br>Click <strong>Add Equipment</strong> to begin.</p>
    </div>
    <mat-paginator [length]="total" [pageSize]="15" [pageSizeOptions]="[10,15,25]" (page)="onPage($event)"/>
  </div>
</div>

<!-- ═══ DIALOG ═══ -->
<div *ngIf="showDialog" class="overlay" (click)="closeDialog()">
<div class="sheet" (click)="$event.stopPropagation()">

  <div class="sh-hdr">
    <div>
      <h3>{{editEq?.id ? 'Edit Equipment Record' : 'Register Equipment'}}</h3>
      <p>ISO 17025:2017 · Clause 6.4.13 — Complete equipment record</p>
    </div>
    <button class="ib" (click)="closeDialog()"><mat-icon>close</mat-icon></button>
  </div>

  <div class="tabs">
    <button *ngFor="let t of tabs; let i=index" class="tab" [class.on]="activeTab===i" (click)="activeTab=i">
      <mat-icon>{{t.ic}}</mat-icon>{{t.lbl}}<span class="ctag">{{t.cl}}</span>
    </button>
  </div>

  <div class="sh-body" *ngIf="eqForm">
    <form [formGroup]="eqForm">

      <!-- TAB 0 — IDENTITY Cl.6.4.13(a)(b) -->
      <div *ngIf="activeTab===0">
        <div class="banner blue"><mat-icon>badge</mat-icon>
          <span><strong>Cl. 6.4.13(a)(b)</strong> — Identity, manufacturer name, type identification and serial number of equipment</span>
        </div>
        <div class="fr"><div class="fc">
          <div class="lbl-row"><label class="fl">Equipment ID <span class="rq">*</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Unique lab reference assigned to this instrument — e.g. EQ-BAL-001. Used on all calibration certificates, maintenance records and test reports. Cannot be changed after creation.</span></span></div>
          <input class="fi" formControlName="eqId" placeholder="" [readonly]="!!editEq?.id"/>
        </div><div class="fc">
          <div class="lbl-row"><label class="fl">Cal. Label / Sticker No. <span class="it">Cl.6.4.8</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.8 — The physical label or sticker affixed to the instrument showing its calibration status and validity period. Must allow users to readily identify calibration status. e.g. CAL-2024-001.</span></span></div>
          <input class="fi" formControlName="calLabelNo" placeholder=""/>
          <span class="fh">Label physically affixed to instrument showing cal. status</span>
        </div></div>

        <div class="ff">
          <div class="lbl-row"><label class="fl">Equipment Name / Description <span class="rq">*</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.13(a) — Common name of the instrument. Be specific — include the measurement type. e.g. Analytical Balance, pH Meter, UV-Vis Spectrophotometer, Digital Thermometer.</span></span></div>
          <input class="fi" formControlName="name" placeholder=""/>
        </div>

        <div class="fr"><div class="fc">
          <div class="lbl-row"><label class="fl">Manufacturer (Make) <span class="rq">*</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.13(b) — Name of the manufacturer as it appears on the instrument and calibration certificate, e.g. Sartorius, Mettler Toledo, Hanna Instruments, Thermo Fisher, Fluke.</span></span></div>
          <input class="fi" formControlName="make" placeholder=""/>
        </div><div class="fc">
          <div class="lbl-row"><label class="fl">Model / Type <span class="rq">*</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.13(b) — Model number or type designation exactly as on the nameplate and calibration certificate, e.g. ME204, HI99300, Fluke 1523. Needed to retrieve manufacturer specifications.</span></span></div>
          <input class="fi" formControlName="model" placeholder=""/>
        </div></div>

        <div class="fr"><div class="fc">
          <div class="lbl-row"><label class="fl">Serial Number <span class="rq">*</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.13(b) — Manufacturer's unique serial number from the nameplate. Links calibration certificates specifically to this physical unit — not just the model. Assessors will verify this matches the certificate.</span></span></div>
          <input class="fi" formControlName="serialNo" placeholder="Manufacturer's unique serial number"/>
          <span class="fh">Links calibration certificate to this specific instrument</span>
        </div><div class="fc">
          <div class="lbl-row"><label class="fl">Firmware / Software Version <span class="it">Cl.6.4.13a</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.13(a) — Current firmware or embedded software version. Important when firmware updates affect measurement behaviour — any firmware change should trigger re-verification and be logged as a MODIFICATION event.</span></span></div>
          <input class="fi" formControlName="firmwareVersion" placeholder=""/>
        </div></div>

        <div class="fr"><div class="fc">
          <div class="lbl-row"><label class="fl">Measurement Range <span class="it">Cl.6.4.5</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.5 — Full measurement range of the instrument, e.g. 0–220 g, 0–14 pH, –50 to +300°C. Used to verify equipment is suitable for the measurement task and for uncertainty budgets (Cl. 7.6).</span></span></div>
          <input class="fi" formControlName="measRange" placeholder=""/>
        </div><div class="fc">
          <div class="lbl-row"><label class="fl">Resolution / Least Count <span class="it">Cl.6.4.5</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.5 — Smallest increment the instrument can display, e.g. 0.1 mg, 0.01°C, 0.001 pH. This is a Type B uncertainty component used in measurement uncertainty calculations per EURACHEM/CITAC CG4.</span></span></div>
          <input class="fi" formControlName="resolution" placeholder=""/>
          <span class="fh">Required for measurement uncertainty budgets (Cl. 7.6)</span>
        </div></div>

        <div class="fr"><div class="fc">
          <label class="fl">Asset / Inventory Tag</label>
          <input class="fi" formControlName="assetTag" placeholder="Finance asset reference"/>
        </div><div class="fc">
          <div class="lbl-row"><label class="fl">SOP Reference <span class="it">Cl.6.4.3</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.3 — Reference to the Standard Operating Procedure or work instruction governing the use, handling, transport, storage and maintenance of this equipment. e.g. SOP-BAL-001.</span></span></div>
          <input class="fi" formControlName="sopReference" placeholder=""/>
          <span class="fh">Work instruction governing operation of this equipment</span>
        </div></div>

        <div class="fr"><div class="fc">
          <label class="fl">Purchase Date</label>
          <input class="fi" formControlName="purchaseDate" type="date"/>
        </div><div class="fc">
          <label class="fl">Commissioned / First Use Date</label>
          <input class="fi" formControlName="commissionedDate" type="date"/>
        </div></div>
      </div>

      <!-- TAB 1 — LOCATION & STATUS Cl.6.4.13(c)(d) -->
      <div *ngIf="activeTab===1">
        <div class="banner blue"><mat-icon>location_on</mat-icon>
          <span><strong>Cl. 6.4.13(c)(d)</strong> — Verification before service, current location. Equipment with expired calibration must be physically quarantined per Cl. 6.4.9.</span>
        </div>
        <div class="fr"><div class="fc">
          <label class="fl">Status <span class="rq">*</span></label>
          <select class="fs" formControlName="status">
            <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
          </select>
          <span class="fh">Must be physically labelled on the instrument per Cl. 6.4.8</span>
        </div><div class="fc">
          <div class="lbl-row"><label class="fl">Location <span class="rq">*</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.13(d) — Current physical location of the instrument. If the instrument is moved, this must be updated. e.g. Chemistry Lab – Bench 3, Calibration Room, Cold Room (4°C).</span></span></div>
          <input class="fi" formControlName="location" placeholder=""/>
        </div></div>

        <div class="fr"><div class="fc">
          <div class="lbl-row"><label class="fl">Assigned To / Authorised Operator <span class="it">Cl.6.2</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.2 — Name of the personnel authorised to operate this equipment. Only competent, trained personnel should operate critical measuring equipment. Cross-reference with personnel authorisation records.</span></span></div>
          <input class="fi" formControlName="assignedTo" placeholder=""/>
          <span class="fh">Only competent, trained personnel should operate critical equipment</span>
        </div></div>

        <div class="sdiv">Verification before placing into service <span class="itl">Cl. 6.4.13(c) · Cl. 6.4.4</span></div>

        <div class="fr"><div class="fc">
          <div class="lbl-row"><label class="fl">Verification Date</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.4 / 6.4.13(c) — Date equipment was verified to conform with specified requirements before being placed or returned into service. Required after repair, damage, or new installation.</span></span></div>
          <input class="fi" formControlName="verificationDate" type="date"/>
        </div><div class="fc">
          <div class="lbl-row"><label class="fl">Verified By</label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Name and designation of the person who performed or witnessed the verification. Typically the Technical Manager or Quality Officer. They accept responsibility for confirming the equipment meets requirements.</span></span></div>
          <input class="fi" formControlName="verificationBy" placeholder=""/>
        </div></div>

        <div class="ff">
          <div class="lbl-row"><label class="fl">Acceptance Criteria <span class="it">Cl.6.4.13e</span></label><span class="tip-wrap" (mouseenter)="tipPos($event)"><i class="tip-ic">i</i><span class="tip-box">Cl. 6.4.13(e) — Pass/fail limits used for intermediate checks and performance verification. e.g. Balance: ±0.1 mg tolerance. Thermometer: ±0.5°C. If intermediate check fails this criterion, the instrument must be taken out of service per Cl. 6.4.9.</span></span></div>
          <textarea class="fta" formControlName="acceptanceCriteria" rows="3"
            placeholder=""></textarea>
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
    .si-inp{width:100%;height:40px;padding:0 12px 0 36px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;color:#0F172A;outline:none;font-family:inherit;box-sizing:border-box}
    .si-inp:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1)}
    .toolbar-spacer{flex:1}
    .ns{height:40px;padding:0 28px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;color:#0F172A;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;cursor:pointer;outline:none}
    .bp,.bop,.bg{display:inline-flex;align-items:center;gap:4px;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s}
    .bp{background:#0891B2;color:#fff;border:none}.bp:hover{background:#0E7490}.bp mat-icon{font-size:16px;width:16px;height:16px}
    .bop{background:transparent;color:#0891B2;border:1.5px solid #0891B2}.bop mat-icon{font-size:15px;width:15px;height:15px}
    .bg{background:transparent;color:#64748b;border:1.5px solid #E2E8F0}.bg:hover{border-color:#94A3B8;color:#0F172A}.bg mat-icon{font-size:15px;width:15px;height:15px}
    .btn-p{display:inline-flex;align-items:center;gap:6px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 16px;font-size:0.84rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p:hover{background:#0E7490}.btn-p mat-icon{font-size:18px;width:18px;height:18px}
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .ncal{font-size:0.72rem;display:flex;align-items:center;gap:3px;color:#64748b;margin-top:1px}
    .ncal.ov{color:#EF4444;font-weight:600}.ncal.ds{color:#F59E0B;font-weight:600}
    .row-ov td{background:#FFF5F5 !important}
    .sbadge{display:inline-flex;align-items:center;font-size:0.7rem;font-weight:600;padding:3px 9px;border-radius:20px}
    .sbadge.cal{background:#DCFCE7;color:#166534}.sbadge.oos{background:#FEE2E2;color:#991B1B}
    .sbadge.due{background:#FEF9C3;color:#92400E}.sbadge.rep{background:#E0F2FE;color:#075985}.sbadge.def{background:#F1F5F9;color:#475569}
    .empty{text-align:center;padding:60px 20px;color:#94A3B8}.empty mat-icon{font-size:48px;width:48px;height:48px;margin-bottom:12px}.empty p{font-size:0.84rem;line-height:1.6}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:800px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
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
    .banner.warn{background:#FFFBEB;border:1px solid #FDE68A;color:#92400E}.banner.warn mat-icon{color:#F59E0B}
    /* Section divider */
    .sdiv{font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;padding:12px 0 8px;border-top:1px solid #F1F5F9;margin-top:6px;display:flex;align-items:center;gap:8px}
    .itl{font-size:0.63rem;background:#EFF6FF;color:#3B82F6;padding:2px 6px;border-radius:4px;text-transform:none;font-weight:600}
    /* Fields */
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:block;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}.it{font-size:0.59rem;background:#EFF6FF;color:#3B82F6;padding:1px 5px;border-radius:4px;margin-left:3px;text-transform:none;font-weight:600}
    .fi,.fs,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}
    .fi,.fs{height:40px;padding:0 12px}.fta{padding:9px 12px;resize:vertical}
    .fi:focus,.fs:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
    .fh{font-size:0.65rem;color:#94A3B8;margin-top:2px;display:block;line-height:1.4}
    .lbl-row{display:flex;align-items:center;gap:5px;margin-bottom:4px}
    .lbl-row .fl{margin-bottom:0}
    .tip-wrap{position:relative;display:inline-flex;align-items:center}
    .tip-ic{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:#DBEAFE;color:#1D4ED8;font-size:10px;font-weight:700;cursor:default;flex-shrink:0;font-style:normal;line-height:1;font-family:var(--font-sans);border:1px solid #BFDBFE}
    .tip-wrap{position:relative;display:inline-flex;align-items:center}
    .tip-wrap:hover .tip-box{opacity:1;pointer-events:auto}
    .tip-box{position:fixed;background:#1E293B;color:#F1F5F9;font-size:0.72rem;line-height:1.55;padding:9px 12px;border-radius:8px;width:270px;z-index:9999;opacity:0;pointer-events:none;transition:opacity .15s;font-weight:400;white-space:normal;box-shadow:0 4px 16px rgba(0,0,0,.35);top:var(--tip-y,0);left:var(--tip-x,0)}
    .ibox{display:flex;gap:10px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px 14px;font-size:0.78rem;color:#166534;margin-top:12px}
    .ibox mat-icon{font-size:18px;width:18px;height:18px;flex-shrink:0;color:#16A34A;margin-top:1px}
    .ibox strong{display:block;margin-bottom:3px}.ibox p{margin:0;font-size:0.73rem;opacity:.8}
    /* Footer */
    .sh-ftr{display:flex;align-items:center;justify-content:space-between;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .pdots{display:flex;align-items:center;gap:5px}.pd{width:8px;height:8px;border-radius:50%;background:#E2E8F0;transition:background .2s}.pd.on{background:#0891B2}
  `]
})
export class EquipmentComponent implements OnInit {
  cols = ["eqId","name","location","status","calibration","calSource","actions"];
  equipment: any[] = []; total = 0; page = 0;
  search = ""; filterStatus = "";
  showDialog = false; editEq: any = null; activeTab = 0;
  eqForm!: FormGroup; statCards: any[] = [];

  statuses = ["CALIBRATED","DUE SOON","OVERDUE","OUT OF SERVICE","UNDER REPAIR","DECOMMISSIONED","IN VERIFICATION"];
  locations = ["LAB-01","LAB-02","Chemistry Lab","Calibration Room","Cold Room","Instrument Room","QC Lab"];
  frequencies = ["1 month","3 months","6 months","12 months","18 months","24 months","As needed"];

  tabs = [
    { lbl:"Identity",          ic:"badge",       cl:"Cl.6.4.13a,b" },
    { lbl:"Location & Status", ic:"location_on", cl:"Cl.6.4.13c,d" },
  ];

  constructor(private api: ApiService, private snack: MatSnackBar, private fb: FormBuilder) {}
  ngOnInit() { this.load(); this.loadStats(); }

  loadStats() {
    this.api.get<any>("/equipment/stats").subscribe({
      next: s => { this.statCards = [
        { label:"Total",      value:s.total     ??0, icon:"build_circle", color:"#0891B2", bg:"#E0F2FE" },
        { label:"Calibrated", value:s.calibrated??0, icon:"verified",     color:"#10B981", bg:"#DCFCE7" },
        { label:"Due ≤30 days",value:s.dueSoon  ??0, icon:"schedule",     color:"#F59E0B", bg:"#FEF3C7" },
        { label:"Overdue",    value:s.overdue   ??0, icon:"warning",      color:"#EF4444", bg:"#FEE2E2" },
      ]}, error:()=>{}
    });
  }

  load() {
    this.api.get<any>("/equipment",{q:this.search||null,status:this.filterStatus||null,page:this.page,size:15}).subscribe({
      next:r=>{this.equipment=r.content??r;this.total=r.totalElements??r.length;},
      error:e=>{if(e.status!==401) this.snack.open("Failed to load","✕");}
    });
  }

  openNew() { this.editEq={}; this.activeTab=0; this.buildForm({}); this.showDialog=true; }
  edit(e:any){ this.editEq={...e}; this.activeTab=0; this.buildForm(e); this.showDialog=true; }
  closeDialog(){ this.showDialog=false; this.editEq=null; }

  buildForm(e:any){
    this.eqForm=this.fb.group({
      eqId:[e.eqId||"",Validators.required], name:[e.name||"",Validators.required],
      make:[e.make||"",Validators.required], model:[e.model||""], serialNo:[e.serialNo||"",Validators.required],
      firmwareVersion:[e.firmwareVersion||""], assetTag:[e.assetTag||""], sopReference:[e.sopReference||""],
      measRange:[e.measRange||""], resolution:[e.resolution||""],
      purchaseDate:[e.purchaseDate||""], commissionedDate:[e.commissionedDate||""],
      location:[e.location||"LAB-01",Validators.required], status:[e.status||"CALIBRATED"],
      calLabelNo:[e.calLabelNo||""], assignedTo:[e.assignedTo||""],
      verificationDate:[e.verificationDate||""], verificationBy:[e.verificationBy||""],
      acceptanceCriteria:[e.acceptanceCriteria||""],
      lastCal:[e.lastCal||""], nextCal:[e.nextCal||""],
      calFrequency:[e.calFrequency||"12 months"], calSource:[e.calSource||""],
      calCertNo:[e.calCertNo||""], calResult:[e.calResult||"PASS"],
      correctionFactor:[e.correctionFactor||""], traceabilityStmt:[e.traceabilityStmt||""],
      refMaterial:[e.refMaterial||""], refValidityDate:[e.refValidityDate||""],
      notes:[e.notes||""],
    });
  }

  save(){
    if(this.eqForm.invalid){this.activeTab=0;this.eqForm.markAllAsTouched();this.snack.open("Fill required fields on Identity tab","✕",{duration:3000});return;}
    this.api.post("/equipment",this.eqForm.value).subscribe({
      next:()=>{this.snack.open("Saved ✓","");this.closeDialog();this.load();this.loadStats();},
      error:()=>this.snack.open("Error saving","✕")
    });
  }

  onPage(e:PageEvent){this.page=e.pageIndex;this.load();}
  isOverdue(d:string):boolean{return !!d&&new Date(d)<new Date();}
  isSoon(d:string):boolean{if(!d)return false;const diff=new Date(d).getTime()-Date.now();return diff>0&&diff<30*86400000;}
  sc(s:string):string{
    if(!s)return"def";
    const m:Record<string,string>={"CALIBRATED":"cal","OUT OF SERVICE":"oos","OVERDUE":"oos","DUE SOON":"due","UNDER REPAIR":"rep","IN VERIFICATION":"rep","DECOMMISSIONED":"def"};
    return m[s]??"def";
  }
  print(e:any){this.api.printPdf("/print/equipment/"+e.eqId);}


  tipPos(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const box = el.querySelector('.tip-box') as HTMLElement;
    if (!box) return;
    const r = el.getBoundingClientRect();
    box.style.top  = (r.bottom + 6) + 'px';
    box.style.left = Math.min(r.left, window.innerWidth - 280) + 'px';
  }
}
