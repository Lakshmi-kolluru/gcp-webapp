import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import * as _ from "lodash";
import { Globals } from "../globals";

interface Comment {
  id: string;
  commentId: string;
  documentId: any;
  sectionId: any;
  sectionTitle: string;
  sectionContent: string;
  comment_content: string;
  sec_list: any;
  commented_user: any;
  reply_list: Replies;
  updateUser: any;
  createdAt: Date;
  updateAt: Date;
}

interface Replies {
  reply_content: string;
  reply_user: string;
  createdAt: Date;
}

@Injectable({
  providedIn: "root",
})
export class CommentsService {
  private comments = new BehaviorSubject<Comment[]>([]);
  public readonly commentsData: Observable<
    Comment[]
  > = this.comments.asObservable();
  public updatedComments: any;

  constructor(public apollo: Apollo, public globals: Globals) {}

  private createComment = gql`
    mutation createComment($comment: CommentInput) {
      createComment(comment: $comment) {
        id
        sectionContent
        comment_content
      }
    }
  `;

  private getCommentQuery = gql`
    query getCommentsList($userId: ID, $documentId: ID!, $sectionId: ID!) {
      getCommentsList(
        userId: $userId
        documentId: $documentId
        sectionId: $sectionId
      ) {
        comments {
          id
          documentId {
            id
          }
          sectionId {
            id
          }
          sectionContent
          comment_content
          commented_user {
            id
            first_name
            last_name
          }
          reply_list {
            reply_content
            reply_user {
              id
              first_name
              last_name
            }
            createdAt
          }
          createdAt
          updateAt
        }
      }
    }
  `;

  private replyToComment = gql`
    mutation addreplytoComment($commentId: ID, $replyInfo: ReplyInput) {
      addreplytoComment(commentId: $commentId, replyInfo: $replyInfo) {
        id
        documentId {
          doc_title
        }
        sectionId {
          sec_title
        }
        sectionContent
        comment_content
        commented_user {
          first_name
          last_name
        }
        reply_list {
          reply_content
          reply_user {
            first_name
            last_name
          }
          createdAt
        }
      }
    }
  `;

  private updateComment = gql`
    mutation updateComment($comment: CommentInput) {
      updateComment(comment: $comment) {
        id
        documentId {
          doc_title
        }
        sectionId {
          sec_title
        }
        sectionContent
        comment_content
        commented_user {
          first_name
          last_name
        }
        reply_list {
          reply_content
          reply_user {
            first_name
            last_name
          }
          createdAt
        }
      }
    }
  `;

  private deleteCommentData = gql`
    mutation deleteComment($commentId: ID) {
      deleteComment(commentId: $commentId) {
        success
      }
    }
  `;

  /**
   *
   * @param commentData consists of comment Data
   * @description adds the comment
   */
  addComment(commentData: Comment) {
    this.apollo
      .mutate({
        mutation: this.createComment,
        variables: {
          comment: {
            documentId: commentData.documentId,
            sectionId: commentData.sectionId,
            // commentId: commentData.commentId,
            // sec_list: commentData.sec_list,
            sectionContent: commentData.sectionContent,
            comment_content: commentData.comment_content,
            commented_user: commentData.commented_user,
            updateUser: commentData.updateUser,
            reply_list: commentData.reply_list,
            createdAt: commentData.createdAt,
            updateAt: commentData.updateAt,
          },
        },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        commentData.id = data.data.createComment.id;
        const tranformedCommentData = this.comments
          .getValue()
          .filter((comment) => comment.commentId !== commentData.commentId);
        return this.comments.next(tranformedCommentData.concat(commentData));
      });
  }

  addReplytoComment(commentData: Comment) {
    this.apollo
      .mutate({
        mutation: this.replyToComment,
        variables: {
          commentId: commentData.id,
          replyInfo: commentData.reply_list,
        },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        _.map(this.comments.getValue(), (comment) => {
          if (comment.id !== commentData.id) {
            comment = data.data.addreplytoComment;
          }
        });
        this.comments.next(this.comments.getValue());
      });
  }
  /**
   *
   * @param commentData consists of comment Data
   * @description edits the comment data
   */
  editComment(commentData: Comment) {
    _.map(
      commentData.reply_list,
      (replies) =>
        (replies.reply_user =
          replies.reply_user.id && replies.reply_user
            ? replies.reply_user.id
            : replies.reply_user)
    );
    const commentsData = {
      id: commentData.id,
      documentId:
        commentData.documentId && commentData.documentId.id
          ? commentData.documentId.id
          : commentData.documentId,
      sectionId:
        commentData.sectionId && commentData.sectionId.id
          ? commentData.sectionId.id
          : commentData.sectionId,
      sectionContent: commentData.sectionContent,
      comment_content: commentData.comment_content,
      commented_user:
        commentData.commented_user && commentData.commented_user.id
          ? commentData.commented_user.id
          : commentData.commented_user,
      updateUser:
        commentData.updateUser && commentData.updateUser.id
          ? commentData.updateUser.id
          : commentData.updateUser,
      createdAt: commentData.createdAt,
      updateAt: commentData.updateAt,
      reply_list: commentData.reply_list,
    };

    this.apollo
      .mutate({
        mutation: this.updateComment,
        variables: { comment: commentsData },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        _.map(this.comments.getValue(), (comment) => {
          if (comment.id !== commentData.id) {
            comment = data.data.updateComment;
          }
        });
        this.comments.next(this.comments.getValue());
      });
  }

  getCommentsFromPreview(commentList) {
    this.comments.next(commentList);
  }

  /**
   *
   * @param sectionId consists of section id
   * @param documentId consists of document id
   * @description gets the document data based upon the section and the document id
   */
  getComment(sectionId: string[], documentId?: string) {
    this.apollo
      .mutate({
        mutation: this.getCommentQuery,
        variables: {
          userId: localStorage.getItem(this.globals.GC_USER_ID),
          documentId,
          sectionId,
        },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        _.map(data.data.getCommentsList.comments, (comment) => {
          comment.oldComment = true;
          comment.showCommentBox = true;
        });
        this.comments.next(data.data.getCommentsList.comments);
      });
  }

  deleteComment(id) {
    this.apollo
      .mutate({
        mutation: this.deleteCommentData,
        variables: { commentId: id },
        fetchPolicy: "no-cache",
      })
      .subscribe((data: any) => {
        if (data.data.deleteComment.success) {
          const tranformedCommentData = this.comments
            .getValue()
            .filter((comment) => comment.id !== id);
          this.comments.next(tranformedCommentData);
        } else {
        }
      });
  }

  setComment() {
    this.comments.next([]);
  }
}
