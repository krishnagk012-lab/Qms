import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { MatIconModule } from "@angular/material/icon";
import { AuthService } from "../../../core/auth/auth.service";
import { environment } from "../../../../environments/environment";

type Mode = "checking" | "register" | "login";

@Component({
  selector: "app-entry",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
<div class="screen">

  <!-- ═══ LEFT PANEL ═══ -->
  <div class="left">
    <div class="bg-grid"></div>
    <div class="glow g1"></div>
    <div class="glow g2"></div>
    <div class="glow g3"></div>

    <div class="left-inner">
      <!-- Brand -->
      <div class="brand">
        <div class="brand-mark"><mat-icon>biotech</mat-icon></div>
        <div>
          <div class="brand-name">QMS Suite</div>
          <div class="brand-iso">ISO 17025 : 2017</div>
        </div>
      </div>

      <!-- Headline -->
      <div class="headline" *ngIf="mode !== 'register'">
        <h2>Your laboratory's<br><em>quality command</em><br>centre</h2>
        <p>End-to-end quality management built for NABL-accredited testing and calibration laboratories.</p>
      </div>
      <div class="headline" *ngIf="mode === 'register'">
        <h2>Set up your<br><em>lab QMS</em><br>in minutes</h2>
        <p>Register your organisation and create your first administrator account to get started.</p>
      </div>

      <!-- Feature cards — login state -->
      <div class="feat-list" *ngIf="mode !== 'register'">
        <div class="fc" *ngFor="let f of features; let i = index" [style.animation-delay]="(i*0.07)+'s'">
          <div class="fc-icon"><mat-icon>{{f.icon}}</mat-icon></div>
          <div>
            <div class="fc-name">{{f.name}}</div>
            <div class="fc-desc">{{f.clause}}</div>
          </div>
        </div>
      </div>

      <!-- Step tracker — register state -->
      <div class="step-track" *ngIf="mode === 'register'">
        <div *ngFor="let s of steps; let i = index"
             class="st" [class.active]="step===i" [class.done]="step>i">
          <div class="st-line" *ngIf="i > 0"></div>
          <div class="st-dot">
            <mat-icon *ngIf="step>i">check</mat-icon>
            <span *ngIf="step<=i">{{i+1}}</span>
          </div>
          <div class="st-text">
            <div class="st-name">{{s.label}}</div>
            <div class="st-hint">{{s.hint}}</div>
          </div>
        </div>
      </div>

      <!-- Stats strip -->
      <div class="stats" *ngIf="mode !== 'register'">
        <div class="sv" *ngFor="let s of stats">
          <span class="sv-val">{{s.val}}</span>
          <span class="sv-lbl">{{s.lbl}}</span>
        </div>
      </div>

      <!-- Live badge -->
      <div class="live-badge">
        <span class="pulse-dot"></span>
        NABL · ISO/IEC 17025 : 2017 · Clause-wise Compliant
      </div>
    </div>
  </div>

  <!-- ═══ RIGHT PANEL ═══ -->
  <div class="right">
    <div class="dots-bg"></div>

    <div class="card" [class.card-review]="mode==='register' && step===3">

      <!-- ── CHECKING ── -->
      <div *ngIf="mode==='checking'" class="state-check">
        <div class="ring"></div>
        <p>Initialising…</p>
      </div>

      <!-- ══ REGISTER ══ -->
      <ng-container *ngIf="mode==='register'">
        <div class="card-top">
          <span class="pill">Step {{step+1}} / {{steps.length}}</span>
          <h2>{{steps[step].heading}}</h2>
          <p>{{steps[step].sub}}</p>
        </div>

        <!-- Step 0 -->
        <div *ngIf="step===0">
          <div class="f">
            <label>Organisation / Laboratory Name <b>*</b></label>
            <input [formControl]="c(orgForm,'orgName')" placeholder="e.g. National Testing Laboratories Pvt Ltd" [class.bad]="v(orgForm,'orgName')"/>
            <em *ngIf="v(orgForm,'orgName')">Required</em>
          </div>
          <div class="row">
            <div class="f"><label>Short Name</label><input [formControl]="c(orgForm,'shortName')" placeholder="e.g. NTL"/></div>
            <div class="f"><label>NABL Cert No.</label><input [formControl]="c(orgForm,'nablCertNo')" placeholder="TC-XXXX-2024"/></div>
          </div>
          <div class="row">
            <div class="f"><label>Lab Type</label>
              <div class="sw"><select [formControl]="c(orgForm,'labType')">
                <option value="TESTING">Testing Laboratory</option>
                <option value="CALIBRATION">Calibration Laboratory</option>
                <option value="BOTH">Testing & Calibration</option>
                <option value="MEDICAL">Medical Testing</option>
              </select></div>
            </div>
            <div class="f"><label>Accreditation</label>
              <div class="sw"><select [formControl]="c(orgForm,'accreditation')">
                <option value="NABL">NABL</option>
                <option value="ISO">ISO 17025 only</option>
                <option value="BOTH">NABL + ISO</option>
                <option value="NONE">None / Pending</option>
              </select></div>
            </div>
          </div>
        </div>

        <!-- Step 1 -->
        <div *ngIf="step===1">
          <div class="f"><label>Address</label><input [formControl]="c(contactForm,'address')" placeholder="Street address"/></div>
          <div class="row">
            <div class="f"><label>City <b>*</b></label><input [formControl]="c(contactForm,'city')" placeholder="e.g. Chennai" [class.bad]="v(contactForm,'city')"/><em *ngIf="v(contactForm,'city')">Required</em></div>
            <div class="f"><label>State <b>*</b></label><input [formControl]="c(contactForm,'state')" placeholder="e.g. Tamil Nadu" [class.bad]="v(contactForm,'state')"/><em *ngIf="v(contactForm,'state')">Required</em></div>
          </div>
          <div class="row">
            <div class="f"><label>Phone</label><input [formControl]="c(contactForm,'phone')" placeholder="+91 44 XXXX XXXX"/></div>
            <div class="f"><label>Email</label><input [formControl]="c(contactForm,'orgEmail')" placeholder="info@lab.com" type="email"/></div>
          </div>
          <div class="row">
            <div class="f"><label>Pincode</label><input [formControl]="c(contactForm,'pincode')" placeholder="600001"/></div>
            <div class="f"><label>Country</label><input [formControl]="c(contactForm,'country')"/></div>
          </div>
        </div>

        <!-- Step 2 -->
        <div *ngIf="step===2">
          <div class="notice"><mat-icon>shield</mat-icon><span>Creating the <strong>first administrator</strong> account for your QMS</span></div>
          <div class="f"><label>Full Name <b>*</b></label><input [formControl]="c(adminForm,'fullName')" placeholder="e.g. Dr. Arun Kumar" [class.bad]="v(adminForm,'fullName')"/><em *ngIf="v(adminForm,'fullName')">Required</em></div>
          <div class="row">
            <div class="f"><label>Username <b>*</b></label><input [formControl]="c(adminForm,'username')" placeholder="e.g. admin" autocomplete="off" [class.bad]="v(adminForm,'username')"/><em *ngIf="v(adminForm,'username')">Min 3 chars</em></div>
            <div class="f"><label>Email <b>*</b></label><input [formControl]="c(adminForm,'email')" placeholder="admin@lab.com" type="email" [class.bad]="v(adminForm,'email')"/><em *ngIf="v(adminForm,'email')">Valid email</em></div>
          </div>
          <div class="row">
            <div class="f"><label>Password <b>*</b></label>
              <div class="pw"><input [formControl]="c(adminForm,'password')" [type]="showPw?'text':'password'" placeholder="Min 6 characters" autocomplete="new-password" [class.bad]="v(adminForm,'password')"/><button type="button" (click)="showPw=!showPw"><mat-icon>{{showPw?'visibility_off':'visibility'}}</mat-icon></button></div>
              <em *ngIf="v(adminForm,'password')">Min 6 characters</em>
            </div>
            <div class="f"><label>Confirm Password <b>*</b></label>
              <input [formControl]="c(adminForm,'confirm')" [type]="showPw?'text':'password'" placeholder="Re-enter password" [class.bad]="adminForm.get('confirm')?.touched && adminForm.errors?.['mismatch']"/>
              <em *ngIf="adminForm.get('confirm')?.touched && adminForm.errors?.['mismatch']">Passwords don't match</em>
            </div>
          </div>
        </div>

        <!-- Step 3 — Review -->
        <div *ngIf="step===3" class="review">
          <div class="rv"><div class="rv-h"><mat-icon>business</mat-icon>Organisation</div>
            <div class="rr"><s>Name</s><strong>{{orgForm.value.orgName}}</strong></div>
            <div class="rr" *ngIf="orgForm.value.nablCertNo"><s>NABL</s><span>{{orgForm.value.nablCertNo}}</span></div>
            <div class="rr"><s>Type</s><span>{{orgForm.value.labType}}</span></div>
            <div class="rr"><s>Accreditation</s><span>{{orgForm.value.accreditation}}</span></div>
          </div>
          <div class="rv"><div class="rv-h"><mat-icon>location_on</mat-icon>Location</div>
            <div class="rr"><s>City</s><span>{{contactForm.value.city}}, {{contactForm.value.state}}</span></div>
            <div class="rr" *ngIf="contactForm.value.orgEmail"><s>Email</s><span>{{contactForm.value.orgEmail}}</span></div>
            <div class="rr" *ngIf="contactForm.value.phone"><s>Phone</s><span>{{contactForm.value.phone}}</span></div>
          </div>
          <div class="rv rv-full"><div class="rv-h"><mat-icon>manage_accounts</mat-icon>Administrator</div>
            <div class="rr"><s>Name</s><strong>{{adminForm.value.fullName}}</strong></div>
            <div class="rr"><s>Username</s><code>{{adminForm.value.username}}</code></div>
            <div class="rr"><s>Email</s><span>{{adminForm.value.email}}</span></div>
          </div>
        </div>

        <div class="errbox" *ngIf="errMsg"><mat-icon>error_outline</mat-icon>{{errMsg}}</div>

        <div class="nav">
          <button *ngIf="step>0" class="btn-ghost" (click)="prev()"><mat-icon>arrow_back</mat-icon>Back</button>
          <div style="flex:1"></div>
          <button *ngIf="step===0" class="link" (click)="mode='login';errMsg=''">Already registered? Sign in</button>
          <button *ngIf="step<3" class="btn-p" (click)="next()">Continue<mat-icon>arrow_forward</mat-icon></button>
          <button *ngIf="step===3" class="btn-p btn-launch" (click)="register()" [disabled]="loading">
            <span *ngIf="loading" class="spin-t">⟳</span>
            {{loading?'Registering…':'Launch QMS'}}<mat-icon *ngIf="!loading">rocket_launch</mat-icon>
          </button>
        </div>
      </ng-container>

      <!-- ══ LOGIN ══ -->
      <ng-container *ngIf="mode==='login'">

        <div class="ok-banner" *ngIf="successMsg">
          <mat-icon>celebration</mat-icon>
          <div><strong>Organisation registered!</strong><p>{{successMsg}}</p></div>
        </div>

        <div class="login-top">
          <div class="avatar"><mat-icon>person</mat-icon></div>
          <h2>Welcome back</h2>
          <p>Sign in to your QMS Suite account</p>
        </div>

        <div class="f">
          <label>Username</label>
          <div class="ifw"><mat-icon>person_outline</mat-icon>
            <input [formControl]="c(loginForm,'username')" placeholder="Enter your username" autocomplete="username" [class.bad]="loginForm.get('username')?.touched && loginForm.get('username')?.invalid"/>
          </div>
        </div>
        <div class="f">
          <label>Password</label>
          <div class="ifw pw"><mat-icon>lock_outline</mat-icon>
            <input [formControl]="c(loginForm,'password')" [type]="showPw?'text':'password'" placeholder="Enter your password" autocomplete="current-password" style="padding-left:38px" [class.bad]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"/>
            <button type="button" (click)="showPw=!showPw"><mat-icon>{{showPw?'visibility_off':'visibility'}}</mat-icon></button>
          </div>
        </div>

        <div class="errbox" *ngIf="errMsg"><mat-icon>error_outline</mat-icon>{{errMsg}}</div>

        <button class="btn-p btn-signin" (click)="login()" [disabled]="loading">
          <span *ngIf="loading" class="spin-t">⟳</span>
          {{loading?'Signing in…':'Sign In'}}<mat-icon *ngIf="!loading">login</mat-icon>
        </button>

        <div class="lf" *ngIf="!orgAlreadySetup">
          <span>New laboratory?</span>
          <button class="link" (click)="startRegister()">Register your organisation →</button>
        </div>
        <div class="lf" *ngIf="orgAlreadySetup">
          <mat-icon style="font-size:14px;width:14px;height:14px;color:#94A3B8">info</mat-icon>
          <span>Contact your administrator to get an account</span>
        </div>

      </ng-container>
    </div>
  </div>
</div>`,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}

    .screen{display:flex;min-height:100vh;width:100vw;font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden}

    /* ── LEFT ── */
    .left{width:400px;min-width:400px;flex-shrink:0;background:#06111F;position:relative;overflow:hidden;display:flex;flex-direction:column}
    .bg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,188,212,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,188,212,.05) 1px,transparent 1px);background-size:36px 36px;animation:gs 24s linear infinite}
    @keyframes gs{to{background-position:36px 36px}}
    .glow{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none}
    .g1{width:320px;height:320px;background:radial-gradient(circle,rgba(0,188,212,.2) 0%,transparent 70%);top:-80px;left:-60px;animation:p1 9s ease-in-out infinite alternate}
    .g2{width:240px;height:240px;background:radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 70%);bottom:80px;right:-40px;animation:p2 11s ease-in-out infinite alternate}
    .g3{width:180px;height:180px;background:radial-gradient(circle,rgba(16,185,129,.1) 0%,transparent 70%);bottom:200px;left:40px;animation:p1 13s ease-in-out infinite alternate-reverse}
    @keyframes p1{to{transform:translate(20px,25px) scale(1.1)}}
    @keyframes p2{to{transform:translate(-15px,-18px) scale(.9)}}

    .left-inner{position:relative;z-index:1;display:flex;flex-direction:column;padding:32px 28px;height:100%;gap:0}

    .brand{display:flex;align-items:center;gap:12px;margin-bottom:32px;animation:fu .5s ease both}
    .brand-mark{width:44px;height:44px;background:linear-gradient(135deg,rgba(0,188,212,.25),rgba(0,188,212,.08));border:1px solid rgba(0,188,212,.35);border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(0,188,212,.18)}
    .brand-mark mat-icon{color:#00BCD4;font-size:23px;width:23px;height:23px}
    .brand-name{display:block;color:#fff;font-size:1.05rem;font-weight:800;letter-spacing:-.3px}
    .brand-iso{display:block;color:rgba(0,188,212,.65);font-size:.62rem;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;margin-top:1px}

    .headline{margin-bottom:26px;animation:fu .5s .1s ease both}
    .headline h2{font-size:1.65rem;font-weight:800;line-height:1.22;color:#fff;letter-spacing:-.5px}
    .headline em{color:#00BCD4;font-style:normal}
    .headline p{color:rgba(255,255,255,.4);font-size:.77rem;line-height:1.65;margin-top:10px;max-width:290px}

    /* Feature cards */
    .feat-list{display:flex;flex-direction:column;gap:7px;flex:1;animation:fu .5s .18s ease both}
    .fc{display:flex;align-items:center;gap:11px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:10px 12px;cursor:default;transition:background .2s,border-color .2s;animation:fu .4s ease both}
    .fc:hover{background:rgba(0,188,212,.07);border-color:rgba(0,188,212,.22)}
    .fc-icon{width:30px;height:30px;flex-shrink:0;background:rgba(0,188,212,.12);border-radius:8px;display:flex;align-items:center;justify-content:center}
    .fc-icon mat-icon{color:#00BCD4;font-size:16px;width:16px;height:16px}
    .fc-name{color:rgba(255,255,255,.88);font-size:.78rem;font-weight:600}
    .fc-desc{color:rgba(255,255,255,.3);font-size:.66rem;margin-top:1px}

    /* Step tracker */
    .step-track{display:flex;flex-direction:column;gap:0;flex:1;animation:fu .5s .18s ease both}
    .st{display:flex;align-items:flex-start;gap:11px;padding:10px 10px;border-radius:10px;transition:background .15s;position:relative}
    .st.active{background:rgba(0,188,212,.1)}
    .st-line{display:none}
    .st-dot{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:rgba(255,255,255,.3);font-size:.7rem;font-weight:700}
    .st.active .st-dot{border-color:#00BCD4;color:#00BCD4;box-shadow:0 0 10px rgba(0,188,212,.3)}
    .st.done  .st-dot{background:#10B981;border-color:#10B981;color:#fff}
    .st.done  .st-dot mat-icon{font-size:13px;width:13px;height:13px}
    .st-name{color:rgba(255,255,255,.58);font-size:.78rem;font-weight:600}
    .st.active .st-name{color:#fff}
    .st-hint{color:rgba(255,255,255,.24);font-size:.65rem;margin-top:2px}

    /* Stats */
    .stats{display:flex;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;margin-top:18px;animation:fu .5s .28s ease both}
    .sv{flex:1;text-align:center;padding:11px 6px;border-right:1px solid rgba(255,255,255,.06)}
    .sv:last-child{border-right:none}
    .sv-val{display:block;color:#00BCD4;font-size:1.05rem;font-weight:800;letter-spacing:-.4px}
    .sv-lbl{display:block;color:rgba(255,255,255,.28);font-size:.58rem;text-transform:uppercase;letter-spacing:.7px;margin-top:2px}

    /* Live badge */
    .live-badge{display:flex;align-items:center;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.07);color:rgba(255,255,255,.25);font-size:.6rem;letter-spacing:.4px;animation:fu .5s .35s ease both}
    .pulse-dot{width:6px;height:6px;border-radius:50%;background:#10B981;box-shadow:0 0 7px #10B981;flex-shrink:0;animation:bk 2s ease-in-out infinite}
    @keyframes bk{0%,100%{opacity:1}50%{opacity:.35}}

    /* ── RIGHT ── */
    .right{flex:1;background:#F4F6FA;display:flex;align-items:center;justify-content:center;padding:28px 20px;overflow-y:auto;position:relative}
    .dots-bg{position:absolute;inset:0;background-image:radial-gradient(circle,#C8D5E3 1px,transparent 1px);background-size:22px 22px;opacity:.45;pointer-events:none}

    .card{position:relative;z-index:1;background:#fff;border-radius:20px;width:100%;max-width:460px;padding:34px 30px;box-shadow:0 1px 3px rgba(0,0,0,.05),0 8px 30px rgba(0,0,0,.08),0 0 0 1px rgba(0,0,0,.04);animation:ci .38s ease both}
    .card-review{max-width:560px}
    @keyframes ci{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

    /* Checking */
    .state-check{text-align:center;padding:46px 0;color:#94A3B8}
    .ring{width:38px;height:38px;border:3px solid #E2E8F0;border-top-color:#00BCD4;border-radius:50%;margin:0 auto 14px;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .state-check p{font-size:.84rem}

    /* Card top */
    .card-top{margin-bottom:20px}
    .pill{display:inline-flex;align-items:center;background:#EFF6FF;color:#3B82F6;font-size:.66rem;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:3px 10px;border-radius:20px;margin-bottom:9px}
    .card-top h2{font-size:1.15rem;font-weight:800;color:#0D1B3E;letter-spacing:-.3px}
    .card-top p{font-size:.75rem;color:#64748b;margin-top:3px}

    /* Fields */
    .f{margin-bottom:12px}
    .f label{display:block;font-size:.67rem;font-weight:700;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.45px}
    .f label b{color:#EF4444;font-weight:700}
    .f input,.f select{width:100%;height:41px;padding:0 12px;border:1.5px solid #E2E8F0;border-radius:10px;background:#FAFBFC;font-size:.85rem;color:#0F172A;outline:none;font-family:'Plus Jakarta Sans',sans-serif;transition:border-color .15s,box-shadow .15s,background .15s}
    .f input:focus,.f select:focus{border-color:#0891B2;box-shadow:0 0 0 3px rgba(8,145,178,.11);background:#fff}
    .f input.bad{border-color:#EF4444;background:#FFF5F5}
    .f em{font-size:.67rem;color:#EF4444;font-style:normal;margin-top:2px;display:block}
    .row{display:flex;gap:11px}
    .row .f{flex:1;min-width:0}
    .sw{position:relative}
    .sw select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center;padding-right:30px}

    /* Password */
    .pw{position:relative;display:flex;align-items:center}
    .pw input{padding-right:38px}
    .pw button,.f .pw button{position:absolute;right:9px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;display:flex;align-items:center;padding:2px;border-radius:4px}
    .pw button mat-icon{font-size:16px;width:16px;height:16px;color:#94A3B8}
    .pw button:hover mat-icon{color:#475569}

    /* Icon field */
    .ifw{position:relative}
    .ifw mat-icon:first-child{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:17px;width:17px;height:17px;color:#94A3B8;z-index:1}
    .ifw input{padding-left:36px}
    .ifw.pw input{padding-left:36px;padding-right:38px}
    .ifw.pw button{position:absolute;right:9px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;display:flex;align-items:center;padding:2px}
    .ifw.pw button mat-icon{font-size:16px;width:16px;height:16px;color:#94A3B8}

    /* Notice */
    .notice{display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#EFF6FF,#F0FDF4);border:1px solid #BFDBFE;border-radius:10px;padding:10px 13px;font-size:.78rem;color:#1E40AF;margin-bottom:13px}
    .notice mat-icon{font-size:17px;width:17px;height:17px;color:#3B82F6;flex-shrink:0}

    /* Review */
    .review{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px}
    .rv{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden}
    .rv-full{grid-column:span 2}
    .rv-h{display:flex;align-items:center;gap:6px;padding:8px 13px;background:#F1F5F9;font-size:.72rem;font-weight:700;color:#0D1B3E;border-bottom:1px solid #E2E8F0}
    .rv-h mat-icon{font-size:14px;width:14px;height:14px;color:#64748b}
    .rr{display:flex;justify-content:space-between;align-items:center;padding:7px 13px;font-size:.79rem;border-bottom:1px solid #F1F5F9}
    .rr:last-child{border-bottom:none}
    .rr s{color:#94A3B8;font-size:.66rem;font-weight:600;text-transform:uppercase;letter-spacing:.35px;text-decoration:none}
    .rr code{background:#EFF6FF;color:#1D4ED8;padding:1px 6px;border-radius:5px;font-family:'JetBrains Mono',monospace;font-size:.76rem}

    /* Error */
    .errbox{display:flex;align-items:center;gap:8px;background:#FEF2F2;color:#991B1B;border:1px solid #FECACA;border-radius:10px;padding:10px 13px;font-size:.78rem;margin:10px 0}
    .errbox mat-icon{font-size:16px;width:16px;height:16px;flex-shrink:0}

    /* Nav */
    .nav{display:flex;align-items:center;gap:10px;margin-top:18px;padding-top:16px;border-top:1px solid #F1F5F9}

    /* Buttons */
    .btn-p{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#0891B2,#0C7A96);color:#fff;border:none;border-radius:10px;height:42px;padding:0 20px;font-size:.85rem;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:transform .15s,box-shadow .15s;box-shadow:0 2px 8px rgba(8,145,178,.28)}
    .btn-p:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 16px rgba(8,145,178,.38)}
    .btn-p:disabled{opacity:.6;cursor:not-allowed;transform:none}
    .btn-p mat-icon{font-size:17px;width:17px;height:17px}
    .btn-launch,.btn-signin{width:100%;justify-content:center;height:46px;border-radius:12px;font-size:.9rem;margin-top:6px}
    .btn-ghost{display:inline-flex;align-items:center;gap:5px;background:transparent;color:#64748b;border:1.5px solid #E2E8F0;border-radius:10px;height:40px;padding:0 14px;font-size:.82rem;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:border-color .15s,color .15s}
    .btn-ghost:hover{border-color:#94A3B8;color:#0F172A}
    .btn-ghost mat-icon{font-size:15px;width:15px;height:15px}
    .link{background:none;border:none;cursor:pointer;color:#0891B2;font-size:.76rem;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;padding:0}
    .link:hover{text-decoration:underline}

    /* Login */
    .ok-banner{display:flex;align-items:flex-start;gap:10px;background:linear-gradient(135deg,#DCFCE7,#ECFDF5);border:1px solid #BBF7D0;border-radius:12px;padding:14px 15px;margin-bottom:20px}
    .ok-banner mat-icon{color:#16A34A;font-size:22px;width:22px;height:22px;flex-shrink:0;margin-top:1px}
    .ok-banner strong{color:#166534;font-size:.84rem;display:block}
    .ok-banner p{color:#166534;font-size:.75rem;margin-top:2px;opacity:.8}

    .login-top{text-align:center;margin-bottom:24px}
    .avatar{width:54px;height:54px;margin:0 auto 12px;background:linear-gradient(135deg,#EFF6FF,#E0F2FE);border:2px solid #BFDBFE;border-radius:50%;display:flex;align-items:center;justify-content:center}
    .avatar mat-icon{color:#3B82F6;font-size:26px;width:26px;height:26px}
    .login-top h2{font-size:1.25rem;font-weight:800;color:#0D1B3E;letter-spacing:-.4px}
    .login-top p{font-size:.76rem;color:#94A3B8;margin-top:4px}

    .lf{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:16px;font-size:.74rem;color:#94A3B8}

    .spin-t{display:inline-block;animation:spin .8s linear infinite;margin-right:4px}
    @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

    @media(max-width:760px){.left{display:none}.right{padding:16px;background:#F4F6FA}.card{padding:22px 16px}}
  `]
})
export class EntryComponent implements OnInit {
  mode: Mode = "checking";
  step = 0;
  loading = false;
  showPw = false;
  errMsg = "";
  successMsg = "";
  orgAlreadySetup = false;

  features = [
    { icon:"description",  name:"Document Control",        clause:"SOPs & policies — Cl. 8.3" },
    { icon:"build",        name:"Equipment & Calibration",  clause:"Tracking & alerts — Cl. 6.4" },
    { icon:"people",       name:"Personnel Competency",     clause:"Training records — Cl. 6.2" },
    { icon:"science",      name:"Test Records & PT",        clause:"Z-score & schemes — Cl. 7.5–7.7" },
    { icon:"verified",     name:"Reports & Certificates",   clause:"Issue & approve — Cl. 7.8" },
    { icon:"policy",       name:"NCR & Risk Register",      clause:"Non-conformances — Cl. 8.6–8.7" },
  ];

  stats = [
    { val:"17025", lbl:"ISO Standard" },
    { val:"8+",    lbl:"Modules" },
    { val:"NABL",  lbl:"Accreditation" },
  ];

  steps = [
    { label:"Organisation",  hint:"Lab & accreditation",  heading:"Register Your Organisation", sub:"Tell us about your laboratory." },
    { label:"Contact",       hint:"Address & contact",    heading:"Contact & Location",         sub:"Where is your laboratory based?" },
    { label:"Administrator", hint:"First admin account",  heading:"Create Administrator",       sub:"The primary admin account for your QMS." },
    { label:"Review",        hint:"Confirm & submit",     heading:"Review & Confirm",           sub:"Everything look good? Register below." },
  ];

  orgForm!: FormGroup;
  contactForm!: FormGroup;
  adminForm!: FormGroup;
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) { this.router.navigate([""]); return; }
    this.buildForms();
    this.http.get<any>(`${environment.apiUrl}/auth/setup-status`).subscribe({
      next:  r  => { this.orgAlreadySetup = !!r.data?.setupDone; this.mode = this.orgAlreadySetup ? "login" : "register"; },
      error: () => { this.mode = "register"; }
    });
  }

  buildForms() {
    this.orgForm = this.fb.group({ orgName:["",Validators.required], shortName:[""], nablCertNo:[""], labType:["TESTING"], accreditation:["NABL"] });
    this.contactForm = this.fb.group({ address:[""], city:["",Validators.required], state:["",Validators.required], country:["India"], pincode:[""], phone:[""], orgEmail:[""], website:[""] });
    this.adminForm = this.fb.group({
      fullName:["",Validators.required], username:["", [Validators.required,Validators.minLength(3)]],
      email:["", [Validators.required,Validators.email]],
      password:["", [Validators.required,Validators.minLength(6)]], confirm:["",Validators.required]
    }, { validators:(g:AbstractControl) => g.get("password")?.value===g.get("confirm")?.value ? null : {mismatch:true} });
    this.loginForm = this.fb.group({ username:["",Validators.required], password:["",Validators.required] });
  }

  startRegister() {
    if (this.orgAlreadySetup) { this.errMsg = "This instance already has an organisation. Ask your administrator to create an account."; return; }
    this.buildForms(); this.step=0; this.errMsg=""; this.successMsg=""; this.mode="register";
  }

  next() {
    this.errMsg = "";
    const f = [this.orgForm, this.contactForm, this.adminForm][this.step];
    if (f) { f.markAllAsTouched(); if (f.invalid) return; }
    this.step++;
  }
  prev() { this.errMsg=""; this.step--; }

  register() {
    this.loading=true; this.errMsg="";
    const p = {...this.orgForm.value, ...this.contactForm.value, ...this.adminForm.getRawValue()};
    delete p["confirm"];
    this.http.post<any>(`${environment.apiUrl}/auth/register`, p).subscribe({
      next: r => { this.loading=false; this.orgAlreadySetup=true; this.mode="login"; this.successMsg=`Sign in with username: ${r.data?.username??p.username}`; this.loginForm.patchValue({username:r.data?.username??p.username}); this.showPw=false; },
      error: e => { this.loading=false; this.errMsg=e.error?.error??"Registration failed. Please try again."; }
    });
  }

  login() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;
    this.loading=true; this.errMsg="";
    const {username,password} = this.loginForm.value;
    this.auth.login(username,password).subscribe({
      next:  () => { this.loading=false; this.router.navigate([""]); },
      error: () => { this.loading=false; this.errMsg="Invalid username or password."; this.loginForm.get("password")?.reset(); }
    });
  }

  c(form: FormGroup, field: string) { return form.get(field) as any; }
  v(form: FormGroup, field: string) { const c=form.get(field); return !!(c?.touched && c?.invalid); }
}
