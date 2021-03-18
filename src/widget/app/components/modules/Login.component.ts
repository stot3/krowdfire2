import { Component, OnInit, Inject, Input, Output, EventEmitter, NgZone } from "@angular/core";
import { UserService } from "../../service/User.service";
import { UtilService } from "../../service/Util.service";
import { TranslationService } from '../../service/Translation.service';
import { SettingsService } from "../../service/Settings.service";
import { ConstantsGlobal } from "../../Constants-Global";
import * as OktaSignIn from '@okta/okta-signin-widget';

import "../../js/OktaWidget"
import { ComponentStillLoadingError } from "@angular/compiler/src/private_import_core";

declare var jQuery: any;

@Component({
  selector: "login-form",
  template: require("raw-loader!./Login.html"),
  providers: [UserService]
})

export class LoginComponent {

  @Input() isContributePage = false;
  @Output() onSuccess = new EventEmitter();
  @Output() onFailed = new EventEmitter();

  mUserService: UserService;
  mSettingsService: SettingsService;
  loginEmail: string;
  loginPassword: string;
  isLoggedInSuccessful: boolean = true;
  logginErrorMessage: string;
  socialLogin: boolean = false;
  socialLoginSettings: any = {};
  oktaWidget: any;
  urlForgotPassword: string;
  urlOktaRedirect: string;

  constructor( @Inject(UserService) mUserService: UserService, @Inject(SettingsService) private settingsService: SettingsService, @Inject(TranslationService) private translationService: TranslationService, private _ngZone: NgZone) {

    this.mUserService = mUserService;
    this.translationService.setupTranslation("campaign_login"); 
    this.mSettingsService = settingsService;
    this.socialLogin = undefined;
    this.urlForgotPassword = ConstantsGlobal.getSiteHost() + "login";
    this.urlOktaRedirect = ConstantsGlobal.getSiteHost() + "okta.html";
  }

  ngOnInit(){
    let id_token = '';
    if(window.location.hash.includes('id_token')){
      const hash = window.location.hash.substr(1, window.location.hash.length-1);
      const params = new URLSearchParams(hash);
      id_token = params.get('id_token');
    }
    this.mSettingsService.getAllSettings().subscribe((res) => {
      const socialLoginSettings = res.filter(({name}) => name === "social_login")
      if(socialLoginSettings.length > 0 && socialLoginSettings[0].value !== undefined && socialLoginSettings[0].value.toggle === true) {
        this.socialLogin = true;
        this.socialLoginSettings = socialLoginSettings[0].value;

        if(this.socialLoginSettings.toggle_iframe){
          window['loginComponentRef'] = {component: this, zone: this._ngZone};
          window['oktaInit']()
        } else {
          const getUrl = window.location;
          const baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
          const webuiUrl = baseUrl + 'login';
          
          const realRedirectUrl = baseUrl; // redirect back to current page
          const redirectUrl = this.urlOktaRedirect; //proxy redirect to thrinacia webui that will redirect based on above value

          const config = {
            idps: [],
            idpDisplay: "SECONDARY",
            helpLinks: {
              forgotPassword: `javascript:window.open("${webuiUrl}")`
            },
            authParams: {
              pkce: false,
              state: realRedirectUrl,
            },
            redirectUri: redirectUrl,
            baseUrl: this.socialLoginSettings.okta_domain,
            clientId: this.socialLoginSettings.okta_clientId,
            el: "#widget-container"
          }
          if (this.socialLoginSettings.providers){
            for(const [provider, {toggle, idpId}] of Object.entries(this.socialLoginSettings.providers)){
              if (toggle === true){
                config.idps.push({type: provider.toUpperCase(), id: idpId})
              }
            }
          }
          this.oktaWidget = new OktaSignIn(config);
          const oktaFormSubmit = () => {
            this.login();
          }
          this.oktaWidget.on('ready', function (context) {
            document.getElementById("okta-signin-submit").setAttribute("type", "button");
            document.getElementById("okta-signin-submit").onclick = oktaFormSubmit;
            document.getElementById("okta-signin-username").onkeyup = function(event) {
              if (event.which === 13) {
                event.preventDefault();
                oktaFormSubmit();
              }
            };
            document.getElementById('okta-signin-password').onkeyup = function(event) {
              if (event.which === 13) {
                event.preventDefault();
                oktaFormSubmit();
              }
            };
          });
          if(id_token){
            this.oktaSocialLogin(id_token)
          } else {
            this.oktaWidget.showSignInAndRedirect().catch(err => {
            });
          }
        }
      } else {
        this.socialLogin = false;
      }
    });
  }

  onLogIn(evt: any) {
    if (evt["keyCode"] == 13) {
      this.login();
    }
  }
  
  /**
   * Log user in with email and password
   * @param  {boolean} withoutValidation Optional validation
   */
  login() {
    if (this.socialLogin === true) {
      this.loginEmail = jQuery('#okta-signin-username').val();
      this.loginPassword = jQuery('#okta-signin-password').val();
    }
    this.formValidationLogin();
    if (!jQuery("#login-form.ui.form .field.error").length) {
      this.mUserService.login(this.loginEmail, this.loginPassword).subscribe(
        data => {
          this.onSuccess.emit(data);
          this._ngZone.run(() => {this.isLoggedInSuccessful = true;})

        },
        error => {
          this.onFailed.emit(error);
          this.logginErrorMessage = UtilService.logError(error);
          this._ngZone.run(() => {this.isLoggedInSuccessful = false;})
        }
      );
    }
  }

  oktaLoginWrapper(email = "", password = ""){
    if (this.socialLogin === true) {
      this.loginEmail = email;
      this.loginPassword = password;
    }
    this.formValidationLogin();
    if (!jQuery("#login-form.ui.form .field.error").length) {

      return new Promise((resolve, reject) => {
        this.mUserService.login(this.loginEmail, this.loginPassword).subscribe(
          data => {
            this.onSuccess.emit(data);
            this.isLoggedInSuccessful = true;
            resolve({authenticated: 1})
          },
          error => {
            this.onFailed.emit(error);
            this.logginErrorMessage = UtilService.logError(error);
            this.isLoggedInSuccessful = false;
            resolve({authenticated: 0, error})
          }
        );
      }).catch(e => {return {authenticated: 0, e}});
      
    }
  }
  oktaSocialLogin(id_token){
    return new Promise((resolve, reject) => {
      this.mUserService.loginOktaSocial(id_token).subscribe(
        data => {
          this.onSuccess.emit(data);
          this.isLoggedInSuccessful = true;
          resolve({authenticated: 1})
          var noHashURL = window.location.href.replace(/#.*$/, '');
          window.history.replaceState('', document.title, noHashURL)
        },
        error => {
          this.onFailed.emit(error);
          this.logginErrorMessage = UtilService.logError(error);
          this.isLoggedInSuccessful = false;
          resolve({authenticated: 0, error})
        }
      );
    }).catch(e => {return {authenticated: 0, e}});
      
  }


  formValidationLogin() {
    jQuery("#login-form.ui.form").form({
      inline: true,
      fields: {
        Email: {
          identifier: "Email",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your login email"
            },
            {
              type: "email",
              prompt: "Please enter a valid email"
            }
          ]
        },
        Password: {
          identifier: "Password",
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

  ngOnDestroy() {
    try {
      window['loginComponentRef'] = null;
    } catch (e) {
      console.error(e)
    }
  }
}
