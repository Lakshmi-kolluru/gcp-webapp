import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { userInfo } from "os";

declare var require;
const Swal = require("sweetalert2");

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit {
  securityQue: boolean = true;
  hideButton: boolean = false;
  que1 = "";
  user: any;
  public validationForm: FormGroup;
  public emailForm: FormGroup;

  private getSecQue = gql`
    query getSecurityQ($emailId: String!) {
      getSecurityQ(emailId: $emailId) {
        userFound
        sec_quest
      }
    }
  `;

  private sendforgotPwdMail = gql`
    query forgotPwd($emailId: String!, $secquest: String!, $secanswr: String!) {
      forgotPwd(emailId: $emailId, secquest: $secquest, secanswr: $secanswr) {
        success
      }
    }
  `;
  constructor(private fb: FormBuilder, private apollo: Apollo) {}

  showQue() {
    if (this.emailForm) {
      this.apollo
        .mutate({
          mutation: this.getSecQue,
          variables: {
            emailId: this.emailForm.value.email,
          },
        })
        .subscribe(
          (data: any) => {
            this.user = data.data.getSecurityQ;
            if (this.user.userFound == true) {
              this.que1 = this.user.sec_quest;
              this.securityQue = false;
              this.hideButton = true;
            } else {
              Swal.fire({
                icon: "error",
                title: "Incorrect Email ID",
                html: `Your email ID doesn't match our records.<br> Please try again or register with us`,
              });
            }
          },
          (error) => {
            var errorString = JSON.stringify(error);
            if (errorString.includes("Network error")) {
              Swal.fire({
                icon: "error",
                title: "Network Error",
                text: "Please check your connection and try again",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Something went wrong",
              });
            }
          }
        );
    }
  }
  onSubmit() {
    if (this.validationForm.valid) {
      Swal.fire({
        title: "Sending Mail to your EmailID .",
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();

          this.apollo
            .mutate({
              mutation: this.sendforgotPwdMail,
              variables: {
                emailId: this.emailForm.value.email,
                secquest: this.user.sec_quest,
                secanswr: this.validationForm.value.securityAns,
              },
            })
            .subscribe(
              (data: any) => {
                const result = data.data.forgotPwd.success;
                if (result == true) {
                  Swal.fire({
                    icon: "success",
                    title: "Mail Sent",
                    html: `We have sent a mail to your email with futher steps to change password. Please check`,
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
                  this.emailForm.reset();
                  this.validationForm.reset();
                  this.securityQue = true;
                  this.hideButton = false;
                } else {
                  Swal.fire({
                    icon: "error",
                    title: "Incorrect Details",
                    html: `Your answer doesn't match our records.<br> Please try again or register with us`,
                  });
                }
              },
              (error) => {
                var errorString = JSON.stringify(error);
                console.log(errorString);
                if (errorString.includes("Network error")) {
                  Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: "Please check your connection and try again",
                  });
                } else {
                  Swal.fire({
                    icon: "error",
                    title: "Something went wrong",
                  });
                }
              }
            );
        },
      });
    }
  }
  ngOnInit(): void {
    this.validationForm = this.fb.group({
      securityAns: ["", Validators.required],
    });

    this.emailForm = this.fb.group({
      email: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"),
        ],
      ],
    });
  }
}
