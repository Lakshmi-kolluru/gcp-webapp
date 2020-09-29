import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import { Globals } from "src/app/globals";
import * as Editor from "../../../../../ckeditor/ckeditor";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { ShareTemplatesComponent } from "../../new/share-templates/share-templates.component";
import { NgbModal, NgbAccordion } from "@ng-bootstrap/ng-bootstrap";

declare var $: any;

const Swal = require("sweetalert2");

interface Sections {
  template_title: string;
  template_content: string;
  isEditable?: boolean;
  security_level?: string;
  isPrivate?: boolean;
}

interface Users {
  id?: string;
  email_id: string;
  first_name?: string;
  last_name?: string;
}
interface CollobaratorsList {
  collabMail?: string;
  user: Users;
}

@Component({
  selector: "app-document-template-preview",
  templateUrl: "./document-template-preview.component.html",
  styleUrls: ["./document-template-preview.component.scss"],
})
export class DocumentTemplatePreviewComponent implements OnInit {
  private getDocTemplate = gql`
    query getDocTemplateById($docTemplateId: ID!) {
      getDocTemplateById(docTemplateId: $docTemplateId) {
        id
        doc_template_title
        doc_template_owner {
          id
          email_id
        }
        sections_template_list {
          id
          template_title
          template_content
          template_owner {
            id
            email_id
          }
          template_security_level
        }
        docTemp_security_level
        docTemp_isPrivate
        createdAt
        updateAt
        shared_users {
          id
          first_name
          last_name
        }
        unregisteredUsers
      }
    }
  `;

  private updateDocumentTemplate = gql`
    mutation updateDocTemplate($docTemplate: DocTemplateInput) {
      updateDocTemplate(docTemplate: $docTemplate) {
        id
        doc_template_title
        doc_template_owner {
          id
          email_id
        }
        sections_template_list {
          id
          template_title
          template_content
          template_owner {
            id
            email_id
          }
          template_security_level
        }
        docTemp_security_level
        docTemp_isPrivate
        createdAt
        updateAt
      }
    }
  `;

  singleDocumentData: any; // consists of single document/section/contract data
  documentForm: FormGroup;

  hideExpand: boolean;

  isEditable: boolean;
  editTitle: boolean;
  shared_users: any;
  editorConfig = this.globals.editorConfig;
  securityLevels = this.globals.securityLevels;
  public Editor = Editor;
  loginUserId: any;

  constructor(
    private globals: Globals,
    private ngbModal: NgbModal,
    private formBuilder: FormBuilder,
    public route: ActivatedRoute,
    public router: Router,
    public apollo: Apollo
  ) {}

  ngOnInit(): void {
    this.loginUserId = localStorage.getItem(this.globals.GC_USER_ID);
    // gets the documents id from the params
    this.route.queryParams.subscribe((params) => {
      if (params.name) {
        this.getDocumentData(params.name);
      }
    });
  }

  /**
   *
   * @param documentId consists of documentid
   * @description gets the single document data
   */
  getDocumentData(docTemplateId) {
    this.apollo
      .query({
        query: this.getDocTemplate,
        variables: { docTemplateId },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        async (data: any) => {
          this.singleDocumentData = JSON.parse(
            JSON.stringify(data.data.getDocTemplateById)
          );
          // adds section to formArray
          this.createForm(this.singleDocumentData);
        },
        (error) => {}
      );
  }
  createForm(documentData) {
    this.documentForm = this.formBuilder.group({
      doc_template_title: documentData.doc_template_title,
      docTemp_isPrivate: documentData.docTemp_isPrivate,
      docTemp_security_level: documentData.docTemp_security_level,
      sectionDetails: this.formBuilder.array(this.getSection()),
    });
  }
  /**
   * @description sets the section data to the formArray
   */
  getSection() {
    this.isEditable = this.singleDocumentData.sections_template_list.some(
      (section) => section.isEditable
    );

    return this.singleDocumentData.sections_template_list.map((x) =>
      this.formBuilder.group({
        template_title: [x.template_title, Validators.required],
        template_content: [x.template_content, Validators.required],
      })
    );
  }

  /**
   * @description navigates back to the single document page
   */
  back() {
    if (this.singleDocumentData.doc_template_owner.id === this.loginUserId) {
      this.router.navigate(["/mainPage/templates/created"], {
        relativeTo: this.route,
      });
    } else
      this.router.navigate(["/mainPage/templates/collaborate"], {
        relativeTo: this.route,
      });
  }

  cancelEdit() {
    _.map(
      this.singleDocumentData.sections_template_list,
      (section) => (section.isEditable = false)
    );
    this.isEditable = false;
  }

  /**
   *
   * @param documentForm consists of document data
   * @description updates the document
   */
  updateTitle() {
    const title = this.documentForm.value.doc_template_title
      ? this.documentForm.value.doc_template_title
      : this.singleDocumentData.doc_template_title;
    const security = this.documentForm.value.docTemp_security_level
      ? this.documentForm.value.docTemp_security_level
      : this.singleDocumentData.docTemp_security_level;
    const visibility = this.documentForm.value.docTemp_isPrivate
      ? this.documentForm.value.docTemp_isPrivate
      : this.singleDocumentData.docTemp_isPrivate;

    this.apollo
      .mutate({
        mutation: this.updateDocumentTemplate,
        variables: {
          docTemplate: {
            id: this.singleDocumentData.id,
            doc_template_title: title,
            docTemp_isPrivate: this.documentForm.value.docTemp_isPrivate,
            docTemp_security_level: security,
            doc_template_owner: this.singleDocumentData.doc_template_owner.id,
          },
        },
      })
      .subscribe(
        (data: any) => {
          Swal.close();
          const updatedData = JSON.parse(
            JSON.stringify(data.data.updateDocTemplate)
          );
          this.getDocumentData(updatedData.id);
          Swal.fire({
            icon: "success",
            text: "Document Template Updated Successfully",
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
        },
        (err) => {
          Swal.close();
          Swal.fire({
            icon: "error",
            text: "Something Went Wrong",
          });
        }
      );
    this.isEditable = false;
    this.editTitle = false;
  }

  updateDocTemplate(documentForm) {
    Swal.fire({
      title: "Document Template Update is Inprogress",
      allowOutsideClick: false,
      onBeforeOpen: async () => {
        Swal.showLoading();
        const sectionsList = [];
        await _.map(
          this.singleDocumentData.sections_template_list,
          async (section, index) => {
            await _.map(
              this.documentForm.value.sectionDetails,
              (updatedSectionDetails, index1) => {
                updatedSectionDetails = JSON.parse(
                  JSON.stringify(updatedSectionDetails)
                );
                // checks both the index is same or not and the push the value
                if (index === index1) {
                  sectionsList.push({
                    template_content: updatedSectionDetails.template_content,
                    id: section.id,
                    template_title: section.template_title,
                    template_isPrivate: section.template_isPrivate,
                    template_security_level: section.template_security_level,
                    template_owner:
                      section.template_owner && section.template_owner.id
                        ? section.template_owner.id
                        : "",
                  });
                }
                section.isEditable = false;
              }
            );
            this.isEditable = false;
          }
        );
        await this.apollo
          .mutate({
            mutation: this.updateDocumentTemplate,
            variables: {
              docTemplate: {
                id: this.singleDocumentData.id,
                doc_template_owner: this.singleDocumentData.doc_template_owner
                  .id,
                sections_template_list: sectionsList,
              },
            },
          })
          .subscribe(
            (data: any) => {
              Swal.close();
              const updatedData = JSON.parse(
                JSON.stringify(data.data.updateDocTemplate)
              );
              this.getDocumentData(updatedData.id);
              Swal.fire({
                icon: "success",
                text: "Document Template Updated Successfully",
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
            },
            (err) => {
              Swal.close();
              Swal.fire({
                icon: "error",
                text: "Something Went Wrong",
              });
            }
          );
      },
    });
  }
}
