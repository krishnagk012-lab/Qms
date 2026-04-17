import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarNavComponent } from "../sidebar-nav/sidebar-nav.component";
import { TopbarComponent } from "../topbar/topbar.component";
@Component({
  selector: "app-shell", standalone: true,
  imports: [RouterOutlet, SidebarNavComponent, TopbarComponent],
  template: `
    <div class="app-layout">
      <app-sidebar-nav/>
      <div class="main-area">
        <app-topbar/>
        <main class="main-content"><router-outlet/></main>
      </div>
    </div>`,
  styles: [`
    .app-layout { display:flex; min-height:100vh; }
    .main-area  { flex:1; display:flex; flex-direction:column; margin-left:256px; min-width:0; }
    .main-content { flex:1; padding:24px; overflow-x:hidden; }
  `]
})
export class ShellComponent {}
