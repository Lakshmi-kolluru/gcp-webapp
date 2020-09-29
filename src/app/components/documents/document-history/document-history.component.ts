import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";

@Component({
  selector: "app-document-history",
  templateUrl: "./document-history.component.html",
  styleUrls: ["./document-history.component.scss"],
})
export class DocumentHistoryComponent implements OnInit {
  name: any;
  isLoading: boolean;
  auditLog: any;
  type: any;
  // history = [{
  //   name: 'New Edit by Alex',
  //   desp: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry',
  //   time: 'New',
  //   icon: 'icon-pencil'
  // },
  // {
  //   name: 'New Message by Alex',
  //   desp: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry',
  //   time: '25 March 2020',
  //   icon: 'icon-comments'
  // },
  // {
  //   name: 'Alex viewed the document',
  //   desp: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry',
  //   time: '23 March 2020',
  //   icon: 'icon-eye'
  // },
  // {
  //   name: 'Collaborated with 5 others',
  //   desp: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry',
  //   time: '22 March 2020',
  //   icon: 'icon-user'
  // },
  // {
  //   name: 'New Document by Vidya',
  //   desp: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry',
  //   time: '21 March 2020',
  //   icon: 'icon-plus'
  // }];
  constructor(
    public router: Router,
    public apollo: Apollo,
    public route: ActivatedRoute
  ) {}

  public getDocHistoryList = gql`
    query getDocHistoryByDocument($documentId: ID) {
      getDocHistoryByDocument(documentId: $documentId) {
        docsHistory {
          id
          title
          description
          user {
            id
            first_name
            last_name
            email_id
          }
          createdAt
          doc_action
        }
      }
    }
  `;

  public getSecHistoryList = gql`
    query getSecHistoryBySection($sectionId: ID) {
      getSecHistoryBySection(sectionId: $sectionId) {
        secHistory {
          id
          title
          description

          createdAt
          sec_action
        }
      }
    }
  `;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.name = params.title;
      this.type = params.type;
      if (params.name && params.type === "document") {
        this.getDocHistory(params.name);
      }
      if (params.name && params.type === "section") {
        this.getSecHistory(params.name);
      }
    });
  }

  getDocHistory(documentId) {
    this.isLoading = true;
    this.apollo
      .query({
        query: this.getDocHistoryList,
        variables: { documentId },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        this.auditLog = data.data.getDocHistoryByDocument.docsHistory;
        this.auditLog = this.auditLog.reverse();
        this.isLoading = false;
      });
  }

  getSecHistory(sectionId) {
    this.isLoading = true;
    this.apollo
      .query({
        query: this.getSecHistoryList,
        variables: { sectionId },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        this.auditLog = data.data.getSecHistoryBySection.secHistory;
        this.auditLog = this.auditLog.reverse();
        this.isLoading = false;
      });
  }

  back() {
    this.router.navigate(["/mainPage/documents/created"]);
  }
}
