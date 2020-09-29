import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ToastrModule } from "ngx-toastr";
import { CookieService } from "ngx-cookie-service";

import { CountToModule } from "angular-count-to";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

// import ngx-translate and the http loader
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Ng2CompleterModule } from "ng2-completer";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { Globals } from "./globals";

import { SharedModule } from "./shared/shared.module";
import { AuthenticationModule } from "./components/authentication/authentication.module";
import { DocumentsModule } from "./components/documents/documents.module";
import { ProfileModule } from "./components/profile/profile.module";
import { NewModule } from "./components/new/new.module";
import { TemplatesModule } from "./components/templates/templates.module";
import { ErrorModules } from "./components/errorPages/errorPages.module";

//import { ServiceModule } from "./services/services.module";

import { AuthenticationService } from "./services/auth.service";
import { AuthGuardService } from "./services/auth-guard.service";
import { GlobalSearchService } from "./services/global-search.service";
import { CommentsService } from "./services/comments.service";
import { ExportService } from "./services/export.service";

import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { MainPageComponent } from "./components/main-page/main-page.component";
import { HelpComponent } from "./components/help/help.component";
//import { SortListPipe } from "./components/dashboard/dashboard.component";
import { SortListPipe } from "./shared/pipes/sortPipe.pipe";

import { GraphQLModule } from "./graphql.module";
import { PreviewModule } from "./components/preview/preview.module";
import { SearchResultsComponent } from "./components/search-results/search-results.component";
import { MatMenuModule } from "@angular/material/menu";
import { Ng2SmartTableModule } from "ng2-smart-table";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MainPageComponent,
    HelpComponent,
    SearchResultsComponent,
    SortListPipe,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CountToModule,
    NgbModule,
    SharedModule,
    MatMenuModule,
    Ng2SmartTableModule,
    Ng2CompleterModule,
    AuthenticationModule,
    DocumentsModule,
    ProfileModule,
    NewModule,
    TemplatesModule,
    ErrorModules,
    AppRoutingModule,
    FormsModule,
    DragDropModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: "never" }),
    //TagInputModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ToastrModule.forRoot(),
    GraphQLModule,
    PreviewModule,
  ],
  providers: [
    CookieService,
    Globals,
    //ServiceModule,
    AuthenticationService,
    AuthGuardService,
    CommentsService,
    GlobalSearchService,
    ExportService,
    SortListPipe,
    AuthenticationModule,
    DocumentsModule,
    TemplatesModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
