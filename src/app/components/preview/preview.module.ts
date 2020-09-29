import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentPreviewComponent } from './document-preview/document-preview.component';
import { SectionPreviewComponent } from './section-preview/section-preview.component';
import { Routes, RouterModule } from '@angular/router';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatMenuModule } from '@angular/material/menu';
import { UiSwitchModule } from "ngx-ui-switch";
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentTemplatePreviewComponent } from './document-template-preview/document-template-preview.component';
import { SectionTemplatePreviewComponent } from './section-template-preview/section-template-preview.component';
import { CommentsComponent } from './comments/comments.component';

const routes: Routes = [
  {
    path: 'document',
    component: DocumentPreviewComponent,
  },
  {
    path: 'section',
    component: SectionPreviewComponent,
  },
   {
    path: 'documentTemplate',
    component: DocumentTemplatePreviewComponent,
  },
  {
    path: 'sectionTemplate',
    component: SectionTemplatePreviewComponent,
  }
];

@NgModule({
  declarations: [
    DocumentPreviewComponent,
    SectionPreviewComponent,
    DocumentTemplatePreviewComponent,
    SectionTemplatePreviewComponent,
    CommentsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    NgbModule,
    MatMenuModule,
    UiSwitchModule,
    SharedModule
  ]
})
export class PreviewModule { }
