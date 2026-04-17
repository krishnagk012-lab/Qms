import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-scope", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Scope of Accreditation</h2>
    <p>ISO 17025:2017 · Clause 5.4 — NABL accredited tests and parameters</p>
  </div>

  <div class="toolbar-row">
    <div class="search-box">
      <mat-icon class="si">search</mat-icon>
      <input class="si-inp" [(ngModel)]="search" (input)="filter()" placeholder="Search parameter, method, matrix…"/>
    </div>
    <select class="ns" [(ngModel)]="filterStatus" (change)="filter()">
      <option value="">All status</option>
      <option value="ACTIVE">Active</option>
      <option value="SUSPENDED">Suspended</option>
      <option value="WITHDRAWN">Withdrawn</option>
    </select>
    <div class="toolbar-spacer"></div>
    <div class="cert-badge" *ngIf="nablCert"><mat-icon>workspace_premium</mat-icon> NABL Cert: {{nablCert}}</div>
    <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> Add Parameter</button>
  </div>

  <div class="tcard">
    <table class="htbl">
      <thead><tr>
        <th>Scope ID</th><th>Parameter</th><th>Method Reference</th>
        <th>Matrix</th><th>Range</th><th>Uncertainty</th>
        <th>Accredited Since</th><th>Valid Until</th><th>Status</th><th></th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let s of filtered" [class.row-sus]="s.status!=='ACTIVE'">
          <td><span class="id-chip" style="background:#FEF9C3;color:#92400E">{{s.scopeId}}</span></td>
          <td class="p-name">{{s.parameter}}</td>
          <td class="mono-sm">{{s.methodRef || "—"}}</td>
          <td class="muted">{{s.matrix || "—"}}</td>
          <td class="muted">{{formatRange(s)}}</td>
          <td class="muted">{{s.uncertainty || "—"}}</td>
          <td class="muted">{{(s.accreditedSince | date:"MMM yyyy") || "—"}}</td>
          <td [class.overdue-text]="isOverdue(s.validUntil)">{{(s.validUntil | date:"dd MMM yyyy") || "—"}}</td>
          <td><span class="st-chip" [class]="sc(s.status)">{{s.status}}</span></td>
          <td><button class="icon-btn" (click)="edit(s)"><mat-icon style="font-size:16px;color:#94A3B8">edit</mat-icon></button></td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!filtered.length" class="empty">
      <mat-icon>workspace_premium</mat-icon>
      <p>No accreditation scope defined.<br>Click <strong>Add Parameter</strong> to document your NABL scope.</p>
    </div>
  </div>
</div>

<!-- DIALOG -->
<div *ngIf="showDialog" class="overlay" (click)="showDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div><h3>{{editItem?.id ? "Edit" : "Add"}} Scope Parameter</h3>
    <p>ISO 17025:2017 · Cl. 5.4 — Accreditation scope entry</p></div>
    <button class="ib" (click)="showDialog=false"><mat-icon>close</mat-icon></button>
  </div>
  <div class="sh-body">
    <div class="banner blue"><mat-icon>info_outline</mat-icon>
      <span><strong>Cl. 5.4</strong> — The laboratory's scope of accreditation defines the specific tests, parameters, methods and matrices that NABL has assessed and approved. Each entry here must match exactly what is on the NABL certificate.</span>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Scope ID <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.scopeId" [readonly]="!!editItem?.id"/></div>
      <div class="fc"><label class="fl">NABL Certificate No.</label>
        <input class="fi" [(ngModel)]="form.nablCertNo"/></div>
    </div>
    <div class="ff"><label class="fl">Parameter / Test Name <span class="rq">*</span></label>
      <input class="fi" [(ngModel)]="form.parameter"/></div>
    <div class="fr">
      <div class="fc"><label class="fl">Method Reference <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.methodRef"/></div>
      <div class="fc"><label class="fl">Matrix / Sample Type</label>
        <input class="fi" [(ngModel)]="form.matrix"/></div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Range From</label><input class="fi" [(ngModel)]="form.rangeFrom"/></div>
      <div class="fc"><label class="fl">Range To</label><input class="fi" [(ngModel)]="form.rangeTo"/></div>
      <div class="fc"><label class="fl">Unit</label><input class="fi" [(ngModel)]="form.unit"/></div>
    </div>
    <div class="ff"><label class="fl">Measurement Uncertainty (as on cert)</label>
      <input class="fi" [(ngModel)]="form.uncertainty"/></div>
    <div class="ff"><label class="fl">Facility</label>
      <input class="fi" [(ngModel)]="form.facility"/></div>
    <div class="fr">
      <div class="fc"><label class="fl">Accredited Since</label>
        <input class="fi" type="date" [(ngModel)]="form.accreditedSince"/></div>
      <div class="fc"><label class="fl">Valid Until</label>
        <input class="fi" type="date" [(ngModel)]="form.validUntil"/></div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Linked Method ID</label>
        <input class="fi" [(ngModel)]="form.linkedMethodId"/></div>
      <div class="fc"><label class="fl">Status</label>
        <select class="fs" [(ngModel)]="form.status">
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
      </div>
    </div>
    <div class="ff"><label class="fl">Notes</label>
      <textarea class="fta" rows="2" [(ngModel)]="form.notes"></textarea></div>
  </div>
  <div class="sh-ftr">
    <button class="bg" (click)="showDialog=false">Cancel</button>
    <button class="bp" (click)="save()"><mat-icon>save</mat-icon> Save</button>
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
    .toolbar-spacer{flex:1}
    .ns{height:40px;padding:0 28px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;cursor:pointer;outline:none}
    .btn-p{display:inline-flex;align-items:center;gap:5px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 14px;font-size:0.83rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p mat-icon{font-size:17px;width:17px;height:17px}
    .cert-badge{display:inline-flex;align-items:center;gap:5px;background:#FEF9C3;color:#92400E;border:1px solid #FDE68A;border-radius:8px;padding:0 12px;height:36px;font-size:0.78rem;font-weight:600}
    .cert-badge mat-icon{font-size:15px;width:15px;height:15px}
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .htbl{width:100%;border-collapse:collapse}
    .htbl th{text-align:left;padding:10px 14px;font-size:0.66rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;white-space:nowrap}
    .htbl td{padding:9px 14px;border-bottom:1px solid #F1F5F9;font-size:0.81rem;vertical-align:middle}
    .htbl tr:last-child td{border-bottom:none}.htbl tr:hover td{background:#F8FAFC}
    .row-sus td{background:#FFF5F5;opacity:.7}
    .p-name{font-weight:600;color:#0D1B3E}.muted{color:#64748b;font-size:0.78rem}
    .mono-sm{font-family:monospace;font-size:0.74rem;color:#475569}
    .overdue-text{color:#EF4444;font-weight:600}
    .id-chip{font-size:0.71rem;font-weight:600;padding:2px 8px;border-radius:6px}
    .st-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .st-chip.ACTIVE{background:#DCFCE7;color:#166534}.st-chip.SUSPENDED{background:#FEF9C3;color:#92400E}.st-chip.WITHDRAWN{background:#FEE2E2;color:#991B1B}
    .icon-btn{background:transparent;border:none;cursor:pointer;display:inline-flex;align-items:center;padding:4px;border-radius:6px}
    .empty{text-align:center;padding:60px;color:#94A3B8}.empty mat-icon{font-size:48px;width:48px;height:48px;display:block;margin:0 auto 12px}.empty p{font-size:0.84rem;line-height:1.6}
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
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:block;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}
    .fi,.fs,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;box-sizing:border-box}
    .fi,.fs{height:40px;padding:0 12px}.fta{padding:9px 12px;resize:vertical}
    .fi:focus,.fs:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
    .bg{display:inline-flex;align-items:center;gap:4px;background:transparent;color:#64748b;border:1.5px solid #E2E8F0;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}
    .bp{display:inline-flex;align-items:center;gap:4px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}.bp mat-icon{font-size:16px;width:16px;height:16px}
  `]
})
export class ScopeComponent implements OnInit {
  all: any[] = []; filtered: any[] = []; search = ""; filterStatus = ""; nablCert = "";
  showDialog = false; editItem: any = null; form: any = {};

  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.get<any[]>("/scope").subscribe({
      next: r => { this.all = r; if (r.length) this.nablCert = r[0].nablCertNo || ""; this.filter(); },
      error: e => { if (e.status !== 401) this.snack.open("Failed to load","✕"); }
    });
  }

  filter() {
    const s = this.search.toLowerCase();
    this.filtered = this.all.filter(i =>
      (!s || i.parameter?.toLowerCase().includes(s) || i.methodRef?.toLowerCase().includes(s) || i.matrix?.toLowerCase().includes(s))
      && (!this.filterStatus || i.status === this.filterStatus)
    );
  }

  openNew() { this.editItem = null; this.form = { status:"ACTIVE", nablCertNo: this.nablCert }; this.showDialog = true; }
  edit(s: any) { this.editItem = s; this.form = {...s}; this.showDialog = true; }

  save() {
    if (!this.form.scopeId || !this.form.parameter) { this.snack.open("Scope ID and Parameter required","✕",{duration:3000}); return; }
    this.api.post("/scope", this.form).subscribe({
      next: () => { this.snack.open("Saved ✓",""); this.showDialog=false; this.load(); },
      error: () => this.snack.open("Error saving","✕")
    });
  }

  formatRange(s: any): string {
    if (!s.rangeFrom && !s.rangeTo) return "—";
    return `${s.rangeFrom||""}–${s.rangeTo||""} ${s.unit||""}`.trim();
  }
  isOverdue(d: string): boolean { return !!d && new Date(d) < new Date(); }
  sc(s: string): string { return s || "ACTIVE"; }
}
