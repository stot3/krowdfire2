import {Component, Inject, ElementRef, OnInit, Input, Output, EventEmitter} from "@angular/core";
import {Http, Headers, RequestOptions} from "@angular/http";
import {ConstantsGlobal} from "../../Constants-Global";
import {UtilService} from "../../service/Util.service";
import {UserService} from "../../service/User.service";
import { TranslationService } from '../../service/Translation.service';

declare let jQuery: any;

@Component({
  selector: "comment",
  template: require("raw-loader!./Comment.html"),
  providers: [UserService]
})

export class CommentComponent {

  @Input() personId: string;
  @Input() userInfo: any;
  @Output() onLogOut = new EventEmitter();

  static API_URL_COMMENT = "";
  static API_URL_COMMENT_ACTION = "";

  comments: Array<any> = [];
  newComment = {
    title: "",
    message: ""
  }

  campaignCommentsConfig = {
    "id": "campaign-comments-pagination",
    "itemsPerPage": 10,
    "currentPage": 1
  };

  constructor(private http: Http, @Inject(TranslationService) private translationService: TranslationService) {
    this.translationService.setupTranslation("campaign_comment");
  }

  ngOnInit() {
    CommentComponent.API_URL_COMMENT = ConstantsGlobal.getApiUrlCampaign() + ConstantsGlobal.CAMPAIGN_ID + "/comment";
    this.getComments();
  }

  getComments() {
    this.http.get(CommentComponent.API_URL_COMMENT)
      .map(res => res.json())
      .subscribe(
      res => {
        if (res && res.length) {
          this.formatCommentsData(res);
        }
      },
      error => {
        UtilService.logError(error);
      }
      )
  }

  formatCommentsData(commentsRes: any) {
    this.comments = [];
    for (let index in commentsRes) {
      let commentPerson = commentsRes[index].comment_person[0];
      if (commentPerson.person_files != null && commentPerson.person_files.length) {
        commentPerson.person_files[0].full_path = ConstantsGlobal.getApiUrlCampaignProfileImage() + commentPerson.person_files[0].path_external;
      }
      commentPerson.full_name = commentPerson.first_name + " " + commentPerson.last_name;
      commentsRes[index].isEditing = false;
      commentsRes[index].isDeleting = false;
    }
    this.comments = commentsRes;
  }

  setComment() {
    let headers = new Headers();
    let options = new RequestOptions({
      headers: headers, withCredentials: true
    });

    this.http.post(CommentComponent.API_URL_COMMENT, JSON.stringify(this.newComment), options)
      .map(res => res.json())
      .subscribe(
      res => {
        this.newComment.title = "";
        this.newComment.message = "";
        this.getComments();
      },
      error => UtilService.logError(error)
      );
  }

  updateComment(comment: any) {
    let API_URL_COMMENT = ConstantsGlobal.getApiUrlCampaign() + ConstantsGlobal.CAMPAIGN_ID + "/comment/" + comment.id;
    if (comment.isEditing) {
      let headers = new Headers();
      let options = new RequestOptions({
        headers: headers, withCredentials: true
      });

      this.http.put(API_URL_COMMENT, JSON.stringify(comment), options)
        .map(res => res.json())
        .subscribe(
        res => {
          this.getComments();
        },
        error => UtilService.logError(error)
        );
    }
    comment.isEditing = !comment.isEditing;
  }

  confirmDeleteComment(comment: any) {
    comment.isDeleting = !comment.isDeleting;
  }

  deleteComment(comment: any, index: any) {
    let API_URL_COMMENT = ConstantsGlobal.getApiUrlCampaign() + ConstantsGlobal.CAMPAIGN_ID + "/comment/" + comment.id;
    let headers = new Headers();
    let options = new RequestOptions({
      headers: headers, withCredentials: true
    });

    this.http.delete(API_URL_COMMENT, options)
      .map(res => res.json())
      .subscribe(
      res => {
        comment.isDeleting = false;
        this.comments = this.comments.filter((val, i) => i != index);
        this.getComments();
      },
      error => UtilService.logError(error)
      );
  }

  // Other comment actions, including reply, upvote, downvote
  commentAction(action: string, comment: any) {
    if (this.personId) {
      let API_URL_COMMENT_ACTION = ConstantsGlobal.getApiUrlCampaign() + ConstantsGlobal.CAMPAIGN_ID + "/comment/" + comment.id + "/comment-action";
      let headers = new Headers();
      let options = new RequestOptions({
        headers: headers, withCredentials: true
      });
      let commentAction = {};
      // Upvote or Downvote
      if (action == "upvote" || action == "downvote") {
        commentAction['comment_action_type_id'] = action == "upvote" ? 1 : 2;
        this.http.post(API_URL_COMMENT_ACTION, JSON.stringify(commentAction), options)
          .map(res => res.json())
          .subscribe(
          res => {
            this.getComments();
          },
          error => UtilService.logError(error)
          );
      }
      // Reply
      else if (action == "reply") {
        let commentPersonName = comment.comment_person[0].first_name + " " + comment.comment_person[0].last_name;
        this.newComment.message += "'@" + commentPersonName + "' \n";
        jQuery('html, body').animate({
          scrollTop: jQuery("#comment-form").offset().top
        }, 500);
        document.getElementById("comment_message").focus();
      }
    }
  }

  /**
   * Set date object with date string
   * @param  {any}    date Date string
   * @return {Object}      Date object
   */
  setDateObject(date: any) {
    if (date) {
      if (typeof date === "string") {
        date = date.substr(0, date.length - 3).replace(" ", "T");
      }
      return UtilService.getDateObject(date);
    }
  }

  getDateForDisplay(date: any) {
    if (date && typeof date == "string") {
      return UtilService.getDateForDisplay(date);
    } else {
      return date;
    }
  }

  logout() {
    this.onLogOut.emit(null);
  }

  /**
   * Translate Function
   */
  translate(name){
    return TranslationService.translation[name];
  }

  onCommentsPageChange(evt) {
    this.campaignCommentsConfig.currentPage = evt;
  }
}
