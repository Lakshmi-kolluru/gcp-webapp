import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-profile-history',
  templateUrl: './profile-history.component.html',
  styleUrls: ['./profile-history.component.scss'],
})
export class ProfileHistoryComponent implements OnInit {
  isLoading: boolean;
  public getDocHistoryList = gql`
  query getProfileHistoryByUser($userId: ID) {
    getProfileHistoryByUser(userId: $userId) {
      profilesHistory {
        id
        title
        description
        action
        createdAt
      }
    }
  }`;
  auditLog: any;

  // auditLog = [{
  //   title: 'Created a Document', desp: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat', date: 'Mar 2020', icon: 'icon-file'
  // },
  // {
  //   title: 'Edit a Document', desp: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat', date: 'Feb 2020', icon: 'icon-pencil-alt'
  // },
  // {
  //   title: 'Payment Renewal', desp: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat', date: 'Feb 2020', icon: 'icon-credit-card'
  // },
  // {
  //   title: 'Edit a Document', desp: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat', date: 'Jan 2020', icon: 'icon-pencil-alt'
  // },
  // {
  //   title: 'Created a Document', desp: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat', date: 'Mar 2020', icon: 'icon-file'
  // },
  // {
  //   title: 'Edit a Document', desp: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat', date: 'Feb 2020', icon: 'icon-pencil-alt'
  // }];
  constructor(
    public apollo: Apollo,
    public globals: Globals
  ) { }

  ngOnInit(): void {
    this.getProfileHistory(localStorage.getItem(this.globals.GC_USER_ID));
  }

  getProfileHistory(userId) {
    this.isLoading = true;
    this.apollo.query({
      query: this.getDocHistoryList, variables: { userId },
      fetchPolicy: 'no-cache'
    }).subscribe((data: any) => {
      this.auditLog = data.data.getProfileHistoryByUser.profilesHistory;
      this.auditLog = this.auditLog.reverse();
      this.isLoading = false;
    });
  }
}
