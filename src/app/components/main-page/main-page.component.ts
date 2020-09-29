import { Component, OnInit } from "@angular/core";
import "rxjs/add/operator/distinctUntilChanged";
import { AuthenticationService } from "../../services/auth.service";

@Component({
  selector: "app-main-page",
  templateUrl: "./main-page.component.html",
  styleUrls: ["./main-page.component.scss"],
})
export class MainPageComponent implements OnInit {
  logged: boolean = false;
  id: any;

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.authService.isAuthenticated
      .distinctUntilChanged() // Only emit when the current value is different than the last
      .subscribe((isAuthenticated) => {
        this.logged = isAuthenticated;
      });
    this.id = localStorage["graphcool-user-id"];
  }
}
