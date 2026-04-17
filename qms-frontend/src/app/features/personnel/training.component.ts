import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-training", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Training Records</h2>
    <p>ISO 17025:2017 · Clause 6.2.5(a)(b)(c) — Training, selection and competency determination records</p>
  </div>

  <!-- Stats -->
  <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="stat-card" *ngFor="let c of statCards">
      <div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div>
      <div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div>
    </div>
  </div>

  <!-- Toolbar -->
  <div class="toolbar-row">
    <div class="search-box">
      <mat-icon class="si">search</mat-icon>
      <input class="si-inp" [(ngModel)]="search" (input)="filter()" placeholder="Search training title, staff name…"/>
    </div>
    <select class="ns" [(ngModel)]="filterStaff" (change)="filter()">
      <option value="">All staff</option>
      <option *ngFor="let s of staffList" [value]="s.empId">{{s.empId}} — {{s.fullName}}</option>
    </select>
    <select class="ns" [(ngModel)]="filterType" (change)="filter()">
      <option value="">All types</option>
      <option value="INDUCTION">Induction</option>
      <option value="TECHNICAL">Technical</option>
      <option value="METHOD">Method Training</option>
      <option value="SAFETY">Safety</option>
      <option value="QUALITY">Quality / ISO</option>
      <option value="EXTERNAL">External Course</option>
      <option value="OJT">On-the-Job Training</option>
    </select>
    <select class="ns" [(ngModel)]="filterStatus" (change)="filter()">
      <option value="">All status</option>
      <option value="COMPLETED">Completed</option>
      <option value="SCHEDULED">Scheduled</option>
      <option value="OVERDUE">Overdue</option>
    </select>
    <div class="toolbar-spacer"></div>
    <div class="count-lbl" *ngIf="filtered.length">{{filtered.length}} records</div>
    <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> Add Training</button>
  </div>

  <!-- Overdue banner -->
  <div class="warn-banner" *ngIf="overdueCount > 0">
    <mat-icon>warning</mat-icon>
    <span><strong>{{overdueCount}} training record{{overdueCount>1?"s":""}} overdue.</strong>
      Per Cl. 6.2.5(f), overdue training must be addressed before personnel perform independent activities in that area.</span>
  </div>

  <!-- Table -->
  <div class="tcard">
    <table class="htbl">
      <thead>
        <tr>
          <th>Training ID</th>
          <th>Title</th>
          <th>Type <span class="cl">Cl.6.2.5c</span></th>
          <th>Applicable To <span class="cl">Cl.6.2.5b</span></th>
          <th>Completed</th>
          <th>Next Due <span class="cl">Cl.6.2.5f</span></th>
          <th>Status</th>
          <th>Notes</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of filtered" [class.row-overdue]="t.status==='OVERDUE'">
          <td><span class="id-chip">{{t.trainingId}}</span></td>
          <td class="t-title">{{t.title}}</td>
          <td><span class="type-chip" [class]="tc(t.trainingType)">{{t.trainingType || "—"}}</span></td>
          <td class="muted">{{staffName(t.applicableTo) || t.applicableTo || "All staff"}}</td>
          <td class="mono">{{(t.dateCompleted | date:"dd MMM yyyy") || "—"}}</td>
          <td>
            <div class="next-due" [class.od]="isOverdue(t.nextDue)" [class.soon]="!isOverdue(t.nextDue)&&isSoon(t.nextDue)">
              <mat-icon *ngIf="isOverdue(t.nextDue)" style="font-size:12px;width:12px;height:12px">warning</mat-icon>
              {{(t.nextDue | date:"dd MMM yyyy") || "—"}}
            </div>
          </td>
          <td><span class="sbadge" [class]="sc(t.status)">{{t.status}}</span></td>
          <td class="notes">{{t.notes || "—"}}</td>
          <td>
            <button class="edit-btn" (click)="openEdit(t)">
              <mat-icon style="font-size:15px;width:15px;height:15px">edit</mat-icon>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!filtered.length && !loading" class="empty">
      <mat-icon>school</mat-icon>
      <p>No training records yet.<br>Click <strong>Add Training</strong> to record the first training.</p>
    </div>
    <div *ngIf="loading" class="empty"><p style="color:#94A3B8">Loading…</p></div>
  </div>
</div>

<!-- ═══ ADD/EDIT DIALOG ═══ -->
<div *ngIf="showDialog" class="overlay" (click)="showDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div>
      <h3>{{editItem ? "Edit Training Record" : "Add Training Record"}}</h3>
      <p>ISO 17025:2017 · Cl. 6.2.5(c) — Training of personnel</p>
    </div>
    <button class="ib" (click)="showDialog=false"><mat-icon>close</mat-icon></button>
  </div>
  <div class="sh-body">

    <div class="banner blue"><mat-icon>info_outline</mat-icon>
      <span><strong>Cl. 6.2.5(c)</strong> — Training records must be retained for all training of personnel. <strong>Cl. 6.2.5(f)</strong> — Records of monitoring competence must be maintained.</span>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Training ID <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.trainingId" placeholder="e.g. TRN-001" [readonly]="!!editItem"/>
      </div>
      <div class="fc">
        <label class="fl">Training Type <span class="rq">*</span></label>
        <select class="fs" [(ngModel)]="form.trainingType">
          <option value="INDUCTION">Induction</option>
          <option value="TECHNICAL">Technical</option>
          <option value="METHOD">Method Training</option>
          <option value="SAFETY">Safety</option>
          <option value="QUALITY">Quality / ISO</option>
          <option value="EXTERNAL">External Course</option>
          <option value="OJT">On-the-Job Training</option>
        </select>
      </div>
    </div>

    <div class="ff">
      <label class="fl">Training Title <span class="rq">*</span></label>
      <input class="fi" [(ngModel)]="form.title" placeholder=""/>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Applicable To <span class="rq">*</span> <span class="cl-tag">Cl.6.2.5b</span></label>
        <select class="fs" [(ngModel)]="form.applicableTo">
          <option value="">All staff</option>
          <option *ngFor="let s of staffList" [value]="s.empId">{{s.empId}} — {{s.fullName}}</option>
        </select>
        <span class="fh">Select specific staff member or leave blank for all</span>
      </div>
      <div class="fc">
        <label class="fl">Status</label>
        <select class="fs" [(ngModel)]="form.status">
          <option value="COMPLETED">Completed</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Date Completed</label>
        <input class="fi" type="date" [(ngModel)]="form.dateCompleted"/>
      </div>
      <div class="fc">
        <label class="fl">Next Refresher Due <span class="cl-tag">Cl.6.2.5f</span></label>
        <input class="fi" type="date" [(ngModel)]="form.nextDue"/>
        <span class="fh">Required if training needs periodic renewal</span>
      </div>
    </div>

    <div class="ff">
      <label class="fl">Notes / Outcome</label>
      <textarea class="fta" rows="3" [(ngModel)]="form.notes" placeholder=""></textarea>
    </div>

  </div>
  <div class="sh-ftr">
    <button class="bg" (click)="showDialog=false">Cancel</button>
    <button class="bp" (click)="save()"><mat-icon>save</mat-icon> Save Training</button>
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
    .btn-p{display:inline-flex;align-items:center;gap:5px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 14px;font-size:0.83rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p:hover{background:#0E7490}.btn-p mat-icon{font-size:17px;width:17px;height:17px}
    .warn-banner{display:flex;align-items:center;gap:10px;background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px 16px;font-size:0.81rem;color:#991B1B;margin-bottom:14px}
    .warn-banner mat-icon{color:#EF4444;flex-shrink:0}
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .htbl{width:100%;border-collapse:collapse}
    .htbl th{text-align:left;padding:10px 14px;font-size:0.66rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;white-space:nowrap}
    .htbl td{padding:9px 14px;border-bottom:1px solid #F1F5F9;font-size:0.81rem;vertical-align:middle}
    .htbl tr:last-child td{border-bottom:none}.htbl tr:hover td{background:#F8FAFC}
    .row-overdue td{background:#FFF5F5}
    .cl{font-size:0.58rem;background:#F1F5F9;color:#94A3B8;padding:1px 4px;border-radius:3px;margin-left:3px;font-weight:600}
    .t-title{font-weight:500;color:#0D1B3E;max-width:200px}
    .muted{color:#64748b;font-size:0.79rem}
    .mono{font-family:monospace;font-size:0.77rem;color:#475569;white-space:nowrap}
    .notes{font-size:0.75rem;color:#94A3B8;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .next-due{font-size:0.78rem;display:flex;align-items:center;gap:3px;color:#64748b;white-space:nowrap}
    .next-due.od{color:#EF4444;font-weight:600}.next-due.soon{color:#F59E0B;font-weight:600}
    .id-chip{font-size:0.71rem;font-weight:600;background:#EDE9FE;color:#5B21B6;padding:2px 7px;border-radius:6px}
    .type-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase}
    .type-chip.ind{background:#EDE9FE;color:#4C1D95}.type-chip.tech{background:#E0F2FE;color:#075985}
    .type-chip.meth{background:#DCFCE7;color:#166534}.type-chip.safe{background:#FEE2E2;color:#991B1B}
    .type-chip.qual{background:#FEF9C3;color:#92400E}.type-chip.ext{background:#F3E8FF;color:#6B21A8}
    .type-chip.ojt{background:#FFF7ED;color:#9A3412}.type-chip.def{background:#F1F5F9;color:#64748b}
    .sbadge{font-size:0.7rem;font-weight:700;padding:2px 9px;border-radius:20px}
    .sbadge.comp{background:#DCFCE7;color:#166534}.sbadge.sched{background:#E0F2FE;color:#075985}.sbadge.over{background:#FEE2E2;color:#991B1B}.sbadge.def{background:#F1F5F9;color:#64748b}
    .edit-btn{display:inline-flex;align-items:center;background:transparent;border:none;cursor:pointer;color:#94A3B8;padding:4px;border-radius:6px}.edit-btn:hover{background:#F1F5F9;color:#475569}
    .empty{text-align:center;padding:50px;color:#94A3B8}.empty mat-icon{font-size:40px;width:40px;height:40px;display:block;margin:0 auto 12px}.empty p{font-size:0.84rem;line-height:1.6}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:640px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.71rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}.ib:hover{background:#F1F5F9}
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 200px)}
    .sh-ftr{display:flex;justify-content:flex-end;gap:8px;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .banner{display:flex;align-items:flex-start;gap:8px;border-radius:8px;padding:10px 13px;font-size:0.76rem;line-height:1.5;margin-bottom:15px}
    .banner mat-icon{font-size:15px;width:15px;height:15px;flex-shrink:0;margin-top:1px}
    .banner.blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF}.banner.blue mat-icon{color:#3B82F6}
    .cl-tag{font-size:0.59rem;background:#EFF6FF;color:#3B82F6;padding:1px 5px;border-radius:4px;margin-left:3px;font-weight:600}
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
export class TrainingComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  staffList: any[] = [];
  staffMap: Record<string, string> = {};
  search = ""; filterStaff = ""; filterType = ""; filterStatus = "";
  loading = true; overdueCount = 0;
  showDialog = false; editItem: any = null;
  form: any = {};
  statCards: any[] = [];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.loadStaff();
    this.loadTrainings();
  }

  loadStaff() {
    this.api.get<any>("/personnel", { size: 200 }).subscribe({
      next: r => {
        this.staffList = (r.content ?? r).sort((a: any, b: any) => a.empId.localeCompare(b.empId));
        this.staffList.forEach((s: any) => { this.staffMap[s.empId] = s.fullName; });
      }
    });
  }

  loadTrainings() {
    this.loading = true;
    this.api.get<any[]>("/personnel/trainings").subscribe({
      next: t => {
        this.all = t.sort((a: any, b: any) => {
          // Overdue first, then by nextDue
          if (a.status === "OVERDUE" && b.status !== "OVERDUE") return -1;
          if (b.status === "OVERDUE" && a.status !== "OVERDUE") return 1;
          if (!a.nextDue) return 1; if (!b.nextDue) return -1;
          return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
        });
        this.overdueCount = this.all.filter(x => x.status === "OVERDUE").length;
        const completed = this.all.filter(x => x.status === "COMPLETED").length;
        const scheduled = this.all.filter(x => x.status === "SCHEDULED").length;
        this.statCards = [
          { label:"Total",     value:this.all.length, icon:"school",     color:"#5B21B6", bg:"#EDE9FE" },
          { label:"Completed", value:completed,        icon:"check_circle",color:"#10B981", bg:"#DCFCE7" },
          { label:"Scheduled", value:scheduled,        icon:"event",      color:"#0891B2", bg:"#E0F2FE" },
          { label:"Overdue",   value:this.overdueCount,icon:"warning",    color:"#EF4444", bg:"#FEE2E2" },
        ];
        this.loading = false;
        this.filter();
      },
      error: () => { this.loading = false; }
    });
  }

  filter() {
    this.filtered = this.all.filter(t => {
      const s = this.search.toLowerCase();
      const ms = !s || t.title?.toLowerCase().includes(s) || t.applicableTo?.toLowerCase().includes(s)
        || this.staffName(t.applicableTo)?.toLowerCase().includes(s);
      const mst = !this.filterStaff || t.applicableTo === this.filterStaff;
      const mt  = !this.filterType   || t.trainingType === this.filterType;
      const mss = !this.filterStatus || t.status === this.filterStatus;
      return ms && mst && mt && mss;
    });
  }

  openNew() {
    this.editItem = null;
    this.form = { status: "COMPLETED", trainingType: "TECHNICAL" };
    this.showDialog = true;
  }

  openEdit(t: any) {
    this.editItem = t;
    this.form = { ...t };
    this.showDialog = true;
  }

  save() {
    if (!this.form.trainingId || !this.form.title) {
      this.snack.open("Training ID and Title are required", "✕", { duration: 3000 }); return;
    }
    this.api.post("/personnel/trainings", this.form).subscribe({
      next: () => {
        this.snack.open("Saved ✓", "");
        this.showDialog = false;
        this.loadTrainings();
      },
      error: () => this.snack.open("Error saving", "✕")
    });
  }

  staffName(empId: string): string { return this.staffMap[empId] ?? ""; }
  isOverdue(d: string): boolean { return !!d && new Date(d) < new Date(); }
  isSoon(d: string): boolean {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff > 0 && diff < 30 * 86400000;
  }
  tc(t: string): string {
    const m: Record<string,string> = { INDUCTION:"ind", TECHNICAL:"tech", METHOD:"meth",
      SAFETY:"safe", QUALITY:"qual", EXTERNAL:"ext", OJT:"ojt" };
    return m[t] ?? "def";
  }
  sc(s: string): string {
    if (s === "COMPLETED") return "comp";
    if (s === "SCHEDULED")  return "sched";
    if (s === "OVERDUE")    return "over";
    return "def";
  }
}
