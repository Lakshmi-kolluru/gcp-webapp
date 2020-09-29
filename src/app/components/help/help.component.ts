import { Component, OnInit } from "@angular/core";
import { GlobalSearchService } from "src/app/services/global-search.service";
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: "app-help",
  templateUrl: "./help.component.html",
  styleUrls: ["./help.component.scss"],
})
export class HelpComponent implements OnInit {
  public mainPagediv = false;
  public questiondiv = true;
  public searchResult = false;
  public searchResultEmpty = false;
  public openSearch = false;
  searchForm: FormGroup;

  showAnswer() {
    this.mainPagediv = true;
    this.questiondiv = false;
  }
  goback() {
    this.mainPagediv = false;
    this.questiondiv = true;
  }

  clickSearch() {
    this.openSearch = !this.openSearch;
    this.searchService.setSearchText(this.searchForm.value.searchText);
  }

  constructor(public searchService: GlobalSearchService,  public fb: FormBuilder) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchText: [""],
    });
  }
}
