import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { MatMenuTrigger } from '@angular/material/menu';
import { Globals } from 'src/app/globals';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalSearchService } from 'src/app/services/global-search.service';

interface Documents {
  doc_title: string;
  security_level: string;
  isPrivate: boolean;
  status: string;
  accesslevel?: string;
  collab_list?: Collaborators[];
}

interface Sections {
  sec_title: string;
  security_level: string;
  status: string;
  accesslevel?: string;
  collab_list?: Collaborators[];
}

interface Collaborators {
  user: User;
  permission: string;
  status: string;
}

interface User {
  first_name: string;
  last_name: string;
  email_id: string;
}

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  private globalSearchDoc =
    gql`query globalSearchForDocuments($searchText: String, $userId: ID) {
    globalSearchForDocuments(searchText: $searchText, userId: $userId) {
      documents {
        id
        doc_title
        doc_owner {
          email_id
          id
        }
        collab_list {
          user {
            id
            email_id
          }
          permission
        }
        security_level
        isPrivate
        status
        sections_list {
          sec_title
        }
        createdAt
      }
    }
  }`;

  private globalSearchSection = gql`query globalSearchForSections($searchText: String, $userId: ID) {
    globalSearchForSections(searchText: $searchText, userId: $userId) {
      sections {
        id
        sec_title
        sec_owner {
          id
          email_id
        }
        collab_list {
          user {
            id
            email_id
          }
          permission
        }
        security_level
        isPrivate
        createdAt
      }
    }
  }`;

  page = this.globals.pageStart;
  pageSize = this.globals.pageLimit;

  gridView: boolean;
  fullGridView: boolean;
  listView = true;

  id: string;
  isloading: boolean;
  tabs: any = this.globals.fileTypes;

  documentSettings = {
    noDataMessage: 'No Documents Available',
    hideSubHeader: true,
    actions: {
      add: false,
      edit: false,
      delete: false,
      position: 'right',
      custom: [{
        name: 'preview',
        title: '<i class="icon-eye" title="Preview"></i>&nbsp;&nbsp;',
      }]
    },
    columns: {
      doc_title: {
        title: 'Title',
      },
      sections_list: {
        title: 'Sections',
        valuePrepareFunction: (value) => {
          return value ? value.length : 0;
        },
      },
      security_level: {
        title: 'Security',
      },
      collab_list: {
        title: 'Collaborators',
        valuePrepareFunction: (value) => {
          value.coownerCount = value.filter(collab => collab.permission === 'coowner').length;
          value.approveAndEditCount = value.filter(collab => collab.permission === 'approveAndEdit').length;
          value.approveCount = value.filter(collab => collab.permission === 'approve').length;
          value.editCount = value.filter(collab => collab.permission === 'edit').length;
          value.commentCount = value.filter(collab => collab.permission === 'comment').length;
          value.viewCount = value.filter(collab => collab.permission === 'view').length;
          return value ? value.length : 0;
        },
      },
      isPrivate: {
        title: 'Visibility',
        valuePrepareFunction: (value) => {
          return value ? 'Private' : 'Public';
        },
      },
      doc_owner: {
        title: 'Documents',
        valuePrepareFunction: (value) => {
          return value.id === this.id ? 'Created By You' : 'Shared with me';
        },
      }
    },
  };

  sectionSettings = {
    noDataMessage: 'No Sections Available',
    hideSubHeader: true,
    actions: {
      add: false,
      edit: false,
      delete: false,
      position: 'right',
      custom: [{
        name: 'preview',
        title: '<i class="icon-eye" title="Preview"></i>&nbsp;&nbsp;',
      },
      {
        name: 'export',
        title: '<i class="icon-export" title="Export"></i>',
      }]
    },
    columns: {
      sec_title: {
        title: 'Title',
      },
      collab_list: {
        title: 'Collaborators',
        valuePrepareFunction: (value) => {
          value.coownerCount = value.filter(collab => collab.permission === 'coowner').length;
          value.approveAndEditCount = value.filter(collab => collab.permission === 'approveAndEdit').length;
          value.approveCount = value.filter(collab => collab.permission === 'approve').length;
          value.editCount = value.filter(collab => collab.permission === 'edit').length;
          value.commentCount = value.filter(collab => collab.permission === 'comment').length;
          value.viewCount = value.filter(collab => collab.permission === 'view').length;
          return value ? value.length : 0;
        },
      },
      security_level: {
        title: 'Security',
      },
      isPrivate: {
        title: 'Visibility',
        valuePrepareFunction: (value) => {
          return value ? 'Private' : 'Public';
        },
      },
      sec_owner: {
        title: 'Sections',
        valuePrepareFunction: (value) => {
          return value.id === this.id ? 'Created By You' : 'Shared with me';
        },
      }
      // status: {
      //   title: 'Status',
      // }
    },
  };

  contractSettings = {
    noDataMessage: 'Smart Contracts Coming Soon',
    hideSubHeader: true,
    actions: {
      add: false,
      edit: false,
      delete: false,
      position: 'right',
      custom: []
    },
    columns: {
      sec_title: {
        title: 'Title',
      },
      collab_list: {
        title: 'Collaborators',
        valuePrepareFunction: (value) => {
          return value ? value.length : 0;
        },
      },
      security_level: {
        title: 'Security',
      },
      isPrivate: {
        title: 'Visibility',
        valuePrepareFunction: (value) => {
          return value ? 'Private' : 'Public';
        },
      },
      status: {
        title: 'Status',
      }
    },
  };

  constructor(
    public globals: Globals,
    public apollo: Apollo,
    public router: Router,
    public route: ActivatedRoute,
    public searchService: GlobalSearchService) {
   
  }

  ngOnInit() {
    this.id = localStorage.getItem(this.globals.GC_USER_ID);

    // maps each settings to its tab
    _.map(this.tabs, (tab) => {
      if (tab.value === 'documents') {
        tab.content = [];
        tab.settings = this.documentSettings;
      }
      if (tab.value === 'sections') {
        tab.content = [];
        tab.settings = this.sectionSettings;
      }
      if (tab.value === 'scontracts') {
        tab.content = [];
        tab.settings = this.contractSettings;
      }
    });

     this.searchService.searchText.subscribe(data => {
      if (data) {
        this.getSectionBasedonSearch(data);
        this.getDocumentsBasedonSearch(data);
      }
    });
  }

  getDocumentsBasedonSearch(searchText: any) {
    this.isloading = true;
    let documentsData: Documents[] = [];
    if (searchText) {
      this.apollo.query({
        query: this.globalSearchDoc,
        variables: {
          searchText,
          userId: this.id
        },
        fetchPolicy: 'no-cache'
      }).subscribe((data: any) => {
        this.isloading = false;
        _.map(this.tabs, async (tab) => {
          documentsData = data.data.globalSearchForDocuments.documents;
          if (tab.value === 'documents') {
            tab.content = documentsData;
          }
        });
      });
    }
  }

  getSectionBasedonSearch(searchText?: any) {
    let sectionData: Sections[] = [];
    if (searchText) {
      this.apollo.query({
        query: this.globalSearchSection,
        variables: {
          searchText: searchText ? searchText : '',
          userId: this.id
        },
        fetchPolicy: 'no-cache'
      }).subscribe((data: any) => {
        _.map(this.tabs, async (tab) => {
          sectionData = data.data.globalSearchForSections.sections;
          if (tab.value === 'sections') {
            tab.content = sectionData;
          }
        });
      });
    }
  }

  customAction(data, tabName) {
    if (data.action === 'preview') {
      if (tabName === 'Documents') {
        this.router.navigate(['/mainPage/preview/document'], { relativeTo: this.route, queryParams: { name: data.data.id } });
      }
      if (tabName === 'Sections') {
        this.router.navigate(['/mainPage/preview/section'], { relativeTo: this.route, queryParams: { name: data.data.id } });
      }
      if (tabName === 'Smart Contracts') {

      }
    }
  }

  openMenufolder(event: MouseEvent, viewChild: MatMenuTrigger, element) {
    event.preventDefault();
    viewChild.openMenu();
    element.left = event.clientX + 'px';
    element.top = event.clientY + 'px';
  }

}
