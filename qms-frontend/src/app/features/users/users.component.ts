import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../core/api/api.service";

@Component({ selector:"app-users", standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule,MatTableModule,MatButtonModule,MatIconModule,MatFormFieldModule,MatInputModule,MatTooltipModule],
  template:`
  <div class="page-wrap">
    <div class="page-header"><h2>User Management</h2><p>Manage system accounts, roles and access control</p></div>
    <div class="toolbar-row">
      <mat-form-field appearance="outline" class="no-hint" style="width:220px">
        <mat-icon matPrefix>search</mat-icon><mat-label>Search users</mat-label>
        <input matInput [(ngModel)]="search" (ngModelChange)="filtered=filter()"/>
      </mat-form-field>
      <div class="toolbar-spacer"></div>
      <button mat-flat-button color="primary" (click)="openNew()"><mat-icon>person_add</mat-icon> Add User</button>
    </div>
    <div class="mat-table-wrap">
      <table mat-table [dataSource]="filtered">
        <ng-container matColumnDef="username"><th mat-header-cell *matHeaderCellDef>Username</th><td mat-cell *matCellDef="let u"><span class="id-chip">{{u.username}}</span></td></ng-container>
        <ng-container matColumnDef="fullName"><th mat-header-cell *matHeaderCellDef>Full Name</th><td mat-cell *matCellDef="let u"><strong>{{u.fullName}}</strong></td></ng-container>
        <ng-container matColumnDef="role"><th mat-header-cell *matHeaderCellDef>Role</th><td mat-cell *matCellDef="let u"><span class="chip" [class]="roleChip(u.role)">{{u.role}}</span></td></ng-container>
        <ng-container matColumnDef="department"><th mat-header-cell *matHeaderCellDef>Department</th><td mat-cell *matCellDef="let u">{{u.department}}</td></ng-container>
        <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef>Email</th><td mat-cell *matCellDef="let u">{{u.email}}</td></ng-container>
        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let u"><span class="chip" [class]="u.isActive?'chip-green':'chip-gray'">{{u.isActive?'Active':'Inactive'}}</span></td></ng-container>
        <ng-container matColumnDef="lastLogin"><th mat-header-cell *matHeaderCellDef>Last Login</th><td mat-cell *matCellDef="let u" style="color:#94A3B8;font-size:0.78rem">{{u.lastLogin?(u.lastLogin|date:'dd MMM yyyy HH:mm'):'Never'}}</td></ng-container>
        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let u"><button mat-icon-button (click)="edit(u)" matTooltip="Edit"><mat-icon>edit</mat-icon></button></td></ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row;columns:cols"></tr>
      </table>
      <div *ngIf="!filtered.length" style="padding:40px;text-align:center;color:#94A3B8">No users found</div>
    </div>
    <div *ngIf="showDialog" class="dlg-backdrop" (click)="showDialog=false">
      <div class="dlg-panel" (click)="$event.stopPropagation()">
        <div class="dlg-head">{{editItem?.id?"Edit User":"Add User"}}<button mat-icon-button (click)="showDialog=false"><mat-icon>close</mat-icon></button></div>
        <div class="dlg-body" *ngIf="userForm">
          <form [formGroup]="userForm">
            <div class="f-row">
              <div class="f-col"><label class="f-label">Username *</label><input class="f-input" formControlName="username" [readonly]="!!editItem?.id" placeholder="e.g. ravi"/></div>
              <div class="f-col"><label class="f-label">Role</label><select class="f-select" formControlName="role"><option *ngFor="let r of roles" [value]="r">{{r}}</option></select></div>
            </div>
            <div class="f-full"><label class="f-label">Full Name *</label><input class="f-input" formControlName="fullName" placeholder="Full name"/></div>
            <div class="f-row">
              <div class="f-col"><label class="f-label">Department</label><input class="f-input" formControlName="department" placeholder="Department"/></div>
              <div class="f-col"><label class="f-label">Email</label><input class="f-input" formControlName="email" type="email" placeholder="email@lab.com"/></div>
            </div>
            <div class="f-full" *ngIf="!editItem?.id"><label class="f-label">Password *</label>
              <div style="position:relative">
                <input class="f-input" [type]="showPw?'text':'password'" formControlName="password" placeholder="Min 6 characters" style="padding-right:44px"/>
                <button type="button" mat-icon-button style="position:absolute;right:4px;top:0" (click)="showPw=!showPw"><mat-icon>{{showPw?"visibility_off":"visibility"}}</mat-icon></button>
              </div>
            </div>
          </form>
        </div>
        <div class="dlg-foot"><button mat-stroked-button (click)="showDialog=false">Cancel</button><button mat-flat-button color="primary" (click)="save()">Save User</button></div>
      </div>
    </div>
  </div>`,
  styles:[`.no-hint .mat-mdc-form-field-subscript-wrapper{display:none}`]
})
export class UsersComponent implements OnInit {
  cols=["username","fullName","role","department","email","status","lastLogin","actions"];
  users:any[]=[]; filtered:any[]=[]; search="";
  showDialog=false; editItem:any=null; showPw=false; userForm!:FormGroup;
  roles=["ADMIN","MANAGER","ANALYST","AUDITOR","VIEWER"];
  constructor(private api:ApiService, private snack:MatSnackBar, private fb:FormBuilder){}
  ngOnInit(){ this.load(); }
  load(){ this.api.get<any[]>("/auth/users").subscribe({next:u=>{this.users=u;this.filtered=this.filter();},error:()=>this.snack.open("Failed to load users","✕")}); }
  filter(){ return this.users.filter(u=>!this.search||u.fullName?.toLowerCase().includes(this.search.toLowerCase())||u.username?.toLowerCase().includes(this.search.toLowerCase())); }
  openNew(){this.editItem={};this.showPw=false;this.userForm=this.fb.group({username:["",Validators.required],fullName:["",Validators.required],role:["ANALYST"],department:[""],email:[""],password:["",Validators.minLength(6)]});this.showDialog=true;}
  edit(u:any){this.editItem={...u};this.showPw=false;this.userForm=this.fb.group({username:[{value:u.username,disabled:true}],fullName:[u.fullName,Validators.required],role:[u.role],department:[u.department||""],email:[u.email||""],password:[""]});this.showDialog=true;}
  save(){if(this.userForm.invalid)return;const v=this.userForm.getRawValue();const ep=this.editItem.id?`/auth/users/${this.editItem.id}`:"/auth/users";this.api.post(ep,v).subscribe({next:()=>{this.snack.open("User saved","✓");this.showDialog=false;this.load();},error:()=>this.snack.open("Error","✕")});}
  roleChip(r:string){const m:any={ADMIN:"chip chip-red",MANAGER:"chip chip-blue",ANALYST:"chip chip-teal",AUDITOR:"chip chip-amber",VIEWER:"chip chip-gray"};return m[r]??"chip chip-gray";}
}
