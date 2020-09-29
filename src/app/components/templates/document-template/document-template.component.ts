import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from "@angular/core";
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
import { CollaboratorsComponent } from "../../new/collaborators/collaborators.component";
import { Globals } from "../../../globals";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";

declare var require;
const Swal = require("sweetalert2");

@Component({
  selector: "app-document-template",
  templateUrl: "./document-template.component.html",
  styleUrls: ["./document-template.component.scss"],
})
export class DocumentTemplateComponent implements OnInit {
  @Input() docDetails: any;
  public preview: boolean = true;
  public selectionDiv: boolean = false;
  docArray: any;
  documents = [];
  selectedSec = [];
  selectedDoc = {
    sections_template_list: [
      {
        template_title: "",
        template_content: ``,
      },
    ],

    doc_owner: " ",
    doc_title: " ",
    security_level: " ",
    isPrivate: " ",
    isATemplate: " ",
  };

  

  id: any;
  error: boolean;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    public activeModal: NgbActiveModal,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private ngbModal: NgbModal,
    private globals: Globals,
    private apollo: Apollo
  ) {}

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
    }
  `;

  useTemplate() {
    this.docArray = this.selectedDoc["sections_template_list"];
    const selectedTempSection = this.docArray.map(
      ({
        id,
        template_title: sec_title,
        template_content: sec_content,
        template_owner: sec_owner,
        template_security_level: security_level,
        template_isPrivate: isPrivate,
      }) => ({
        id,
        sec_title,
        sec_content,
        sec_owner,
        security_level,
        isPrivate,
      })
    );
    this.activeModal.close(selectedTempSection);
  }
  openDocPreview(docValue) {

    let obj = this.documents.find((obj) => obj.id == docValue);
    this.selectedDoc = obj;


    this.preview = false;
    this.selectionDiv = true;
  }
  closeDocPreview() {
    this.preview = true;
    this.selectionDiv = false;
  }
  ngOnInit(): void {
    this.id = localStorage["graphcool-user-id"];
    this.apollo
      .query({
        query: this.getDocumentTemplates,
        variables: { userId: this.id },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        this.documents = data.data.getDocTemplatesByOwner.docTemplates;
      });
  }
}
