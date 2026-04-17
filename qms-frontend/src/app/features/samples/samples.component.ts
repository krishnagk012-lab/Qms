import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-samples", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Sample Handling Log</h2>
    <p>ISO 17025:2017 · Clause 7.4 — Handling of test and calibration items</p>
  </div>
  <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="stat-card" *ngFor="let c of statCards">
      <div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div>
      <div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div>
    </div>
  </div>
  <div class="toolbar-row">
    <div class="search-box"><mat-icon class="si">search</mat-icon>
      <input class="si-inp" [(ngModel)]="search" (input)="load()" placeholder="Search sample ID, client…"/></div>
    <select class="ns" [(ngModel)]="filterStatus" (change)="load()">
      <option value="">All status</option>
      <option value="RECEIVED">Received</option><option value="IN_TESTING">In Testing</option>
      <option value="COMPLETED">Completed</option><option value="DISPOSED">Disposed</option>
    </select>
    <div class="toolbar-spacer"></div>
    <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> Register Sample</button>
  </div>
  <div class="tcard">
    <table class="htbl">
      <thead><tr>
        <th>Sample ID</th><th>Received</th><th>Client</th><th>Description</th>
        <th>Condition</th><th>Storage</th><th>Tests Requested</th>
        <th>Priority</th><th>Status</th><th></th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let s of samples" [class.row-comp]="s.conditionOnArrival==='COMPROMISED'" [class.row-rej]="s.conditionOnArrival==='REJECTED'">
          <td><span class="id-chip" style="background:#F0F9FF;color:#0369A1">{{s.sampleId}}</span></td>
          <td class="mono-sm">{{s.receivedDate | date:"dd MMM yyyy HH:mm"}}</td>
          <td class="font-medium">{{s.client || "—"}}</td>
          <td class="desc-cell">{{s.sampleDescription || "—"}}</td>
          <td><span class="cond-chip" [class]="cc(s.conditionOnArrival)">{{s.conditionOnArrival}}</span></td>
          <td class="muted">{{s.storageLocation || "—"}}<div *ngIf="s.storageTemp" class="muted">{{s.storageTemp}}</div></td>
          <td class="desc-cell">{{s.testsRequested || "—"}}</td>
          <td><span class="pri-chip" [class]="pc(s.priority)">{{s.priority}}</span></td>
          <td><span class="st-chip" [class]="sc(s.status)">{{s.status?.replace('_',' ')}}</span></td>
          <td><button class="icon-btn" (click)="edit(s)"><mat-icon style="font-size:16px;color:#94A3B8">edit</mat-icon></button></td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!samples.length" class="empty">
      <mat-icon>science</mat-icon>
      <p>No samples registered.<br>Click <strong>Register Sample</strong> to log the first sample receipt.</p>
    </div>
  </div>
</div>

<div *ngIf="showDialog" class="overlay" (click)="showDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div><h3>{{editItem?.id?"Edit":"Register"}} Sample</h3>
    <p>ISO 17025:2017 · Cl. 7.4 — Sample receipt and handling record</p></div>
    <button class="ib" (click)="showDialog=false"><mat-icon>close</mat-icon></button>
  </div>
  <div class="sh-body">
    <div class="banner blue"><mat-icon>info_outline</mat-icon>
      <span><strong>Cl. 7.4</strong> — Record condition on arrival, deviations from specified conditions, assign unique identification, and document storage and disposal. Compromised samples must be noted on results.</span>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Sample ID <span class="rq">*</span></label><input class="fi" [(ngModel)]="form.sampleId" [readonly]="!!editItem?.id"/></div>
      <div class="fc"><label class="fl">Priority</label>
        <select class="fs" [(ngModel)]="form.priority">
          <option value="URGENT">Urgent</option><option value="NORMAL">Normal</option><option value="ROUTINE">Routine</option>
        </select>
      </div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Date & Time Received</label><input class="fi" type="datetime-local" [(ngModel)]="form.receivedDateLocal"/></div>
      <div class="fc"><label class="fl">Received By</label><input class="fi" [(ngModel)]="form.receivedBy"/></div>
    </div>
    <div class="ff"><label class="fl">Client / Submitter <span class="rq">*</span></label><input class="fi" [(ngModel)]="form.client"/></div>
    <div class="ff"><label class="fl">Sample Description</label><textarea class="fta" rows="2" [(ngModel)]="form.sampleDescription"></textarea></div>
    <div class="fr">
      <div class="fc"><label class="fl">Matrix / Sample Type</label><input class="fi" [(ngModel)]="form.matrix"/></div>
      <div class="fc"><label class="fl">Quantity</label><input class="fi" [(ngModel)]="form.quantity"/></div>
    </div>
    <div class="sdiv">Condition on Arrival — Cl. 7.4.2</div>
    <div class="fr">
      <div class="fc"><label class="fl">Condition <span class="rq">*</span></label>
        <select class="fs" [(ngModel)]="form.conditionOnArrival">
          <option value="ACCEPTABLE">Acceptable</option>
          <option value="COMPROMISED">Compromised — note on results</option>
          <option value="REJECTED">Rejected — not accepted for testing</option>
        </select>
      </div>
    </div>
    <div class="ff" *ngIf="form.conditionOnArrival!=='ACCEPTABLE'">
      <label class="fl">Condition Notes <span class="rq">*</span></label>
      <textarea class="fta" rows="2" [(ngModel)]="form.conditionNotes"></textarea>
    </div>
    <div class="sdiv">Storage</div>
    <div class="fr">
      <div class="fc"><label class="fl">Storage Location</label><input class="fi" [(ngModel)]="form.storageLocation"/></div>
      <div class="fc"><label class="fl">Storage Temperature</label><input class="fi" [(ngModel)]="form.storageTemp"/></div>
    </div>
    <div class="sdiv">Testing</div>
    <div class="ff"><label class="fl">Tests Requested</label><textarea class="fta" rows="2" [(ngModel)]="form.testsRequested"></textarea></div>
    <div class="ff"><label class="fl">Method References</label><input class="fi" [(ngModel)]="form.methodReferences"/></div>
    <div class="fr">
      <div class="fc"><label class="fl">Linked Report / Certificate</label><input class="fi" [(ngModel)]="form.linkedReport"/></div>
      <div class="fc"><label class="fl">Status</label>
        <select class="fs" [(ngModel)]="form.status">
          <option value="RECEIVED">Received</option><option value="IN_TESTING">In Testing</option>
          <option value="COMPLETED">Completed</option><option value="DISPOSED">Disposed</option>
        </select>
      </div>
    </div>
    <div class="sdiv" *ngIf="form.status==='DISPOSED'">Disposal — Cl. 7.4.5</div>
    <div class="fr" *ngIf="form.status==='DISPOSED'">
      <div class="fc"><label class="fl">Disposal Date</label><input class="fi" type="date" [(ngModel)]="form.disposalDate"/></div>
      <div class="fc"><label class="fl">Disposal Method</label><input class="fi" [(ngModel)]="form.disposalMethod"/></div>
    </div>
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
    .row-comp td{background:#FFFBEB}.row-rej td{background:#FFF5F5}
    .font-medium{font-weight:600;color:#0D1B3E}.muted{color:#64748b;font-size:0.78rem}
    .mono-sm{font-family:monospace;font-size:0.77rem;color:#475569;white-space:nowrap}
    .desc-cell{max-width:160px;font-size:0.78rem;color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .id-chip{font-size:0.71rem;font-weight:600;padding:2px 8px;border-radius:6px}
    .cond-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .cond-chip.ACCEPTABLE{background:#DCFCE7;color:#166534}.cond-chip.COMPROMISED{background:#FEF9C3;color:#92400E}.cond-chip.REJECTED{background:#FEE2E2;color:#991B1B}
    .pri-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .pri-chip.URGENT{background:#FEE2E2;color:#991B1B}.pri-chip.NORMAL{background:#E0F2FE;color:#075985}.pri-chip.ROUTINE{background:#F1F5F9;color:#64748b}
    .st-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .st-chip.RECEIVED{background:#E0F2FE;color:#075985}.st-chip.IN{background:#EDE9FE;color:#4C1D95}
    .st-chip.COMPLETED{background:#DCFCE7;color:#166534}.st-chip.DISPOSED{background:#F1F5F9;color:#64748b}
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
export class SamplesComponent implements OnInit {
  samples: any[] = []; statCards: any[] = [];
  search = ""; filterStatus = "";
  showDialog = false; editItem: any = null; form: any = {};

  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); this.loadStats(); }

  loadStats() {
    this.api.get<any>("/samples/stats").subscribe({
      next: s => {
        this.statCards = [
          { label:"Total",      value:s.total    ??0, icon:"science",     color:"#5B21B6", bg:"#EDE9FE" },
          { label:"Received",   value:s.received ??0, icon:"inbox",       color:"#0891B2", bg:"#E0F2FE" },
          { label:"In Testing", value:s.inTesting??0, icon:"biotech",     color:"#F59E0B", bg:"#FEF3C7" },
          { label:"Completed",  value:s.completed??0, icon:"task_alt",    color:"#10B981", bg:"#DCFCE7" },
        ];
      }, error: () => {}
    });
  }

  load() {
    this.api.get<any[]>("/samples", { q: this.search || null, status: this.filterStatus || null }).subscribe({
      next: r => { this.samples = r; }
    });
  }

  openNew() {
    this.editItem = null;
    const now = new Date().toISOString().slice(0,16);
    this.form = { status:"RECEIVED", priority:"NORMAL", conditionOnArrival:"ACCEPTABLE", receivedDateLocal: now };
    this.showDialog = true;
  }
  edit(s: any) {
    this.editItem = s;
    this.form = { ...s, receivedDateLocal: s.receivedDate ? new Date(s.receivedDate).toISOString().slice(0,16) : "" };
    this.showDialog = true;
  }

  save() {
    if (!this.form.sampleId || !this.form.client) { this.snack.open("Sample ID and Client required","✕",{duration:3000}); return; }
    const payload = { ...this.form, receivedDate: this.form.receivedDateLocal ? new Date(this.form.receivedDateLocal).toISOString() : null };
    this.api.post("/samples", payload).subscribe({
      next: () => { this.snack.open("Saved ✓",""); this.showDialog=false; this.load(); this.loadStats(); },
      error: () => this.snack.open("Error","✕")
    });
  }

  cc(s: string): string { return s || "ACCEPTABLE"; }
  pc(s: string): string { return s || "NORMAL"; }
  sc(s: string): string { return (s||"").split("_")[0]; }
}
