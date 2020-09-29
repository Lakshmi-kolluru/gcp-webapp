import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";

import gql from "graphql-tag";
import { Apollo } from "apollo-angular";

declare var require;
const Swal = require("sweetalert2");

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
})
export class ResetPasswordComponent implements OnInit {
  public validationForm: FormGroup;
  notMatching: boolean;
  id: any;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  passwordMatchValidator(validationForm: FormGroup): any {
    if (validationForm) {
      if (
        validationForm.get("password").value !==
        validationForm.get("password1").value
      ) {
        return { notMatching: true };
      }
    }

    return null;
  }
  private resetPasswordQuery = gql`
    mutation emailLinkResetPassword($resetPwdInfo: ResetPwdInfo!) {
      emailLinkResetPassword(resetPwdInfo: $resetPwdInfo) {
        success
      }
    }
  `;

  onSubmit() {
    if (this.validationForm.valid) {
      this.apollo
        .mutate({
          mutation: this.resetPasswordQuery,
          variables: {
            resetPwdInfo: {
              id: this.id,
              password: this.validationForm.value.password,
            },
          },
        })
        .subscribe((data) => {
          const result = data.data;
          if (result) {
            Swal.fire({
              icon: "success",
              title: "Password changed successfully",
              html: `Please login to access your account`,
              timer: 3000,
              onOpen: () => {
                Swal.showLoading();
              },
            }).then((result) => {
              if (
                // Read more about handling dismissals
                result.dismiss === Swal.DismissReason.timer
              ) {
                this.backToLogin();
              }
            });
          } else {
            Swal.fire({
              text: "Something went wrong.Please try again",
              type: "warning",
            });
          }
        });
      this.validationForm.reset();
    }
  }
  backToLogin() {
    this.router.navigate(["/"]);
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id");

    this.validationForm = this.fb.group(
      {
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
      },
      { validator: this.passwordMatchValidator }
    );
  }
}
