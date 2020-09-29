import {
  Component,
  OnInit,
  Input,
  Output,
  ViewEncapsulation,
  EventEmitter,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";

declare var require;
const Swal = require("sweetalert2");

@Component({
  selector: "app-section-template",
  templateUrl: "./section-template.component.html",
  styleUrls: ["./section-template.component.scss"],
})
export class SectionTemplateComponent implements OnInit {
  @Output() selectedSection: EventEmitter<any> = new EventEmitter();
  public previewDiv: boolean = true;
  public selectionDiv: boolean = false;
  sectionTemplate: any;
  previewButton: boolean = true;

  limitSelection = false;
  sections = [];
  selectedItems = [];
  dropdownSettings: any = {};
  id: any;
  error: boolean;

  private getSectionTemplates = gql`
    query getSectionTemplatebyOwner($ownerId: ID!) {
      getSectionTemplatebyOwner(ownerId: $ownerId) {
        templates {
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
  `;
  
  constructor(
    private fb: FormBuilder,
    public router: Router,
    public activeModal: NgbActiveModal,
    public apollo: Apollo
  ) {}

  closeSectionPreview() {
    this.previewDiv = true;
    this.selectionDiv = false;
  }
  openSectionPreview() {
    this.previewDiv = false;
    this.selectionDiv = true;
  }
  onItemDeselect(value) {
    for (var i = this.selectedItems.length - 1; i >= 0; --i) {
      if (this.selectedItems[i].template_title == value.template_title) {
        this.selectedItems.splice(i, 1);
      }
    }
  }

  useTemplate() {
    const selectedTempSection = this.selectedItems.map(
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

  onItemSelect(item: any) {
    this.previewButton = false;
    let obj = this.sections.find(
      (obj) => obj.template_title == item.template_title
    );
    this.selectedItems.push(obj);
  }

  ngOnInit(): void {
    this.id = localStorage["graphcool-user-id"];
    // For Gettig Sections based on User ID
    this.apollo
      .query({
        query: this.getSectionTemplates,
        variables: {
          ownerId: this.id // replace user ID here
        },
        fetchPolicy: 'no-cache'
      })
      .subscribe(
        (data: any) => {
          this.sections = data.data.getSectionTemplatebyOwner.templates;
        },
        (error) => {
          this.error = true;
        }
      );

    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "template_title",
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: false,
    };
  }
}
