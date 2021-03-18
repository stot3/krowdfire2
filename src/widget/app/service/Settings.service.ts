import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from "@angular/http";
import { ConstantsGlobal } from "../Constants-Global";

@Injectable()
export class SettingsService {

  constructor(private http: Http) {

  }

  getAllSettings() {
    let url = ConstantsGlobal.getApiUrlPortalSetting();
    return this.http.get(url)
     .map(res => res.json());
  }
  
  /**
   * Get site logo from setting
   * 
   * @returns  Observable
   * 
   * @memberOf ServiceNameService
   */
  getSiteLogo() {
    let url = ConstantsGlobal.getApiUrlPortalSetting() + "site_logo";
    return this.http.get(url)
     .map(res => res.json());
  }

  getSettingExcludeShippingCost() {
    let url = ConstantsGlobal.getApiUrlPortalSetting() + "site_campaign_exclude_shipping_cost";
    return this.http.get(url)
     .map(res => res.json());
  }

  getSettingDecimal() {
    let url = ConstantsGlobal.getApiUrlPortalSetting() + "site_campaign_decimal_option";
    return this.http.get(url)
     .map(res => res.json());
  }

  getReferralCandyHash(email, fname, invoice_amount, timestamp) {
    let url = ConstantsGlobal.getApiUrlReferralCandy() + 
      "?email="+email+
      "&first_name="+fname+
      "&invoice_amount="+invoice_amount+
      "&timestamp="+timestamp;
    return this.http.get(url)
     .map(res => res.json());
  }

}