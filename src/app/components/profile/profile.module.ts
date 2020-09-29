import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CountToModule } from "angular-count-to";
import { StripeCheckoutModule } from "ng-stripe-checkout";

import { ProfileHistoryComponent } from "./profile-history/profile-history.component";
import { ViewProfileComponent } from "./view-profile/view-profile.component";
import { ProfileSettingsComponent } from "./profile-settings/profile-settings.component";
import { NotificationsComponent } from "./notifications/notifications.component";
import { SharedModule } from "src/app/shared/shared.module";
import { InitialSetupComponent } from "./initial-setup/initial-setup.component";

const routes: Routes = [
  {
    path: "history",
    component: ProfileHistoryComponent,
  },
  {
    path: "view",
    component: ViewProfileComponent,
  },
  {
    path: "settings",
    component: ProfileSettingsComponent,
  },
  {
    path: "notifications",
    component: NotificationsComponent,
  },
  {
    path: "setup",
    component: InitialSetupComponent,
  },
];

@NgModule({
  declarations: [
    ProfileHistoryComponent,
    ViewProfileComponent,
    ViewProfileComponent,
    ProfileSettingsComponent,
    NotificationsComponent,
    InitialSetupComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    CountToModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    StripeCheckoutModule,
  ],
  exports: [ProfileHistoryComponent, InitialSetupComponent],
  providers: [InitialSetupComponent],
  entryComponents: [InitialSetupComponent],
})
export class ProfileModule {}
