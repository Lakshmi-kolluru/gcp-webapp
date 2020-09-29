import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import * as CryptoJS from "crypto-js";

@Component({
  selector: "app-validate",
  templateUrl: "./validate.component.html",
  styleUrls: ["./validate.component.scss"],
})
export class ValidateComponent {
  public date: string;
  emailDate: any;
  userMail: any;
  id: string;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  decrypt(value) {
    const cipher = value
      .replace(/xMl3Jk/g, "+")
      .replace(/Por21Ld/g, "/")
      .replace(/Ml32/g, "=");
    //const cipher2 = JSON.parse(cipher);

    var decrypted = CryptoJS.RC4.decrypt(cipher, "Secret Passphrase").toString(
      CryptoJS.enc.Utf8
    );

    var res = decrypted.split(")");
    this.emailDate = res[0];
    this.userMail = res[1];

    this.validateTime(this.emailDate);
  }

  validateTime(data) {
    var currentTime = new Date();
    var timeReceived = new Date(data);
    var dif = currentTime.getTime() - timeReceived.getTime();
    var seconds_from_T1_to_T2 = dif / 1000;
    var minutes_Between_Dates = Math.abs(seconds_from_T1_to_T2 / 60);

    if (minutes_Between_Dates < 20) {
      if (this.userMail.length !== 0) {
        this.router.navigate(["/resetPassword", this.id]);
      } else if (this.userMail.length == 0) {
        this.router.navigate(["/"]);
      }
    } else {
      this.router.navigate(["/errors/timeOut"]);
    }
  }
  ngOnInit() {
    this.date = this.route.snapshot.paramMap.get("date");
    this.id = this.route.snapshot.paramMap.get("id");
    this.decrypt(this.date);
  }
}
