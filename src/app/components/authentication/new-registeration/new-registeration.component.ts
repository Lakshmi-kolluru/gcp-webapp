import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  SearchCountryField,
  TooltipLabel,
  CountryISO,
} from "ngx-intl-tel-input";
import {
  NgbDropdownConfig,
  NgbModalConfig,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Router } from "@angular/router";
import { ConditionsComponent } from "../conditions/conditions.component";

declare var require;
const Swal = require("sweetalert2");

@Component({
  selector: "app-new-registeration",
  templateUrl: "./new-registeration.component.html",
  styleUrls: ["./new-registeration.component.scss"],
  providers: [NgbDropdownConfig],
})
export class NewRegisterationComponent implements OnInit {
  public validationForm: FormGroup;
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
  newQuestions1 = [
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
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.Canada,
  ];

  private newRegistrationMutation = gql`
    mutation signup($newuser: UserInput!) {
      signup(user: $newuser) {
        id
        email_id
        first_name
        last_name
      }
    }
  `;

  constructor(
    private fb: FormBuilder,
    config: NgbDropdownConfig,
    config1: NgbModalConfig,
    private modalService: NgbModal,
    private ngbModal: NgbModal,
    private apollo: Apollo,
    private router: Router
  ) {
    // customize default values of dropdowns used by this component tree
    config.placement = "bottom";
    config.autoClose = false;
  }
  backToLogin() {
    this.router.navigate(["/"]);
  }
  openConditions() {
    const modalReg = this.ngbModal.open(ConditionsComponent, {
      size: "lg",
    });
    modalReg.result.then((value) => {
      this.validationForm.value.checkRules = value;
    });
  }
  removeQue(que) {
    this.newQuestions1 = this.questions.filter(({ name }) => name !== que);
  }
  onSubmit() {
    if (this.validationForm.valid) {
      const userData = this.validationForm.value;
      const phoneNumber = userData.phone_number.internationalNumber;
      Swal.fire({
        title: "Registration is in progress.",
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
          this.apollo
            .mutate({
              mutation: this.newRegistrationMutation,
              variables: {
                newuser: {
                  first_name: userData["first_name"],
                  last_name: userData["last_name"],
                  organization_name: userData["organization_name"],
                  email_id: userData["email_id"],
                  password: userData["password"],
                  phone_number: phoneNumber,
                  security_quest1: userData["security_quest1"],
                  security_quest2: userData["security_quest2"],
                  quest1_ans: userData["quest1_ans"],
                  quest2_ans: userData["quest2_ans"],
                  digital_signature: "digital",
                },
              },
            })
            .subscribe(
              (data) => {
                // successfully created vehicle entity.
                Swal.close();
                this.successDialog();
                this.validationForm.reset();
              },
              (error) => {
                Swal.close();
                const errorString = JSON.stringify(error);
                console.log(errorString);
                if (errorString.includes("Email already exist!")) {
                  this.errorDialog(
                    "warning",
                    "A user with that email already exists",
                    "Please try with another email"
                  );
                } else {
                  this.errorDialog(
                    "error",
                    "Something went wrong",
                    "Please try again"
                  );
                }
              }
            );
        },
      });
    }
  }

  successDialog() {
    Swal.fire({
      icon: "success",
      title: "Registration Successfull",
      html: `Please check your mail for further steps`,
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
  }

  errorDialog(icon, title, textMsg) {
    Swal.fire({
      icon,
      title,
      text: textMsg,
    });
  }

  ngOnInit(): void {
    this.validationForm = this.fb.group({
      first_name: [
        "",
        [
          Validators.required,
          //  Validators.pattern("[a-zA-Z][a-zA-Z ]+[a-zA-Z]$"),
        ],
      ],
      last_name: [
        "",
        [
          Validators.required,
          //  Validators.pattern("[a-zA-Z][a-zA-Z ]+[a-zA-Z]$"),
        ],
      ],
      organization_name: ["", [Validators.required]],
      email_id: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"),
        ],
      ],
      phone_number: [undefined, Validators.required],
      password: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9~!@#$%^&*()_+ ]{8,}$"),
        ],
      ],
      security_quest1: [null, Validators.required],
      quest1_ans: ["", Validators.required],
      security_quest2: [null, Validators.required],
      quest2_ans: ["", Validators.required],
      checkRules: ["", Validators.required],
    });
  }
}
