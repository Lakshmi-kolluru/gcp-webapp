import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LoaderComponent } from './loader/loader.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ComponentLoaderComponent } from './component-loader/component-loader.component';
import { SafeHtmlPipe } from './pipes/safehtml';



@NgModule({
  declarations: [
    LoaderComponent,
    HeaderComponent,
    SidebarComponent,
    ComponentLoaderComponent,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ],
  exports: [
    LoaderComponent,
    HeaderComponent,
    SidebarComponent,
    ComponentLoaderComponent,
    SafeHtmlPipe
  ],
  providers: [],
})
export class SharedModule { }
