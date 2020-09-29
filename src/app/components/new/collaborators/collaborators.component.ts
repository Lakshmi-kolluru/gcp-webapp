import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { Globals } from "../../../globals";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LocalDataSource } from "ng2-smart-table";
import * as _ from "lodash";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { send } from "process";
const Swal = require("sweetalert2");

@Component({
  selector: "app-collaborators",
  templateUrl: "./collaborators.component.html",
  styleUrls: ["./collaborators.component.scss"],
})
export class CollaboratorsComponent implements OnInit {
  @Input() docDetail;
  @Input() collaboratorsArray;
  @Input() action;
  @Input() docname;
  @Output() passData: EventEmitter<any> = new EventEmitter();

  title: any;
  accessLevels = this.globals.accessLevels;
  public validationForm: FormGroup;
  collabSource: LocalDataSource;
  collabTable = true;
  duplicateEmail: boolean;
  submitForm: boolean;
  isLoading: boolean;
  newcollabMail = [];
  secUnregistered = [];
  secRegistered = [];

  // checks whether user exists or not
  private checkUserExist = gql`
    query checkUserExist($emailId: String) {
      checkUserExist(emailId: $emailId) {
        success
        userId
      }
    }
  `;

  // updates only the document collabarator list
  private updateDocumentColloblist = gql`
    mutation updateDocCollabList(
      $documentId: ID
      $collabList: [CollabListInput]
      $collab_action: String
      $unregisterEmails: [unregisterEmailInfo]
      $userName: String
      $updateUser: ID
    ) {
      updateDocCollabList(
        documentId: $documentId
        collabList: $collabList
        collab_action: $collab_action
        unregisterEmails: $unregisterEmails
        userName: $userName
        updateUser: $updateUser
      ) {
        list {
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
        unregisterInfo {
          email
          permission
        }
      }
    }
  `;

  // sends the invitation to unregistered emails
  private sendInvitationToUnregisteredEmail = gql`
    mutation sendEmailsToUnregisteredUsers($emailsList: [String]) {
      sendEmailsToUnregisteredUsers(emailsList: $emailsList) {
        success
      }
    }
  `;

  // updates the section list in document
  private updateDocSectionCollabList = gql`
    mutation updateDocument(
      $document: DocumentInput
      $user_action: String
      $userName: String
      $updatedUser: ID
    ) {
      updateDocument(
        document: $document
        user_action: $user_action
        updatedUser: $updatedUser
        userName: $userName
      ) {
        sections_list {
          id
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
  `;

  private updateSectionCollabList = gql`
    mutation updateSectionCollabList(
      $sectionId: ID
      $collabList: [CollabListInput]
      $collab_action: String
      $unregisterEmails: [unregisterEmailInfo]
      $userName: String
      $updateUser: ID
    ) {
      updateSectionCollabList(
        sectionId: $sectionId
        collabList: $collabList
        collab_action: $collab_action
        unregisterEmails: $unregisterEmails
        userName: $userName
        updateUser: $updateUser
      ) {
        list {
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
        unregisterInfo {
          email
          permission
        }
      }
    }
  `;

  public validators = [this.startsWithAt];

  settings = {
    hideSubHeader: true,
    pager: {
      display: false,
    },
    actions: {
      position: "right",
      edit: false,
      delete: false,
      add: false,
    },
    rowClassFunction: (row) => {
      if (row.data.collabMail === "me" || row.data.permission === "owner") {
        return "hide-action";
      } else {
        return "";
      }
    },
    edit: {
      editButtonContent: '<i class="icon-pencil"></i>',
      saveButtonContent: '<i class="icon-check"></i>',
      cancelButtonContent: '<i class="icon-close"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="icon-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      collabMail: {
        title: "Collaborators",
        editable: false,
      },
      accesslevelValue: {
        title: "Access Level",
        valuePrepareFunction: (cell, row) => {
          if (this.accessLevels.find((level) => level.value === cell)) {
            return this.accessLevels.find((level) => level.value === cell).type;
          } else if (cell === "owner") {
            return "Owner";
          } else {
            return "";
          }
        },
        editor: {
          type: "list",
          config: {
            list: this.accessLevels,
          },
        },
      },
    },
  };
  username: any;
  id: any;

  constructor(
    private fb: FormBuilder,
    public globals: Globals,
    public activeModal: NgbActiveModal,
    public apollo: Apollo
  ) {}

  ngOnInit() {
    this.id = localStorage["graphcool-user-id"];
    this.username = localStorage["graphcool-username"];
    // checks for edit and delete options accessible or not to the particular user
    this.settings.actions.edit = !this.action || this.action === "up-date";
    this.settings.actions.delete = !this.action || this.action === "up-date";

    // consists of collaborators array
    this.collaboratorsArray = this.collaboratorsArray
      ? this.collaboratorsArray
      : [];
    this.collabTable = !this.collaboratorsArray.length;

    // form
    this.validationForm = this.fb.group({
      permission: [null, Validators.required],
      collabMail: ["", Validators.required],
    });

    // displays the list of Collaborators with its access level
    _.map(this.collaboratorsArray, (colloborator) => {
      _.map(this.accessLevels, (accesslevel) => {
        if (colloborator.permission === accesslevel.value) {
          colloborator.accesslevel = accesslevel.type;
          colloborator.accesslevelValue = accesslevel.value;
          colloborator.collabMail = colloborator.emailId;
        } else if (colloborator.permission === "owner") {
          colloborator.accesslevel = "Owner";
          colloborator.accesslevelValue = "owner";
        }
      });
    });

    this.collabSource = new LocalDataSource(this.collaboratorsArray);
  }

  /**
   *
   * @description validation for email
   */
  private startsWithAt(control: FormControl) {
    const pattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (pattern.test(control.value) === false) {
      return {
        "startsWithAt@": true,
      };
    }
    return null;
  }

  /**
   * @description returns the data when the model is closed
   */
  closeModel() {
    const collaborators = [];
    this.collaboratorsArray.forEach((element) => {
      collaborators.push({
        emailId: element.emailId,
        permission: element.permission,
        user: element.user && element.user.id ? element.user.id : element.user,
        user_action:
          element.permission !== "owner"
            ? this.globals.accessLevels.find(
                (access) => access.value === element.permission
              ).status
            : null,
        message: element.message,
      });
    });
    if (this.action) {
      this.passData.emit(this.collaboratorsArray);
    } else {
      for (let index = 0; index < collaborators.length; index++) {
        if (collaborators[index].user === undefined) {
          collaborators[index]["email"] = collaborators[index]["emailId"];
          delete collaborators[index].emailId;
          delete collaborators[index].message;
          delete collaborators[index].user;
          delete collaborators[index].user_action;
          this.secUnregistered.push(collaborators[index]);
        } else {
          this.secRegistered.push(collaborators[index]);
        }
      }
      this.passData.emit({
        registered: this.secRegistered,
        unregistered: this.secUnregistered,
      });
    }
    this.activeModal.close("closed");
  }

  /**
   *
   * @param item consists of email entered in form
   * @description checks whether the user is registered or not and checks for duplicate email
   */
  async emailCheck(item) {
    this.isLoading = true;
    // checks whether mail already present in collaborators mail or not
    const duplicationCheck = this.collaboratorsArray.some(
      (collaborator) =>
        item.value === collaborator.collabMail ||
        item.value === localStorage.getItem(this.globals.GC_USER_EMAIL)
    );
    item.duplicateEmail = duplicationCheck;

    this.duplicateEmail = this.validationForm.value.collabMail.some(
      (values) => values.duplicateEmail
    );

    // removes the owner of the document from the list.
    if (
      (this.docDetail &&
        this.docDetail.owner &&
        item.value === this.docDetail.owner.email_id) ||
      localStorage.getItem(this.globals.GC_USER_EMAIL) === item.value
    ) {
      this.removeEmail(item);
      this.warningDialog("Sorry, can't able to share with yourself.");
    }

    // checks whether the entered mail is registered or not
    if (!item.duplicateEmail) {
      await this.apollo
        .query({
          query: this.checkUserExist,
          variables: { emailId: item.value },
          fetchPolicy: "no-cache",
        })
        .subscribe((data: any) => {
          const userInfo = data.data.checkUserExist;
          if (userInfo && userInfo.success) {
            item.user = userInfo.userId;
          }
          item.dbCheck = true;
        });
    }
  }

  disableButton() {
    if (this.validationForm.value.collabMail) {
      return !(
        this.validationForm.value.collabMail.filter((email) => email.dbCheck)
          .length === this.validationForm.value.collabMail.length
      );
    }
  }

  /**
   *
   * @param item consists of email entered in form
   * @description removes the email from the list and the duplicate msg if present
   */
  async removeEmail(item) {
    const duplicationCheck = this.collaboratorsArray.some(
      (collaborator) =>
        item.value === collaborator.collabMail ||
        item.value === localStorage.getItem(this.globals.GC_USER_EMAIL)
    );
    item.duplicateEmail = duplicationCheck;

    this.duplicateEmail =
      this.validationForm.value.collabMail &&
      this.validationForm.value.collabMail.length > 1 &&
      this.validationForm.value.collabMail.some(
        (values) => values.duplicateEmail
      );

    // removes the value from the collobarators array and in the form
    const index = this.collaboratorsArray.findIndex(
      (collab) => collab.collabMail === item.value
    );

    await this.collaboratorsArray.splice(index, 1);

    // if (this.validationForm.value.collabMail) {
    //   const index1 = this.validationForm.value.collabMail.findIndex((collab) => collab.value === item.value);
    //   this.validationForm.value.collabMail.splice(index1, 1);
    // }

    // if collabMail is empty array, assign null value.
    if (
      this.validationForm.value.collabMail &&
      !this.validationForm.value.collabMail.length
    ) {
      this.validationForm.controls.collabMail.setErrors({ required: true });
    }
    return "success";
  }

  /**
   *
   * @param item consists of email id
   * @description for unregistered user gets the confirmation
   */
  async invitationPopup(items) {
    let check;
    items = items.filter((item) => !item.user);
    let html = `<p>Would you like to send invitation to unregistered mail?</p>`;
    _.map(items, (collab) => {
      if (!collab.user) {
        html += `<span class="m-3 f-14 f-w-400" style="background-color: #eeeeee;padding: 0.44em 0.7em;border-radius: 3rem;">
          &nbsp;${collab.emailId}&nbsp;</span>`;
      }
    });
    if (items.length) {
      await Swal.fire({
        title: "Send Invitation",
        html,
        showCancelButton: true,
        confirmButtonText: "Yes",
        confirmButtonClass: "btn btn-primary",

        cancelButtonText: "No",
        cancelButtonClass: "btn btn-outline-primary",
        buttonsStyling: false,
        reverseButtons: true,
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.value) {
          check = true;
        } else {
          check = false;
        }
      });
    } else {
      check = true;
    }

    return check;
  }

  /**
   * @description action perfomed when data submitted from Form.
   */
  async onSubmit() {
    let accesslevel;

    if (
      this.validationForm.valid &&
      this.validationForm.value.collabMail.length
    ) {
      this.submitForm = false;
      _.map(this.accessLevels, (level) => {
        if (this.validationForm.value.permission === level.value) {
          accesslevel = level.type;
        }
      });

      this.validationForm.value.collabMail.forEach((element) => {
        this.newcollabMail.push({
          first_name: element.value.split("@")[0],
          collabMail: element.value,
          emailId: element.value,
          accesslevel,
          accesslevelValue: this.validationForm.value.permission,
          permission: this.validationForm.value.permission,
          user: element.user,
          message: element.message,
        });
      });

      this.validationForm.reset();

      // for new document and new section
      if (!this.action) {
        this.collaboratorsArray = this.collaboratorsArray.concat(
          ...this.newcollabMail
        );
        this.collabSource = new LocalDataSource(this.collaboratorsArray);
        const collabList = await this.collobArrayPush(this.collaboratorsArray);
        this.collabTable = false;
      } else {
        // for existing documents and section
        const sendEmail = await this.invitationPopup(this.newcollabMail);
        const unregisteredEmails = this.newcollabMail.filter(
          (email) => !email.user
        );
        const registredEmails = this.newcollabMail.filter(
          (email) => email.user
        );
        let collabList = [];

        // appends the registered emailid
        if (registredEmails.length) {
          await this.appendEmails(registredEmails);
          collabList = [];
          await registredEmails.forEach((ele) => {
            collabList.push({
              permission: ele.permission,
              user: ele.user && ele.user.id ? ele.user.id : ele.user,
              emailId:
                ele.user && ele.user.email_id ? ele.user.email_id : ele.emailId,
              user_action: ele.user_action
                ? ele.user_action
                : this.globals.accessLevels.find(
                    (access) => access.value === ele.permission
                  ).status,
              message: ele.message,
            });
          });
        }

        // if sendEmail=true, appends the unregistered email
        if (sendEmail) {
          await this.appendEmails(unregisteredEmails);
          await unregisteredEmails.forEach((ele) => {
            collabList.push({
              permission: ele.permission,
              user: ele.user && ele.user.id ? ele.user.id : ele.user,
              emailId:
                ele.user && ele.user.email_id ? ele.user.email_id : ele.emailId,
              user_action: ele.user_action
                ? ele.user_action
                : this.globals.accessLevels.find(
                    (access) => access.value === ele.permission
                  ).status,
              message: ele.message,
            });
          });
        }
        if (collabList.length) {
          await this.manageColloborators(
            collabList,
            "Add Collaborators",
            "add"
          );
        }
      }
    } else {
      this.submitForm = true;
    }
  }

  appendEmails(emailList) {
    this.collaboratorsArray = this.collaboratorsArray.concat(emailList);
    this.collabSource = new LocalDataSource(this.collaboratorsArray);
  }

  /**
   * @description push the list to the array for storing in to the database
   */
  async collobArrayPush(collabatorList) {
    const collabList = [];

    collabatorList.forEach(async (element) => {
      if (
        (this.docDetail &&
          this.docDetail.owner &&
          element.user &&
          this.docDetail.owner.email_id !== element.user.email_id) ||
        (element.user &&
          localStorage.getItem(this.globals.GC_USER_EMAIL) !==
            element.user.email_id &&
          !this.docDetail) ||
        (!element.user &&
          localStorage.getItem(this.globals.GC_USER_EMAIL) !== element.emailId)
      ) {
        await collabList.push({
          permission: element.permission,
          user:
            element.user && element.user.id ? element.user.id : element.user,
          emailId:
            element.user && element.user.email_id
              ? element.user.email_id
              : element.emailId,
          user_action: element.user_action
            ? element.user_action
            : this.globals.accessLevels.find(
                (access) => access.value === element.permission
              ).status,
          message: element.message,
        });
      }
    });

    return collabList;
  }

  /**
   *
   * @param event collaboartor info
   * @description gets confirmation before delete
   */
  deleteConfirmation(event) {
    Swal.fire({
      text: "Are you sure to delete the collaborator ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.value) {
        this.removeCollaborators(event);
      }
    });
  }

  /**
   *
   * @param event consist of collaborator to be deleted
   * @description deletes the collaborator from the list
   */
  async removeCollaborators(event) {
    const index = event.source.data.indexOf(event.data);
    event.source.data.splice(index, 1);
    event.confirm.resolve();
    this.collaboratorsArray = event.source.data;
    if (this.docDetail && this.docDetail.id) {
      const collabList = [];
      collabList.push({
        permission: event.data.permission,
        user:
          event.data.user && event.data.user.id
            ? event.data.user.id
            : event.data.user,
        emailId:
          event.data.user && event.data.user.email_id
            ? event.data.user.email_id
            : event.data.emailId,
        user_action: event.data.user_action
          ? event.data.user_action
          : this.globals.accessLevels.find(
              (access) => access.value === event.data.permission
            ).status,
        message: event.data.message,
      });
      this.manageColloborators(collabList, "Delete Collaborator", "delete");
    }
  }

  /**
   *
   * @param event consist of edited collaborator list
   * @description edits the collaborators list
   */
  async editCollaborators(event) {
    event.confirm.resolve(event.newData);
    // changes the permission value during edit
    await _.map(this.collaboratorsArray, (colloborator) => {
      if (colloborator.emailId === event.newData.emailId) {
        colloborator = event.newData;
        colloborator.permission = event.newData.accesslevelValue;
      }
    });
    if (this.docDetail && this.docDetail.id) {
      setTimeout(async () => {
        const collabList = [];
        collabList.push({
          permission: event.newData.permission,
          user:
            event.newData.user && event.newData.user.id
              ? event.newData.user.id
              : event.newData.user,
          emailId:
            event.newData.user && event.newData.user.email_id
              ? event.newData.user.email_id
              : event.newData.emailId,
          user_action: event.newData.user_action
            ? event.newData.user_action
            : this.globals.accessLevels.find(
                (access) => access.value === event.newData.permission
              ).status,
          message: event.newData.message,
        });
        this.manageColloborators(collabList, "Update Collaborator", "update");
      }, 1000);
    }
  }

  /**
   *
   * @param collablist consists of collaboratos list to update in document / section / document section list
   * @param textMsg consist of msg to show in dialog box
   */
  manageColloborators(collablist, textMsg, collabAction) {
    Swal.fire({
      title: textMsg + " is in progress",
      allowOutsideClick: false,
      onBeforeOpen: async () => {
        Swal.showLoading();
        // gets the list of unregistered email from the array.
        let unRegisteredEmailsList = [];
        let registeredEmailsList = [];
        let unregister: any = [];
        if (collablist) {
          unRegisteredEmailsList = [
            ...collablist.filter((collaborator) => !collaborator.user),
          ];
          registeredEmailsList = [
            ...collablist.filter((collaborator) => collaborator.user),
          ];
        }
        for (let index = 0; index < unRegisteredEmailsList.length; index++) {
          unRegisteredEmailsList[index]["email"] =
            unRegisteredEmailsList[index]["emailId"];
          delete unRegisteredEmailsList[index].emailId;
          delete unRegisteredEmailsList[index].message;
          delete unRegisteredEmailsList[index].user;
          delete unRegisteredEmailsList[index].user_action;
          unregister.push(unRegisteredEmailsList[index]);
        }

        // updates the collobarators for the whole document
        if (this.docDetail.type === "Document" && this.docDetail.id) {
          _.map(unregister, (collaborator) => {
            unregister.emailId = collaborator.email;
          });

          this.apollo
            .mutate({
              mutation: this.updateDocumentColloblist,
              variables: {
                documentId: this.docDetail.id,
                collabList: registeredEmailsList,
                collab_action: collabAction,
                unregisterEmails: unregister,
                userName: this.username,
                updateUser: this.id,
              },
              fetchPolicy: "no-cache",
            })
            .subscribe(
              (data: any) => {
                Swal.close();
                this.sendingInvitationToUnregisteredEmail(
                  unRegisteredEmailsList
                );
                this.collaboratorsArray = data.data.updateDocCollabList.list;
                this.shareCollab(textMsg);
                this.closeModel();
              },
              (err) => {
                console.log(err);
                this.warningDialog("Something Went Wrong.\nPlease Try again.");
              }
            );

          // updates the collobarators for the section
        } else if (this.docDetail.type === "Section" && this.docDetail.id) {
          this.apollo
            .mutate({
              mutation: this.updateSectionCollabList,
              variables: {
                sectionId: this.docDetail.id,
                collabList: registeredEmailsList,
                collab_action: collabAction,
                userName: this.username,
                unregisterEmails: unregister,
                updateUser: this.id,
              },
            })
            .subscribe(
              (data: any) => {
                Swal.close();
                this.sendingInvitationToUnregisteredEmail(
                  unRegisteredEmailsList
                );
                // this.collaboratorsArray = data.data.updateSectionCollabList.list.collab_list;
                this.shareCollab(textMsg);
                this.closeModel();
              },
              (err) => {
                console.log(err);
                this.warningDialog(
                  "Something Went Wrong, Try again after Some Time !"
                );
              }
            );

          // updates the collobarators for the section list in the document
        } else if (
          this.docDetail.type === "DocumentSection" &&
          this.docDetail.id
        ) {
          const sectionData = JSON.parse(
            JSON.stringify(this.docDetail.sectionDetails)
          );
          await _.map(sectionData, (section) => {
            if (section.id === this.docDetail.sectionid) {
              section.collab_list = collablist;
            }
            delete section.commentsId_list;
          });
          for (
            let index = 0;
            index < sectionData[0].collab_list.length;
            index++
          ) {
            if (sectionData[0].collab_list[index].user === undefined) {
              sectionData[0].collab_list[index]["email"] =
                sectionData[0].collab_list[index]["emailId"];
              delete sectionData[0].collab_list[index].emailId;
              delete sectionData[0].collab_list[index].message;
              delete sectionData[0].collab_list[index].user;
              delete sectionData[0].collab_list[index].user_action;
              this.secUnregistered.push(sectionData[0].collab_list[index]);
            } else {
              this.secRegistered.push(sectionData[0].collab_list[index]);
            }
          }
          this.apollo
            .mutate({
              mutation: this.updateDocSectionCollabList,
              variables: {
                document: {
                  id: this.docDetail.id,
                  doc_owner: this.docDetail.owner.id,
                  sections_list: sectionData,
                },
                user_action: "sec_collab",
                updatedUser: this.id,
                userName: this.username,
              },
              fetchPolicy: "no-cache",
            })
            .subscribe(
              async (data: any) => {
                Swal.close();
                data.data.updateDocument.sections_list.forEach((ele: any) => {
                  if (ele.id === this.docDetail.sectionid) {
                    this.collaboratorsArray = ele.collab_list;
                  }
                });
                this.sendingInvitationToUnregisteredEmail(
                  unRegisteredEmailsList
                );
                this.shareCollab(textMsg);
                this.closeModel();
              },
              (err) => {
                console.log(err);
                this.warningDialog(
                  "Something Went Wrong, Try again after Some Time !"
                );
              }
            );
        }
      },
    });
  }

  /**
   *
   * @param unRegisteredEmailList unregistered email list
   * @description sends the invitation to unregistered emails
   */
  sendingInvitationToUnregisteredEmail(unRegisteredEmailList) {
    unRegisteredEmailList = _.map(unRegisteredEmailList, "emailId");
    if (unRegisteredEmailList.length) {
      this.apollo
        .mutate({
          mutation: this.sendInvitationToUnregisteredEmail,
          variables: {
            emailsList: unRegisteredEmailList,
          },
          fetchPolicy: "no-cache",
        })
        .subscribe(
          () => {},
          (err) => {}
        );
    }
  }

  /**
   *
   * @param textMsg success message
   */
  async shareCollab(textMsg: any) {
    if (!this.action && !this.docDetail) {
      let unRegisteredEmailsList;
      if (this.collaboratorsArray) {
        unRegisteredEmailsList = [
          ...this.collaboratorsArray.filter(
            (collaborator) => !collaborator.user
          ),
        ];
        const sendUnregisteredEmail = await this.invitationPopup(
          unRegisteredEmailsList
        );
        if (!sendUnregisteredEmail) {
          this.collaboratorsArray = this.collaboratorsArray.filter(
            (collaborator) => collaborator.user
          );
          this.collabSource = new LocalDataSource(this.collaboratorsArray);
        }
      }
      this.closeModel();
    } else {
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
  }

  /**
   *
   * @param textMsg warning message
   */
  warningDialog(textMsg) {
    Swal.fire({
      icon: "warning",
      text: textMsg,
    });
  }
}
