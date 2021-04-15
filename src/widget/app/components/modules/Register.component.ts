import { Component, OnInit, Input, Output, EventEmitter, Inject } from "@angular/core";
import { UserService } from "../../service/User.service";
import { UtilService } from "../../service/Util.service";
import { TranslationService } from '../../service/Translation.service';

declare var jQuery: any;

@Component({
  selector: "register-form",
  template: require("raw-loader!./Register.html")
})

export class RegisterComponent {

  @Input() isHiddingCreateAccountButton: boolean = false;
  @Input() isContributing: boolean = false;
  @Output() onSuccess = new EventEmitter();
  @Output() onFailed = new EventEmitter();

  mUserService: UserService;

  registerInfo: any = {
    "first_name": "",
    "last_name": "",
    "email": "",
    "password": "",
    "password_confirm": "",
    "inline_registration": false
  }

  registerSuccess: string;
  registerError: string;

  isRegisterFormValid: boolean = false;

  constructor( @Inject(UserService) mUserService: UserService, @Inject(TranslationService) private translationService: TranslationService) {
    this.mUserService = mUserService;
    this.translationService.setupTranslation("campaign_register");
  }

  /**
   * Register user with provided info
   */
  register() {
    this.formValidationRegister();
    this.registerInfo.inline_registration = this.isContributing;
    if (this.isRegisterFormValid) {
      this.mUserService.register(this.registerInfo).subscribe(
        data => {
          var eventData = {
            "email": this.registerInfo.email,
            "password": this.registerInfo.password,
            "inline_token": data.inline_token,
            "user_id": data.id
          };
          this.registerError = "";
          this.onSuccess.emit(eventData);
          if(!data.inline_token) {
            this.registerSuccess = this.translate("campaign_register_success_text");
          }
        },
        error => {
          UtilService.logError(error);
          this.registerSuccess = "";
          this.displayError(error);
          this.onFailed.emit(error);
        }
      );
    }
  }

  /**
   * Register user with provided info
   */
  paypalRegister(paypal_order_id) {
    this.formValidationRegister();
    this.registerInfo.inline_registration = this.isContributing;
    if (this.isRegisterFormValid) {
      this.mUserService.register(this.registerInfo).subscribe(
        data => {
          var eventData = {
            "email": this.registerInfo.email,
            "password": this.registerInfo.password,
            "inline_token": data.inline_token,
            "user_id": data.id,
            "paypal_order_id": paypal_order_id
          };
          this.registerError = "";
          this.onSuccess.emit(eventData);
          if(!data.inline_token) {
            this.registerSuccess = this.translate("campaign_register_success_text");
          }
        },
        error => {
          UtilService.logError(error);
          this.registerSuccess = "";
          this.displayError(error);
          this.onFailed.emit(error);
        }
      );
    }
  }

  displayError(error) {
    error = error.json();
    if (error.hasOwnProperty("errors")) {
      this.registerError = "campaign_register_api_"+error.errors.email[0].code;
    }
  }

  formValidationRegister() {
    jQuery("#register-form").form({
      inline: true,
      onSuccess: () => {
        this.isRegisterFormValid = true;
      },
      onFailure: () => {
        this.isRegisterFormValid = false;
      },
      fields: {
        FirstName: {
          identifier: "FirstName",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your first name"
            }
          ]
        },
        LastName: {
          identifier: "LastName",
          rules: [
            {
              type: "empty",
              prompt: "please enter your last name"
            }
          ]
        },
        registerEmail: {
          identifier: "registerEmail",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your email"
            },
            {
              type: "email",
              prompt: "Please enter a valid email"
            }
          ]
        },
        Pass: {
          identifier: "Pass",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your password"
            },
            {
              type: "minLength[6]",
              prompt: "Your password must be at least 6 characters"
            }
          ]
        },
        PasswordConfirm: {
          identifier: "PasswordConfirm",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your password"
            },
            {
              type: "match[Pass]",
              prompt: "Your password doesn't match"
            }
          ]
        }
      }
    }).form("validate form");
  }

  /**
   * Translate Function
   */
  translate(name){
    return TranslationService.translation[name];
  }
}
