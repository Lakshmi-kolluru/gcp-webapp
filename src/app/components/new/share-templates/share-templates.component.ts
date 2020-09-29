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
  selector: "app-share-templates",
  templateUrl: "./share-templates.component.html",
  styleUrls: ["./share-templates.component.scss"],
})
export class ShareTemplatesComponent implements OnInit {
  @Input() docDetail;
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
  check: boolean;
  registerMails = [];
  unregisterMails = [];
  collaboratorsArray = [];

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
    ) {
      updateDocCollabList(documentId: $documentId, collabList: $collabList) {
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
    mutation updateDocument($document: DocumentInput) {
      updateDocument(document: $document) {
        sections_list {
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

  // updates the section
  private updateSectionColloblist = gql`
    mutation updateSections($section: SectionInput!) {
      updateSections(section: $section) {
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

  constructor(
    private fb: FormBuilder,
    public globals: Globals,
    public activeModal: NgbActiveModal,
    public apollo: Apollo
  ) {}

  ngOnInit() {
    // form
    this.validationForm = this.fb.group({
      collabMail: ["", Validators.required],
    });
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
      this.passData.emit(collaborators);
    }
    this.activeModal.close();
  }

  /**
   *
   * @param item consists of email entered in form
   * @description checks whether the user is registered or not and checks for duplicate email
   */
  async emailCheck(item) {
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
            this.registerMails.push(userInfo.userId);
          } else if (!userInfo.success) {
            this.unregisterMails.push(item.value);
          }
          item.dbCheck = true;
        });
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
          &nbsp;${collab}&nbsp;</span>`;
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
          this.check = true;
        } else {
          this.check = false;
        }
      });
    } else {
      this.check = true;
    }
    return this.check;
  }

  /**
   * @description action perfomed when data submitted from Form.
   */
  async onSubmit() {
    if (this.unregisterMails.length) {
      let collabList = [];
      const sendEmail = await this.invitationPopup(this.unregisterMails);
      const unregisteredEmails = this.unregisterMails.filter(
        (email) => !email.user
      );
      const registredEmails = this.unregisterMails.filter(
        (email) => email.user
      );
      if (sendEmail) {
        await this.appendEmails(unregisteredEmails);
        this.sendingInvitationToUnregisteredEmail(unregisteredEmails);
      }
    } else {
      this.unregisterMails = [];
    }
    await this.appendEmails(this.registerMails);

    this.collaboratorsArray = this.collaboratorsArray.filter(
      (el, i, a) => i === a.indexOf(el)
    );
    const newObject = [
      { register: this.registerMails, unregister: this.unregisterMails },
    ];
    this.activeModal.close(newObject);
  }

  appendEmails(emailList) {
    this.collaboratorsArray = this.collaboratorsArray.concat(emailList);
    this.collabSource = new LocalDataSource(this.collaboratorsArray);
  }

  /**
   *
   * @param unRegisteredEmailList unregistered email list
   * @description sends the invitation to unregistered emails
   */
  sendingInvitationToUnregisteredEmail(unRegisteredEmailList) {
    if (unRegisteredEmailList.length) {
      this.apollo
        .mutate({
          mutation: this.sendInvitationToUnregisteredEmail,
          variables: {
            emailsList: unRegisteredEmailList,
            fetchPolicy: "no-cache",
          },
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
        title: "Success",
        text: textMsg,
        timer: 2000,
        onOpen: () => {
          // add Collaborators close Model
          Swal.showLoading();
        },
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
