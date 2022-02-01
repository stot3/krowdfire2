app.controller('PaymentSettingCtrl', function($translate, $window, $location, $translatePartialLoader, $timeout, $scope, $q, $rootScope, UserService, Restangular, StripeService) {

  /*==========================================================*/
  /*------------------------- global -------------------------*/
  /*==========================================================*/
  $scope.clearMessage = function() {
    $rootScope.floatingMessage = [];
  }
  var msg;

  // open modal by id
  $scope.openModal = function(modalId) {
    $('.modal#' + modalId).modal('show');
    if (modalId == 'setting-add-card') {
      $('.modal#' + modalId).modal('setting', {
        onApprove: $scope.saveCard
      });
    }
    if (modalId == 'setting-propagate-card') {
      $('.modal#' + modalId).modal('setting', {
        onApprove: $scope.cardPropagate
      });
    }
  };

  $scope.updateLabel = function(id, label){
    var data = {
      name: label
    }
    Restangular.one('account/stripe/connect/'+id).customPUT(data).then(function(){
      msg = {
        header: $translate.instant('tab_stripe_account_label_update_success')
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }

  // detect location hash
  var hashVal = $location.hash();

  // hash value handler
  if (hashVal) {
    $('#payment-tabs').find('[data-tab]').removeClass('active');
    $('#payment-tabs').find('[data-tab=' + hashVal + ']').addClass('active');
  }

  // click hash function
  $scope.clickHash = function(tabName) {
    $location.hash(tabName).replace();
  };

  // semantic tab initialize
  $('#payment-tabs .menu-tabs .item').tab({
    context: $('#payment-tabs')
  });
  $scope.showStripe = false;
  StripeService.getAccount().then(function(success) {
    if (success[0]) {
      $scope.showStripe = true;
    } else {
      $('#ccard').addClass('active');
      $scope.showStripe = false;
    }
  });
  $scope.$emit("loading_finished");
});
/*===========================================================*/
/*--------------------- stipe connection --------------------*/
/*===========================================================*/
app.controller('TabStripeCtrl', function($translate, $window, $location, $timeout, $scope, $q, $rootScope, UserService, Restangular, StripeService) {
  
  $scope.checkall = function($evt) {
    var $elem = $evt.currentTarget;
    var elem = angular.element($elem);
    var input = elem.children('input:checkbox').prop('checked');
    if (input) {
      $('.stripe-connect-table tbody .t-check-box').find('.ui.checkbox').checkbox('uncheck');
    } else {
      $('.stripe-connect-table tbody .t-check-box').find('.ui.checkbox').checkbox('check');
    }
  }

  StripeService.getAccount().then(function(success) {
    $scope.$emit("loading_finished");
    $scope.stripeAccounts = success;
    $rootScope.checkSaccount = $scope.stripeAccounts;
  });

  // get stripe client ID
  StripeService.clientID().then(function(success) {
    $scope.clientID = success;
    $scope.stripeConnect = function() {
      if ($scope.clientID.client_id && $scope.clientID.publishable_key && $scope.clientID.secret_key) {
        var client_id = $scope.clientID.client_id;
        var redirect = StripeService.redirectURL();
        var state = StripeService.generateStateParam('/payment-setting');

        $window.location.href = "https://connect.stripe.com/oauth/authorize?response_type=code&client_id=" + client_id + "&scope=read_write&redirect_uri=" + redirect + "&state=" + state;
      } else {
        setTimeout(function() {
          $translate(['stripe_not_setup']).then(function(value) {
            $scope.notsetup = value.stripe_not_setup;
            msg = {
              header: $scope.notsetup
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          })
        }, 50);

      }
    }
  });

  // delete stripe account
  $scope.deleteConfirm = function() {
    //$scope.clearMessage();
    $scope.lst = [];
    $('.stripe-connect-row').each(function() {
      if ($(this).find('.t-check-box input').prop('checked')) {
        $scope.lst.push($(this).scope().account);
      }
    });

    if ($scope.lst.length == 0) {
      // $('.not-select-modal').modal('show');
      msg = {
        header: 'tab_stripeconnect_select_error'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    } else {
      $('.modal#connection-delete-confirm').modal('show');
    }
  };
  // deleting multiple accounts
  $scope.deleteMultiAccount = function() {
      for (var i = 0; i < $scope.lst.length; i++) {
        $scope.removeStripe($scope.lst[i]);
      }
    }
    // removing stripe account
  $scope.removeStripe = function(account) {
    getStripeAccountLinked(account.id).then(function(result) {
      if (!result) {
        StripeService.removeStripeConnect(account).then(function(success) {
          msg = {
            'header': 'success_message_save_changes_button'
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          $scope.stripeAccounts.splice($scope.stripeAccounts.indexOf(account), 1); // remove from the array
        }, function(fail) {
          msg = {
            'header': fail.data.message
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      } else {
        $translate('tab_stripeconnect_select_error_linked').then(function(result) {
          var msg = {
            'header': result
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      }
    });
  }

  function getStripeAccountLinked(stripeId) {
    return Restangular.one("account/stripe/linked").customGET(stripeId).then(function(success) {
      var linkedObj = success.plain();
      if (linkedObj.linked == "t") {
        return true;
      } else {
        return false;
      }
    }).catch(function(error) {
      console.error("account/stripe/linked error", error);
      return false;
    });
  }

  $scope.getPayout = function(id){
    Restangular.one('portal/account-login-link/'+id).customGET().then(function(success){
      window.location.href = success.url;
    }).catch(function(fail){
      msg = {
        'header': "You must connect a stripe account to view payouts",
      }
      $rootScope.floatingMessage = msg;
    });
  }
});
/*===========================================================*/
/*----------------------- manage cards ----------------------*/
/*===========================================================*/
app.controller('TabCardCtrl', function($translate, $rootScope, $window, $location, $timeout, $scope, $q, UserService, Restangular, StripeService, PortalSettingsService) {
  $scope.user = UserService;
  // Finger print of test cards.
  var testCardList = [
    "fesfMpDlyRwQlfOR", // 4242 
    "zmMDqYFYwaOsmEI5", // 1881
    "hBLWRajh1DEVwOCZ", // 5556
    "JxKqSodoxOgqDNPo", // 4444
    "nQAexA1OLuxLt5yv", // 8210
    "eqYAGwPkDLnwPwlk", // 5100
    "rUSQjFBvKn9JrlBj", // 0005
    "2x7xJ9EYnB6fPbq1", // 8431
    "sHVV8VifXja0dMal", // 0077
    "DPVDktTQfsrrG1V0", // 0341
    "ngNQUk98LgZQahLY", // 0101
    "cN8BettQ1y8bPyCB", // 0044
    "N0CWy6kZGwKgRhYT", // 0036
    "8ymL4bHDJLauK8RE", // 0028
    "OwA2d5zSurT1X6UL", // 0010
    "cF7iKBYchZGAU4mY", // 0093
    "lfut2s776LeSKCfM", // 0505
    "1ehUfvfLMRi7viJc", // 0000
    "bUpN2xUIwsW0nCyS", // 5904
    "gPlJdTzOvr7DU2KZ", // 3237
    "5h1ycnCnDuiViRms", // 9424
    "dFbkmaIFBVpVmuIw", // 1117
  ];
  $scope.stripeExtraDetails = {
    address_city: '',
    address_country: '',
    address_line1: '',
    name: ''
  };
  $scope.testMode = false;
  $scope.editCard = {};
  $scope.pcard = "dw";
  var portal_settings;

  PortalSettingsService.getSettingsObj().then(function(success) {
    $scope.$emit("loading_finished");
    portal_settings = success.public_setting;
    $scope.portalsetting = success.public_setting;
    $scope.site_stripe_tokenization_settings = success.public_setting.site_stripe_tokenization;

    //Correct If Undefined 
    if (typeof $scope.site_stripe_tokenization_settings === 'undefined' || $scope.site_stripe_tokenization_settings == null) {
      $scope.site_stripe_tokenization_settings = {
        toggle: false,
        public_stripe_key: ''
      };
    } else {
      getStripeExtraDetails();
    }

  });

  function getStripeExtraDetails() {
    Restangular.one('account').one('address').get().then(function(address) {
      var city, country, street;
      angular.forEach(address.personal, function(value, key, obj) {
        //Exit if you find a primary address
        if (value.primary_address) {
          city = value.city;
          country = value.country;
          street = value.street1;
          return;
        }
        //If no primary address found, take the last address
        city = value.city;
        country = value.country;
        street = value.street1;
      });

      $scope.stripeExtraDetails.address_city = city;
      $scope.stripeExtraDetails.address_country = country;
      $scope.stripeExtraDetails.address_line1 = street;
      $scope.stripeExtraDetails.name = $scope.user.first_name + ' ' + $scope.user.last_name;
    });
  }

  // rewrite open modal by id
  $scope.openModal = function(modalId) {
    $('.modal#' + modalId).modal('setting', {
      onApprove: $scope.saveCard
    }).modal('show');
    if (modalId == 'setting-propagate-card') {
      $('.modal#' + modalId).modal('setting', {
        onApprove: $scope.cardPropagate
      });
    }

  };

  // To check all boxes 
  $scope.checkall = function($evt) {
    var $elem = $evt.currentTarget;
    var elem = angular.element($elem);
    var input = elem.children('input:checkbox').prop('checked');
    if (input) {
      $('.card-table tbody .t-check-box').find('.ui.checkbox').checkbox('uncheck');
    } else {
      $('.card-table tbody .t-check-box').find('.ui.checkbox').checkbox('check');
    }
  }

  var hasAccount = false; // flag for has account
  getPledgerAccount();
  var currentDate = new Date();
  $scope.currentMonth = currentDate.getMonth() + 1;
  $scope.currentYear = currentDate.getFullYear();

  $scope.selectCard = function(card) {
    $('#credit-card-info').form('clear');
    $scope.cardSelected = card;
  };
  $scope.newCard = function() {
    $('#credit-card-info').form('clear');
    // initiate the card
    $scope.cardSelected = {
      card_token: '',
      stripe_account_id: '',
      number: '',
      exp_month: '',
      exp_year: '',
      cvc: '',
      name: '',
    };
    if (hasAccount) {
      $scope.cardSelected.stripe_account_id = $scope.account[0].stripe_account_id;
    }
  };

  $scope.propagateCard = function(card) {
      $('#credit-card-info').form('clear');
      $scope.pcard = card;
    }
    // select card to be the default card
  $scope.cardPropagate = function() {

    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    Restangular.one('campaign/account-card', $scope.pcard.stripe_account_card_id).customPUT().then(function(success) {
      msg = {
        header: 'tab_managecard_default_card'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      getPledgerAccount();
    });
  }

  // rewrite open modal by id
  $scope.openEditModal = function(modalId) {
    $('.modal#' + modalId).modal('setting', {
      onApprove: $scope.submitEditCard
    }).modal('show');
  };

  // Update the current card in $scope.editCard
  $scope.submitEditCard = function() {

    var editCardData = {};
    for (var i in $scope.editCard) {
      if (i != "display_number") {
        editCardData[i] = $scope.editCard[i];
      }
    }

    update = StripeService.updateCard($scope.editCard.stripe_account_id, $scope.editCard.stripe_account_card_id, editCardData);
    update.then(function(success) {
      msg = {
        header: 'success_message_save_changes_button'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      getPledgerAccount();
    }, function(failed) {
      if (failed.data.type == 'invalid_request_error') {
        msg = {
          header: failed.data.type
        }
      } else {

        msg = {
          header: failed.data.code
        }
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }

  // Sets the card to the current editCard
  $scope.setEditCard = function(card) {
    // $('#credit-card-edit-info').form('clear');
    for (var i in card) {
      $scope.editCard[i] = card[i];
    }
    $scope.editCard.display_number = "**** **** **** " + card.last4;
  }

  $scope.initStripeElement = function() {

    var translation = $translate.instant(['pledge_campaign_stripe_elements_cardExpirey', 'pledge_campaign_stripe_elements_cardNumber', 'pledge_campaign_creditcard_cvc_placeholder']);

    $scope.stripe = Stripe($scope.site_stripe_tokenization_settings.public_stripe_key);
    $scope.elements = $scope.stripe.elements();

    var cardBrandToPfClass = {
      'visa': 'pf-visa',
      'mastercard': 'pf-mastercard',
      'amex': 'pf-american-express',
      'discover': 'pf-discover',
      'diners': 'pf-diners',
      'jcb': 'pf-jcb',
      'unknown': 'pf-credit-card',
    }

    //Styles 
    var style = {
      base: {
        iconColor: '#A3A3A3',
        color: '#000000',
        lineHeight: '16px',
        fontWeight: 400,
        fontFamily: 'Lato,"Helvetica Neue0",Arial,Helvetica,sans-serif',
        fontSize: '14px',
        '::placeholder': {
          color: '#A3A3A3',
        },
      },
      invalid: {
        color: '#d95c5c',
        ':focus': {
          color: '#d95c5c',
        },
      },
    };
    $scope.cardNumberElement = $scope.elements.create('cardNumber', {
      placeholder: translation.pledge_campaign_stripe_elements_cardNumber,
      iconStyle: 'solid',
      style: style
    });
    $scope.cardNumberElement.mount('#card-number-element');

    $scope.cardExpiryElement = $scope.elements.create('cardExpiry', {
      placeholder: translation.pledge_campaign_stripe_elements_cardExpirey,
      iconStyle: 'solid',
      style: style
    });
    $scope.cardExpiryElement.mount('#card-expiry-element');

    $scope.cardCvcElement = $scope.elements.create('cardCvc', {
      placeholder: translation.pledge_campaign_creditcard_cvc_placeholder,
      iconStyle: 'solid',
      style: style
    });
    $scope.cardCvcElement.mount('#card-cvc-element');

    $scope.cardNumberElement.addEventListener('change', function(event) {
      var displayError = angular.element('#card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
      // Switch brand logo
      if (event.brand) {
        setBrandIcon(event.brand, cardBrandToPfClass);
      }
    });

    $('#brand-icon').css("background-image", "url(images/cards/default-credit-card-icon.png)");

  }

  function setBrandIcon(brand, cardBrandToPfClass) {
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
  $scope.saveCard = function() {
    var promises = [];
    //$scope.clearMessage();
    var not_validated = !$('#credit-card-info').form('validate form');
    if (not_validated) {
      return false;
    }
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;

    if (hasAccount) {

      // if the user has an account, add new card
      // if there is an id, update the selected card
      if ($scope.cardSelected.stripe_account_card_id) {
        promises.push(StripeService.updateCard($scope.cardSelected.stripe_account_id, $scope.cardSelected.stripe_account_card_id, $scope.cardSelected));
      }
      // else create new card
      else {
        if ($scope.site_stripe_tokenization_settings.toggle) {
          $scope.stripeExtraDetails.name = $scope.cardSelected.name;
          $scope.stripe.createToken($scope.cardNumberElement, $scope.stripeExtraDetails).then(function(result) {
            if (result.error) {
              $timeout(function() {
                $rootScope.removeFloatingMessage();
                // Inform the user if there was an error
                var errorElement = angular.element(document.querySelector('#card-errors')).html(result.error.message);
                msg = {
                  'header': 'pledge_campaign_stripe_elements_error'
                }
                $rootScope.floatingMessage = msg;
                $('#finalpledge').removeClass('disabled');
              }, 0);
            } else {
              // Send the token to your server          
              $scope.cardSelected.card_token = result.token.id;
              promises.push(StripeService.createCard($scope.cardSelected.stripe_account_id, $scope.cardSelected));
            }
          });

        } else {
          promises.push(StripeService.createCard($scope.cardSelected.stripe_account_id, $scope.cardSelected));
        }
      }
    } else // if the user doesn't have an account, create account and add card
    {

      if ($scope.site_stripe_tokenization_settings.toggle) {
        $scope.stripeExtraDetails.name = $scope.cardSelected.name;
        $scope.stripe.createToken($scope.cardNumberElement, $scope.stripeExtraDetails).then(function(result) {
          if (result.error) {
            $timeout(function() {
              $rootScope.removeFloatingMessage();
              // Inform the user if there was an error
              var errorElement = angular.element(document.querySelector('#card-errors')).html(result.error.message);
              msg = {
                'header': 'pledge_campaign_stripe_elements_error'
              }
              $rootScope.floatingMessage = msg;
              $('#finalpledge').removeClass('disabled');
            }, 0);
          } else {
            // Send the token to your server          
            $scope.cardSelected.card_token = result.token.id;
            promises.push(StripeService.newPledgerAccount($scope.cardSelected));
          }
        });
      } else {
        promises.push(StripeService.newPledgerAccount($scope.cardSelected));
      }
    }
    $scope.resolvePromiseChain(promises);
  };

  $scope.resolvePromiseChain = function(promises) {
    $q.all(promises).then(function(success) {
      msg = {
        header: 'success_message_save_changes_button'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      if ($scope.site_stripe_tokenization_settings.toggle) {
        $scope.cardNumberElement.clear();
        $scope.cardExpiryElement.clear();
        $scope.cardCvcElement.clear();
      }
      $timeout(function() {
        getPledgerAccount();
      }, 3000); // refresh list by request the server for accounts
    }, function(failed) {
      if (failed.data.type == 'invalid_request_error') {
        msg = {
          header: failed.data.type
        }
      } else {

        msg = {
          header: failed.data.code
        }
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }

  $scope.removeCard = function(card) {
    // delete request
    return StripeService.deleteCard($scope.account[0].stripe_account_id, card.stripe_account_card_id);
  };

  // Checks the finger print of cards and marks if they are test cards.
  function markTestCards(cards) {
    if (cards === undefined) {
      return false;
    }

    for (var i in cards) {
      var indexOf = testCardList.indexOf(cards[i].fingerprint);
      if (indexOf > -1) {
        cards[i].testCard = true;
        $scope.test_card_found = true;
      } else {
        cards[i].testCard = false;
        $scope.live_card_found = true;
      }
    }
  }

  // Check if stripe is in test mode or live mode.
  function getStripeMode() {
    StripeService.clientID().then(function(success) {
      if ("publishable_key" in success) {
        var indexOf = success.publishable_key.indexOf('test');
        if (indexOf > -1) {
          $scope.testMode = true;
        } else {
          $scope.testMode = false;
        }
      }
    });
  }

  // get the pledger account info
  function getPledgerAccount() {
    StripeService.getPledgerAccount().then(function(success) {
      $scope.account = success.plain();
      getStripeMode();

      if (success.length) {
        hasAccount = true;
        $scope.hascard = true;
      } else {
        hasAccount = false;
        $scope.hascard = false;
      }
    });
  }
  // deleting multiple credit cards
  $scope.deleteMultiCard = function() {
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var lst = [];
    var requestQueue = [];
    $('.card-row').each(function() {
      if ($(this).find('.t-check-box input').prop('checked')) {
        lst.push($(this).scope().card);
      }
    });
    if (lst.length == 0) {

      msg = {
        header: 'checkbox_select_error'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    } else {
      for (var i = 0; i < lst.length; i++) {
        requestQueue.push($scope.removeCard(lst[i]));
      }
      $q.all(requestQueue).then(function(success) {
        angular.forEach(success, function(value) {
          angular.forEach($scope.account[0].cards, function(card, index) {
            if (value.id == card.id) {
              $scope.account[0].cards.splice(index, 1);
            }
          });
        });
        getPledgerAccount();
        msg = {
          header: 'deleted_success'
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }, function(failed) {
        msg = {
          header: failed.data.code
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
  }

  $scope.eraseAccount = function() {

    $('#erase-account-confirm').modal('setting', {
      onApprove: function() {
        msg = {
          'loading': true,
          'loading_message': 'in_progress'
        }
        $rootScope.floatingMessage = msg;

        Restangular.one('account/stripe/' + $scope.account[0].id).customDELETE().then(function() {
          msg = {
            header: 'deleted_success'
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          getPledgerAccount();
        }, function(failed) {
          msg = {
            header: failed.data.code
          }

          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      }
    }).modal('show');
  }
});