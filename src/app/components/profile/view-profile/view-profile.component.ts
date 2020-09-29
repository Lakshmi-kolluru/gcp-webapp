import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";

import {
  NgbActiveModal,
  NgbModal,
  ModalDismissReasons,
  NgbModalConfig,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { AuthenticationService } from "src/app/services/auth.service";
import { TfaComponent } from "../../authentication/tfa/tfa.component";
import { TotpComponent } from "../../authentication/totp/totp.component";

declare var require;
const Swal = require("sweetalert2");

@Component({
  selector: "app-view-profile",
  templateUrl: "./view-profile.component.html",

  styleUrls: ["./view-profile.component.scss"],
})
export class ViewProfileComponent implements OnInit {
  profile: any;
  interval: any;
  public resetProfileForm: FormGroup;
  public resetPasswordForm: FormGroup;
  public resetSecurityForm: FormGroup;

  enableEditForm: boolean = true;
  diabledEdit: boolean = false;
  editForm: boolean = true;
  show: boolean = false;
  enablePasswordForm: boolean = true;
  hideResetForm: boolean = true;
  hideResetSecForm: boolean = true;
  hideResetButton: boolean = false;
  hideResetButton2: boolean = false;
  hideResetSecButton: boolean = false;
  toggleButtonText = "Edit";
  successText = "";
  questions = [
    { name: "What primary school did you attend?" },
    { name: "In what town or city was your first full time job?" },
    {
      name:
        "What was the house number and street name you lived in as a child?",
    },
    {
      name:
        "What were the last four digits of your childhood telephone number?",
    },
    { name: "In what town or city did you meet your spouse/partner?" },
    { name: "What is the middle name of your oldest child?" },
    { name: "What are the last five digits of your driver`s licence number?" },
    { name: "What is your grandmother`s (on your mother`s side) maiden name?" },
    { name: "What is your spouse or partner`s mother`s maiden name?" },
    { name: "In what town or city did your mother and father meet?" },
    { name: "What time of the day were you born? (hh:mm)" },
    { name: "What time of the day was your first child born? (hh:mm)" },
  ];
  id: any;

  toggle() {
    this.show = true;
  }

  passwordMatchValidator(resetPasswordForm: FormGroup): any {
    if (resetPasswordForm) {
      if (
        resetPasswordForm.get("password").value !==
        resetPasswordForm.get("password1").value
      ) {
        return { notMatching: true };
      }
    }

    return null;
  }
  private getProfileByID = gql`
    query getUserDetailsById($userId: ID!) {
      getUserDetailsById(userId: $userId) {
        id
        first_name
        last_name
        email_id
        phone_number
        security_quest1
        quest1_ans
        security_quest2
        quest2_ans
        organization_name
        isMFAEnabled
      }
    }
  `;

  private updateProfileQuery = gql`
    mutation updateProfile($settings: UserDetails!) {
      updateProfile(settings: $settings) {
        success
      }
    }
  `;
  private resetSecurityQueQuery = gql`
    mutation resetQuestions($newQue: QuestionsDetails!) {
      resetQuestions(settings: $newQue) {
        success
      }
    }
  `;

  private resetPasswordQuery = gql`
    mutation resetPassword($newPass: PasswordDetails!) {
      resetPassword(settings: $newPass) {
        success
      }
    }
  `;

  private closeAccountQuery = gql`
    mutation closeAccount($userId: ID!) {
      closeAccount(userId: $userId) {
        success
      }
    }
  `;
  error: boolean;

  enable() {
    this.diabledEdit = true;
    this.editForm = false;
  }
  enableReset() {
    this.hideResetForm = !this.hideResetForm;
    this.hideResetButton = !this.hideResetButton;
  }
  enableResetSecurityQue() {
    this.hideResetForm = !this.hideResetForm;
    this.hideResetButton = !this.hideResetButton;
  }
  showProfile() {
    this.apollo
      .query({
        query: this.getProfileByID,
        variables: {
          userId: this.id,
        },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        async (data: any) => {
          this.profile = data.data.getUserDetailsById;
        },
        (error) => {
          this.error = true;
        }
      );
  }
  async resetProfile() {
    if (this.resetProfileForm) {
      const newProfileDetails = this.resetProfileForm.value;
      Object.keys(newProfileDetails).forEach((key) =>
        newProfileDetails[key] === "" || newProfileDetails[key] === null
          ? delete newProfileDetails[key]
          : {}
      );
      newProfileDetails.id = this.id;

      await this.apollo
        .mutate({
          mutation: this.updateProfileQuery,
          variables: {
            settings: newProfileDetails,
          },
          fetchPolicy: "no-cache",
        })
        .subscribe((data) => {
          const result = data.data;
          if (result) {
            this.successText = "Profile Updated";
            this.showSuccessAlert();
            this.showProfile();
          } else {
            Swal.fire({
              text: "Something went wrong.Please try again",
              type: "warning",
            });
          }

          this.resetSecurityForm.reset();
          this.diabledEdit = false;
          this.editForm = true;
        });
    }
  }
  newPasswordReq() {}
  resetPassword() {
    if (this.resetPasswordForm) {
      this.apollo
        .mutate({
          mutation: this.resetPasswordQuery,
          variables: {
            newPass: {
              id: this.id,
              password: this.resetPasswordForm.value.password,
              security_quest: this.profile.security_quest1,
              quest_ans: this.resetPasswordForm.value.securityAns,
            },
          },
          fetchPolicy: "no-cache",
        })
        .subscribe((data) => {
          const result = data.data;
          if (result) {
            this.successText = "Password Changed";
            this.showSuccessAlert();
          } else {
            Swal.fire({
              text: "Something went wrong.Please try again",
              type: "warning",
            });
          }

          this.resetSecurityForm.reset();
        });
      this.resetPasswordForm.reset();
    } else {
    }
  }
  async resetSecurityQues() {
    if (this.resetSecurityForm) {
      const security_quest1 = this.resetSecurityForm.value.security_quest1
        ? this.resetSecurityForm.value.security_quest1
        : this.profile.security_quest1;
      const quest1_ans = this.resetSecurityForm.value.quest1_ans
        ? this.resetSecurityForm.value.quest1_ans
        : this.profile.quest1_ans;
      const security_quest2 = this.resetSecurityForm.value.security_quest2
        ? this.resetSecurityForm.value.security_quest2
        : this.profile.security_quest2;
      const quest2_ans = this.resetSecurityForm.value.quest2_ans
        ? this.resetSecurityForm.value.quest2_ans
        : this.profile.quest2_ans;
      await this.apollo
        .mutate({
          mutation: this.resetSecurityQueQuery,
          variables: {
            newQue: {
              id: this.id,
              security_quest1: security_quest1,
              quest1_ans: quest1_ans,
              security_quest2: security_quest2,
              quest2_ans: quest2_ans,
            },
          },
          fetchPolicy: "no-cache",
        })
        .subscribe((data) => {
          const result = data.data;
          if (result["resetQuestions"].success == true) {
            this.successText = "Security Questions Changed";
            this.showProfile();
            this.showSuccessAlert();
          } else {
            Swal.fire({
              text: "Something went wrong.Please try again",
              type: "warning",
            });
          }

          this.resetSecurityForm.reset();
        });
    }
  }
  // A warning message, with a function attached to the "Confirm"-button...
  closeAccount() {
    Swal.fire({
      title: "Are you sure?",
      text: "You will no longer be able to access your files",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, close account",
      confirmButtonClass: "btn btn-primary",

      cancelButtonText: "No, keep the account",
      cancelButtonClass: "btn btn-outline-primary",
      buttonsStyling: false,
      reverseButtons: true,
    }).then((result) => {
      if (result.value) {
        this.apollo
          .mutate({
            mutation: this.closeAccountQuery,
            variables: {
              userId: this.id,
            },
            fetchPolicy: "no-cache",
          })
          .subscribe((data: any) => {
            const user = data.data.closeAccount.success;
            if (user == true) {
              Swal.fire({
                title: "Account Closed!",
                text: "Your will no longer be able to access your account.",
                timer: 1000,
                onOpen: () => {
                  Swal.showLoading();
                },
              }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                  this.router.navigate(["/"]);
                }
              });
            }
          });
      }
    });
  }
  showSuccessAlert() {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: this.successText,
      timer: 2000,
      onOpen: () => {
        Swal.showLoading();
      },
    }).then((result) => {
      if (
        // Read more about handling dismissals
        result.dismiss === Swal.DismissReason.timer
      ) {
      }
    });
  }
  enableMFA() {
    const modalReg = this.ngbModal.open(TotpComponent, {
      size: "sm",
    });
    modalReg.componentInstance.userProfileDetails = this.profile;
    modalReg.result.then((result) => {
      if (result) {
        if (result == "fail") {
        } else {
          const newProfileDetails = {
            id: this.id,
            isMFAEnabled: true,
            secretKey: result,
          };
          this.apollo
            .mutate({
              mutation: this.updateProfileQuery,
              variables: {
                settings: newProfileDetails,
              },
              fetchPolicy: "no-cache",
            })
            .subscribe((data) => {
              const result = data.data;
              if (result) {
                this.successText = "MultiFactor Authenticator Enabled";
                this.showSuccessAlert();
                this.showProfile();
              } else {
                Swal.fire({
                  text: "Something went wrong.Please try again",
                  type: "warning",
                });
              }

              this.resetSecurityForm.reset();
              this.diabledEdit = false;
              this.editForm = true;
            });
        }
      }
      //  this.newSection = false;
    });
  }
  disableMFA() {
    Swal.fire({
      title: "Are you sure?",
      text: "You will no longer have Google Authenticator enabled ",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Disable it",
      confirmButtonClass: "btn btn-primary",

      cancelButtonText: "No, I will use MFA",
      cancelButtonClass: "btn btn-outline-primary",
      buttonsStyling: false,
      reverseButtons: true,
    }).then((result) => {
      if (result.value) {
        const newProfileDetails = {
          id: this.id,
          isMFAEnabled: false,
          secretKey: "",
        };
        this.apollo
          .mutate({
            mutation: this.updateProfileQuery,
            variables: {
              settings: newProfileDetails,
            },
            fetchPolicy: "no-cache",
          })
          .subscribe((data) => {
            const result = data.data;
            if (result) {
              this.successText = "MultiFactor Authenticator Disabled";
              this.showSuccessAlert();
              this.showProfile();
            } else {
              Swal.fire({
                text: "Something went wrong.Please try again",
                type: "warning",
              });
            }

            this.resetSecurityForm.reset();
            this.diabledEdit = false;
            this.editForm = true;
          });
      }
    });
  }
  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private ngbModal: NgbModal,
    private el: ElementRef,
    private authService: AuthenticationService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.id = localStorage["graphcool-user-id"];
    this.showProfile();

    this.resetProfileForm = this.fb.group({
      first_name: ["", [Validators.minLength(1)]],
      last_name: ["", [Validators.minLength(1)]],
      email_id: [
        "",
        [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$")],
      ],
      phone_number: [undefined, Validators.required],
    });

    this.resetPasswordForm = this.fb.group({
      password: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}"
          ),
        ],
      ],
      password1: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}"
          ),
        ],
      ],
      securityAns: ["", Validators.required],
    });

    this.resetSecurityForm = this.fb.group({
      security_quest1: [""],
      quest1_ans: [""],
      security_quest2: [""],
      quest2_ans: [""],
    });
  }
}
