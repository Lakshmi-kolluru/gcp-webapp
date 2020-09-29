import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter,
  OnChanges,
} from "@angular/core";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import * as Editor from "../../../../../ckeditor/ckeditor";

import { Router } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from "@angular/forms";
import {
  NgbActiveModal,
  NgbModal,
  ModalDismissReasons,
  NgbModalConfig,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { CollaboratorsComponent } from "../collaborators/collaborators.component";
import { Globals } from "../../../globals";

import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import * as _ from "lodash";
import { ShareTemplatesComponent } from "../share-templates/share-templates.component";

declare let $: any;

declare var require;
const Swal = require("sweetalert2");

@Component({
  selector: "app-new-sections",
  templateUrl: "./new-sections.component.html",
  styleUrls: ["./new-sections.component.scss"],
})
export class NewSectionsComponent implements OnInit, OnChanges {
  @Output() toggleEvent = new EventEmitter<boolean>();

  visibility = "Private";
  public Editor = Editor;

  securityLevels = this.globals.securityLevels;
  editorConfig = this.globals.editorConfig;
  topButtons: boolean = false;
  bottomButtons: boolean = true;
  checked: boolean = true;
  enable: boolean = true;
  public openToggle: boolean = false;

  public validationForm: FormGroup;
  id: any;
  username: any;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private ngbModal: NgbModal,
    private globals: Globals,
    private apollo: Apollo
  ) {}

  private newSection = gql`
    mutation createSections($section: SectionInput!, $userName: String!) {
      createSections(section: $section, userName: $userName) {
        id
      }
    }
  `;
  private saveTemplate = gql`
    mutation createTemplateSection($templateSection: TemplateSectionInput!) {
      createTemplateSection(templateSection: $templateSection) {
        id
      }
    }
  `;

  /*  //privacy level
  switchToggle(event) {
    this.openToggle = !this.openToggle;
    this.toggleEvent.emit(this.openToggle);
    if (event.target.checked) {
      this.visibility = "Private";
    } else {
      this.visibility = "Public";
    }
  } */
  switchToggle() {
    const visibleValues = this.validationForm.value.sections;

    for (let i = 0; i < visibleValues.length; i++) {
      if (visibleValues[i].private == true) {
        this.visibility = "Private";
        visibleValues[i].visibility = "Private";
      } else if (visibleValues[i].private == false) {
        this.visibility = "Public";
        visibleValues[i].visibility = "Public";
      }
    }
  }

  get sectionListArray() {
    return <FormArray>this.validationForm.get("sections");
  }

  getsection() {
    return this.fb.group({
      sectionTitle: [
        "",
        [Validators.required, Validators.pattern("^[0-9a-zA-Z ]+$")],
      ],
      securityLevel: ["", Validators.required],
      private: [true, Validators.required],
      // toggle: [true, Validators.required],
      sectionContent: ["" /* , Validators.required */],
      collab_list: [this.fb.array([])],
      unregistered: [this.fb.array([])],
      visibility: ["Private"],
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
    modalReg.componentInstance.docname = this.validationForm.value.docTitle;
    modalReg.componentInstance.passData.subscribe((collaboratorsArray) => {
      _.map(this.sectionListArray.value, (section, index) => {
        if (index === sectionIndex) {
          section.collab_list.value = collaboratorsArray.registered;
          section.unregistered.value = collaboratorsArray.unregistered;
        }
      });
    });
  }

  onSubmit() {
    const formValues = this.validationForm.value.sections;
    for (let i = 0; i < formValues.length; i++) {
      if (formValues[i].private.value === true) {
        formValues[i].collab_list.value = [];
        formValues[i].unregistered.value;
      }
      this.createSection(formValues[i]);
    }
  }

  createSection(secData) {
    this.apollo
      .mutate({
        mutation: this.newSection,
        variables: {
          section: {
            sec_title: secData.sectionTitle,
            sec_content: secData.sectionContent,
            sec_owner: this.id,
            security_level: secData.securityLevel,
            isPrivate: secData.private,
            collab_list: secData.collab_list.value,
            unregisteredUsers: secData.unregistered.value,
            updateUser: this.id,
          },
          userName: this.username,
        },
      })
      .subscribe(
        ({ data }) => {
          this.validationForm.reset();
          this.validationForm.setControl(
            "sections",
            this.fb.array([this.getsection()])
          );
          this.enable = true;
          Swal.fire({
            icon: "success",
            text: "Your section/sections has been created.",
            timer: 2000,
            onOpen: () => {
              Swal.showLoading();
            },
          }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
            }
          });
        },
        (err) => {}
      );
  }

  saveAsTemplate() {
    const formValues = this.validationForm.value.sections;
    for (let i = 0; i < formValues.length; i++) {
      const tempData = formValues[i];
      //modalRef.componentInstance.user = this.user;
      Swal.fire({
        title: "Save as Template",
        html:
          "<br><p>Mutliple Sections will be Stored as a Template at the same time and cannot add collaborators, but would you like save the first section as Template and share with others?</>",
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
              tempData["register"] = sharedMails[0]["register"];
              tempData["unregister"] = sharedMails[0]["unregister"];

              this.saveTemplateQuery(tempData);
            }
          });
        } else {
          tempData["register"] = [];
          tempData["unregister"] = [];

          this.saveTemplateQuery(tempData);
        }
        // else {
        //   this.onSubmit();
        // }
      });
    }
  }

  saveTemplateQuery(sectionTemp) {
    Swal.fire({
      title: "Creating Section Template is in progress",
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        this.apollo
          .mutate({
            mutation: this.saveTemplate,
            variables: {
              templateSection: {
                template_title: sectionTemp["sectionTitle"],
                template_content: sectionTemp["sectionContent"],
                template_security_level: sectionTemp["securityLevel"],
                template_isPrivate: sectionTemp["private"],
                template_owner: this.id,
                shared_users: sectionTemp["register"],
                unregisteredUsers: sectionTemp["unregister"],
              },
            },
          })
          .subscribe(
            ({ data }) => {
              this.validationForm.reset();
              this.validationForm.setControl(
                "sections",
                this.fb.array([this.getsection()])
              );
              this.enable = true;
              Swal.fire({
                icon: "success",
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

  ngOnInit() {
    this.id = localStorage["graphcool-user-id"];
    this.username = localStorage["graphcool-username"];
    this.enable = true;
    this.validationForm = this.fb.group({
      sections: this.fb.array([]),
    });
    this.sectionListArray.push(this.getsection());
  }

  addNewSection() {
    this.sectionListArray.push(this.getsection());
  }
  onValueChange(event, i) {
    if (event) {
      this.sectionListArray.value[i].visibility = "Public";
    }
  }
  ngOnChanges() {}
}
