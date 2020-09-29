import { Component, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AuthenticationService } from "./auth.service";
import { AuthGuardService } from "./auth-guard.service";
import { GlobalSearchService } from "./global-search.service";
import { CommentsService } from "./comments.service";
import { ExportService } from "./export.service";
@NgModule({
  declarations: [
    //AuthenticationService, AuthGuardService,CommentsService,GlobalSearchService
  ],
  imports: [CommonModule],
  exports: [
    //AuthenticationService, AuthGuardService,CommentsService,GlobalSearchService
  ],
  providers: [
    AuthenticationService,
    AuthGuardService,
    CommentsService,
    GlobalSearchService,
    ExportService,
  ],
})
export class ServiceModule {}
