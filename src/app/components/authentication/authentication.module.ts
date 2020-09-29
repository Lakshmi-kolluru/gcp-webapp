import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
} from "angularx-social-login";
import { HttpClientModule } from "@angular/common/http";

import { environment } from "../../../environments/environment";
import { LoginComponent } from "./login/login.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { NewRegisterationComponent } from "./new-registeration/new-registeration.component";
import { ValidateComponent } from "./validate/validate.component";
import { TfaComponent } from "./tfa/tfa.component";
import { TotpComponent } from "./totp/totp.component";
import { ConditionsComponent } from "./conditions/conditions.component";
import { MatMenuModule } from "@angular/material/menu";
import { TermsComponent } from "./terms/terms.component";

const googleID = environment.google.id;
const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(googleID),
  },
]);
export function provideConfig() {
  return config;
}

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: LoginComponent,
      },
      {
        path: "resetPassword/:id",
        component: ResetPasswordComponent,
      },
      {
        path: "forgotPassword",
        component: ForgotPasswordComponent,
      },
      {
        path: "register",
        component: NewRegisterationComponent,
      },
      {
        path: "tfa",
        component: TfaComponent,
      },
      {
        path: "validate/:id/:date",
        component: ValidateComponent,
      },
      {
        path: "terms",
        component: TermsComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    NewRegisterationComponent,
    ValidateComponent,
    TfaComponent,
    TotpComponent,
    ConditionsComponent,
    TermsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    MatMenuModule,
    NgbModule,
    SocialLoginModule,
    HttpClientModule,
  ],
  exports: [],
  providers: [
    TfaComponent,
    TotpComponent,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig,
    },
  ],
  entryComponents: [TfaComponent, TotpComponent, ConditionsComponent],
})
export class AuthenticationModule {}
