app.service('StripeService', function($location, $http, APIRegister, Restangular, $timeout) {
  var stripe = {};

  // get array of connected stripe accounts
  stripe.getAccount = function() {
    // get array of connected stripe accounts
    return Restangular.one('account/stripe/connect').customGET();
  }

  // get the stripe client ID
  stripe.clientID = function() {
    return Restangular.one('account/stripe/application').customGET();
  }

  // update the stripe client ID
  stripe.updateClientID = function(dataArray) {
    return Restangular.one('account/stripe/application').customPUT(dataArray);
  }

  //redirect back to a certain page
  stripe.redirectURL = function() {
    return window.location.protocol + "//" + window.location.host + document.getElementsByTagName("base")[0].getAttribute("href") + "stripe/connect";
  }

  stripe.connect = function() {
    //if code and scope are returned by redirect, connect the account.
    if ($location.search()['code'] && $location.search()['scope']) {
      return Restangular.one('account/stripe/connect').customPOST({ "code": $location.search()['code'], "scope": $location.search()['scope'] });
    } else if ($location.search()['code']) {
      // If no scope express is being used.
      return Restangular.one('account/stripe/connect').customPOST({ "code": $location.search()['code'] });
    }
  }

  stripe.removeStripeConnect = function(account) {
    return Restangular.one('account/stripe/connect', account.id).customDELETE();
  }

  stripe.generateStateParam = function(directPath) {
    var incode64 = btoa(directPath);
    return incode64;
  }

  stripe.getCurrencies = function() {
    return Restangular.one('account/stripe/currency').customGET();
  }

  /*
   *************pledger functions*************
   */

  //retrieve pledger stripe account
  stripe.getPledgerAccount = function(retry_pledge_token) {
    var params = {};
    if(retry_pledge_token){
      params.retry_pledge_token = retry_pledge_token;
    }
    return Restangular.one('account/stripe').customGET("", params);
  }

  //create new pledger stripe account with card information
  stripe.newPledgerAccount = function(dataArray) {
    return Restangular.one('account/stripe').customPOST(dataArray);
  }

  //create new guest pledger stripe account with card information
  stripe.newGuestPledgerAccount = function(dataArray) {
    return Restangular.one('account/stripe/guest').customPOST(dataArray);
  }

  //delete pledger stripe account with card informations
  stripe.deletePledgerAccount = function(dataArray) {
    return Restangular.one('account/stripe').customDELETE(dataArray);
  }

  // add new card to existing account
  stripe.createCard = function(accountID, dataArray) {
    return Restangular.one('account/stripe', accountID).one('card').customPOST(dataArray);
  }

  // update a card
  stripe.updateCard = function(accountID, cardID, dataArray) {
    return Restangular.one('account/stripe', accountID).one('card', cardID).customPUT(dataArray);
  }

  // delete a card
  stripe.deleteCard = function(accountID, cardID) {
    return Restangular.one('account/stripe', accountID).one('card', cardID).customDELETE();
  }

  // get all the cards associated to the account
  stripe.getCards = function(accountID) {
    return Restangular.one('account/stripe', accountID).one('card').customGET();
  }
  
  stripe.setBrandIcon = function (brand, cardBrandToPfClass) {
    var brandIconElement = document.getElementById('brand-icon');
    var pfClass = 'pf-credit-card';
    if (brand in cardBrandToPfClass) {
      pfClass = cardBrandToPfClass[brand];
      switch (brand) {
        case "visa":
          $('#brand-icon').css("background-image", "url(images/cards/Visa.png)");
          break;
        case "mastercard":
          $('#brand-icon').css("background-image", "url(images/cards/MasterCard.png)");
          break;
        case "amex":
          $('#brand-icon').css("background-image", "url(images/cards/American%20Express.png)");
          break;
        case "dinersclub":
          $('#brand-icon').css("background-image", "url(images/cards/diners.png)");
          break;
        case "discover":
          $('#brand-icon').css("background-image", "url(images/cards/Discover.png)");
          break;
        case "jcb":
          $('#brand-icon').css("background-image", "url(images/cards/jcb.png)");
          break;
        default:
          $('#brand-icon').css("background-image", "url(images/cards/default-credit-card-icon.png)");
      }
    }
    for (var i = brandIconElement.classList.length - 1; i >= 0; i--) {
      brandIconElement.classList.remove(brandIconElement.classList[i]);
    }
    brandIconElement.classList.add('pf');
    brandIconElement.classList.add(pfClass);
  }

  // copy function
  function copyObjectProperties(srcObj, destObj) {
    for (var key in srcObj) {
      destObj[key] = srcObj[key];
    }
  }

  return stripe;
});