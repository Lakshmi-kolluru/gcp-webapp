import { NgModule } from "@angular/core";
import { RouterModule, Routes, PreloadAllModules } from "@angular/router";

import { MainPageComponent } from "./components/main-page/main-page.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { DocumentsModule } from "./components/documents/documents.module";
import { ProfileModule } from "./components/profile/profile.module";
import { NewModule } from "./components/new/new.module";
import { TemplatesModule } from "./components/templates/templates.module";
import { HelpComponent } from "./components/help/help.component";
import { AuthGuardService } from "./services/auth-guard.service";
import { PreviewModule } from "./components/preview/preview.module";
import { ErrorModules } from "./components/errorPages/errorPages.module";
import { SearchResultsComponent } from "./components/search-results/search-results.component";

const routes: Routes = [
  {
    path: "mainPage",
    component: MainPageComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: "", redirectTo: "/mainPage/dashboard", pathMatch: "full" },
      { path: "searchresult", component: SearchResultsComponent },
      { path: "dashboard", component: DashboardComponent },
      {
        path: "documents",
        // loadChildren: () => DocumentsModule,
        loadChildren: "./components/documents/documents.module#DocumentsModule",
      },
      { path: "help", component: HelpComponent },
      {
        path: "profile",
        //loadChildren: () => ProfileModule,
        loadChildren: "./components/profile/profile.module#ProfileModule",
      },
      {
        path: "templates",
        // loadChildren: () => TemplatesModule,
        loadChildren: "./components/templates/templates.module#TemplatesModule",
      },
      {
        path: "new",
        // loadChildren: () => NewModule,
        loadChildren: "./components/new/new.module#NewModule",
      },
      {
        path: "preview",
        // loadChildren: () => PreviewModule,
        loadChildren: "./components/preview/preview.module#PreviewModule",
      },
    ],
  },
  {
    path: "errors",
    // loadChildren: () => ErrorModules,
    loadChildren: "./components/errorPages/errorPages.module#ErrorModules",
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      preloadingStrategy: PreloadAllModules,
      anchorScrolling: "enabled",
      scrollPositionRestoration: "enabled",
      onSameUrlNavigation: "reload",
    }),
  ],
  exports: [RouterModule],
  providers: [AuthGuardService],
})
export class AppRoutingModule {}
