import { Routes } from "@angular/router";
import { authGuard } from "./core/auth/auth.guard";

export const routes: Routes = [
  { path: "login",    loadComponent: () => import("./features/auth/entry/entry.component").then(m => m.EntryComponent) },
  { path: "register", redirectTo: "login", pathMatch: "full" },
  {
    path: "",
    loadComponent: () => import("./layout/shell/shell.component").then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: "",                       redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard",              loadComponent: () => import("./features/dashboard/dashboard.component").then(m => m.DashboardComponent) },
      // Documents
      { path: "documents",              loadComponent: () => import("./features/documents/documents.component").then(m => m.DocumentsComponent) },
      // Equipment sub-routes
      { path: "equipment",              loadComponent: () => import("./features/equipment/equipment.component").then(m => m.EquipmentComponent) },
      { path: "equipment/schedule",     loadComponent: () => import("./features/equipment/cal-schedule.component").then(m => m.CalScheduleComponent) },
      { path: "equipment/cal-history",  loadComponent: () => import("./features/equipment/cal-history.component").then(m => m.CalHistoryComponent) },
      { path: "equipment/maintenance",  loadComponent: () => import("./features/equipment/maintenance.component").then(m => m.MaintenanceComponent) },
      // Personnel sub-routes
      { path: "personnel",              loadComponent: () => import("./features/personnel/personnel.component").then(m => m.PersonnelComponent) },
      { path: "personnel/training",     loadComponent: () => import("./features/personnel/training.component").then(m => m.TrainingComponent) },
      // Testing
      { path: "facilities",  loadComponent: () => import("./features/facilities/facilities.component").then(m => m.FacilitiesComponent) },
      { path: "methods",    loadComponent: () => import("./features/methods/methods.component").then(m => m.MethodsComponent) },
      { path: "suppliers",          loadComponent: () => import("./features/suppliers/suppliers.component").then(m => m.SuppliersComponent) },
      { path: "complaints",          loadComponent: () => import("./features/complaints/complaints.component").then(m => m.ComplaintsComponent) },
      { path: "samples",             loadComponent: () => import("./features/samples/samples.component").then(m => m.SamplesComponent) },
      { path: "management-review",   loadComponent: () => import("./features/management-review/management-review.component").then(m => m.ManagementReviewComponent) },
      { path: "traceability",        loadComponent: () => import("./features/traceability/traceability.component").then(m => m.TraceabilityComponent) },
      { path: "scope",               loadComponent: () => import("./features/scope/scope.component").then(m => m.ScopeComponent) },
      { path: "organisation",        loadComponent: () => import("./features/organisation/organisation.component").then(m => m.OrganisationComponent) },
      { path: "testing",                loadComponent: () => import("./features/testing/testing.component").then(m => m.TestingComponent) },
      { path: "uncertainty",            loadComponent: () => import("./features/uncertainty/uncertainty.component").then(m => m.UncertaintyComponent) },
      { path: "proficiency",            loadComponent: () => import("./features/proficiency/proficiency.component").then(m => m.ProficiencyComponent) },
      // Quality sub-routes
      { path: "audit",                  loadComponent: () => import("./features/audit/audit.component").then(m => m.AuditComponent) },
      { path: "risk",                   loadComponent: () => import("./features/risk/risk.component").then(m => m.RiskComponent) },
      // Reports
      { path: "reports",                loadComponent: () => import("./features/reports/reports.component").then(m => m.ReportsComponent) },
      // Admin
      { path: "users",                  loadComponent: () => import("./features/users/users.component").then(m => m.UsersComponent) },
    ]
  },
  { path: "**", redirectTo: "login" }
];
