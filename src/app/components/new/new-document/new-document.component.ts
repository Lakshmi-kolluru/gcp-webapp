import {
  Component,
  OnInit,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from "@angular/core";

import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { Router } from "@angular/router";
import { Globals } from "../../../globals";
import { DocumentTemplateComponent } from "../../templates/document-template/document-template.component";
import { SectionTemplateComponent } from "../../templates/section-template/section-template.component";
import { CollaboratorsComponent } from "../collaborators/collaborators.component";
import { ShareTemplatesComponent } from "../share-templates/share-templates.component";
import { DragulaService } from "ng2-dragula";

import * as _ from "lodash";

import * as Editor from "../../../../../ckeditor/ckeditor";

import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { CdkDragDrop } from "@angular/cdk/drag-drop";

const Swal = require("sweetalert2");

@Component({
  selector: "app-new-document",
  templateUrl: "./new-document.component.html",
  styleUrls: ["./new-document.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
})
export class NewDocumentComponent implements OnInit {
  @Output() toggleEvent = new EventEmitter<boolean>();

  id: any;
  public Editor = Editor;
  enable = true;
  public openToggle = false;
  visibility = "Private";
  successData: any;

  securityLevels = this.globals.securityLevels;
  editorConfig = this.globals.editorConfig;

  public documentForm: FormGroup;
  docRegistered = [];
  docUnregistered = [];
  secRegistered = [];
  secUnregistered = [];
  newSection = true;
  topButtons = false;

  private newDoc = gql`
    mutation createDocument($DocData: DocumentInput!, $userName: String!) {
      createDocument(document: $DocData, userName: $userName) {
        id
        createdAt
      }
    }
  `;

  private saveAsTemplate = gql`
    mutation createDocTemplate($docTemplate: DocTemplateInput!) {
      createDocTemplate(docTemplate: $docTemplate) {
        id
        createdAt
      }
    }
  `;
  docSecurity: any;
  username: any;
  sectionIndex: any;

  constructor(
    private fb: FormBuilder,
    private globals: Globals,
    private ngbModal: NgbModal,
    public router: Router,
    private apollo: Apollo,
    private dragulaService: DragulaService
  ) {
    dragulaService.createGroup("SECTION", {});
  }

  addSection() {
    this.sectionListArray.push(this.getsection());
    this.docSecurity = this.documentForm.value.security_level;

    this.newSection = false;
    this.topButtons = true;
  }

  // import doc from template
  importDocument() {
    this.topButtons = true;
    this.docSecurity = this.documentForm.value.security_level;
    const modalReg = this.ngbModal.open(DocumentTemplateComponent, {
      size: "lg",
    });
    modalReg.componentInstance.docDetails = this.documentForm.value;

    modalReg.result.then(
      (result) => {
        this.documentForm.value.isATemplate = true;
        const docSections = result;
        if (docSections) {
          for (let index = 0; index < docSections.length; index++) {
            const element = docSections[index];

            this.sectionListArray.push(this.getSectionWithData(element));
          }
          this.newSection = false;
        }
      },
      (response) => {
        this.newSection = true;
        this.topButtons = false;
      }
    );
  }

  importSections() {
    this.topButtons = true;
    this.docSecurity = this.documentForm.value.security_level;
    const modalReg = this.ngbModal.open(SectionTemplateComponent, {
      size: "lg",
    });
    modalReg.result.then(
      (result) => {
        if (result) {
          for (let index = 0; index < result.length; index++) {
            const element = result[index];
            this.sectionListArray.push(this.getSectionWithData(element));
          }
          this.newSection = false;
        }
      },
      (response) => {
        if (this.sectionListArray.length == 0) {
          this.newSection = true;
          this.topButtons = false;
        }
      }
    );
  }

  addNewSection() {
    this.sectionListArray.push(this.getsection());
  }

  getSection(val) {
    this.sectionIndex = val;
  }

  removeSection() {
    if (this.sectionIndex == undefined) {
      // this.sectionListArray.removeAt(this.sectionListArray.length - 1);
      Swal.fire({
        icon: "error",
        text: "Please select a section to delete",
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
    } else {
      this.sectionListArray.removeAt(this.sectionIndex);
      this.sectionIndex = undefined;
    }
    if (this.sectionListArray.length == 0) {
      this.newSection = true;
      this.topButtons = false;
    }

    //  this.sectionListArray.removeAt(this.sectionListArray.value.findIndex(sect => sect.sectionId === 1))
  }

  getSectionWithData(result) {
    const a = this.fb.group({
      sec_title: result.sec_title,
      sec_content: result.sec_content,
      security_level: result.security_level,
      collab_list: [this.fb.array([])],
    });
    return a;
  }

  get sectionListArray() {
    return <FormArray>this.documentForm.get("sections");
  }

  getsection() {
    return this.fb.group({
      sec_title: ["", Validators.required],
      security_level: ["", Validators.required],
      sec_content: [""],
      collab_list: [this.fb.array([])],
      unregisteredUsers: [],
    });
  }

  addCollabtoSections(sectionIndex) {
    const modalReg = this.ngbModal.open(CollaboratorsComponent, {
      size: "lg",
      centered: true,
      backdrop: "static",
    });

    let sectionCollabList;

    _.map(this.sectionListArray.value, (section, index) => {
      if (index === sectionIndex) {
        sectionCollabList = section.collab_list.value
          ? section.collab_list.value
          : [];
        if (sectionCollabList.length) {
          _.map(
            sectionCollabList,
            (collab) => (collab.collabMail = collab.emailId)
          );
        }
      }
    });

    modalReg.componentInstance.collaboratorsArray = sectionCollabList;
    modalReg.componentInstance.docname = this.documentForm.value.docTitle;
    modalReg.componentInstance.passData.subscribe((collaboratorsArray) => {
      _.map(this.sectionListArray.value, (section, index) => {
        if (index === sectionIndex) {
          section.collab_list.value = collaboratorsArray.registered;
          section.unregisteredUsers = collaboratorsArray.unregistered;
        }
      });
    });
  }

  addDropItem(i) {}

  onSubmit() {
    const submitDocData = this.documentForm.value;

    // Private Documents
    if (submitDocData.private === true) {
      submitDocData.collab_list = [];
      submitDocData.unregisteredUsers = [];
      submitDocData.sections.forEach((element) => {
        element.collab_list = [];
        element.unregisteredUsers = [];
        element.sec_owner = this.id;
      });
      this.createDocument(submitDocData);
    } else {
      // Public Documents
      Swal.fire({
        title: "Add Collaborators",
        html: `<br><p>Would you like to add collaborators to your new document? </p>
          <p>Any sections with no collaborators will inherit the document level collaborators . Are you okay with this?</p>`,
        showCancelButton: true,
        confirmButtonText: "Yes, add Collaborators",
        confirmButtonClass: "btn btn-primary",
        cancelButtonText: "No, I'll add Collaborators later",
        cancelButtonClass: "btn btn-outline-primary",
        buttonsStyling: false,
        reverseButtons: true,
      }).then((result) => {
        // if add collobarators is 'YES'
        if (result.value) {
          const modalReg = this.ngbModal.open(CollaboratorsComponent, {
            size: "lg",
            centered: true,
            backdrop: "static",
          });
          modalReg.componentInstance.docname = this.documentForm.value.docTitle;
          modalReg.componentInstance.passData.subscribe(
            (collaboratorsArray) => {
              this.documentForm.value.collab_list =
                collaboratorsArray.registered;
              this.documentForm.value.unregisteredUsers =
                collaboratorsArray.unregistered;
              this.createDocument(submitDocData);
            }
          );
        } else {
          this.documentForm.value.collab_list = [];
          this.documentForm.value.unregisteredUsers = [];
          this.createDocument(submitDocData);
        }
      });
    }
  }

  async createDocument(docData) {
    await _.map(docData.sections, (section) => {
      section.collab_list = section.collab_list.value
        ? section.collab_list.value
        : this.documentForm.value.collab_list;
      section.sec_owner = this.id;
      section.isPrivate = docData.private;
    });
    Swal.fire({
      title: "Document creation is in progress",
      onBeforeOpen: () => {
        Swal.showLoading();
        this.apollo
          .mutate({
            mutation: this.newDoc,
            variables: {
              DocData: {
                doc_title: docData.docTitle,
                doc_owner: this.id,
                isPrivate: docData.private,
                security_level: docData.security_level,
                sections_list: docData.sections,
                collab_list: docData.collab_list,
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
                Swal.close();
                this.successDialog("Document Created Successfully");
                this.documentForm.reset();
                this.documentForm.setControl("sections", this.fb.array([]));
                this.newSection = true;
                this.topButtons = false;
                this.enable = true;
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
  saveTemplate() {
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
            this.saveTemplateQuery(sharedMails);
          }
        });
      } else {
        Swal.fire({
          title: "Creating Document Template is in progress",
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
            const mails = [{ register: [], unregister: [] }];
            this.saveTemplateQuery(mails);
          },
        });
      }
    });
  }
  saveTemplateQuery(sharedMails) {
    var result = sharedMails.slice(0, -1).map((item) => ({ item }));
    Swal.fire({
      title: "Creating Document Template is in progress",
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        const submitDocData = JSON.parse(
          JSON.stringify(this.documentForm.value)
        );
        submitDocData.sections = submitDocData.sections.map((item) => {
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
            mutation: this.saveAsTemplate,
            variables: {
              docTemplate: {
                doc_template_title: submitDocData.docTitle,
                doc_template_owner: this.id,
                docTemp_isPrivate: submitDocData.private,
                docTemp_security_level: submitDocData.security_level,
                sections_template_list: submitDocData.sections,
                shared_users: sharedMails[0].register,
                unregisteredUsers: sharedMails[0].unregister,
              },
            },
          })
          .subscribe(
            (res: any) => {
              const result1 = res.data;
              if (result1) {
                Swal.close();
                this.documentForm.reset();
                this.documentForm.setControl("sections", this.fb.array([]));
                this.newSection = true;
                this.topButtons = false;
                this.enable = true;
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

  ngOnInit() {
    this.id = localStorage["graphcool-user-id"];
    this.username = localStorage["graphcool-username"];
    this.documentForm = this.fb.group({
      docTitle: [
        "",
        [Validators.required, Validators.pattern("^[0-9a-zA-Z ]+$")],
      ],
      security_level: ["", Validators.required],
      private: ["", Validators.required],
      sections: this.fb.array([]),
      collab_list: [],
      unregisteredUsers: [],
      isATemplate: ["false"],
    });
  }
}
