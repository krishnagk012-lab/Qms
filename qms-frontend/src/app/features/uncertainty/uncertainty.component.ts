import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";

interface USource { name:string; type:string; value:number; unit:string; divisor:number; ci:number; }

@Component({
  selector:"app-uncertainty", standalone:true,
  imports:[CommonModule,FormsModule,MatTableModule,MatButtonModule,MatIconModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatTooltipModule],
  template:`
  <div class="page-wrap">
    <div class="page-header"><h2>Measurement Uncertainty Calculator</h2><p>ISO 17025:2017 · Clause 7.6 — GUM Method (JCGM 100:2008)</p></div>

    <div class="unc-layout">
      <div class="unc-left qms-card">
        <div class="qms-card-header"><h3>Uncertainty Budget</h3></div>
        <div class="qms-card-body">
          <div class="budget-meta">
            <mat-form-field appearance="outline" style="flex:2">
              <mat-label>Measurand</mat-label>
              <input matInput [(ngModel)]="measurand" placeholder="e.g. pH of drinking water"/>
            </mat-form-field>
            <mat-form-field appearance="outline" style="flex:0.8">
              <mat-label>Unit</mat-label>
              <input matInput [(ngModel)]="unit"/>
            </mat-form-field>
            <mat-form-field appearance="outline" style="flex:0.8">
              <mat-label>k factor</mat-label>
              <input matInput type="number" [(ngModel)]="k" min="1" max="3" step="0.1"/>
            </mat-form-field>
          </div>

          <div class="mat-table-wrap" style="margin-top:14px">
            <table mat-table [dataSource]="sources">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Source of Uncertainty</th>
                <td mat-cell *matCellDef="let s"><input class="cell-input" [(ngModel)]="s.name"/></td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let s">
                  <select class="cell-select" [(ngModel)]="s.type"><option value="A">A</option><option value="B">B</option></select>
                </td>
              </ng-container>
              <ng-container matColumnDef="value">
                <th mat-header-cell *matHeaderCellDef>Value</th>
                <td mat-cell *matCellDef="let s"><input class="cell-input num" type="number" [(ngModel)]="s.value"/></td>
              </ng-container>
              <ng-container matColumnDef="divisor">
                <th mat-header-cell *matHeaderCellDef>Divisor</th>
                <td mat-cell *matCellDef="let s"><input class="cell-input num" type="number" [(ngModel)]="s.divisor" step="0.001"/></td>
              </ng-container>
              <ng-container matColumnDef="ci">
                <th mat-header-cell *matHeaderCellDef>cᵢ</th>
                <td mat-cell *matCellDef="let s"><input class="cell-input num" type="number" [(ngModel)]="s.ci" step="0.1"/></td>
              </ng-container>
              <ng-container matColumnDef="ustd">
                <th mat-header-cell *matHeaderCellDef>u(xᵢ)</th>
                <td mat-cell *matCellDef="let s" style="font-family:monospace;font-size:0.78rem">{{uStd(s)|number:"1.5-5"}}</td>
              </ng-container>
              <ng-container matColumnDef="pct">
                <th mat-header-cell *matHeaderCellDef>%</th>
                <td mat-cell *matCellDef="let s">
                  <div class="pct-bar-wrap">
                    <div class="pct-bar" [style.width]="pct(s)+'%'" [style.background]="pct(s)>40?'#EF4444':pct(s)>25?'#F59E0B':'#10B981'"></div>
                    <span [style.color]="pct(s)>40?'#991B1B':pct(s)>25?'#92400E':'#166534'">{{pct(s)|number:"1.1-1"}}%</span>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="del">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let s;let i=index">
                  <button mat-icon-button (click)="remove(i)" matTooltip="Remove"><mat-icon style="font-size:16px;color:#EF4444">delete</mat-icon></button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row;columns:cols"></tr>
            </table>
          </div>
          <button mat-stroked-button (click)="addRow()" style="margin-top:10px"><mat-icon>add</mat-icon> Add Source</button>
        </div>
      </div>

      <div class="unc-right">
        <div class="qms-card result-card">
          <div class="qms-card-header"><h3>Results</h3></div>
          <div class="qms-card-body">
            <div class="result-row"><span>Combined u_c</span><span class="mono">{{uCombined()|number:"1.5-5"}} {{unit}}</span></div>
            <div class="result-row"><span>Coverage factor k</span><span class="mono">{{k}}</span></div>
            <div class="result-row"><span>Coverage probability</span><span class="mono">~95.45%</span></div>
            <div class="expanded-u">
              <div class="eu-label">Expanded Uncertainty U</div>
              <div class="eu-value">±{{(uCombined()*k)|number:"1.4-4"}} {{unit}}</div>
              <div class="eu-sub">k = {{k}}, 95% confidence</div>
            </div>
          </div>
        </div>
        <div class="qms-card stmt-card">
          <div class="qms-card-header"><h3>Reporting Statement</h3></div>
          <div class="qms-card-body">
            <p class="stmt-text">The expanded uncertainty U = ±{{(uCombined()*k)|number:"1.4-4"}} {{unit}} was calculated using a coverage factor <em>k</em> = {{k}}, corresponding to a coverage probability of approximately 95.45%, in accordance with JCGM 100:2008 (GUM).</p>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`
    .unc-layout{display:grid;grid-template-columns:1fr 300px;gap:16px;align-items:start}
    .budget-meta{display:flex;gap:12px}
    .budget-meta mat-form-field{margin-bottom:0}
    .cell-input{width:100%;border:none;background:transparent;font-size:0.83rem;font-family:inherit;color:#0F172A;padding:2px 4px;outline:none}
    .cell-input.num{text-align:right;font-family:monospace;width:80px}
    .cell-select{border:none;background:transparent;font-size:0.83rem;font-family:inherit;color:#0F172A;padding:2px 4px;outline:none;cursor:pointer}
    .pct-bar-wrap{display:flex;align-items:center;gap:6px}
    .pct-bar{height:6px;border-radius:3px;min-width:2px;transition:width .3s}
    .pct-bar-wrap span{font-size:0.72rem;font-weight:600;min-width:36px}
    .result-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #F1F5F9;font-size:0.85rem}
    .result-row:last-child{border-bottom:none}
    .mono{font-family:monospace;font-weight:600;font-size:0.85rem}
    .expanded-u{background:#0D1B3E;border-radius:10px;padding:16px;margin-top:14px;text-align:center}
    .eu-label{font-size:0.72rem;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
    .eu-value{font-size:1.6rem;font-weight:800;color:#00BCD4;font-family:monospace}
    .eu-sub{font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:4px}
    .stmt-card{margin-top:12px}
    .stmt-text{font-size:0.82rem;line-height:1.7;color:#475569;font-style:italic;margin:0}
    @media(max-width:900px){.unc-layout{grid-template-columns:1fr}}
  `]
})
export class UncertaintyComponent {
  measurand="pH of drinking water"; unit="pH"; k=2;
  cols=["name","type","value","divisor","ci","ustd","pct","del"];
  sources:USource[]=[
    {name:"Calibration of pH buffer",  type:"B",value:0.020,unit:"pH",divisor:1.732,ci:1.0},
    {name:"Repeatability (Type A)",    type:"A",value:0.015,unit:"pH",divisor:1.0,  ci:1.0},
    {name:"Resolution of display",     type:"B",value:0.005,unit:"pH",divisor:1.732,ci:1.0},
    {name:"Temperature effect",        type:"B",value:0.010,unit:"pH",divisor:1.732,ci:1.0},
    {name:"Reference electrode drift", type:"B",value:0.008,unit:"pH",divisor:1.732,ci:1.0},
  ];
  uStd(s:USource){return s.divisor&&s.divisor!==0?(s.value*s.ci)/s.divisor:0;}
  uSq(s:USource){return Math.pow(this.uStd(s),2);}
  uCombined(){return Math.sqrt(this.sources.reduce((sum,s)=>sum+this.uSq(s),0));}
  pct(s:USource){const uc=this.uCombined();return uc>0?(this.uSq(s)/(uc*uc))*100:0;}
  addRow(){this.sources.push({name:"New source",type:"B",value:0.001,unit:this.unit,divisor:1.732,ci:1.0});}
  remove(i:number){this.sources.splice(i,1);}
}
