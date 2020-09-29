import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import { MatMenuTrigger } from "@angular/material/menu";
import { Globals } from "src/app/globals";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { Router, ActivatedRoute } from "@angular/router";
import { Packer } from "docx";
import * as saveAs from "file-saver";

import { DocumentCreator } from "../../../exports/document-export";
import { SectionCreator } from "../../../exports/section-export";

declare var require;
const Swal = require("sweetalert2");

interface Documents {
  doc_title: string;
  security_level: string;
  isPrivate: boolean;
  status: string;
  accesslevel?: string;
  collab_list?: Collaborators[];
}

interface Sections {
  sec_title: string;
  security_level: string;
  status: string;
  accesslevel?: string;
  collab_list?: Collaborators[];
}

interface Collaborators {
  user: User;
  permission: string;
  status: string;
}

interface User {
  first_name: string;
  last_name: string;
  email_id: string;
}

@Component({
  selector: "app-collaborated-document",
  templateUrl: "./collaborated-document.component.html",
  styleUrls: ["./collaborated-document.component.scss"],
})
export class CollaboratedDocumentComponent implements OnInit {
  private getCollabDocs = gql`
    query getDocumentsByCollab($userId: ID!) {
      getDocumentsByCollab(userId: $userId) {
        documents {
          id
          doc_title
          doc_owner {
            email_id
          }
          collab_list {
            user {
              id
              email_id
            }
            permission
          }
          security_level
          isPrivate
          status
          sections_list {
            sec_title
          }
          createdAt
        }
      }
    }
  `;

  private getCollabSection = gql`
    query getSectionsByCollab($userId: ID!) {
      getSectionsByCollab(userId: $userId) {
        sections {
          id
          sec_title
          sec_owner {
            email_id
          }
          collab_list {
            user {
              id
              email_id
            }
            permission
          }
          security_level
          isPrivate
          createdAt
        }
      }
    }
  `;

  page = 1;
  pageSize = 12;

  gridView: boolean;
  fullGridView: boolean;
  listView = true;

  id: string;
  tabs: any = this.globals.fileTypes;
  isLoading: boolean;

  documentSettings = {
    noDataMessage: "No Documents Available",
    hideSubHeader: true,
    actions: {
      add: false,
      edit: false,
      delete: false,
      position: "right",
      custom: [
        {
          name: "preview",
          title: '<i class="icon-eye" title="Preview"></i>&nbsp;&nbsp;',
        },
        {
          name: "export",
          title: '<i class="icon-export" title="Export"></i>',
        },
      ],
    },
    columns: {
      doc_title: {
        title: "Title",
      },
      sections_list: {
        title: "Sections",
        valuePrepareFunction: (value) => {
          return value ? value.length : 0;
        },
      },
      security_level: {
        title: "Security",
      },
      collab_list: {
        title: "Collaborators",
        valuePrepareFunction: (value) => {
          value.coownerCount = value.filter(
            (collab) => collab.permission === "coowner"
          ).length;
          value.approveAndEditCount = value.filter(
            (collab) => collab.permission === "approveAndEdit"
          ).length;
          value.approveCount = value.filter(
            (collab) => collab.permission === "approve"
          ).length;
          value.editCount = value.filter(
            (collab) => collab.permission === "edit"
          ).length;
          value.commentCount = value.filter(
            (collab) => collab.permission === "comment"
          ).length;
          value.viewCount = value.filter(
            (collab) => collab.permission === "view"
          ).length;
          return value ? value.length : 0;
        },
      },
      isPrivate: {
        title: "Visibility",
        valuePrepareFunction: (value) => {
          return value ? "Private" : "Public";
        },
      },
      accesslevel: {
        title: "Access Level",
      },
      // status: {
      //   title: 'Status',
      // }
    },
  };

  sectionSettings = {
    noDataMessage: "No Sections Available",
    hideSubHeader: true,
    actions: {
      add: false,
      edit: false,
      delete: false,
      position: "right",
      custom: [
        {
          name: "preview",
          title: '<i class="icon-eye" title="Preview"></i>&nbsp;&nbsp;',
        },
        {
          name: "export",
          title: '<i class="icon-export" title="Export"></i>',
        },
      ],
    },
    columns: {
      sec_title: {
        title: "Title",
      },
      collab_list: {
        title: "Collaborators",
        valuePrepareFunction: (value) => {
          value.coownerCount = value.filter(
            (collab) => collab.permission === "coowner"
          ).length;
          value.approveAndEditCount = value.filter(
            (collab) => collab.permission === "approveAndEdit"
          ).length;
          value.approveCount = value.filter(
            (collab) => collab.permission === "approve"
          ).length;
          value.editCount = value.filter(
            (collab) => collab.permission === "edit"
          ).length;
          value.commentCount = value.filter(
            (collab) => collab.permission === "comment"
          ).length;
          value.viewCount = value.filter(
            (collab) => collab.permission === "view"
          ).length;
          return value ? value.length : 0;
        },
      },
      security_level: {
        title: "Security",
      },
      isPrivate: {
        title: "Visibility",
        valuePrepareFunction: (value) => {
          return value ? "Private" : "Public";
        },
      },
      accesslevel: {
        title: "Access Level",
      },
      // status: {
      //   title: 'Status',
      // }
    },
  };

  contractSettings = {
    noDataMessage: "Smart Contracts Coming Soon",
    hideSubHeader: true,
    actions: {
      add: false,
      edit: false,
      delete: false,
      position: "right",
      custom: [],
    },
    columns: {
      sec_title: {
        title: "Title",
      },
      collab_list: {
        title: "Collaborators",
        valuePrepareFunction: (value) => {
          return value ? value.length : 0;
        },
      },
      security_level: {
        title: "Security",
      },
      isPrivate: {
        title: "Visibility",
        valuePrepareFunction: (value) => {
          return value ? "Private" : "Public";
        },
      },
      status: {
        title: "Status",
      },
    },
  };

  constructor(
    public globals: Globals,
    public apollo: Apollo,
    public router: Router,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = localStorage.getItem(this.globals.GC_USER_ID);
    this.isLoading = true;

    let documentsData: Documents[] = [];
    let sectionData: Sections[] = [];
    // maps each settings to its tab
    _.map(this.tabs, (tab) => {
      if (tab.value === "documents") {
        tab.content = [];
        tab.settings = this.documentSettings;
      }
      if (tab.value === "sections") {
        tab.content = [];
        tab.settings = this.sectionSettings;
      }
      if (tab.value === "scontracts") {
        tab.content = [];
        tab.settings = this.contractSettings;
      }
    });

    // gets the collaborators document list based upon the userid
    this.apollo
      .query({
        query: this.getCollabDocs,
        variables: { userId: this.id },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        this.isLoading = false;
        _.map(this.tabs, async (tab) => {
          documentsData = data.data.getDocumentsByCollab.documents;
          await this.mapAccessLevel(documentsData, "Documents");
          if (tab.value === "documents") {
            tab.content = documentsData;
          }
        });
      });

    // gets the collaborators section list based upon the userid
    this.apollo
      .query({
        query: this.getCollabSection,
        variables: { userId: this.id },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        sectionData = data.data.getSectionsByCollab.sections;
        this.isLoading = false;
        this.mapAccessLevel(sectionData, "Sections");
        _.map(this.tabs, (tab) => {
          if (tab.value === "sections") {
            tab.content = sectionData;
          }
        });
      });
  }

  mapAccessLevel(data, type) {
    _.map(data, (x) => {
      const collaboratorDetail = x.collab_list.find(
        (collaborator) => collaborator.user && collaborator.user.id === this.id
      );
      if (collaboratorDetail) {
        if (collaboratorDetail.permission === "coowner") {
          x.accesslevel = "Co-owner";
        }
        if (collaboratorDetail.permission === "approve") {
          x.accesslevel = "Can Approve";
        }
        if (collaboratorDetail.permission === "approveEdit") {
          x.accesslevel = "Approve and Edit";
        }
        if (collaboratorDetail.permission === "comment") {
          x.accesslevel = "Comment";
        }
        if (collaboratorDetail.permission === "edit") {
          x.accesslevel = "Edit";
        }
        if (collaboratorDetail.permission === "view") {
          x.accesslevel = "Only View";
        }
      }
    });
    // if (type === 'Documents' && data.length) {
    //   // this.documentSettings.actions.custom = [
    //   //   {
    //   //     name: 'preview',
    //   //     title: '<i class="icon-eye" title="Preview"></i>&nbsp;&nbsp;',
    //   //   },
    //   //   {
    //   //     name: 'export',
    //   //     title: '<i class="icon-export" title="Export"></i>',
    //   //   }
    //   // ];
    // }
    // if (type === 'Sections' && data.length) {
    //   this.sectionSettings.actions.custom = [
    //     {
    //       name: 'preview',
    //       title: '<i class="icon-eye" title="Preview"></i>&nbsp;&nbsp;',
    //     },
    //     {
    //       name: 'export',
    //       title: '<i class="icon-export" title="Export"></i>',
    //     }
    //   ];
    // }
  }
  preview(id, tabName) {
    if (tabName === "Documents") {
      this.router.navigate(["/mainPage/preview/document"], {
        relativeTo: this.route,
        queryParams: { name: id },
      });
    }
    if (tabName === "Sections") {
      this.router.navigate(["/mainPage/preview/section"], {
        relativeTo: this.route,
        queryParams: { name: id },
      });
    }
    if (tabName === "Smart Contracts") {
    }
  }

  customAction(data, tabName) {
    if (data.action === "preview") {
      if (tabName === "Documents") {
        this.router.navigate(["/mainPage/preview/document"], {
          relativeTo: this.route,
          queryParams: { name: data.data.id },
        });
      }
      if (tabName === "Sections") {
        this.router.navigate(["/mainPage/preview/section"], {
          relativeTo: this.route,
          queryParams: { name: data.data.id },
        });
      }
      if (tabName === "Smart Contracts") {
      }
    } else if (data.action === "export") {
      if (tabName == "Documents") {
        const documentCreator = new DocumentCreator();

        const doc = documentCreator.create(data.data);

        Packer.toBlob(doc).then((blob) => {
          saveAs(blob, data.data.doc_title + ".docx");
          Swal.fire({
            icon: "success",
            text: "Document exported successfully to DOCX format",
            timer: 2000,
            onOpen: () => {
              Swal.showLoading();
            },
          }).then((result) => {
            if (
              // Read more about handling dismissals
              result.dismiss === Swal.DismissReason.timer
            ) {
            }
          });
        });
      } else if (tabName == "Sections") {
        const sectionCreator = new SectionCreator();

        const doc = sectionCreator.create(data.data);

        Packer.toBlob(doc).then((blob) => {
          saveAs(blob, data.data.sec_title + ".docx");
          Swal.fire({
            icon: "success",
            text: "Section exported successfully to DOCX format",
            timer: 2000,
            onOpen: () => {
              Swal.showLoading();
            },
          }).then((result) => {
            if (
              // Read more about handling dismissals
              result.dismiss === Swal.DismissReason.timer
            ) {
            }
          });
        });
      }
    }
  }

  openMenufolder(event: MouseEvent, viewChild: MatMenuTrigger, element) {
    event.preventDefault();
    viewChild.openMenu();
    element.left = event.clientX + "px";
    element.top = event.clientY + "px";
  }
}
