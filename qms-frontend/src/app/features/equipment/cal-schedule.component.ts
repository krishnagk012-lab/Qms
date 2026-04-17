import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-cal-schedule", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Calibration Schedule</h2>
    <p>ISO 17025:2017 · Clause 6.4.7 — All instruments sorted by next calibration due date</p>
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
      <input class="si-inp" [(ngModel)]="search" (input)="filterList()" placeholder="Search equipment…"/>
    </div>
    <select class="ns" [(ngModel)]="filterView" (change)="filterList()">
      <option value="all">All equipment</option>
      <option value="overdue">Overdue only</option>
      <option value="due30">Due within 30 days</option>
      <option value="due90">Due within 90 days</option>
    </select>
    <div class="toolbar-spacer"></div>
    <button class="btn-outline" (click)="api.printPdf('/print/document-register')">
      <mat-icon>picture_as_pdf</mat-icon> Print Schedule
    </button>
  </div>

  <div class="tcard">
    <div class="overdue-banner" *ngIf="overdueCount > 0">
      <mat-icon>warning</mat-icon>
      <span><strong>{{overdueCount}} instrument{{overdueCount>1?"s":""}} overdue for calibration.</strong>
        Per Cl. 6.4.9, these must be taken out of service until re-calibrated.</span>
    </div>

    <table class="eq-table">
      <thead>
        <tr>
          <th>EQ ID</th><th>Equipment</th><th>Location</th>
          <th>Last Calibration</th><th>Next Due</th>
          <th>Days Left</th><th>Status</th><th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let e of filtered"
            [class.row-overdue]="isOverdue(e.nextCal)"
            [class.row-soon]="!isOverdue(e.nextCal) && isSoon(e.nextCal)">
          <td><span class="id-chip">{{e.eqId}}</span></td>
          <td>
            <div class="eq-name">{{e.name}}</div>
            <div class="eq-sub">{{e.make}} {{e.model}}<span *ngIf="e.serialNo"> · {{e.serialNo}}</span></div>
          </td>
          <td class="muted">{{e.location || "—"}}</td>
          <td class="muted">{{(e.lastCal | date:"dd MMM yyyy") || "—"}}</td>
          <td>
            <div class="due-date" [class.overdue]="isOverdue(e.nextCal)" [class.soon]="!isOverdue(e.nextCal)&&isSoon(e.nextCal)">
              <mat-icon *ngIf="isOverdue(e.nextCal)" style="font-size:13px;width:13px;height:13px">warning</mat-icon>
              {{(e.nextCal | date:"dd MMM yyyy") || "Not set"}}
            </div>
          </td>
          <td><span class="days-badge" [class]="daysBadgeClass(e.nextCal)">{{daysLabel(e.nextCal)}}</span></td>
          <td><span class="sbadge" [class]="sc(e.status)">{{e.status}}</span></td>
          <td>
            <button class="log-btn" (click)="openLog(e)" matTooltip="Log calibration for this instrument">
              <mat-icon style="font-size:15px;width:15px;height:15px">add_circle</mat-icon>
              Log Cal.
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!filtered.length" class="empty">
      <mat-icon>event_available</mat-icon>
      <p>No equipment matches this filter.</p>
    </div>
  </div>
</div>

<!-- ═══ LOG CALIBRATION POPUP ═══ -->
<div *ngIf="showDialog" class="overlay" (click)="showDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">

  <div class="sh-hdr">
    <div>
      <h3>Log Calibration</h3>
      <p *ngIf="selectedEq">{{selectedEq.eqId}} — {{selectedEq.name}} · {{selectedEq.make}} {{selectedEq.model}}</p>
    </div>
    <button class="ib" (click)="showDialog=false"><mat-icon>close</mat-icon></button>
  </div>

  <!-- Instrument snapshot bar -->
  <div class="eq-snap" *ngIf="selectedEq">
    <div class="snap-item">
      <span class="snap-lbl">Location</span>
      <span class="snap-val">{{selectedEq.location || "—"}}</span>
    </div>
    <div class="snap-item">
      <span class="snap-lbl">Current status</span>
      <span class="sbadge" [class]="sc(selectedEq.status)" style="font-size:0.7rem">{{selectedEq.status}}</span>
    </div>
    <div class="snap-item">
      <span class="snap-lbl">Last calibrated</span>
      <span class="snap-val">{{(selectedEq.lastCal | date:"dd MMM yyyy") || "Never"}}</span>
    </div>
    <div class="snap-item">
      <span class="snap-lbl">Was due</span>
      <span class="snap-val" [class.ovd]="isOverdue(selectedEq.nextCal)">
        {{(selectedEq.nextCal | date:"dd MMM yyyy") || "—"}}
      </span>
    </div>
    <div class="snap-item" *ngIf="selectedEq.calFrequency">
      <span class="snap-lbl">Interval</span>
      <span class="snap-val">{{selectedEq.calFrequency}}</span>
    </div>
  </div>

  <div class="sh-body">

    <!-- Section: Calibration identity -->
    <div class="sec-head">Calibration record <span class="cl-tag">Cl. 6.4.13(e)</span></div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Calibration Date <span class="rq">*</span></label>
        <input class="fi" type="date" [(ngModel)]="form.eventDate"/>
      </div>
      <div class="fc">
        <label class="fl">Next Calibration Due <span class="rq">*</span></label>
        <input class="fi" type="date" [(ngModel)]="form.calDueDate"/>
      </div>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Certificate No. <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.calCertNo" placeholder="e.g. NABL/CAL/2024/00123"/>
        <span class="fh">Original must be retained on file — assessors will verify</span>
      </div>
      <div class="fc">
        <label class="fl">Calibrating Agency <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.calAgency" placeholder="e.g. CSIR-NPL, NABL lab name"/>
      </div>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Calibration Result <span class="rq">*</span></label>
        <select class="fs" [(ngModel)]="form.calResult">
          <option value="PASS">Pass — within tolerance</option>
          <option value="CONDITIONAL">Conditional — with correction factor</option>
          <option value="FAIL">Fail — out of tolerance</option>
        </select>
      </div>
      <div class="fc">
        <label class="fl">Performed By</label>
        <input class="fi" [(ngModel)]="form.performedBy" placeholder="Engineer name / agency"/>
      </div>
    </div>

    <!-- Section: Traceability -->
    <div class="sec-head" style="margin-top:4px">Metrological traceability <span class="cl-tag">Cl. 6.4.6</span></div>

    <div class="ff">
      <label class="fl">Traceability Statement <span class="rq">*</span></label>
      <textarea class="fta" rows="2" [(ngModel)]="form.traceability"
        placeholder="e.g. Calibration traceable to National Physical Laboratory (NPL), New Delhi through NABL-accredited calibration laboratory. Certificate no. NABL/CAL/2024/00123. Traceable to SI units via BIPM CIPM MRA."></textarea>
      <span class="fh">Certificate must explicitly state traceability — "calibrated" alone is insufficient for NABL</span>
    </div>

    <!-- Section: Results -->
    <div class="sec-head">Test results & corrections <span class="cl-tag">Cl. 6.4.11</span></div>

    <div class="ff">
      <label class="fl">Correction Factor / Adjustment Applied</label>
      <input class="fi" [(ngModel)]="form.correctionFactor"
        placeholder="e.g. +0.02 mg offset applied. Temperature correction: –0.03°C/°C. No correction required."/>
    </div>

    <div class="ff">
      <label class="fl">Calibration Results Summary</label>
      <textarea class="fta" rows="3" [(ngModel)]="form.description"
        placeholder="Summarise test points and results:&#10;e.g. 3-point calibration at 100g, 200g, 500g. Max deviation: +0.03g at 500g. All within ±0.1g tolerance. Certificate issued."></textarea>
    </div>

    <!-- Section: Reference materials -->
    <div class="sec-head">Reference materials <span class="cl-tag">Cl. 6.4.13(f)</span></div>
    <div class="ff">
      <label class="fl">Reference Material / Standard Used</label>
      <input class="fi" [(ngModel)]="form.refMaterial"
        placeholder="e.g. OIML Class E2 weights (set), NIST SRM 2031, pH 4.00 buffer (Merck Lot 123)"/>
    </div>

  </div>

  <div class="sh-ftr">
    <button class="bg" (click)="showDialog=false">Cancel</button>
    <button class="bp" (click)="save()">
      <mat-icon>save</mat-icon> Save Calibration
    </button>
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
    .btn-outline{display:inline-flex;align-items:center;gap:5px;background:transparent;color:#0891B2;border:1.5px solid #0891B2;border-radius:8px;height:40px;padding:0 14px;font-size:0.83rem;font-weight:600;cursor:pointer;font-family:inherit}
    .btn-outline mat-icon{font-size:16px;width:16px;height:16px}
    /* Table */
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .overdue-banner{display:flex;align-items:center;gap:10px;background:#FEF2F2;border-bottom:1px solid #FECACA;padding:12px 16px;font-size:0.82rem;color:#991B1B}
    .overdue-banner mat-icon{color:#EF4444;flex-shrink:0}
    .eq-table{width:100%;border-collapse:collapse}
    .eq-table th{text-align:left;padding:10px 14px;font-size:0.67rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;background:#F8FAFC;border-bottom:1px solid #E2E8F0}
    .eq-table td{padding:10px 14px;border-bottom:1px solid #F1F5F9;vertical-align:middle}
    .eq-table tr:last-child td{border-bottom:none}
    .row-overdue td{background:#FFF5F5}.row-soon td{background:#FFFBEB}
    .eq-name{font-size:0.84rem;font-weight:600;color:#0D1B3E}
    .eq-sub{font-size:0.71rem;color:#94A3B8;margin-top:1px}
    .muted{font-size:0.8rem;color:#64748b}
    .due-date{font-size:0.8rem;display:flex;align-items:center;gap:4px}
    .due-date.overdue{color:#EF4444;font-weight:600}.due-date.soon{color:#F59E0B;font-weight:600}
    .days-badge{font-size:0.7rem;font-weight:700;padding:3px 9px;border-radius:20px}
    .days-badge.green{background:#DCFCE7;color:#166534}.days-badge.amber{background:#FEF9C3;color:#92400E}.days-badge.red{background:#FEE2E2;color:#991B1B}.days-badge.gray{background:#F1F5F9;color:#64748b}
    .id-chip{font-size:0.74rem;font-weight:600;background:#EFF6FF;color:#1D4ED8;padding:2px 8px;border-radius:6px}
    .sbadge{display:inline-flex;align-items:center;font-size:0.7rem;font-weight:600;padding:3px 9px;border-radius:20px}
    .sbadge.cal{background:#DCFCE7;color:#166534}.sbadge.oos{background:#FEE2E2;color:#991B1B}
    .sbadge.due{background:#FEF9C3;color:#92400E}.sbadge.rep{background:#E0F2FE;color:#075985}.sbadge.def{background:#F1F5F9;color:#475569}
    .log-btn{display:inline-flex;align-items:center;gap:4px;background:#F0F9FF;color:#0891B2;border:1.5px solid #BAE6FD;border-radius:7px;padding:5px 10px;font-size:0.76rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .12s}
    .log-btn:hover{background:#E0F2FE}
    .empty{text-align:center;padding:50px;color:#94A3B8}.empty mat-icon{font-size:40px;width:40px;height:40px;display:block;margin:0 auto 12px}.empty p{font-size:0.84rem}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:680px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 12px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.72rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}.ib:hover{background:#F1F5F9}
    /* Instrument snapshot bar */
    .eq-snap{display:flex;gap:0;border-bottom:1px solid #E2E8F0;background:#F8FAFC;overflow-x:auto}
    .snap-item{display:flex;flex-direction:column;gap:2px;padding:10px 18px;border-right:1px solid #E2E8F0;white-space:nowrap}
    .snap-item:last-child{border-right:none}
    .snap-lbl{font-size:0.62rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.5px}
    .snap-val{font-size:0.82rem;font-weight:600;color:#0D1B3E}
    .snap-val.ovd{color:#EF4444}
    /* Form */
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 260px)}
    .sh-ftr{display:flex;justify-content:flex-end;gap:8px;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .sec-head{font-size:0.68rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.6px;padding:12px 0 8px;border-top:1px solid #F1F5F9;margin-top:4px;display:flex;align-items:center;gap:8px}
    .sec-head:first-child{border-top:none;margin-top:0;padding-top:0}
    .cl-tag{font-size:0.6rem;background:#EFF6FF;color:#3B82F6;padding:2px 6px;border-radius:4px;text-transform:none;font-weight:600}
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:block;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}
    .fi,.fs,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}
    .fi,.fs{height:40px;padding:0 12px}.fta{padding:9px 12px;resize:vertical}
    .fi:focus,.fs:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
    .fh{font-size:0.65rem;color:#94A3B8;margin-top:2px;display:block;line-height:1.4}
    .bg{display:inline-flex;align-items:center;gap:4px;background:transparent;color:#64748b;border:1.5px solid #E2E8F0;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}
    .bp{display:inline-flex;align-items:center;gap:4px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}.bp:hover{background:#0E7490}.bp mat-icon{font-size:16px;width:16px;height:16px}
  `]
})
export class CalScheduleComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  overdueCount = 0;
  statCards: any[] = [];
  search = ""; filterView = "all";
  showDialog = false;
  selectedEq: any = null;
  form: any = {};

  constructor(public api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.get<any>("/equipment", { size: 500 }).subscribe({
      next: r => {
        const items = (r.content ?? r) as any[];
        items.sort((a: any, b: any) => {
          if (!a.nextCal) return 1; if (!b.nextCal) return -1;
          return new Date(a.nextCal).getTime() - new Date(b.nextCal).getTime();
        });
        this.all = items;
        this.overdueCount = items.filter((e: any) => this.isOverdue(e.nextCal)).length;
        const soon = items.filter((e: any) => !this.isOverdue(e.nextCal) && this.isSoon(e.nextCal)).length;
        const cal  = items.filter((e: any) => e.status === "CALIBRATED").length;
        this.statCards = [
          { label:"Total",         value:items.length,        icon:"precision_manufacturing", color:"#0891B2", bg:"#E0F2FE" },
          { label:"Calibrated",    value:cal,                 icon:"verified",               color:"#10B981", bg:"#DCFCE7" },
          { label:"Due ≤ 30 days", value:soon,                icon:"schedule",               color:"#F59E0B", bg:"#FEF3C7" },
          { label:"Overdue",       value:this.overdueCount,   icon:"warning",                color:"#EF4444", bg:"#FEE2E2" },
        ];
        this.filterList();
      },
      error: () => this.snack.open("Failed to load", "✕")
    });
  }

  filterList() {
    let list = this.all.filter((e: any) =>
      !this.search || e.name?.toLowerCase().includes(this.search.toLowerCase())
        || e.eqId?.toLowerCase().includes(this.search.toLowerCase())
    );
    if (this.filterView === "overdue") list = list.filter((e: any) => this.isOverdue(e.nextCal));
    else if (this.filterView === "due30") list = list.filter((e: any) => this.isOverdue(e.nextCal) || this.isSoon(e.nextCal));
    else if (this.filterView === "due90") list = list.filter((e: any) => {
      if (!e.nextCal) return false;
      return (new Date(e.nextCal).getTime() - Date.now()) <= 90 * 86400000;
    });
    this.filtered = list;
  }

  openLog(e: any) {
    this.selectedEq = e;
    // Pre-fill next due based on calibration frequency
    const nextDue = this.suggestNextDue(e.calFrequency);
    this.form = {
      eventType:  "CALIBRATION",
      eventDate:  new Date().toISOString().slice(0, 10),
      calResult:  "PASS",
      calDueDate: nextDue,
      calAgency:  e.calSource || "",
    };
    this.showDialog = true;
  }

  suggestNextDue(freq: string): string {
    if (!freq) return "";
    const now = new Date();
    const m: Record<string, number> = {
      "1 month":1, "3 months":3, "6 months":6, "12 months":12,
      "18 months":18, "24 months":24, "5 years":60
    };
    const months = m[freq];
    if (!months) return "";
    now.setMonth(now.getMonth() + months);
    return now.toISOString().slice(0, 10);
  }

  save() {
    if (!this.form.eventDate || !this.form.calCertNo || !this.form.calAgency || !this.form.calDueDate) {
      this.snack.open("Fill all required fields", "✕", { duration: 3000 }); return;
    }
    if (!this.form.description) {
      this.form.description = "Calibration — Cert: " + this.form.calCertNo + " — " + this.form.calAgency;
    }
    this.api.post("/equipment/" + this.selectedEq.eqId + "/history", this.form).subscribe({
      next: () => {
        this.snack.open("Calibration logged ✓ — " + this.selectedEq.eqId, "");
        this.showDialog = false;
        this.load(); // refresh table with updated dates
      },
      error: () => this.snack.open("Error saving", "✕")
    });
  }

  isOverdue(d: string): boolean { return !!d && new Date(d) < new Date(); }
  isSoon(d: string): boolean {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff > 0 && diff < 30 * 86400000;
  }
  daysLabel(d: string): string {
    if (!d) return "Not set";
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    if (diff < 0)   return Math.abs(diff) + "d overdue";
    if (diff === 0) return "Due today";
    return "In " + diff + "d";
  }
  daysBadgeClass(d: string): string {
    if (!d) return "gray";
    const diff = (new Date(d).getTime() - Date.now()) / 86400000;
    if (diff < 0)   return "red";
    if (diff <= 30) return "amber";
    return "green";
  }
  sc(s: string): string {
    const m: Record<string,string> = { "CALIBRATED":"cal","OUT OF SERVICE":"oos","OVERDUE":"oos","DUE SOON":"due","UNDER REPAIR":"rep" };
    return m[s] ?? "def";
  }
}
