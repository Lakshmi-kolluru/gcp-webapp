import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { AuthenticationService } from "../../services/auth.service";
import { GlobalSearchService } from "src/app/services/global-search.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import {
  AuthService,
  GoogleLoginProvider,
  SocialUser,
} from "angularx-social-login";

const body = document.getElementsByTagName("body")[0];

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  public notifications: any;
  newNotifications = [];
  error: any;
  id: any;
  private user: SocialUser;
  private loggedIn: boolean;
  searchForm: FormGroup;

  private currentNotifications = gql`
    query getNotificationbyUser($notifownerId: ID!) {
      getNotificationbyUser(userId: $notifownerId) {
        notifications {
          id
          title
          description
          status
          createdAt
          notif_type
        }
      }
    }
  `;

  public searchResult = false;
  public searchResultEmpty = false;
  public text: string;
  public open = false;
  public openNav = false;
  public openSearch = false;
  public href: string = "";

  constructor(
    private translate: TranslateService,
    private router: Router,
    private apollo: Apollo,
    public authService: AuthenticationService,
    public searchService: GlobalSearchService,
    public fb: FormBuilder,
    private googleAuthService: AuthService
  ) {
    translate.setDefaultLang("en");
  }

  openHeaderMenu() {
    this.open = !this.open;
  }

  openMobileNav() {
    this.openNav = !this.openNav;
  }

  changeURL() {
    this.href = window.location.href;
  }

  clickSearch() {
    this.openSearch = !this.openSearch;
    if (this.searchForm.value.searchText !== "") {
      this.searchService.setSearchText(this.searchForm.value.searchText);
    }
  }

  public changeLanguage(lang) {
    this.translate.use(lang);
  }

  checkSearchResultEmpty(items) {
    if (!items.length) this.searchResultEmpty = true;
    else this.searchResultEmpty = false;
  }
  logout() {
    if (this.loggedIn == true) {
      this.googleAuthService.signOut();
      this.router.navigate(["/"]);
    } else {
      this.authService.authLogout();
    }
  }

  ngOnInit() {
    this.id = localStorage["graphcool-user-id"];
    this.changeURL();

    this.searchForm = this.fb.group({
      searchText: [""],
    });

    this.apollo
      .query({
        query: this.currentNotifications,
        variables: {
          notifownerId: this.id, // replace user ID here
        },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        (data: any) => {
          this.notifications = data.data.getNotificationbyUser.notifications;
          this.notifications.forEach((element) => {
            if (element.status == "new") {
              this.newNotifications.push(element);
            }
          });
        },
        (error) => {
          this.error = error;
        }
      );

    this.googleAuthService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = user != null;
    });
  }
}
