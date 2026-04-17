import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-complaints", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Complaints Register</h2>
    <p>ISO 17025:2017 · Clause 7.9 — Complaints from customers and other parties</p>
  </div>
  <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="stat-card" *ngFor="let c of statCards">
      <div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div>
      <div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div>
    </div>
  </div>
  <div class="toolbar-row">
    <div class="search-box"><mat-icon class="si">search</mat-icon>
      <input class="si-inp" [(ngModel)]="search" (input)="load()" placeholder="Search complainant, description…"/></div>
    <select class="ns" [(ngModel)]="filterStatus" (change)="load()">
      <option value="">All status</option>
      <option value="OPEN">Open</option><option value="INVESTIGATING">Investigating</option>
      <option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option>
    </select>
    <div class="toolbar-spacer"></div>
    <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> New Complaint</button>
  </div>
  <div class="tcard">
    <table class="htbl">
      <thead><tr>
        <th>ID</th><th>Received</th><th>Complainant</th><th>Type</th>
        <th>Severity</th><th>Description</th><th>Assigned To</th>
        <th>Response Sent</th><th>Status</th><th></th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let c of complaints" [class.row-critical]="c.severity==='CRITICAL'">
          <td><span class="id-chip" style="background:#FEF2F2;color:#991B1B">{{c.complaintId}}</span></td>
          <td class="mono-sm">{{c.receivedDate | date:"dd MMM yyyy"}}</td>
          <td>
            <div class="font-medium">{{c.complainant || "—"}}</div>
            <div class="muted">{{c.contact}}</div>
          </td>
          <td class="muted">{{c.complaintType?.replace('_',' ') || "—"}}</td>
          <td><span class="sev-chip" [class]="sev(c.severity)">{{c.severity}}</span></td>
          <td class="desc-cell">{{c.description}}</td>
          <td class="muted">{{c.assignedTo || "—"}}</td>
          <td>
            <span *ngIf="c.responseSent" class="yes-chip">Sent</span>
            <span *ngIf="!c.responseSent" class="no-chip">Pending</span>
          </td>
          <td><span class="st-chip" [class]="cs(c.status)">{{c.status}}</span></td>
          <td><button class="icon-btn" (click)="edit(c)"><mat-icon style="font-size:16px;color:#94A3B8">edit</mat-icon></button></td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!complaints.length" class="empty">
      <mat-icon>feedback</mat-icon>
      <p>No complaints recorded.<br>Click <strong>New Complaint</strong> to register a customer complaint.</p>
    </div>
  </div>
</div>

<div *ngIf="showDialog" class="overlay" (click)="showDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div><h3>{{editItem?.id?"Edit":"Register"}} Complaint</h3>
    <p>ISO 17025:2017 · Cl. 7.9 — Customer complaint record</p></div>
    <button class="ib" (click)="showDialog=false"><mat-icon>close</mat-icon></button>
  </div>
  <div class="sh-body">
    <div class="banner blue"><mat-icon>info_outline</mat-icon>
      <span><strong>Cl. 7.9</strong> — The laboratory shall have a documented process for receiving, evaluating and making decisions on complaints. All complaints must result in a response to the complainant.</span>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Complaint ID <span class="rq">*</span></label><input class="fi" [(ngModel)]="form.complaintId" [readonly]="!!editItem?.id"/></div>
      <div class="fc"><label class="fl">Date Received <span class="rq">*</span></label><input class="fi" type="date" [(ngModel)]="form.receivedDate"/></div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Complainant</label><input class="fi" [(ngModel)]="form.complainant"/></div>
      <div class="fc"><label class="fl">Contact</label><input class="fi" [(ngModel)]="form.contact"/></div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Type</label>
        <select class="fs" [(ngModel)]="form.complaintType">
          <option value="RESULT">Test Result</option><option value="SERVICE">Service Quality</option>
          <option value="TURNAROUND">Turnaround Time</option><option value="STAFF">Staff Conduct</option>
          <option value="REPORT">Report / Certificate</option><option value="OTHER">Other</option>
        </select>
      </div>
      <div class="fc"><label class="fl">Severity</label>
        <select class="fs" [(ngModel)]="form.severity">
          <option value="LOW">Low</option><option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option><option value="CRITICAL">Critical</option>
        </select>
      </div>
    </div>
    <div class="ff"><label class="fl">Description <span class="rq">*</span></label><textarea class="fta" rows="3" [(ngModel)]="form.description"></textarea></div>
    <div class="fr">
      <div class="fc"><label class="fl">Related Report / Certificate</label><input class="fi" [(ngModel)]="form.relatedReport"/></div>
      <div class="fc"><label class="fl">Assigned To</label><input class="fi" [(ngModel)]="form.assignedTo"/></div>
    </div>
    <div class="sdiv">Investigation & Resolution — Cl. 7.9.3</div>
    <div class="ff"><label class="fl">Investigation</label><textarea class="fta" rows="3" [(ngModel)]="form.investigation"></textarea></div>
    <div class="ff"><label class="fl">Root Cause</label><textarea class="fta" rows="2" [(ngModel)]="form.rootCause"></textarea></div>
    <div class="ff"><label class="fl">Corrective Action</label><textarea class="fta" rows="2" [(ngModel)]="form.correctiveAction"></textarea></div>
    <div class="fr">
      <div class="fc"><label class="fl">Response Date</label><input class="fi" type="date" [(ngModel)]="form.responseDate"/></div>
      <div class="fc" style="display:flex;align-items:center;gap:8px;padding-top:20px">
        <input type="checkbox" id="rs" [(ngModel)]="form.responseSent"/>
        <label for="rs" style="font-size:0.82rem;color:#475569;cursor:pointer">Response sent to complainant</label>
      </div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Status</label>
        <select class="fs" [(ngModel)]="form.status">
          <option value="OPEN">Open</option><option value="INVESTIGATING">Investigating</option>
          <option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option>
        </select>
      </div>
      <div class="fc"><label class="fl">Closed Date</label><input class="fi" type="date" [(ngModel)]="form.closedDate"/></div>
    </div>
    <div class="ff"><label class="fl">NCR Reference</label><input class="fi" [(ngModel)]="form.ncrReference"/></div>
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
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .htbl{width:100%;border-collapse:collapse}
    .htbl th{text-align:left;padding:10px 14px;font-size:0.66rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;white-space:nowrap}
    .htbl td{padding:9px 14px;border-bottom:1px solid #F1F5F9;font-size:0.81rem;vertical-align:middle}
    .htbl tr:last-child td{border-bottom:none}.htbl tr:hover td{background:#F8FAFC}
    .row-critical td{background:#FFF5F5}
    .font-medium{font-weight:600;color:#0D1B3E}.muted{color:#64748b;font-size:0.78rem}
    .mono-sm{font-family:monospace;font-size:0.77rem;color:#475569;white-space:nowrap}
    .desc-cell{max-width:180px;font-size:0.78rem;color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .id-chip{font-size:0.71rem;font-weight:600;padding:2px 8px;border-radius:6px}
    .sev-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .sev-chip.LOW{background:#F1F5F9;color:#64748b}.sev-chip.MEDIUM{background:#FEF9C3;color:#92400E}
    .sev-chip.HIGH{background:#FEE2E2;color:#991B1B}.sev-chip.CRITICAL{background:#FEE2E2;color:#7F1D1D;border:1px solid #FCA5A5}
    .yes-chip{font-size:0.68rem;font-weight:700;background:#DCFCE7;color:#166534;padding:2px 8px;border-radius:20px}
    .no-chip{font-size:0.68rem;font-weight:700;background:#FEF9C3;color:#92400E;padding:2px 8px;border-radius:20px}
    .st-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .st-chip.OPEN{background:#FEE2E2;color:#991B1B}.st-chip.INVESTIGATING{background:#E0F2FE;color:#075985}
    .st-chip.RESOLVED{background:#EDE9FE;color:#4C1D95}.st-chip.CLOSED{background:#DCFCE7;color:#166534}
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
export class ComplaintsComponent implements OnInit {
  complaints: any[] = []; statCards: any[] = [];
  search = ""; filterStatus = "";
  showDialog = false; editItem: any = null; form: any = {};

  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); this.loadStats(); }

  loadStats() {
    this.api.get<any>("/complaints/stats").subscribe({
      next: s => {
        this.statCards = [
          { label:"Total",    value:s.total   ??0, icon:"feedback",     color:"#5B21B6", bg:"#EDE9FE" },
          { label:"Open",     value:s.open    ??0, icon:"error",        color:"#EF4444", bg:"#FEE2E2" },
          { label:"Resolved", value:s.resolved??0, icon:"check_circle", color:"#10B981", bg:"#DCFCE7" },
          { label:"Closed",   value:s.closed  ??0, icon:"task_alt",     color:"#0891B2", bg:"#E0F2FE" },
        ];
      }, error: () => {}
    });
  }

  load() {
    this.api.get<any[]>("/complaints", { q: this.search || null, status: this.filterStatus || null }).subscribe({
      next: r => { this.complaints = r; }
    });
  }

  openNew() { this.editItem = null; this.form = { status:"OPEN", severity:"MEDIUM", responseSent:false, receivedDate: new Date().toISOString().slice(0,10) }; this.showDialog = true; }
  edit(c: any) { this.editItem = c; this.form = {...c}; this.showDialog = true; }

  save() {
    if (!this.form.complaintId || !this.form.description || !this.form.receivedDate) { this.snack.open("ID, Date and Description required","✕",{duration:3000}); return; }
    this.api.post("/complaints", this.form).subscribe({
      next: () => { this.snack.open("Saved ✓",""); this.showDialog=false; this.load(); this.loadStats(); },
      error: () => this.snack.open("Error","✕")
    });
  }

  sev(s: string): string { return s || "MEDIUM"; }
  cs(s: string): string { return s || "OPEN"; }
}
