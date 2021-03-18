import { ConstantsGlobal } from "../Constants-Global";
export class CookieService {
  static AUTH_TOKEN: string = "reach_auth_token";
  static REACH_FIRST_NAME: string = "reach_name";
  static REACH_PERSON_ID: string = "reach_person_id";

  /**
   * Set auth token into cookie
   * @param  {string} value auth token
   */
  public static setAuth(value: string) {
    document.cookie = this.AUTH_TOKEN + "=" + value + ';samesite=none;secure';
    document.cookie = "max-age=2628000" + ';samesite=none;secure';
  }

  /**
   * Remove auth from the cookie
   */
  public static deleteAuth() {
    document.cookie = this.AUTH_TOKEN + "=";
    document.cookie = this.REACH_FIRST_NAME + "=";
    document.cookie = this.REACH_PERSON_ID + "=";
    document.cookie = "max-age=0";
  }

  /**
   * Get auth token from the cookie
   * @return {string} auth token
   */
  public static async getAuth() {
    /*
    var cookieArr = document.cookie.split(";");
    var strLengthAuthToken = this.AUTH_TOKEN.length;
    for (var i = 0; i < cookieArr.length; i++) {
      cookieArr[i] = this.cleanInput(cookieArr[i]);
      if (cookieArr[i].substring(0, strLengthAuthToken) == this.AUTH_TOKEN) {
        return cookieArr[i].substring(strLengthAuthToken + 1, cookieArr[i].length);
      }
    }*/    
    let user: any = {};
    let auth_token: String = '';
    try{
      let res = await fetch(ConstantsGlobal.getApiUrl()+'authenticate')
        if(res.ok){
          user = await res.json();
          auth_token = user.auth_token;
        }
        console.log(user);
    } catch (error){

    }
    return auth_token;
  }

  /**
   * Set logged in user first name into cookie
   * @param  {string} value User first name
   */
  public static setFirstName(value: string) {
    document.cookie = this.REACH_FIRST_NAME + "=" + value;
  }

  /**
   * get first name from the cookie
   * @return {string} first name or null
   */
  public static getFirstName() {
    var cookieArr = document.cookie.split(";");
    var strLengthFirstName = this.REACH_FIRST_NAME.length;
    for (var i = 0; i < cookieArr.length; i++) {
      cookieArr[i] = this.cleanInput(cookieArr[i]);
      if (cookieArr[i].substring(0, strLengthFirstName) == this.REACH_FIRST_NAME) {
        return cookieArr[i].substring(strLengthFirstName + 1, cookieArr[i].length);
      }
    }
    return null;
  }

  public static setPersonID(value: string) {
    document.cookie = this.REACH_PERSON_ID + "=" + value + ';samesite=none;secure';
  }

  public static getPersonID() {
    var cookieArr = document.cookie.split(";");
    var strLengthPersonID = this.REACH_PERSON_ID.length;
    for (var i = 0; i < cookieArr.length; i++) {
      cookieArr[i] = this.cleanInput(cookieArr[i]);
      if (cookieArr[i].substring(0, strLengthPersonID) == this.REACH_PERSON_ID) {
        return cookieArr[i].substring(strLengthPersonID + 1, cookieArr[i].length);
      }
    }
    return null;
  }

  /**
   * Clean the frist char if it's " "
   * @param  {string} value The string
   * @return {string}       filtered string
   */
  static cleanInput(value: string) {
    if (value.charAt(0) == " ") {
      value = value.substr(1);
    }
    return value;
  }

  public static getThrinaciaSedraAccount() {
    return this.getAuth();
    /*
    var cookieArr = document.cookie.split(";");
    var cookieObj = {};
    var currentUserLength = "current.user=".length;
    for (var index = 0; index < cookieArr.length; index++) {
      var cookie = cookieArr[index];
      if (cookie.charAt(0) == " ") {
        cookie = cookie.substr(1);
      }
      if (cookie.indexOf("current.user") == 0) {
        cookieObj = JSON.parse(decodeURIComponent(cookie.substr(currentUserLength)));
        break;
      }
    }
    return cookieObj["auth_token"];
    */
  }
}
