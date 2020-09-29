import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { AuthenticationService } from "src/app/services/auth.service";
import { settings } from "cluster";
import { Globals } from "src/app/globals";
import {
  StripeCheckoutLoader,
  StripeCheckoutHandler,
} from "ng-stripe-checkout";

declare var require;
const Swal = require("sweetalert2");

@Component({
  selector: "app-initial-setup",
  templateUrl: "./initial-setup.component.html",
  styleUrls: ["./initial-setup.component.scss"],
})
export class InitialSetupComponent implements OnInit {
  locations = this.globals.locations;
  plans: any;
  public validationForm: FormGroup;
  showLocation: boolean = false;
  showPlans: boolean = true;
  amount: number;
  coupons: any = [];
  couponError: any = "";

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

  private createUserSettings = gql`
    mutation createUserSettings($usersetting: UserSettingsInput!) {
      createUserSettings(usersetting: $usersetting) {
        primary_db_location
        secondary_db_location
      }
    }
  `;
  private getCoupons = gql`
    query getCoupons {
      getCoupons {
        couponList
      }
    }
  `;
  private getPlans = gql`
    query getPlans {
      getPlans {
        plans {
          id
          plan_name
          price
          benefits_list
          currency
        }
      }
    }
  `;

  private createBilling = gql`
    mutation createBillingForUser(
      $billingDetails: BillingInfoInput!
      $userId: ID!
    ) {
      createBillingForUser(billingDetails: $billingDetails, userId: $userId) {
        id
        billing_method
        billing_token
        expiray_date
        renewal_date
      }
    }
  `;
  id: any;
  username: any;
  date: Date;
  newDate: Date;
  profile: any;
  email: any;
  selectedPlan: any;

  constructor(
    private globals: Globals,
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  goToPlans() {
    this.showLocation = true;
    this.showPlans = false;
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
        (error) => {}
      );
  }
  //stripe payment
  pay(settingsData) {
    const oldPrice = parseInt(settingsData.price);
    this.apollo
      .query({
        query: this.getCoupons,
        fetchPolicy: "no-cache",
      })
      .subscribe(
        async (data: any) => {
          const couponsList = JSON.parse(data.data.getCoupons.couponList);
          this.coupons = couponsList.data;
          if (this.coupons.length) {
            Swal.fire({
              title: "Redeem Coupons",
              html: `<br><p>Would you like to redeem any coupons you have? </p>
             `,
              input: "text",
              showCancelButton: true,
              confirmButtonText: "Yes, Redeem Coupons",
              confirmButtonClass: "btn btn-primary",
              cancelButtonText: "No, make the Payment",
              cancelButtonClass: "btn btn-outline-primary",
              preConfirm: (couponCode) => {},
              allowOutsideClick: () => !Swal.isLoading(),
            }).then((result) => {
              if (result.value) {
                var appliedCoupon = this.coupons.filter((obj) => {
                  return obj.name === result.value;
                });
                if (appliedCoupon.length) {
                  if (appliedCoupon[0].amount_off !== null) {
                    const newAmount = oldPrice - appliedCoupon[0].amount_off;
                    settingsData.price = newAmount;
                  } else if (appliedCoupon[0].percent_off !== null) {
                    const newAmount =
                      oldPrice -
                      oldPrice * (appliedCoupon[0].percent_off / 100);
                    settingsData.price = newAmount;
                  }
                  Swal.fire({
                    text:
                      "Coupon Applied. Final price is " + settingsData.price,
                    icon: "success",
                  }).then(this.redeemCoupon(settingsData));
                } else {
                  Swal.fire({
                    text: "Invalid Coupon. Please try again ",
                    icon: "warning",
                  });
                }
                //calculate discounted amounts here from coupons data
              } else {
                this.redeemCoupon(settingsData);
              }
            });
          } else {
            this.redeemCoupon(settingsData);
          }
        },
        (error) => {
          this.redeemCoupon(settingsData);
        }
      );
  }
  redeemCoupon(settingsData) {
    this.amount = settingsData.price;
    var stripePKey = environment.stripe.publishable_Key;

    var stripeHandler = StripeCheckout.configure({
      key: stripePKey,
      locale: "en",
      token: async (token) => {
        settingsData.token = token.id;
        this.payment(settingsData);
      },
    });
    stripeHandler.open({
      name: "Vesta One",
      description: "",
      amount: this.amount * 100,
      email: this.profile.email_id,
    });
  }
  //sending data to API
  payment(planData) {
    this.apollo
      .mutate({
        mutation: this.createUserSettings,
        variables: {
          usersetting: {
            user: this.id,
            auto_renewal: false,
            last_payment_date: new Date(),
            next_renewal_date: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
            primary_db_location: planData.pri_location,
            secondary_db_location: planData.sec_location,
            current_plan: planData.id,
          },
        },
      })
      .subscribe(
        (data) => {
          this.apollo
            .mutate({
              mutation: this.createBilling,
              variables: {
                billingDetails: {
                  billing_method: "Test-Stripe",
                  billing_token: "testtoken",
                  expiray_date: new Date(
                    new Date().setFullYear(new Date().getFullYear() + 1)
                  ),
                  renewal_date: new Date(),
                  applied_plan: planData.id,
                  price_paid: planData.price.toString(),
                },
                userId: this.id,
              },
            })
            .subscribe(
              (data) => {
                Swal.close();
                this.authService.setLoginNumber(false);
                Swal.fire({
                  icon: "success",
                  html:
                    '<h4 class="txt-success">Account Setup Successfull</h4> ' +
                    "<p>You can now start using the application</p> ",
                  timer: 2000,
                  onOpen: () => {
                    Swal.showLoading();
                  },
                }).then((result) => {
                  if (
                    // Read more about handling dismissals
                    result.dismiss === Swal.DismissReason.timer
                  ) {
                    this.backToDashboard();
                  }
                });

                this.validationForm.reset();
              },
              (error) => {
                Swal.close();
                this.errorDialog(
                  "error",
                  "Something went wrong",
                  "Please try again"
                );
              }
            );
        },
        (error) => {
          Swal.close();

          this.errorDialog("error", "Something went wrong", "Please try again");
        }
      );
  }

  onSubmit(planName) {
    //Plans
    this.apollo
      .query({
        query: this.getPlans,
        fetchPolicy: "no-cache",
      })
      .subscribe(
        async (data: any) => {
          this.plans = data.data.getPlans.plans;
          this.selectedPlan = this.plans.find(
            (x) =>
              x.plan_name.toLocaleLowerCase() == planName.toLocaleLowerCase()
          );
          const settingsData = Object.assign(
            this.selectedPlan,
            this.validationForm.value
          );
          Swal.fire({
            title: "Setup is in progress.",
            allowOutsideClick: false,
            onBeforeOpen: () => {
              Swal.showLoading();
              //For stripe payment
              // this.pay(settingsData);
              this.payment(settingsData);
            },
          });
        },
        (error) => {}
      );
  }
  backToDashboard() {
    this.router.navigate(["/mainPage/dashboard"]);
  }

  errorDialog(icon, title, textMsg) {
    Swal.fire({
      icon,
      title,
      text: textMsg,
    });
  }

  ngOnInit() {
    this.date = new Date();
    this.id = localStorage["graphcool-user-id"];
    this.showProfile();
    this.validationForm = this.fb.group({
      planName: [""],
      pri_location: ["", [Validators.required]],
      sec_location: ["", [Validators.required]],
    });
  }
}
