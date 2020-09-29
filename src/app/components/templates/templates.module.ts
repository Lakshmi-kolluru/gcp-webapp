import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { Ng2CompleterModule } from "ng2-completer";
import { MatMenuModule } from "@angular/material/menu";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { MatSelectModule } from "@angular/material/select";
import { CountToModule } from "angular-count-to";

import { DocumentTemplateComponent } from "./document-template/document-template.component";
import { SectionTemplateComponent } from "./section-template/section-template.component";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { CreatedTemplatesComponent } from "./created-templates/created-templates.component";
import { SharedTemplatesComponent } from "./shared-templates/shared-templates.component";
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: "docPreview",
    component: DocumentTemplateComponent,
  },
  {
    path: "created",
    component: CreatedTemplatesComponent,
  },
  {
    path: "collaborate",
    component: SharedTemplatesComponent,
  },
];

@NgModule({
  declarations: [
    DocumentTemplateComponent,
    SectionTemplateComponent,
    CreatedTemplatesComponent,
    SharedTemplatesComponent,
  ],

  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatSelectModule,
    NgMultiSelectDropDownModule.forRoot(),
    Ng2SmartTableModule,
    Ng2CompleterModule,
    InfiniteScrollModule,
    SharedModule,
    MatMenuModule,
    CountToModule,
  ],

  exports: [
    DocumentTemplateComponent,
    SectionTemplateComponent,
    CreatedTemplatesComponent,
    SharedTemplatesComponent,
  ],
  providers: [DocumentTemplateComponent, SectionTemplateComponent],
  entryComponents: [
    DocumentTemplateComponent,
    SectionTemplateComponent,
    CreatedTemplatesComponent,
    SharedTemplatesComponent,
  ],
})
export class TemplatesModule {}
