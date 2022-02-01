import { ConstantsGlobal } from "../Constants-Global";
import { TranslationService } from './Translation.service';

declare var jQuery: any;

export class UtilService {

  public static widgetProp = {
    campaignid: "",
    themecolor: "",
    fontcolor: "",
    fontfamily: "",
    backersfontcolor: "",
    blurbfontcolor: "",
    campaignfontcolor: "",
    commentsfontcolor: "",
    contactfontcolor: "",
    creatorfontcolor: "",
    faqfontcolor: "",
    fundingfontcolor: "",
    paymentfontcolor: "",
    profilefontcolor: "",
    rewardsfontcolor: "",
    streamsfontcolor: "",
    tabbackgroundcolor: "",
    tabselectedfontcolor: "",
    tabunselectedfontcolor: "",
    topfontcolor: ""
  }

  constructor() {

  }

  public static getDateObject(dateStr: any) {
    return new Date(dateStr);
  }

  public static logError(error) {
    let errorMessage: string;
    let errorJson = error.json();
    if (errorJson.errors) {
      for (let prop in errorJson.errors) {
        errorMessage = errorJson.errors[prop][0].message;
        break;
      }
    } else {
      errorMessage = errorJson.message;
    }
    return errorMessage;
  }

  public static logPledgeError(error) {
    let errorMessage: string;
    let errorJson = error;
    if (errorJson.errors) {
      for (let prop in errorJson.errors) {
        errorMessage = errorJson.errors[prop][0].message;
        break;
      }
    } else {
      errorMessage = errorJson.message;
    }
    return errorMessage;
  }

  /**
  * Check if the attribute exists in the widget pre-set property
  * @param  {string}  attr      Attribute
  * @return {boolean}           If property exists
  */
  public static hasWidgetProperty(attr: string) {
    return UtilService.widgetProp.hasOwnProperty(attr);
  }

  public static setCampaignID(id: any) {
    if (typeof id == "string") {
      id = parseInt(id);
    }
    if (typeof id == "number") {
      ConstantsGlobal.CAMPAIGN_ID = id;
    }
  }

  public static setFontFamily() {
    if (UtilService.widgetProp.fontfamily) {
      var $domArr = [
        jQuery("#sedra-widget")[0],
        jQuery("#sedra-widget .review-payment-table")[0]
      ];
      $domArr = $domArr.concat(jQuery("#sedra-widget .item, #sedra-widget[class*='ui']").toArray());
      if ($domArr && $domArr.length) {
        $domArr.forEach(($dom) => {
          $dom.style.setProperty("font-family", this.widgetProp.fontfamily, "important");
        });
      }
    }
  }

  public static setPaginationColor() {
    var paginationNodes = jQuery("pagination-controls").find(".current").toArray();
    if (UtilService.widgetProp.themecolor && paginationNodes && paginationNodes.length) {
      paginationNodes.forEach((node) => {
        node.style.setProperty("background-color", this.widgetProp.themecolor, "important");
      });
    }
  }

  public static setWidgetHost(API_HOST: string) {
    ConstantsGlobal.setApiHost(API_HOST + "/");
    let lastApiPat = /\/api/;
    if (lastApiPat.test(API_HOST)) {
      ConstantsGlobal.SITE_HOST = API_HOST.substr(0, API_HOST.length - 3);
    }
  }

  public static setWidgetURLHost(SITE_HOST: string) {
      ConstantsGlobal.SITE_URL = SITE_HOST;
  }

  public static checkAbsoluteUrl(url: string) {
    let pattern = /^http?:\/\//i;
    return pattern.test(url);
  }

  public static setLanguageHost(Lang_OBJECT: Object) {
    ConstantsGlobal.setLanguageHost(Lang_OBJECT);
  }

  public static getDateForDisplay(date: any) {
    if (date && typeof date == "string") {
      date = date.substr(0, date.length - 3).replace(" ", "T");
      date = date.concat("Z");
      let newDate = new Date(date);
      newDate = new Date(newDate.getTime() + newDate.getTimezoneOffset() * 60 * 1000);
      return UtilService.getDateObject(newDate);
    } else {
      return date;
    }
  }

  public static generatePassword() {
    let length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }
}
