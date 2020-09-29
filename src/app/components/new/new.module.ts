import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ModalModule } from "ngx-bootstrap/modal";
import { DragulaModule } from "ng2-dragula";
import { TagInputModule } from "ngx-chips";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { UiSwitchModule } from "ngx-ui-switch";
//import { CKEditorModule } from 'ckeditor4-angular';
import { NewDocumentComponent } from "./new-document/new-document.component";
import { NewSectionsComponent } from "./new-sections/new-sections.component";
import { NewContractComponent } from "./new-contract/new-contract.component";
import { CollaboratorsComponent } from "./collaborators/collaborators.component";
import { ShareTemplatesComponent } from "./share-templates/share-templates.component";
import { DragDropModule } from "@angular/cdk/drag-drop";

import * as $ from "jquery";

const routes: Routes = [
  {
    path: "document",
    component: NewDocumentComponent,
  },
  {
    path: "section",
    component: NewSectionsComponent,
  },
  {
    path: "contract",
    component: NewContractComponent,
  },
  {
    path: "collaborators",
    component: CollaboratorsComponent,
  },
];

@NgModule({
  declarations: [
    NewDocumentComponent,
    NewSectionsComponent,
    NewContractComponent,
    CollaboratorsComponent,
    ShareTemplatesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CKEditorModule,
    TagInputModule,
    Ng2SmartTableModule,
    UiSwitchModule,
    ModalModule.forRoot(),
    DragulaModule.forRoot(),
    DragDropModule,
  ],
  exports: [
    NewDocumentComponent,
    NewSectionsComponent,
    NewContractComponent,
    CollaboratorsComponent,
    ShareTemplatesComponent,
  ],
  providers: [ShareTemplatesComponent, CollaboratorsComponent],
  entryComponents: [ShareTemplatesComponent, CollaboratorsComponent],
})
export class NewModule {}
