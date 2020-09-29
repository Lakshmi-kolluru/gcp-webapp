import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";

import { AuthenticationService } from "../services/auth.service";

declare var require;
const Swal = require("sweetalert2");

@Injectable({
  providedIn: "root",
})
export class AuthGuardService implements CanActivate {
  constructor(
    public authService: AuthenticationService,
    public router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (localStorage.length === 0) {
      this.router.navigate(["/"]);
      Swal.fire({
        icon: "error",
        title: "Sorry, cannot access your account",
        text: "Please login to use the application",
      });
      return false;
    }
    return true;
  }
}
