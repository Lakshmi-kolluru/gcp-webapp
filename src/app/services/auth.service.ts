import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Globals } from "../globals";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  isLoggedIn = false;
  private userId: string = null;
  private _isAuthenticated = new BehaviorSubject(false);
  private _isInitialLogin = new BehaviorSubject(true);
  _isLoginNumber = this._isInitialLogin.asObservable();

  GC_USER_ID = this.globals.GC_USER_ID;
  GC_AUTH_TOKEN = this.globals.GC_AUTH_TOKEN;
  GC_USER_EMAIL = this.globals.GC_USER_EMAIL;
  GC_USERNAME = this.globals.GC_USERNAME;

  constructor(
    private globals: Globals,
    public router: Router,
    private _http: HttpClient
  ) {}

  get isAuthenticated(): Observable<any> {
    return this._isAuthenticated.asObservable();
  }
  // 5
  saveUserData(id: string, token: string, username: string, email: string) {
    localStorage.setItem(this.GC_USER_EMAIL, email);
    localStorage.setItem(this.GC_USER_ID, id);
    localStorage.setItem(this.GC_AUTH_TOKEN, token);
    localStorage.setItem(this.GC_USERNAME, username);
    this.setUserId(id);
  }

  //sign in function
  setUserId(user: any) {
    this.isLoggedIn = true;
    localStorage.setItem(this.GC_USER_ID, user.id);
    localStorage.setItem(this.GC_USER_EMAIL, user.email_id);
    localStorage.setItem(this.GC_AUTH_TOKEN, user.token);
    localStorage.setItem(this.GC_USERNAME, user.first_name);
    this.setLoginNumber(user.isInitialLogin);
    this._isAuthenticated.next(true);
  }
  // 7

  setLoginNumber(value) {
    this._isInitialLogin.next(value);
  }
  authLogout() {
    this.isLoggedIn = false;
    localStorage.clear();
    localStorage.removeItem(this.GC_USER_ID);
    localStorage.removeItem(this.GC_AUTH_TOKEN);
    this.userId = null;
    this.router.navigate(["/"]);
    this._isAuthenticated.next(false);
  }

  SignOut() {
    localStorage.clear();
    this.router.navigate([""]);
    this.isLoggedIn = true;
    this._isAuthenticated.next(false);
  }
  // 8
  autoLogin() {
    const id = localStorage.getItem(this.GC_USER_ID);

    if (id) {
      this.setUserId(id);
    }
  }

  //Sign in with Google
  GoogleAuth() {
    //return this.AuthLogin(new auth.GoogleAuthProvider());
  }
}
