///////////////////////////////////////////////////////////////////////////////////////////
// Main App Component
///////////////////////////////////////////////////////////////////////////////////////////
import { Component, Inject, ElementRef, OnInit, AfterViewChecked, ViewChild } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgClass, NgLocalization, NgPlural, NgPluralCase } from "@angular/common";
import { ConstantsGlobal } from "./Constants-Global";
import { Http, Headers, RequestOptions } from "@angular/http";
import { UserService } from "./service/User.service";
import { CampaignService } from "./service/Campaign.service";
import { StripeService } from "./service/Stripe.service";
import { PledgeService } from "./service/Pledge.service";
import { UtilService } from "./service/Util.service";
import { ScriptService } from "./service/Script.service";
import { SettingsService } from "./service/Settings.service";
import { RegisterComponent } from "./components/modules/Register.component";
import { LoginComponent } from "./components/modules/Login.component";
import { ProfileComponent } from "./components/modules/Profile.component";
import { TranslationService } from './service/Translation.service';
import { StripeElement } from './model/StripeElement';
import { CurrencyPipe } from '@angular/common';
import { CurrencySymbolNumberPipe } from "./Pipe/CurrencySymbolNumber.pipe";
import { DecimalPipe } from '@angular/common';
import { Md5 } from 'ts-md5/dist/md5';
import { connectableObservableDescriptor } from "rxjs/observable/ConnectableObservable";

declare var Stripe: any;
declare let jQuery: any;
declare var paypal: any;

export class GeneralLocalization extends NgLocalization {
  getPluralCategory(value: any) {
    if (value > 1) {
      return "other";
    }
  }
}

// Angular decorator
@Component({
  selector: "sedra-widget",
  template: require("raw-loader!./embed-widget.component.html"),
  providers: [{ provide: NgLocalization, useClass: GeneralLocalization }, CurrencyPipe, DecimalPipe, CurrencySymbolNumberPipe]
})

export class AppComponent implements OnInit {
  @ViewChild(RegisterComponent)
  private registerComponent: RegisterComponent;
  @ViewChild(LoginComponent)
  private loginComponent: LoginComponent;
  API_HOST: string;
  CONTRIBUTION_TYPE_LOGIN: string = "login";
  CONTRIBUTION_TYPE_REGISTER: string = "register";
  CONTRIBUTION_TYPE_GUEST: string = "guest";
  CONTRIBUTION_TYPE_EXPRESS: string = "express";
  mCampaignService: CampaignService;
  mStripeService: StripeService;
  mPledgeService: PledgeService;
  mUserService: UserService;
  mSettingsService: SettingsService;
  mCampaign: any;
  mCampaignManagerInfo: any = {
    "name": "",
    "description": "",
    "image": "",
    "links": []
  };
  mCampaignBusinessInfo: any = {
    "name": "",
    "description": "",
    "image": "",
    "links": []
  };
  mCampaignShowSlash: boolean = false;
  mCampaignStreams: Array<any> = [];
  mCampaignBackers: Array<any> = [];
  mCampaignFAQs: Array<any> = [];
  authToken: string;
  personId: string;
  campaignPercentage: number = 50;
  profileTypeId: number = -1;

  isContributionView: Boolean;
  isAddingCard: boolean = true;
  isAddingAddress: boolean = true;

  a2aUrl: String = (window.location != window.parent.location)
            ? document.referrer
            : document.location.href;

  a2aTitle: String = document.title;

  userInfo: Object = {
    "first_name": "",
    "last_name": "",
    "profile_image": "",
    "bio": "",
    "person_id": -2
  };

  registerInfo: any = {
    "first_name": "",
    "last_name": "",
    "email": "",
    "password": "",
    "password_confirm": ""
  };

  expressRegisterInfo: any = {
    "first_name": "",
    "last_name": "",
    "email": "",
    "password": "",
    "password_confirm": "",
    "inline_registration": true
  };

  contribution: any = {
    "rewardName": "",
    "amount": 0
  };
  shippingFee: any;
  totalAmount: number;
  contributionType: string = this.CONTRIBUTION_TYPE_LOGIN;

  rewardIndex: number;
  rewardPageNumber: number = 1;
  cardInfo: any = {
    "cardName": "",
    "cardNumber": "",
    "cardDate": "",
    "cardCVC": "",
    "email": ""
  };
  stripe_account_id: number;
  stripeCards: Array<any> = [];

  addressInfo: any = {
    "city_id": 0,
    "street1": "",
    "street2": "",
    "mail_code": "",
    "city": "",
    "country": ""
  };

  addressID: number;
  addressList: Array<any> = [];

  isAddingPhone: boolean = true;
  phoneList: Array<any> = [];
  phoneID: number;

  phoneInfo: any = {
    "number": null,
    "phone_number_type_id": null
  };

  isRewardShipping: Boolean = false;
  pledgeParam: any = {};

  guestPledgeParam: any = {};

  contactManagerMessage = {
    "person_id": "",
    "subject": "",
    "body": ""
  };
  isContactMessageSent = false;

  rewardContributionPageConfig = {
    "id": "rewards-contribution-pagination",
    "itemsPerPage": 5,
    "currentPage": 1
  };

  campaignBackersConfig = {
    "id": "campaign-backers-pagination",
    "itemsPerPage": 10,
    "currentPage": 1
  };

  campaignFaqsConfig = {
    "id": "campaign-faqs-pagination",
    "itemsPerPage": 10,
    "currentPage": 1
  };

  campaignStreamsConfig = {
    "id": "campaign-streams-pagination",
    "itemsPerPage": 7,
    "currentPage": 1
  };

  contributionMethod: Array<any> = [
    {
      "id": 0,
      "name": "Regular Contribution"
    },
    {
      "id": 1,
      "name": "Partially Anonymous Contribution"
    },
    {
      "id": 2,
      "name": "Fully Anonymous Contribution"
    }
  ];

  selectedStream: any = {};
  campaignErrorMessage: any = {};
  loginEmail: string;
  loginPassword: string;
  
  logginErrorMessage: string;


  isContributionMessageEnabled: boolean = false;
  isShippingFeeExcluded: boolean = false;
  isRegisterFormValid: boolean = false;
  isDisqusLoaded: boolean = false;
  isFontFamilyApplied: boolean = false;
  isStreamSelected: boolean = false;
  isContributionSubmitting: boolean = false;
  isPledgingSuccess: boolean = false;
  isLoggedInSuccessful: boolean = true;
  submitErrorMessage: string = "";
  isjQueryClicked: boolean = false;
  isCampaignTab: boolean = true;
  isFAQTab: boolean = false;
  isBackersTab: boolean = false;
  isStreamsTab: boolean = false;
  isCommentTab: boolean = false;
  isContactTab: boolean = false;
  isFormLogin: boolean = true;
  isCreatorTab: boolean = true;
  isCompanyTab: boolean = false;
  isLoginTab: boolean = true;
  isRegisterTab: boolean = false;
  isGuestTab: boolean = false;
  isExpressTab: boolean = false;
  isCustomCampaignPercentage: boolean = false;
  shouldCampaignAvatarImageShow: boolean = false;
  fbTrackingEnabled: boolean = false;
  googleTrackingEnabled: boolean = false;
  gaId: string = "";
  fbTrackingScript: SafeHtml;
  fbId: string = "";

  referralCandyEnabled: boolean;
  referralCandyEnablePopup: boolean;
  referralCandyData: any = {};
  referralCandyDiv: SafeHtml;

  fullUserData: any;

  siteLogo: Object = {
    "image": "",
    "link": ""
  }
  settingDecimalOption: number = 1;
  isCampaignShown: boolean = true;
  isProfileShown: boolean = false;

  minContributionAmount: number = 1;
  maxContributionAmount: number = 10000000000;
  allowMax: boolean = false;

  urlForgotPassword: string;
  urlTos: string;
  urlPrivacy: string;

  couponCode: string;
  currentCoupon: any;
  amountDiscounted: number;
  couponAppliedMessage: string;

  couponManagementEnabled: boolean;

  siteSettings: Object = {};
  profileResourceId: number = -1;
  isDropdownVisible: boolean = false;
  isMobile: boolean = false;

  stripeTokenOn: Boolean = false;
  stripePublicKey: String = '';
  stripeCampaignPublicKey: String = '';
  stripeElement: StripeElement;
  extraStripeDetails: Object = {
    address_city: '',
    address_country: '',
    address_line1: '',
    name: ''
  };
  stripeElementError: Boolean = true;
  isSubmitting: Boolean = false;

  currentTab: string = 'campaign';
  currentCreatorTab: string = 'creator';
  currentPaymentLoginTab: string = 'login';
  requireRewardAttributes: boolean = false;
  pledgeAttributes: any = [];
  tippingOptions: any;
  tipType: string = null;
  tip: any = {value: null, dollar_amount: 0, type: 'Dollar', name: ''};
  tipError: boolean = false;
  lowestAmount: any;
  tipInfo: any = "";
  contributeBehaviour: any;
  expressRegisterError: string;
  disclaimerMsg: any = {
    toggle: false
  };
  socialLogin: Object = {toggle: false};
  paypalAdded: boolean = false;
  paymentGateway: number = 1;
  siteCurrency: any = "USD";
  paypalPublishableKey: string = "";

  constructor( @Inject(CampaignService) campaignService: CampaignService, @Inject(TranslationService) private translationService: TranslationService, @Inject(UserService) userService: UserService, @Inject(StripeService) stripeService: StripeService, @Inject(PledgeService) pledgeService: PledgeService, @Inject(SettingsService) settingsService: SettingsService, private elementRef: ElementRef, private domSanitization: DomSanitizer, private http: Http, private cPipe: CurrencyPipe, private dPipe: DecimalPipe, private sPipe:CurrencySymbolNumberPipe) {
    
    //getting new Default and preferred lang
    if (window["widgetHost"] && window["DefaultPreferredLang"]) {
      UtilService.setWidgetHost(window["widgetHost"]);

      if(window["widgetUrl"]) {
        UtilService.setWidgetURLHost(window["widgetUrl"]);
      }
      UtilService.setLanguageHost(window["DefaultPreferredLang"]);

      this.API_HOST = ConstantsGlobal.getApiHost();
      this.urlForgotPassword = ConstantsGlobal.getSiteHost() + "login";
      this.urlTos = ConstantsGlobal.getSiteHost() + "tos";
      this.urlPrivacy = ConstantsGlobal.getSiteHost() + "privacy";

      this.resetPledgeParam();
      this.isContributionView = false;
      this.mCampaignService = campaignService;
      this.mStripeService = stripeService;
      this.mPledgeService = pledgeService;
      this.mSettingsService = settingsService;
      this.elementRef = elementRef;
      this.mUserService = userService;
      this.translationService.setupTranslation("campaign_page");

      this.mUserService.getAuthenticatedUser().subscribe(res => {
        //this.personId = res.person_id;
        //this.userInfo["firstName"] = res.first_name;
        this.onLoginSuccess(res);
      });

      this.shippingFee = !this.shippingFee ? 0 : this.shippingFee;
      let eleAttr = this.elementRef.nativeElement.attributes;
      for (let prop in eleAttr) {
        if (eleAttr.hasOwnProperty(prop)) {
          let eleAttrKey = eleAttr[prop]["name"];
          let eleAttrValue = eleAttr[prop]["value"];
          UtilService.widgetProp[eleAttrKey] = eleAttrValue;
        }
      }
      if (UtilService.widgetProp["campaignid"]) {
        UtilService.setCampaignID(UtilService.widgetProp["campaignid"]);
      }
      this.a2aUrl = UtilService.widgetProp["shareurl"]
      ? UtilService.widgetProp["shareurl"]
      : this.a2aUrl

      this.a2aTitle = UtilService.widgetProp["sharetitle"] || document.title;

    } else {
      console.error("app_local.js is not set up properly");
    }

  }

  ngOnInit() {

    if (window["widgetHost"] && window["DefaultPreferredLang"]) {
      if (UtilService.widgetProp["campaignid"]) {
        this.mSettingsService.getAllSettings().subscribe(
          res => {
            if (res) {
              for (let i in res) {
                this.siteSettings[res[i]["name"]] = res[i]["value"];
              }
              if (this.siteSettings.hasOwnProperty("site_campaign_exclude_shipping_cost")) {
                this.isShippingFeeExcluded = this.siteSettings["site_campaign_exclude_shipping_cost"];
              }
              if (this.siteSettings.hasOwnProperty("site_campaign_allow_contribution_message")) {
                this.isContributionMessageEnabled = this.siteSettings["site_campaign_allow_contribution_message"];
              }
              if (this.siteSettings.hasOwnProperty("site_campaign_decimal_option")) {
                this.settingDecimalOption = this.siteSettings["site_campaign_decimal_option"];
              }
              if (this.siteSettings.hasOwnProperty("site_theme_campaign_min_button_show")) {
                this.isCampaignShown = this.siteSettings["site_theme_campaign_min_button_show"];
              }
              if (this.siteSettings.hasOwnProperty("site_theme_campaign_min_contribute_amount")) {
                this.minContributionAmount = this.siteSettings["site_theme_campaign_min_contribute_amount"];
              }
              if (this.siteSettings.hasOwnProperty("site_theme_campaign_max_contribute_amount")) {
                this.maxContributionAmount = this.siteSettings["site_theme_campaign_max_contribute_amount"];
              }
              if (this.siteSettings.hasOwnProperty("site_campaign_coupon_management")) {
                this.couponManagementEnabled = this.siteSettings["site_campaign_coupon_management"].toggle;
              }
              if (this.siteSettings.hasOwnProperty("site_campaign_referralcandy_analytics")) {
                var rc = this.siteSettings["site_campaign_referralcandy_analytics"];
                this.referralCandyEnabled = rc.toggle;
                this.referralCandyData = {
                  appId: rc.id,
                  //the rest to be filled in on pledge
                }
                this.referralCandyEnablePopup = rc.enable_popup || false;
              }
              if (this.siteSettings.hasOwnProperty("site_campaign_reward_attributes_required")) {
                this.requireRewardAttributes = this.siteSettings["site_campaign_reward_attributes_required"];
              } else {
                this.requireRewardAttributes = false;
              }
              if (this.siteSettings.hasOwnProperty("site_tipping")) {
                this.tippingOptions = this.siteSettings["site_tipping"];
              } else {
                this.tippingOptions = { toggle: false };
              }
              //grab facebook analytics information from site
              if (this.siteSettings.hasOwnProperty("site_campaign_facebook_analytics")) {
                let analytics = this.siteSettings["site_campaign_facebook_analytics"];
                this.fbTrackingEnabled = analytics.toggle;
                if (analytics.toggle) this.fbId = analytics.code;
              }
              //grab google analytics from site
              if (this.siteSettings.hasOwnProperty("site_campaign_ecommerce_analytics")) {
                let analytics = this.siteSettings["site_campaign_ecommerce_analytics"];
                this.googleTrackingEnabled = analytics.toggle;
                if (analytics.toggle) this.gaId = analytics.code;
              }
              if (this.siteSettings.hasOwnProperty("site_contribute_behaviour")) {
                this.contributeBehaviour = this.siteSettings["site_contribute_behaviour"].default;
              } else {
                this.contributeBehaviour = 1;
              }
              if (this.contributeBehaviour == 2 || this.contributeBehaviour == 7) {
                this.currentPaymentLoginTab = 'guest';
                this.setContributeType(this.CONTRIBUTION_TYPE_GUEST); 
                this.setCurrentLoginTab('guest');
              } else if (this.contributeBehaviour == 5) {
                this.currentPaymentLoginTab = 'express';
                this.setContributeType(this.CONTRIBUTION_TYPE_EXPRESS); 
                this.setCurrentLoginTab('express');
              }
              if (this.siteSettings.hasOwnProperty("site_stripe_tokenization")) {
                this.stripePublicKey = this.siteSettings["site_stripe_tokenization"]['public_stripe_key'];
                this.stripeTokenOn = this.siteSettings["site_stripe_tokenization"]['toggle'];
                this.stripeElement = new StripeElement(this.stripeTokenOn, this.stripePublicKey);
              }
              if(this.siteSettings.hasOwnProperty('site_tip_currency')) {
                this.tipInfo = this.siteSettings['site_tip_currency'];
              }
              // Disclaimer setting
              if(this.siteSettings.hasOwnProperty('site_campaign_campaign_toggle_disclaimer_text')) {
                this.disclaimerMsg = this.siteSettings['site_campaign_campaign_toggle_disclaimer_text'];
              }
              if(this.siteSettings.hasOwnProperty("social_login")) {
                this.socialLogin = this.siteSettings['social_login'];
              }
              if(this.siteSettings.hasOwnProperty("site_payment_gateway")) {
                this.paymentGateway = this.siteSettings['site_payment_gateway'];
              }
              if(this.siteSettings.hasOwnProperty("site_campaign_fee_currency")) {
                this.siteCurrency = this.siteSettings['site_campaign_fee_currency'];
              }
              if(this.siteSettings.hasOwnProperty("paypal_publishable_key")) {
                this.paypalPublishableKey = this.siteSettings['paypal_publishable_key'];
              }
              this.getCampaign();
              this.getStripeChargeAmount();
            }
          },
          error => {
            this.getCampaign();
            UtilService.logError(error);
          }
        );

        if (this.personId) {
          this.getProfile();
        }
      }

      jQuery(document).ready(() => {
        if (jQuery(window).width() < 768) {
          this.isMobile = true;
        }
        jQuery(window).resize(() => {
          if (jQuery(window).width() < 768 && !this.isMobile) {
            this.isMobile = true;
            jQuery("#campaign-tabs").removeClass("tabular").addClass("secondary pointing");
          } else if (jQuery(window).width() >= 768 && this.isMobile) {
            this.isMobile = false;
            jQuery("#campaign-tabs").removeClass("secondary pointing").addClass("tabular");
          }
        });
      });
    }
  }

  setUpTipping() {
    if (this.tippingOptions.toggle_no_tip && this.tippingOptions.selectedTipDefault == 'no_tip') {
      this.tipType = 'no_tip';
    }
    else if(this.tippingOptions.toggle_dynamic && !this.tippingOptions.toggle_tiers) {
      this.tip = {value: null, dollar_amount: 0, type: 'Dollar', name: ''};
      if(this.tippingOptions.toggle_dynamic_min_max && this.tippingOptions.dynamic_min) {
        this.tip.value = this.tippingOptions.dynamic_min;
        this.tip.dollar_amount = this.tippingOptions.dynamic_min;
      }
      this.tipType = 'dynamic';
    } else if(this.tippingOptions.toggle_tiers) {
      this.tip = {value: null, dollar_amount: 0, type: 'Dollar', name: ''};
      if(this.tippingOptions.tiers[0]) {
        this.updateTierValues();
        var dollarAmount = this.tippingOptions.tiers[0].value;
        if(this.tippingOptions.tiers[0].type == "Percent"){
          dollarAmount = (this.tippingOptions.tiers[0].value / 100) * this.contribution["amount"];
          if(dollarAmount < this.lowestAmount && !this.siteSettings["site_campaign_combine_amount_tip"]) {
            dollarAmount = this.lowestAmount;
          }
        }
        this.tip = {value: this.tippingOptions.tiers[0].value, dollar_amount: dollarAmount, type: this.tippingOptions.tiers[0].type, name: this.tippingOptions.tiers[0].name};
      }
      this.tipType = 'tiers';
    } else if (!this.tippingOptions.toggle_dynamic && !this.tippingOptions.toggle_tiers && this.tippingOptions.toggle_no_tip) {
      this.tipType = 'no_tip';
    }

    if(this.tippingOptions.toggle) {
      this.pledgeParam['force_tip_processing'] = this.tippingOptions.toggle_process_tips_immediately;
    }

  }

  /**
   * Set proper text depending on how much is remaining in campaign
   */
  remainingTimeMapping(dateType: string) {
    switch (dateType) {
      case "day":
        this.mCampaign.remaining = this.mCampaign.days_remaining_inclusive;
        if (this.mCampaign.remaining > 0) {
          if (this.mCampaign.days_remaining_inclusive == "1") {
            this.mCampaign.remaining_text = "day_to_go"
          } else {
            this.mCampaign.remaining_text = "days_to_go";
          }
        } else {
          if (parseInt(this.mCampaign.days_remaining_inclusive) == -1) {
            this.mCampaign.remaining_text = "day_ago"
          } else {
            this.mCampaign.remaining_text = "days_ago";
          }
        }
        break;
      case "hour":
        this.mCampaign.remaining = this.mCampaign.hours_remaining_inclusive;
        if (this.mCampaign.remaining > 0) {
          if (this.mCampaign.hours_remaining_inclusive == "1") {
            this.mCampaign.remaining_text = "hour_to_go"
          } else {
            this.mCampaign.remaining_text = "hours_to_go";
          }
        } else {
          if (parseInt(this.mCampaign.hours_remaining_inclusive) == -1) {
            this.mCampaign.remaining_text = "hour_ago"
          } else {
            this.mCampaign.remaining_text = "hours_ago";
          }
        }
        break;
      case "minute":
        this.mCampaign.remaining = this.mCampaign.minutes_remaining_inclusive;
        if (this.mCampaign.remaining > 0) {
          if (this.mCampaign.minutes_remaining_inclusive == "1") {
            this.mCampaign.remaining_text = "minute_to_go"
          } else {
            this.mCampaign.remaining_text = "minutes_to_go";
          }
        } else {
          if (parseInt(this.mCampaign.minutes_remaining_inclusive) == -1) {
            this.mCampaign.remaining_text = "minute_ago"
          } else {
            this.mCampaign.remaining_text = "minutes_ago";
          }
        }
        break;
      case "second":
        this.mCampaign.remaining = this.mCampaign.seconds_remaining_inclusive;
        if (this.mCampaign.remaining > 0) {
          if (this.mCampaign.seconds_remaining_inclusive == "1") {
            this.mCampaign.remaining_text = "second_to_go"
          } else {
            this.mCampaign.remaining_text = "seconds_to_go";
          }
        } else {
          if (parseInt(this.mCampaign.seconds_remaining_inclusive) == -1) {
            this.mCampaign.remaining_text = "second_ago"
          } else {
            this.mCampaign.remaining_text = "seconds_ago";
          }
        }
        break;
      case "continue":
        this.mCampaign.remaining_text = "continuous_campaign";
        break;
      default:
        this.mCampaign.remaining = 0;
        this.mCampaign.remaining_text = "ended_now";
    }
    // this.mCampaign.remaining = Math.abs(this.mCampaign.remaining);
  }

  backersMapping(number?: string) {
    if (number) {
      switch (number) {
        case "1":
          return "backer";
        default:
          return "backers";
      }
    } else {
      switch (this.mCampaign.total_backers) {
        case "1":
          this.mCampaign.backers_text = "backer";
          break;
        default:
          this.mCampaign.backers_text = "backers";
          break;
      }
    }
  }

  ngAfterViewChecked() {
    if (!this.isFontFamilyApplied && this.mCampaign) {
      this.isFontFamilyApplied = true;
      UtilService.setFontFamily();
    }
    if (this.mCampaign) {
      UtilService.setPaginationColor();
    }
  }

  //COUPON APPLY

  applyCoupon(couponCode: string) {
    let plid = this.pledgeParam["pledge_level_id"];
    this.couponAppliedMessage = this.translate("campaign_page_searching_coupon");
    this.mCampaignService.getCouponData(ConstantsGlobal.CAMPAIGN_ID, couponCode, plid).subscribe(
      coupon => {
        this.currentCoupon = coupon;
        this.pledgeParam["coupon_code"] = this.couponCode;
        this.guestPledgeParam["coupon_code"] = this.couponCode;
        this.couponAppliedMessage = this.translate("campaign_page_coupl_applied");
        this.calculateTotalPayment();
      },
      error => {
        this.currentCoupon = undefined;
        this.amountDiscounted = 0;
        this.couponCode = "";
        this.couponAppliedMessage = this.translate("campaign_page_invalid_coupon");
        this.calculateTotalPayment();
      }
    )
  }

  /**
   * Get campaign data through API
   */
  getCampaign() {
    this.mCampaignService.getCampaignData(ConstantsGlobal.CAMPAIGN_ID).subscribe(
      campaign => this.formatCampaignData(campaign),
      error => {
        UtilService.logError(error);
        if (error.json().errors && error.json().errors.entry_id && error.json().errors.entry_id[0].code == "account_campaign_invalid_entry_id") {
          this.campaignErrorMessage = ConstantsGlobal.ERROR_CAMPAIGN_INVALID;
        }
        else {
          this.getCampaignStatus();
        }
      }
    );
  }

  getStripeChargeAmount() {
    if(this.paymentGateway == 1) {
      this.mStripeService.getStripeChargeAmount().subscribe(
        res => {
          if(res[0]) {
              this.lowestAmount = parseFloat(res[0].minimum_charge_amount);
            if(typeof this.tipInfo === 'undefined' || this.tipInfo == null) {
              this.tipInfo = res[0];
            }
          } else {
            this.lowestAmount = 0.5;
            if(this.mCampaign) {
              if(typeof this.tipInfo === 'undefined' || this.tipInfo == null) {
                this.tipInfo = this.mCampaign.currencies[0];
              }
            }
          }
        },
        error => UtilService.logError(error)
      );

      if (this.authToken) {
        this.mStripeService.getStripeAccount().subscribe(
          res => {
            if (res.length) {
              StripeService.stripe_account_id = res[0]["stripe_account_id"];
              this.stripe_account_id = res[0]["stripe_account_id"];
              if (this.stripe_account_id) {
                this.isAddingCard = false;
              }
              this.getStripeAccountCard();
              this.getUserAddress();
              this.getUserPhone();
            }
          },
          error => UtilService.logError(error)
        );
      }
    } else {
      if(this.mCampaign) {
        if(typeof this.tipInfo === 'undefined' || this.tipInfo == null) {
          this.tipInfo = this.mCampaign.currencies[0];
        }
      }
    }
  }

  loadPaypalScript(scriptUrl: string) {
    return new Promise((resolve, reject) => {
        const scriptElement = document.createElement('script')
        scriptElement.src = scriptUrl
        scriptElement.onload = resolve
        document.body.appendChild(scriptElement)
    })
  }

  /**
   * Get campaign data through API
   */
  checkPaypalGateway() {
    if(this.paypalAdded) {
      return;
    }
    // Add Paypal sdk to page if client id is set and payment gateway is 3(paypal).
    if(this.paymentGateway == 3 && this.paypalPublishableKey) {
      var currency = "USD";
      if(this.siteCurrency.length > 0) {
        currency = this.siteCurrency[0].code_iso4217_alpha;
      }
      if(this.mCampaign.currencies.length > 0) {
        currency = this.mCampaign.currencies[0].code_iso4217_alpha;
      }

      this.paypalAdded = true;

      this.loadPaypalScript('https://www.paypal.com/sdk/js?client-id='+this.paypalPublishableKey+'&intent=capture&components=buttons&currency='+currency).then(() => {
        let widget = this;

          paypal.Buttons({
                style: {
                  layout: 'vertical',
                  color:  'blue',
                  shape:  'rect',
                  label:  'paypal'
                },
                createOrder: function(data, actions) {
                  var campaign_currency = "USD";
                  if(widget.mCampaign.currencies.length > 0) {
                    campaign_currency = widget.mCampaign.currencies[0].code_iso4217_alpha;
                  }
      
                  var total = parseInt(widget.contribution["amount"]);
                  var items = [
                    {
                      name: "Contribution",
                      description: "Contribution towards " + widget.mCampaign.name + " campaign", 
                      unit_amount: { currency_code: campaign_currency, value: widget.contribution["amount"]},
                      quantity: "1",
                      tax: { currency_code: campaign_currency, value: "0.00"},
                    },
                  ];
      
                  // Calculate discount
                  if(widget.currentCoupon) {
                    var discount_amount = 0;
                    if(widget.currentCoupon.discount_amount > 0) {
                      discount_amount = parseInt(widget.currentCoupon.discount_amount);
                    }
                    if(widget.currentCoupon.discount_percentage) {
                      discount_amount = total*widget.currentCoupon.discount_percentage/100;
                    }
                  }
      
                  // Add tip
                  if(widget.tip.dollar_amount) {
                    total += parseInt(widget.tip.dollar_amount);
                    items.push(
                      {
                        name: "Tip",
                        description: "Platform tip via " + widget.mCampaign.name + " campaign",
                        unit_amount: { currency_code: campaign_currency, value: widget.tip.dollar_amount},
                        quantity: "1",
                        tax: { currency_code: campaign_currency, value: "0.00"},
                      }
                    );
                  }
      
                  var final_total = total;
                  // Calculate discount
                  if(widget.currentCoupon) {
                    final_total -= discount_amount;
                  }
      
                  var purchase_units = [
                    {
                      amount: { currency_code: campaign_currency, value: final_total,
                        breakdown: {
                          item_total: { currency_code: campaign_currency, value: total },
                          discount: { currency_code: campaign_currency, value: 0 },
                        }
                      },
                      items: items,
                    }
                  ];
      
                  // Add discount
                  if(widget.currentCoupon) {
                    purchase_units[0].amount.breakdown.discount = {
                      currency_code: campaign_currency,
                      value: discount_amount
                    };
                  }

      
                  return actions.order.create({
                    purchase_units: purchase_units,
                    application_context: {
                          shipping_preference: "NO_SHIPPING"
                    }
                  });
                },
                onCancel: function (data) {
                  // Show a cancel page, or return to cart
                },
                onError: function (err) {
                  // For example, redirect to a specific error page
                  // window.location.href = "/error";
                },
                onApprove: function(data, actions) {
                  // This function captures the funds from the transaction.
                  return actions.order.capture().then(function(details) {
                    widget.paypalPreparePledge(details.id);
                  });
                },
                onInit: function(data, actions)  {
                  // Disable the buttons
                  // actions.disable();
                },
                onClick: function() {
                }
              }).render('#paypal-button-container');
      });
    }
  }

  /**
   * format campaign data for easier navigation through campaign object
   * @param  {Object} campaignData the campaign object from
   */
  formatCampaignData(campaign: any) {
    if (campaign.managers) {
      campaign.managers[0].full_name = campaign.managers[0].first_name + " " + campaign.managers[0].last_name;
      if (campaign.managers[0].person_files) {
        campaign.managers[0].person_files[0].full_path = ConstantsGlobal.getApiUrlCampaignProfileImage() + campaign.managers[0].person_files[0].path_external;
      }
    }
    campaign.featured_image_full_path = this.getFeaturedImage(campaign, false);
    campaign.explore_image_full_path = this.getFeaturedImage(campaign, true);
    // if (campaign.pledges && campaign.pledges.length) {
    //   for (let i = 0; i < campaign.pledges.length; i++) {
    //     campaign.pledges[i].estimated_delivery_time = this.setDateObject(campaign.pledges[i].estimated_delivery_time);
    //   }
    // }
    if (this.isShippingFeeExcluded) {
      campaign.funded_amount = campaign.funded_amount_shipping_excluded;
    }
    this.campaignPercentage = (campaign.funded_amount / (campaign.funding_goal || 1)) * 100;
    campaign.progressID = "campaign" + campaign.id;
    campaign.description = this.domSanitization.bypassSecurityTrustHtml(campaign.description);
    this.mCampaign = campaign;

    this.checkPaypalGateway();

    this.processCampaignSettings();

    this.remainingTimeMapping(this.getCampaignRemainingUnit());
    if (this.mCampaign.entry_fee_percentage != null) {
      this.isCustomCampaignPercentage = true;
    }
    this.showProfile();
    this.mCampaignFAQs = this.mCampaign.faqs == null ? [] : this.mCampaign.faqs;
    this.getCampaignBackers();
    this.getCampaignStream();
    jQuery.getScript("https://static.addtoany.com/menu/page.js");
    this.getSiteLogo();

    if (this.mCampaign.settingsObject.hasOwnProperty("enable_rewards_pagination") && !this.mCampaign.settingsObject["enable_rewards_pagination"]) {
      this.rewardContributionPageConfig = {
        "id": "rewards-contribution-pagination",
        "itemsPerPage": 9999,
        "currentPage": 1
      };
    }

    if (this.siteSettings.hasOwnProperty("site_theme_campaign_min_contribute_amount")) {
            this.minContributionAmount = this.siteSettings["site_theme_campaign_min_contribute_amount"];
          }
          if (this.siteSettings.hasOwnProperty("site_theme_campaign_max_contribute_amount")) {
            this.maxContributionAmount = this.siteSettings["site_theme_campaign_max_contribute_amount"];
              }

    if (this.siteSettings.hasOwnProperty("site_theme_campaign_per_min") && this.siteSettings["site_theme_campaign_per_min"] && this.mCampaign.settingsObject.hasOwnProperty("min_contribution")) {
      this.minContributionAmount = this.mCampaign.settingsObject.min_contribution;
    }
    if (this.siteSettings.hasOwnProperty("site_theme_campaign_per_max") && this.siteSettings["site_theme_campaign_per_max"] && this.mCampaign.settingsObject.hasOwnProperty("min_contribution")) {
      this.maxContributionAmount = this.mCampaign.settingsObject.max_contribution;
    }
    if(window.location.hash.includes('id_token')){
      this.selectReward(0, true);
    }
  }

  getCampaignStatus() {
    this.mCampaignService.getCampaignStatus(ConstantsGlobal.CAMPAIGN_ID).subscribe(
      status => {
        if (status) {
          if (status.entry_status_id == 1) {
            this.campaignErrorMessage = ConstantsGlobal.ERROR_CAMPAIGN_BEING_EDITED;
          }
          else if (status.entry_status_id == 12) {
            this.campaignErrorMessage = ConstantsGlobal.ERROR_CAMPAIGN_BEING_REVIEWED;
          }
          else {
            this.campaignErrorMessage = ConstantsGlobal.ERROR_CAMPAIGN_BEING_OTHER_STATUS;
          }
        }
      },
      error => UtilService.logError(error)
    );
  }

  getProfile() {
    this.mUserService.getProfile(this.personId)
      .subscribe(
      res => {
        this.userInfo["first_name"] = res["first_name"];
        this.userInfo["last_name"] = res["last_name"];
        this.userInfo["profile_image"] = res.files != null && res.files.length ? ConstantsGlobal.getApiUrlCampaignProfileImage() + res.files[0].path_external : null;
        this.userInfo["bio"] = res["bio"];
        this.userInfo["person_id"] = res["person_id"];
        if (res.files && res.files.length) {
          this.profileResourceId = res.files[0]["id"];
        }
      },
      error => UtilService.logError(error)
      );
  }

  processCampaignSettings() {
    this.mCampaign.settingsObject = {};
    if (this.mCampaign.settings && this.mCampaign.settings.length) {
      for (let i = 0; i < this.mCampaign.settings.length; i++) {
        this.mCampaign.settingsObject[this.mCampaign.settings[i]["name"]] = this.mCampaign.settings[i]["value"];
      }
    }
  }

  /**
   * Check if campaign has ended
   * @return {boolean} True is campaign has ended
   */
  isCampaignAvailable() {
    if (this.mCampaign.campaign_started == "t" && this.mCampaign.ends) {
      let d = new Date();
      return d.getTime() >= this.setDateObject(this.mCampaign.ends).getTime();
    }
    else if (this.mCampaign.campaign_started == "f" || this.mCampaign.entry_status_id != 2) {
      return true;
    }
  }

  /**
   * Show profile depending on the setting
   */
  showProfile() {
    let campaignSettings = {};
    for (let index in this.mCampaign.settings) {
      campaignSettings[this.mCampaign.settings[index].name] = this.mCampaign.settings[index].value;
    }

    if (campaignSettings["toggle_profile_type_view_advance"]) {
      this.profileTypeId = campaignSettings["profile_type_view_id"];
      // Show both individual user and organization
      if (this.profileTypeId == 0 || this.profileTypeId == undefined) {
        this.setCampaignManagerInfo();
        this.currentCreatorTab = "creator";
        this.isCreatorTab = true;
        this.isCompanyTab = false;
        if (this.mCampaign.business_organizations != null && this.mCampaign.business_organizations.length) {
          this.setCampaignBusinessInfo();
          this.mCampaignShowSlash = true;
        }
      }
      // Show bussiness organization only
      else if (this.profileTypeId == 1) {
        if (this.mCampaign.business_organizations != null && this.mCampaign.business_organizations.length) {
          this.currentCreatorTab = "company";
          this.isCreatorTab = false;
          this.isCompanyTab = true;
          this.setCampaignBusinessInfo();
        }
        else {
          this.currentCreatorTab = "creator";
          this.isCreatorTab = true;
          this.isCompanyTab = false;
          this.setCampaignManagerInfo();
        }
      }
      // Show individual user only
      else if (this.profileTypeId == 2) {
        this.currentCreatorTab = "creator";
        this.isCreatorTab = true;
        this.isCompanyTab = false;
        this.setCampaignManagerInfo();
      }
    }
    else {
      this.currentCreatorTab = "creator";
      this.isCreatorTab = true;
      this.isCompanyTab = false;
      this.setCampaignManagerInfo();
      if (this.mCampaign.business_organizations != null && this.mCampaign.business_organizations.length) {
        this.setCampaignBusinessInfo();
        this.mCampaignShowSlash = true;
      }
      this.profileTypeId = 0;
    }
  }

  setCampaignManagerInfo() {
    this.mCampaignManagerInfo.name = this.mCampaign.managers[0].full_name;
    this.mCampaignManagerInfo.description = this.mCampaign.managers[0].bio;
    if (this.mCampaign.managers[0].person_files && this.mCampaign.managers[0].person_files.length) {
      this.mCampaignManagerInfo.image = ConstantsGlobal.getApiUrlCampaignProfileImage() + this.mCampaign.managers[0].person_files[0].path_external;
    }
    this.mCampaignManagerInfo.links = this.mCampaign.managers[0].person_websites;
  }

  /**
   * Get campaign comments Disqus
   */
  getCampaignComments() {
    if (!this.isDisqusLoaded) {
      this.http.get(ConstantsGlobal.getApiUrlDisqusSetting())
        .map(res => res.json())
        .subscribe(
        res => {
          let disqus_shortname = res[0].value;
          if (disqus_shortname) {
            jQuery("<div id='disqus_thread'></div>").insertAfter("#insert_disqus");
            let dsq = document.createElement("script");
            dsq.type = "text/javascript";
            dsq.async = true;
            dsq.src = "//" + disqus_shortname + ".disqus.com/embed.js";
            jQuery("head").append(dsq);
            this.isDisqusLoaded = true;
          }
        },
        error => UtilService.logError(error)
        );
    }
  }

  /**
   * Change between campaign and pledge view
   * @param  {Boolean} isContributionView boolean for variable
   */
  changeView(isContributionView: Boolean) {
    this.isContributionView = isContributionView;
    if (this.isContributionView === true) {
      jQuery(this.elementRef.nativeElement).find("#login-form").form({
        fields: {
          email: {
            identifier: "email",
            rules: [{
              type: "empty",
              prompt: "Please enter your email"
            }]
          }
        }
      });
      jQuery(".contact-message.form").form("clear");
      setTimeout(() => {
        jQuery("html, body").animate({
          scrollTop: jQuery("#contribute-column").offset().top
        }, "fast");
        this.setSelectedRewardBorder(true);
      });
    }
    else if (isContributionView === false) {
      jQuery("#contribution-campaign-rewards").accordion("close", this.rewardIndex);
      this.rewardContributionPageConfig.currentPage = 1;
      jQuery("#account-info .ui.form").form("clear");
      jQuery(".address-form.ui.form").form("clear");
    }
  }

  setCampaignBusinessInfo() {
    this.mCampaignBusinessInfo.name = this.mCampaign.business_organizations[0].name;
    this.mCampaignBusinessInfo.description = this.mCampaign.business_organizations[0].description;
    if (this.mCampaign.business_organizations[0].business_files && this.mCampaign.business_organizations[0].business_files.length) {
      this.mCampaignBusinessInfo.image = ConstantsGlobal.getApiUrlCampaignProfileImage() + this.mCampaign.business_organizations[0].business_files[0].path_external;
    }
    if (this.mCampaign.business_organizations[0].business_websites && this.mCampaign.business_organizations[0].business_websites.length) {
      this.mCampaignBusinessInfo.links = this.mCampaign.business_organizations[0].business_websites;
    }
  }

  /**
   * get the time unit for remaing time of campaign
   * @return {string} time unit
   */
  getCampaignRemainingUnit() {
    if (this.mCampaign.ends_date_time == null) {
      return "continue";
    }
    else if (Math.abs(parseInt(this.mCampaign.days_remaining_inclusive)) > 0) {
      return "day";
    }
    else if (Math.abs(parseInt(this.mCampaign.hours_remaining_inclusive)) > 0) {
      return "hour";
    }
    else if (Math.abs(parseInt(this.mCampaign.minutes_remaining_inclusive)) > 0) {
      return "minute";
    }
    else if (Math.abs(parseInt(this.mCampaign.seconds_remaining_inclusive)) > 0) {
      return "second";
    }
    else {
      return null;
    }
  }
  
  /**
  * convert postgresql date to ISO format 
  * @param {String} date the date string
  * @return {String}     the string in ISO format 
  */
  SQLTimestampToISO(date){
    date = date.replace(' ', 'T');
    if(date.length > 19){
      if(date.charAt(date.length-3) != ':'){
        date = date+":00"
      }
    }
    return date;
  }

  /**
   * get how long the campaign has beeing raising money
   * @return {Object} contains unit and elapsed time
   */
  getRaisedInPeriod() {
    let returnDate = {
      "unit": "",
      "elapsed": 0
    };
    let elapsedSecond = this.mCampaign.seconds_elapsed;
    let elapsedMinute = elapsedSecond / 60;
    let elapsedHour = elapsedMinute / 60;
    let elapsedDay = elapsedHour / 24;
    let elapsedMonth = elapsedDay / 30;
    let elapsedYear = elapsedMonth / 12;

    if (elapsedYear >= 1) {
      returnDate.elapsed = Math.floor(elapsedYear);
      if (returnDate.elapsed > 1) {
        returnDate.unit = "years";
      }
      else {
        returnDate.unit = "year";
      }
    }
    else if (elapsedMonth >= 1) {
      returnDate.elapsed = Math.floor(elapsedMonth);
      if (returnDate.elapsed > 1) {
        returnDate.unit = "months";
      }
      else {
        returnDate.unit = "month";
      }
    }
    else if (elapsedDay >= 1) {
      returnDate.elapsed = Math.floor(elapsedDay);
      if (returnDate.elapsed > 1) {
        returnDate.unit = "days";
      }
      else {
        returnDate.unit = "day";
      }
    }
    else if (elapsedHour >= 1) {
      returnDate.elapsed = Math.floor(elapsedHour);
      if (returnDate.elapsed > 1) {
        returnDate.unit = "hours";
      }
      else {
        returnDate.unit = "hour";
      }
    }
    else if (elapsedMinute >= 1) {
      returnDate.elapsed = Math.floor(elapsedMinute);
      if (returnDate.elapsed > 1) {
        returnDate.unit = "minutes";
      }
      else {
        returnDate.unit = "minute";
      }
    }
    else if (elapsedSecond >= 1) {
      returnDate.elapsed = Math.floor(elapsedSecond);
      if (returnDate.elapsed > 1) {
        returnDate.unit = "seconds";
      }
      else {
        returnDate.unit = "second";
      }
    }

    return returnDate;
  }

  /**
   * get featured image by looping through the files with correct region_id
   * @param  {Object} campaign the campaign object
   * @return {Object}          the object that has the image
   */
  getFeaturedImage(campaign, getExplore: boolean) {
    let path: string;
    let files: Array<Object> = campaign.files;
    if (files && files.length) {
      for (let i = 0; i < files.length; i++) {
        if (files[i]["region_id"] == 3) {
          if (getExplore) {
            path = ConstantsGlobal.getApiUrlCampaignThumbnailImage() + files[i]["path_external"];
          }
          else {
            path = ConstantsGlobal.getApiUrlCampaignDetailImage() + files[i]["path_external"];
          }
          return path;
        }
      }
    }
    return null;
  }

  /**
   * Set date object with date string
   * @param  {any}    date Date string
   * @return {Object}      Date object
   */
  setDateObject(date: any) {
    if (date) {
      let offset = "";
      if (typeof date === "string" && date.length < 30) {
        offset = date.substr(date.length - 3);
        date = date.substr(0, date.length - 3).replace(" ", "T");
        date = date.concat("Z");
      }
      let dateObj: any = UtilService.getDateObject(date);
      dateObj = dateObj.setHours(dateObj.getHours() + parseInt(offset) * -1);
      return UtilService.getDateObject(dateObj);
    }
  }

  getDateForDisplay(date: any) {
    return UtilService.getDateForDisplay(date);
  }

  /**
   * Get campaign streams
   */
  getCampaignStream() {
    if (!this.mCampaignStreams.length) {
      this.mCampaignService.getCampaignStream(ConstantsGlobal.CAMPAIGN_ID)
        .subscribe(
        streams => this.mCampaignStreams = streams,
        error => UtilService.logError(error)
        );
    }
  }

  getSelectedStream(stream: Object, index: number) {
    for (let prop in stream) {
      this.selectedStream[prop] = stream[prop];
    }
    this.selectedStream['message'] = this.domSanitization.bypassSecurityTrustHtml(stream['message']);
    this.selectedStream["index"] = index;
    this.isStreamSelected = true;
  }

  /**
   * get campaign backers
   */
  getCampaignBackers() {
    this.backersMapping();
    if (!this.mCampaignBackers.length) {
      this.mCampaignService.getCampaignBackers(ConstantsGlobal.CAMPAIGN_ID)
        .subscribe(
        res => {
          this.mCampaignBackers = res == null ? [] : res;
        },
        error => UtilService.logError(error)
        );
    }
  }

  /**
   * Select reward and save accordion item index for further control
   * @param  {number}  rewardIndex   the position of selected reward in accordion
   * @param  {boolean} openAccordion optional, open accordion or not
   */
  selectReward(rewardIndex: number, openAccordion?: boolean) {
    this.currentCoupon = undefined;
    this.couponCode = "";
    this.amountDiscounted = 0;
    if (rewardIndex === 0) {
      if (this.siteSettings.hasOwnProperty("site_theme_campaign_max_pledge_enabled") && this.siteSettings["site_theme_campaign_max_pledge_enabled"]) {
        this.allowMax = true;
      }
    } else {
      this.allowMax = false;
    }
    jQuery(".contribution-input.ui.form").form("reset");
    this.changeView(true);
    this.rewardIndex = rewardIndex > 0 ? rewardIndex + (this.rewardContributionPageConfig.currentPage - 1) * this.rewardContributionPageConfig.itemsPerPage : 0;
    if (this.rewardIndex > 0) {
      jQuery(".guestTab").attr('style', 'display: none !important;');
      let reward = this.mCampaign.pledges[this.rewardIndex - 1];
      this.contribution["amount"] = reward.amount;
      this.contribution["rewardName"] = reward.name;
      this.contribution["attributes"] = reward.attributes;
      if (reward.attributes) {
        if (reward.attributes.variation) {
          let variationArray = [];
          reward.attributes.variation.forEach((value, index) => {
            this.pledgeAttributes.push({ choice: null, name: value.name });
          });
        }
      }
      this.pledgeParam["pledge_level_id"] = reward.pledge_level_id;
      this.guestPledgeParam["pledge_level_id"] = reward.pledge_level_id;
      if (reward.shipping && reward.shipping.length) {
        this.isRewardShipping = true;
        if (this.addressList.length) {
          this.pledgeParam["shipping_address_id"] = this.pledgeParam["shipping_address_id"] == null ? this.addressList[0]["id"] : this.pledgeParam["shipping_address_id"];
          this.selectAddress(this.addressList[0]);
          this.isAddingAddress = false;
        }
        else {
          this.isAddingAddress = true;
        }
        if (this.phoneList.length) {
          this.pledgeParam["phone_number_id"] = this.pledgeParam["phone_number_id"] == null ? this.phoneList[0]["id"] : this.pledgeParam["phone_number_id"];
          this.selectPhone(this.phoneList[0]);
          this.isAddingPhone = false;
        }
        else {
          this.isAddingPhone = true;
        }
      }
      else {
        this.isRewardShipping = false;
        this.shippingFee = 0;
        this.isAddingAddress = false;
        this.isAddingPhone = false;
      }
    } else {
      jQuery(".guestTab").attr('style', 'display: inline-block !important;');
      this.contribution["amount"] = this.minContributionAmount;
      this.contribution["rewardName"] = "Contribution";
      this.contribution["attributes"] = null;
      this.isRewardShipping = false;
      this.isAddingAddress = false;
      this.isAddingPhone = false;
      this.pledgeParam["shipping_address_id"] = null;
      this.pledgeParam["phone_number_id"] = null;
      this.pledgeParam["pledge_level_id"] = null;
      this.shippingFee = 0;
      // this.calculateTotalPayment();
    }
    if(this.tippingOptions.toggle) {
      this.setUpTipping();
    }
    if (openAccordion) {
      if (this.rewardIndex > this.rewardContributionPageConfig.currentPage) {
        this.rewardPageNumber = this.rewardContributionPageConfig.currentPage;
        this.rewardIndex = this.rewardIndex - (this.rewardContributionPageConfig.currentPage - 1) * this.rewardContributionPageConfig.itemsPerPage;
        if (this.rewardContributionPageConfig.currentPage > 1) {
          jQuery(jQuery("pagination-controls#rewards-contribution-pagination").find("li").get(this.rewardContributionPageConfig.currentPage - 1)).find("span")[0].click();
        }
        this.isjQueryClicked = true;
      } else {
        this.rewardPageNumber = 1;
      }
      setTimeout(() => {
        jQuery("#contribution-campaign-rewards").accordion("open", this.rewardIndex);
      });
    }
    this.calculateTotalPayment();
  }

  setSelectedRewardBorder(toShowBorder?: boolean) {
    jQuery("#contribution-rewards .campaign-reward").removeAttr("style");
    if (toShowBorder) {
      jQuery("#contribution-rewards .campaign-reward.selected").css("background", UtilService.widgetProp.themecolor);
    }
  }

  /**
   * Select address, also calculate shipping fee
   * @param  {Object} address address object
   */
  selectAddress(address: Object) {
    if (address["address_id"]) {
      this.pledgeParam["shipping_address_id"] = address["id"];
      this.addressID = address["id"];
    }
    if (this.mCampaign && this.mCampaign.pledges && this.mCampaign.pledges.length) {
      let reward = this.mCampaign.pledges[this.rewardIndex - 1];
      if (reward && reward.shipping != null && reward.shipping.length) {
        this.calculateShippingFee(reward.shipping, address);
      }
    }
  }

  selectPhone(phone: any) {
    if (phone["id"]) {
      this.pledgeParam["phone_number_id"] = phone["id"];
      this.phoneID = phone["id"];
    }
  }

  /**
   * Calculate shipping fee with given reward shipping options and address
   * @param  {Array<any>} rewardShippings reward shipping options
   * @param  {Object}     address         address object
   */
  calculateShippingFee(rewardShippings: Array<any>, address: Object) {
    for (let index in rewardShippings) {
      if (rewardShippings[index]["subcountry_id"] == address["subcountry_id"] && rewardShippings[index]["shipping_option_type_id"] == 3) {
        this.shippingFee = rewardShippings[index]["cost"];
        break;
      }
      else if (rewardShippings[index]["country_id"] == address["country_id"] && rewardShippings[index]["shipping_option_type_id"] == 2) {
        this.shippingFee = rewardShippings[index]["cost"];
        break;
      }
      else if (rewardShippings[index]["shipping_option_type_id"] == 1) {
        this.shippingFee = rewardShippings[index]["cost"];
        break;
      }
    }
    this.calculateTotalPayment();
  }

  onRegisterSuccess(data) {
    this.loginEmail = data["email"];
    this.loginPassword = data["password"];
    this.mUserService.login(this.loginEmail, this.loginPassword).subscribe(
      data => {
        this.onLoginSuccess(data);
        this.loadReferralCandyPopup();
      },
      error => {
        this.onLoginFailed(error);
      }
    );
  }

  onRegisterContributionSuccess(data) {
    if (!jQuery(".form .field.error").length) {
      if(data.paypal_order_id) {
        this.pledgeParam["inline_token"] = data.inline_token;
        this.paypalPledge(data.paypal_order_id);
        return;
      }
      this.loginEmail = data["email"];
      this.loginPassword = data["password"];
      this.isContributionSubmitting = true;
      this.pledgeParam["amount"] = this.totalAmount;
      let exp_month, exp_year;
      if (this.cardInfo["cardDate"]) {
        exp_month = this.cardInfo["cardDate"].split(" / ")[0];
        exp_year = this.cardInfo["cardDate"].split(" / ")[1];
      }
      this.pledgeParam["inline_token"] = data["inline_token"];
      if (this.stripeElement.toggle) {
        let card_token = '';
        let widget = this;
        this.extraStripeDetails['name'] = this.cardInfo['cardName'];
        if (this.addressInfo) {
          this.extraStripeDetails['address_city'] = this.addressInfo['city'];
          this.extraStripeDetails['address_country'] = this.addressInfo['country'];
          this.extraStripeDetails['address_line1'] = this.addressInfo['street1'];
        }
        // this.extraStripeDetails['address'] = this.addressInfo["street1"] + ', ' + this.addressInfo["city_id"];
        this.stripeElement.getStripe().createToken(this.stripeElement.cardNumber, this.extraStripeDetails).then(function (result) {
          if(!result.error) {
            // Send the token to your server
            card_token = result.token.id;
            widget.mStripeService.setStripeAccount(exp_month, widget.cardInfo["cardNumber"], exp_year, widget.cardInfo["cardCVC"], data["inline_token"], card_token).subscribe(
              res => {
                StripeService.stripe_account_id = res["stripe_account_id"];
                widget.pledgeParam["stripe_account_card_id"] = res.cards[0]["stripe_account_card_id"];
                if (widget.isAddingAddress) {
                  widget.addressInfo["inline_token"] = data["inline_token"];
                  widget.phoneInfo["inline_token"] = data["inline_token"];
                  widget.mUserService.setNewAddress(widget.addressInfo).subscribe(
                    res => {
                      widget.pledgeParam["shipping_address_id"] = res.address_id;
                      widget.mUserService.setNewPhone(widget.phoneInfo).subscribe(
                        res => {
                          widget.pledgeParam["phone_number_id"] = res.phone_number_id;
                          widget.pledge();
                        }
                      );
                    }
                  );
                }
                else {
                  widget.pledge();
                }
              },
              error => {
                widget.submitErrorMessage = UtilService.logError(error);

                //Check for extra errors 
                let errorJson = error.json();
                if(errorJson.code == 'entity_not_found') {
                  widget.submitErrorMessage = this.translate("campaign_page_entity_not_found_error");
                }
                if(errorJson.code == 'account_profile_stripe_pledge_direct_off_missing_connected') {
                  widget.submitErrorMessage = this.translate("campaign_page_missing_connect");
                }

                widget.isContributionSubmitting = false;
                if (!widget.authToken) {
                  // widget.switchToLogin();
                }
                widget.mUserService.disableUser(data).subscribe(
                  data => {
                    widget.isContributionSubmitting = false;
                    if(!widget.submitErrorMessage) {
                      widget.submitErrorMessage = widget.translate("campaign_page_stripe_elements_error");;
                    }
                  },
                  error => {
                    let jsonError = error.json();
                  }
                );
              }
            );
          } else {
            widget.mUserService.disableUser(data).subscribe(
              data => {
                widget.isContributionSubmitting = false;
                if(!widget.submitErrorMessage) {
                  widget.submitErrorMessage = widget.translate("campaign_page_stripe_elements_error");;
                }              },
              error => {
                let jsonError = error.json();
              }
            );
          }
        });
      } else {
        this.mStripeService.setStripeAccount(exp_month, this.cardInfo["cardNumber"], exp_year, this.cardInfo["cardCVC"], data["inline_token"]).subscribe(
          res => {
            StripeService.stripe_account_id = res["stripe_account_id"];
            this.pledgeParam["stripe_account_card_id"] = res.cards[0]["stripe_account_card_id"];
            if (this.isAddingAddress) {
              this.addressInfo["inline_token"] = data["inline_token"];
              this.phoneInfo["inline_token"] = data["inline_token"];
              this.mUserService.setNewAddress(this.addressInfo).subscribe(
                res => {
                  this.pledgeParam["shipping_address_id"] = res.address_id;
                  this.mUserService.setNewPhone(this.phoneInfo).subscribe(
                    res => {
                      this.pledgeParam["phone_number_id"] = res.phone_number_id;
                      this.pledge();
                    }
                  );
                }
              );
            }
            else {
              this.pledge();
            }
          },
          error => {
            this.submitErrorMessage = UtilService.logError(error);
            this.isContributionSubmitting = false;
            if (!this.authToken) {
              this.switchToLogin();
            }
          }
        );
      }
    }
  }

  onRegisterFailed(data: any) {
    this.isContributionSubmitting = false;
  }

  switchToLogin() {
    this.setContributeType(this.CONTRIBUTION_TYPE_LOGIN); 
    this.setCurrentLoginTab('login')
    jQuery(".account-info-tab-menu").find(".item").tab("change tab", "login");
    this.logginErrorMessage = this.translate("created_account_bad_payment");
    this.isLoggedInSuccessful = false;
    this.setContributeType(this.CONTRIBUTION_TYPE_LOGIN);
  }

  /**
   * Calculate total amount to be pledged
   */
  calculateTotalPayment() {
    let contrib = parseFloat(this.contribution["amount"]);

    if (this.currentCoupon) {
      if (this.currentCoupon.discount_amount > 0) {
        if (this.currentCoupon.discount_amount > contrib)
          this.amountDiscounted = contrib;
        else
          this.amountDiscounted = this.currentCoupon.discount_amount;
      } else if (this.currentCoupon.discount_percentage > 0) {
        this.amountDiscounted = contrib * (this.currentCoupon.discount_percentage / 100.0);
      } 
    }

    this.totalAmount = parseFloat(this.contribution["amount"]) - this.amountDiscounted + parseFloat(this.shippingFee);
    if (isNaN(this.totalAmount)) {
      this.totalAmount = 0;
    }

    if(this.tipType == 'tiers') {
      this.updateTierValues();
    }
    if(this.tip.value && this.tip.value != 0 && this.tip.type == 'Percent') {
      var tipAmount: number = (parseFloat(this.tip.value) / 100) * parseFloat(this.contribution["amount"]);
      
      if(!this.siteSettings["site_campaign_combine_amount_tip"]) {
        if(tipAmount < this.lowestAmount) {
          tipAmount += this.lowestAmount;
        }
      }

      //Calculate dollar amount on init
      this.tip.dollar_amount = tipAmount;
      
      if(this.tippingOptions.toggle_tier_names) {
        var percentString = this.tip.name + ' - ';
      } else {
        var percentString = ''
      }

      var percentString = percentString + this.sPipe.transform(this.tipInfo.code_iso4217_alpha) + ' ' + this.dPipe.transform(tipAmount, '1.2-2');
      
      jQuery('.tip-tiers').find('.item').first().click();
      jQuery('.tip-tiers').dropdown('set text', percentString);
    }
    
    this.pledgeParam["amount"] = this.totalAmount;
  }

  reCalcContributionAmount() {
    if (!this.contribution["amount"]) {
      this.contribution["amount"] = this.minContributionAmount;
    }
    this.calculateTotalPayment();
  }

  onContributionAmountPressed(event) {
    if (event && /\./.test(event.key) && this.settingDecimalOption > 1) {
      return false;
    }
    return true;
  }

  /**
   * Toggle between add new card view and select card view
   */
  toggleNewCard() {
    this.isAddingCard = !this.isAddingCard;
    jQuery(".credit-card-form .ui.form").form("clear");
  }

  /**
   * Select a card from dropdown
   * @param  {Object} card Card object in cards array
   */
  selectCard(card: Object) {
    if (card["stripe_account_card_id"]) {
      StripeService.stripe_account_card_id = card["stripe_account_card_id"];
      this.pledgeParam["stripe_account_card_id"] = StripeService.stripe_account_card_id;
    }
  }

  /**
   * Get card type with given stripe account card type id
   * @param  {number} cardTypeId stripe account card type id
   * @return {string}            path for card"s image
   */
  getCardType(cardTypeId: number) {
    switch (cardTypeId) {
      case 1:
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPEwQ0IXda5QAAAvNJREFUWMPtll2IjFEcxn/zzqeZ3R0zO4u1g12zVrIktIhNIm4UiVyQfCREbBLJhYgkN4oLKSStFOVC2ZbCZvPRUutrGGbFsqbBsrPzPfu+57h412ykLOvCMs/V6fS+nd95/s9TxzByyxNJP5BCP1EONAf6t8sgpcy1/r8ENf1w97jhx1+bC2BVpB846hwFQDSl4avx46vxk0gLdpxtw1fjp6klDkC6S1Db+In5h1qYvCvA1jNtCNFThetPoozZ9hRfjZ+OuNYHR8esg0wnGG1E3j3GGWvS9weOBuCGPwbAwslO7FaFmwEdsMRtQdUks/cHCXWolBZZKHGZufqoE0UpAUAIyebTb8moOvjL92kmltl/E7T6WHYp4iqrD5zg5PD1SIcXA3C47gMAm+Z60IQkHFEBKMwz4m9LEepQmVpup3ZTaRbuqx60JklkJOWDLQTDGe69TPQK9KejdzlM3O+ayerWY6SsI/gYVXn1IcNQl5myQVaiSaHH1whWs4LTbgTgTjDBqYZ2NCFRlJ7MH7z0HoAjK70A1D+M/rmMLqpy0hCr5o1jDnXNnQDsXDAYgFBHFwBVPgcAIzwW9i4eAsC+i2Gq97wgltJz2B5TaWpJML3CQUWxjTyrQvPr5DeO9wl03vgCABreuDlSr499dmUeAMFwuhu0Z3zLZrhp2lfBuGE2whE1G5Xaxs8AzJ9YQDIjmFA6AIBPvShUr0DHem3ZsbXHNJbPcGE16b8+eJ0EoHKYDSlltiTuPBNrZhUCEE8LVE1y9IoOvPNciMrtz2jsLmFL92V/vUzfKX+AEaddIZLQ87i2GwDg1nP9sLJBViIJwaRdASq9NoQEf1sKgA1zPNx+EUcTuvNLpw0EIPAuzfFr7dwNJphS7ug7qA7n4dztzxS7zHgLLQBIKYmnBV63maJ8E0JKFlc5uRmIo2qSFdUuNs4twpNvYveFEF63mb1Lihk1xApAKiO43NzJw9Zk7lGSA/0HXk/nDTlHc6A50D+gL+loLFjxf8xyAAAAAElFTkSuQmCC";
      case 2:
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPEwwVpcfAswAAA7dJREFUWMPtl1tsFFUYx38zO3vpXrq7Xbpbbe0FbaJUhKaNpEQEChYUNTyBEjEhPqAJiTEUGh+8IsZgTYgxCiYUXyQaYvqg2Io0aSwXhdBSBRt6oU3s/bK73Qt76eweH4pDlqWUxzXZfzLJnDnfmfOb75zzP2ckIYQ4NRLhw78CDIVUMknFFh3vP2FnS2EO0qnhm2LXBS+ZrBNPuZCebBkXmZbJO1VqVZAzHRJgKKQi8z9RFjQLmulS7vZQAga2PoBFuf0dh64F2F+RmxZb1jxKNCHovyN+MfUF5lj36yR5RpnfN3vS2m7vmKZ9InZv0PUFRsKqoPrnMZJCUGpV+GWDG4BtHdN0e+MAHKtx8dojFnoDakp8kUWhbaObDWcmGQ6n258sSXy1yklrbT5LbQqNfwc5MRhmtdvI8RoXr//hTYFcEPRQpYO3u/x440mMMlzxzfHbRJSnPSZuBFX8cwKAfZ1+OurcBFVB/WUf3ngSAPWWNw+FVEKqoNyW2k1fUOXljhl+XJ/P4Z4gX/aGsOslPq928s4VP83/RBYf+kqnHk+OjtbRKAYZDlc7eeOij3e7Z2mvM2lxJRYdN0IqXd44y50GWkajWBWJuaRIm0ZvPmrTysvserp9cd667OfF9ikSAsw6iXObPHwzEObr/vD9zdHGKgcH/pxFFVBXYKLKZcCsk+gJqAwE57S4AyvsvHrey95OP2vdRhICdpdb+eJ6MOV9AthzyaeV13mMfL9mCT+NRGgbnx/e79a4UGSJg1cD97eYHrYqPO4w8MLgNACnx6KcHotq9Q1ds9r9pgdzyDfKXA+oDIVUDDLUL7OlgcrAD2uXaOWHzDqO9IZoG4+hSKAK2HF2hovPetj7mI3GnuDioB+ttNPUH+JmYn5evVRq1uo+vhrg7GQMt+n26myoyKW+008sCTvLzMiSlNZBEtjf6U/JcH9QRS9B2zNuvh0Mc7QvzOrWCTq3FDATT3J8ILywj3pMMrUFJs6MR3HoJY6scmLTy5ybirGtxMz2EjN2vURSgEM/D7RzqYVym4LbJPPBCvt8xiwKpVZFO/U49BJT0YR2TUcT5BtlWmrzmYgkaKjIZcethOy55OOTSgdbi3LSLdN9clgAfFbl4JUyS+rxqnmUSELwfKGJYzWutMZH+0LsLrcC8Om1APvu4rMLqWUkwq4LXorMOs5v9mCQpXv6qAaa3UKzoFnQLGiGgf5nzhn/u/ze8tyMBz240o78XGEOTTV5FFt0GQdYbNHRVJPHxgIT/wIHPWlnkbJpKwAAAABJRU5ErkJggg==";
      case 3:
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPEwsjJTzD7QAABH5JREFUWMPtmG1sU2UUx3/3tr3d7Vq6rttoN8eG4IARcCIMRtyCAx1OQDCBGEIkBP1AglkCiDGKLqAJMYAZQtDxQRc+QTSEYAjyIgQNaTZgc7xsbBM2unWvbSlbX9a1vX7gTaKMC8OkJJ7kfrg3J8/95Tzn/M95HkFRFOW04yK79/1MR5ebeLL0tGTWrlzInFlTEE47Lioff/UD8WzbP3kPzYCUWd4/EIxr0MvNbYjxtt3/Zh1dbkSeEXtmQLWP5a0oZIb8FLq7yb/ZS2o4RLde5rzZyhmrDWdCIgjCXWfy7D0sntjMi9YuzNogvohMvWc0BxtyqOtMAwTVvxYK3l6vqHG0hAfZ2niOjFDgoT7OBAObJryMnBamsuQIZu3Di9QXkfngZAktbsvTA80Z8LHtSrWqPBFHhTGV9aCxqovUZ9WvcqIle+Q5ag2HVEMK+igJ03sYOgsxlYq3Of8UOSmeEYIqClsaL6iuOP3UvntpF6lWn/oVxceA2JODZgX9jAn51eWQMYw4aujee+zW7UeNmbVBZo3pUg+q0Yjs3ryGovzJmIwy279ci6503jB0AtKS0tvyYfvnXsfaAVGCl7bDwmswaeNDl1o6qREAg6ynvGz58PKUYhlFZnoqYzNtZNhSsCSbGXJ7MO79GjHdhnLTh//Dckw/fU/M6SK4tYLEbZuJub0krJiJmD0evJ0MVW1Av+Mi0WPbYFYh3NgPtRtA0MCMPWDKgaF+qH4fik9C8x6mTUjiyDtrqG+8jqvbPXxEx2fZOXTMQYbNSprVjE6AaFs7wZ2VhCqr0BUVoJ2RR6zVycDqMpAkghXfobi9aKbOJvLjF4jTShFfyEfp7yVych/YX4eOw4ACSgSadsHVnZBWCElTIdQJ3lr0aTMoXfU5oVCY2svXhgfNmzyO85daWFCcz4nf69BmZSK9Ngfd3CKibR1Em/4kfOgowR17SKo5ju6VmUQu1COYjMTaGlA8LsKbiiDRQvR4JYIwAEoMpOQ7c9sCSH8T/K3gbwPZDs3fgkbP0K1WBEFgXLadlrbO4UFzx2fS0uqi+o8mXD0e2s5UE6mpRZpfjH7ZIgYP/4Jp/14M5RsJbK0g2u7CuGMLkUsNKGEJ6aODiLOXIabnELt6Fk2qAqffuL298+sg1AXPvQXZy+HGATDngvcC9DkIGKawZf0KZL1En8f3eII/NtDPN5cc6qreMIRc0P3AN6kIRLO6yl/3WwkOZ/qTydN12UhHgkHdGBDQERvQ3V/YpB5yIKrH4bSNQPAFgU8nTFMt3IN19/umNl+94Jf9WvJIlEc2nV69zMZJ09VFdVBL6HwqUgGIBpUt9NwcGnqtI2yhd+yKycLKvEKcj0iDVjmRVVlzWVGzBF9EHtbXF5FZfXwRR5vGPt0x727vfz7Qz7w+F1NueRkT9NMr6TmbPJpTKXauy8YH5tHpGd0szW0kN6kHizaAPyZR77Vz4MpEatpt/808+v9RRC1ohs0a95AZNivi2ncXxj3outWLEe5e6eyqOoyrxxNXgH+/0vkL3n+p0OJ0uEsAAAAASUVORK5CYII=";
    }
  }

  /**
   * Add stripe card with parsed exp month and exp year
   * @param  {number} exp_month parsed month
   * @param  {number} exp_year  parsed year
   */
  addStripeCard(exp_month: number, exp_year: number, inlineToken?: string, card_token?: string) {
    this.mStripeService.setStripeAccountCard(this.cardInfo["cardName"], exp_month, this.cardInfo["cardNumber"], exp_year, this.cardInfo["cardCVC"], inlineToken, card_token).subscribe(
      res => this.pledgeWithCard(res, inlineToken),
      error => {
        UtilService.logError(error);
        this.isContributionSubmitting = false;
        this.submitErrorMessage = "error_processing_card";
      }
    );
  }

  /**
   * Pledge with card
   * @param  {number} exp_month parsed month
   * @param  {number} exp_year  parsed year
   */
  pledgeWithCard(card: any, inlineToken?: string) {
    StripeService.stripe_account_card_id = card["stripe_account_card_id"];
    this.pledgeParam["stripe_account_card_id"] = StripeService.stripe_account_card_id;
    if (this.isAddingAddress) {
      this.mUserService.setNewAddress(this.addressInfo).subscribe(
        res => {
          this.pledgeParam["shipping_address_id"] = res.address_id;
          if (this.isAddingPhone) {
            this.mUserService.setNewPhone(this.phoneInfo).subscribe(
              res => {
                this.pledgeParam["phone_number_id"] = res.id;
                this.pledge();
              }
            );
          }
          else {
            this.pledge();
          }
        }
      );
    }
    else {
      if (this.isAddingPhone) {
        this.mUserService.setNewPhone(this.phoneInfo).subscribe(
          res => {
            this.pledgeParam["phone_number_id"] = res.id;
            this.pledge();
          }
        );
      }
      else {
        this.pledge();
      }
    }
  }

  /**
   * Toggle between add new card view and select card view
   */
  toggleNewAddress() {
    this.isAddingAddress = !this.isAddingAddress;
    if (!this.isAddingAddress) {
      for (let index in this.addressList) {
        if (this.addressList[index]["id"] == this.addressID) {
          this.selectAddress(this.addressList[index]);
          break;
        }
      }
    }
    jQuery(".address-form .ui.form").form("clear");
  }

  toggleNewPhone() {
    this.isAddingPhone = !this.isAddingPhone;
    if (!this.isAddingPhone) {
      for (let index in this.phoneList) {
        if (this.phoneList[index]["id"] == this.addressID) {
          this.selectPhone(this.phoneList[index]);
          break;
        }
      }
    }
    jQuery(".phone-form .ui.form").form("clear");
  }

  /**
   * Contribute as logged in or guest
   * @param  {string} type Logged in or guest
   */
  setContributeType(type: string) {
    this.contributionType = type;
    jQuery("#account-info .ui.form").form("clear");
  }

  setCreatingAccount() {
    jQuery("#account-info .ui.form").form("clear");
    this.contributionType = "";
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

  formValidationGuestCheckout() {
    jQuery("#guest-form.ui.form").form({
      inline: true,
      fields: {
        GuestEmail: {
          identifier: "guestEmail",
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
        }
      }
    }).form("validate form");
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
              prompt: "Please enter your last name"
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

  formValidationExpress() {
    jQuery("#express-form").form({
      inline: true,
      onSuccess: () => {
        this.isRegisterFormValid = true;
      },
      onFailure: () => {
        this.isRegisterFormValid = false;
      },
      fields: {
        expressFirstName: {
          identifier: "expressFirstName",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your first name"
            }
          ]
        },
        expressLastName: {
          identifier: "expressLastName",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your last name"
            }
          ]
        },
        expressEmail: {
          identifier: "expressEmail",
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
        }
      }
    }).form("validate form");
  }

  formValidationCard() {
    jQuery(".credit-card-form .ui.form").form({
      inline: true,
      fields: {
        CardName: {
          identifier: "CardName",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your name"
            }
          ]
        },
        CardNumber: {
          identifier: "CardNumber",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your number"
            }
          ]
        },
        CardDate: {
          identifier: "CardDate",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your expiring date"
            }
          ]
        },
        CardCVC: {
          identifier: "CardCVC",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your CVC number"
            },
            {
              type: "integer",
              prompt: "Please enter a valid number"
            }
          ]
        }
      }
    }).form("validate form");
  }

  formValidationAddress() {
    jQuery(".address-form.ui.form").form({
      inline: true,
      fields: {
        Street: {
          identifier: "Street",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your street address"
            }
          ]
        },
        City: {
          identifier: "City",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your city"
            }
          ]
        },
        MailCode: {
          identifier: "MailCode",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your zip code"
            }
          ]
        }
      }
    }).form("validate form");
  }

  formValidationPhone() {
    jQuery(".phone-form.ui.form").form({
      inline: true,
      fields: {
        phoneNumber: {
          identifier: "phoneNumber",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your phone number"
            }
          ]
        },
        phoneType: {
          identifier: "phoneType",
          rules: [
            {
              type: "empty",
              prompt: "Please choose the phone type"
            }
          ]
        }
      }
    }).form("validate form");
  }

  formValidationAttributes() {
    jQuery(".attributes-info.ui.form").form({
      inline: true,
      fields: {
        attribute: {
          identifier: "attribute",
          rules: [
            {
              type: "empty"
            }
          ]
        }
      }
    }).form("validate form");
  }

  formValidationTip() {
    if (!this.tipType) {
      this.tipError = true;
      return;
    }

    jQuery.fn.form.settings.rules.tip_zero = (value) => {
      if (this.tip.dollar_amount == 0) {
        return false;
      } else {
        return true;
      }
    }

    jQuery.fn.form.settings.rules.tip_under_minimum = (value) => {
      if (!this.tippingOptions.dynamic_min) {
        return true;
      }
      if (this.tip.dollar_amount < parseFloat(this.tippingOptions.dynamic_min)) {
        return false;
      } else {
        return true;
      }
    }
    jQuery.fn.form.settings.rules.tip_over_maximum = (value) => {
      if (!this.tippingOptions.dynamic_max) {
        return true;
      }
      if (this.tip.dollar_amount > parseFloat(this.tippingOptions.dynamic_max)) {
        return false;
      } else {
        return true;
      }
    }
    if (this.tipType == "dynamic") {
      if (this.tippingOptions.toggle_dynamic_min_max) {
        jQuery(".dynamic-tipping-form.ui.form").form({
          on: "blur",
          inline: true,
          fields: {
            dynamic_tip: {
              identifier: "dynamic_tip",
              rules: [
                {
                  type: "empty",
                  prompt: this.translate("please_enter_tip_amount")
                },
                {
                  type: "number",
                  prompt: this.translate("enter_valid_number")
                },
                {
                  type: "tip_zero",
                  prompt: this.translate("tip_cant_zero")
                },
                {
                  type: "tip_under_minimum",
                  prompt: this.translate("tip_under_min")
                },
                {
                  type: "tip_over_maximum",
                  prompt: this.translate("tip_over_max")
                }
              ]
            }
          }
        }).form("validate form");
      } else {
        jQuery(".dynamic-tipping-form.ui.form").form({
          on: "blur",
          inline: true,
          fields: {
            dynamic_tip: {
              identifier: "dynamic_tip",
              rules: [
                {
                  type: "empty",
                  prompt: this.translate("please_enter_tip_amount")
                },
                {
                  type: "number",
                  prompt: this.translate("enter_valid_number")
                },
                {
                  type: "tip_zero",
                  prompt: this.translate("tip_cant_zero")
                }
              ]
            }
          }
        }).form("validate form");
      }
    }
  }

  formValidation(paypal = false) {
    if (this.contributionType == this.CONTRIBUTION_TYPE_LOGIN) {
      this.formValidationLogin();
    }
    else if (this.contributionType == this.CONTRIBUTION_TYPE_GUEST) {
      this.formValidationGuestCheckout();
    }
    else if (this.contributionType == this.CONTRIBUTION_TYPE_REGISTER) {
      if(!paypal) {
        this.isAddingCard = true;
      } else {
        this.isAddingCard = false;
      }
      this.formValidationRegister();
    } else if (this.contributionType == this.CONTRIBUTION_TYPE_EXPRESS) {
      if(!paypal) {
        this.isAddingCard = true;
      } else {
        this.isAddingCard = false;
      }
      this.formValidationExpress();
    }
    jQuery.fn.form.settings.rules.amount_under_minimum = (value) => {
      if (this.contribution["amount"] < this.minContributionAmount) {
        return false;
      } else {
        return true;
      }
    }
    jQuery.fn.form.settings.rules.amount_over_maximum = (value) => {
      if (!this.allowMax) {
        return true;
      }
      if (this.contribution["amount"] > this.maxContributionAmount) {
        return false;
      } else {
        return true;
      }
    }
    jQuery(".contribution-input.ui.form").form({
      on: "blur",
      inline: true,
      fields: {
        amount: {
          identifier: "amount",
          rules: [
            {
              type: "empty",
              prompt: "Please enter a number"
            },
            {
              type: "number",
              prompt: "Please enter a valid number"
            },
            {
              type: "amount_under_minimum",
              prompt: "Amount has to be higher or equal to " + this.minContributionAmount
            },
            {
              type: "amount_over_maximum",
              prompt: "Amount has to be low or equal to " + this.maxContributionAmount
            }
          ]
        }
      }
    }).form("validate form");
    
    if (this.isAddingCard) {
      this.formValidationCard();
    }
    if (this.isAddingAddress) {
      this.formValidationAddress();
      this.formValidationPhone();
    }
    if (this.isAddingPhone) {
      this.formValidationPhone();
    }

    //if (this.requireRewardAttributes) {
      this.formValidationAttributes();
    //}

    if (this.tippingOptions.toggle) {
      this.formValidationTip();
    }
  }

  /**
   * Function called when login success
   * @param data {Object} data in success callback
   */
  onLoginSuccess(data) {
    this.isLoggedInSuccessful = true;
    this.contributionType = this.CONTRIBUTION_TYPE_LOGIN;
    this.userInfo = {
      "first_name": data.first_name,
      "last_name": data.last_name,
      "email": data.email
    };
    this.personId = data.person_id
    if (this.referralCandyEnabled) {
      this.referralCandyData["email"] = data["email"];
      this.referralCandyData["firstName"] = data["first_name"];
      this.referralCandyData["lastName"] = data["last_name"];
    }
    this.stripeCards = [];
    this.personId = data.person_id;
    this.getProfile();
    this.mStripeService.getStripeAccount().subscribe(
      res => {
        if (res.length) {
          StripeService.stripe_account_id = res[0]["stripe_account_id"];
          this.getStripeAccountCard();
        } else {
          this.isAddingCard = true
        }
      },
      error => UtilService.logError(error)
    );
    this.getUserAddress();
    this.getUserPhone();
  }

  onLoginFailed(error) {
    UtilService.logError(error);
    this.isLoggedInSuccessful = false;
  }

  /**
   * Set contribution method, anonymous or not
   * @param method {Object} method object
   */
  setContributionMethod(method) {
    this.pledgeParam["anonymous_contribution_partial"] = 0;
    this.pledgeParam["anonymous_contribution"] = 0;
    switch (method.id) {
      case 1:
        this.pledgeParam["anonymous_contribution_partial"] = 1;
        break;
      case 2:
        this.pledgeParam["anonymous_contribution"] = 1;
        break;
    }
  }

  chooseAttribute(choice, variationIndex) {
    this.pledgeAttributes[variationIndex].choice = choice;
    let variationObject = { variation: this.pledgeAttributes };
    this.pledgeParam["attributes"] = JSON.stringify(variationObject);
  }


  /**
   * Translate Function
   */
  translate(name) {
    return TranslationService.translation[name];
  }

  /**
     * Get Stripe Token
     */
  getStripeRegisterToken(exp_month, exp_year, data: any, inline_token?: string) {
    let card_token = '';
    let widget = this;
    this.extraStripeDetails['name'] = this.cardInfo["cardName"];
    // this.extraStripeDetails['address'] = this.addressInfo["street1"] + ', ' + this.addressInfo["city_id"];
    this.stripeElement.getStripe().createToken(this.stripeElement.cardNumber, this.extraStripeDetails).then(function (result) {
      // Send the token to your server
      card_token = result.token.id;
      this.mStripeService.setStripeAccount(exp_month, this.cardInfo["cardNumber"], exp_year, this.cardInfo["cardCVC"], data["inline_token"], card_token).subscribe(
        res => {
          StripeService.stripe_account_id = res["stripe_account_id"];
          this.pledgeParam["stripe_account_card_id"] = res.cards[0]["stripe_account_card_id"];
          if (this.isAddingAddress) {
            this.addressInfo["inline_token"] = data["inline_token"];
            this.phoneInfo["inline_token"] = data["inline_token"];
            this.mUserService.setNewAddress(this.addressInfo).subscribe(
              res => {
                this.pledgeParam["shipping_address_id"] = res.address_id;
                this.mUserService.setNewPhone(this.phoneInfo).subscribe(
                  res => {
                    this.pledgeParam["phone_number_id"] = res.phone_number_id;
                    this.pledge();
                  }
                );
              }
            );
          }
          else {
            this.pledge();
          }
        },
        error => {
          this.submitErrorMessage = UtilService.logError(error);
          this.isContributionSubmitting = false;
          if (!this.authToken) {
            this.switchToLogin();
          }
        }
      );
    });
  }


  /**
   * Get Stripe Token
   */
  getStripeToken(exp_month, exp_year) {
    var card_token = '';
    this.extraStripeDetails['name'] = this.cardInfo["cardName"];
    this.extraStripeDetails['address'] = this.addressInfo["street1"] + ', ' + this.addressInfo["city_id"];
    this.stripeElement.getStripe().createToken(this.stripeElement.cardNumber, this.extraStripeDetails).then(function (result) {
      // Send the token to your server
      card_token = result.token.id;
      this.mStripeService.setStripeAccount(null, null, null, null, null, card_token).subscribe(
        res => {
          StripeService.stripe_account_id = res["stripe_account_id"];
          this.addStripeCard(exp_month, exp_year, null, card_token);
        },
        error => {
          UtilService.logError(error);
        }
      );
    });
  }

  public stripeElementValidation(error: any): void {
    this.stripeElementError = error;
  }

  paypalRegister(paypal_order_id) {
    this.submitErrorMessage = "";
    this.isSubmitting = true;

    this.formValidation(true);

    if (!jQuery(".form .field.error").length && !this.isContributionSubmitting && !this.tipError) {
      this.isContributionSubmitting = true;
      this.pledgeParam["amount"] = this.totalAmount;
      if (this.tip.dollar_amount && this.tip.dollar_amount != 0) {
        this.pledgeParam["amount_tip"] = parseFloat(this.tip.dollar_amount).toFixed(2);
        this.guestPledgeParam["amount_tip"] = parseFloat(this.tip.dollar_amount).toFixed(2);
      }
      if (this.contributionType == this.CONTRIBUTION_TYPE_REGISTER) {
        if (this.registerComponent) {
          this.registerComponent.paypalRegister(paypal_order_id);
        }
      }
      else if(this.contributionType == this.CONTRIBUTION_TYPE_EXPRESS) {
        const randomPassword = UtilService.generatePassword();
        this.expressRegisterInfo.password = randomPassword;
        this.expressRegisterInfo.password_confirm = randomPassword;
        this.expressRegisterInfo.express_checkout = true;
        this.mUserService.register(this.expressRegisterInfo).subscribe(
          data => {
            var eventData = {
              "email": this.expressRegisterInfo.email,
              "password": this.expressRegisterInfo.password,
              "inline_token": data.inline_token,
              "user_id": data.id
            };
            this.expressRegisterError = "";
            // jQuery("#paypal-button-container").addClass("registration-complete");
            this.pledgeParam["inline_token"] = data.inline_token;
            this.paypalPledge(paypal_order_id);
          },
          error => {
            let jsonError = error.json();
            this.expressRegisterError = "campaign_express_register_api_" + jsonError.errors.email[0].code;
            this.isContributionSubmitting = false;
          }
        );
      }
    } else {
      this.scrollToError();
    }
  }

  /**
   * Submit and process existing info to make contribution
   * There must be a better way to deal with this Rx
   */
  submitContribution() {
    this.submitErrorMessage = "";
    this.isSubmitting = true;

    this.formValidation();

    if (this.isAddingCard && this.stripeElement.toggle && this.stripeElementError) {
      this.scrollToError();
      return;
    } else if (!this.personId && this.stripeElement.toggle && this.stripeElementError) {
      this.scrollToError();
      return;
    }

    if (!jQuery(".form .field.error").length && !this.isContributionSubmitting && !this.tipError) {
      this.isContributionSubmitting = true;
      this.pledgeParam["amount"] = this.totalAmount;
      if (this.tip.dollar_amount && this.tip.dollar_amount != 0) {
        this.pledgeParam["amount_tip"] = parseFloat(this.tip.dollar_amount).toFixed(2);
        this.guestPledgeParam["amount_tip"] = parseFloat(this.tip.dollar_amount).toFixed(2);
      }
      let exp_month, exp_year;
      if (this.cardInfo["cardDate"]) {
        exp_month = this.cardInfo["cardDate"].split(" / ")[0];
        exp_year = this.cardInfo["cardDate"].split(" / ")[1];
      }
      if (this.contributionType == this.CONTRIBUTION_TYPE_LOGIN) {
        if (this.isAddingCard && !StripeService.stripe_account_id) {
          var card_token = '';
          if (this.stripeElement.toggle) {
            let widget = this;
            let card_token = '';
            this.extraStripeDetails['name'] = this.cardInfo["cardName"];

            this.extraStripeDetails['name'] = this.cardInfo['cardName'];
            if (this.addressInfo) {
              this.extraStripeDetails['address_city'] = this.addressInfo['city'];
              this.extraStripeDetails['address_country'] = this.addressInfo['country'];
              this.extraStripeDetails['address_line1'] = this.addressInfo['street1'];
            }

            this.stripeElement.getStripe().createToken(this.stripeElement.cardNumber, this.extraStripeDetails).then(function (result) {
              // Send the token to your server
              card_token = result.token.id;
              widget.mStripeService.setStripeAccount(null, null, null, null, null, card_token).subscribe(
                res => {
                  StripeService.stripe_account_id = res["stripe_account_id"];
                  widget.pledgeWithCard(res.cards[0]);
                },
                error => {
                  UtilService.logError(error);
                }
              );
            });
          } else {
            this.mStripeService.setStripeAccount(exp_month, this.cardInfo["cardNumber"], exp_year, this.cardInfo["cardCVC"]).subscribe(
              res => {
                StripeService.stripe_account_id = res["stripe_account_id"];
                this.addStripeCard(exp_month, exp_year);
              },
              error => {
                UtilService.logError(error);
              }
            );
          }
        }
        else {
          if (this.isAddingCard) {

            if (this.stripeElement.toggle) {
              let widget = this;

              this.extraStripeDetails['name'] = this.cardInfo['cardName'];
              if (this.addressInfo) {
                this.extraStripeDetails['address_city'] = this.addressInfo['city'];
                this.extraStripeDetails['address_country'] = this.addressInfo['country'];
                this.extraStripeDetails['address_line1'] = this.addressInfo['street1'];
              }

              this.stripeElement.getStripe().createToken(this.stripeElement.cardNumber, this.extraStripeDetails).then(function (result) {
                // Send the token to your server
                card_token = result.token.id;
                widget.addStripeCard(exp_month, exp_year, null, card_token);
              });
            } else {
              this.addStripeCard(exp_month, exp_year);
            }
          }
          else {
            if (this.isAddingAddress) {
              this.mUserService.setNewAddress(this.addressInfo).subscribe(
                res => {
                  this.pledgeParam["shipping_address_id"] = res.address_id;
                  if (this.isAddingPhone) {
                    this.mUserService.setNewPhone(this.phoneInfo).subscribe(
                      res => {
                        this.pledgeParam["phone_number_id"] = res.id;
                        this.pledge();
                      }
                    );
                  }
                  else {
                    this.pledge();
                  }
                }
              );
            }
            else {
              if (this.isAddingPhone) {
                this.mUserService.setNewPhone(this.phoneInfo).subscribe(
                  res => {
                    this.pledgeParam["phone_number_id"] = res.id;
                    this.pledge();
                  }
                );
              }
              else {
                this.pledge();
              }
            }
          }
        }
      }
      else if (this.contributionType == this.CONTRIBUTION_TYPE_REGISTER) {
        if (this.registerComponent) {
          this.registerComponent.register();
        }
      }
      else if (this.contributionType == this.CONTRIBUTION_TYPE_GUEST) {
        if (this.stripeElement.toggle) {
          let card_token = '';
          let widget = this;
          this.extraStripeDetails["name"] = this.cardInfo["cardName"];
          this.stripeElement.getStripe().createToken(this.stripeElement.cardNumber, this.extraStripeDetails).then(function (result) {
            // Send the token to your server
            card_token = result.token.id;
            widget.mStripeService.setGuestStripeAccount(
              widget.cardInfo["cardName"],
              exp_month,
              widget.cardInfo["cardNumber"],
              exp_year,
              widget.cardInfo["cardCVC"],
              widget.cardInfo["email"],
              card_token
            ).subscribe(
              res => {
                
                widget.guestPledgeParam["card_id"] = res.card_id;
                widget.guestPledgeParam["email"] = widget.cardInfo["email"];
                widget.guestPledgeParam["amount"] = widget.totalAmount;
                widget.guestPledgeParam["fingerprint"] = res.fingerprint;
                widget.pledgeParam["card_id"] = res.card_id;
                
                if (widget.isAddingAddress) {
                  widget.mUserService.setGuestAddress(widget.addressInfo).subscribe(
                    res => {
                      widget.guestPledgeParam["shipping_address_id"] = res.id;
                      widget.pledgeAsGuest();
                    }
                  );
                }
                else {
                  widget.pledgeAsGuest();
                }
              },
              error => {
                widget.isContributionSubmitting = false;
                UtilService.logError(error);
              }
              );
          });
        } else {
          this.mStripeService.setGuestStripeAccount(
            this.cardInfo["cardName"],
            exp_month,
            this.cardInfo["cardNumber"],
            exp_year,
            this.cardInfo["cardCVC"],
            this.cardInfo["email"]
          ).subscribe(
            res => {
              this.guestPledgeParam = {
                "card_id": res.card_id,
                "email": this.cardInfo["email"],
                "amount": this.totalAmount,
                "fingerprint": res.fingerprint
              };
              this.pledgeParam["card_id"] = res.card_id;
              if (this.isAddingAddress) {
                this.mUserService.setGuestAddress(this.addressInfo).subscribe(
                  res => {
                    this.guestPledgeParam["shipping_address_id"] = res.id;
                    this.pledgeAsGuest();
                  }
                );
              }
              else {
                this.pledgeAsGuest();
              }
            },
            error => {
              this.isContributionSubmitting = false;
              UtilService.logError(error);
            }
            );
        }
      } else if(this.contributionType == this.CONTRIBUTION_TYPE_EXPRESS) {
        const randomPassword = UtilService.generatePassword();
        this.expressRegisterInfo.password = randomPassword;
        this.expressRegisterInfo.password_confirm = randomPassword;
        this.expressRegisterInfo.express_checkout = true;
        this.mUserService.register(this.expressRegisterInfo).subscribe(
          data => {
            var eventData = {
              "email": this.expressRegisterInfo.email,
              "password": this.expressRegisterInfo.password,
              "inline_token": data.inline_token,
              "user_id": data.id
            };
            this.expressRegisterError = "";
            this.onRegisterContributionSuccess(eventData);
          },
          error => {
            let jsonError = error.json();
            this.expressRegisterError = "campaign_express_register_api_" + jsonError.errors.email[0].code;
            this.isContributionSubmitting = false;
          }
        );
      }
    } else {
      this.scrollToError();
    }
  }


  paypalPreparePledge(paypal_order_id) {
    if(!this.personId) {
      this.paypalRegister(paypal_order_id);
    } else {
      this.paypalPledge(paypal_order_id);
    }
  }

  paypalPledge(paypal_order_id) {
    this.mPledgeService.paypalPledge(this.pledgeParam, ConstantsGlobal.CAMPAIGN_ID, paypal_order_id).then(
      success => {
        let res: any = success;
        if (typeof this.stripeElement.cardNumber !== 'undefined' && this.stripeElement.toggle) {
          this.stripeElement.clearElements();
        }
        this.getCampaign();
        if (this.authToken) {
          this.getStripeAccountCard();
          this.getUserAddress();
          this.getUserPhone();
          this.getAuthenticatedUserData();
        }
        else {
          //Dont log in user if they express
          if (this.contributionType != this.CONTRIBUTION_TYPE_EXPRESS) { 
            this.mUserService.login(this.loginEmail, this.loginPassword).subscribe(
              data => {
                this.onLoginSuccess(data);
                this.loadReferralCandyPopup();
              },
              error => {
                this.onLoginFailed(error);
              }
            );
          } else {
            //Clear express
            
          }
        }

        this.isPledgingSuccess = true;
        this.isContributionSubmitting = false;
        this.isContributionView = false;

        if (this.fbTrackingEnabled) {
          this.loadFBPixel(this.fbId);
        }
        if (this.googleTrackingEnabled) {
          this.loadGoogleAnalytics(this.gaId);
        }
      
        if (this.referralCandyEnabled) {

          this.referralCandyData["invoiceNumber"] = res.entry_backer_id;

          if (this.contributionType == this.CONTRIBUTION_TYPE_EXPRESS) {
            this.referralCandyData["email"] = this.expressRegisterInfo["email"];
            this.referralCandyData["firstName"] = this.expressRegisterInfo["first_name"];
            this.referralCandyData["lastName"] = this.expressRegisterInfo["last_name"];
          } else if (this.contributionType == this.CONTRIBUTION_TYPE_LOGIN) {
            this.referralCandyData["email"] = this.userInfo["email"];
            this.referralCandyData["firstName"] = this.userInfo["first_name"];
            this.referralCandyData["lastName"] = this.userInfo["last_name"];
          }

          this.referralCandyData["amount"] = this.pledgeParam["amount"];
          this.referralCandyData["unixTimestamp"] = Math.floor(Date.now() / 1000);
          this.referralCandyData["currencyCode"] = this.mCampaign.currencies[0].code_iso4217_alpha;

          this.loadReferralCandyPopup();
        }

        this.resetPledgeParam();
        this.campaignPledgeRedirect();
        this.clearExpressForm();
      },
      error => {
        this.pledgeError(error);
        if (!this.authToken) {
          this.switchToLogin();
        }
      }
    );
  }

  pledge() {
    let stripe_pledge = this.stripeElement.getStripe();
    let stripe_tip = this.stripeElement.getStripe();
    if(!this.siteSettings["site_campaign_fee_direct_transaction"] && this.siteSettings["stripe_standard_mode"] && this.mCampaign.managers[0] && this.mCampaign.managers[0].publishable_key){
      stripe_pledge = Stripe(this.mCampaign.managers[0].publishable_key);
    }
  
    this.mPledgeService.pledge(this.pledgeParam, ConstantsGlobal.CAMPAIGN_ID, stripe_pledge, stripe_tip).then(
      success => {
        let res: any = success;
        if (typeof this.stripeElement.cardNumber !== 'undefined' && this.stripeElement.toggle) {
          this.stripeElement.clearElements();
        }
        this.getCampaign();
        if (this.authToken) {
          this.getStripeAccountCard();
          this.getUserAddress();
          this.getUserPhone();
          this.getAuthenticatedUserData();
        }
        else {
          //Dont log in user if they express
          if (this.contributionType != this.CONTRIBUTION_TYPE_EXPRESS) { 
            this.mUserService.login(this.loginEmail, this.loginPassword).subscribe(
              data => {
                this.onLoginSuccess(data);
                this.loadReferralCandyPopup();
              },
              error => {
                this.onLoginFailed(error);
              }
            );
          } else {
            //Clear express
            
          }
        }

        this.isPledgingSuccess = true;
        this.isContributionSubmitting = false;
        this.isContributionView = false;

        if (this.fbTrackingEnabled) {
          this.loadFBPixel(this.fbId);
        }
        if (this.googleTrackingEnabled) {
          this.loadGoogleAnalytics(this.gaId);
        }
      
        if (this.referralCandyEnabled) {

          this.referralCandyData["invoiceNumber"] = res.entry_backer_id;

          if (this.contributionType == this.CONTRIBUTION_TYPE_EXPRESS) {
            this.referralCandyData["email"] = this.expressRegisterInfo["email"];
            this.referralCandyData["firstName"] = this.expressRegisterInfo["first_name"];
            this.referralCandyData["lastName"] = this.expressRegisterInfo["last_name"];
          } else if (this.contributionType == this.CONTRIBUTION_TYPE_LOGIN) {
            this.referralCandyData["email"] = this.userInfo["email"];
            this.referralCandyData["firstName"] = this.userInfo["first_name"];
            this.referralCandyData["lastName"] = this.userInfo["last_name"];
          }

          this.referralCandyData["amount"] = this.pledgeParam["amount"];
          this.referralCandyData["unixTimestamp"] = Math.floor(Date.now() / 1000);
          this.referralCandyData["currencyCode"] = this.mCampaign.currencies[0].code_iso4217_alpha;

          this.loadReferralCandyPopup();
        }

        this.resetPledgeParam();
        this.campaignPledgeRedirect();
        this.clearExpressForm();
      },
      error => {
        this.pledgeError(error);
        if (!this.authToken) {
          this.switchToLogin();
        }
      }
    );
  }

  pledgeAsGuest() {
    this.mCampaignService.pledgeAsGuest(ConstantsGlobal.CAMPAIGN_ID, this.guestPledgeParam)
      .subscribe(
      res => {
        if (typeof this.stripeElement.cardNumber !== 'undefined' && this.stripeElement.toggle) {
          this.stripeElement.clearElements();
        }
        this.getCampaign();
        this.isPledgingSuccess = true;
        this.isContributionSubmitting = false;
        this.isContributionView = false;

        if (this.fbTrackingEnabled) {
          this.loadFBPixel(this.fbId);
        }

        if (this.googleTrackingEnabled) {
          this.loadGoogleAnalytics(this.gaId);
        }

        if (this.referralCandyEnabled) {
          this.referralCandyData["invoiceNumber"] = res.entry_backer_id;
          this.referralCandyData["email"] = this.guestPledgeParam["email"];
          this.referralCandyData["amount"] = this.guestPledgeParam["amount"];
          this.referralCandyData["unixTimestamp"] = Math.floor(Date.now() / 1000);
          this.referralCandyData["firstName"] = "Guest";
          this.referralCandyData["lastName"] = "";
          this.referralCandyData["currencyCode"] = this.mCampaign.currencies[0].code_iso4217_alpha;

          this.loadReferralCandyPopup();
        } else {
          this.campaignPledgeRedirect();
        }
        this.resetPledgeParam();
        
      },
      error => {
        this.pledgeError(error);
      }
      );
  }

  pledgeError(error: any) {
    this.isContributionSubmitting = false;
    this.submitErrorMessage = UtilService.logPledgeError(error);
  }

  loadGoogleAnalytics(gaId: string) {
    var newDate: any = new Date();
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*newDate;a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    (window as any).ga('create', gaId, 'auto');
    (window as any).ga('send', 'pageview');
  }

  loadFBPixel(id: string) {
    (function (f: any, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        }; if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    (window as any).fbq.disablePushState = true; //not recommended, but can be done
    (window as any).fbq('init', id);
    (window as any).fbq('track', 'PageView');
  }

  loadReferralCandyPopup() {

    //don't do anything if no first name exists
    if (!this.referralCandyEnabled || !this.referralCandyData.firstName || !this.referralCandyData.email) return;

    this.mSettingsService.getReferralCandyHash(
      this.referralCandyData.email, 
      this.referralCandyData.firstName,
      this.referralCandyData.amount,
      this.referralCandyData.unixTimestamp)
    .subscribe(res => {

      this.referralCandyData.hash = res.signature;

      if(this.referralCandyEnablePopup){
        //this function is from referral candy
        (function(e, data){
          var t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,z;
          z="script";
          l="refcandy-purchase-js";
          c="refcandy-popsicle";
          p="go.referralcandy.com/purchase/";
          t="data-app-id";
          r={email:"a",fname:"b",lname:"c",amount:"d",currency:"e","accepts-marketing":"f",timestamp:"g","referral-code":"h",locale:"i","external-reference-id":"k",signature:"ab"};
          i=e.getElementsByTagName(z)[0];
          s=function(e,t){if(t){return""+e+"="+encodeURIComponent(t)}else{return""}};
          d=function(e){return""+p+h.getAttribute(t)+".js?lightbox=1&aa=75&"};
          if(!e.getElementById(l)){
            h=e.getElementById(c);
            if(h){

              //CUSTOM: mod the rc data div
              h.setAttribute("data-app-id", data.appId);
              h.setAttribute("data-fname", data.firstName);
              h.setAttribute("data-lname", data.lastName);
              h.setAttribute("data-email", data.email);
              h.setAttribute("data-amount", data.amount);
              h.setAttribute("data-currency", data.currencyCode);
              h.setAttribute("data-timestamp", data.unixTimestamp);
              h.setAttribute("data-external-reference-id", data.invoiceNumber);
              h.setAttribute("data-signature", data.hash);

              o=e.createElement(z);o.id=l;
              a=function(){var e;e=[];for(n in r){u=r[n];v=h.getAttribute("data-"+n);e.push(s(u,v))}return e}();
              o.src="//"+d(h.getAttribute(t))+a.join("&");
              return i.parentNode.insertBefore(o,i)
            }
          }
        })(document, this.referralCandyData);
      }
      else {
        (function (e, data)
        {
          var t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, z;
          z = "script";
          l = "refcandy-purchase-js";
          c = "refcandy-mint";
          p = "go.referralcandy.com/purchase/";
          t = "data-app-id";
          r = {
            email: "a",
            fname: "b",
            lname: "c",
            amount: "d",
            currency: "e",
            "accepts-marketing": "f",
            timestamp: "g",
            "referral-code": "h",
            locale: "i",
            "external-reference-id": "k",
            signature: "ab"
          };
          i = e.getElementsByTagName(z)[0];
          s = function (e, t)
          {
            if (t)
            {
              return "" + e + "=" + encodeURIComponent(t)
            }
            else
            {
              return ""
            }
          };
          d = function (e)
          {
            return "" + p + h.getAttribute(t) + ".js?aa=75&"
          };
          if (!e.getElementById(l))
          {
            h = e.getElementById(c);
            if (h)
            {

              //CUSTOM: mod the rc data div
              h.setAttribute("data-app-id", data.appId);
              h.setAttribute("data-fname", data.firstName);
              h.setAttribute("data-lname", data.lastName);
              h.setAttribute("data-email", data.email);
              h.setAttribute("data-amount", data.amount);
              h.setAttribute("data-currency", data.currencyCode);
              h.setAttribute("data-timestamp", data.unixTimestamp);
              h.setAttribute("data-external-reference-id", data.invoiceNumber);
              h.setAttribute("data-signature", data.hash);

              o = e.createElement(z);
              o.id = l;
              a = function ()
              {
                var e;
                e = [];
                for (n in r)
                {
                  u = r[n];
                  v = h.getAttribute("data-" + n);
                  e.push(s(u, v))
                }
                return e
              }();
              o.src = "//" + d(h.getAttribute(t)) + a.join("&");
              return i.parentNode.insertBefore(o, i)
            }
          }
        })(document, this.referralCandyData);
      }

    });

  }

  /**
   * Get stripe account cards for current user
   */
  getStripeAccountCard() {
    this.mStripeService.getStripeAccountCard().subscribe(
      res => {
        if (res.length) {
          this.isAddingCard = false;
          this.stripeCards = res;
          this.selectCard(res[0]);
        }
        else {
          this.isAddingCard = true;
        }
      },
      error => UtilService.logError(error)
    );
  }

  getUserAddress() {
    this.mUserService.getAddress().subscribe(
      res => {
        if (res.personal && res.personal.length) {
          this.addressList = res.personal;
        }
        if (this.addressList.length) {
          this.isAddingAddress = false;
          this.selectAddress(this.addressList[0]);
        }
      },
      error => UtilService.logError(error)
    );
  }

  getUserPhone() {
    this.mUserService.getPhone().subscribe(
      res => {
        if (res != null && res.personal != null && res.personal.length) {
          this.phoneList = res.personal;
        }
        if (this.phoneList.length) {
          this.isAddingPhone = false;
          this.selectAddress(this.phoneList[0]);
        }
      },
      error => UtilService.logError(error)
    );
  }
  
  getAuthenticatedUserData() {
    this.mUserService.getAuthenticatedUser().subscribe(
      res => {
        this.fullUserData = res;
        this.referralCandyData["email"] = this.fullUserData.email;
        this.loadReferralCandyPopup();
      },
      error => UtilService.logError(error)
    );
  }

  onRewardsContributionPageChange(evt) {
    this.rewardContributionPageConfig.currentPage = evt;
    if (evt == this.rewardPageNumber) {
      setTimeout(() => {
        jQuery("#contribution-campaign-rewards").accordion("open", this.rewardIndex);
        this.setSelectedRewardBorder(true);
      });
    }
    if (this.isjQueryClicked) {
      setTimeout(() => {
        this.isjQueryClicked = false;
      }, 10);
    }
  }

  onCampaignBackerPageChange(evt) {
    this.campaignBackersConfig.currentPage = evt;
  }

  onCampaignStreamsPageChange(evt) {
    this.campaignStreamsConfig.currentPage = evt;
  }

  onCamapginFaqsChange(evt) {
    this.campaignFaqsConfig.currentPage = evt;
  }

  setCurrentTab(value: string) {
    if (value == "campaign") {
      this.currentTab = value;
      this.isCampaignTab = true;
      this.isFAQTab = false;
      this.isBackersTab = false;
      this.isStreamsTab = false;
      this.isCommentTab = false;
      this.isContactTab = false;
    }
    else if (value == "faq") {
      this.currentTab = value;
      this.isCampaignTab = false;
      this.isFAQTab = true;
      this.isBackersTab = false;
      this.isStreamsTab = false;
      this.isCommentTab = false;
      this.isContactTab = false;
    }
    else if (value == "backers") {
      this.currentTab = value;
      this.isCampaignTab = false;
      this.isFAQTab = false;
      this.isBackersTab = true;
      this.isStreamsTab = false;
      this.isCommentTab = false;
      this.isContactTab = false;
    }
    else if (value == "streams") {
      this.currentTab = value;
      this.isCampaignTab = false;
      this.isFAQTab = false;
      this.isBackersTab = false;
      this.isStreamsTab = true;
      this.isCommentTab = false;
      this.isContactTab = false;
    }
    else if (value == "comments") {
      this.currentTab = value;
      this.isCampaignTab = false;
      this.isFAQTab = false;
      this.isBackersTab = false;
      this.isStreamsTab = false;
      this.isCommentTab = true;
      this.isContactTab = false;
    }
    else if (value == "contact") {
      this.currentTab = value;
      this.isCampaignTab = false;
      this.isFAQTab = false;
      this.isBackersTab = false;
      this.isStreamsTab = false;
      this.isCommentTab = false;
      this.isContactTab = true;
    }
  }

  showLoginOrSignup(form: string) {
    switch (form) {
      case "login":
        this.isFormLogin = true;
        break;
      case "signup":
        this.isFormLogin = false;
        break;
    }
  }

  setMessageToManager() {
    let isMessageValidated = false;
    // Need to replace newline with actual html tags to render properly in email clients
    this.contactManagerMessage.body = this.contactManagerMessage.body.replace(/(\r\n|\n|\r)/gm, "<br>");
    jQuery(".contact-form.form").form({
      inline: true,
      onSuccess: function () {
        isMessageValidated = true;
      },
      onFailure: function () {
        isMessageValidated = false;
      },
      fields: {
        Subject: {
          identifier: "Subject",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your subject"
            }
          ]
        },
        Body: {
          identifier: "Body",
          rules: [
            {
              type: "empty",
              prompt: "Please enter your message body"
            }
          ]
        }
      }
    }).form("validate form");

    if (isMessageValidated) {
      jQuery(".contact-message .actions .button").addClass("loading");
      let headers = new Headers();
      let options = new RequestOptions({
        headers: headers, withCredentials: true
      });

      this.contactManagerMessage.person_id = this.mCampaign.managers[0].id;

      this.http.post(ConstantsGlobal.API_URL + "account/message", JSON.stringify(this.contactManagerMessage), options)
        .map(res => res.json())
        .subscribe(
        res => {
          jQuery(".contact-message .actions .button").removeClass("loading");
          this.isContactMessageSent = true;
          this.contactManagerMessage = {
            "person_id": "",
            "subject": "",
            "body": ""
          };
        },
        error => UtilService.logError(error)
        );
    }
  }

  getSiteLogo() {
    this.mSettingsService.getSiteLogo().subscribe(
      res => {
        for (let i = 0; i < res.length; i++) {
          if (res[i]["name"] == "site_logo") {
            if (res[i]["value"].hasOwnProperty("path_external")) {
              this.siteLogo["image"] = ConstantsGlobal.API_HOST + "/image/site_logo_320x80/" + res[i]["value"]["path_external"];
            }
          }
          if (res[i]["name"] == "site_logo_link") {
            if (res[i]["value"] != null && res[i]["value"] != "") {
              this.siteLogo["link"] = res[i]["value"];
            }
          }
        }
      },
      error => UtilService.logError(error)
    );
  }

  /**
   * Log current user out
   */
  logout() {
    this.mUserService.logout().subscribe(
      () => {
        jQuery(".account-dropdown").dropdown("hide");
        this.userInfo["first_name"] = '';
        this.addressList = [];
        this.isAddingAddress = true;
        this.shippingFee = 0;
        this.personId = null;
      },
      error => UtilService.logError(error)
    );
  }

  showLoggedInUserProfile() {
    this.isProfileShown = true;
  }

  closeMessage() {
    this.isPledgingSuccess = false;
  }

  resetPledgeParam() {
    this.pledgeParam = {
      "amount": null,
      "anonymous_contribution": null,
      "anonymous_contribution_partial": null,
      "pledge_level_id": null,
      "stripe_account_card_id": null,
      "shipping_address_id": null
    };

    this.guestPledgeParam = {
      "card_id": null,
      "email": null,
      "amount": null,
      "fingerprint": null,
      "pledge_level_id": null,
      "shipping_address_id": null
    };

    this.cardInfo = {
      "cardName": "",
      "cardNumber": "",
      "cardDate": "",
      "cardCVC": "",
      "email": ""
    }

    this.addressInfo = {
      "city_id": 0,
      "street1": "",
      "street2": "",
      "mail_code": ""
    };

    this.phoneInfo = {
      "number": null,
      "phone_number_type_id": null
    };

    this.pledgeAttributes = [];
  }

  onBackToCampaignPage(evt: any) {
    this.isContributionView = false;
    this.isProfileShown = false;
    this.getProfile();
  }

  onUpdateUserInfo(evt: any) {
    this.userInfo = evt;
  }

  onUpdateProfileResourceId(evt: any) {
    this.profileResourceId = evt;
  }

  setCurrentCreatorTab(name) {
    this.currentCreatorTab = name;
    if (name == 'creator') {
      this.isCreatorTab = true;
      this.isCompanyTab = false;
    } else {
      this.isCreatorTab = false;
      this.isCompanyTab = true;
    }
  }

  setCurrentLoginTab(name) {
    this.currentPaymentLoginTab = name;
    if (name == 'login') {
      this.isLoginTab = true;
      this.isRegisterTab = false;
      this.isGuestTab = false;
      this.isExpressTab = false;
    } else if(name == 'guest'){
      this.isLoginTab = false;
      this.isRegisterTab = false;
      this.isGuestTab = true;
      this.isExpressTab = false;
    } else if(name == 'express'){
      this.isLoginTab = false;
      this.isRegisterTab = false;
      this.isGuestTab = false;
      this.isExpressTab = true;
    } else {
      this.isLoginTab = false;
      this.isRegisterTab = true;
      this.isGuestTab = false;
      this.isExpressTab = false;
    }
  }

  setTipType(type) {
    this.tipError = false;
    this.tip = {value: null, dollar_amount: 0, type: 'Dollar'};
    if (type == 'tiers') {
      if (this.tippingOptions.tiers[0]) {
        this.updateTierValues();
        this.tip =  {value: this.tippingOptions.tiers[0].value, dollar_amount: this.tippingOptions.tiers[0].dollar_amount, type: this.tippingOptions.tiers[0].type, name: this.tippingOptions.tiers[0].name};
      }
    } else if (type == 'dynamic') {
      if (this.tippingOptions.toggle_dynamic_min_max && this.tippingOptions.dynamic_min) {
        this.tip.value = this.tippingOptions.dynamic_min;
        this.tip.dollar_amount = this.tippingOptions.dynamic_min;
      }
    }
    this.tipType = type;
  }

  tipTierSelection(value, type, dollarAmount, name) {
    this.tip = {value: parseFloat(value), dollar_amount: parseFloat(dollarAmount), type: type, name: name};
  }

  total() {
    let tip = 0;
    if (this.tip && this.tip.type && this.tip.type === "Percent") {
      tip = (this.tip.value) ? parseFloat(this.tip.dollar_amount) : 0;
    } else  {
      tip = (this.tip && this.tip.value) ? parseFloat(this.tip.value) : 0;
    }
    let contrib = this.totalAmount;
    let total = tip+contrib

    return total;
  }

  // Scroll to validation error
  scrollToError() {
    setTimeout(() => {
      jQuery("html, body").animate({
        scrollTop: jQuery(".error").offset().top - 15
      }, "fast");
    });
  }

  updateTierValues() {

    this.tippingOptions.tiers.forEach((value, index) => {

      if(value.type == "Percent") {
        value.dollar_amount = ((value.value / 100) * parseFloat(this.contribution["amount"]));
        if(value.dollar_amount < this.lowestAmount && !this.siteSettings['site_campaign_combine_amount_tip'] ){
          value.dollar_amount += this.lowestAmount;
        }
      } else {
        value.dollar_amount = value.value;
      }
    });    
  }

  clearExpressForm() {
    this.expressRegisterInfo.first_name = "";
    this.expressRegisterInfo.last_name = "";
    this.expressRegisterInfo.email = "";
    jQuery('input[name=CardName').val("");
  }

  campaignPledgeRedirect() {
    if(typeof this.siteSettings['site_campaign_pledge_redirect'] !== 'undefined' || !this.siteSettings['site_campaign_pledge_redirect']) {
      if(this.siteSettings['site_campaign_pledge_redirect'].hasOwnProperty('toggle') && this.siteSettings['site_campaign_pledge_redirect'].toggle) {
        window.location.href = this.siteSettings['site_campaign_pledge_redirect'].url;
      } 
    }
  }
}
