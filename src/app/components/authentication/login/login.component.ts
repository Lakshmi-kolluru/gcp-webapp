import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import {
  NgbActiveModal,
  NgbModal,
  ModalDismissReasons,
  NgbModalConfig,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { Subscription } from "rxjs";
import { AuthenticationService } from "../../../services/auth.service";

import { Globals } from "../../../globals";
import { Router } from "@angular/router";

import { TotpComponent } from "../totp/totp.component";
import { TfaComponent } from "../tfa/tfa.component";
import {
  AuthService,
  GoogleLoginProvider,
  SocialUser,
} from "angularx-social-login";

declare var require;
const Swal = require("sweetalert2");

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  public validationForm: FormGroup;
  GC_USER_ID = this.globals.GC_USER_ID;
  GC_AUTH_TOKEN = this.globals.GC_AUTH_TOKEN;
  private user: SocialUser;
  private loggedIn: boolean;
  counter = 1;
  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private authService: AuthenticationService,
    private globals: Globals,
    private router: Router,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private ngbModal: NgbModal,
    private googleAuthService: AuthService
  ) {}

  private signInData = gql`
    mutation signin($email: String!, $pwd: String!) {
      signin(email_id: $email, password: $pwd) {
        id
        email_id
        first_name
        token
        isMFAEnabled
        isInitialLogin
        isGoogle
      }
    }
  `;

  private googleSignIn = gql`
    mutation googleSignIn($user: UserGoogleInput!) {
      googleSignIn(user: $user) {
        id
        email_id
        first_name
        token
        isMFAEnabled
        isInitialLogin
      }
    }
  `;

  signInGoogle() {
    this.googleAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
    this.googleAuthService.authState.subscribe((user) => {
      this.counter++;
      if (this.counter == 2) {
        this.user = user;
        //  this.loggedIn = (user != null);
        this.loggedIn = user != null;

        if (this.user != null) {
          this.apollo
            .mutate({
              mutation: this.googleSignIn,
              variables: {
                user: this.user,
              },
            })
            .subscribe(
              (data: any) => {
                const user = data.data.googleSignIn;
                if (user.isMFAEnabled == true) {
                  const modalReg = this.ngbModal.open(TfaComponent, {
                    size: "md",
                  });
                  modalReg.componentInstance.userProfileDetails = user;
                  modalReg.result.then((tfaValue) => {
                    if (tfaValue.success == true) {
                      this.router.navigate(["/mainPage"]);
                      this.authService.setUserId(user);
                    } else {
                      Swal.fire({
                        icon: "error",
                        title: "MFA Failed",
                        html: ` Please try again`,
                      });
                    }
                  });
                } else if (user.isMFAEnabled == false) {
                  this.router.navigate(["/mainPage"]);
                  this.authService.setUserId(user);
                }
              },
              (error) => {
                var errorString = JSON.stringify(error);
                console.log(errorString);
                Swal.fire({
                  icon: "error",
                  title: "Something went wrong.Please try again",
                });
              }
            );
        } else {
          Swal.fire({
            icon: "error",
            title: "Something went wrong.Please try again",
          });
        }
      }
    });
  }

  onSubmit() {
    if (this.validationForm.valid) {
      var email: String = this.validationForm.value["email"];
      var pwd: String = this.validationForm.value["password"];
      var isGoogle: Boolean = false;
      this.loginAPI(email, pwd, isGoogle);

      this.validationForm.reset();
    }
  }

  loginAPI(email, pwd, isGoogle) {
    this.apollo
      .mutate({
        mutation: this.signInData,
        variables: {
          email: email,
          pwd: pwd,
        },
      })
      .subscribe(
        (data: any) => {
          const user = data.data.signin;
          if (user.isGoogle == false) {
            this.authService.setUserId(user);
            if (user.isMFAEnabled == true) {
              //getbarcode Details here

              const modalReg = this.ngbModal.open(TfaComponent, {
                size: "md",
              });
              modalReg.componentInstance.userProfileDetails = user;
              modalReg.result.then((tfaValue) => {
                if (tfaValue.success == true) {
                  this.router.navigate(["/mainPage"]);
                  this.authService.setUserId(user);
                } else {
                  Swal.fire({
                    icon: "error",
                    title: "MFA Failed",
                    html: ` Please try again`,
                  });
                }
              });
            } else if (user.isMFAEnabled == false) {
              this.router.navigate(["/mainPage"]);
              this.authService.setUserId(user);
            }
          } else if (user.isGoogle == true) {
            Swal.fire({
              icon: "error",
              title: "Cannot login as you registered using google account",
              html: `Please try logging in with your google account.`,
            });
          }
        },
        (error) => {
          var errorString = JSON.stringify(error);
          if (errorString.includes(" Email was not found!")) {
            Swal.fire({
              icon: "error",
              title: "Login Failed",
              html: `Your username and/or password doesn't match our records.<br> Please try again or register with us`,
            });
          } else if (errorString.includes("Incorrect password!")) {
            Swal.fire({
              icon: "error",
              title: "Incorrect Password",
              text: " Please try again",
            });
          } else if (errorString.includes("Network error")) {
            Swal.fire({
              icon: "error",
              title: "Network Error",
              text: "Please check your connection and try again",
            });
          } else if (errorString.includes("User account is not active!")) {
            Swal.fire({
              icon: "error",
              title: "Account deactivated",
              text:
                "Your account is deactivated. Please create another account to start using again",
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
  taketoRegister() {
    this.router.navigate(["/register"]);
  }
  ngOnInit() {
    this.validationForm = this.fb.group({
      email: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"),
        ],
      ],
      password: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9~!@#$%^&*()_+ ]{8,}$"),
        ],
      ],
    });
  }
}
