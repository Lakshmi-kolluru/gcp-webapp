import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from "@angular/core";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import * as Editor from "../../../../../ckeditor/ckeditor";

import { Router } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
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

declare let $: any;

declare var require;
const Swal = require("sweetalert2");

@Component({
  selector: "app-new-contract",
  templateUrl: "./new-contract.component.html",
  styleUrls: ["./new-contract.component.scss"],
})
export class NewContractComponent implements OnInit {
  @Output() toggleEvent = new EventEmitter<boolean>();

  visibility = "Private";
  public Editor = Editor;

  securityLevels = this.globals.securityLevels;
  editorConfig = this.globals.editorConfig;

  checked: boolean = true;
  public openToggle: boolean = false;

  public validationForm: FormGroup;
  id: any;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private ngbModal: NgbModal,
    private globals: Globals,
    private apollo: Apollo
  ) {}

  private newSection = gql`
    mutation createSections($section: SectionInput!) {
      createSections(section: $section) {
        id
      }
    }
  `;

  //privacy level
  switchToggle(event) {
    this.openToggle = !this.openToggle;
    this.toggleEvent.emit(this.openToggle);
    if (event.target.checked) {
      this.visibility = "Private";
    } else {
      this.visibility = "Public";
    }
  }

  onSubmit() {
    if (this.validationForm.valid) {
      if (this.validationForm.value.private == true) {
        this.validationForm.value.collab_list = [];
        //add create Button
        this.createSection(this.validationForm.value);
      } else {
        Swal.fire({
          title: "Add Collaborators",
          html:
            "<br><p>Would you like to add collaborators to your new section?</p>",
          showCancelButton: true,
          confirmButtonText: "Yes, add Collaborators",
          confirmButtonClass: "btn btn-primary",

          cancelButtonText: "No, I'll do it later!",
          cancelButtonClass: "btn btn-outline-primary",
          buttonsStyling: false,
          reverseButtons: true,
        }).then((result) => {
          if (result.value) {
            const modalReg = this.ngbModal.open(CollaboratorsComponent, {
              size: "lg",
              centered: true,
              backdrop: "static",
            });
            modalReg.componentInstance.docname = this.validationForm.value.sectionTitle;
            modalReg.componentInstance.passData.subscribe(
              (collaboratorsArray) => {
                this.validationForm.value.collab_list = collaboratorsArray;
                //add create Button
                this.createSection(this.validationForm.value);
              }
            );
          } else if (
            // Read more about handling dismissals
            result.dismiss === Swal.DismissReason.cancel
          ) {
            this.validationForm.value.collab_list = [];
            //add create Button
            this.createSection(this.validationForm.value);
          }
        });
      }
    }
  }

  createSection(secData) {
    this.apollo
      .mutate({
        mutation: this.newSection,
        variables: {
          section: {
            sec_title: secData["sectionTitle"],
            sec_content: secData["sectionContent"],
            sec_owner: this.id,
            security_level: secData["securityLevel"],
            isPrivate: secData["private"],
            collab_list: secData["collab_list"],
          },
        },
      })
      .subscribe(
        ({ data }) => {
          this.validationForm.reset();
          this.checked = false;
          Swal.fire({
            title: "success!",
            text: "Your section has been created.",
            timer: 1000,
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

  ngOnInit() {
    this.id = localStorage["graphcool-user-id"];
    this.checked = true;
    this.validationForm = this.fb.group({
      sectionTitle: [
        "",
        [Validators.required, Validators.pattern("^[0-9a-zA-Z ]+$")],
      ],
      securityLevel: ["", Validators.required],
      private: ["", Validators.required],
      sectionContent: ["" /* , Validators.required */],
      collab_list: [],
    });
  }
}
