import { Http, Headers, RequestOptions } from "@angular/http";
import { Injectable } from "@angular/core";
import { ConstantsGlobal } from "../Constants-Global";

@Injectable()
export class UserService {
  userData: Object;

  constructor(private http: Http) {
    this.http = http;
    this.getAuthenticatedUser().subscribe(
      res => {
        this.userData = res;
      },
      error => {
       
      }
    )
  }

  /**
   * Log in with email and password
   * @param  {string} email    email
   * @param  {string} password
   * @return {Observable}      
   */
  login(email: string, password: string) {
    let body = {
      "email": email,
      "password": password
    }
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.post(ConstantsGlobal.getApiUrlAuth(), JSON.stringify(body), options)
      .map(res => res.json());
  }

  /**
   * Log in with Okta ID token
   * @param  {string} id_token
   * @return {Observable}      
   */
  loginOktaSocial(id_token: string) {
    let body = { id_token };
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.post(ConstantsGlobal.getApiUrlAuthOktaSocial(), JSON.stringify(body), options)
      .map(res => res.json());
  }

  getAuthenticatedUser() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.get(ConstantsGlobal.getApiUrlAuth(), options)
      .map(res => res.json());
  }

  setUser(data){
    this.userData = data;
  }

  /**
   * Register user with provided info
   * @param  {Object}     registerParam parameter for registering
   * @return {Observable}
   */
  register(registerParam: Object) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true })
    return this.http.post(ConstantsGlobal.getApiUrlRegister(), JSON.stringify(registerParam), options)
      .map(res => res.json());
  }

  /**
   * set new user address
   * @param  {Object} addressObj object that contains address
   * @return {Observable}        Observable
   */
  setNewAddress(addressObj: Object) {
    let param = {};
    for (let prop in addressObj) {
      if (addressObj.hasOwnProperty(prop)) {
        param[prop] = addressObj[prop];
      }
    }

    let headers = new Headers();
    let options = new RequestOptions({
      headers: headers, withCredentials: true
    });

    return this.http.post(ConstantsGlobal.getApiUrlAddress(), JSON.stringify(param), options)
      .map(res => res.json());
  }

  /**
   * get user addresses
   * @return {Observable} Observable
   */
  getAddress() {
    let headers = new Headers();
    let options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });

    return this.http.get(ConstantsGlobal.getApiUrlAddress(), options)
      .map(res => res.json());
  }

  getProfile(person_id: string) {
    return this.http.get(ConstantsGlobal.getApiUrlPerson() + person_id)
      .map(res => res.json());
  }

  saveProfile(profileObj: Object) {
    let param = {};
    for (let prop in profileObj) {
      if (profileObj.hasOwnProperty(prop)) {
        param[prop] = profileObj[prop];
      }
    }
    let headers = new Headers();
    let options = new RequestOptions({
      headers: headers, withCredentials: true
    });

    return this.http.put(ConstantsGlobal.getApiUrlAccount(), JSON.stringify(param), options)
      .map(res => res.json());
  }

  /**
   * Log out current user
   * @return {[type]} [description]
   */
  logout() {
    let headers = new Headers();
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.post(ConstantsGlobal.getApiUrlLogout(), null, options)
      .map(res => {
        res.json();
      });
  }

  setGuestAddress(addressObj: Object) {
    return this.http.post(ConstantsGlobal.getApiUrlAddressGuest(), JSON.stringify(addressObj))
      .map(res => res.json());
  }


  /**
   * Get phone number for the current user
   * 
   * @returns
   */
  getPhone() {
    let headers = new Headers();
    let options = new RequestOptions({
      headers: headers, withCredentials: true
    });

    return this.http.get(ConstantsGlobal.getApiUrlPhoneNumber(), options)
      .map(res => res.json());
  }

  /**
   * Set new phone number for current user
   * 
   * @param {any} phoneObj required params for POST
   * @returns
   */
  setNewPhone(phoneObj: any) {
    let param = {};
    for (let prop in phoneObj) {
      if (phoneObj.hasOwnProperty(prop)) {
        param[prop] = phoneObj[prop];
      }
    }

    let headers = new Headers();
    let options = new RequestOptions({
      headers: headers, withCredentials: true
    });

    return this.http.post(ConstantsGlobal.getApiUrlPhoneNumber(), JSON.stringify(param), options)
      .map(res => res.json());
  }

  disableUser(data: any) {
    let param = {
      person_id: data['user_id'],
      inline_token: data['inline_token']
    };

    let headers = new Headers();

    let options = new RequestOptions({
      headers: headers, withCredentials: true
    });
    // { person_id: $scope.registering_user.id, inline_token: $scope.registering_user.inline_token}
    return this.http.put(ConstantsGlobal.getApiUrlInlineDisableUser(), JSON.stringify(param), options)
      .map(res => res.json());
      
  }

}
