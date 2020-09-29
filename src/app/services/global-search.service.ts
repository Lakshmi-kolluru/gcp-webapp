import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class GlobalSearchService {
  private search = new BehaviorSubject<string>(null);
  public readonly searchText: Observable<string> = this.search.asObservable();

  constructor(private router: Router) {}

  setSearchText(searchText) {
    this.search.next(searchText);
    this.router.navigate(["/mainPage/searchresult"]);
  }
}
