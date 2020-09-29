import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { AuthenticationService } from "src/app/services/auth.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-totp",
  templateUrl: "./totp.component.html",
  styleUrls: ["./totp.component.scss"],
})
export class TotpComponent implements OnInit {
  @Input() public userProfileDetails;
  public validationForm: FormGroup;

  tfa: any = {};
  authcode: string = "";
  errorMessage: string = null;
  tfaSuccess: any;

  private totpVerify = gql`
    query totpVerify($xTfa: String, $userId: ID) {
      totpVerify(xTfa: $xTfa, userId: $userId) {
        success
      }
    }
  `;

  private getBarCodeData = gql`
    mutation getBarCodeData($userId: ID) {
      getBarCodeData(userId: $userId) {
        secret
        tempSecret
        dataURL
        tfaURL
      }
    }
  `;
  private xTFAVerify = gql`
    mutation xTFAVerify($xTFA: String!) {
      xTFAVerify(xTFA: $xTFA) {
        success
      }
    }
  `;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private authService: AuthenticationService,
    public activeModal: NgbActiveModal
  ) {}

  //Verify Auth for TFA Setup
  onSubmit() {
    this.apollo
      .query({
        query: this.totpVerify,
        variables: {
          xTfa: this.validationForm.value.authcode,
          userId: this.userProfileDetails.id,
        },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        this.tfaSuccess = data.data.totpVerify;
        if (this.tfaSuccess) {
          this.activeModal.close(this.tfa.tempSecret);
        } else {
          const errorMessage = "fail";
          this.activeModal.close(errorMessage);
        }
      });
  }

  ngOnInit() {
    this.validationForm = this.fb.group({
      authcode: "",
    });
    if (this.userProfileDetails.isMFAEnabled) {
      this.tfa.secret = this.userProfileDetails.secretKey;
    } else {
      //getBarCode
      this.apollo
        .mutate({
          mutation: this.getBarCodeData,
          variables: {
            userId: this.userProfileDetails.id,
          },
        })
        .subscribe(
          (data: any) => {
            const user = data.data.getBarCodeData;
            this.tfa = user;
          },
          (error) => {
            var errorString = JSON.stringify(error);
          }
        );
    }
  }
}
