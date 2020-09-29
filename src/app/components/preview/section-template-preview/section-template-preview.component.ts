import {
  Component,
  OnInit,
  ElementRef,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Globals } from "src/app/globals";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import * as _ from "lodash";
import { CollaboratorsComponent } from "../../new/collaborators/collaborators.component";
import * as Editor from "../../../../../ckeditor/ckeditor";

const Swal = require("sweetalert2");
declare var $: any;

@Component({
  selector: "app-section-template-preview",
  templateUrl: "./section-template-preview.component.html",
  styleUrls: ["./section-template-preview.component.scss"],
})
export class SectionTemplatePreviewComponent implements OnInit {
  constructor(
    elementRef: ElementRef,
    private globals: Globals,
    private formBuilder: FormBuilder,
    public route: ActivatedRoute,
    public router: Router,
    public apollo: Apollo
  ) {
    this.elementRef = elementRef;
  }

  private elementRef: ElementRef;

  sectionForm: FormGroup;
  isEditable: boolean;
  editTitle: boolean;
  cmtHeight: number;
  showEditButton: boolean;
  collaboratorStatus: string;

  loginUserId: any;

  commentsSelected: any = [];
  securityLevels = this.globals.securityLevels;
  editorConfig = this.globals.editorConfig;
  public Editor = Editor;

  singleSectionData: any; // consists of single section data

  private getSec = gql`
    query getSectionTemplateById($sectionTemplateId: ID!) {
      getSectionTemplateById(sectionTemplateId: $sectionTemplateId) {
        id
        template_title
        template_security_level
        template_isPrivate
        template_owner {
          id
          first_name
          last_name
        }
        template_content
        shared_users {
          id
          first_name
          last_name
        }
        unregisteredUsers
      }
    }
  `;

  private updateSec = gql`
    mutation updateTemplateSections($templateSection: TemplateSectionInput) {
      updateTemplateSections(templateSection: $templateSection) {
        id
        template_title
        template_security_level
        template_isPrivate
        template_owner {
          id
          first_name
          last_name
        }
        template_content
      }
    }
  `;

  ngOnInit() {
    this.cmtHeight = $("#docCard").outerWidth();

    // gets the users loginid
    this.loginUserId = localStorage.getItem(this.globals.GC_USER_ID);

    this.sectionForm = this.formBuilder.group({
      template_title: [""],
      template_content: [""],
      template_isPrivate: [false],
      template_security_level: [""],
    });

    this.route.queryParams.subscribe((params) => {
      if (params.name) {
        this.getSectionData(params.name);
      }
    });
  }

  /**
   *
   * @param sectionId consists of section id
   * @description gets the whole section information based upon the section id
   */
  getSectionData(sectionTemplateId) {
    this.apollo
      .query({
        query: this.getSec,
        variables: { sectionTemplateId },
        fetchPolicy: "no-cache",
      })
      .subscribe(
        async (data: any) => {
          this.singleSectionData = data.data.getSectionTemplateById;
          this.createForm(this.singleSectionData);
        },
        (error) => {}
      );
  }

  createForm(sectionData) {
    this.sectionForm.patchValue({
      template_title: sectionData.template_title,
      template_content: sectionData.template_content,
      template_isPrivate: sectionData.template_isPrivate,
      template_security_level: sectionData.template_security_level,
    });
  }

  back() {
    if (this.singleSectionData.template_owner.id === this.loginUserId) {
      this.router.navigate(["/mainPage/templates/created"], {
        relativeTo: this.route,
      });
    } else if (this.singleSectionData.template_owner.id !== this.loginUserId) {
      this.router.navigate(["/mainPage/templates/collaborate"], {
        relativeTo: this.route,
      });
    }
  }

  /**
   *
   * @param sectionForm consists of section From data
   * @description updates the section
   */
  async updateSection(sectionForm) {
    const title = this.sectionForm.value.template_title
      ? this.sectionForm.value.template_title
      : this.singleSectionData.template_title;
    const security = this.sectionForm.value.template_security_level
      ? this.sectionForm.value.template_security_level
      : this.singleSectionData.template_security_level;

    if (sectionForm.valid) {
      Swal.fire({
        title: "Section Template Update is in progress",
        allowOutsideClick: false,
        onBeforeOpen: async () => {
          Swal.showLoading();
          this.isEditable = false;
          this.editTitle = false;
          this.apollo
            .mutate({
              mutation: this.updateSec,
              variables: {
                templateSection: {
                  id: this.singleSectionData.id,
                  template_title: title,
                  template_owner: this.singleSectionData.template_owner.id,
                  template_content: sectionForm.value.template_content,
                  template_isPrivate: this.sectionForm.value.template_isPrivate,
                  template_security_level: security,
                },
              },
            })
            .subscribe((data: any) => {
              const updatedData = JSON.parse(
                JSON.stringify(data.data.updateTemplateSections)
              );
              this.getSectionData(updatedData.id);
              Swal.close();
              Swal.fire({
                icon: "success",
                text: "Section Template Updated Successfully",
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
        },
      });
    }
  }
}
