/**
 * Constants to be used for the entire site
 * Location: For that specific place in the api
 * URL: The URL for that api request
 */
export class ConstantsGlobal {
  public static API_HOST: string = "http://localhost:3000";
  public static SITE_HOST: string = "";
  public static SITE_URL: string = "";
  public static API_URL: string = ConstantsGlobal.API_HOST + "service/restv1/";
  public static CAMPAIGN_ID: number;
  public static DEFAULT_LANG: string = "en";
  public static PREFERRED_LANG: string = "en";

  public static setApiHost(host: string) {
    ConstantsGlobal.API_HOST = host;
  }

  public static getApiHost(): string {
    return ConstantsGlobal.API_HOST;
  }

  public static getSiteHost(): string {
    return ConstantsGlobal.SITE_HOST;
  }

  public static getSiteURL(): string {
    return ConstantsGlobal.SITE_URL;
  }

  public static setLanguageHost(Lang_OBJECT: Object) {
    ConstantsGlobal.DEFAULT_LANG = Lang_OBJECT['defaultLang'];
    ConstantsGlobal.PREFERRED_LANG = Lang_OBJECT['preferredLang'];
  }

  public static getApiUrl() {
    return ConstantsGlobal.API_HOST + "service/restv1/";
  }

  // User Authentication
  public static API_LOCATION_AUTHENTICATION: string = "authenticate/";
  public static getApiUrlAuth() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_AUTHENTICATION;
  }
  public static API_LOCATION_AUTHENTICATION_OKTA_NONSOCIAL: string = "authenticate/okta";
  public static getApiUrlAuthOktaNonSocial() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_AUTHENTICATION_OKTA_NONSOCIAL;
  }
  public static API_LOCATION_AUTHENTICATION_OKTA_SOCIAL: string = "authenticate/okta/social";
  public static getApiUrlAuthOktaSocial() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_AUTHENTICATION_OKTA_SOCIAL;
  }
  public static API_LOCATION_REGISTER: string = "register/";
  public static getApiUrlRegister() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_REGISTER;
  }
  public static API_LOCATION_LOGOUT: string = "logout/";
  public static getApiUrlLogout() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_LOGOUT;
  }
  public static API_LOCATION_ADDRESS = "account/address";
  public static getApiUrlAddress() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_ADDRESS;
  }
  public static API_LOCATION_PERSON = "account/person/";
  public static getApiUrlPerson() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_PERSON;
  }
  public static API_LOCATION_PHONE_NUMBER = "account/phone-number";
  public static getApiUrlPhoneNumber() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_PHONE_NUMBER;
  }

  public static API_REFERRALCANDY_INTEGRATION = "portal/integration/referral-candy/";
  public static getApiUrlReferralCandy() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_REFERRALCANDY_INTEGRATION;
  }

  public static API_LOCATION_ACCOUNT = "account";
  public static getApiUrlAccount() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_ACCOUNT;
  }
  public static API_LOCATION_ACCOUNT_RESOURCE_FILE = "account/resource/file";
  public static getApiUrlAccountResourceFile() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_ACCOUNT_RESOURCE_FILE;
  }
  
  // Campaign
  public static API_LOCATION_CAMPAIGN: string = "campaign/";
  public static getApiUrlCampaign() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_CAMPAIGN;
  }
  public static API_URL_CAMPAIGN_PROFILE_IMAGE = ConstantsGlobal.API_HOST + "image/campaign_profile/";
  public static getApiUrlCampaignProfileImage() {
    return ConstantsGlobal.API_HOST + "image/campaign_profile/";
  }
  public static API_URL_CAMPAIGN_DETAIL_IMAGE = ConstantsGlobal.API_HOST + "image/campaign_detail_large/";
  public static getApiUrlCampaignDetailImage() {
    return ConstantsGlobal.API_HOST + "image/campaign_detail_large/";
  }
  public static API_URL_CAMPAIGN_THUMBNAIL_IMAGE = ConstantsGlobal.API_HOST + "image/campaign_thumbnail/";
  public static getApiUrlCampaignThumbnailImage() {
    return ConstantsGlobal.API_HOST + "image/campaign_thumbnail/";
  }
  public static API_LOCATION_CAMPAIGN_MANAGEMENT: string = "campaign/status";
  public static getApiUrlCampaignManagement() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_CAMPAIGN_MANAGEMENT;
  }
  // Stripe
  public static API_LOCATION_STRIPE: string = "account/stripe/";
  public static getApiUrlStripe() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_STRIPE;
  }
  public static API_URL_CREDIT_CARD_TYPE = ConstantsGlobal.getApiUrl() + "account/credit-card-type/";
  public static getApiUrlCreditCardType() {
    return ConstantsGlobal.getApiUrl() + "account/credit-card-type/";
  }
  public static API_URL_STRIPE_CHARGE_AMOUNT = ConstantsGlobal.getApiUrl() + "account/stripe/charge-amount/";
  public static getApiUrlStripeChargeAmount() {
    return ConstantsGlobal.getApiUrl() + "account/stripe/charge-amount/";
  }
  // Guest
  public static API_LOCATION_ADDRESS_GUEST: string = "account/address/guest/";
  public static getApiUrlAddressGuest() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_ADDRESS_GUEST;
  }
  // Setting
  public static API_LOCATION_PORTAL_SETTING: string = "portal/setting/";
  public static getApiUrlPortalSetting() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_PORTAL_SETTING;
  }
  public static API_LOCATION_DISQUS_SETTING: string = "portal/setting/site_disqus_code/";
  public static getApiUrlDisqusSetting() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_DISQUS_SETTING;
  }
  //Disable User
  public static API_LOCATION_INLINE_DISABLE_USER = "account/person-inline-disable";
  public static getApiUrlInlineDisableUser() {
    return ConstantsGlobal.getApiUrl() + ConstantsGlobal.API_LOCATION_INLINE_DISABLE_USER;
  }

  // Error message
  public static ERROR_CAMPAIGN_BEING_EDITED: any = {
    "title": "Campaign being edited!",
    "message": "This campaign has not been published yet and is still being edited. Please launch this campaign to make it go live."
  };
  public static ERROR_CAMPAIGN_BEING_REVIEWED: any = {
    "title": "Campaign being reviewed!",
    "message": "Campaign is currently being reviewed by our staff. It should be ready shortly."
  };
  public static ERROR_CAMPAIGN_BEING_OTHER_STATUS: any = {
    "title": "Campaign not active!",
    "message": "Campaign is currently not active or it has finished. Please try another campaign."
  };
  public static ERROR_CAMPAIGN_INVALID: any = {
    "title": "Campaign does not exist",
    "message": "Campaign you requested does not exist. Please try another campaign."
  };

  public static DECIMAL_OPTION_DISPLAY_USE = 1;
  public static DECIMAL_OPTION_DISPLAY = 2;
  public static DECIMAL_OPTION_DISABLED = 3;
}
