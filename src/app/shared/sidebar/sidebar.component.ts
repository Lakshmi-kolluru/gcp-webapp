import { Component, OnInit } from "@angular/core";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  id: any;
  expandNew: boolean = false;
  expandDocDropDown: boolean = false;
  expandTempDropDown: boolean = false;
  expandActiveDropDown: boolean = false;
  profile: any;
  error: boolean;
  constructor(private apollo: Apollo) {}
  click: any;
  sign = "right";
  clicked(n) {
    this.click = n;
  }

  private getProfileByID = gql`
    query getUserDetailsById($userId: ID!) {
      getUserDetailsById(userId: $userId) {
        first_name
        last_name
        email_id
        phone_number
        security_quest1
        quest1_ans
        security_quest2
        quest2_ans
        organization_name
      }
    }
  `;

  ngOnInit() {
    this.id = localStorage["graphcool-user-id"];

    this.apollo
      .query({
        query: this.getProfileByID,
        variables: {
          userId: this.id,
        },
      })
      .subscribe(
        (data: any) => {
          this.profile = data.data.getUserDetailsById;
        },
        (error) => {
          this.error = true;
        }
      );
  }

  expand() {
    this.expandNew = !this.expandNew;
    this.expandDocDropDown = false;
    this.expandTempDropDown = false;
    this.expandActiveDropDown = false;
  }
  expandDoc() {
    this.expandDocDropDown = !this.expandDocDropDown;
    this.expandTempDropDown = false;
    this.expandNew = false;
    this.expandActiveDropDown = false;
  }
  expandTemp() {
    this.expandTempDropDown = !this.expandTempDropDown;
    this.expandDocDropDown = false;
    this.expandNew = false;
    this.expandActiveDropDown = false;
  }
  expandActive() {
    this.expandActiveDropDown = !this.expandActiveDropDown;
    this.expandDocDropDown = false;
    this.expandTempDropDown = false;
    this.expandNew = false;
  }
}
