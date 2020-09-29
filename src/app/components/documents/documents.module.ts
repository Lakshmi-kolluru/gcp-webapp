import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CountToModule } from 'angular-count-to';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { Ng2CompleterModule } from 'ng2-completer';
import { MatMenuModule } from '@angular/material/menu';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { DocumentHistoryComponent } from './document-history/document-history.component';
import { CollaboratedDocumentComponent } from './collaborated-document/collaborated-document.component';
import { CreatedDocumentComponent } from './created-document/created-document.component';


import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'history',
    component: DocumentHistoryComponent
  },
  {
    path: 'collaborate',
    component: CollaboratedDocumentComponent
  },
  {
    path: 'created',
    component: CreatedDocumentComponent
  }
];

@NgModule({
  declarations: [
    DocumentHistoryComponent,
    CollaboratedDocumentComponent,
    CreatedDocumentComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule,
    CountToModule,
    Ng2CompleterModule,
    Ng2SmartTableModule,
    MatMenuModule,
    CKEditorModule,
    InfiniteScrollModule
  ],
  exports: [
    DocumentHistoryComponent,
    CollaboratedDocumentComponent,
    CreatedDocumentComponent
  ],
  providers: [],
})
export class DocumentsModule { }
