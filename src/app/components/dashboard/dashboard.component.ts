import { Component, OnInit } from "@angular/core";
import { Globals } from "../../globals";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import * as _ from "lodash";
import { Router } from "@angular/router";

import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { InitialSetupComponent } from "../profile/initial-setup/initial-setup.component";
import { ShareTemplatesComponent } from "../new/share-templates/share-templates.component";
import { Packer } from "docx";
import * as saveAs from "file-saver";

import { DocumentCreator } from "../../exports/document-export";
import { SectionCreator } from "../../exports/section-export";

import { AuthenticationService } from "src/app/services/auth.service";

const Swal = require("sweetalert2");

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  sub: any;
  id: any;
  documents;
  sections: any;
  notification: any;
  error = false;
  gbUsed: boolean;
  tasksDone: boolean;
  loginType: boolean;
  val: any;
  buttonDiv: any;
  notifications = [];
  selectedNotification = [];
  readNotifications = [];
  newNotifications = [];
  currentJustify = "center";
  secTemplate: any = [];
  docTemplate: any = [];

  public isInitial = "false";

  tabs = this.globals.fileTypes;

  private currentNotifications = gql`
    query getNotificationbyUser($notifownerId: ID!) {
      getNotificationbyUser(userId: $notifownerId) {
        notifications {
          id
          title
          description
          status
          createdAt
          notif_type
        }
      }
    }
  `;

  private getDocs = gql`
    query getDocumentsByOwner($ownerId: ID!) {
      getDocumentsByOwner(userId: $ownerId) {
        documents {
          id
          doc_title
          doc_owner {
            id
            email_id
          }
          createdAt
          unregisteredUsers {
            email
            permission
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
          security_level
          isPrivate
          status
          sections_list {
            id
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

  // Templates
  private getDocumentTemplates = gql`
    query getDocTemplatesByOwner($userId: ID!) {
      getDocTemplatesByOwner(userId: $userId) {
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
    query getSectionTemplatebyOwner($ownerId: ID!) {
      getSectionTemplatebyOwner(ownerId: $ownerId) {
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
  username: any;
  close(alert) {
    this.notification.splice(this.notification.indexOf(alert), 1);
  }

  showButtons(val) {
    this.buttonDiv = val;
  }

  constructor(
    private globals: Globals,
    private apollo: Apollo,
    public router: Router,
    private ngbModal: NgbModal,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.id = localStorage["graphcool-user-id"];
    this.username = localStorage["graphcool-username"];
    this.authService._isLoginNumber.subscribe((message) => {
      this.loginType = message;
      if (this.loginType == true) {
        this.customHTML();
      }
    });
    this.getDocList();

    // For Getting Sections based on User ID
    this.getSectionList();

    this.getTemplateList();

    this.apollo
      .query({
        query: this.currentNotifications,
        variables: {
          notifownerId: this.id, // replace user ID here
        },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        (data: any) => {
          this.notifications = data.data.getNotificationbyUser.notifications;
          this.notifications.forEach((element) => {
            if (element.status === "new") {
              this.newNotifications.push(element);
            }
          });
        },
        (error) => {
          this.error = error;
        }
      );
  }

  getTemplateList() {
    this.apollo
      .query({
        query: this.getDocumentTemplates,
        variables: { userId: this.id },
        fetchPolicy: "no-cache",
      })
      .subscribe(async (data: any) => {
        this.docTemplate = data.data.getDocTemplatesByOwner.docTemplates.length;
      });
    this.apollo
      .query({
        query: this.getSectionTemplates,
        variables: { ownerId: this.id },
        fetchPolicy: "no-cache",
      })
      .subscribe(async (data: any) => {
        this.secTemplate = await data.data.getSectionTemplatebyOwner.templates
          .length;
      });
  }

  getSectionList() {
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
          this.sections = data.data.getSectionsByOwner.sections;
          this.sections.sort(function (a, b) {
            return b.createdAt < a.createdAt
              ? -1
              : b.createdAt > a.createdAt
              ? 1
              : 0;
          });
        },
        (error) => {
          this.error = true;
        }
      );
  }

  saveSectionAsTemplate(secData) {
    Swal.fire({
      title: "Save as Template",
      html:
        "<br><p> Sections will be Stored as a Template and cannot add collaborators, but would you like to  share with others?</>",
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
            secData["register"] = sharedMails.register;
            secData["unregister"] = sharedMails.unregister;

            this.saveSectionTemplateQuery(secData);
          }
        });
      } else {
        secData["shared"] = [];
        this.saveSectionTemplateQuery(secData);
      }
      // else {
      //   this.onSubmit();
      // }
    });
  }

  saveSectionTemplateQuery(sectionTemp) {
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
                template_title: sectionTemp["sec_title"],
                template_content: sectionTemp["sec_content"],
                template_security_level: sectionTemp["securityevel"],
                template_isPrivate: sectionTemp["private"],
                template_owner: this.id,
                shared_users: sectionTemp["register"],
                unregisteredUsers: sectionTemp["unregister"],
              },
            },
          })
          .subscribe(
            ({ data }) => {
              Swal.fire({
                title: "success!",
                text: "Section saved as template",
                timer: 1000,
                onOpen: () => {
                  Swal.showLoading();
                },
              }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                }
              });
            },
            (err) => {
              Swal.close();
            }
          );
      },
    });
  }
  successDialog(testMsg) {
    Swal.fire({
      icon: "success",
      text: testMsg,
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

  saveSectionAsDuplicate(secData) {
    secData = JSON.parse(JSON.stringify(secData));
    const newTitle = "Copy_" + secData.sec_title;
    secData.sec_title = newTitle;
    Swal.fire({
      title: "Section Duplicate is in progress",
      allowOutsideClick: false,
      onBeforeOpen: async () => {
        Swal.showLoading();
        const secCollabList = [];
        await _.map(secData.collab_list, async (collab) => {
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
                sec_title: secData.sec_title,
                sec_content: secData.sec_content,
                sec_owner: this.id,
                security_level: secData.security_level,
                isPrivate: secData.isPrivate,
                collab_list: secCollabList,
              },
              userName: this.username,
            },
          })
          .subscribe(
            (res: any) => {
              const result = res.data;
              if (result) {
                Swal.close();
                this.getSectionList();
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

  deleteSection(secID) {
    Swal.fire({
      title: "Section Deletion is in progress",
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        this.apollo
          .mutate({
            mutation: this.deleteSecByID,
            variables: {
              sectionId: secID,
              updatedUser: this.id,
              userName: this.username,
            },
            fetchPolicy: "no-cache",
          })
          .subscribe(
            (res: any) => {
              const result = res.data;
              if (result) {
                this.getSectionList();
                Swal.close();
                this.successDialog("Section Deleted Successfully");
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
          this.documents = data.data.getDocumentsByOwner.documents;

          this.documents.sort(function (a, b) {
            return b.createdAt < a.createdAt
              ? -1
              : b.createdAt > a.createdAt
              ? 1
              : 0;
          });
        },
        (error) => {
          this.error = true;
        }
      );
  }

  saveDocAsTemplate(docData) {
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
            docData.sharedMails = sharedMails;
            this.saveTemplateQuery(docData);
          } else {
            this.saveTemplateQuery(docData);
          }
        });
      } else {
        Swal.fire({
          title: "Creating Document Template is in progress",
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
            const mails = [];
            docData.sharedMails = [];
            this.saveTemplateQuery(docData);
          },
        });
      }
    });
  }

  saveTemplateQuery(docData) {
    Swal.fire({
      title: "Creating Document Template is in progress",
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        docData.sections_list = docData.sections_list.map((item) => {
          return {
            template_title: item.sec_title,
            template_content: item.sec_content,
            template_owner: this.id,
            template_security_level: item.security_level,
            template_isPrivate: item.isPrivate,
            // isFromDoc: true
          };
        });
        this.apollo
          .mutate({
            mutation: this.saveDocTemplate,
            variables: {
              docTemplate: {
                doc_template_title: docData.doc_title,
                doc_template_owner: this.id,
                docTemp_isPrivate: docData.private,
                docTemp_security_level: docData.security_level,
                sections_template_list: docData.sections_list,
                shared_users: docData.sharedMails.register,
                unregisteredUsers: docData.sharedMails.unregister,
              },
            },
          })
          .subscribe(
            (res: any) => {
              const result1 = res.data;
              if (result1) {
                Swal.close();
                this.successDialog("Document Saved as a Template");
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
  saveDocAsDuplicate(docData) {
    docData = JSON.parse(JSON.stringify(docData));
    const newTitle = "Copy_" + docData.doc_title;
    docData.doc_title = newTitle;

    Swal.fire({
      title: "Document Duplication is in progress",
      allowOutsideClick: false,
      onBeforeOpen: async () => {
        Swal.showLoading();
        const sections = [];
        const docCollabList = [];
        await _.map(docData.collab_list, async (collab) => {
          docCollabList.push({
            user: collab.user ? collab.user.id : null,
            emailId: collab.emailId,
            permission: collab.permission,
            user_action: collab.user_action,
            message: collab.message,
          });
        });
        await _.map(docData.sections_list, async (section) => {
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
                doc_title: docData.doc_title,
                doc_owner: this.id,
                isPrivate: docData.isPrivate,
                security_level: docData.security_level,
                sections_list: sections,
                collab_list: docCollabList,
                unregisteredUsers: docData.unregisteredUsers,
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

  viewHistory(data, tabName) {
    let type;
    let title;
    if (tabName === "Documents") {
      type = "document";
      title = data.doc_title;
    }
    if (tabName === "Sections") {
      type = "section";
      title = data.sec_title;
    }
    this.router.navigate(["/mainPage/documents/history"], {
      queryParams: { name: data.id, title, type },
    });
  }

  export(data, tabName) {
    if (tabName == "Documents") {
      const documentCreator = new DocumentCreator();

      const doc = documentCreator.create(data);

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, data.doc_title + ".docx");
        Swal.fire({
          icon: "success",
          text: "Document exported successfully to DOCX format",
        });
      });
    } else if (tabName == "Sections") {
      const sectionCreator = new SectionCreator();

      const doc = sectionCreator.create(data);

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, data.sec_title + ".docx");
        Swal.fire({
          icon: "success",
          text: "Section exported successfully to DOCX format",
        });
      });
    }
  }

  deleteDoc(docID) {
    Swal.fire({
      title: "Document Deletion is in progress",
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        this.apollo
          .mutate({
            mutation: this.deleteDocByID,
            variables: {
              documentId: docID,
              updatedUser: this.id,
              userName: this.username,
            },
            fetchPolicy: "no-cache",
          })
          .subscribe(
            (res: any) => {
              const result = res.data;
              if (result) {
                this.getDocList();
                Swal.close();
                this.successDialog("Document Deleted Successfully");
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

  customHTML() {
    Swal.fire({
      title: "Welcome to Vesta",
      text: "Please setup your account to start using the application",
      icon: "success",
      showCancelButton: false,
      allowOutsideClick: false,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      confirmButtonText: "Setup Account",
    }).then((result) => {
      if (result.value) {
        this.router.navigate(["/mainPage/profile/setup"]);
      }
    });
  }
}
