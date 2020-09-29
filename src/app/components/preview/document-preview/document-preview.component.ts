import {
  Component,
  OnInit,
  ElementRef,
  ViewChildren,
  QueryList,
  OnDestroy,
  ViewChild,
  Input,
} from "@angular/core";
import * as _ from "lodash";
import { Globals } from "src/app/globals";
import * as Editor from "../../../../../ckeditor/ckeditor";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { CollaboratorsComponent } from "../../new/collaborators/collaborators.component";
import { NgbModal, NgbAccordion } from "@ng-bootstrap/ng-bootstrap";

import { ActivatedRoute, Router } from "@angular/router";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { CommentsService } from "src/app/services/comments.service";

declare var $: any;

const Swal = require("sweetalert2");

interface SelectionRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Comments {
  left: number;
  top: number;
  width: number;
  height: number;
  documentTitle: any;
  created_at: Date;
  showComment: boolean; // closes or open commentbox on click
  hide?: boolean; // for close or open for accordation panel
}

interface Sections {
  sec_title: string;
  sec_content: string;
  isEditable?: boolean;
  security_level?: string;
  isPrivate?: boolean;
  collab_list: CollobaratorsList[];
}

interface CollobaratorsList {
  collabMail?: string;
  permission: string;
  user_action?: string;
  user: Users;
}

interface Users {
  id?: string;
  email_id: string;
  first_name?: string;
  last_name?: string;
}

@Component({
  selector: "app-document-preview",
  templateUrl: "./document-preview.component.html",
  styleUrls: ["./document-preview.component.scss"],
})
export class DocumentPreviewComponent implements OnInit, OnDestroy {
  @ViewChildren("linkRef") printSectionRef: QueryList<ElementRef>;
  @ViewChild("acc", { static: false }) accordionComponent: NgbAccordion;
  private getDoc = gql`
    query getDocumentById($documentId: ID!) {
      getDocumentById(documentId: $documentId) {
        id
        doc_title
        doc_owner {
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
        unregisteredUsers {
          email
          permission
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
          commentsId_list {
            id
            createdAt
            comment_content
            sectionContent
            commented_user {
              id
              first_name
              last_name
            }
            reply_list {
              reply_content
              createdAt
              reply_user {
                id
                first_name
                last_name
              }
            }
          }
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
  `;

  private updateDoc = gql`
    mutation updateDocument(
      $document: DocumentInput
      $user_action: String
      $updatedUser: ID
      $userName: String
    ) {
      updateDocument(
        document: $document
        user_action: $user_action
        updatedUser: $updatedUser
        userName: $userName
      ) {
        id
        doc_title
        doc_owner {
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
  `;
  // updates only the document collabarator list
  private updateDocumentColloblist = gql`
    mutation updateDocCollabList(
      $documentId: ID
      $collabList: [CollabListInput]
      $collab_action: String
    ) {
      updateDocCollabList(
        documentId: $documentId
        collabList: $collabList
        collab_action: $collab_action
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
      }
    }
  `;

  singleDocumentData: any; // consists of single document/section/contract data
  documentForm: FormGroup;
  elementRef: ElementRef;

  cmtHeight: any;
  commentsSelected: any = []; // consists of selected comments

  hideExpand: boolean;

  isEditable: boolean;
  editTitle: boolean;
  hideEditButton: boolean;
  collaboratorStatus: string;
  isCommentsThere: boolean;
  // tslint:disable-next-line:variable-name
  collab_list: CollobaratorsList[];
  isOpenedPanelId: any[];
  parentPage: any;

  editorConfig = this.globals.editorConfig;
  securityLevels = this.globals.securityLevels;
  public Editor = Editor;
  loginUserId: any;
  username: any;
  unregisteredUsers: any;

  constructor(
    elementRef: ElementRef,
    private ngbModal: NgbModal,
    private globals: Globals,
    private formBuilder: FormBuilder,
    public route: ActivatedRoute,
    public router: Router,
    public apollo: Apollo,
    public commentService: CommentsService
  ) {
    this.elementRef = elementRef;
  }

  ngOnInit(): void {
    this.loginUserId = localStorage.getItem(this.globals.GC_USER_ID);
    this.username = localStorage["graphcool-username"];
    this.commentService.commentsData.subscribe((commentsList) => {
      this.commentsSelected = commentsList;
    });

    // gets the documents id from the params
    this.route.queryParams.subscribe((params) => {
      if (params.name) {
        this.getDocumentData(params.name);
      }
      this.parentPage = params.page;
    });
  }
  /**
   *
   * @param documentId consists of documentid
   * @description gets the single document data
   */
  getDocumentData(documentId) {
    this.apollo
      .query({
        query: this.getDoc,
        variables: { documentId },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        async (data: any) => {
          this.singleDocumentData = JSON.parse(
            JSON.stringify(data.data.getDocumentById)
          );
          await this.mapAccessLevel(this.singleDocumentData);
          await this.collaboratorListCheck();
        },
        (error) => {}
      );
  }

  /**
   *
   * @param documentDetails consists of document details
   * @description maps the acesslevel definition to the logined user.
   */
  mapAccessLevel(documentDetails) {
    // checking whether is owner of the document
    if (
      documentDetails.doc_owner &&
      this.loginUserId === documentDetails.doc_owner.id
    ) {
      documentDetails.access = "owner";
      documentDetails.accesslevel = "owner";
    }

    // getting the users accessiblility level
    const collaboratorDetail = documentDetails.collab_list.find(
      (collaborator) =>
        collaborator.user && collaborator.user.id === this.loginUserId
    );

    if (collaboratorDetail) {
      documentDetails.accesslevel = collaboratorDetail.permission;
      if (documentDetails.accesslevel === "owner") {
        documentDetails.access = "owner";
      } else if (documentDetails.accesslevel === "coowner") {
        documentDetails.access = "co-owner";
      } else if (documentDetails.accesslevel === "approve") {
        documentDetails.access = "can approve";
      } else if (documentDetails.accesslevel === "approveEdit") {
        documentDetails.access =
          'can edit &nbsp;<i class="icon-pencil-alt"></i>&nbsp; and apporve';
      } else if (documentDetails.accesslevel === "comment") {
        documentDetails.access = "can comment";
      } else if (documentDetails.accesslevel === "edit") {
        documentDetails.access =
          'can edit &nbsp; <i class="icon-pencil-alt"></i>';
      } else if (documentDetails.accesslevel === "view") {
        documentDetails.access =
          'view only &nbsp; <i class="icon-eye" title="Preview"></i>';
      }
    }
  }

  /**
   * @description checks the users action in the document
   */
  collaboratorListCheck() {
    this.collab_list = this.singleDocumentData.collab_list;
    this.unregisteredUsers = this.singleDocumentData.unregisteredUsers;
    this.documentForm = this.formBuilder.group({
      doc_title: this.singleDocumentData.doc_title,
      security_level: this.singleDocumentData.sec_content,
      isPrivate: this.singleDocumentData.isPrivate,
      sectionDetails: this.formBuilder.array(this.getSection()),
    });

    // checking whether logined user present in the collobarator list
    _.map(this.collab_list, (collaborator) => {
      if (collaborator.user && this.loginUserId === collaborator.user.id) {
        collaborator.user.first_name = "me";
        collaborator.user.last_name = null;
        collaborator.user.email_id = "me";
        this.collaboratorStatus = collaborator.user_action;
      }
    });

    // checking whether to edit options is avaliable or not.
    this.hideEditButton = this.singleDocumentData.collab_list.some(
      (data) =>
        data.user_action === "Rejected" || data.user_action === "Approved"
    );

    this.infoDialog();
  }

  /**
   * @description consists of the information to be displayed when pages renders.
   */
  infoDialog() {
    const info =
      this.collaboratorStatus === "Approved"
        ? "Document Approval Completed."
        : this.collaboratorStatus === "Rejected"
        ? "Document has been Rejected."
        : this.singleDocumentData &&
          (this.singleDocumentData.accesslevel === "coowner" ||
            this.singleDocumentData.accesslevel === "approveEdit" ||
            this.singleDocumentData.accesslevel === "edit" ||
            this.singleDocumentData.accesslevel === "owner") &&
          this.hideEditButton &&
          !this.singleDocumentData.isPrivate
        ? " Can't edit, approved by one or more users. "
        : null;
    if (info) {
      Swal.fire({
        icon: "info",
        html: "<h6>" + info + "</h6>",
        confirmButtonText: "Ok",
        confirmButtonClass: "btn btn-primary",
        buttonsStyling: false,
        reverseButtons: true,
        width: "400px",
        allowOutsideClick: false,
      });
    }
  }

  /**
   * @description sets the section data to the formArray
   */
  getSection() {
    this.isEditable = this.singleDocumentData.sections_list.some(
      (section) => section.isEditable
    );
    return this.singleDocumentData.sections_list.map((x) =>
      this.formBuilder.group({
        sec_title: [x.sec_title, Validators.required],
        sec_content: [x.sec_content, Validators.required],
      })
    );
  }

  /**
   * @description navigates back to the single document page
   */
  back() {
    if (this.singleDocumentData.accesslevel === "owner") {
      this.router.navigate(["/mainPage/documents/created"], {
        relativeTo: this.route,
      });
      /*  if(this.parentPage == 'dashboard'){
         this.router.navigate(['/mainPage'], { relativeTo: this.route });
      } */
    } else if (this.singleDocumentData.accesslevel !== "owner") {
      this.router.navigate(["/mainPage/documents/collaborate"], {
        relativeTo: this.route,
      });
    }
  }

  /**
   * @description closes the edit option for the document
   */
  cancelEdit() {
    _.map(
      this.singleDocumentData.sections_list,
      (section) => (section.isEditable = false)
    );
    this.isEditable = false;
  }

  updateTitle() {
    const title = this.documentForm.value.doc_title
      ? this.documentForm.value.doc_title
      : this.singleDocumentData.doc_title;
    const security = this.documentForm.value.security_level
      ? this.documentForm.value.security_level
      : this.singleDocumentData.security_level;
    this.apollo
      .mutate({
        mutation: this.updateDoc,
        variables: {
          document: {
            id: this.singleDocumentData.id,
            doc_title: title,
            isPrivate: this.documentForm.value.isPrivate,
            security_level: security,
            doc_owner: this.singleDocumentData.doc_owner.id,
          },
          user_action: "Update Sections",
          userName: this.username,
          updatedUser: this.loginUserId,
        },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        (data: any) => {
          Swal.close();
          this.singleDocumentData = JSON.parse(
            JSON.stringify(data.data.updateDocument)
          );
          this.mapAccessLevel(this.singleDocumentData);
          this.collaboratorListCheck();
          this.successDialog("Document Updated Successfully");
        },
        (err) => {
          Swal.close();
          this.errorDialog();
        }
      );
    this.isEditable = false;
    this.editTitle = false;
  }

  /**
   *
   * @param documentForm consists of document data
   * @description updates the document
   */
  async updateDocument(documentForm) {
    if (documentForm.valid) {
      const sectionsList = [];
      await _.map(
        this.singleDocumentData.sections_list,
        async (section, index) => {
          const secCollabList = [];
          await _.map(section.collab_list, (collab) => {
            secCollabList.push({
              message: collab.message,
              user_action: collab.user_action,
              user: collab.user && collab.user.id ? collab.user.id : null,
              emailId: collab.emailId,
              permission: collab.permission,
            });
          });
          await _.map(
            this.documentForm.value.sectionDetails,
            (updatedSectionDetails, index1) => {
              updatedSectionDetails = JSON.parse(
                JSON.stringify(updatedSectionDetails)
              );
              // checks both the index is same or not and the push the value
              if (index === index1) {
                sectionsList.push({
                  sec_content: updatedSectionDetails.sec_content,
                  id: section.id,
                  sec_title: section.sec_title,
                  isPrivate: section.isPrivate,
                  security_level: section.security_level,
                  sec_owner:
                    section.sec_owner && section.sec_owner.id
                      ? section.sec_owner.id
                      : "",
                  collab_list: secCollabList,
                });
              }
              section.isEditable = false;
            }
          );
          this.isEditable = false;
        }
      );
      Swal.fire({
        title: "Document Updation is in progress",
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
          this.apollo
            .mutate({
              mutation: this.updateDoc,
              variables: {
                document: {
                  id: this.singleDocumentData.id,
                  doc_owner: this.singleDocumentData.doc_owner.id,
                  sections_list: sectionsList,
                },
                user_action: "Update Sections",
                userName: this.username,
                updatedUser: this.loginUserId,
              },
            })
            .subscribe(
              (data: any) => {
                Swal.close();
                this.singleDocumentData = JSON.parse(
                  JSON.stringify(data.data.updateDocument)
                );
                this.mapAccessLevel(this.singleDocumentData);
                this.collaboratorListCheck();
                this.successDialog("Document Updated Successfully");
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

  /**
   *
   * @param approvalType consists of approval type
   * @description opens the confirmation popup, whether to be approved or not?
   */
  documentApproval(approvalType) {
    Swal.fire({
      title: approvalType + " Document",
      html: "<br><p>Would you like to " + approvalType + " the document?</p>",
      showCancelButton: true,
      confirmButtonText: "Yes",
      confirmButtonClass: "btn btn-primary",

      cancelButtonText: "No",
      cancelButtonClass: "btn btn-outline-primary",
      buttonsStyling: false,
      reverseButtons: true,
    }).then(async (result) => {
      let status, collab_action;
      if (result.value) {
        if (approvalType === "Approve") {
          status = "Approved";
          collab_action = "accept";
          this.docApproval(status, collab_action, "");
        } else if (approvalType === "Reject") {
          status = "Rejected";
          collab_action = "reject";

          // gets the reason for the rejection
          const { value: message } = await Swal.fire({
            title: "Rejection Reason",
            input: "textarea",
            inputPlaceholder: "Type your message here...",
            inputAttributes: {
              "aria-label": "Type your message here",
            },
            inputValidator: (value) => {
              if (!value) {
                return "Rejection Reason is Required.";
              }
            },
            showCancelButton: true,
            allowOutsideClick: false,
          });
          if (message) {
            this.docApproval(status, collab_action, message);
          }
        }
      }
    });
  }

  /**
   *
   * @param status approval status (Approve / Reject)
   * @param rejectionReason if rejection, reason shld be sent.
   */
  async docApproval(
    status: string,
    collab_action: string,
    rejectionReason?: string
  ) {
    Swal.fire({
      title: "Document Approval is in progress",
      allowOutsideClick: false,
      onBeforeOpen: async () => {
        Swal.showLoading();
        const collabList = [];
        await this.singleDocumentData.collab_list.forEach((collab) => {
          collabList.push({
            id: collab.id,
            message: collab.message,
            emailId: collab.emailId,
            user: collab.user && collab.user.id ? collab.user.id : null,
            permission: collab.permission,
            user_action: collab.user_action,
          });
        });
        _.map(collabList, (collab) => {
          if (collab.user && collab.user === this.loginUserId) {
            collab.user_action = status;
            collab.message = rejectionReason;
          }
        });
        this.apollo
          .mutate({
            mutation: this.updateDocumentColloblist,
            variables: {
              documentId: this.singleDocumentData.id,
              collabList,
              collab_action,
            },
            fetchPolicy: "no-cache",
          })
          .subscribe(
            (data: any) => {
              Swal.close();
              this.singleDocumentData.collab_list =
                data.data.updateDocCollabList.list;
              this.collaboratorListCheck();
              // this.successDialog('Document Approval Successfully');
            },
            (err) => {
              Swal.close();
              this.errorDialog();
            }
          );
      },
    });
  }

  /**
   * @description displays all the collobarators for the whole document in dialogbox
   */
  showCollobarators() {
    _.map(this.collab_list, (collaborator) => {
      collaborator.collabMail =
        collaborator.user && collaborator.user.email_id
          ? collaborator.user.email_id
          : collaborator.emailId;
    });

    _.map(this.unregisteredUsers, (collaborator) => {
      collaborator.emailId = collaborator.email;
    });

    const registeredUsers: CollobaratorsList[] = [...this.collab_list];
    const collablist = registeredUsers.concat(this.unregisteredUsers);
    const ownerExists = collablist.some(
      (collobarator) =>
        collobarator.collabMail === this.singleDocumentData.doc_owner.email_id
    );

    if (!ownerExists) {
      collablist.push({
        collabMail:
          this.singleDocumentData.doc_owner.id === this.loginUserId
            ? "me"
            : this.singleDocumentData.doc_owner.email_id,
        permission: "owner",
        user: { email_id: this.singleDocumentData.doc_owner.email_id },
      });
    }

    const modalReg = this.ngbModal.open(CollaboratorsComponent, {
      size: "lg",
      centered: true,
      backdrop: "static",
    });
    const docDetail = {
      id: this.singleDocumentData.id,
      owner: this.singleDocumentData.doc_owner,
      type: "Document",
    };

    modalReg.componentInstance.collaboratorsArray = collablist;
    modalReg.componentInstance.docDetail = docDetail;
    modalReg.componentInstance.docname = this.singleDocumentData.doc_title;
    modalReg.componentInstance.action =
      this.singleDocumentData.accesslevel === "owner" ||
      this.singleDocumentData.accesslevel === "coowner"
        ? "up-date"
        : "view";
    modalReg.componentInstance.passData.subscribe(
      (receivedEntry: CollobaratorsList[]) => {
        this.collab_list = receivedEntry.filter(
          (colloborator) =>
            (colloborator.user &&
              colloborator.user.email_id !==
                this.singleDocumentData.doc_owner.email_id) ||
            !colloborator.user
        );
      }
    );
  }

  /**
   *
   * @param sectionDetail consists of selected section detail
   * @description displays all the collobarators for the selected section in dialogbox
   */
  showCollobaratorsBySection(sectionDetail) {
    _.map(sectionDetail.collab_list, (collaborator) => {
      collaborator.collabMail =
        collaborator.user && collaborator.user.email_id
          ? collaborator.user.email_id
          : collaborator.emailId;
    });

    const collablist: CollobaratorsList[] = [...sectionDetail.collab_list];

    const ownerExists = collablist.some(
      (collobarator) =>
        collobarator.collabMail === this.singleDocumentData.doc_owner.email_id
    );

    if (!ownerExists) {
      collablist.push({
        collabMail:
          this.singleDocumentData.doc_owner.id === this.loginUserId
            ? "me"
            : this.singleDocumentData.doc_owner.email_id,
        permission: "owner",
        user: { email_id: this.singleDocumentData.doc_owner.email_id },
      });
    }

    const modalReg = this.ngbModal.open(CollaboratorsComponent, {
      size: "lg",
      centered: true,
      backdrop: "static",
    });

    const docSectionDeatils = JSON.parse(
      JSON.stringify(this.singleDocumentData.sections_list)
    );
    docSectionDeatils.forEach((section) => {
      if (section.id !== sectionDetail.id) {
        _.map(section.collab_list, (collab) => {
          collab.user = collab.user && collab.user.id ? collab.user.id : null;
          collab.emailId = collab.emailId;
          collab.permission = collab.permission;
          collab.message = collab.message;
          collab.user_action = collab.user_action;
          delete collab.first_name;
          delete collab.collabMail;
          delete collab.accesslevel;
          delete collab.accesslevelValue;
        });
      }
      section.sec_owner =
        section.sec_owner && section.sec_owner.id ? section.sec_owner.id : null;
      delete section.isEditable;
    });

    const docDetail = {
      id: this.singleDocumentData.id,
      owner: this.singleDocumentData.doc_owner,
      sectionid: sectionDetail.id,
      type: "DocumentSection",
      docSectionName: sectionDetail.sec_title,
      sectionDetails: docSectionDeatils,
    };

    modalReg.componentInstance.collaboratorsArray = collablist;
    modalReg.componentInstance.docDetail = docDetail;
    modalReg.componentInstance.docname = this.singleDocumentData.doc_title;
    modalReg.componentInstance.action =
      this.singleDocumentData.accesslevel === "owner" ||
      this.singleDocumentData.accesslevel === "coowner"
        ? "up-date"
        : "view";
    modalReg.componentInstance.passData.subscribe(
      (receivedEntry: CollobaratorsList[]) => {
        sectionDetail.collab_list = receivedEntry.filter(
          (colloborator) =>
            (colloborator.user &&
              colloborator.user.email_id !==
                this.singleDocumentData.doc_owner.email_id) ||
            !colloborator.user
        );
      }
    );

    modalReg.result.then((value) => {
      this.getDocumentData(this.singleDocumentData.id);
    });
  }

  /**
   *
   * @param event consist of event for the accordation panel
   * @description checks whether the accordation panel is open or close
   */
  panelChange(event) {
    // event.nextstate =  false , panel is closed
    let sectionId = [...this.accordionComponent.activeIds];
    if (event.nextState) {
      sectionId.push(event.panelId);
      this.getCommentsFromSections(sectionId);
      _.map(this.commentsSelected, (comment) => {
        // closes/opens all the comments in the selected panel
        if (!event.nextState && event.panelId === comment.sectionId) {
          comment.hide = true;
        }
        if (event.nextState && event.panelId === comment.sectionId) {
          comment.hide = false;
        }
      });
    } else {
      this.commentsSelected = [];
      sectionId = sectionId.filter((section) => section !== event.panelId);
    }
    //  this.getCommentsData(sectionId, this.singleDocumentData.id);
  }

  //getSection Comments
  getCommentsFromSections(sectionId) {
    const openSection = this.singleDocumentData.sections_list.filter((i) =>
      sectionId.includes(i.id)
    );
    const docuId = this.singleDocumentData.id;
    this.commentsSelected = openSection[0].commentsId_list;
    var result = this.commentsSelected.map(function (el) {
      var o = Object.assign({}, el);
      o.oldComment = true;
      o.sectionId = el.id;
      o.documentId = docuId;
      return o;
    });
    this.commentService.getCommentsFromPreview(result);
  }
  /**
   *
   * @param sectionId sectionId
   * @param documentId consists of document id
   */
  getCommentsData(sectionId, documentId: any) {
    const commentsData = [...this.commentsSelected];
    // this.commentService.getComment(sectionId, documentId);
  }

  // ============================== Comments Starts ============================================

  highlightRange(range) {
    const newNode: any = document.createElement("span");
    newNode.setAttribute("style", "background-color: yellow;cursor: pointer");
    newNode.setAttribute("id", "comment" + this.commentsSelected.length);
    // $('span', '#' + 'comment' + this.commentsSelected.length).click(this.commentOnClick('comment' + this.commentsSelected.length));
    newNode.addEventListener(
      "click",
      this.commentOnClick("comment" + this.commentsSelected.length)
    );
    if (range && newNode) {
      range.surroundContents(newNode);
    }
  }

  removehighlight(commentsSelected, sectionContent, i) {
    const removeElement = this.commentsSelected.filter(
      (data) => !data.oldComment
    );
    removeElement.forEach((element) => {
      sectionContent = JSON.parse(JSON.stringify(sectionContent));
      const elementValue = document.getElementById(element.commentId);
      $("span", "#" + element.commentId)
        .empty()
        .remove();

      // element.parentNode.re(elementValue);
    });
  }

  async renderRectangle(event, i, sectionData?: any) {
    if (this.singleDocumentData.accesslevel !== "view") {
      const selection = document.getSelection();
      const selectionText = selection.toString();

      const range = selection.getRangeAt(0); // get the text range
      const oRect = range.getBoundingClientRect();
      const rangeContainer = this.getRangeContainer(range);
      const localRectangle: any = this.viewportToHost(oRect, rangeContainer);

      this.removehighlight(this.commentsSelected, sectionData.sec_content, i);

      // this.commentsSelected = this.commentsSelected.filter((data) => data.oldComment);

      if (selectionText.toString().length > 0) {
        localRectangle.documentId = this.singleDocumentData.id;
        localRectangle.commentId = "comment" + this.commentsSelected.length;
        localRectangle.sectionContent = selectionText;
        localRectangle.sectionId = sectionData.id;
        localRectangle.commented_user = this.loginUserId;
        localRectangle.updateUser = this.loginUserId;
        localRectangle.createdAt = new Date();
        localRectangle.updateAt = new Date();
        await this.highlightRange(range);
        this.commentsSelected.push(localRectangle);
        sectionData.sec_content = this.printSectionRef.toArray()[
          i
        ].nativeElement.innerHTML;
        // this.printSectionRef.toArray()[i].nativeElement.querySelector('button').addEventListener('click', this.onClick.bind(this));
      }
    }
  }

  private getRangeContainer(range: Range): Node {
    let container = range.commonAncestorContainer;

    // If the selected node is a Text node, climb up to an element node - in Internet
    // Explorer, the .contains() method only works with Element nodes.
    while (container.nodeType !== Node.ELEMENT_NODE) {
      container = container.parentNode;
    }
    return container;
  }

  private viewportToHost(
    viewportRectangle: SelectionRectangle,
    rangeContainer?: Node
  ): SelectionRectangle {
    const host = this.elementRef.nativeElement;
    const hostRectangle = host.getBoundingClientRect();

    const deduction: number =
      // tslint:disable-next-line:radix
      parseInt(
        window.getComputedStyle(document.querySelector("#pageStarts"))
          .marginLeft
      ) +
      // tslint:disable-next-line:radix
      parseInt(
        window.getComputedStyle(document.querySelector("#pageStarts"))
          .paddingLeft
      );

    // tslint:disable-next-line:radix
    const deduction2: number = parseInt(
      window.getComputedStyle(document.querySelector("#pageStart2")).marginLeft
    );

    const localLeft =
      viewportRectangle.left - hostRectangle.left - deduction - deduction2;
    const localTop =
      viewportRectangle.top -
      hostRectangle.top -
      document.getElementById("card-headerr").offsetHeight;

    return {
      left: localLeft,
      top: localTop,
      width: viewportRectangle.width,
      height: viewportRectangle.height,
    };
  }

  /**
   *
   * @param comment comment data
   * @description closes the comment box
   */
  closeComment(comment, closeComment) {
    if (closeComment) {
      const index = this.commentsSelected.findIndex(
        (x) =>
          x.top === comment.top &&
          x.left === comment.left &&
          x.text === comment.text &&
          !comment.oldComment
      );
      if (index >= 0) {
        this.commentsSelected.splice(index, 1);
      }
    }
  }

  commentOnClick(id, comment?: any) {
    if (comment) {
      _.map(this.commentsSelected, (c) => {
        c.clicked = false;
        if (
          comment.top === c.top &&
          comment.left === c.left &&
          comment.text === c.text
        ) {
          c.clicked = true;
        }
      });
    } else {
    }
  }

  // ============================== Comments Ends ============================================

  ngOnDestroy() {
    this.commentService.setComment();
  }
}
