import {Injectable} from "@angular/core"
import {Http, Headers, RequestOptions, URLSearchParams} from "@angular/http"
import {ConstantsGlobal} from "../Constants-Global"

@Injectable()
export class StripeService {
  public static stripe_account_id: number;
  public static stripe_account_card_id: number;
  
  constructor(private http: Http) {
  }

  /**
   * Get Stripe account
   * @return {[type]} [description]
   */
  getStripeAccount() {
    var headers = new Headers();
    var options = new RequestOptions({
      headers: headers, withCredentials: true
    });
    return this.http.get(ConstantsGlobal.getApiUrlStripe(), options)
      .map(res => res.json());
  }

  /**
   * Create Stripe pledger account and default card data
   * @return {Observable}
   */
  setStripeAccount(exp_month?: number, card_number?: number, exp_year?: number, cvc?: number, inlineToken?: string, card_token?: string) {
    var param = {
      "exp_month": exp_month,
      "number": card_number,
      "exp_year": exp_year,
      "cvc": cvc,
      "card_token": card_token
    }
    if (inlineToken) {
      param["inline_token"] = inlineToken;
    }
    var headers = new Headers();
   
    var options = new RequestOptions({
      headers: headers, withCredentials: true
    });
    return this.http.post(ConstantsGlobal.getApiUrlStripe(), JSON.stringify(param), options)
      .map(res => res.json());
  }

  /**
   * Get stripe account all cards
   * @param  {number} stripe_account_id Stripe account id
   * @return {Observable}
   */
  getStripeAccountCard() {
    var API_URL_STRIPE_CARD = ConstantsGlobal.getApiUrlStripe() + StripeService.stripe_account_id + "/card/";
    var headers = new Headers();
    var options = new RequestOptions({
      headers: headers, withCredentials: true
    });

    return this.http.get(API_URL_STRIPE_CARD, options)
      .map(res => res.json());
  }

  /**
   * Create Stripe account card
   * @param  {number} exp_month         expiring month
   * @param  {number} card_number       card number
   * @param  {number} exp_year          expiring year
   * @param  {number} cvc               CVC
   * @return {Observable}
   */
  setStripeAccountCard(name?: string, exp_month?: number, card_number?: number, exp_year?: number, cvc?: number, inlineToken?: string, card_token?: string) {
    var API_URL_STRIPE_CARD = ConstantsGlobal.getApiUrlStripe() + StripeService.stripe_account_id + "/card/";
    var param = {
      "name": name,
      "exp_month": exp_month,
      "number": card_number,
      "exp_year": exp_year,
      "cvc": cvc,
      "card_token": card_token
    };
    if (inlineToken) {
      param["inline_token"] = inlineToken;
    }
    var headers = new Headers();
    var options = new RequestOptions({
      headers: headers, withCredentials: true
    });

    return this.http.post(API_URL_STRIPE_CARD, JSON.stringify(param), options)
      .map(res => res.json());
  }

  setGuestStripeAccount(name: string, exp_month: number, card_number: number, exp_year: number, cvc: number, email: string, card_token?: string) {
    var API_URL_GUEST_STRIPE = ConstantsGlobal.getApiUrlStripe() + "guest/";
    var param = {
      "name": name,
      "exp_month": exp_month,
      "number": card_number,
      "exp_year": exp_year,
      "cvc": cvc,
      "email": email,
      "card_token": card_token
    }

    return this.http.post(API_URL_GUEST_STRIPE, JSON.stringify(param), null)
      .map(res => res.json());
  }

  getStripeChargeAmount() {
    var headers = new Headers();
    var options = new RequestOptions({
      headers: headers, withCredentials: true
    });
    return this.http.get(ConstantsGlobal.getApiUrlStripeChargeAmount(), options)
      .map(res => res.json());
  }

}
