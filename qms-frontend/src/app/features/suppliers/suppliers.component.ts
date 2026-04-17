import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-suppliers", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Supplier & Vendor Register</h2>
    <p>ISO 17025:2017 · Clause 6.6 — Externally provided products and services</p>
  </div>
  <div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="stat-card" *ngFor="let c of statCards">
      <div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div>
      <div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div>
    </div>
  </div>
  <div class="toolbar-row">
    <div class="search-box"><mat-icon class="si">search</mat-icon>
      <input class="si-inp" [(ngModel)]="search" (input)="load()" placeholder="Search supplier name…"/></div>
    <select class="ns" [(ngModel)]="filterType" (change)="load()">
      <option value="">All types</option>
      <option value="CALIBRATION_LAB">Calibration Lab</option>
      <option value="REAGENT">Reagent Supplier</option>
      <option value="EQUIPMENT">Equipment Supplier</option>
      <option value="CRM">CRM / Reference Material</option>
      <option value="SUBCONTRACTOR">Subcontractor</option>
      <option value="OTHER">Other</option>
    </select>
    <div class="toolbar-spacer"></div>
    <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> Add Supplier</button>
  </div>

  <!-- Expiry warning -->
  <div class="warn-banner" *ngIf="expiryWarnings > 0">
    <mat-icon>warning</mat-icon>
    <span><strong>{{expiryWarnings}} supplier accreditation{{expiryWarnings>1?"s":""}} expiring within 90 days.</strong>
      Verify renewal status — using a calibration lab with expired accreditation invalidates traceability.</span>
  </div>

  <div class="tcard">
    <table class="htbl">
      <thead><tr>
        <th>ID</th><th>Supplier</th><th>Type</th><th>Accreditation</th>
        <th>Accred. Expiry</th><th>Evaluation</th><th>Re-eval Due</th><th>Status</th><th></th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let s of suppliers" [class.row-warn]="isExpiringSoon(s.accreditationExpiry)">
          <td><span class="id-chip" style="background:#F0FDF4;color:#166534">{{s.supplierId}}</span></td>
          <td>
            <div class="s-name">{{s.name}}</div>
            <div class="muted" *ngIf="s.contactPerson">{{s.contactPerson}}</div>
          </td>
          <td><span class="type-chip" [class]="tc(s.supplierType)">{{s.supplierType?.replace('_',' ')}}</span></td>
          <td>
            <div class="muted mono-sm">{{s.accreditationNo || '—'}}</div>
            <div class="muted" *ngIf="s.accreditationBody">{{s.accreditationBody}}</div>
          </td>
          <td [class.expiry-warn]="isExpiringSoon(s.accreditationExpiry)" [class.overdue-text]="isOverdue(s.accreditationExpiry)">
            {{(s.accreditationExpiry | date:"dd MMM yyyy") || "—"}}
          </td>
          <td><span class="eval-chip" [class]="ec(s.evaluationStatus)">{{s.evaluationStatus}}</span></td>
          <td [class.overdue-text]="isOverdue(s.reEvaluationDue)">{{(s.reEvaluationDue | date:"dd MMM yyyy") || "—"}}</td>
          <td><span class="sbadge" [class]="sc(s.status)">{{s.status}}</span></td>
          <td><button class="icon-btn" (click)="edit(s)"><mat-icon style="font-size:16px;color:#94A3B8">edit</mat-icon></button></td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!suppliers.length" class="empty">
      <mat-icon>business</mat-icon>
      <p>No suppliers registered.<br>Click <strong>Add Supplier</strong> to build your approved supplier list.</p>
    </div>
  </div>
</div>

<div *ngIf="showDialog" class="overlay" (click)="showDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div><h3>{{editItem?.id?"Edit":"Register"}} Supplier</h3>
    <p>ISO 17025:2017 · Cl. 6.6 — Approved supplier record</p></div>
    <button class="ib" (click)="showDialog=false"><mat-icon>close</mat-icon></button>
  </div>
  <div class="sh-body">
    <div class="banner blue"><mat-icon>info_outline</mat-icon>
      <span><strong>Cl. 6.6</strong> — Evaluate and select external providers based on their ability to meet requirements. For calibration labs, verify NABL accreditation. Maintain records of evaluations and re-evaluations.</span>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Supplier ID <span class="rq">*</span></label><input class="fi" [(ngModel)]="form.supplierId" [readonly]="!!editItem?.id"/></div>
      <div class="fc"><label class="fl">Type <span class="rq">*</span></label>
        <select class="fs" [(ngModel)]="form.supplierType">
          <option value="CALIBRATION_LAB">Calibration Lab</option>
          <option value="REAGENT">Reagent Supplier</option>
          <option value="EQUIPMENT">Equipment Supplier</option>
          <option value="CRM">CRM / Reference Material</option>
          <option value="SUBCONTRACTOR">Subcontractor</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
    </div>
    <div class="ff"><label class="fl">Supplier / Company Name <span class="rq">*</span></label><input class="fi" [(ngModel)]="form.name"/></div>
    <div class="fr">
      <div class="fc"><label class="fl">Contact Person</label><input class="fi" [(ngModel)]="form.contactPerson"/></div>
      <div class="fc"><label class="fl">Email</label><input class="fi" [(ngModel)]="form.email"/></div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Phone</label><input class="fi" [(ngModel)]="form.phone"/></div>
      <div class="fc"><label class="fl">Status</label>
        <select class="fs" [(ngModel)]="form.status">
          <option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="REMOVED">Removed</option>
        </select>
      </div>
    </div>
    <div class="ff"><label class="fl">Address</label><textarea class="fta" rows="2" [(ngModel)]="form.address"></textarea></div>
    <div class="sdiv">Accreditation Details</div>
    <div class="fr">
      <div class="fc"><label class="fl">Accreditation No.</label><input class="fi" [(ngModel)]="form.accreditationNo"/></div>
      <div class="fc"><label class="fl">Accrediting Body</label><input class="fi" [(ngModel)]="form.accreditationBody"/></div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Accreditation Expiry</label><input class="fi" type="date" [(ngModel)]="form.accreditationExpiry"/></div>
    </div>
    <div class="ff"><label class="fl">Scope of Supply / Accreditation Scope</label><textarea class="fta" rows="2" [(ngModel)]="form.scopeOfSupply"></textarea></div>
    <div class="sdiv">Evaluation — Cl. 6.6.2</div>
    <div class="fr">
      <div class="fc"><label class="fl">Evaluation Status</label>
        <select class="fs" [(ngModel)]="form.evaluationStatus">
          <option value="APPROVED">Approved</option><option value="CONDITIONAL">Conditional</option>
          <option value="REJECTED">Rejected</option><option value="PENDING">Pending</option>
        </select>
      </div>
      <div class="fc"><label class="fl">Evaluation Date</label><input class="fi" type="date" [(ngModel)]="form.evaluationDate"/></div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Evaluated By</label><input class="fi" [(ngModel)]="form.evaluatedBy"/></div>
      <div class="fc"><label class="fl">Re-evaluation Due</label><input class="fi" type="date" [(ngModel)]="form.reEvaluationDue"/></div>
    </div>
    <div class="ff"><label class="fl">Evaluation Criteria / Notes</label><textarea class="fta" rows="3" [(ngModel)]="form.evaluationCriteria"></textarea></div>
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
    .warn-banner{display:flex;align-items:center;gap:10px;background:#FEF9C3;border:1px solid #FDE68A;border-radius:10px;padding:12px 16px;font-size:0.81rem;color:#92400E;margin-bottom:14px}
    .warn-banner mat-icon{color:#F59E0B;flex-shrink:0}
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .htbl{width:100%;border-collapse:collapse}
    .htbl th{text-align:left;padding:10px 14px;font-size:0.66rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;white-space:nowrap}
    .htbl td{padding:9px 14px;border-bottom:1px solid #F1F5F9;font-size:0.81rem;vertical-align:middle}
    .htbl tr:last-child td{border-bottom:none}.htbl tr:hover td{background:#F8FAFC}
    .row-warn td{background:#FFFBEB}
    .s-name{font-weight:600;color:#0D1B3E}
    .muted{color:#64748b;font-size:0.78rem}
    .mono-sm{font-family:monospace;font-size:0.74rem}
    .overdue-text{color:#EF4444;font-weight:600}.expiry-warn{color:#F59E0B;font-weight:600}
    .id-chip{font-size:0.71rem;font-weight:600;padding:2px 8px;border-radius:6px}
    .type-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase}
    .type-chip.CALIBRATION_LAB{background:#E0F2FE;color:#075985}.type-chip.REAGENT{background:#EDE9FE;color:#4C1D95}
    .type-chip.EQUIPMENT{background:#DCFCE7;color:#166534}.type-chip.CRM{background:#FEF9C3;color:#92400E}
    .type-chip.SUBCONTRACTOR{background:#FEE2E2;color:#991B1B}.type-chip.OTHER{background:#F1F5F9;color:#64748b}
    .eval-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .eval-chip.APPROVED{background:#DCFCE7;color:#166534}.eval-chip.CONDITIONAL{background:#FEF9C3;color:#92400E}
    .eval-chip.REJECTED{background:#FEE2E2;color:#991B1B}.eval-chip.PENDING{background:#F1F5F9;color:#64748b}
    .sbadge{font-size:0.7rem;font-weight:700;padding:2px 9px;border-radius:20px}
    .sbadge.act{background:#DCFCE7;color:#166534}.sbadge.sus{background:#FEF9C3;color:#92400E}.sbadge.rem{background:#FEE2E2;color:#991B1B}
    .icon-btn{background:transparent;border:none;cursor:pointer;display:inline-flex;align-items:center;padding:4px;border-radius:6px}
    .empty{text-align:center;padding:60px;color:#94A3B8}.empty mat-icon{font-size:48px;width:48px;height:48px;display:block;margin:0 auto 12px}.empty p{font-size:0.84rem;line-height:1.6}
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:720px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.71rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 200px)}
    .sh-ftr{display:flex;justify-content:flex-end;gap:8px;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .banner{display:flex;align-items:flex-start;gap:8px;border-radius:8px;padding:10px 13px;font-size:0.76rem;line-height:1.5;margin-bottom:15px}
    .banner mat-icon{font-size:15px;width:15px;height:15px;flex-shrink:0;margin-top:1px}
    .banner.blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF}.banner.blue mat-icon{color:#3B82F6}
    .sdiv{font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;padding:12px 0 8px;border-top:1px solid #F1F5F9;margin-top:4px}
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
export class SuppliersComponent implements OnInit {
  suppliers: any[] = []; statCards: any[] = [];
  search = ""; filterType = ""; expiryWarnings = 0;
  showDialog = false; editItem: any = null; form: any = {};

  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); this.loadStats(); }

  loadStats() {
    this.api.get<any>("/suppliers/stats").subscribe({
      next: s => {
        this.statCards = [
          { label:"Total Suppliers", value:s.total   ??0, icon:"business",    color:"#0891B2", bg:"#E0F2FE" },
          { label:"Approved",        value:s.approved??0, icon:"verified",     color:"#10B981", bg:"#DCFCE7" },
          { label:"Pending Eval.",   value:s.pending ??0, icon:"pending",      color:"#F59E0B", bg:"#FEF3C7" },
        ];
      }, error: () => {}
    });
  }

  load() {
    this.api.get<any[]>("/suppliers", { q: this.search || null, type: this.filterType || null, status: null }).subscribe({
      next: r => {
        this.suppliers = r;
        this.expiryWarnings = r.filter((s: any) => this.isExpiringSoon(s.accreditationExpiry)).length;
      }
    });
  }

  openNew() { this.editItem = null; this.form = { supplierType:"CALIBRATION_LAB", status:"ACTIVE", evaluationStatus:"PENDING" }; this.showDialog = true; }
  edit(s: any) { this.editItem = s; this.form = {...s}; this.showDialog = true; }

  save() {
    if (!this.form.supplierId || !this.form.name) { this.snack.open("ID and Name required","✕",{duration:3000}); return; }
    this.api.post("/suppliers", this.form).subscribe({
      next: () => { this.snack.open("Saved ✓",""); this.showDialog=false; this.load(); this.loadStats(); },
      error: () => this.snack.open("Error","✕")
    });
  }

  isOverdue(d: string): boolean { return !!d && new Date(d) < new Date(); }
  isExpiringSoon(d: string): boolean {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff > 0 && diff < 90 * 86400000;
  }
  tc(t: string): string { return t || "OTHER"; }
  ec(s: string): string { return s || "PENDING"; }
  sc(s: string): string {
    if (s === "ACTIVE") return "act"; if (s === "SUSPENDED") return "sus"; return "rem";
  }
}
