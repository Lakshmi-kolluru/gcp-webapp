import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommentsService } from 'src/app/services/comments.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Globals } from 'src/app/globals';
import * as _ from 'lodash';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})

export class CommentsComponent implements OnInit {
  @Input() comment;
  @Input() index;
  @Input() sectionData;
  @Output() closeSelectedComment = new EventEmitter();

  profile: any;
  id: any;
  commentsList: any;

  constructor(
    public commentService: CommentsService,
    public apollo: Apollo,
    public global: Globals) {
    this.commentService.commentsData.subscribe(data => {
      this.commentsList = data;
    });
  }

  private getProfileByID = gql`
    query getUserDetailsById($userId: ID!) {
      getUserDetailsById(userId: $userId) {
        first_name
        last_name
        email_id
      }
    }`;

  ngOnInit() {
    this.id = localStorage.getItem(this.global.GC_USER_ID);
    this.getProfileData();
  }

  getProfileData() {
    this.apollo.query({ query: this.getProfileByID, variables: { userId: this.id } })
      .subscribe((data: any) => {
        this.profile = data.data.getUserDetailsById;
      }, (error) => { });
  }

  /**
   *
   * @param comment comment data
   * @description closes the comment box
   */
  closeComment(comment) {
    comment.edit = false;
    this.closeSelectedComment.emit(true);
  }

  /**
   *
   * @param comment consists of new comment data
   * @description adds the new comment data
   */
  addComment(comment) {
    const sectionsList = [...this.sectionData];
    _.map(sectionsList, (section) => {
      section.sec_owner = section.sec_owner && section.sec_owner.id ? section.sec_owner.id : section.sec_owner;
      _.map(section.collab_list, (collab) => {
        collab.user = collab.user && collab.user.id ? collab.user.id : collab.user;
      });
    });
    comment.oldComment = true;
    comment.reply_list = [];
    comment.commentid = 'comment' + this.commentsList.length;
    comment.sec_list = sectionsList;
    this.commentService.addComment(comment);
  }

  /**
   *
   * @param comment consists of comment data
   * @description edits the comment record
   */
  editComment(comment) {
    comment.edit = false;
    comment.oldComment = true;
    comment.updateUser = this.id;
    comment.updateAt = new Date().toISOString();
    this.commentService.editComment(comment);
  }

  /**
   *
   * @param comment consists of comment data
   * @description adds the reply to the selected comment
   */
  replyComment(comment) {
    if (comment.reply) {
      comment.updateUser = this.id;
      comment.reply_list.push({
        reply_content: comment.reply,
        createdAt: new Date().toISOString(),
        reply_user: this.id,
      });
      this.commentService.editComment(comment);
    }
  }

  /**
   *
   * @param comment consists of selected comment
   * @description removes the comment from the comments array.
   */
  deleteComment(comment) {
    this.commentService.deleteComment(comment.id);
  }

  // commentOnClick(comment) {
  //   _.map(this.commentsSelected, (c) => {
  //     c.clicked = false;
  //     if (comment.top === c.top && comment.left === c.left && comment.text === c.text) {
  //       c.clicked = true;
  //     }
  //   });
  // }
}
