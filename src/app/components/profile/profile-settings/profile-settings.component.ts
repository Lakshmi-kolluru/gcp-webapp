import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import {
  StripeCheckoutLoader,
  StripeCheckoutHandler,
} from "ng-stripe-checkout";
import { environment } from "../../../../environments/environment";
import { Globals } from "src/app/globals";
import { Router } from "@angular/router";

declare var require;
const Swal = require("sweetalert2");

interface Profile {
  first_name: String;
  last_name: String;
  email_id: String;
  password: String;
  phone_number: String;
  country_code: String;
  dial_code: String;
  security_quest1: String;
  quest1_ans: String;
  security_quest2: String;
  quest2_ans: String;
  digital_signature: String;
  organization_name: String;
  createdAt: Date;
  isActive: Boolean;
  isGoogle: Boolean;
  isMFAEnabled: Boolean;
  secretKey: String;
}

@Component({
  selector: "app-profile-settings",
  templateUrl: "./profile-settings.component.html",
  styleUrls: ["./profile-settings.component.scss"],
})
export class ProfileSettingsComponent implements OnInit {
  public openToggle: boolean = false;
  @Output() toggleEvent = new EventEmitter<boolean>();
  private stripeCheckoutHandler: StripeCheckoutHandler;
  public accountsettingsdiv = false;
  public plandetailsdiv = true;
  public changedbdiv = true;
  public showbillingH = true;
  public data: any;
  id: any;
  profile: Profile;
  plans: any;
  amount: number;
  coupons: any = [];
  latestPay: any;
  locations = this.globals.locations;

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
  private getCoupons = gql`
    query getCoupons {
      getCoupons {
        couponList
      }
    }
  `;
  private getUserSettings = gql`
    query getUserSettingsByUser($userId: ID!) {
      getUserSettingsByUser(userId: $userId) {
        id
        user {
          id
          email_id
        }
        last_payment_date
        next_renewal_date
        auto_renewal
        primary_db_location
        secondary_db_location
        current_plan {
          id
          plan_name
          price
        }
        billing_info {
          id
          billing_method
          billing_token
          expiray_date
          renewal_date
          price_paid
          applied_plan {
            id
            plan_name
            price
          }
        }
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

  userProfile = {
    email: "alex@gmail.com",
    plan: "Standard",
    memory: "10GB/50GB used",
    billing: "**** **** **** 1234",
    lastPayment: "22 Apr 2020",
    nextPayment: "21 May 2020",
  };

  userSettings: any;

  constructor(
    private globals: Globals,
    private ngbModal: NgbModal,
    private apollo: Apollo,
    public router: Router,
    private stripeCheckoutLoader: StripeCheckoutLoader
  ) {}

  ngOnInit(): void {
    this.id = localStorage["graphcool-user-id"];
    this.showProfile();
  }

  switchToggle() {
    this.openToggle = !this.openToggle;
    this.toggleEvent.emit(this.openToggle);
  }

  showProfile() {
    //User settings
    this.apollo
      .query({
        query: this.getUserSettings,
        variables: {
          userId: this.id,
        },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        async (data: any) => {
          this.userSettings = data.data.getUserSettingsByUser;
          if (this.userSettings !== null) {
            this.latestPay = this.userSettings.billing_info.reduce((a, b) => {
              return new Date(a.renewal_date) > new Date(b.renewal_date)
                ? a
                : b;
            });
          } else if (this.userSettings == null) {
            this.customHTML();
          }
        },
        (error) => {}
      );
    //User Profile
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
    //Plans
    this.apollo
      .query({
        query: this.getPlans,
        fetchPolicy: "no-cache",
      })
      .subscribe(
        async (data: any) => {
          this.plans = data.data.getPlans.plans;
        },
        (error) => {}
      );
  }

  //stripe payment
  pay(planName) {
    const selectedPlan = this.plans.find(
      (x) => x.plan_name.toLocaleLowerCase() == planName.toLocaleLowerCase()
    );
    var oldPrice = parseInt(selectedPlan.price);
    var newAmount;
    this.apollo
      .query({
        query: this.getCoupons,
        fetchPolicy: "no-cache",
      })
      .subscribe(
        async (data: any) => {
          const couponsList = JSON.parse(data.data.getCoupons.couponList);
          this.coupons = couponsList.data;
          //Stripe Coupons
          /* if (this.coupons.length) {
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
                    newAmount = oldPrice - appliedCoupon[0].amount_off;
                    oldPrice = newAmount;
                  } else if (appliedCoupon[0].percent_off !== null) {
                    newAmount =
                      oldPrice -
                      oldPrice * (appliedCoupon[0].percent_off / 100);
                    selectedPlan.price = newAmount;
                  }
                  Swal.fire({
                    text: "Coupon Applied. Final price is " + newAmount,
                    icon: "success",
                  }).then(this.redeemCoupon(selectedPlan));
                } else {
                  Swal.fire({
                    text: "Invalid Coupon. Please try again ",
                    icon: "warning",
                  });
                }
                //calculate discounted amounts here from coupons data
              } else {
                this.redeemCoupon(selectedPlan);
              }
            });
          } */
          this.payment(selectedPlan);
        },
        (error) => {
          Swal.fire({
            text: "Something went wrong. Please try again",
            icon: "warning",
          });
        }
      );
  }
  redeemCoupon(planData) {
    this.amount = planData.price;
    var stripePKey = environment.stripe.publishable_Key;
    var stripeHandler = StripeCheckout.configure({
      key: stripePKey,
      locale: "en",
      token: async (token) => {
        planData.token = token.id;
        this.payment(planData);
      },
    });
    stripeHandler.open({
      name: "Vesta One",
      description: "",
      amount: this.amount * 100,
      email: " " + this.profile.email_id,
    });
  }

  payment(data) {
    //update userSettings api
    this.apollo
      .mutate({
        mutation: this.createBilling,
        variables: {
          billingDetails: {
            billing_method: "Test-Stripe",
            billing_token: "testStripe",
            expiray_date: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
            renewal_date: new Date(),
            applied_plan: data.id,
            price_paid: data.price.toString(),
          },
          userId: this.id,
        },
      })
      .subscribe(
        (data) => {
          Swal.close();
          Swal.fire({
            icon: "success",
            html:
              '<h4 class="txt-success">Payment Successfull</h4> ' +
              "<p>You Plan is renewed</p> ",
            timer: 2000,
            onOpen: () => {
              Swal.showLoading();
            },
          }).then((result) => {
            if (
              // Read more about handling dismissals
              result.dismiss === Swal.DismissReason.timer
            ) {
              this.showProfile();
            }
          });
        },
        (error) => {
          Swal.close();
        }
      );
  }
  cancelMembership() {}
  changePlan() {
    this.accountsettingsdiv = true;
    this.plandetailsdiv = false;
    //changeplandiv
  }
  changeLocation() {
    Swal.fire({
      title: "Alert",
      text: "Do you want to change DB location?",
      type: "info",
      showCancelButton: true,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.value) {
        Swal.fire("Updated", "DB location has been updated", "success");
      }
    });
  }
  goback() {
    this.accountsettingsdiv = false;
    this.plandetailsdiv = true;
    this.changedbdiv = true;
    this.showbillingH = true;
  }
  updateLocation() {}
  showBillingHistory() {
    this.showbillingH = false;
    this.accountsettingsdiv = true;
  }
  defaultPlan() {
    Swal.fire({
      type: "info",
      title: "Alert",
      text: "This Plan is already your default Plan",
      showConfirmButton: true,
    });
  }

  onSubmit(planName) {}

  customHTML() {
    Swal.fire({
      title: "Account is not setup yet",
      text: "Please setup your account to view the page",
      icon: "success",
      showCancelButton: false,
      allowOutsideClick: false,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      confirmButtonText: "Setup Account",
    }).then((result) => {
      if (result.value) {
        this.router.navigate(["/mainPage/profile/setup"]);
      }
    });
  }
}
