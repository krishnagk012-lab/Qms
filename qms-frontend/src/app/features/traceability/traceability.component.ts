import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-traceability", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Metrological Traceability Register</h2>
    <p>ISO 17025:2017 · Clause 6.5 — Metrological traceability to SI units</p>
  </div>

  <div class="toolbar-row">
    <div class="search-box">
      <mat-icon class="si">search</mat-icon>
      <input class="si-inp" [(ngModel)]="search" (input)="filter()" placeholder="Search parameter, unit…"/>
    </div>
    <div class="toolbar-spacer"></div>
    <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> Add Chain</button>
  </div>

  <!-- Expiry warning -->
  <div class="warn-banner" *ngIf="expiryCount > 0">
    <mat-icon>warning</mat-icon>
    <span><strong>{{expiryCount}} traceability chain{{expiryCount>1?"s":""}} expiring or expired.</strong>
      Renew calibration certificates to maintain unbroken traceability — Cl. 6.5.1.</span>
  </div>

  <div class="tcard">
    <table class="htbl">
      <thead><tr>
        <th>ID</th><th>Parameter / Unit</th>
        <th>Level 1 — Accredited Cal. Lab</th>
        <th>Level 2 — NMI / Reference</th>
        <th>Level 3 — SI / BIPM</th>
        <th>Valid Until</th><th>Equipment</th><th></th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let t of filtered" [class.row-exp]="isOverdue(t.validUntil)">
          <td><span class="id-chip" style="background:#F0F9FF;color:#0369A1">{{t.chainId}}</span></td>
          <td>
            <div class="t-param">{{t.parameter}}</div>
            <div class="muted">{{t.unit}} · {{t.measurementLevel}}</div>
          </td>
          <td>
            <div class="chain-lab">{{t.link1Lab || "—"}}</div>
            <div class="muted mono-sm" *ngIf="t.link1CertNo">{{t.link1CertNo}}</div>
            <div class="muted" *ngIf="t.link1Standard">{{t.link1Standard}}</div>
          </td>
          <td>
            <div class="chain-lab">{{t.link2Lab || "—"}}</div>
            <div class="muted" *ngIf="t.link2Standard">{{t.link2Standard}}</div>
          </td>
          <td>
            <div class="chain-lab">{{t.link3Lab || t.siUnit || "—"}}</div>
            <div class="muted" *ngIf="t.link3Standard">{{t.link3Standard}}</div>
          </td>
          <td [class.overdue-text]="isOverdue(t.validUntil)" [class.warn-text]="isExpiringSoon(t.validUntil)">
            {{(t.validUntil | date:"dd MMM yyyy") || "—"}}
          </td>
          <td class="muted">{{t.linkedEquipment || "—"}}</td>
          <td><button class="icon-btn" (click)="edit(t)"><mat-icon style="font-size:16px;color:#94A3B8">edit</mat-icon></button></td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!filtered.length" class="empty">
      <mat-icon>link</mat-icon>
      <p>No traceability chains defined.<br>Click <strong>Add Chain</strong> to document your first traceability chain.</p>
    </div>
  </div>
</div>

<!-- DIALOG -->
<div *ngIf="showDialog" class="overlay" (click)="showDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div><h3>{{editItem?.id ? "Edit" : "Add"}} Traceability Chain</h3>
    <p>ISO 17025:2017 · Cl. 6.5 — Document the unbroken chain to SI units</p></div>
    <button class="ib" (click)="showDialog=false"><mat-icon>close</mat-icon></button>
  </div>
  <div class="sh-body">
    <div class="banner blue"><mat-icon>info_outline</mat-icon>
      <span><strong>Cl. 6.5.1</strong> — Results must be traceable to the SI via an unbroken chain of calibrations. Document each link: your measurement → NABL-accredited lab → NMI (e.g. CSIR-NPL) → BIPM/SI.</span>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Chain ID <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.chainId" [readonly]="!!editItem?.id"/></div>
      <div class="fc"><label class="fl">Valid Until</label>
        <input class="fi" type="date" [(ngModel)]="form.validUntil"/></div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Parameter <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.parameter"/></div>
      <div class="fc"><label class="fl">Unit</label>
        <input class="fi" [(ngModel)]="form.unit"/></div>
    </div>
    <div class="ff"><label class="fl">Measurement Level (your lab)</label>
      <input class="fi" [(ngModel)]="form.measurementLevel"/></div>
    <div class="ff"><label class="fl">Linked Equipment (EQ IDs)</label>
      <input class="fi" [(ngModel)]="form.linkedEquipment"/></div>

    <div class="chain-visual">
      <div class="chain-node your-lab">
        <div class="cn-lbl">Your Lab Measurement</div>
        <div class="cn-val">{{form.parameter || "Parameter"}} · {{form.unit || "Unit"}}</div>
      </div>
      <div class="chain-arrow">▼ Calibrated by</div>

      <div class="chain-node link1">
        <div class="cn-lbl">Level 1 — NABL-Accredited Calibration Lab</div>
        <div class="fr" style="margin-top:8px;margin-bottom:0">
          <div class="fc"><label class="fl-sm">Lab Name</label>
            <input class="fi-sm" [(ngModel)]="form.link1Lab"/></div>
          <div class="fc"><label class="fl-sm">Certificate No.</label>
            <input class="fi-sm" [(ngModel)]="form.link1CertNo"/></div>
        </div>
        <div style="margin-top:6px"><label class="fl-sm">Reference Standard Used</label>
          <input class="fi-sm" [(ngModel)]="form.link1Standard"/></div>
      </div>
      <div class="chain-arrow">▼ Traceable to</div>

      <div class="chain-node link2">
        <div class="cn-lbl">Level 2 — National Metrology Institute (e.g. CSIR-NPL, BARC)</div>
        <div class="fr" style="margin-top:8px;margin-bottom:0">
          <div class="fc"><label class="fl-sm">NMI Name</label>
            <input class="fi-sm" [(ngModel)]="form.link2Lab"/></div>
          <div class="fc"><label class="fl-sm">Certificate No.</label>
            <input class="fi-sm" [(ngModel)]="form.link2CertNo"/></div>
        </div>
        <div style="margin-top:6px"><label class="fl-sm">Primary Standard</label>
          <input class="fi-sm" [(ngModel)]="form.link2Standard"/></div>
      </div>
      <div class="chain-arrow">▼ Linked via</div>

      <div class="chain-node link3">
        <div class="cn-lbl">Level 3 — International / SI Reference</div>
        <div class="fr" style="margin-top:8px;margin-bottom:0">
          <div class="fc"><label class="fl-sm">Organisation (e.g. BIPM, NIST)</label>
            <input class="fi-sm" [(ngModel)]="form.link3Lab"/></div>
        </div>
        <div style="margin-top:6px"><label class="fl-sm">International Reference / MRA</label>
          <input class="fi-sm" [(ngModel)]="form.link3Standard"/></div>
        <div style="margin-top:6px"><label class="fl-sm">SI Unit Declaration</label>
          <input class="fi-sm" [(ngModel)]="form.siUnit"/></div>
      </div>
    </div>

    <div class="ff" style="margin-top:14px"><label class="fl">Verified By</label>
      <input class="fi" [(ngModel)]="form.verifiedBy"/></div>
    <div class="ff"><label class="fl">Notes</label>
      <textarea class="fta" rows="2" [(ngModel)]="form.notes"></textarea></div>
  </div>
  <div class="sh-ftr">
    <button class="bg" (click)="showDialog=false">Cancel</button>
    <button class="bp" (click)="save()"><mat-icon>save</mat-icon> Save Chain</button>
  </div>
</div>
</div>
`,
  styles: [`
    .page-wrap{padding:24px;max-width:1400px;margin:0 auto}
    .page-header{margin-bottom:18px}.page-header h2{font-size:1.25rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.page-header p{font-size:0.76rem;color:#94A3B8;margin:0}
    .toolbar-row{display:flex;align-items:center;gap:10px;margin-bottom:16px}
    .search-box{position:relative;flex:0 0 260px}.si{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;width:18px;height:18px;color:#94A3B8}
    .si-inp{width:100%;height:40px;padding:0 12px 0 36px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;outline:none;font-family:inherit;box-sizing:border-box}
    .toolbar-spacer{flex:1}
    .btn-p{display:inline-flex;align-items:center;gap:5px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 14px;font-size:0.83rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p mat-icon{font-size:17px;width:17px;height:17px}
    .warn-banner{display:flex;align-items:center;gap:10px;background:#FEF9C3;border:1px solid #FDE68A;border-radius:10px;padding:12px 16px;font-size:0.81rem;color:#92400E;margin-bottom:14px}
    .warn-banner mat-icon{color:#F59E0B;flex-shrink:0}
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .htbl{width:100%;border-collapse:collapse}
    .htbl th{text-align:left;padding:10px 14px;font-size:0.66rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;white-space:nowrap}
    .htbl td{padding:9px 14px;border-bottom:1px solid #F1F5F9;font-size:0.81rem;vertical-align:top}
    .htbl tr:last-child td{border-bottom:none}.htbl tr:hover td{background:#F8FAFC}
    .row-exp td{background:#FFF5F5}
    .t-param{font-weight:600;color:#0D1B3E}
    .chain-lab{font-size:0.8rem;font-weight:500;color:#0D1B3E}
    .muted{color:#64748b;font-size:0.75rem}
    .mono-sm{font-family:monospace}
    .overdue-text{color:#EF4444;font-weight:600}.warn-text{color:#F59E0B;font-weight:600}
    .id-chip{font-size:0.71rem;font-weight:600;padding:2px 8px;border-radius:6px}
    .icon-btn{background:transparent;border:none;cursor:pointer;display:inline-flex;align-items:center;padding:4px;border-radius:6px}
    .empty{text-align:center;padding:60px;color:#94A3B8}.empty mat-icon{font-size:48px;width:48px;height:48px;display:block;margin:0 auto 12px}.empty p{font-size:0.84rem;line-height:1.6}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:700px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.71rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 200px)}
    .sh-ftr{display:flex;justify-content:flex-end;gap:8px;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .banner{display:flex;align-items:flex-start;gap:8px;border-radius:8px;padding:10px 13px;font-size:0.76rem;line-height:1.5;margin-bottom:15px}
    .banner mat-icon{font-size:15px;width:15px;height:15px;flex-shrink:0;margin-top:1px}
    .banner.blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF}.banner.blue mat-icon{color:#3B82F6}
    /* Chain visual */
    .chain-visual{display:flex;flex-direction:column;gap:0}
    .chain-node{border:1.5px solid #E2E8F0;border-radius:10px;padding:12px 14px;background:#FAFBFC}
    .chain-node.your-lab{border-color:#0891B2;background:#F0F9FF}
    .chain-node.link1{border-color:#10B981;background:#F0FDF4}
    .chain-node.link2{border-color:#F59E0B;background:#FFFBEB}
    .chain-node.link3{border-color:#6366F1;background:#EEF2FF}
    .cn-lbl{font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748b;margin-bottom:2px}
    .cn-val{font-size:0.84rem;font-weight:600;color:#0D1B3E}
    .chain-arrow{text-align:center;padding:6px 0;font-size:0.72rem;color:#94A3B8;font-weight:600}
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:block;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .fl-sm{display:block;font-size:0.63rem;font-weight:700;color:#64748b;margin-bottom:3px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}
    .fi,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;box-sizing:border-box;height:40px;padding:0 12px}
    .fi-sm{width:100%;border:1.5px solid #E2E8F0;border-radius:7px;background:#fff;font-size:0.8rem;color:#0F172A;outline:none;font-family:inherit;box-sizing:border-box;height:36px;padding:0 10px}
    .fi:focus,.fi-sm:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .fta{height:auto;padding:9px 12px;resize:vertical}
    .bg{display:inline-flex;align-items:center;gap:4px;background:transparent;color:#64748b;border:1.5px solid #E2E8F0;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}
    .bp{display:inline-flex;align-items:center;gap:4px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}.bp mat-icon{font-size:16px;width:16px;height:16px}
  `]
})
export class TraceabilityComponent implements OnInit {
  all: any[] = []; filtered: any[] = []; search = ""; expiryCount = 0;
  showDialog = false; editItem: any = null; form: any = {};

  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.get<any[]>("/traceability").subscribe({
      next: r => {
        this.all = r;
        this.expiryCount = r.filter((t: any) => this.isOverdue(t.validUntil) || this.isExpiringSoon(t.validUntil)).length;
        this.filter();
      }, error: e => { if (e.status !== 401) this.snack.open("Failed to load","✕"); }
    });
  }

  filter() {
    const s = this.search.toLowerCase();
    this.filtered = s ? this.all.filter((t: any) => t.parameter?.toLowerCase().includes(s) || t.unit?.toLowerCase().includes(s)) : this.all;
  }

  openNew() { this.editItem = null; this.form = {}; this.showDialog = true; }
  edit(t: any) { this.editItem = t; this.form = {...t}; this.showDialog = true; }

  save() {
    if (!this.form.chainId || !this.form.parameter) { this.snack.open("Chain ID and Parameter required","✕",{duration:3000}); return; }
    this.api.post("/traceability", this.form).subscribe({
      next: () => { this.snack.open("Saved ✓",""); this.showDialog=false; this.load(); },
      error: () => this.snack.open("Error saving","✕")
    });
  }

  isOverdue(d: string): boolean { return !!d && new Date(d) < new Date(); }
  isExpiringSoon(d: string): boolean {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff > 0 && diff < 90 * 86400000;
  }
}
