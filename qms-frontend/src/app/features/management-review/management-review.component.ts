import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-management-review", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Management Review</h2>
    <p>ISO 17025:2017 · Clause 8.9 — Management review of the laboratory's management system</p>
  </div>

  <div class="toolbar-row">
    <div class="toolbar-spacer"></div>
    <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> New Review</button>
  </div>

  <!-- Review cards -->
  <div *ngIf="!reviews.length" class="empty-card">
    <mat-icon>rate_review</mat-icon>
    <p>No management reviews recorded.<br>Click <strong>New Review</strong> to document your first management review meeting.</p>
  </div>

  <div class="review-card" *ngFor="let r of reviews">
    <div class="rc-hdr">
      <div class="rc-left">
        <span class="id-chip">{{r.reviewId}}</span>
        <div class="rc-date">{{r.reviewDate | date:"dd MMMM yyyy"}}</div>
        <div class="rc-chair" *ngIf="r.chairedBy">Chaired by {{r.chairedBy}}</div>
      </div>
      <div class="rc-right">
        <span class="st-badge" [class]="r.status==='APPROVED'?'approved':'draft'">{{r.status}}</span>
        <span class="next-lbl" *ngIf="r.nextReviewDate">Next: {{r.nextReviewDate | date:"MMM yyyy"}}</span>
        <button class="icon-btn" (click)="edit(r)"><mat-icon style="font-size:16px;color:#94A3B8">edit</mat-icon></button>
      </div>
    </div>
    <div class="rc-body">
      <div class="rc-section">
        <div class="rc-sec-title">Attendees</div>
        <div class="rc-sec-val">{{r.attendees || "—"}}</div>
      </div>
      <div class="rc-grid">
        <div class="rc-item" *ngIf="r.outputActionItems">
          <div class="rc-item-lbl"><mat-icon>task_alt</mat-icon> Action Items</div>
          <div class="rc-item-val">{{r.outputActionItems}}</div>
        </div>
        <div class="rc-item" *ngIf="r.outputImprovements">
          <div class="rc-item-lbl"><mat-icon>trending_up</mat-icon> Improvements</div>
          <div class="rc-item-val">{{r.outputImprovements}}</div>
        </div>
        <div class="rc-item" *ngIf="r.outputResourceNeeds">
          <div class="rc-item-lbl"><mat-icon>inventory</mat-icon> Resource Needs</div>
          <div class="rc-item-val">{{r.outputResourceNeeds}}</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ═══ DIALOG ═══ -->
<div *ngIf="showDialog" class="overlay" (click)="closeDialog()">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div>
      <h3>{{editItem?.id ? "Edit" : "New"}} Management Review</h3>
      <p>ISO 17025:2017 · Cl. 8.9 — Annual management review record</p>
    </div>
    <button class="ib" (click)="closeDialog()"><mat-icon>close</mat-icon></button>
  </div>

  <div class="tabs">
    <button *ngFor="let t of tabs; let i=index" class="tab" [class.on]="activeTab===i" (click)="activeTab=i">
      <mat-icon>{{t.ic}}</mat-icon>{{t.lbl}}
    </button>
  </div>

  <div class="sh-body">

    <!-- TAB 0: Meeting Details -->
    <div *ngIf="activeTab===0">
      <div class="banner blue"><mat-icon>info_outline</mat-icon>
        <span><strong>Cl. 8.9.1</strong> — Top management shall review the laboratory's management system at planned intervals to ensure suitability, adequacy and effectiveness, including stated policies and objectives.</span>
      </div>
      <div class="fr">
        <div class="fc"><label class="fl">Review ID <span class="rq">*</span></label>
          <input class="fi" [(ngModel)]="form.reviewId" [readonly]="!!editItem?.id"/></div>
        <div class="fc"><label class="fl">Review Date <span class="rq">*</span></label>
          <input class="fi" type="date" [(ngModel)]="form.reviewDate"/></div>
      </div>
      <div class="fr">
        <div class="fc"><label class="fl">Chaired By</label>
          <input class="fi" [(ngModel)]="form.chairedBy"/></div>
        <div class="fc"><label class="fl">Next Review Date</label>
          <input class="fi" type="date" [(ngModel)]="form.nextReviewDate"/></div>
      </div>
      <div class="ff"><label class="fl">Attendees</label>
        <textarea class="fta" rows="3" [(ngModel)]="form.attendees"></textarea></div>
      <div class="fr">
        <div class="fc"><label class="fl">Status</label>
          <select class="fs" [(ngModel)]="form.status">
            <option value="DRAFT">Draft — minutes pending approval</option>
            <option value="APPROVED">Approved — minutes signed off</option>
          </select>
        </div>
        <div class="fc"><label class="fl">Approved By</label>
          <input class="fi" [(ngModel)]="form.approvedBy"/></div>
      </div>
      <div class="fr">
        <div class="fc"><label class="fl">Approval Date</label>
          <input class="fi" type="date" [(ngModel)]="form.approvedDate"/></div>
      </div>
    </div>

    <!-- TAB 1: Inputs Cl.8.9.2 -->
    <div *ngIf="activeTab===1">
      <div class="banner blue"><mat-icon>input</mat-icon>
        <span><strong>Cl. 8.9.2</strong> — The management review shall consider all 12 input items listed below. Record discussion notes for each item — assessors check that all inputs are addressed.</span>
      </div>
      <div class="input-item" *ngFor="let inp of inputItems">
        <div class="inp-lbl">{{inp.label}} <span class="cl-tag">{{inp.cl}}</span></div>
        <textarea class="fta" rows="2" [(ngModel)]="form[inp.key]"></textarea>
      </div>
    </div>

    <!-- TAB 2: Outputs Cl.8.9.3 -->
    <div *ngIf="activeTab===2">
      <div class="banner blue"><mat-icon>output</mat-icon>
        <span><strong>Cl. 8.9.3</strong> — Outputs shall include decisions and actions related to: effectiveness of the management system, improvement of laboratory activities, resource needs, and any changes needed.</span>
      </div>
      <div class="ff"><label class="fl">Assessment of QMS Effectiveness <span class="rq-col">Cl.8.9.3(a)</span></label>
        <textarea class="fta" rows="3" [(ngModel)]="form.outputQmsEffectiveness"></textarea></div>
      <div class="ff"><label class="fl">Improvement Decisions <span class="rq-col">Cl.8.9.3(b)</span></label>
        <textarea class="fta" rows="3" [(ngModel)]="form.outputImprovements"></textarea></div>
      <div class="ff"><label class="fl">Resource Needs <span class="rq-col">Cl.8.9.3(c)</span></label>
        <textarea class="fta" rows="3" [(ngModel)]="form.outputResourceNeeds"></textarea></div>
      <div class="ff"><label class="fl">Action Items (Owner / Due Date)</label>
        <textarea class="fta" rows="4" [(ngModel)]="form.outputActionItems"></textarea></div>
      <div class="ff"><label class="fl">Additional Notes</label>
        <textarea class="fta" rows="2" [(ngModel)]="form.notes"></textarea></div>
    </div>

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
      <button *ngIf="activeTab===tabs.length-1" class="bp" (click)="save()"><mat-icon>save</mat-icon> Save Review</button>
    </div>
  </div>
</div>
</div>
`,
  styles: [`
    .page-wrap{padding:24px;max-width:1200px;margin:0 auto}
    .page-header{margin-bottom:18px}.page-header h2{font-size:1.25rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.page-header p{font-size:0.76rem;color:#94A3B8;margin:0}
    .toolbar-row{display:flex;align-items:center;gap:10px;margin-bottom:20px}
    .toolbar-spacer{flex:1}
    .btn-p{display:inline-flex;align-items:center;gap:5px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 14px;font-size:0.83rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p mat-icon{font-size:17px;width:17px;height:17px}
    .empty-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;text-align:center;padding:60px;color:#94A3B8}
    .empty-card mat-icon{font-size:48px;width:48px;height:48px;display:block;margin:0 auto 12px}
    .empty-card p{font-size:0.84rem;line-height:1.6}
    .review-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;margin-bottom:14px}
    .rc-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:#F8FAFC;border-bottom:1px solid #F1F5F9}
    .rc-left{display:flex;align-items:center;gap:12px}
    .rc-date{font-size:0.92rem;font-weight:700;color:#0D1B3E}
    .rc-chair{font-size:0.75rem;color:#94A3B8}
    .rc-right{display:flex;align-items:center;gap:10px}
    .next-lbl{font-size:0.72rem;color:#94A3B8}
    .id-chip{font-size:0.71rem;font-weight:600;background:#EFF6FF;color:#1D4ED8;padding:2px 8px;border-radius:6px}
    .st-badge{font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:20px}
    .st-badge.approved{background:#DCFCE7;color:#166534}.st-badge.draft{background:#FEF9C3;color:#92400E}
    .rc-body{padding:14px 18px}
    .rc-section{margin-bottom:12px}
    .rc-sec-title{font-size:0.67rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
    .rc-sec-val{font-size:0.82rem;color:#475569}
    .rc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .rc-item{background:#F8FAFC;border-radius:8px;padding:10px 12px;border:1px solid #F1F5F9}
    .rc-item-lbl{display:flex;align-items:center;gap:5px;font-size:0.67rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px}
    .rc-item-lbl mat-icon{font-size:13px;width:13px;height:13px}
    .rc-item-val{font-size:0.78rem;color:#0D1B3E;line-height:1.5;max-height:80px;overflow:hidden}
    .icon-btn{background:transparent;border:none;cursor:pointer;display:inline-flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:800px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.71rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}
    .tabs{display:flex;border-bottom:1px solid #E2E8F0;padding:0 22px}
    .tab{display:flex;align-items:center;gap:5px;padding:11px 14px;background:transparent;border:none;border-bottom:2px solid transparent;cursor:pointer;font-size:0.76rem;font-weight:600;color:#94A3B8;white-space:nowrap;margin-bottom:-1px;font-family:inherit;transition:color .15s,border-color .15s}
    .tab mat-icon{font-size:14px;width:14px;height:14px}
    .tab.on{color:#0891B2;border-bottom-color:#0891B2}
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 280px)}
    .sh-ftr{display:flex;align-items:center;justify-content:space-between;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .banner{display:flex;align-items:flex-start;gap:8px;border-radius:8px;padding:10px 13px;font-size:0.76rem;line-height:1.5;margin-bottom:15px}
    .banner mat-icon{font-size:15px;width:15px;height:15px;flex-shrink:0;margin-top:1px}
    .banner.blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF}.banner.blue mat-icon{color:#3B82F6}
    .input-item{margin-bottom:14px}
    .inp-lbl{font-size:0.67rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;display:flex;align-items:center;gap:6px}
    .cl-tag{font-size:0.59rem;background:#EFF6FF;color:#3B82F6;padding:1px 5px;border-radius:4px;text-transform:none;font-weight:600}
    .rq-col{font-size:0.62rem;color:#F59E0B;font-weight:500;margin-left:4px;text-transform:none}
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:block;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}
    .fi,.fs,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;box-sizing:border-box}
    .fi,.fs{height:40px;padding:0 12px}.fta{padding:9px 12px;resize:vertical}
    .fi:focus,.fs:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
    .pdots{display:flex;align-items:center;gap:5px}.pd{width:8px;height:8px;border-radius:50%;background:#E2E8F0;transition:background .2s}.pd.on{background:#0891B2}
    .bp,.bop,.bg{display:inline-flex;align-items:center;gap:4px;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}
    .bp{background:#0891B2;color:#fff;border:none}.bp mat-icon{font-size:16px;width:16px;height:16px}
    .bop{background:transparent;color:#0891B2;border:1.5px solid #0891B2}.bop mat-icon{font-size:15px;width:15px;height:15px}
    .bg{background:transparent;color:#64748b;border:1.5px solid #E2E8F0}.bg mat-icon{font-size:15px;width:15px;height:15px}
  `]
})
export class ManagementReviewComponent implements OnInit {
  reviews: any[] = [];
  showDialog = false; editItem: any = null; activeTab = 0;
  form: any = {};

  tabs = [
    { lbl:"Meeting Details", ic:"event_note"  },
    { lbl:"Review Inputs",   ic:"input"       },
    { lbl:"Outputs & Actions", ic:"task_alt"  },
  ];

  inputItems = [
    { key:"inputPolicyObjectives",  label:"Suitability of policies and objectives",          cl:"Cl.8.9.2(a)" },
    { key:"inputPreviousActions",   label:"Follow-up from previous management reviews",      cl:"Cl.8.9.2(b)" },
    { key:"inputRecentResults",     label:"Outcome of recent internal audits",               cl:"Cl.8.9.2(c)" },
    { key:"inputNonconformities",   label:"Corrective actions and nonconforming work",       cl:"Cl.8.9.2(d)" },
    { key:"inputProficiency",       label:"Proficiency testing results and ILC outcomes",    cl:"Cl.8.9.2(e)" },
    { key:"inputRiskActions",       label:"Actions to address risks",                        cl:"Cl.8.9.2(f)" },
    { key:"inputWorkload",          label:"Workload and staff resource adequacy",            cl:"Cl.8.9.2(g)" },
    { key:"inputComplaints",        label:"Customer feedback and complaints",                cl:"Cl.8.9.2(h)" },
    { key:"inputResources",         label:"Adequacy of resources (equipment, consumables)",  cl:"Cl.8.9.2(i)" },
    { key:"inputSupplier",          label:"Results of supplier evaluations",                 cl:"Cl.8.9.2(j)" },
    { key:"inputAuditFindings",     label:"External assessment findings (NABL, customers)",  cl:"Cl.8.9.2(k)" },
    { key:"inputExternalChanges",   label:"Changes in volume, scope or types of activities", cl:"Cl.8.9.2(l)" },
  ];

  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.get<any[]>("/management-reviews").subscribe({
      next: r => { this.reviews = r; },
      error: e => { if (e.status !== 401) this.snack.open("Failed to load","✕"); }
    });
  }

  openNew() {
    this.editItem = null; this.activeTab = 0;
    this.form = { status:"DRAFT", reviewDate: new Date().toISOString().slice(0,10) };
    this.showDialog = true;
  }

  edit(r: any) { this.editItem = r; this.activeTab = 0; this.form = {...r}; this.showDialog = true; }
  closeDialog() { this.showDialog = false; this.editItem = null; }

  save() {
    if (!this.form.reviewId || !this.form.reviewDate) {
      this.activeTab = 0;
      this.snack.open("Review ID and Date are required","✕",{duration:3000}); return;
    }
    this.api.post("/management-reviews", this.form).subscribe({
      next: () => { this.snack.open("Saved ✓",""); this.closeDialog(); this.load(); },
      error: () => this.snack.open("Error saving","✕")
    });
  }
}
