import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import { MatMenuTrigger } from "@angular/material/menu";
import { Globals } from "src/app/globals";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { Router, ActivatedRoute } from "@angular/router";
import { async } from "@angular/core/testing";
import { ShareTemplatesComponent } from "../../new/share-templates/share-templates.component";
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
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
  selector: "app-created-document",
  templateUrl: "./created-document.component.html",
  styleUrls: ["./created-document.component.scss"],
})
export class CreatedDocumentComponent implements OnInit {
  private getDocs = gql`
    query getDocumentsByOwner($ownerId: ID!) {
      getDocumentsByOwner(userId: $ownerId) {
        documents {
          id
          doc_title
          doc_owner {
            id
            first_name
            last_name
          }
          unregisteredUsers {
            email
            permission
          }
          sections_list {
            sec_title
            sec_content
            security_level
            isPrivate
            sec_owner {
              id
              email_id
            }
            collab_list {
              user {
                id
                first_name
                last_name
                email_id
              }
              emailId
              permission
              user_action
              message
            }
          }
          security_level
          isPrivate
          status
          createdAt
          updateAt
          updateUser {
            id
            first_name
            last_name
          }
          collab_list {
            user {
              first_name
              last_name
              email_id
              id
            }
            emailId
            permission
            user_action
            message
          }
        }
      }
    }
  `;
  private getSections = gql`
    query getSectionsByOwner($secownerId: ID!) {
      getSectionsByOwner(userId: $secownerId) {
        sections {
          id
          sec_title
          sec_content
          sec_owner {
            id
            email_id
          }
          unregisteredUsers {
            email
            permission
          }
          createdAt
          security_level
          isPrivate
          collab_list {
            user {
              id
              email_id
            }
            permission
          }
          updateAt
          updateUser {
            id
            email_id
          }
        }
      }
    }
  `;

  private newSection = gql`
    mutation createSections($section: SectionInput!, $userName: String!) {
      createSections(section: $section, userName: $userName) {
        id
      }
    }
  `;
  private saveSectionTemplate = gql`
    mutation createTemplateSection($templateSection: TemplateSectionInput!) {
      createTemplateSection(templateSection: $templateSection) {
        id
      }
    }
  `;
  private deleteSecByID = gql`
    mutation deleteSections(
      $sectionId: ID!
      $updatedUser: ID!
      $userName: String!
    ) {
      deleteSections(
        sectionId: $sectionId
        updatedUser: $updatedUser
        userName: $userName
      ) {
        success
      }
    }
  `;
  private newDoc = gql`
    mutation createDocument($DocData: DocumentInput!, $userName: String!) {
      createDocument(document: $DocData, userName: $userName) {
        id
        createdAt
      }
    }
  `;
  private saveDocTemplate = gql`
    mutation createDocTemplate($docTemplate: DocTemplateInput!) {
      createDocTemplate(docTemplate: $docTemplate) {
        id
        createdAt
      }
    }
  `;
  private deleteDocByID = gql`
    mutation deleteDocument(
      $documentId: ID!
      $updatedUser: ID!
      $userName: String!
    ) {
      deleteDocument(
        documentId: $documentId
        updatedUser: $updatedUser
        userName: $userName
      ) {
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
          name: "saveAsTemplate",
          title: '<i class="icon-bookmark p-2" title="Save as Template"></i>',
        },
        {
          name: "preview",
          title: '<i class="icon-eye p-2" title="Preview"></i>',
        },
        {
          name: "duplicate",
          title: '<i class="icon-files p-2" title="Duplicate"></i>',
        },
        {
          name: "export",
          title: '<i class="icon-export p-2" title="Export"></i>',
        },
        {
          name: "viewDetails",
          title: '<i class="icon-info-alt p-2" title="View Log"></i>',
        },
        {
          name: "delete",
          title: '<i class="icon-trash p-2" title="Delete"></i>',
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
          return value ? value.length : 0;
        },
      },
      isPrivate: {
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
          name: "saveAsTemplate",
          title: '<i class="icon-bookmark p-2" title="Save as Template"></i>',
        },
        {
          name: "preview",
          title: '<i class="icon-eye p-2" title="Preview"></i>',
        },
        {
          name: "duplicate",
          title: '<i class="icon-files p-2" title="Duplicate"></i>',
        },
        {
          name: "export",
          title: '<i class="icon-export p-2" title="Export"></i>',
        },
        {
          name: "viewDetails",
          title: '<i class="icon-info-alt p-2" title="View Log"></i>',
        },
        {
          name: "delete",
          title: '<i class="icon-trash p-2" title="Delete"></i>',
        },
      ],
    },
    columns: {
      sec_title: {
        title: "Title",
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
  username: any;

  constructor(
    public globals: Globals,
    public apollo: Apollo,
    public router: Router,
    public route: ActivatedRoute,
    private ngbModal: NgbModal
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.id = localStorage["graphcool-user-id"];
    this.username = localStorage["graphcool-username"];
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

    this.getDocList();
    this.getSecList();
  }

  getDocList() {
    this.apollo
      .query({
        query: this.getDocs,
        variables: {
          ownerId: this.id, // replace user ID here
        },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        (data: any) => {
          _.map(this.tabs, async (tab) => {
            this.isLoading = false;
            const documentsData: Documents[] =
              data.data.getDocumentsByOwner.documents;
            if (tab.value === "documents") {
              tab.content = documentsData;
            }
          });
        },
        (error) => {}
      );
  }

  getSecList() {
    this.apollo
      .query({
        query: this.getSections,
        variables: {
          secownerId: this.id, // replace user ID here
        },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          const sectionData: Sections[] = data.data.getSectionsByOwner.sections;

          _.map(this.tabs, (tab) => {
            if (tab.value === "sections") {
              tab.content = sectionData;
            }
          });
        },
        (error) => {}
      );
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

  async customAction(data, tabName) {
    const singleData = JSON.parse(JSON.stringify(data.data));
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
    } else if (data.action === "saveAsTemplate") {
      if (tabName === "Documents") {
        Swal.fire({
          title: "Save as Template",
          html:
            "<br><p>Document will be Stored as a Template and cannot add collaborators, but would you like to share with others?</>",
          showCancelButton: true,
          confirmButtonText: "Yes, share with others",
          confirmButtonClass: "btn btn-primary",
          allowOutsideClick: false,

          cancelButtonText: "No, create for just me",
          cancelButtonClass: "btn btn-outline-primary",
          buttonsStyling: false,
          reverseButtons: true,
        }).then((result) => {
          if (result.value) {
            const modalReg = this.ngbModal.open(ShareTemplatesComponent, {
              size: "lg",
              centered: true,
              backdrop: "static",
            });
            modalReg.result.then((sharedMails) => {
              if (sharedMails) {
                singleData.shared_users = sharedMails;
                this.saveDocTemplateQuery(singleData);
              }
            });
          } else {
            Swal.fire({
              title: "Creating Document Template is in progress",
              allowOutsideClick: false,
              onBeforeOpen: () => {
                Swal.showLoading();
                singleData.shared_users = [];
                this.saveDocTemplateQuery(singleData);
              },
            });
          }
        });
      }
      if (tabName === "Sections") {
        Swal.fire({
          title: "Save as Template",
          html:
            "<br><p> Sections will be Stored as a Templateand cannot add collaborators, but would you like to share with others?</>",
          showCancelButton: true,
          confirmButtonText: "Yes, share with others",
          confirmButtonClass: "btn btn-primary",
          allowOutsideClick: false,

          cancelButtonText: "No, create for just me",
          cancelButtonClass: "btn btn-outline-primary",
          buttonsStyling: false,
          reverseButtons: true,
        }).then((result) => {
          if (result.value) {
            const modalReg = this.ngbModal.open(ShareTemplatesComponent, {
              size: "lg",
              centered: true,
              backdrop: "static",
            });
            modalReg.result.then((sharedMails) => {
              if (sharedMails) {
                singleData["shared_users"] = sharedMails;
                this.saveSecTemplateQuery(singleData);
              }
            });
          } else {
            singleData["shared_users"] = [];
            this.saveSecTemplateQuery(singleData);
          }
        });
      }
    } else if (data.action === "duplicate") {
      if (tabName === "Documents") {
        const newTitle = "Copy_" + singleData.doc_title;
        singleData.doc_title = newTitle;

        Swal.fire({
          title: "Document Duplication is in progress",
          allowOutsideClick: false,
          onBeforeOpen: async () => {
            Swal.showLoading();
            const sections = [];
            const docCollabList = [];
            await _.map(singleData.collab_list, async (collab) => {
              docCollabList.push({
                user: collab.user ? collab.user.id : null,
                emailId: collab.emailId,
                permission: collab.permission,
                user_action: collab.user_action,
                message: collab.message,
              });
            });
            await _.map(singleData.sections_list, async (section) => {
              const collabList = [];
              await _.map(section.collab_list, (collab) => {
                collabList.push({
                  user: collab.user ? collab.user.id : null,
                  emailId: collab.emailId,
                  permission: collab.permission,
                  user_action: collab.user_action,
                  message: collab.message,
                });
              });
              sections.push({
                sec_title: section.sec_title,
                sec_content: section.sec_content,
                security_level: section.security_level,
                isPrivate: section.isPrivate,
                commentsId_list: [],
                collab_list: collabList,
                //  sec_owner: section.sec_owner ? section.sec_owner.id : null
                sec_owner: this.id,
              });
            });
            this.apollo
              .mutate({
                mutation: this.newDoc,
                variables: {
                  DocData: {
                    doc_title: singleData.doc_title,
                    doc_owner: this.id,
                    isPrivate: singleData.isPrivate,
                    security_level: singleData.security_level,
                    sections_list: sections,
                    collab_list: docCollabList,
                    unregisteredUsers: singleData.unregisteredUsers,
                    updateUser: this.id,
                  },
                  userName: this.username,
                },
              })
              .subscribe(
                (res: any) => {
                  const result = res.data;
                  if (result) {
                    this.getDocList();
                    Swal.close();
                    this.successDialog("Document Duplicated Successfully");
                  } else {
                    Swal.close();
                    this.errorDialog();
                  }
                },
                (err) => {
                  Swal.close();
                  this.errorDialog();
                }
              );
          },
        });
      }
      if (tabName === "Sections") {
        const newTitle = "Copy_" + singleData.sec_title;
        singleData.sec_title = newTitle;

        Swal.fire({
          title: "Section Duplication is in progress",
          allowOutsideClick: false,
          onBeforeOpen: async () => {
            Swal.showLoading();
            const secCollabList = [];
            await _.map(singleData.collab_list, async (collab) => {
              secCollabList.push({
                user: collab.user ? collab.user.id : null,
                emailId: collab.emailId,
                permission: collab.permission,
                user_action: collab.user_action,
                message: collab.message,
              });
            });
            this.apollo
              .mutate({
                mutation: this.newSection,
                variables: {
                  section: {
                    sec_title: singleData.sec_title,
                    sec_content: singleData.sec_content,
                    sec_owner: this.id,
                    security_level: singleData.security_level,
                    isPrivate: singleData.isPrivate,
                    collab_list: secCollabList,
                    unregisteredUsers: singleData.unregisteredUsers,
                  },
                  userName: this.username,
                },
              })
              .subscribe(
                (res: any) => {
                  const result = res.data;
                  if (result) {
                    Swal.close();
                    this.getSecList();
                    this.successDialog("Section Duplicated Successfully");
                  } else {
                    Swal.close();
                    this.errorDialog();
                  }
                },
                (err) => {
                  Swal.close();
                  this.errorDialog();
                }
              );
          },
        });
      }
    } else if (data.action === "delete") {
      if (tabName === "Documents") {
        Swal.fire({
          title: "Document Delete is in progress",
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
            this.apollo
              .mutate({
                mutation: this.deleteDocByID,
                variables: {
                  documentId: data.data.id,
                  updatedUser: this.id,
                  userName: this.username,
                },
                fetchPolicy: "no-cache",
              })
              .subscribe(
                (res: any) => {
                  const result = res.data;
                  if (result) {
                    Swal.close();
                    this.getDocList();
                    this.successDialog("Document deleted Successfully");
                  } else {
                    Swal.close();
                    this.errorDialog();
                  }
                },
                (err) => {
                  Swal.close();
                  this.errorDialog();
                }
              );
          },
        });
      }
      if (tabName === "Sections") {
        Swal.fire({
          title: "Section Delete is in progress",
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
            this.apollo
              .mutate({
                mutation: this.deleteSecByID,
                variables: {
                  sectionId: data.data.id,
                  updatedUser: this.id,
                  userName: this.username,
                },
                fetchPolicy: "no-cache",
              })
              .subscribe(
                (res: any) => {
                  const result = res.data;
                  if (result) {
                    Swal.close();
                    this.getSecList();
                    this.successDialog("Section deleted Successfully");
                  } else {
                    Swal.close();
                    this.errorDialog();
                  }
                },
                (err) => {
                  Swal.close();
                  this.errorDialog();
                }
              );
          },
        });
      }
      if (tabName === "Smart Contracts") {
      }
    } else if (data.action === "viewDetails") {
      let type;
      let title;
      if (tabName === "Documents") {
        type = "document";
        title = data.data.doc_title;
      }
      if (tabName === "Sections") {
        type = "section";
        title = data.data.sec_title;
      }
      this.router.navigate(["/mainPage/documents/history"], {
        relativeTo: this.route,
        queryParams: { name: data.data.id, title, type },
      });
    }
  }

  successDialog(textMsg) {
    Swal.fire({
      icon: "success",
      text: textMsg,
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
  }

  errorDialog() {
    Swal.fire({
      icon: "error",
      text: "Something went wrong.Please try again",
    });
  }

  openMenufolder(event: MouseEvent, viewChild: MatMenuTrigger, element) {
    event.preventDefault();
    viewChild.openMenu();
    element.left = event.clientX + "px";
    element.top = event.clientY + "px";
  }

  saveDocTemplateQuery(singleData) {
    const selectedTempSection = singleData.sections_list.map((item) => {
      return {
        template_title: item.sec_title,
        template_content: item.sec_content,
        template_owner: this.id,
        template_security_level: item.security_level,
        template_isPrivate: item.isPrivate,
      };
    });

    Swal.fire({
      title: "Creating Document Template is in progress",
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        this.apollo
          .mutate({
            mutation: this.saveDocTemplate,
            variables: {
              docTemplate: {
                doc_template_title: singleData.doc_title,
                doc_template_owner: this.id,
                docTemp_isPrivate: singleData.isPrivate,
                docTemp_security_level: singleData.security_level,
                sections_template_list: selectedTempSection,
                shared_users: singleData.shared_users.register,
                unregisteredUsers: singleData.shared_users.unregister,
              },
            },
          })
          .subscribe(
            (res: any) => {
              const result = res.data;
              if (result) {
                Swal.close();
                this.successDialog("Document Template Created Successfully");
              } else {
                Swal.close();
                this.errorDialog();
              }
            },
            (err) => {
              Swal.close();
              this.errorDialog();
            }
          );
      },
    });
  }
  saveSecTemplateQuery(singleData) {
    Swal.fire({
      title: "Creating Section Template is in progress",
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        this.apollo
          .mutate({
            mutation: this.saveSectionTemplate,
            variables: {
              templateSection: {
                template_title: singleData.sec_title,
                template_content: singleData.sec_content,
                template_security_level: singleData.security_level,
                template_isPrivate: singleData.isPrivate,
                template_owner: this.id,
                shared_users: singleData.shared_users.register,
                unregisteredUsers: singleData.shared_users.unregister,
              },
            },
          })
          .subscribe(
            (res: any) => {
              const result = res.data;
              if (result) {
                Swal.close();
                this.successDialog("Section Template Created Successfully");
              } else {
                Swal.close();
                this.errorDialog();
              }
            },
            (err) => {
              Swal.close();
              this.errorDialog();
            }
          );
      },
    });
  }
}
