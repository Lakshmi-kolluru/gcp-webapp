import {
  Component,
  OnInit,
  ElementRef,
  ViewChildren,
  QueryList,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Globals } from "../../../globals";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import * as _ from "lodash";
import { CollaboratorsComponent } from "../../new/collaborators/collaborators.component";
import * as Editor from "../../../../../ckeditor/ckeditor";
import { CommentsService } from "src/app/services/comments.service";

const Swal = require("sweetalert2");

declare var $: any;

interface SelectionRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CollobaratorsList {
  collabMail?: string;
  permission: string;
  user_action?: string;
  user: Users;
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

interface Users {
  id?: string;
  email_id: string;
  first_name?: string;
  last_name?: string;
}

@Component({
  selector: "app-section-preview",
  templateUrl: "./section-preview.component.html",
  styleUrls: ["./section-preview.component.scss"],
})
export class SectionPreviewComponent implements OnInit {
  @ViewChildren("linkRef") printSectionRef: QueryList<ElementRef>;

  private getSec = gql`
    query getSectionsById($sectionId: ID!) {
      getSectionsById(sectionId: $sectionId) {
        id
        sec_title
        security_level
        isPrivate
        unregisteredUsers {
          email
          permission
        }
        sec_owner {
          id
          first_name
          last_name
          email_id
        }
        sec_content
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
              first_name
              last_name
            }
          }
        }
      }
    }
  `;
  private updateSec = gql`
    mutation updateSections(
      $section: SectionInput
      $updateUser: ID
      $userName: String
    ) {
      updateSections(
        section: $section
        updateUser: $updateUser
        userName: $userName
      ) {
        id
        sec_title
        security_level
        isPrivate
        sec_owner {
          id
          first_name
          last_name
          email_id
        }
        sec_content
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

  private updateSectionCollabList = gql`
    mutation updateSectionCollabList(
      $sectionId: ID
      $collabList: [CollabListInput]
      $collab_action: String
      $updateUser: ID
      $userName: String
      $unregisterEmails: [unregisterEmailInfo]
    ) {
      updateSectionCollabList(
        sectionId: $sectionId
        collabList: $collabList
        collab_action: $collab_action
        updateUser: $updateUser
        unregisterEmails: $unregisterEmails
        userName: $userName
      ) {
        success
      }
    }
  `;

  private elementRef: ElementRef;
  sectionForm: FormGroup;
  isEditable: boolean;
  editTitle: boolean;

  cmtHeight: number;
  hideEditButton: boolean;
  collaboratorStatus: string;

  loginUserId: any;
  parentPage: any;
  sendSectionData = [];
  commentsSelected: any = [];
  id: any;
  sectionContent: any;

  securityLevels = this.globals.securityLevels;
  editorConfig = this.globals.editorConfig;
  public Editor = Editor;

  singleSectionData: any; // consists of single section data
  username: any;

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

  ngOnInit() {
    this.id = localStorage["graphcool-user-id"];
    this.username = localStorage["graphcool-username"];
    this.cmtHeight = $("#docCard").outerWidth();

    // gets the users loginid
    this.loginUserId = localStorage.getItem(this.globals.GC_USER_ID);

    this.sectionForm = this.formBuilder.group({
      sec_title: [""],
      sec_content: [""],
      isPrivate: [false],
      security_level: [""],
    });

    this.route.queryParams.subscribe((params) => {
      if (params.name) {
        this.getSectionData(params.name);
      }
      this.parentPage = params.page;
    });

    this.commentService.commentsData.subscribe((commentsList) => {
      if (commentsList === undefined) {
        this.commentsSelected = [];
      } else {
        this.commentsSelected = commentsList;
      }
    });
  }

  /**
   *
   * @param sectionId consists of section id
   * @description gets the whole section information based upon the section id
   */
  getSectionData(sectionId) {
    var result: any;
    this.apollo
      .query({
        query: this.getSec,
        variables: { sectionId },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        async (data: any) => {
          this.singleSectionData = data.data.getSectionsById;
          this.getCommentsFromSections(this.singleSectionData);
          this.createForm(this.singleSectionData);
          await this.mapAccessLevel(this.singleSectionData);
          await this.collaboratorList();
        },
        (error) => {}
      );
  }

  getCommentsFromSections(sectionData) {
    this.commentsSelected = sectionData.commentsId_list;
    var result = this.commentsSelected.map(function (el) {
      var o = Object.assign({}, el);
      o.oldComment = true;
      o.sectionId = el.id;
      return o;
    });
    this.commentService.getCommentsFromPreview(result);
  }

  createForm(sectionData) {
    this.sectionForm.patchValue({
      sec_title: sectionData.sec_title,
      sec_content: sectionData.sec_content,
      isPrivate: sectionData.isPrivate,
      security_level: sectionData.security_level,
    });
  }

  mapAccessLevel(sectionDetails) {
    // checking whether user is owner of the section
    if (
      sectionDetails.sec_owner &&
      this.loginUserId === sectionDetails.sec_owner.id
    ) {
      sectionDetails.access = "owner";
      sectionDetails.accesslevel = "owner";
    }

    // getting the users accessiblility level
    const collaboratorDetail = sectionDetails.collab_list.find(
      (collaborator) =>
        collaborator.user && collaborator.user.id === this.loginUserId
    );

    if (collaboratorDetail) {
      sectionDetails.accesslevel = collaboratorDetail.permission;
      if (sectionDetails.accesslevel === "owner") {
        sectionDetails.access = "owner";
      } else if (sectionDetails.accesslevel === "coowner") {
        sectionDetails.access = "co-owner";
      } else if (sectionDetails.accesslevel === "approve") {
        sectionDetails.access = "can approve";
      } else if (sectionDetails.accesslevel === "approveEdit") {
        sectionDetails.access =
          'can edit &nbsp;<i class="icon-pencil-alt"></i>&nbsp; and apporve';
      } else if (sectionDetails.accesslevel === "comment") {
        sectionDetails.access = "can comment";
      } else if (sectionDetails.accesslevel === "edit") {
        sectionDetails.access =
          'can edit &nbsp; <i class="icon-pencil-alt"></i>';
      } else if (sectionDetails.accesslevel === "view") {
        sectionDetails.access =
          'view only &nbsp; <i class="icon-eye" title="Preview"></i>';
      }
    }
  }

  collaboratorList() {
    if (this.singleSectionData.accesslevel !== "owner") {
      _.map(this.singleSectionData.collab_list, (collaborator) => {
        if (collaborator.user && this.loginUserId === collaborator.user.id) {
          collaborator.user.first_name = "me";
          collaborator.user.last_name = null;
          collaborator.user.email_id = "me";
          this.collaboratorStatus = collaborator.user_action;
        }
      });
    }

    // checking whether to show edit button or not.
    this.hideEditButton = this.singleSectionData.collab_list.some(
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
        : this.singleSectionData &&
          (this.singleSectionData.accesslevel === "coowner" ||
            this.singleSectionData.accesslevel === "approveEdit" ||
            this.singleSectionData.accesslevel === "edit" ||
            this.singleSectionData.accesslevel === "owner") &&
          this.hideEditButton &&
          !this.singleSectionData.isPrivate
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
   * @description navigates back to the section page
   */
  back() {
    if (this.singleSectionData.accesslevel === "owner") {
      this.router.navigate(["/mainPage/documents/created"], {
        relativeTo: this.route,
      });
      if (this.parentPage == "dashboard") {
        this.router.navigate(["/mainPage"], { relativeTo: this.route });
      }
    } else if (this.singleSectionData.accesslevel !== "owner") {
      this.router.navigate(["/mainPage/documents/collaborate"], {
        relativeTo: this.route,
      });
    }
  }

  updateTitle() {
    const title = this.sectionForm.value.sec_title
      ? this.sectionForm.value.sec_title
      : this.singleSectionData.sec_title;
    const security = this.sectionForm.value.security_level
      ? this.sectionForm.value.security_level
      : this.singleSectionData.security_level;
    this.apollo
      .mutate({
        mutation: this.updateSec,
        variables: {
          section: {
            id: this.singleSectionData.id,
            sec_title: title,
            security_level: security,
            isPrivate: this.sectionForm.value.isPrivate,
            updateUser: this.id,
          },
          updateUser: this.id,
          userName: this.username,
        },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        this.singleSectionData = JSON.parse(
          JSON.stringify(data.data.updateSections)
        );
        this.createForm(this.singleSectionData);
        this.collaboratorList();
        this.mapAccessLevel(this.singleSectionData);
        Swal.fire({
          icon: "success",
          text: "Section Updated Successfully",
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
    this.isEditable = false;
    this.editTitle = false;
  }

  /**
   *
   * @param sectionForm consists of section From data
   * @description updates the section
   */
  async updateSection(sectionForm) {
    if (sectionForm.valid) {
      const sec_content = this.sectionForm.value.sec_content
        ? this.sectionForm.value.sec_content
        : this.singleSectionData.sec_content;
      this.isEditable = false;
      await this.apollo
        .mutate({
          mutation: this.updateSec,
          variables: {
            section: {
              id: this.singleSectionData.id,
              sec_content: sec_content,
              updateUser: this.id,
            },
            updateUser: this.id,
            userName: this.username,
          },
        })
        .subscribe((data: any) => {
          this.singleSectionData = JSON.parse(
            JSON.stringify(data.data.updateSections)
          );
          this.createForm(this.singleSectionData);
          this.collaboratorList();
          this.mapAccessLevel(this.singleSectionData);
          Swal.fire({
            icon: "success",
            text: "Section Updated Successfully",
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

  sectionApproval(approvalType) {
    Swal.fire({
      title: approvalType + " Section",
      html: "<br><p>Would you like to " + approvalType + " the section?</p>",
      showCancelButton: true,
      allowOutsideClick: false,
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
          this.secApproval(status, "");
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
            this.secApproval(status, collab_action, message);
          }
        }
      }
    });
  }

  async secApproval(
    status: string,
    collab_action: string,
    rejectionReason?: string
  ) {
    const collabList = [];
    await this.singleSectionData.collab_list.forEach((collab) => {
      collabList.push({
        id: collab.user.id,
        message: collab.message,
        emailId: collab.emailId,
        user: collab.user && collab.user.id ? collab.user.id : "",
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
        mutation: this.updateSectionCollabList,
        variables: {
          sectionId: this.singleSectionData.id,
          collabList: collabList,
          collab_action,
          updateUser: this.id,
          userName: this.username,
          unregisterEmails: this.singleSectionData.unregisterEmails,
        },
      })
      .subscribe(
        (data: any) => {
          this.singleSectionData.collab_list = collabList;
          // this.collaboratorList();
        },
        (err) => {}
      );
  }

  /**
   * @description displays all the collobarators in dialogbox
   */
  showCollobarators() {
    _.map(this.singleSectionData.collab_list, (collaborator) => {
      collaborator.collabMail =
        collaborator.user && collaborator.user.email_id
          ? collaborator.user.email_id
          : collaborator.emailId;
    });
    _.map(this.singleSectionData.unregisteredUsers, (collaborator) => {
      collaborator.emailId = collaborator.email;
    });

    const registeredUsers: CollobaratorsList[] = [
      ...this.singleSectionData.collab_list,
    ];
    const collablist = registeredUsers.concat(
      this.singleSectionData.unregisteredUsers
    );

    const owenerExists = collablist.some(
      (collobarator) =>
        collobarator.collabMail === this.singleSectionData.sec_owner.email_id
    );

    if (!owenerExists) {
      collablist.push({
        collabMail:
          this.singleSectionData.sec_owner.id === this.loginUserId
            ? "me"
            : this.singleSectionData.sec_owner.email_id,
        permission: "owner",
        user: { email_id: this.singleSectionData.sec_owner.email_id },
      });
    }

    const modalReg = this.ngbModal.open(CollaboratorsComponent, {
      size: "lg",
      centered: true,
      backdrop: "static",
    });

    const sectionDetail = {
      id: this.singleSectionData.id,
      owner: this.singleSectionData.sec_owner,
      type: "Section",
    };

    modalReg.componentInstance.collaboratorsArray = collablist;
    modalReg.componentInstance.docDetail = sectionDetail;
    modalReg.componentInstance.docname = this.singleSectionData.sec_title;
    modalReg.componentInstance.action =
      this.singleSectionData.accesslevel === "owner" ||
      this.singleSectionData.accesslevel === "coowner"
        ? "up-date"
        : "view";
    modalReg.componentInstance.passData.subscribe((receivedEntry) => {
      this.singleSectionData.collab_list = receivedEntry.filter(
        (colloborator) =>
          (colloborator.user &&
            colloborator.user.email_id !==
              this.singleSectionData.sec_owner.email_id) ||
          !colloborator.user
      );
    });

    modalReg.result.then((value) => {
      console.log(value);
      this.getSectionData(this.singleSectionData.id);
    });
  }

  //getSection Comments

  /**
   *
   * @param sectionId sectionId
   * @param documentId consists of document id
   */

  /**
   *
   * @param sectionId sectionId
   * @param documentId consists of document id
   */
  getCommentsData(sectionId: any) {
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

  removehighlight(commentsSelected, sectionContent) {
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

  async renderRectangle(event, sectionData?: any) {
    if (this.singleSectionData.accesslevel !== "view") {
      const selection = document.getSelection();
      const selectionText = selection.toString();

      const range = selection.getRangeAt(0); // get the text range
      const oRect = range.getBoundingClientRect();
      const rangeContainer = this.getRangeContainer(range);
      const localRectangle: any = this.viewportToHost(oRect, rangeContainer);

      this.removehighlight(this.commentsSelected, sectionData.sec_content);

      // this.commentsSelected = this.commentsSelected.filter((data) => data.oldComment);

      if (selectionText.toString().length > 0) {
        localRectangle.commentId = "comment" + this.commentsSelected.length;
        localRectangle.sectionContent = selectionText;
        localRectangle.sectionId = sectionData.id;
        localRectangle.commented_user = this.loginUserId;
        localRectangle.updateUser = this.loginUserId;
        localRectangle.createdAt = new Date();
        localRectangle.updateAt = new Date();
        await this.highlightRange(range);
        this.commentsSelected.push(localRectangle);
        sectionData.sec_content = this.printSectionRef.toArray()[0].nativeElement.innerHTML;
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
      // tslint:disable-next-line: radix
      parseInt(
        window.getComputedStyle(document.querySelector("#pageStarts"))
          .marginLeft
      ) +
      // tslint:disable-next-line: radix
      parseInt(
        window.getComputedStyle(document.querySelector("#pageStarts"))
          .paddingLeft
      );

    const deduction2: number =
      // tslint:disable-next-line: radix
      parseInt(
        window.getComputedStyle(document.querySelector("#pageStart2"))
          .marginLeft
      );

    const localLeft =
      viewportRectangle.left - hostRectangle.left - deduction - deduction2;
    const localTop =
      viewportRectangle.top -
      hostRectangle.top -
      document.getElementById("card-headerr").offsetHeight;

    // let node = rangeContainer;

    // if (node) {
    //   do {
    //     localLeft += (<Element>node).scrollLeft;
    //     localTop += (<Element>node).scrollTop;
    //   } while (node !== host && node === node.parentNode);
    // }

    return {
      left: localLeft,
      top: localTop,
      width: viewportRectangle.width,
      height: viewportRectangle.height,
    };
  }

  /**
   *
   * @param comment consists of selected comment
   * @description removes the comment from the comments array.
   */
  deleteComment(comment) {
    const index = this.commentsSelected.findIndex(
      (x) =>
        x.top === comment.top &&
        x.left === comment.left &&
        x.text === comment.text
    );
    this.commentsSelected.splice(index, 1);
  }

  /**
   *
   * @param comment comment data
   * @description closes the comment box
   */
  closeComment(comment) {
    comment.edit = false;
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

  /**
   *
   * @param comment consists of new comment data
   * @description adds the new comment data
   */
  addComment(comment) {
    comment.oldComment = true;
    comment.replies = [];
  }

  commentOnClick(comment) {
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
  }

  replyComment(comment) {
    if (comment.reply) {
      comment.replies.push({
        reply_content: comment.reply,
        created_at: new Date(),
        created_by: "Alex",
      });
    }
  }

  editComment(comment) {
    comment.edit = false;
    comment.oldComment = true;
  }

  /**
   *
   * @param comment consists of comment data to resolve
   * @description resolves the selected comment
   */
  resolveComment(comment) {}

  // ============================== Comments Ends ============================================
}
