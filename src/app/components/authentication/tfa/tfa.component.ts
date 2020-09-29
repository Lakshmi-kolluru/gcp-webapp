import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { AuthenticationService } from "src/app/services/auth.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-tfa",
  templateUrl: "./tfa.component.html",
  styleUrls: ["./tfa.component.scss"],
})
export class TfaComponent implements OnInit {
  @Input() public userProfileDetails;
  public validationForm: FormGroup;
  tfa: any = {};
  authcode: string = "";
  errorMessage: boolean;
  tfaSuccess: any;

  
  private totpVerify = gql`
    query totpVerify($xTfa: String, $userId: ID) {
      totpVerify(xTfa: $xTfa, userId: $userId) {
        success
      }
    }
  `;

  constructor(
    private authService: AuthenticationService,
    private apollo: Apollo,
    public fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {}

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
          this.activeModal.close(this.tfaSuccess);
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
    
  }
}
