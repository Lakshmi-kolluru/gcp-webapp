import { Component, OnInit } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Subscription } from "rxjs";

interface _notifications{
  title: string;
  description: string;
  createdAt: Date;
  status: string;
  notif_type: { type: String };
  id: string;
}

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.scss"],
})
export class NotificationsComponent implements OnInit {
  notifications: any = []
  selectedNotification: any = []
  readNotifications : any = []
  unreadNotifications: any = []
  error: any;
  public indetailNotification = true;
  private querySubscription: Subscription;

  private currentNotifications = gql`
    query getNotificationbyUser($notifownerId: ID!) {
      getNotificationbyUser(userId: $notifownerId) {
        notifications {
          id
          title
          description
          status
          createdAt
          notif_type
        }
      }
    }
  `;

  private markAsRead = gql`
    mutation updateNotification($notification: notificationInput!) {
      updateNotification(notification: $notification) {
        id
      }
    }
  `;

  private markAllRead = gql`
    mutation markAllRead($userID: ID!) {
      markAllRead(userId: $userID) {
        success
      }
    }
  `;
  id: any;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.id = localStorage["graphcool-user-id"];
    this.apollo
      .query({
        query: this.currentNotifications,
        variables: {
          notifownerId: this.id, // replace user ID here
        },
        fetchPolicy: 'no-cache'
      })
      .subscribe(
        (data: any) => {
          this.notifications = data.data.getNotificationbyUser.notifications;
          this.notifications.forEach((element) => {
            if (element.status == "read") {
              this.readNotifications.push(element);
            } else if (element.status == "unread" || element.status == "new") {
              this.unreadNotifications.push(element);
            }
          });
        },
        (error) => {
          this.error = error;
        }
      );
  }

  showNotificationView(id) {
    this.indetailNotification = false;
    this.notifications.forEach((element) => {
      if (element.id == id) {
        this.selectedNotification = element;
        this.apollo
          .mutate({
            mutation: this.markAsRead,
            variables: {
              notification: {
                id: this.id,
                status: "read",
              },
            },
          })
          .subscribe(
            (data) => {},
            (error) => {}
          );
      }
    });
  }

  markAllAsRead() {
    this.apollo
      .mutate({
        mutation: this.markAllRead,
        variables: {
          userID: this.id,
        },
      })
      .subscribe(
        (data) => {},
        (error) => {}
      );
  }
  goback() {
    this.indetailNotification = true;
  }
}
