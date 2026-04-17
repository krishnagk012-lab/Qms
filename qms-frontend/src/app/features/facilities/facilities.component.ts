import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({
  selector: "app-facilities", standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h2>Facilities & Environmental Conditions</h2>
    <p>ISO 17025:2017 · Clause 6.3 — Facilities, environmental monitoring and control</p>
  </div>

  <!-- Stats -->
  <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="stat-card" *ngFor="let c of statCards">
      <div class="icon-box" [style.background]="c.bg"><mat-icon [style.color]="c.color">{{c.icon}}</mat-icon></div>
      <div class="val">{{c.value}}</div><div class="lbl">{{c.label}}</div>
    </div>
  </div>

  <!-- Sub-navigation tabs -->
  <div class="subnav">
    <button class="sn-btn" [class.on]="subView==='register'" (click)="subView='register'">
      <mat-icon>domain</mat-icon> Facility Register
      <span class="sn-cl">Cl.6.3.1-2</span>
    </button>
    <button class="sn-btn" [class.on]="subView==='monitoring'" (click)="subView='monitoring';loadReadings()">
      <mat-icon>thermostat</mat-icon> Environmental Monitoring
      <span class="sn-cl">Cl.6.3.3</span>
    </button>
    <button class="sn-btn" [class.on]="subView==='deviations'" (click)="subView='deviations';loadDeviations()">
      <mat-icon>warning_amber</mat-icon> Deviations
      <span class="sn-cl" [class.red]="deviationCount>0">{{deviationCount || ''}}</span>
    </button>
  </div>

  <!-- ══ FACILITY REGISTER ══ -->
  <ng-container *ngIf="subView==='register'">
    <div class="toolbar-row">
      <div class="search-box">
        <mat-icon class="si">search</mat-icon>
        <input class="si-inp" [(ngModel)]="search" (input)="filter()" placeholder="Search facility name, ID…"/>
      </div>
      <select class="ns" [(ngModel)]="filterStatus" (change)="filter()">
        <option value="">All status</option>
        <option value="ACTIVE">Active</option>
        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
        <option value="DECOMMISSIONED">Decommissioned</option>
      </select>
      <div class="toolbar-spacer"></div>
      <button class="btn-p" (click)="openNew()"><mat-icon>add</mat-icon> Add Facility</button>
    </div>

    <div class="tcard">
      <table class="htbl">
        <thead>
          <tr>
            <th>ID</th><th>Facility / Area</th><th>Type</th><th>Location</th>
            <th>Area</th><th>Monitoring <span class="cl">Cl.6.3.3</span></th>
            <th>Access <span class="cl">Cl.6.3.4a</span></th>
            <th>Responsible</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let f of filtered">
            <td><span class="id-chip">{{f.facilityId}}</span></td>
            <td>
              <div class="f-name">{{f.name}}</div>
              <div class="f-sub" *ngIf="f.isExternalSite"><mat-icon style="font-size:11px;width:11px;height:11px">location_on</mat-icon> External site</div>
            </td>
            <td><span class="type-chip" [class]="ft(f.facilityType)">{{f.facilityType}}</span></td>
            <td class="muted">{{f.location || "—"}}</td>
            <td class="muted">{{f.areaSqm ? f.areaSqm + ' m²' : '—'}}</td>
            <td>
              <div class="monitor-tags">
                <span class="mt" *ngIf="f.monitorTemperature">T°</span>
                <span class="mt" *ngIf="f.monitorHumidity">RH%</span>
                <span class="mt" *ngIf="f.monitorPressure">P</span>
                <span class="mt" *ngIf="f.monitorCo2">CO₂</span>
                <span class="mt" *ngIf="f.monitorParticulates">Part.</span>
                <span class="mt" *ngIf="f.monitorVibration">Vib.</span>
                <span class="mt" *ngIf="f.monitorLighting">Lux</span>
                <span class="muted" *ngIf="!anyMonitor(f)">None</span>
              </div>
              <div *ngIf="f.tempMin!=null||f.tempMax!=null" class="f-sub">
                {{f.tempMin}}–{{f.tempMax}}{{f.tempUnit}}
                <span *ngIf="f.humidityMin!=null"> · {{f.humidityMin}}–{{f.humidityMax}}% RH</span>
              </div>
            </td>
            <td>
              <span class="ac-chip" [class]="ac(f.accessControl)">{{f.accessControl || "—"}}</span>
            </td>
            <td class="muted">{{f.responsiblePerson || "—"}}</td>
            <td><span class="sbadge" [class]="fsc(f.status)">{{f.status}}</span></td>
            <td>
              <button class="icon-btn" (click)="openLog(f)" matTooltip="Log environmental reading">
                <mat-icon style="font-size:16px;color:#0891B2">add_chart</mat-icon>
              </button>
              <button class="icon-btn" (click)="edit(f)">
                <mat-icon style="font-size:16px;color:#94A3B8">edit</mat-icon>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!filtered.length" class="empty">
        <mat-icon>domain</mat-icon>
        <p>No facilities registered.<br>Click <strong>Add Facility</strong> to begin.</p>
      </div>
    </div>
  </ng-container>

  <!-- ══ ENVIRONMENTAL MONITORING ══ -->
  <ng-container *ngIf="subView==='monitoring'">
    <div class="toolbar-row">
      <select class="ns" [(ngModel)]="filterFacility" (change)="filterReadings()">
        <option value="">All facilities</option>
        <option *ngFor="let f of facilities" [value]="f.facilityId">{{f.facilityId}} — {{f.name}}</option>
      </select>
      <div class="toolbar-spacer"></div>
      <button class="btn-p" (click)="openLogGeneral()"><mat-icon>add</mat-icon> Log Reading</button>
    </div>

    <div class="tcard">
      <table class="htbl">
        <thead>
          <tr>
            <th>Date / Time</th><th>Facility</th>
            <th>Temp.</th><th>Humidity</th><th>Pressure</th>
            <th>CO₂</th><th>Particulates</th><th>Other</th>
            <th>Status</th><th>By</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of filteredReadings" [class.row-dev]="!r.withinLimits">
            <td class="mono">{{r.recordedAt | date:"dd MMM yyyy HH:mm"}}</td>
            <td><span class="id-chip" style="background:#EFF6FF;color:#1D4ED8">{{r.facilityId}}</span></td>
            <td [class.val-ok]="r.temperature!=null" [class.val-na]="r.temperature==null">
              {{r.temperature != null ? r.temperature + ' °C' : '—'}}
            </td>
            <td [class.val-ok]="r.humidity!=null" [class.val-na]="r.humidity==null">
              {{r.humidity != null ? r.humidity + ' %' : '—'}}
            </td>
            <td class="muted">{{r.pressure != null ? r.pressure + ' hPa' : '—'}}</td>
            <td class="muted">{{r.co2Ppm != null ? r.co2Ppm + ' ppm' : '—'}}</td>
            <td class="muted">{{r.particulates != null ? r.particulates : '—'}}</td>
            <td class="muted">
              <span *ngIf="r.otherValue!=null">{{r.otherLabel}}: {{r.otherValue}}</span>
              <span *ngIf="r.otherValue==null">—</span>
            </td>
            <td>
              <span *ngIf="r.withinLimits" class="status-ok">Within limits</span>
              <span *ngIf="!r.withinLimits" class="status-dev">DEVIATION</span>
            </td>
            <td class="muted">{{r.recordedBy || "—"}}</td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!filteredReadings.length" class="empty">
        <mat-icon>thermostat</mat-icon>
        <p>No readings recorded yet.<br>Click <strong>Log Reading</strong> to record the first environmental reading.</p>
      </div>
    </div>
  </ng-container>

  <!-- ══ DEVIATIONS ══ -->
  <ng-container *ngIf="subView==='deviations'">
    <div class="warn-banner" *ngIf="deviations.length > 0">
      <mat-icon>warning</mat-icon>
      <span><strong>{{deviations.length}} deviation{{deviations.length>1?"s":""}} recorded.</strong>
        Per Cl. 6.3.3, deviations outside documented limits must be investigated and actioned. If results may have been affected, raise an NCR per Cl. 8.6.</span>
    </div>
    <div class="tcard">
      <table class="htbl">
        <thead>
          <tr>
            <th>Date / Time</th><th>Facility</th><th>Temp.</th><th>Humidity</th>
            <th>Deviation Notes</th><th>NCR Ref.</th><th>By</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of deviations">
            <td class="mono">{{r.recordedAt | date:"dd MMM yyyy HH:mm"}}</td>
            <td><span class="id-chip" style="background:#FEE2E2;color:#991B1B">{{r.facilityId}}</span></td>
            <td class="val-dev">{{r.temperature != null ? r.temperature + ' °C' : '—'}}</td>
            <td class="val-dev">{{r.humidity != null ? r.humidity + ' %' : '—'}}</td>
            <td class="dev-note">{{r.deviationNotes || "No notes recorded"}}</td>
            <td>
              <span *ngIf="r.ncrReference" class="ncr-ref">{{r.ncrReference}}</span>
              <span *ngIf="!r.ncrReference" class="ncr-miss">Not raised</span>
            </td>
            <td class="muted">{{r.recordedBy || "—"}}</td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!deviations.length" class="empty" style="color:#10B981">
        <mat-icon style="color:#10B981">check_circle</mat-icon>
        <p>No deviations recorded. All environmental readings are within limits.</p>
      </div>
    </div>
  </ng-container>
</div>

<!-- ═══ FACILITY DIALOG ═══ -->
<div *ngIf="showFacilityDialog" class="overlay" (click)="showFacilityDialog=false">
<div class="sheet" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div>
      <h3>{{editFac?.id ? "Edit Facility" : "Register Facility / Area"}}</h3>
      <p>ISO 17025:2017 · Clause 6.3 — Facilities and environmental conditions</p>
    </div>
    <button class="ib" (click)="showFacilityDialog=false"><mat-icon>close</mat-icon></button>
  </div>

  <div class="f-tabs">
    <button *ngFor="let t of facTabs; let i=index" class="f-tab" [class.on]="facTab===i" (click)="facTab=i">
      <mat-icon>{{t.ic}}</mat-icon>{{t.lbl}}<span class="ctag">{{t.cl}}</span>
    </button>
  </div>

  <div class="sh-body">

    <!-- TAB 0 — FACILITY DETAILS Cl.6.3.1-2 -->
    <div *ngIf="facTab===0">
      <div class="banner blue"><mat-icon>info_outline</mat-icon>
        <span><strong>Cl. 6.3.1</strong> — Facilities must be suitable and not adversely affect validity of results. <strong>Cl. 6.3.2</strong> — Requirements for environmental conditions must be documented.</span>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Facility ID <span class="rq">*</span></label>
          <input class="fi" [(ngModel)]="facForm.facilityId" [readonly]="!!editFac?.id" placeholder=""/>
        </div>
        <div class="fc">
          <label class="fl">Facility Type <span class="rq">*</span></label>
          <select class="fs" [(ngModel)]="facForm.facilityType">
            <option value="LAB">Laboratory</option>
            <option value="STORAGE">Storage / Reagent Room</option>
            <option value="CALIBRATION">Calibration Room</option>
            <option value="CLEAN_ROOM">Clean Room</option>
            <option value="OFFICE">Office / Admin Area</option>
            <option value="UTILITY">Utility / Service Area</option>
            <option value="EXTERNAL">External Site</option>
          </select>
        </div>
      </div>
      <div class="ff">
        <label class="fl">Name / Description <span class="rq">*</span></label>
        <input class="fi" [(ngModel)]="facForm.name" placeholder=""/>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Location / Address</label>
          <input class="fi" [(ngModel)]="facForm.location" placeholder=""/>
        </div>
        <div class="fc">
          <label class="fl">Area (m²)</label>
          <input class="fi" type="number" [(ngModel)]="facForm.areaSqm" placeholder=""/>
        </div>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Responsible Person</label>
          <input class="fi" [(ngModel)]="facForm.responsiblePerson" placeholder=""/>
        </div>
        <div class="fc">
          <label class="fl">Status</label>
          <select class="fs" [(ngModel)]="facForm.status">
            <option value="ACTIVE">Active</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="DECOMMISSIONED">Decommissioned</option>
          </select>
        </div>
      </div>
      <div class="ff">
        <label class="fl">Laboratory Activities Performed Here <span class="rq-col">Cl.6.3.2</span></label>
        <textarea class="fta" rows="3" [(ngModel)]="facForm.activitiesPerformed"></textarea>
      </div>
      <div class="ff">
        <label class="fl">Documented Environmental Requirements <span class="rq-col">Cl.6.3.2</span></label>
        <textarea class="fta" rows="3" [(ngModel)]="facForm.documentedRequirements"></textarea>
      </div>

      <!-- External site Cl.6.3.5 -->
      <div class="check-row">
        <input type="checkbox" id="ext" [(ngModel)]="facForm.isExternalSite"/>
        <label for="ext" class="check-lbl">This is an external site / outside permanent laboratory control <span class="ctag-inline">Cl.6.3.5</span></label>
      </div>
      <div *ngIf="facForm.isExternalSite" class="ff" style="margin-top:10px">
        <label class="fl">External Site Address</label>
        <input class="fi" [(ngModel)]="facForm.externalSiteAddress" placeholder=""/>
      </div>
      <div *ngIf="facForm.isExternalSite" class="ff">
        <label class="fl">Compliance Notes for External Site <span class="rq-col">Cl.6.3.5</span></label>
        <textarea class="fta" rows="2" [(ngModel)]="facForm.externalComplianceNotes"></textarea>
      </div>
    </div>

    <!-- TAB 1 — ENVIRONMENTAL MONITORING Cl.6.3.3 -->
    <div *ngIf="facTab===1">
      <div class="banner blue"><mat-icon>thermostat</mat-icon>
        <span><strong>Cl. 6.3.3</strong> — Monitor, control and record environmental conditions where they influence the validity of results. Define what parameters to monitor and acceptable limits.</span>
      </div>

      <div class="sdiv">Parameters to monitor</div>
      <div class="check-grid">
        <div class="check-row"><input type="checkbox" id="mt" [(ngModel)]="facForm.monitorTemperature"/><label for="mt" class="check-lbl">Temperature</label></div>
        <div class="check-row"><input type="checkbox" id="mh" [(ngModel)]="facForm.monitorHumidity"/><label for="mh" class="check-lbl">Relative Humidity</label></div>
        <div class="check-row"><input type="checkbox" id="mp" [(ngModel)]="facForm.monitorPressure"/><label for="mp" class="check-lbl">Air Pressure</label></div>
        <div class="check-row"><input type="checkbox" id="mc" [(ngModel)]="facForm.monitorCo2"/><label for="mc" class="check-lbl">CO₂ Level</label></div>
        <div class="check-row"><input type="checkbox" id="mpa" [(ngModel)]="facForm.monitorParticulates"/><label for="mpa" class="check-lbl">Particulates / Dust</label></div>
        <div class="check-row"><input type="checkbox" id="mv" [(ngModel)]="facForm.monitorVibration"/><label for="mv" class="check-lbl">Vibration</label></div>
        <div class="check-row"><input type="checkbox" id="ml" [(ngModel)]="facForm.monitorLighting"/><label for="ml" class="check-lbl">Lighting (Lux)</label></div>
      </div>
      <div class="ff" style="margin-top:8px">
        <label class="fl">Other parameter to monitor</label>
        <input class="fi" [(ngModel)]="facForm.monitorOther" placeholder=""/>
      </div>

      <div class="sdiv">Acceptable limits — temperature & humidity</div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Temperature Min (°C)</label>
          <input class="fi" type="number" step="0.1" [(ngModel)]="facForm.tempMin" placeholder=""/>
        </div>
        <div class="fc">
          <label class="fl">Temperature Max (°C)</label>
          <input class="fi" type="number" step="0.1" [(ngModel)]="facForm.tempMax" placeholder=""/>
        </div>
      </div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Humidity Min (%RH)</label>
          <input class="fi" type="number" step="1" [(ngModel)]="facForm.humidityMin" placeholder=""/>
        </div>
        <div class="fc">
          <label class="fl">Humidity Max (%RH)</label>
          <input class="fi" type="number" step="1" [(ngModel)]="facForm.humidityMax" placeholder=""/>
        </div>
      </div>
    </div>

    <!-- TAB 2 — ACCESS & CONTROL Cl.6.3.4 -->
    <div *ngIf="facTab===2">
      <div class="banner blue"><mat-icon>lock</mat-icon>
        <span><strong>Cl. 6.3.4</strong> — Access control, contamination prevention, and separation of incompatible activities must be implemented, monitored and periodically reviewed.</span>
      </div>

      <div class="sdiv">Access control <span class="itl">Cl. 6.3.4(a)</span></div>
      <div class="fr">
        <div class="fc">
          <label class="fl">Access Level</label>
          <select class="fs" [(ngModel)]="facForm.accessControl">
            <option value="OPEN">Open — unrestricted access</option>
            <option value="RESTRICTED">Restricted — authorised staff only</option>
            <option value="CONTROLLED">Controlled — sign-in/sign-out required</option>
            <option value="SECURED">Secured — key card / locked access</option>
          </select>
        </div>
      </div>
      <div class="ff">
        <label class="fl">Access Requirements / Who Is Permitted <span class="rq-col">Cl.6.3.4a</span></label>
        <textarea class="fta" rows="3" [(ngModel)]="facForm.accessRequirements"></textarea>
      </div>

      <div class="sdiv">Contamination prevention <span class="itl">Cl. 6.3.4(b)</span></div>
      <div class="ff">
        <label class="fl">Contamination Control Measures</label>
        <textarea class="fta" rows="3" [(ngModel)]="facForm.contaminationControls"></textarea>
      </div>

      <div class="sdiv">Separation of incompatible areas <span class="itl">Cl. 6.3.4(c)</span></div>
      <div class="ff">
        <label class="fl">Incompatible Areas (that must be separated from this facility)</label>
        <input class="fi" [(ngModel)]="facForm.incompatibleAreas" placeholder=""/>
      </div>
      <div class="ff">
        <label class="fl">Separation Measures Implemented <span class="rq-col">Cl.6.3.4c</span></label>
        <textarea class="fta" rows="3" [(ngModel)]="facForm.separationMeasures"></textarea>
      </div>

      <div class="ff">
        <label class="fl">General Notes</label>
        <textarea class="fta" rows="2" [(ngModel)]="facForm.notes"></textarea>
      </div>
    </div>

  </div>

  <div class="sh-ftr">
    <div class="pdots">
      <span *ngFor="let t of facTabs; let i=index" class="pd" [class.on]="i<=facTab"></span>
      <span style="font-size:0.73rem;color:#94A3B8;margin-left:8px">{{facTab+1}} / {{facTabs.length}}</span>
    </div>
    <div style="display:flex;gap:8px">
      <button class="bg" (click)="showFacilityDialog=false">Cancel</button>
      <button *ngIf="facTab>0" class="bg" (click)="facTab=facTab-1"><mat-icon>arrow_back</mat-icon> Back</button>
      <button *ngIf="facTab<facTabs.length-1" class="bop" (click)="facTab=facTab+1">Next <mat-icon>arrow_forward</mat-icon></button>
      <button *ngIf="facTab===facTabs.length-1" class="bp" (click)="saveFacility()"><mat-icon>save</mat-icon> Save Facility</button>
    </div>
  </div>
</div>
</div>

<!-- ═══ LOG READING DIALOG ═══ -->
<div *ngIf="showReadingDialog" class="overlay" (click)="showReadingDialog=false">
<div class="sheet" style="max-width:580px" (click)="$event.stopPropagation()">
  <div class="sh-hdr">
    <div>
      <h3>Log Environmental Reading</h3>
      <p>ISO 17025:2017 · Cl. 6.3.3 — Record environmental conditions</p>
    </div>
    <button class="ib" (click)="showReadingDialog=false"><mat-icon>close</mat-icon></button>
  </div>
  <div class="sh-body">

    <div class="banner blue"><mat-icon>info_outline</mat-icon>
      <span><strong>Cl. 6.3.3</strong> — Record environmental conditions. Flag any reading outside the documented limits as a deviation. An NCR must be raised if results may have been affected.</span>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Facility <span class="rq">*</span></label>
        <select class="fs" [(ngModel)]="readingForm.facilityId">
          <option value="">— Select facility —</option>
          <option *ngFor="let f of facilities" [value]="f.facilityId">{{f.facilityId}} — {{f.name}}</option>
        </select>
      </div>
      <div class="fc">
        <label class="fl">Date & Time <span class="rq">*</span></label>
        <input class="fi" type="datetime-local" [(ngModel)]="readingForm.recordedAtLocal"/>
      </div>
    </div>

    <div class="fr">
      <div class="fc">
        <label class="fl">Recorded By</label>
        <input class="fi" [(ngModel)]="readingForm.recordedBy" placeholder=""/>
      </div>
    </div>

    <div class="sdiv">Measured values</div>
    <div class="fr">
      <div class="fc">
        <label class="fl">Temperature (°C)</label>
        <input class="fi" type="number" step="0.1" [(ngModel)]="readingForm.temperature" placeholder=""/>
      </div>
      <div class="fc">
        <label class="fl">Humidity (%RH)</label>
        <input class="fi" type="number" step="0.1" [(ngModel)]="readingForm.humidity" placeholder=""/>
      </div>
    </div>
    <div class="fr">
      <div class="fc">
        <label class="fl">Pressure (hPa)</label>
        <input class="fi" type="number" step="0.1" [(ngModel)]="readingForm.pressure" placeholder=""/>
      </div>
      <div class="fc">
        <label class="fl">CO₂ (ppm)</label>
        <input class="fi" type="number" [(ngModel)]="readingForm.co2Ppm" placeholder=""/>
      </div>
    </div>
    <div class="fr">
      <div class="fc">
        <label class="fl">Particulates</label>
        <input class="fi" type="number" [(ngModel)]="readingForm.particulates" placeholder=""/>
      </div>
      <div class="fc">
        <label class="fl">Lighting (Lux)</label>
        <input class="fi" type="number" [(ngModel)]="readingForm.lightingLux" placeholder=""/>
      </div>
    </div>

    <div class="sdiv">Compliance</div>
    <div class="check-row" style="margin-bottom:10px">
      <input type="checkbox" id="wl" [(ngModel)]="readingForm.withinLimits"/>
      <label for="wl" class="check-lbl" style="font-weight:600">All readings are within documented limits</label>
    </div>
    <div *ngIf="!readingForm.withinLimits">
      <div class="warn-banner" style="margin-bottom:10px">
        <mat-icon>warning</mat-icon>
        <span>Deviation detected — document the action taken and raise an NCR if results may be affected.</span>
      </div>
      <div class="ff">
        <label class="fl">Deviation Notes / Action Taken <span class="rq">*</span></label>
        <textarea class="fta" rows="3" [(ngModel)]="readingForm.deviationNotes"></textarea>
      </div>
      <div class="ff">
        <label class="fl">NCR Reference (if results may be affected)</label>
        <input class="fi" [(ngModel)]="readingForm.ncrReference" placeholder=""/>
      </div>
    </div>
  </div>
  <div class="sh-ftr">
    <button class="bg" (click)="showReadingDialog=false">Cancel</button>
    <button class="bp" (click)="saveReading()"><mat-icon>save</mat-icon> Save Reading</button>
  </div>
</div>
</div>
`,
  styles: [`
    .page-wrap{padding:24px;max-width:1400px;margin:0 auto}
    .page-header{margin-bottom:18px}.page-header h2{font-size:1.25rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.page-header p{font-size:0.76rem;color:#94A3B8;margin:0}
    /* Sub-navigation */
    .subnav{display:flex;gap:0;margin-bottom:18px;border:1.5px solid #E2E8F0;border-radius:10px;overflow:hidden;width:fit-content}
    .sn-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:transparent;border:none;border-right:1.5px solid #E2E8F0;font-size:0.82rem;font-weight:600;color:#64748b;cursor:pointer;font-family:inherit;transition:background .12s,color .12s}
    .sn-btn:last-child{border-right:none}.sn-btn:hover{background:#F8FAFC;color:#0D1B3E}
    .sn-btn.on{background:#EFF6FF;color:#0891B2}
    .sn-btn mat-icon{font-size:16px;width:16px;height:16px}
    .sn-cl{font-size:0.6rem;background:#F1F5F9;color:#94A3B8;padding:1px 6px;border-radius:4px;font-weight:600}
    .sn-cl.red{background:#FEE2E2;color:#991B1B}
    /* Toolbar */
    .toolbar-row{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
    .search-box{position:relative;flex:0 0 240px}.si{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;width:18px;height:18px;color:#94A3B8}
    .si-inp{width:100%;height:40px;padding:0 12px 0 36px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.84rem;outline:none;font-family:inherit;box-sizing:border-box}
    .si-inp:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1)}
    .toolbar-spacer{flex:1}
    .ns{height:40px;padding:0 28px 0 12px;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;cursor:pointer;outline:none}
    .btn-p{display:inline-flex;align-items:center;gap:5px;background:#0891B2;color:#fff;border:none;border-radius:8px;height:40px;padding:0 14px;font-size:0.83rem;font-weight:600;cursor:pointer;font-family:inherit}.btn-p:hover{background:#0E7490}.btn-p mat-icon{font-size:17px;width:17px;height:17px}
    /* Table */
    .tcard{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
    .htbl{width:100%;border-collapse:collapse}
    .htbl th{text-align:left;padding:10px 14px;font-size:0.66rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;white-space:nowrap}
    .htbl td{padding:9px 14px;border-bottom:1px solid #F1F5F9;font-size:0.81rem;vertical-align:middle}
    .htbl tr:last-child td{border-bottom:none}.htbl tr:hover td{background:#F8FAFC}
    .row-dev td{background:#FFF5F5}
    .cl{font-size:0.58rem;background:#F1F5F9;color:#94A3B8;padding:1px 4px;border-radius:3px;margin-left:3px;font-weight:600}
    .f-name{font-size:0.84rem;font-weight:600;color:#0D1B3E}
    .f-sub{font-size:0.69rem;color:#94A3B8;margin-top:1px;display:flex;align-items:center;gap:2px}
    .muted{color:#64748b;font-size:0.79rem}
    .mono{font-family:monospace;font-size:0.77rem;color:#475569;white-space:nowrap}
    .id-chip{font-size:0.71rem;font-weight:600;background:#EFF6FF;color:#1D4ED8;padding:2px 7px;border-radius:6px}
    .type-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase}
    .type-chip.lab{background:#DCFCE7;color:#166534}.type-chip.stor{background:#FEF9C3;color:#92400E}
    .type-chip.cal{background:#E0F2FE;color:#075985}.type-chip.clean{background:#EDE9FE;color:#4C1D95}
    .type-chip.off{background:#F1F5F9;color:#475569}.type-chip.ext{background:#FEE2E2;color:#991B1B}.type-chip.def{background:#F1F5F9;color:#64748b}
    .monitor-tags{display:flex;flex-wrap:wrap;gap:3px}
    .mt{font-size:0.62rem;font-weight:700;background:#E0F2FE;color:#075985;padding:1px 6px;border-radius:4px}
    .ac-chip{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
    .ac-chip.OPEN{background:#F1F5F9;color:#64748b}.ac-chip.RESTRICTED{background:#FEF9C3;color:#92400E}
    .ac-chip.CONTROLLED{background:#E0F2FE;color:#075985}.ac-chip.SECURED{background:#EDE9FE;color:#4C1D95}
    .sbadge{font-size:0.7rem;font-weight:700;padding:2px 9px;border-radius:20px}
    .sbadge.act{background:#DCFCE7;color:#166534}.sbadge.maint{background:#FEF9C3;color:#92400E}.sbadge.dec{background:#F1F5F9;color:#64748b}
    .icon-btn{background:transparent;border:none;cursor:pointer;display:inline-flex;align-items:center;padding:4px;border-radius:6px;transition:background .1s}.icon-btn:hover{background:#F1F5F9}
    .val-ok{font-weight:600;color:#0D1B3E}.val-na{color:#94A3B8}.val-dev{font-weight:700;color:#EF4444}
    .status-ok{font-size:0.7rem;font-weight:700;background:#DCFCE7;color:#166534;padding:2px 8px;border-radius:20px}
    .status-dev{font-size:0.7rem;font-weight:700;background:#FEE2E2;color:#991B1B;padding:2px 8px;border-radius:20px}
    .dev-note{font-size:0.77rem;color:#475569;max-width:200px}
    .ncr-ref{font-size:0.71rem;font-weight:600;background:#EFF6FF;color:#1D4ED8;padding:2px 7px;border-radius:6px}
    .ncr-miss{font-size:0.7rem;background:#FEF2F2;color:#991B1B;padding:2px 7px;border-radius:6px}
    .warn-banner{display:flex;align-items:center;gap:10px;background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px 16px;font-size:0.81rem;color:#991B1B;margin-bottom:14px}
    .warn-banner mat-icon{color:#EF4444;flex-shrink:0}
    .empty{text-align:center;padding:50px;color:#94A3B8}.empty mat-icon{font-size:40px;width:40px;height:40px;display:block;margin:0 auto 12px}.empty p{font-size:0.84rem;line-height:1.6}
    /* Dialog */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sheet{background:#fff;border-radius:16px;width:100%;max-width:760px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;margin:auto}
    .sh-hdr{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid #F1F5F9}
    .sh-hdr h3{font-size:1rem;font-weight:700;color:#0D1B3E;margin:0 0 2px}.sh-hdr p{font-size:0.71rem;color:#94A3B8;margin:0}
    .ib{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;padding:4px;border-radius:6px;color:#94A3B8}.ib:hover{background:#F1F5F9}
    .f-tabs{display:flex;border-bottom:1px solid #E2E8F0;overflow-x:auto;padding:0 22px}
    .f-tab{display:flex;align-items:center;gap:5px;padding:11px 13px;background:transparent;border:none;border-bottom:2px solid transparent;cursor:pointer;font-size:0.76rem;font-weight:600;color:#94A3B8;white-space:nowrap;margin-bottom:-1px;font-family:inherit;transition:color .15s,border-color .15s}
    .f-tab mat-icon{font-size:14px;width:14px;height:14px}
    .f-tab .ctag{font-size:0.59rem;background:#F1F5F9;color:#94A3B8;padding:1px 5px;border-radius:4px;margin-left:2px}
    .f-tab.on{color:#0891B2;border-bottom-color:#0891B2}.f-tab.on .ctag{background:#EFF6FF;color:#3B82F6}
    .sh-body{padding:18px 22px;overflow-y:auto;max-height:calc(100vh - 280px)}
    .sh-ftr{display:flex;align-items:center;justify-content:space-between;padding:13px 22px;border-top:1px solid #F1F5F9;background:#FAFBFC;border-radius:0 0 16px 16px}
    .banner{display:flex;align-items:flex-start;gap:8px;border-radius:8px;padding:10px 13px;font-size:0.76rem;line-height:1.5;margin-bottom:15px}
    .banner mat-icon{font-size:15px;width:15px;height:15px;flex-shrink:0;margin-top:1px}
    .banner.blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF}.banner.blue mat-icon{color:#3B82F6}
    .sdiv{font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;padding:12px 0 8px;border-top:1px solid #F1F5F9;margin-top:6px;display:flex;align-items:center;gap:8px}
    .itl{font-size:0.62rem;background:#EFF6FF;color:#3B82F6;padding:2px 6px;border-radius:4px;text-transform:none;font-weight:600}
    .check-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px}
    .check-row{display:flex;align-items:center;gap:8px}
    .check-lbl{font-size:0.82rem;color:#475569;cursor:pointer}
    .ctag-inline{font-size:0.59rem;background:#EFF6FF;color:#3B82F6;padding:1px 5px;border-radius:4px;margin-left:3px;font-weight:600}
    .fr{display:flex;gap:12px;margin-bottom:11px}.fc{flex:1;min-width:0}.ff{margin-bottom:11px}
    .fl{display:block;font-size:0.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
    .rq{color:#EF4444}.rq-col{font-size:0.62rem;color:#F59E0B;text-transform:none;font-weight:500;margin-left:4px}
    .fi,.fs,.fta{width:100%;border:1.5px solid #E2E8F0;border-radius:8px;background:#FAFBFC;font-size:0.83rem;color:#0F172A;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}
    .fi,.fs{height:40px;padding:0 12px}.fta{padding:9px 12px;resize:vertical}
    .fi:focus,.fs:focus,.fta:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.1);background:#fff}
    .fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
    .pdots{display:flex;align-items:center;gap:5px}.pd{width:8px;height:8px;border-radius:50%;background:#E2E8F0;transition:background .2s}.pd.on{background:#0891B2}
    .bp,.bop,.bg{display:inline-flex;align-items:center;gap:4px;border-radius:8px;height:38px;padding:0 15px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit}
    .bp{background:#0891B2;color:#fff;border:none}.bp:hover{background:#0E7490}.bp mat-icon{font-size:16px;width:16px;height:16px}
    .bop{background:transparent;color:#0891B2;border:1.5px solid #0891B2}.bop mat-icon{font-size:15px;width:15px;height:15px}
    .bg{background:transparent;color:#64748b;border:1.5px solid #E2E8F0}.bg:hover{border-color:#94A3B8}.bg mat-icon{font-size:15px;width:15px;height:15px}
  `]
})
export class FacilitiesComponent implements OnInit {
  subView: "register" | "monitoring" | "deviations" = "register";

  // Register
  facilities: any[] = [];
  filtered: any[] = [];
  search = ""; filterStatus = "";
  statCards: any[] = [];
  deviationCount = 0;

  // Monitoring
  readings: any[] = [];
  filteredReadings: any[] = [];
  filterFacility = "";
  deviations: any[] = [];

  // Facility dialog
  showFacilityDialog = false;
  editFac: any = null; facTab = 0;
  facForm: any = {};
  facTabs = [
    { lbl:"Facility Details",    ic:"domain",     cl:"Cl.6.3.1-2" },
    { lbl:"Environmental Limits", ic:"thermostat", cl:"Cl.6.3.3"   },
    { lbl:"Access & Control",     ic:"lock",       cl:"Cl.6.3.4"   },
  ];

  // Reading dialog
  showReadingDialog = false;
  readingForm: any = {};

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() { this.loadFacilities(); this.loadStats(); }

  loadStats() {
    this.api.get<any>("/facilities/stats").subscribe({
      next: s => {
        this.deviationCount = s.deviations ?? 0;
        this.statCards = [
          { label:"Total Facilities", value:s.total      ??0, icon:"domain",       color:"#0891B2", bg:"#E0F2FE" },
          { label:"Active",           value:s.active     ??0, icon:"check_circle", color:"#10B981", bg:"#DCFCE7" },
          { label:"Readings Today",   value:0,                icon:"thermostat",   color:"#5B21B6", bg:"#EDE9FE" },
          { label:"Deviations",       value:s.deviations ??0, icon:"warning",      color:"#EF4444", bg:"#FEE2E2" },
        ];
      }, error: () => {}
    });
  }

  loadFacilities() {
    this.api.get<any[]>("/facilities", { q: this.search || null, status: this.filterStatus || null }).subscribe({
      next: r => { this.facilities = r; this.filtered = r; },
      error: e => { if (e.status !== 401) this.snack.open("Failed to load", "✕"); }
    });
  }

  filter() { this.loadFacilities(); }

  loadReadings() {
    const fId = this.filterFacility;
    if (fId) {
      this.api.get<any[]>("/facilities/" + fId + "/readings").subscribe({
        next: r => { this.readings = r; this.filteredReadings = r; }
      });
    } else {
      // Load all
      let all: any[] = [];
      let pending = this.facilities.length;
      if (!pending) return;
      this.facilities.forEach(f => {
        this.api.get<any[]>("/facilities/" + f.facilityId + "/readings").subscribe({
          next: r => { all.push(...r); },
          error: () => {},
          complete: () => {
            pending--;
            if (!pending) {
              this.readings = all.sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
              this.filteredReadings = this.readings;
            }
          }
        });
      });
    }
  }

  filterReadings() { this.loadReadings(); }

  loadDeviations() {
    this.api.get<any[]>("/facilities/deviations").subscribe({
      next: r => { this.deviations = r; this.deviationCount = r.length; }
    });
  }

  openNew() {
    this.editFac = null; this.facTab = 0;
    this.facForm = { facilityType:"LAB", status:"ACTIVE", tempUnit:"°C",
      monitorTemperature:true, monitorHumidity:true, withinLimits:true };
    this.showFacilityDialog = true;
  }

  edit(f: any) {
    this.editFac = f; this.facTab = 0;
    this.facForm = { ...f };
    this.showFacilityDialog = true;
  }

  saveFacility() {
    if (!this.facForm.facilityId || !this.facForm.name) {
      this.snack.open("Facility ID and Name are required", "✕", { duration: 3000 }); return;
    }
    this.api.post("/facilities", this.facForm).subscribe({
      next: () => {
        this.snack.open("Saved ✓", "");
        this.showFacilityDialog = false;
        this.loadFacilities(); this.loadStats();
      },
      error: () => this.snack.open("Error saving", "✕")
    });
  }

  openLog(f: any) {
    this.readingForm = {
      facilityId: f.facilityId,
      recordedAtLocal: new Date().toISOString().slice(0, 16),
      withinLimits: true
    };
    this.showReadingDialog = true;
  }

  openLogGeneral() {
    this.readingForm = {
      recordedAtLocal: new Date().toISOString().slice(0, 16),
      withinLimits: true
    };
    this.showReadingDialog = true;
  }

  saveReading() {
    if (!this.readingForm.facilityId) {
      this.snack.open("Select a facility", "✕", { duration: 3000 }); return;
    }
    const payload = {
      ...this.readingForm,
      recordedAt: this.readingForm.recordedAtLocal
        ? new Date(this.readingForm.recordedAtLocal).toISOString() : null
    };
    this.api.post("/facilities/" + this.readingForm.facilityId + "/readings", payload).subscribe({
      next: () => {
        this.snack.open("Reading logged ✓", "");
        this.showReadingDialog = false;
        this.loadStats();
        if (this.subView === "monitoring") this.loadReadings();
        if (this.subView === "deviations") this.loadDeviations();
      },
      error: () => this.snack.open("Error saving", "✕")
    });
  }

  anyMonitor(f: any): boolean {
    return f.monitorTemperature || f.monitorHumidity || f.monitorPressure ||
           f.monitorCo2 || f.monitorParticulates || f.monitorVibration || f.monitorLighting;
  }

  ft(t: string): string {
    const m: Record<string,string> = { LAB:"lab", STORAGE:"stor", CALIBRATION:"cal",
      CLEAN_ROOM:"clean", OFFICE:"off", EXTERNAL:"ext" };
    return m[t] ?? "def";
  }
  ac(a: string): string { return a || ""; }
  fsc(s: string): string {
    if (s === "ACTIVE") return "act";
    if (s === "UNDER_MAINTENANCE") return "maint";
    return "dec";
  }
}
