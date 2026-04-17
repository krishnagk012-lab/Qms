import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-maintenance", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Maintenance Log</h2>
    <p>ISO 17025:2017 · Clause 6.4.13(g)(h) — Maintenance, repair, damage and inspection events</p>
  </div>

  <div class="toolbar-row">
    <div class="search-box">
      <mat-icon class="si">search</mat-icon>
      <input class="si-inp" [(ngModel)]="search" (input)="filter()" placeholder="Search EQ ID, description…"/>
    </div>
    <select class="ns" [(ngModel)]="filterEq" (change)="filter()">
      <option value="">All equipment</option>
      <option *ngFor="let e of equipList" [value]="e.eqId">{{e.eqId}} — {{e.name}}</option>
    </select>
    <select class="ns" [(ngModel)]="filterType" (change)="filter()">
      <option value="">All event types</option>
      <option value="MAINTENANCE">Maintenance</option>
      <option value="REPAIR">Repair</option>
      <option value="DAMAGE">Damage</option>
      <option value="INSPECTION">Inspection</option>
      <option value="INTERMEDIATE_CHECK">Intermediate Check</option>
      <option value="STATUS_CHANGE">Status Change</option>
      <option value="MODIFICATION">Modification</option>
    </select>
    <div class="toolbar-spacer"></div>
    <div class="count-lbl" *ngIf="filtered.length">{{filtered.length}} events</div>
    <button class="btn-p" (click)="openLog()"><mat-icon>add</mat-icon> Log Event</button>
  </div>

  <!-- NCR warning -->
  <div class="ncr-warn" *ngIf="unresolvedDamage > 0">
    <mat-icon>gpp_bad</mat-icon>
    <span><strong>{{unresolvedDamage}} damage event{{unresolvedDamage>1?"s":""}} with results affected and no NCR reference.</strong>
      Per Cl. 8.6 an NCR must be raised when previous results may have been invalidated.</span>
  </div>

  <div class="tcard">
    <table class="htbl">
      <thead>
        <tr>
          <th>Date</th><th>EQ ID</th><th>Equipment</th><th>Type</th>
          <th>Description</th><th>Work Done / Action</th>
          <th>Parts</th><th>By</th><th>NCR</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let h of filtered" [class.row-dmg]="h.eventType==='DAMAGE'">
          <td class="mono">{{h.eventDate | date:"dd MMM yyyy"}}</td>
          <td><span class="id-chip">{{h.eqId}}</span></td>
          <td class="eq-name">{{eqName(h.eqId)}}</td>
          <td><span class="tbadge" [class]="tc(h.eventType)">{{h.eventType.replace("_"," ")}}</span></td>
          <td class="desc">{{h.description}}</td>
          <td class="muted small">{{h.workDone || h.actionTaken || "—"}}</td>
          <td class="muted small">{{h.partsReplaced || "—"}}</td>
          <td class="muted">{{h.performedBy || "—"}}</td>
          <td>
            <span *ngIf="h.ncrReference" class="ncr-ref">{{h.ncrReference}}</span>
            <span *ngIf="!h.ncrReference && h.resultsAffected" class="ncr-missing">Required</span>
            <span *ngIf="!h.ncrReference && !h.resultsAffected" class="muted">—</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!filtered.length && !loading" class="empty">
      <mat-icon>build_circle</mat-icon>
      <p>No maintenance events yet.<br>Click <strong>Log Event</strong> to record maintenance, repair, or damage.</p>
    </div>
    <div *ngIf="loading" class="empty"><p style="color:#94A3B8">Loading…</p></div>
  </div>
</div>

<!-- ═══ LOG EVENT DIALOG ═══ -->
<div *ngIf="showDialog" class="overlay" (click)="showDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div>
      <h3>Log Maintenance Event</h3>
      <p>ISO 17025:2017 · Cl. 6.4.13(g)(h) — Record what was done</p>
    </div>
    <button class="ib" (click)="showDialog=false"><mat-icon>close</mat-icon></button>
  </div>
  <div class="sh-body">

    <div class="fr">
      <div class="fc">
        <label class="fl">Equipment <span class="rq">*</span></label>
        <select class="fs" [(ngModel)]="form.eqId">
          <option value="">— Select equipment —</option>
          <option *ngFor="let e of equipList" [value]="e.eqId">{{e.eqId}} — {{e.name}}</option>
        </select>
      </div>
      <div class="fc">
        <label class="fl">Event Type <span class="rq">*</span></label>
        <select class="fs" [(ngModel)]="form.eventType">
          <option value="MAINTENANCE">Maintenance</option>
          <option value="REPAIR">Repair</option>
          <option value="DAMAGE">Damage — Cl. 6.4.9</option>
          <option value="INSPECTION">Inspection</option>
          <option value="INTERMEDIATE_CHECK">Intermediate Check — Cl. 6.4.10</option>
          <option value="STATUS_CHANGE">Status Change</option>
          <option value="MODIFICATION">Modification / Firmware Update</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Event Date <span class="rq">*</span></label>
        <input class="fi" type="date" [(ngModel)]="form.eventDate"/>
      </div>
      <div class="fc">
        <label class="fl">Performed By</label>
        <input class="fi" [(ngModel)]="form.performedBy" placeholder="Name / service engineer"/>
      </div>
    </div>

    <div class="ff">
      <label class="fl">Description <span class="rq">*</span></label>
      <textarea class="fta" rows="3" [(ngModel)]="form.description"
        placeholder="What happened? What was done? Be specific — this is a permanent record."></textarea>
    </div>

    <!-- Maintenance / Repair fields -->
    <ng-container *ngIf="form.eventType==='MAINTENANCE'||form.eventType==='REPAIR'">
      <div class="sdiv">Work details</div>
      <div class="ff">
        <label class="fl">Work Done</label>
        <textarea class="fta" rows="2" [(ngModel)]="form.workDone"
          placeholder="Detail the work performed…"></textarea>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Parts Replaced</label>
          <input class="fi" [(ngModel)]="form.partsReplaced" placeholder="e.g. Desiccant, O-ring, fuse"/>
        </div>
        <div class="fc">
          <label class="fl">Next Maintenance Due</label>
          <input class="fi" type="date" [(ngModel)]="form.nextDueDate"/>
        </div>
      </div>
    </ng-container>

    <!-- Damage fields -->
    <ng-container *ngIf="form.eventType==='DAMAGE'">
      <div class="sdiv">Damage details <span class="itl warn">Cl. 6.4.9</span></div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Impact Level</label>
          <select class="fs" [(ngModel)]="form.impact">
            <option value="LOW">Low — minor, no effect on accuracy</option>
            <option value="MEDIUM">Medium — may have affected results</option>
            <option value="HIGH">High — results definitely affected</option>
            <option value="CRITICAL">Critical — instrument non-functional</option>
          </select>
        </div>
        <div class="fc">
          <label class="fl">Status After Incident</label>
          <select class="fs" [(ngModel)]="form.statusAfter">
            <option value="OUT OF SERVICE">Out of Service (Quarantined)</option>
            <option value="UNDER REPAIR">Sent for Repair</option>
            <option value="CALIBRATED">Returned to Service</option>
          </select>
        </div>
      </div>
      <div class="ff">
        <label class="fl">Action Taken</label>
        <textarea class="fta" rows="2" [(ngModel)]="form.actionTaken"
          placeholder="Steps taken immediately after incident…"></textarea>
      </div>
      <div class="fr">
        <div class="fc" style="display:flex;align-items:center;gap:8px;padding-top:20px">
          <input type="checkbox" id="ra" [(ngModel)]="form.resultsAffected" style="width:16px;height:16px"/>
          <label for="ra" style="font-size:0.82rem;color:#475569;cursor:pointer">Previous test results may have been affected</label>
        </div>
      </div>
      <div class="ff" *ngIf="form.resultsAffected">
        <label class="fl">NCR Reference <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.ncrReference" placeholder="e.g. NCR-2024-007"/>
        <span class="fh" style="color:#EF4444">An NCR must be raised per Cl. 8.6 and linked here</span>
      </div>
    </ng-container>

    <!-- Status change fields -->
    <ng-container *ngIf="form.eventType==='STATUS_CHANGE'">
      <div class="sdiv">Status details</div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Status Before</label>
          <select class="fs" [(ngModel)]="form.statusBefore">
            <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
          </select>
        </div>
        <div class="fc">
          <label class="fl">Status After</label>
          <select class="fs" [(ngModel)]="form.statusAfter">
            <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
          </select>
        </div>
      </div>
    </ng-container>

    <!-- Re-verification for damage/repair -->
    <ng-container *ngIf="form.eventType==='DAMAGE'||form.eventType==='REPAIR'">
      <div class="sdiv">Re-verification after repair</div>
      <div class="fr">
        <div class="fc" style="display:flex;align-items:center;gap:8px;padding-top:20px">
          <input type="checkbox" id="rv" [(ngModel)]="form.reVerified" style="width:16px;height:16px"/>
          <label for="rv" style="font-size:0.82rem;color:#475569;cursor:pointer">Equipment re-verified before returning to service</label>
        </div>
      </div>
      <div class="fr" *ngIf="form.reVerified">
        <div class="fc">
          <label class="fl">Re-verified By</label>
          <input class="fi" [(ngModel)]="form.reVerifiedBy" placeholder="Name and designation"/>
        </div>
        <div class="fc">
          <label class="fl">Re-verification Date</label>
          <input class="fi" type="date" [(ngModel)]="form.reVerifiedDate"/>
        </div>
      </div>
    </ng-container>

  </div>
  <div class="sh-ftr">
    <button class="bg" (click)="showDialog=false">Cancel</button>
    <button class="bp" (click)="save()"><mat-icon>save</mat-icon> Save Event</button>
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
    .ns{height:40px;padding:0 28px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;cursor:pointer;outline:none}
    .btn-p{display:inline-flex;align-items:center;gap:6px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 14px;font-size:0.84rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p:hover{background:#0E7490}.btn-p mat-icon{font-size:17px;width:17px;height:17px}
    .ncr-warn{display:flex;align-items:center;gap:10px;background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px 16px;font-size:0.81rem;color:#991B1B;margin-bottom:14px}
    .ncr-warn mat-icon{color:#EF4444;flex-shrink:0}
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .htbl{width:100%;border-collapse:collapse}
    .htbl th{text-align:left;padding:10px 14px;font-size:0.67rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;white-space:nowrap}
    .htbl td{padding:9px 14px;border-bottom:1px solid #F1F5F9;font-size:0.8rem;vertical-align:top}
    .htbl tr:last-child td{border-bottom:none}.htbl tr:hover td{background:#F8FAFC}
    .row-dmg td{background:#FFF5F5}
    .mono{font-family:monospace;font-size:0.76rem;color:#475569;white-space:nowrap}
    .muted{color:#64748b}.small{font-size:0.76rem}
    .eq-name{font-weight:500;color:#0D1B3E;max-width:140px}
    .desc{max-width:180px;line-height:1.4;color:#475569}
    .id-chip{font-size:0.71rem;font-weight:600;background:#EFF6FF;color:#1D4ED8;padding:2px 7px;border-radius:6px}
    .tbadge{font-size:0.67rem;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.3px}
    .tbadge.maint{background:#E0F2FE;color:#075985}.tbadge.repair{background:#EDE9FE;color:#4C1D95}
    .tbadge.damage{background:#FEE2E2;color:#991B1B}.tbadge.inspect{background:#F0FDF4;color:#166534}
    .tbadge.check{background:#F3E8FF;color:#6B21A8}.tbadge.status{background:#FEF9C3;color:#92400E}
    .tbadge.mod{background:#FFF7ED;color:#9A3412}.tbadge.other{background:#F1F5F9;color:#64748b}
    .ncr-ref{font-size:0.71rem;font-weight:600;background:#EFF6FF;color:#1D4ED8;padding:2px 7px;border-radius:6px}
    .ncr-missing{font-size:0.7rem;font-weight:700;background:#FEF2F2;color:#991B1B;padding:2px 7px;border-radius:6px}
    .empty{text-align:center;padding:50px;color:#94A3B8}.empty mat-icon{font-size:40px;width:40px;height:40px;display:block;margin:0 auto 12px}.empty p{font-size:0.84rem;line-height:1.6}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:700px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.71rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}.ib:hover{background:#F1F5F9}
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 200px)}
    .sh-ftr{display:flex;justify-content:flex-end;gap:8px;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .sdiv{font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;padding:12px 0 8px;border-top:1px solid #F1F5F9;margin-top:4px;display:flex;align-items:center;gap:8px}
    .itl{font-size:0.62rem;background:#EFF6FF;color:#3B82F6;padding:2px 6px;border-radius:4px;text-transform:none;font-weight:600}
    .itl.warn{background:#FEF2F2;color:#991B1B}
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:block;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}.it{font-size:0.59rem;background:#EFF6FF;color:#3B82F6;padding:1px 5px;border-radius:4px;margin-left:3px;text-transform:none;font-weight:600}
    .fi,.fs,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}
    .fi,.fs{height:40px;padding:0 12px}.fta{padding:9px 12px;resize:vertical}
    .fi:focus,.fs:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
    .fh{font-size:0.65rem;color:#94A3B8;margin-top:2px;display:block;line-height:1.4}
    .bg{display:inline-flex;align-items:center;gap:4px;background:transparent;color:#64748b;border:1.5px solid #E2E8F0;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}
    .bp{display:inline-flex;align-items:center;gap:4px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}.bp mat-icon{font-size:16px;width:16px;height:16px}
  `]
})
export class MaintenanceComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  equipList: any[] = [];
  equipMap: Record<string, string> = {};
  search = ""; filterType = ""; filterEq = "";
  loading = true; unresolvedDamage = 0;
  showDialog = false;
  form: any = {};

  statuses = ["CALIBRATED","DUE SOON","OVERDUE","OUT OF SERVICE","UNDER REPAIR","DECOMMISSIONED","IN VERIFICATION"];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() { this.loadEquip(); }

  loadEquip() {
    this.api.get<any>("/equipment", { size: 500 }).subscribe({
      next: r => {
        this.equipList = (r.content ?? r).sort((a: any, b: any) => a.eqId.localeCompare(b.eqId));
        this.equipList.forEach((e: any) => { this.equipMap[e.eqId] = e.name; });
        this.loadHistories(this.equipList.map((e: any) => e.eqId));
      }
    });
  }

  loadHistories(eqIds: string[]) {
    this.loading = true;
    let pending = eqIds.length;
    if (!pending) { this.loading = false; return; }
    const results: any[] = [];
    const maintTypes = ["MAINTENANCE","REPAIR","DAMAGE","INSPECTION","INTERMEDIATE_CHECK","STATUS_CHANGE","MODIFICATION","OTHER"];
    eqIds.forEach(eqId => {
      this.api.get<any[]>("/equipment/" + eqId + "/history").subscribe({
        next: h => { results.push(...h.filter((e: any) => maintTypes.includes(e.eventType))); },
        error: () => {},
        complete: () => { pending--; if (!pending) this.setAll(results); }
      });
    });
  }

  setAll(events: any[]) {
    this.all = events.sort((a: any, b: any) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    this.unresolvedDamage = this.all.filter(h => h.eventType === "DAMAGE" && h.resultsAffected && !h.ncrReference).length;
    this.loading = false;
    this.filter();
  }

  filter() {
    this.filtered = this.all.filter(h => {
      const s = this.search.toLowerCase();
      const ms = !s || h.eqId?.toLowerCase().includes(s) || h.description?.toLowerCase().includes(s);
      const mt = !this.filterType || h.eventType === this.filterType;
      const me = !this.filterEq || h.eqId === this.filterEq;
      return ms && mt && me;
    });
  }

  openLog() {
    this.form = {
      eventType: "MAINTENANCE",
      eventDate: new Date().toISOString().slice(0, 10),
      resultsAffected: false,
      reVerified: false,
    };
    this.showDialog = true;
  }

  save() {
    if (!this.form.eqId || !this.form.eventDate || !this.form.description) {
      this.snack.open("Fill all required fields", "✕", { duration: 3000 }); return;
    }
    this.api.post("/equipment/" + this.form.eqId + "/history", this.form).subscribe({
      next: () => {
        this.snack.open("Event logged ✓", "");
        this.showDialog = false;
        this.loadHistories(this.equipList.map((e: any) => e.eqId));
      },
      error: () => this.snack.open("Error saving", "✕")
    });
  }

  eqName(eqId: string): string { return this.equipMap[eqId] ?? "—"; }
  tc(t: string): string {
    const m: Record<string,string> = {
      MAINTENANCE:"maint", REPAIR:"repair", DAMAGE:"damage",
      INSPECTION:"inspect", INTERMEDIATE_CHECK:"check",
      STATUS_CHANGE:"status", MODIFICATION:"mod"
    };
    return m[t] ?? "other";
  }
}
