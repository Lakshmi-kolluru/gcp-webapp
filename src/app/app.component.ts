import { Component, OnInit, isDevMode } from "@angular/core";
import { LocationStrategy } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "vesta-ui";

  ngOnInit() {
    if (isDevMode()) {
      console.log("👋 Development!");
    } else {
      console.log("💪 Production!");
    }
  }
}
