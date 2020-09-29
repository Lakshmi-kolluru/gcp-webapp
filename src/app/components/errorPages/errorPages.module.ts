import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { HttpClientModule } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { ErrorTimeOutComponent } from './error-time-out/error-time-out.component';


const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "timeOut",
        component: ErrorTimeOutComponent,
      },
    
    ],
  },
];

@NgModule({
  declarations: [
   ErrorTimeOutComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    NgbModule,
    HttpClientModule
  ],
  exports: [],
  providers: [],
})
export class ErrorModules {}
