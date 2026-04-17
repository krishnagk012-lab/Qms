import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-cal-history", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Calibration History</h2>
    <p>ISO 17025:2017 · Clause 6.4.13(e)(f) — Complete calibration record for all instruments</p>
  </div>

  <!-- View toggle -->
  <div class="toolbar-row">
    <div class="search-box">
      <mat-icon class="si">search</mat-icon>
      <input class="si-inp" [(ngModel)]="search" (input)="filter()" placeholder="Search EQ ID, certificate, agency…"/>
    </div>
    <select class="ns" [(ngModel)]="filterEq" (change)="filter()">
      <option value="">All equipment</option>
      <option *ngFor="let e of equipList" [value]="e.eqId">{{e.eqId}} — {{e.name}}</option>
    </select>
    <select class="ns" [(ngModel)]="filterResult" (change)="filter()">
      <option value="">All results</option>
      <option value="PASS">Pass</option>
      <option value="CONDITIONAL">Conditional</option>
      <option value="FAIL">Fail</option>
    </select>
    <div class="view-toggle">
      <button [class.on]="view==='table'" (click)="view='table'">
        <mat-icon style="font-size:16px;width:16px;height:16px">table_rows</mat-icon> Table
      </button>
      <button [class.on]="view==='summary'" (click)="view='summary'">
        <mat-icon style="font-size:16px;width:16px;height:16px">summarize</mat-icon> By Instrument
      </button>
    </div>
    <div class="toolbar-spacer"></div>
    <div class="count-lbl" *ngIf="filtered.length">{{filtered.length}} events</div>
    <button class="btn-p" (click)="openLog()"><mat-icon>add</mat-icon> Log Calibration</button>
  </div>

  <!-- ── TABLE VIEW ── -->
  <div class="tcard" *ngIf="view==='table'">
    <table class="htbl">
      <thead>
        <tr>
          <th>Date</th><th>EQ ID</th><th>Equipment</th>
          <th>Certificate No.</th><th>Agency</th>
          <th>Result</th><th>Next Due</th><th>Correction</th><th>By</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let h of filtered">
          <td class="mono">{{h.eventDate | date:"dd MMM yyyy"}}</td>
          <td><span class="id-chip">{{h.eqId}}</span></td>
          <td class="eq-name">{{eqName(h.eqId)}}</td>
          <td class="cert">{{h.calCertNo || "—"}}</td>
          <td class="muted">{{h.calAgency || "—"}}</td>
          <td><span class="rbadge" [class]="rc(h.calResult)">{{h.calResult || "—"}}</span></td>
          <td class="muted">{{(h.calDueDate | date:"dd MMM yyyy") || "—"}}</td>
          <td class="muted small">{{h.correctionFactor || "—"}}</td>
          <td class="muted">{{h.performedBy || "—"}}</td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!filtered.length && !loading" class="empty">
      <mat-icon>science</mat-icon>
      <p>No calibration events yet.<br>Click <strong>Log Calibration</strong> to record the first event.</p>
    </div>
    <div *ngIf="loading" class="empty"><p style="color:#94A3B8">Loading…</p></div>
  </div>

  <!-- ── BY INSTRUMENT SUMMARY VIEW ── -->
  <div *ngIf="view==='summary'">
    <div *ngIf="loading" class="empty"><p style="color:#94A3B8">Loading…</p></div>
    <div *ngIf="!loading && summaryList.length===0" class="empty" style="background:#fff;border-radius:12px;border:1px solid #E2E8F0">
      <mat-icon>science</mat-icon>
      <p>No calibration events yet.</p>
    </div>
    <div class="sum-card" *ngFor="let s of summaryList">
      <!-- Instrument header -->
      <div class="sum-hdr">
        <div class="sum-id"><span class="id-chip">{{s.eqId}}</span></div>
        <div class="sum-info">
          <div class="sum-name">{{s.name}}</div>
          <div class="sum-sub">{{s.make}} {{s.model}}<span *ngIf="s.serialNo"> · S/N {{s.serialNo}}</span></div>
        </div>
        <div class="sum-stats">
          <div class="ss-item">
            <span class="ss-lbl">Total cals</span>
            <span class="ss-val">{{s.events.length}}</span>
          </div>
          <div class="ss-item">
            <span class="ss-lbl">Last cal</span>
            <span class="ss-val">{{(s.lastCalDate | date:"dd MMM yyyy") || "—"}}</span>
          </div>
          <div class="ss-item">
            <span class="ss-lbl">Next due</span>
            <span class="ss-val" [class.ovd]="isOverdue(s.nextCalDue)" [class.soon]="!isOverdue(s.nextCalDue)&&isSoon(s.nextCalDue)">
              {{(s.nextCalDue | date:"dd MMM yyyy") || "—"}}
            </span>
          </div>
          <div class="ss-item">
            <span class="ss-lbl">Pass rate</span>
            <span class="ss-val" [class.green]="s.passRate===100" [class.amber]="s.passRate<100&&s.passRate>=80" [class.red]="s.passRate<80">
              {{s.passRate}}%
            </span>
          </div>
          <div class="ss-item">
            <span class="ss-lbl">Current cert</span>
            <span class="ss-val cert">{{s.latestCert || "—"}}</span>
          </div>
        </div>
        <button class="log-btn-sm" (click)="openLogForEq(s)"><mat-icon>add</mat-icon> Log</button>
      </div>

      <!-- Event rows for this instrument -->
      <div class="sum-events">
        <div class="ev-row" *ngFor="let h of s.events; let i=index" [class.ev-first]="i===0">
          <div class="ev-dot" [class]="'ev-' + rc(h.calResult)"></div>
          <div class="ev-date">{{h.eventDate | date:"dd MMM yyyy"}}</div>
          <span class="rbadge-sm" [class]="rc(h.calResult)">{{h.calResult}}</span>
          <div class="ev-cert">{{h.calCertNo || "—"}}</div>
          <div class="ev-agency muted">{{h.calAgency || "—"}}</div>
          <div class="ev-due muted">→ {{(h.calDueDate | date:"dd MMM yyyy") || "—"}}</div>
          <div class="ev-corr muted small" *ngIf="h.correctionFactor">⊕ {{h.correctionFactor}}</div>
          <div class="ev-by muted small">{{h.performedBy || ""}}</div>
        </div>
      </div>

      <!-- Traceability note for latest event -->
      <div class="trace-note" *ngIf="s.latestTrace">
        <mat-icon style="font-size:13px;width:13px;height:13px;flex-shrink:0;color:#3B82F6">verified</mat-icon>
        <span>{{s.latestTrace}}</span>
      </div>
    </div>
  </div>

</div>

<!-- ═══ LOG CALIBRATION DIALOG ═══ -->
<div *ngIf="showDialog" class="overlay" (click)="showDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div>
      <h3>Log Calibration Event</h3>
      <p>ISO 17025:2017 · Cl. 6.4.13(e)(f) — Record completed calibration</p>
    </div>
    <button class="ib" (click)="showDialog=false"><mat-icon>close</mat-icon></button>
  </div>
  <div class="sh-body">
    <div class="banner blue"><mat-icon>info_outline</mat-icon>
      <span>Creates an immutable history record. Equipment calibration status and next-due date update automatically.</span>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Equipment <span class="rq">*</span></label>
        <select class="fs" [(ngModel)]="form.eqId">
          <option value="">— Select equipment —</option>
          <option *ngFor="let e of equipList" [value]="e.eqId">{{e.eqId}} — {{e.name}}</option>
        </select>
      </div>
      <div class="fc">
        <label class="fl">Calibration Date <span class="rq">*</span></label>
        <input class="fi" type="date" [(ngModel)]="form.eventDate"/>
      </div>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Certificate No. <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.calCertNo" placeholder="e.g. NABL/CAL/2024/00123"/>
        <span class="fh">Original certificate must be retained on file</span>
      </div>
      <div class="fc">
        <label class="fl">Calibrating Agency <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.calAgency" placeholder="e.g. CSIR-NPL, NABL-accredited lab"/>
      </div>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Result <span class="rq">*</span></label>
        <select class="fs" [(ngModel)]="form.calResult">
          <option value="PASS">Pass — within tolerance</option>
          <option value="CONDITIONAL">Conditional — with correction factor</option>
          <option value="FAIL">Fail — out of tolerance</option>
        </select>
      </div>
      <div class="fc">
        <label class="fl">Next Calibration Due <span class="rq">*</span></label>
        <input class="fi" type="date" [(ngModel)]="form.calDueDate"/>
      </div>
    </div>

    <div class="ff">
      <label class="fl">Metrological Traceability Statement <span class="rq">*</span></label>
      <textarea class="fta" rows="2" [(ngModel)]="form.traceability"
        placeholder="e.g. Calibration traceable to National Physical Laboratory (NPL), New Delhi through NABL-accredited lab. Traceable to SI units via BIPM CIPM MRA."></textarea>
      <span class="fh">Must explicitly state traceability — Cl. 6.4.6</span>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Correction Factor Applied <span class="it">Cl.6.4.11</span></label>
        <input class="fi" [(ngModel)]="form.correctionFactor" placeholder="e.g. +0.02 mg. No correction required."/>
      </div>
      <div class="fc">
        <label class="fl">Performed By</label>
        <input class="fi" [(ngModel)]="form.performedBy" placeholder="Name / agency engineer"/>
      </div>
    </div>

    <div class="ff">
      <label class="fl">Calibration Results Summary</label>
      <textarea class="fta" rows="3" [(ngModel)]="form.description"
        placeholder="Summarise test results:&#10;e.g. 3-point check at 100g, 200g, 500g. Max deviation +0.03g at 500g. All within ±0.1g tolerance."></textarea>
    </div>

    <div class="sec-head">Reference Materials <span class="cl-tag">Cl. 6.4.13(f)</span></div>
    <div class="ff">
      <label class="fl">Reference Material / Standard Used</label>
      <input class="fi" [(ngModel)]="form.refMaterial"
        placeholder="e.g. OIML Class E2 weights, NIST SRM 2031, pH 4.00 buffer (Merck Lot 123)"/>
    </div>
  </div>
  <div class="sh-ftr">
    <button class="bg" (click)="showDialog=false">Cancel</button>
    <button class="bp" (click)="save()"><mat-icon>save</mat-icon> Save Calibration</button>
  </div>
</div>
</div>
`,
  styles: [`
    .page-wrap{padding:24px;max-width:1400px;margin:0 auto}
    .page-header{margin-bottom:18px}.page-header h2{font-size:1.25rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.page-header p{font-size:0.76rem;color:#94A3B8;margin:0}
    .toolbar-row{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
    .search-box{position:relative;flex:0 0 240px}.si{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;width:18px;height:18px;color:#94A3B8}
    .si-inp{width:100%;height:40px;padding:0 12px 0 36px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;outline:none;font-family:inherit;box-sizing:border-box}
    .si-inp:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1)}
    .toolbar-spacer{flex:1}.count-lbl{font-size:0.78rem;color:#94A3B8}
    .ns{height:40px;padding:0 28px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;cursor:pointer;outline:none}
    .view-toggle{display:flex;border:1.5px solid #E2E8F0;border-radius:8px;overflow:hidden}
    .view-toggle button{display:inline-flex;align-items:center;gap:5px;padding:0 12px;height:40px;background:transparent;border:none;font-size:0.8rem;font-weight:600;color:#94A3B8;cursor:pointer;font-family:inherit;transition:background .12s,color .12s}
    .view-toggle button:first-child{border-right:1.5px solid #E2E8F0}
    .view-toggle button.on{background:#EFF6FF;color:#0891B2}
    .btn-p{display:inline-flex;align-items:center;gap:5px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 14px;font-size:0.83rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p:hover{background:#0E7490}.btn-p mat-icon{font-size:17px;width:17px;height:17px}
    /* Table */
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .htbl{width:100%;border-collapse:collapse}
    .htbl th{text-align:left;padding:10px 14px;font-size:0.67rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;white-space:nowrap}
    .htbl td{padding:9px 14px;border-bottom:1px solid #F1F5F9;font-size:0.81rem;vertical-align:middle}
    .htbl tr:last-child td{border-bottom:none}.htbl tr:hover td{background:#F8FAFC}
    .mono{font-family:monospace;font-size:0.77rem;color:#475569;white-space:nowrap}
    .cert{font-size:0.75rem;color:#1D4ED8;font-family:monospace}
    .muted{color:#64748b}.small{font-size:0.73rem}
    .eq-name{font-weight:500;color:#0D1B3E}
    .id-chip{font-size:0.71rem;font-weight:600;background:#EFF6FF;color:#1D4ED8;padding:2px 7px;border-radius:6px}
    .rbadge{font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .rbadge.pass{background:#DCFCE7;color:#166534}.rbadge.cond{background:#FEF9C3;color:#92400E}.rbadge.fail{background:#FEE2E2;color:#991B1B}.rbadge.none{background:#F1F5F9;color:#64748b}
    .rbadge-sm{font-size:0.65rem;font-weight:700;padding:1px 6px;border-radius:20px}
    .rbadge-sm.pass{background:#DCFCE7;color:#166534}.rbadge-sm.cond{background:#FEF9C3;color:#92400E}.rbadge-sm.fail{background:#FEE2E2;color:#991B1B}.rbadge-sm.none{background:#F1F5F9;color:#64748b}
    /* Summary view */
    .sum-card{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;margin-bottom:12px}
    .sum-hdr{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #F1F5F9;background:#FAFBFC;flex-wrap:wrap}
    .sum-id{flex-shrink:0}
    .sum-info{flex:1;min-width:120px}
    .sum-name{font-size:0.9rem;font-weight:700;color:#0D1B3E}
    .sum-sub{font-size:0.71rem;color:#94A3B8;margin-top:1px}
    .sum-stats{display:flex;gap:0;flex-shrink:0;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden}
    .ss-item{display:flex;flex-direction:column;gap:2px;padding:6px 12px;border-right:1px solid #E2E8F0}
    .ss-item:last-child{border-right:none}
    .ss-lbl{font-size:0.58rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.5px}
    .ss-val{font-size:0.8rem;font-weight:600;color:#0D1B3E}
    .ss-val.ovd{color:#EF4444}.ss-val.soon{color:#F59E0B}
    .ss-val.green{color:#166534}.ss-val.amber{color:#92400E}.ss-val.red{color:#991B1B}
    .ss-val.cert{font-family:monospace;font-size:0.72rem;color:#1D4ED8}
    .log-btn-sm{display:inline-flex;align-items:center;gap:4px;background:#F0F9FF;color:#0891B2;border:1.5px solid #BAE6FD;border-radius:7px;padding:5px 10px;font-size:0.75rem;font-weight:600;cursor:pointer;font-family:inherit;flex-shrink:0}
    .log-btn-sm mat-icon{font-size:14px;width:14px;height:14px}
    .sum-events{padding:0}
    .ev-row{display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid #F8FAFC;font-size:0.78rem;flex-wrap:nowrap;overflow:hidden}
    .ev-row:last-child{border-bottom:none}
    .ev-first{background:#FAFFFE}
    .ev-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
    .ev-dot.pass{background:#10B981}.ev-dot.cond{background:#F59E0B}.ev-dot.fail{background:#EF4444}.ev-dot.none{background:#94A3B8}
    .ev-date{font-family:monospace;font-size:0.75rem;color:#475569;white-space:nowrap;min-width:90px}
    .ev-cert{font-family:monospace;font-size:0.73rem;color:#1D4ED8;min-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ev-agency{min-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ev-due{white-space:nowrap}
    .ev-corr{flex:1}
    .ev-by{white-space:nowrap}
    .trace-note{display:flex;align-items:flex-start;gap:6px;padding:8px 16px;background:#F0F9FF;border-top:1px solid #E0F2FE;font-size:0.72rem;color:#1E40AF;line-height:1.4}
    .empty{text-align:center;padding:50px;color:#94A3B8}.empty mat-icon{font-size:40px;width:40px;height:40px;display:block;margin:0 auto 12px}.empty p{font-size:0.84rem;line-height:1.6}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:680px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.71rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}.ib:hover{background:#F1F5F9}
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 200px)}
    .sh-ftr{display:flex;justify-content:flex-end;gap:8px;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .banner{display:flex;align-items:flex-start;gap:8px;border-radius:8px;padding:10px 13px;font-size:0.76rem;line-height:1.5;margin-bottom:15px}
    .banner mat-icon{font-size:15px;width:15px;height:15px;flex-shrink:0;margin-top:1px}
    .banner.blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF}.banner.blue mat-icon{color:#3B82F6}
    .sec-head{font-size:0.68rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.6px;padding:12px 0 8px;border-top:1px solid #F1F5F9;margin-top:4px;display:flex;align-items:center;gap:8px}
    .cl-tag{font-size:0.6rem;background:#EFF6FF;color:#3B82F6;padding:2px 6px;border-radius:4px;text-transform:none;font-weight:600}
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:block;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}.it{font-size:0.59rem;background:#EFF6FF;color:#3B82F6;padding:1px 5px;border-radius:4px;margin-left:3px;text-transform:none;font-weight:600}
    .fi,.fs,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}
    .fi,.fs{height:40px;padding:0 12px}.fta{padding:9px 12px;resize:vertical}
    .fi:focus,.fs:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
    .fh{font-size:0.65rem;color:#94A3B8;margin-top:2px;display:block;line-height:1.4}
    .bg{display:inline-flex;align-items:center;gap:4px;background:transparent;color:#64748b;border:1.5px solid #E2E8F0;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}
    .bp{display:inline-flex;align-items:center;gap:4px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}.bp:hover{background:#0E7490}.bp mat-icon{font-size:16px;width:16px;height:16px}
  `]
})
export class CalHistoryComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  summaryList: any[] = [];
  equipList: any[] = [];
  equipMap: Record<string, any> = {};
  search = ""; filterResult = ""; filterEq = "";
  loading = true;
  view: "table" | "summary" = "summary";
  showDialog = false;
  form: any = {};

  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.loadEquip(); }

  loadEquip() {
    this.api.get<any>("/equipment", { size: 500 }).subscribe({
      next: r => {
        this.equipList = (r.content ?? r).sort((a: any, b: any) => a.eqId.localeCompare(b.eqId));
        this.equipList.forEach((e: any) => { this.equipMap[e.eqId] = e; });
        this.loadHistories(this.equipList.map((e: any) => e.eqId));
      }
    });
  }

  loadHistories(eqIds: string[]) {
    this.loading = true;
    let pending = eqIds.length;
    if (!pending) { this.loading = false; return; }
    const results: any[] = [];
    eqIds.forEach(eqId => {
      this.api.get<any[]>("/equipment/" + eqId + "/history/type/CALIBRATION").subscribe({
        next: h => { results.push(...h.map((x: any) => ({...x, eqId}))); },
        error: () => {},
        complete: () => { pending--; if (!pending) this.setAll(results); }
      });
    });
  }

  setAll(events: any[]) {
    this.all = events.sort((a: any, b: any) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    this.buildSummary();
    this.loading = false;
    this.filter();
  }

  buildSummary() {
    // Group by eqId
    const grouped: Record<string, any[]> = {};
    this.all.forEach(h => {
      if (!grouped[h.eqId]) grouped[h.eqId] = [];
      grouped[h.eqId].push(h);
    });
    this.summaryList = Object.entries(grouped).map(([eqId, events]) => {
      const eq = this.equipMap[eqId] || {};
      const sorted = events.sort((a: any, b: any) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
      const latest = sorted[0];
      const passes = sorted.filter((e: any) => e.calResult === "PASS").length;
      return {
        eqId,
        name:       eq.name || "—",
        make:       eq.make || "",
        model:      eq.model || "",
        serialNo:   eq.serialNo || "",
        events:     sorted,
        lastCalDate: latest?.eventDate,
        nextCalDue:  latest?.calDueDate,
        latestCert:  latest?.calCertNo,
        latestTrace: latest?.traceability,
        passRate:    sorted.length ? Math.round((passes / sorted.length) * 100) : 0,
      };
    }).sort((a, b) => a.eqId.localeCompare(b.eqId));
  }

  filter() {
    this.filtered = this.all.filter(h => {
      const s = this.search.toLowerCase();
      const ms = !s || h.eqId?.toLowerCase().includes(s) || h.calCertNo?.toLowerCase().includes(s) || h.calAgency?.toLowerCase().includes(s);
      const mr = !this.filterResult || h.calResult === this.filterResult;
      const me = !this.filterEq || h.eqId === this.filterEq;
      return ms && mr && me;
    });
  }

  openLog() {
    this.form = { eventType:"CALIBRATION", eventDate:new Date().toISOString().slice(0,10), calResult:"PASS" };
    this.showDialog = true;
  }

  openLogForEq(s: any) {
    this.form = {
      eventType: "CALIBRATION",
      eventDate: new Date().toISOString().slice(0,10),
      calResult: "PASS",
      eqId: s.eqId,
    };
    this.showDialog = true;
  }

  save() {
    if (!this.form.eqId || !this.form.eventDate || !this.form.calCertNo || !this.form.calAgency || !this.form.calDueDate) {
      this.snack.open("Fill all required fields", "✕", { duration: 3000 }); return;
    }
    if (!this.form.description) this.form.description = "Calibration — Cert: " + this.form.calCertNo + " — " + this.form.calAgency;
    this.api.post("/equipment/" + this.form.eqId + "/history", this.form).subscribe({
      next: () => {
        this.snack.open("Calibration logged ✓", "");
        this.showDialog = false;
        this.loadHistories(this.equipList.map((e: any) => e.eqId));
      },
      error: () => this.snack.open("Error saving", "✕")
    });
  }

  eqName(eqId: string): string { return this.equipMap[eqId]?.name ?? "—"; }
  rc(r: string): string {
    if (!r) return "none";
    if (r === "PASS") return "pass";
    if (r === "FAIL") return "fail";
    return "cond";
  }
  isOverdue(d: string): boolean { return !!d && new Date(d) < new Date(); }
  isSoon(d: string): boolean {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff > 0 && diff < 30 * 86400000;
  }
}
