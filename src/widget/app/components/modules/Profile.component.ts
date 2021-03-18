import { Component, OnInit, OnChanges, SimpleChanges, Inject, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from "../../service/User.service";
import { UtilService } from "../../service/Util.service";
import { CampaignService } from "../../service/Campaign.service";
import { TranslationService } from '../../service/Translation.service';
import { ConstantsGlobal } from "../../Constants-Global";
import { FileUploader, Headers } from 'ng2-file-upload/ng2-file-upload';

declare let jQuery: any;

@Component({
  selector: 'profile',
  template: require("raw-loader!./Profile.html")
})

export class ProfileComponent implements OnInit, OnChanges {

  @Input() userInfo: Object;
  @Input() settingDecimalOption: number;
  @Input() profileResourceId: number;
  @Output() onBackToCampaignPage = new EventEmitter<any>();
  @Output() onUpdateUserInfo = new EventEmitter<any>();
  @Output() onUpdateProfileResourceId = new EventEmitter<any>();

  oldUserInfo: Object = {};
  API_HOST: string;
  profileMyContributionsCampaigns: Array<Object> = [];
  profileMyCampaigns: Array<Object> = [];
  isProfileEditing: boolean = false;
  isPasswordEditing: boolean = false;
  passwordObj: Object = {
    "password_old": "",
    "password": "",
    "password_confirm": ""
  };
  pledgeHistoryPaginationObjects: Object = {};
  fileUploader: FileUploader;
  uploadingProfileImage: any;
  profileResourceHeaders: Array<Headers>;
  isProfileInfoSaving: boolean = false;
  isProfileImageSaving: boolean = false;
  isProfileSavedSuccess: boolean = false;
  isProfilePasswordSaving: boolean = false;
  isProfilePasswordSuccess: boolean = false;
  isContributionsLoading: boolean = true;

  CAMPAIGN_RESULT_TYPE_BACKER: number = 0;
  PROFILE_EDIT_SAVING: number = 10;
  PROFILE_CHANGE_PASSWORD_SAVING: number = 11;

  campaignsContributionsPageConfig = {
    "id": "profile-campaign-contributions-pagination",
    "itemsPerPage": 6,
    "currentPage": 1
  };

  profileImageStyle: Object = {
    "width": 0,
    "height": 0,
    "padding": "75px",
    "background-size": "cover"
  };

  testAnimation: string = "saved";

  constructor( @Inject(UserService) private userService: UserService, @Inject(CampaignService) private campaignService: CampaignService, @Inject(TranslationService) private translationService: TranslationService) {

  }

  ngOnInit() {
    this.getProfile();
    this.translationService.setupTranslation("user_profile");
    this.API_HOST = ConstantsGlobal.getApiHost();

    this.fileUploader = new FileUploader({
      url: `${ConstantsGlobal.getApiUrlAccountResourceFile()}`,
      autoUpload: false,
      headers: this.profileResourceHeaders,
      method: 'POST',
      allowedMimeType: ['image/png', 'image/jpg', 'image/jpeg']
    });

    this.profileImageStyle["background-image"] = `url(${this.userInfo["profile_image"]})`;

    for (let prop in this.userInfo) {
      if (this.userInfo.hasOwnProperty(prop)) {
        this.oldUserInfo[prop] = this.userInfo[prop];
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      if (propName === "userInfo") {
        let userInfoCurrent = changes[propName]["currentValue"];
        let userInfoPrevious = changes[propName]["previousValue"];
        if (userInfoCurrent["person_id"] !== userInfoPrevious["person_id"] && userInfoCurrent["person_id"] > 0) {
          this.getCampaignManagementAllData(this.CAMPAIGN_RESULT_TYPE_BACKER);
        }
      }
    }
  }

  formatCampaignData(campaignDataArray: Array<Object>) {
    for (let i = 0; i < campaignDataArray.length; i++) {
      let campaignFiles = campaignDataArray[i]["files"];
      if (campaignFiles) {
        for (let j = 0; j < campaignFiles.length; j++) {
          if (campaignFiles[j]["region_id"] == 3) {
            campaignDataArray[i]["campaign_thumbnail_image"] = `${this.API_HOST}image/campaign_thumbnail_large/${campaignFiles[j]["path_external"]}`;
          }
        }
      }
      if (campaignDataArray[i]["funded_percentage_shipping_excluded"] > 100) {
        campaignDataArray[i]["funded_percentage_shipping_excluded"] = 100;
      }
    }
    this.isContributionsLoading = false;
  }

  getCampaignPledgeHistory(campaignData: Object) {
    this.campaignService.getCampaignPledgeHistory(campaignData["id"]).subscribe(
      res => {
        this.createPaginationObject(campaignData["id"], res.length);
        campaignData["pledge_history"] = res;
      },
      error => UtilService.logError(error)
    )
  }

  getCampaignManagementAllData(resultType: number) {
    let optionObj: Object = {};
    if (resultType === this.CAMPAIGN_RESULT_TYPE_BACKER) {
      optionObj = {
        "backer": this.userInfo["person_id"]
      };
    }
    this.campaignService.getCampaignAllData(optionObj).subscribe(
      res => {
        if (resultType === this.CAMPAIGN_RESULT_TYPE_BACKER) {
          this.profileMyContributionsCampaigns = res;
          for (let campaign of this.profileMyContributionsCampaigns) {
            this.getCampaignPledgeHistory(campaign);
          }
          this.formatCampaignData(this.profileMyContributionsCampaigns);
        }
      },
      error => UtilService.logError(error)
    );
  }

  onProfileCampaignContributionsPageChanged(evt: any) {
    this.campaignsContributionsPageConfig.currentPage = evt;
  }

  getDateForDisplay(date: any) {
    return UtilService.getDateForDisplay(date);
  }

  editProfile(shouldSave: boolean) {
    if (!this.isProfileInfoSaving && !this.isProfileImageSaving) {
      if (this.profileResourceId > -1) {
        this.fileUploader.options.url = `${ConstantsGlobal.getApiUrlAccountResourceFile()}/${this.profileResourceId}`;
        this.fileUploader.options.method = "PUT";
      }
      if (this.isProfileEditing && shouldSave) {
        if (this.validateInfoInputs()) {
          this.saveProfile({
            "bio": this.userInfo["bio"],
            "first_name": this.userInfo["first_name"],
            "last_name": this.userInfo["last_name"]
          }, this.PROFILE_EDIT_SAVING);
          this.isProfileEditing = !this.isProfileEditing;
        }
      } else {
        this.isProfileEditing = !this.isProfileEditing;
        if (!shouldSave) {
          for (let prop in this.oldUserInfo) {
            if (this.oldUserInfo.hasOwnProperty(prop)) {
              this.userInfo[prop] = this.oldUserInfo[prop];
            }
          }
          this.profileImageStyle["background-image"] = `url(${this.userInfo["profile_image"]})`;
        }
      }
    }
  }

  editPassword(shouldSave: boolean) {
    if (this.isPasswordEditing && shouldSave) {
      if (this.validatePasswordInputs()) {
        this.saveProfile({
          "password_old": this.passwordObj["password_old"],
          "password": this.passwordObj["password"],
          "password_confirm": this.passwordObj["password_confirm"]
        }, this.PROFILE_CHANGE_PASSWORD_SAVING);
        this.passwordObj = {
          "password_old": "",
          "password": "",
          "password_confirm": ""
        };
        this.isPasswordEditing = !this.isPasswordEditing;
      }
    } else {
      this.isPasswordEditing = !this.isPasswordEditing;
    }
  }

  saveProfile(param: Object, type: number) {
    if (type == this.PROFILE_EDIT_SAVING) {
      this.fileUploader.onBuildItemForm = (fileItem: any, form: any) => {
        form.append("resource_content_type", "image");
        form.append("resource", this.uploadingProfileImage);
      };
      this.fileUploader.onSuccessItem = (item: any, response: string, status: number, headers: any) => {
        if (status >= 200 && status < 400) {
          this.isProfileImageSaving = false;
          this.checkProfileInfoSavedSuccess();
          let jsonResponse = JSON.parse(response);
          this.profileResourceId = jsonResponse["id"];
          this.onUpdateProfileResourceId.emit(this.profileResourceId);
        }
      }
      if (this.fileUploader.queue && this.fileUploader.queue.length) {
        this.fileUploader.uploadItem(this.fileUploader.queue[this.fileUploader.queue.length - 1]);
        this.isProfileImageSaving = true;
      }
      this.isProfileInfoSaving = true;
      this.testAnimation = "saving";
    } else {
      this.isProfilePasswordSaving = true;
    }
    this.userService.saveProfile(param).subscribe(
      res => {
        if (type == this.PROFILE_EDIT_SAVING) {
          this.isProfileInfoSaving = false;
          this.checkProfileInfoSavedSuccess();
        } else {
          this.isProfilePasswordSaving = false;
          this.checkProfilePasswordSavedSuccess();
        }
        this.onUpdateUserInfo.emit(this.userInfo);
        for (let prop in this.userInfo) {
          if (this.userInfo.hasOwnProperty(prop)) {
            this.oldUserInfo[prop] = this.userInfo[prop];
          }
        }

      },
      error => UtilService.logError(error)
    );
  }

  checkProfileInfoSavedSuccess() {
    if (!this.isProfileInfoSaving && !this.isProfileImageSaving) {
      this.isProfileSavedSuccess = true;
      setTimeout(() => {
        this.isProfileSavedSuccess = false;
      }, 3000);
    }
  }

  checkProfilePasswordSavedSuccess() {
    if (!this.isProfilePasswordSaving) {
      this.isProfilePasswordSuccess = true;
      setTimeout(() => {
        this.isProfilePasswordSuccess = false;
      }, 3000);
    }
  }

  validateInfoInputs() {
    return jQuery('.ui.form.info-form')
      .form({
        fields: {
          first_name: {
            identifier: "first_name",
            rules: [
              {
                type: "empty",
                prompt: "Please enter your first name"
              }
            ]
          },
          last_name: {
            identifier: "last_name",
            rules: [
              {
                type: "empty",
                prompt: "Please enter your last name"
              }
            ]
          },
          bio: {
            identifier: "bio",
            rules: [
              {
                type: "empty",
                prompt: "Please enter your bio"
              }
            ]
          }
        },
        inline: true
      }).form("is valid");
  }

  validatePasswordInputs() {
    return jQuery('.ui.form.password-form')
      .form({
        fields: {
          password_old: {
            identifier: "password_old",
            rules: [
              {
                type: "empty",
                prompt: "Please enter your current password"
              }
            ]
          },
          password: {
            identifier: "password",
            rules: [
              {
                type: "empty",
                prompt: "Please enter your new password"
              },
              {
                type: "minLength[6]",
                prompt: "Please enter minimum 6 characters"
              }
            ]
          },
          password_confirm: {
            identifier: "password_confirm",
            rules: [
              {
                type: "empty",
                prompt: "Please re-enter your new password"
              },
              {
                type: "match[password]",
                prompt: "Passwords do not match"
              }
            ]
          }
        },
        inline: true
      }).form("is valid");
  }

  createPaginationObject(campaignId: number, totalItems: number) {
    let paginationConfig = {
      "id": `campaign-pledge-${campaignId}`,
      "itemsPerPage": 10,
      "currentPage": 1
    };
    this.pledgeHistoryPaginationObjects[`campaignid${campaignId}`] = paginationConfig;
  }

  onPledgePageChange(evt: any, campaignId: number) {
    this.pledgeHistoryPaginationObjects[`campaignid${campaignId}`]["currentPage"] = evt;
  }

  onBackToCampaign() {
    this.onBackToCampaignPage.emit();
  }

  onUploadedProfileImageChange(evt: any) {
    let reader = new FileReader();
    reader.onload = (event) => {
      this.oldUserInfo["profile_image"] = this.userInfo["profile_image"];
      this.userInfo["profile_image"] = event["target"]["result"];
      this.profileImageStyle["background-image"] = `url(${this.userInfo["profile_image"]})`;
    }
    if (evt.target.files && evt.target.files.length) {
      this.uploadingProfileImage = evt.target.files[0];
      reader.readAsDataURL(this.uploadingProfileImage);
    }
  }

  translate(name) {
    return TranslationService.translation[name];
  }

  getProfile() {
    this.userService.getAuthenticatedUser().subscribe(
      user => {
        this.userService.getProfile(user.person_id)
          .subscribe(
          res => {
            if (res.files && res.files.length) {
              this.profileResourceId = res.files[0]["id"];
            }
          },
          error => UtilService.logError(error)
        );
      },
      error => UtilService.logError(error)
    )
  }

}