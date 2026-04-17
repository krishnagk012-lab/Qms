import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-organisation", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Organisation Structure & Roles</h2>
    <p>ISO 17025:2017 · Clause 5.1–5.5 — Legal entity, management structure and defined roles</p>
  </div>

  <div class="toolbar-row">
    <div class="toolbar-spacer"></div>
    <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> Add Role</button>
  </div>

  <!-- Mandatory roles warning -->
  <div class="warn-banner" *ngIf="missingMandatory.length > 0">
    <mat-icon>warning</mat-icon>
    <span><strong>Missing mandatory roles:</strong> {{missingMandatory.join(", ")}} — NABL requires these to be formally appointed with documented responsibilities.</span>
  </div>

  <!-- Org chart style role cards -->
  <div class="roles-grid">
    <div class="role-card" *ngFor="let r of roles" [class.mandatory]="isMandatory(r.isoRef)">
      <div class="rc-top">
        <div class="rc-icon" [class]="roleColor(r.isoRef)">
          <mat-icon>{{roleIcon(r.isoRef)}}</mat-icon>
        </div>
        <div class="rc-info">
          <div class="rc-title">{{r.roleTitle}}</div>
          <div class="rc-ref">{{r.isoRef || "ISO 17025"}}</div>
        </div>
        <button class="icon-btn" (click)="edit(r)"><mat-icon style="font-size:15px;color:#94A3B8">edit</mat-icon></button>
      </div>
      <div class="rc-person" *ngIf="r.incumbent">
        <mat-icon style="font-size:14px;width:14px;height:14px;color:#64748b">person</mat-icon>
        {{r.incumbent}}
        <span class="emp-id" *ngIf="r.empId">{{r.empId}}</span>
      </div>
      <div class="rc-person no-person" *ngIf="!r.incumbent">
        <mat-icon style="font-size:14px;width:14px;height:14px">person_off</mat-icon> Not yet appointed
      </div>
      <div class="rc-deputy" *ngIf="r.deputy">Deputy: {{r.deputy}}</div>
      <div class="rc-resp" *ngIf="r.responsibilities">{{r.responsibilities | slice:0:120}}{{r.responsibilities?.length>120?'…':''}}</div>
      <div class="rc-date" *ngIf="r.appointmentDate">Appointed {{r.appointmentDate | date:"dd MMM yyyy"}}</div>
    </div>
  </div>

  <div *ngIf="!roles.length" class="empty-card">
    <mat-icon>account_tree</mat-icon>
    <p>No roles defined.<br>Click <strong>Add Role</strong> to document your laboratory's management structure.</p>
  </div>
</div>

<!-- DIALOG -->
<div *ngIf="showDialog" class="overlay" (click)="showDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div><h3>{{editItem?.id ? "Edit" : "Add"}} Role</h3>
    <p>ISO 17025:2017 · Cl. 5.1–5.5 — Organisational role record</p></div>
    <button class="ib" (click)="showDialog=false"><mat-icon>close</mat-icon></button>
  </div>
  <div class="sh-body">
    <div class="banner blue"><mat-icon>info_outline</mat-icon>
      <span><strong>Cl. 5.5</strong> — Laboratory management shall define responsibilities and authorities for all personnel. Key roles include Laboratory Director, Technical Manager, Quality Manager, and deputies.</span>
    </div>

    <!-- Quick-fill mandatory roles -->
    <div class="quick-roles">
      <div class="qr-lbl">Quick add mandatory role:</div>
      <div class="qr-chips">
        <button *ngFor="let mr of mandatoryRoles" class="qr-chip" (click)="prefill(mr)">{{mr.title}}</button>
      </div>
    </div>

    <div class="fr">
      <div class="fc"><label class="fl">Role ID <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="form.roleId" [readonly]="!!editItem?.id"/></div>
      <div class="fc"><label class="fl">ISO 17025 Reference</label>
        <input class="fi" [(ngModel)]="form.isoRef"/></div>
    </div>
    <div class="ff"><label class="fl">Role Title <span class="rq">*</span></label>
      <input class="fi" [(ngModel)]="form.roleTitle"/></div>
    <div class="fr">
      <div class="fc"><label class="fl">Current Incumbent</label>
        <input class="fi" [(ngModel)]="form.incumbent"/></div>
      <div class="fc"><label class="fl">Employee ID</label>
        <input class="fi" [(ngModel)]="form.empId"/></div>
    </div>
    <div class="fr">
      <div class="fc"><label class="fl">Appointed By</label>
        <input class="fi" [(ngModel)]="form.appointedBy"/></div>
      <div class="fc"><label class="fl">Appointment Date</label>
        <input class="fi" type="date" [(ngModel)]="form.appointmentDate"/></div>
    </div>
    <div class="ff"><label class="fl">Deputy (when absent)</label>
      <input class="fi" [(ngModel)]="form.deputy"/></div>
    <div class="ff"><label class="fl">Responsibilities</label>
      <textarea class="fta" rows="4" [(ngModel)]="form.responsibilities"></textarea></div>
    <div class="ff"><label class="fl">Authorities</label>
      <textarea class="fta" rows="3" [(ngModel)]="form.authorities"></textarea></div>
  </div>
  <div class="sh-ftr">
    <button class="bg" (click)="showDialog=false">Cancel</button>
    <button class="bp" (click)="save()"><mat-icon>save</mat-icon> Save Role</button>
  </div>
</div>
</div>
`,
  styles: [`
    .page-wrap{padding:24px;max-width:1200px;margin:0 auto}
    .page-header{margin-bottom:18px}.page-header h2{font-size:1.25rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.page-header p{font-size:0.76rem;color:#94A3B8;margin:0}
    .toolbar-row{display:flex;align-items:center;gap:10px;margin-bottom:16px}
    .toolbar-spacer{flex:1}
    .btn-p{display:inline-flex;align-items:center;gap:5px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 14px;font-size:0.83rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p mat-icon{font-size:17px;width:17px;height:17px}
    .warn-banner{display:flex;align-items:center;gap:10px;background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px 16px;font-size:0.81rem;color:#991B1B;margin-bottom:18px}
    .warn-banner mat-icon{color:#EF4444;flex-shrink:0}
    .roles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
    .role-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:16px;transition:box-shadow .15s}
    .role-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)}
    .role-card.mandatory{border-left:3px solid #0891B2}
    .rc-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
    .rc-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .rc-icon mat-icon{font-size:18px;width:18px;height:18px}
    .rc-icon.blue{background:#E0F2FE;color:#0891B2}
    .rc-icon.green{background:#DCFCE7;color:#166534}
    .rc-icon.amber{background:#FEF3C7;color:#92400E}
    .rc-icon.purple{background:#EDE9FE;color:#4C1D95}
    .rc-icon.gray{background:#F1F5F9;color:#64748b}
    .rc-info{flex:1;min-width:0}
    .rc-title{font-size:0.88rem;font-weight:700;color:#0D1B3E}
    .rc-ref{font-size:0.65rem;color:#94A3B8;margin-top:2px}
    .rc-person{display:flex;align-items:center;gap:5px;font-size:0.81rem;color:#0D1B3E;margin-bottom:4px}
    .rc-person.no-person{color:#94A3B8;font-style:italic}
    .emp-id{font-size:0.68rem;background:#EFF6FF;color:#1D4ED8;padding:1px 6px;border-radius:4px;font-family:monospace}
    .rc-deputy{font-size:0.72rem;color:#94A3B8;margin-bottom:6px}
    .rc-resp{font-size:0.75rem;color:#64748b;line-height:1.5;margin-bottom:6px}
    .rc-date{font-size:0.68rem;color:#94A3B8}
    .icon-btn{background:transparent;border:none;cursor:pointer;display:inline-flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8;flex-shrink:0}
    .empty-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;text-align:center;padding:60px;color:#94A3B8}
    .empty-card mat-icon{font-size:48px;width:48px;height:48px;display:block;margin:0 auto 12px}
    .empty-card p{font-size:0.84rem;line-height:1.6}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:680px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.71rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 200px)}
    .sh-ftr{display:flex;justify-content:flex-end;gap:8px;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .banner{display:flex;align-items:flex-start;gap:8px;border-radius:8px;padding:10px 13px;font-size:0.76rem;line-height:1.5;margin-bottom:15px}
    .banner mat-icon{font-size:15px;width:15px;height:15px;flex-shrink:0;margin-top:1px}
    .banner.blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF}.banner.blue mat-icon{color:#3B82F6}
    .quick-roles{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px 12px;margin-bottom:14px}
    .qr-lbl{font-size:0.67rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px}
    .qr-chips{display:flex;flex-wrap:wrap;gap:6px}
    .qr-chip{background:#EFF6FF;color:#0891B2;border:1px solid #BAE6FD;border-radius:6px;padding:4px 10px;font-size:0.74rem;font-weight:600;cursor:pointer;font-family:inherit}
    .qr-chip:hover{background:#E0F2FE}
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:block;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}
    .fi,.fs,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;box-sizing:border-box}
    .fi,.fs{height:40px;padding:0 12px}.fta{padding:9px 12px;resize:vertical}
    .fi:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .bg{display:inline-flex;align-items:center;gap:4px;background:transparent;color:#64748b;border:1.5px solid #E2E8F0;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}
    .bp{display:inline-flex;align-items:center;gap:4px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}.bp mat-icon{font-size:16px;width:16px;height:16px}
  `]
})
export class OrganisationComponent implements OnInit {
  roles: any[] = [];
  missingMandatory: string[] = [];
  showDialog = false; editItem: any = null; form: any = {};

  mandatoryRoles = [
    { title:"Laboratory Director",   isoRef:"Cl.5.5.1", id:"ROLE-001" },
    { title:"Technical Manager",     isoRef:"Cl.5.5.2", id:"ROLE-002" },
    { title:"Quality Manager",       isoRef:"Cl.5.5.3", id:"ROLE-003" },
    { title:"Deputy Technical Mgr",  isoRef:"Cl.5.5.2", id:"ROLE-004" },
    { title:"Deputy Quality Mgr",    isoRef:"Cl.5.5.3", id:"ROLE-005" },
  ];

  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.get<any[]>("/organisation-roles").subscribe({
      next: r => {
        this.roles = r;
        const titles = r.map((x: any) => x.roleTitle.toLowerCase());
        this.missingMandatory = ["Laboratory Director","Technical Manager","Quality Manager"]
          .filter(t => !titles.some(tt => tt.includes(t.toLowerCase().split(" ")[0])));
      },
      error: e => { if (e.status !== 401) this.snack.open("Failed to load","✕"); }
    });
  }

  openNew() { this.editItem = null; this.form = {}; this.showDialog = true; }
  edit(r: any) { this.editItem = r; this.form = {...r}; this.showDialog = true; }

  prefill(mr: any) {
    this.form = { roleId: mr.id, roleTitle: mr.title, isoRef: mr.isoRef };
  }

  save() {
    if (!this.form.roleId || !this.form.roleTitle) { this.snack.open("Role ID and Title required","✕",{duration:3000}); return; }
    this.api.post("/organisation-roles", this.form).subscribe({
      next: () => { this.snack.open("Saved ✓",""); this.showDialog=false; this.load(); },
      error: () => this.snack.open("Error saving","✕")
    });
  }

  isMandatory(ref: string): boolean {
    return ["Cl.5.5.1","Cl.5.5.2","Cl.5.5.3"].includes(ref);
  }

  roleIcon(ref: string): string {
    const m: Record<string,string> = { "Cl.5.5.1":"business_center","Cl.5.5.2":"precision_manufacturing","Cl.5.5.3":"verified_user" };
    return m[ref] || "badge";
  }

  roleColor(ref: string): string {
    const m: Record<string,string> = { "Cl.5.5.1":"blue","Cl.5.5.2":"green","Cl.5.5.3":"amber" };
    return m[ref] || "gray";
  }
}
