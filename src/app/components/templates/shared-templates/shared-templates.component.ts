import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import { MatMenuTrigger } from "@angular/material/menu";
import { Globals } from "src/app/globals";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { Router, ActivatedRoute } from "@angular/router";
import { ExportService } from "src/app/services/export.service";

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
  selector: "app-shared-templates",
  templateUrl: "./shared-templates.component.html",
  styleUrls: ["./shared-templates.component.scss"],
})
export class SharedTemplatesComponent implements OnInit {
  private getDocumentTemplates = gql`
    query getDocTemplateBySharedUser($userId: ID!) {
      getDocTemplateBySharedUser(userId: $userId) {
        docTemplates {
          id
          doc_template_title
          doc_template_owner {
            id
            first_name
            last_name
          }
          docTemp_security_level
          docTemp_isPrivate

          sections_template_list {
            id
          }
        }
      }
    }
  `;
  private getSectionTemplates = gql`
    query getSectionTemplateBySharedUser($userId: ID!) {
      getSectionTemplateBySharedUser(userId: $userId) {
        templates {
          id
          template_title
          template_content
          template_owner {
            id
            first_name
            last_name
          }
          template_security_level
          template_isPrivate
        }
      }
    }
  `;
  private deleteDocTemplate = gql`
    mutation deleteDocTemplate($docTemplateId: ID!) {
      deleteDocTemplate(docTemplateId: $docTemplateId) {
        success
      }
    }
  `;
  private deleteSectionTemplate = gql`
    mutation deleteDocTemplate($sectionTemplateId: ID!) {
      deleteTemplateSection(sectionTemplateId: $sectionTemplateId) {
        success
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
          title: '<i class="icon-eye p-2" title="Preview"></i>',
        },

        {
          name: "export",
          title: '<i class="icon-export p-2" title="Export"></i>',
        },
        {
          name: "delete",
          title: '<i class="icon-trash p-2" title="Delete"></i>',
        },
      ],
    },
    columns: {
      doc_template_title: {
        title: "Title",
        width: "40%",
      },
      sections_template_list: {
        title: "Sections",
        valuePrepareFunction: (value) => {
          return value ? value.length : 0;
        },
      },
      docTemp_security_level: {
        title: "Security",
      },

      docTemp_isPrivate: {
        title: "Visibility",
        valuePrepareFunction: (value) => {
          return value ? "Private" : "Public";
        },
      },
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
          title: '<i class="icon-eye p-2" title="Preview"></i>',
        },
        {
          name: "export",
          title: '<i class="icon-export p-2" title="Export"></i>',
        },
        {
          name: "delete",
          title: '<i class="icon-trash p-2" title="Delete"></i>',
        },
      ],
    },

    columns: {
      template_title: {
        title: "Title",
        width: "25%",
      },

      template_content: {
        title: "Content",
        width: "25%",
        type: "html",
        valuePrepareFunction: (value) => {
          return value.slice(0, 100);
        },
      },
      template_security_level: {
        title: "Security",
      },
      template_isPrivate: {
        title: "Visibility",
        valuePrepareFunction: (value) => {
          return value ? "Private" : "Public";
        },
      },
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
    public route: ActivatedRoute,
    public exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.id = localStorage.getItem(this.globals.GC_USER_ID);
    this.isLoading = true;

    // maps each settings to its tab
    _.map(this.tabs, (tab) => {
      if (tab.value === "documents") {
        tab.settings = this.documentSettings;
      }
      if (tab.value === "sections") {
        tab.settings = this.sectionSettings;
      }
      if (tab.value === "scontracts") {
        tab.content = [];
        tab.settings = this.contractSettings;
      }
    });

    // gets the collaborators document list based upon the userid
    this.getDocumentTempList();
    this.getSectionTempList();
  }

  getDocumentTempList() {
    this.apollo
      .query({
        query: this.getDocumentTemplates,
        variables: { userId: this.id },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        this.isLoading = false;
        _.map(this.tabs, async (tab) => {
          const documentsData: Documents[] =
            data.data.getDocTemplateBySharedUser.docTemplates;

          if (tab.value === "documents") {
            tab.content = documentsData;
          }
        });
      });
  }
  getSectionTempList() {
    this.apollo
      .query({
        query: this.getSectionTemplates,
        variables: {
          userId: this.id, // replace user ID here
        },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        (data: any) => {
          const sectionData =
            data.data.getSectionTemplateBySharedUser.templates;
          _.map(this.tabs, (tab) => {
            if (tab.value === "sections") {
              tab.content = sectionData;
            }
          });
        },
        (error) => {
          //this.error = true;
        }
      );
  }

  preview(id, tabName) {
    if (tabName === "Documents") {
      this.router.navigate(["/mainPage/preview/documentTemplate"], {
        relativeTo: this.route,
        queryParams: { name: id },
      });
    }
    if (tabName === "Sections") {
      this.router.navigate(["/mainPage/preview/sectionTemplate"], {
        relativeTo: this.route,
        queryParams: { name: id },
      });
    }
    if (tabName === "Smart Contracts") {
    }
  }

  async customAction(data, tabName) {
    if (data.action === "preview") {
      if (tabName === "Documents") {
        this.router.navigate(["/mainPage/preview/documentTemplate"], {
          relativeTo: this.route,
          queryParams: { name: data.data.id },
        });
      }
      if (tabName === "Sections") {
        this.router.navigate(["/mainPage/preview/sectionTemplate"], {
          relativeTo: this.route,
          queryParams: { name: data.data.id },
        });
      }
      if (tabName === "Smart Contracts") {
      }
    } else if (data.action === "export") {
      if (tabName === "Documents") {
        this.exportService.exportDocTemplate(data.data);
      }
    } else if (data.action === "delete") {
      if (tabName === "Documents") {
        Swal.fire({
          title: "Document Template Deletion is in progress",
          allowOutsideClick: false,
          onBeforeOpen: async () => {
            Swal.showLoading();
            this.apollo
              .mutate({
                mutation: this.deleteDocTemplate,
                variables: {
                  docTemplateId: data.data.id,
                },
                fetchPolicy: "no-cache",
              })
              .subscribe((data) => {
                this.getDocumentTempList();
                const result = data.data;
                if (result) {
                  Swal.close();
                  Swal.fire({
                    icon: "success",
                    text: "Document Template is Deleted",
                    timer: 1000,
                    onOpen: () => {
                      Swal.showLoading();
                    },
                  }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                    }
                  });
                } else {
                  Swal.fire({
                    text: "Something went wrong.Please try again",
                    type: "warning",
                  });
                }
              });
          },
        });
      }
      if (tabName === "Sections") {
        Swal.fire({
          title: "Section Template Deletion is in progress",
          allowOutsideClick: false,
          onBeforeOpen: async () => {
            Swal.showLoading();
            this.apollo
              .mutate({
                mutation: this.deleteSectionTemplate,
                variables: {
                  sectionTemplateId: data.data.id,
                },
                fetchPolicy: "no-cache",
              })
              .subscribe((data) => {
                const result = data.data;
                if (result) {
                  this.getSectionTempList();
                  Swal.fire({
                    icon: "success",
                    text: "Section Template is Deleted",
                    timer: 1000,
                    onOpen: () => {
                      Swal.showLoading();
                    },
                  }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                    }
                  });
                } else {
                  Swal.fire({
                    text: "Something went wrong.Please try again",
                    type: "warning",
                  });
                }
              });
          },
        });
      }
      if (tabName === "Smart Contracts") {
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
