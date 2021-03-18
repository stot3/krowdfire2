//------------------------------------------------------
//       CAMPAIGN MANAGEMENT / CAMPAIGN CONTROLLER
//------------------------------------------------------
app.controller('AdminCampaignsCtrl', function ($q, $rootScope, CampaignSettingsService, CreateCampaignService, $scope, Geolocator, $timeout, Restangular, RestFullResponse, $translatePartialLoader, $translate, TimeStatusService, LANG, PortalSettingsService) {

  $scope.clearMessage = function () {
    $rootScope.floatingMessage = [];
  };
  var msg = {};
  $scope.companies = [];
  $scope.campaign_buffer = [];
  $scope.public_settings = {};

  // campaign status request
  Restangular.one('campaign/status').customGET().then(function (success) {
    $scope.campaignStatus = success;
  });
  Restangular.one('portal/setting').getList().then(function (success) {
    $scope.public_settings = {};
    angular.forEach(success, function (value) {
      if (value.setting_type_id == 3) {
        $scope.public_settings[value.name] = value.value;
        $scope.payment_gateway = $scope.public_settings.site_payment_gateway;
      }
    });
  });

  $scope.isFeaturedCampaignsLoaded = false;
  $scope.loadCampaignRevisions = function () {
    Restangular.one('portal/campaign-revision').customGET().then(function (success) {
      $scope.campaignRevisions = success.plain();
    });
  }

  $scope.loadCampaignRevisions();

  $scope.filename = "transactiondatadetails";
  $scope.filename = "campaign";
  $scope.campaigndata = [];
  $scope.transactiondata = [];
  $scope.details = false;
  $scope.selectedCity = {};
  $scope.ordertype = "";
  $scope.orderbtn = true;
  $scope.ordertypeid = '-entry_id';
  $scope.orderbtnid = true;
  $scope.ordertypeend = '-ends';
  $scope.orderbtnend = true;
  $scope.ordertypestatus = '-entry_status';
  $scope.orderbtnstatus = true;
  $scope.ordertypename = '-name';
  $scope.namebtn = true;
  $scope.nameshow = false;
  $scope.idshow = false;
  $scope.startshow = false;
  $scope.endshow = false;
  $scope.selectedCity = {};
  $scope.selectedSubcountry = {};
  $scope.selectedCountry = {};
  var detailTransactionData = {
    "cindex": "",
    "cname": "",
    "cstatus": ""
  }
  $scope.isTransaction = false;
  $scope.sortOrFiltersCampaign = {
    "sort": $scope.ordertype + '-display_priority,-created',
    "filters": {
      "category": {},
      "location": '',
    },
    "page_entries": 10,
    "page_limit": 100,
    "pagination": {},
    "page": 1
  }
  $scope.showManualTransactionFromCamp = false;
  $scope.showManualTransactionFromTrans = false;
  $scope.isAnonymous = [{
    "type_id": "0",
    "name": "tab_campaign_regular_contribution"
  }, {
    "type_id": "1",
    "name": "tab_campaign_partially_anonymous_contribution"
  }, {
    "type_id": "2",
    "name": "tab_campaign_fully_anonymous_contribution"
  }];
  $scope.user = {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    occupation: '',
    employer: '',
    address1: '',
    address2: '',
    city_id: '',
    country_id: '',
    reward: '',
    amount: '',
    cheque_ref: '',
    postal_code: '',
    created: '',
    anonymous: $scope.isAnonymous[0]
  };
  $scope.address = {
    city_id: '',
    mail_code: '',
    street1: '',
    street2: '',
    country_id: ''
  };
  $scope.fromPage = "";
  // Variable that stores current campaign the user is adding manual transaction to
  $scope.selectedCampaign = "";
  var globalPhoneNumberType = {};
  var globalStripeStatus = [];
  var globalStripeType = [];
  $scope.isCampaignRevisionsView = false;
  $scope.selectedRevisions = [];
  $scope.tip = { value: null, type: 'Dollar' };

  $scope.organizationFields = {
    name: '',
    email: ''
  };

  PortalSettingsService.getSettingsObj().then(function (success) {
    $scope.portal_settings = success.public_setting;
    $scope.isISODate = success.public_setting.site_theme_campaign_display_iso_date;
    $scope.enableCampaignRevisions = success.public_setting.site_campaign_enable_campaign_revisions;
    $scope.isFeaturedCampaignLimitIncreased = success.public_setting.site_increase_featured_campaigns_limit;
    $scope.tippingOptions = success.public_setting.site_tipping;
    $scope.isProfileContribAttributes = success.public_setting.site_campaign_profile_data_on_pledge;
    
    if ($scope.tippingOptions && $scope.tippingOptions.toggle) {
      if (!$scope.tippingOptions.toggle_dynamic && $scope.tippingOptions.toggle_tiers) {
        if ($scope.tippingOptions.tiers) {
          $scope.tip = { value: $scope.tippingOptions.tiers[0].value, type: $scope.tippingOptions.tiers[0].type };
        }
      }
    } else {
      $scope.tippingOptions = {};
    }

    // Check if setting is true then change featured campaigns limit to 100 otherwise use the default limit
    if ($scope.isFeaturedCampaignLimitIncreased) {
      $scope.featuredCampaignsLimit = 100;
    } else {
      $scope.featuredCampaignsLimit = 4;
    }
    setShippingVar();
    if ($scope.portal_settings.site_campaign_always_anonymous_contribution) {
      $scope.isAnonymous = $scope.isAnonymous.slice($scope.isAnonymous.length - 1);
    }

    if ($scope.isProfileContribAttributes) {
      $scope.selectedAccountType = 'Individual';

      $scope.accountTypeSelected = function (type) {
        $scope.selectedAccountType = type;
      }

      $scope.getCompany();      
    }
  });



  $translate(["Landline Phone Number", "Mobile Phone Number", "Fax Phone Number"]).then(function (phoneNumberType) {
    globalPhoneNumberType = phoneNumberType;
  });

  $translate(["stripe_status_status_new_ready_process", "stripe_status_status_new_being_processed", "stripe_status_status_processed_success", "stripe_status_status_processed_failure", "stripe_status_type_pledge_preauth", "stripe_status_type_pledge_capture"]).then(function (stripeTranslation) {
    for (var stripeResp in stripeTranslation) {
      if (stripeTranslation.hasOwnProperty(stripeResp)) {
        if (globalStripeStatus.length < 4) {
          globalStripeStatus.push(stripeTranslation[stripeResp]);
        } else {
          globalStripeType.push(stripeTranslation[stripeResp]);
        }
      }
    }
  });

  $scope.getCompany = function () {
    Restangular.one('account/business').customGET().then(function (success) {
      $scope.companies = success;
    });
  }

  // This will enable transaction button in selected campaign by removing disabled class
  $scope.setEnabled = function () {
    var campaignClassDisabled = ".campaign" + $scope.selectedCampaign + " .transaction_button";
    jQuery(campaignClassDisabled).removeClass('disabled');
  }

  // Hide the success or error message that appears at top
  // Reset msgHide so it can still show msg later
  // $scope.clearMessage() is defined in app.js
  var hideMsg = function () {
    $timeout(function () {
      // jQuery(".message-seg").hide("fast");
      $scope.msgHide = true;
      //$scope.clearMessage();
      $scope.msgHide = false;
    }, 10000);
  }

  $('.order-by-priority').checkbox('check');

  $scope.sortByPriority = function () {
    $scope.nameshow = false;
    $scope.idshow = false;
    $scope.startshow = false;
    $scope.endshow = false;
    if (!$('.order-by-priority').checkbox('is checked')) {
      $scope.sortOrFiltersCampaign.sort = '-display_priority,-created,-entry_id,-ends';
      updateCampaignListing($scope.sortOrFiltersCampaign);
    }
  }

  $scope.changeOrderStart = function () {
    $('.order-by-priority').checkbox('uncheck');
    $scope.idshow = false;
    $scope.startshow = true;
    $scope.endshow = false;
    $scope.nameshow = false;
    if ($scope.ordertype == '-created') {
      $scope.ordertype = "created";
      $scope.orderbtn = false;
      $scope.sortOrFiltersCampaign.sort = 'created,display_priority,entry_id,ends';
    } else {
      $scope.orderbtn = true;
      $scope.ordertype = "-created";
      $scope.sortOrFiltersCampaign.sort = '-created,-display_priority,-entry_id,-ends';
    }
    $scope.sortOrFiltersCampaign.page_entries = $('#resultValue').text();
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }

  $scope.changeOrderName = function () {
    $('.order-by-priority').checkbox('uncheck');
    $scope.idshow = false;
    $scope.startshow = false;
    $scope.endshow = false;
    $scope.nameshow = true;
    if ($scope.ordertypename == '-name') {
      $scope.ordertypename = "name";
      $scope.namebtn = false;
      $scope.sortOrFiltersCampaign.sort = 'name,created,display_priority,entry_id,ends';
    } else {
      $scope.namebtn = true;
      $scope.ordertypename = "-name";
      $scope.sortOrFiltersCampaign.sort = '-name,-display_priority,-entry_id,-ends';
    }
    $scope.sortOrFiltersCampaign.page_entries = $('#resultValue').text();
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }
  $scope.manualOrder = false;

  $scope.clearReward = function () {
    $(".reward.dropdown").dropdown("clear");
    $scope.selectedReward = null;
    $scope.shipAdd = false;
    $scope.user.amount = null;
  }

  function initializeUserObj() {
    $scope.user = {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      occupation: '',
      employer: '',
      address1: '',
      address2: '',
      city_id: '',
      country_id: '',
      reward: '',
      amount: '',
      cheque_ref: '',
      postal_code: '',
      anonymous: ''
    }
  }

  /*
   **  @params cid - The campaign id (optional)
   **  @params canme - The campaign name (optional)
   **  @params cstatus - The campaign status (optional)
   */
  $scope.addManual = function (cid, cname, cstatus) {
    initializeUserObj();
    clearAddress();
    // Popup modal that contains form for manual transaction
    $scope.clearReward();
    $scope.user.amount = null;
    $scope.manualOrder = true;
    $scope.transaction_message = false;

    if (cid != null) {
      $scope.cid = cid;
      $scope.showManualTransactionFromCamp = true;
    } else {
      $scope.showManualTransactionFromTrans = true;
    }

    if (cstatus != null) {
      $scope.cEntryStatus = cstatus;
    }

    CreateCampaignService.load($scope.cid).then(function (success) {
      $scope.campaignSelected = success;
      // Set campaign Currency
      $scope.ccurrency = success.currencies;
      if (success.pledges != null) {
        $scope.campaignRewards = success.pledges;
        console.log($scope.campaignRewards);
      } else {
        $scope.campaignRewards = null;
      }
    });
  }

  $scope.verifyReward = function (selectedReward) {
    $scope.selectedReward = selectedReward;
    console.log(selectedReward);
    //apply coupon data to reward
    Restangular.one('campaign/'+$scope.cid+'/pledge-level').customGET().then(function (success) {
      var rewarx = success.find(function(r) { return r.pledge_level_id == selectedReward.pledge_level_id; });
      if (rewarx) {
        $scope.selectedReward.coupon = rewarx.coupon;
      } else {
        $scope.selectedReward = null;
      }
      console.log(selectedReward);
    });

    if (selectedReward.shipping) {
      $scope.shipAdd = true;
    } else {
      $scope.shipAdd = false;
    }
  }

  $scope.setAnonymous = function (anonymous) {
    $scope.user.anonymous = anonymous;
  }

  $scope.tipTypeSelection = function (type) {
    $scope.tip = { value: null, type: 'Dollar' };
    if (type == 'tiers') {
      if ($scope.tippingOptions.tiers) {
        $scope.tip = { value: $scope.tippingOptions.tiers[0].value, type: $scope.tippingOptions.tiers[0].type };
      }
    } else if (type == 'dynamic') {
      if ($scope.tippingOptions.toggle_dynamic_min_max && $scope.tippingOptions.dynamic_min) {
        $scope.tip.value = $scope.tippingOptions.dynamic_min;
      }
    }
    $scope.selectedTipType = type;
  };

  $scope.tipTierSelection = function (value, type) {
    $scope.tip = { value: parseInt(value), type: type };
  };

  $scope.transaction_message = false;

  $scope.addTransaction = function () {
    var not_validated = $('form.manual-trans-form').find('.ng-invalid,.has-error');
    if (not_validated.length > 0) {
      $scope.formError = true;
      return;
    }
    $scope.formError = false;
    $scope.transaction_error = false;
    $scope.errorMessae = "";
    var length = 15;
    var charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var retVal = "";
    var n = charset.length;
    for (var i = 0; i < length; i++) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    var userdata = {
      first_name: $scope.user.first_name,
      last_name: $scope.user.last_name,
      email: $scope.user.email,
      password: retVal,
      password_confirm: retVal,
      inline_registration: true, // do not send confirmation email
    };

    var markCouponAsApplied = $scope.selectedReward 
      && $scope.selectedReward.coupon 
      && $scope.selectedReward.coupon.length > 0
      && $('#coupon-code-input').hasClass("checked");

    $scope.pdata = {
      entry_id: $scope.campaignSelected.entry_id,
      pledge_level_id: '',
      amount: $scope.user.amount.toFixed(2),
      person_id: '',
      anonymous_contribution: '',
      anonymous_contribution_partial: '',
      shipping_address_id: '',
      phone_number_id: '',
      use_widgetmakr: '',
      email_notify: $scope.email_notify,
      reference_no: $scope.user.cheque_ref
    };
    if (markCouponAsApplied) $scope.pdata.coupon_code = $scope.selectedReward.coupon[0].code;
    $scope.pdata.email_notify = $(".ui.checkbox.notifyEmail input").prop("checked");

    if ($scope.user.anonymous.type_id == 1) {
      $scope.pdata.anonymous_contribution_partial = 1;
      $scope.pdata.anonymous_contribution = 0;
    } else if ($scope.user.anonymous.type_id == 2) {
      $scope.pdata.anonymous_contribution_partial = 0;
      $scope.pdata.anonymous_contribution = 1;
    } else {
      $scope.pdata.anonymous_contribution_partial = 0;
      $scope.pdata.anonymous_contribution = 0;
    }

    if ($scope.portal_settings.site_campaign_always_anonymous_contribution) {
      $scope.pdata.anonymous_contribution_partial = 0;
      $scope.pdata.anonymous_contribution = 1;
    }

    if ($scope.tippingOptions && $scope.tippingOptions.toggle) {
      if ($scope.tip.value && $scope.tip.value != 0) {
        if ($scope.tip.type == 'Dollar') {
          $scope.pdata.amount_tip = parseFloat($scope.tip.value).toFixed(2);
        } else {
          $scope.pdata.amount_tip = ((parseFloat($scope.tip.value) / 100) * $scope.user.amount).toFixed(2);
        }
      }
    }

    Restangular.one('portal/setting').getList().then(function (success) {
      $scope.public_set = {};
      angular.forEach(success, function (value) {
        if (value.setting_type_id == 3) {
          $scope.public_set[value.name] = value.value;
          if ($scope.public_set.site_payment_gateway == 2) {
            $scope.pdata.use_widgetmakr = 1;
          }
        }
      });
    });

    Restangular.one('account/email').customGET(userdata.email).then(function (success) {
      $scope.personId = success.person_id;
      $scope.pdata.person_id = $scope.personId;
      $scope.TransactionAdd($scope.personId);

    }, function (failed) {

      Restangular.one('register').customPOST(userdata).then(function (success) {
        $scope.registering_user = success;
        $scope.pdata.person_id = success.person_id;
        $scope.TransactionAdd($scope.pdata.person_id);
      });

    });
  }

  $scope.addProfileTransaction = function () {
    var not_validated = $('form.manual-trans-form').find('.ng-invalid,.has-error');
    if (not_validated.length > 0) {
      $scope.formError = true;
      return;
    }
    $scope.formError = false;
    $scope.transaction_error = false;
    $scope.errorMessae = "";
    var length = 15;
    var charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var retVal = "";
    var n = charset.length;
    for (var i = 0; i < length; i++) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    var userdata = {
      first_name: $scope.user.first_name,
      last_name: $scope.user.last_name,
      email: $scope.user.email,
      password: retVal,
      password_confirm: retVal,
      inline_registration: true, // do not send cofirmation email
    };

    // $scope.user.created.toString()
    
    if (typeof $scope.user.created == "string") {
      $scope.user.created = new Date($scope.user.created);
    }
    if ($scope.user.created && typeof $scope.user.created === "object") {
      if ($scope.user.created.toString().length > 19) {
        var month = $scope.user.created.getMonth();
        if (month >= 9) {
          month = $scope.user.created.getMonth() + 1;
        } else {
          month = $scope.user.created.getMonth() + 1;
          month = "0" + month;
        }
        var day = $scope.user.created.getDate();
        if (day > 9) {} else {

          day = "0" + day;
        }
        var hours = $scope.user.created.getHours();
        if (hours > 9) {} else {
          hours = "0" + hours;
        }
        var mins = $scope.user.created.getMinutes();
        if (mins > 9) {} else {
          mins = "0" + mins;
        }
        var datestring = $scope.user.created.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + mins + ":00";
        $scope.user.created = datestring;
      } else {
        $scope.user.created = $scope.user.created.substring(0, 16) + ":00";
      }
    }

    $scope.pdata = {
      entry_id: $scope.campaignSelected.entry_id,
      pledge_level_id: '',
      amount: $scope.user.amount.toFixed(2),
      created:  $scope.user.created,
      person_id: '',
      anonymous_contribution: '',
      anonymous_contribution_partial: '',
      shipping_address_id: '',
      phone_number_id: '',
      use_widgetmakr: '',
      email_notify: $scope.email_notify,
      reference_no: $scope.user.cheque_ref
    };
    $scope.pdata.email_notify = $(".ui.checkbox.notifyEmail input").prop("checked");

    if ($scope.user.anonymous.type_id == 1) {
      $scope.pdata.anonymous_contribution_partial = 1;
      $scope.pdata.anonymous_contribution = 0;
    } else if ($scope.user.anonymous.type_id == 2) {
      $scope.pdata.anonymous_contribution_partial = 0;
      $scope.pdata.anonymous_contribution = 1;
    } else {
      $scope.pdata.anonymous_contribution_partial = 0;
      $scope.pdata.anonymous_contribution = 0;
    }

    if ($scope.portal_settings.site_campaign_always_anonymous_contribution) {
      $scope.pdata.anonymous_contribution_partial = 0;
      $scope.pdata.anonymous_contribution = 1;
    }

    if ($scope.tippingOptions && $scope.tippingOptions.toggle) {
      if ($scope.tip.value && $scope.tip.value != 0) {
        if ($scope.tip.type == 'Dollar') {
          $scope.pdata.amount_tip = parseFloat($scope.tip.value).toFixed(2);
        } else {
          $scope.pdata.amount_tip = ((parseFloat($scope.tip.value) / 100) * $scope.user.amount).toFixed(2);
        }
      }
    }

    Restangular.one('portal/setting').getList().then(function (success) {
      $scope.public_set = {};
      angular.forEach(success, function (value) {
        if (value.setting_type_id == 3) {
          $scope.public_set[value.name] = value.value;
          if ($scope.public_set.site_payment_gateway == 2) {
            $scope.pdata.use_widgetmakr = 1;
          }
        }
      });
    });

    Restangular.one('account/email').customGET(userdata.email).then(function (success) {
      $scope.personId = success.person_id;
      $scope.pdata.person_id = $scope.personId;
      $scope.TransactionProfileAdd($scope.personId);

    }, function (failed) {

      Restangular.one('register').customPOST(userdata).then(function (success) {
        $scope.registering_user = success;
        $scope.pdata.person_id = success.person_id;
        $scope.TransactionProfileAdd($scope.pdata.person_id);
      });

    });
  }

  function manualTransactionPromise(business_organization_id) {
    if ($scope.selectedReward != null) {
      $scope.pdata.pledge_level_id = $scope.selectedReward.pledge_level_id;
    }

    $scope.pdata.business_organization_id = business_organization_id;

    Restangular.one('campaign/' + $scope.campaignSelected.entry_id + '/pledge/manual').customPOST($scope.pdata).then(function(success) {
      msg = {
        'header': 'tab_campaigns_manual_transaction_added',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      $scope.manualOrder = false;
      $scope.user = '';
      hideMsg();

      // Regrab the data and hide the modal
      $scope.showdetail($scope.cid, $scope.cname, $scope.cEntryStatus, $scope.ccurrency, $scope.total_backers, $scope.backer_offset);
      $scope.setEnabled();
      // $('.manual_transaction').modal('hide');
      $scope.showManualTransactionFromCamp = false;
      $scope.showManualTransactionFromTrans = false;

    }, function(failed) {
      $scope.eMessage = failed.data.message;

      if (failed.data.code == 'account_profile_stripe_pledge_direct_off_missing_connected') {
        msg = {
          'header': 'portal_setting_pledge_campaign_missing_connect',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        hideMsg();
      }

    });
  }

  $scope.TransactionProfileAdd = function(personID) {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    // Check phone and address first before actually adding transaction
    var prePromisesArray = [];
    var phoneReqResult, addressReqResult;

    if($scope.selectedAccountType == 'Organization') {

      preBusinessOrgReq = Restangular.one("account/business").customPOST({
        "business_organization_id": '',
        "person_id": personID,
        "name": $scope.organizationFields.name,
        "description": $scope.organizationFields.description
      });

      preBusinessOrgReq.then(function(success) {
        var business_organization_id = success.business_organization_id;
        
        if($scope.user.phone && $scope.user.phone.length) {
          phoneReq = Restangular.one('account/phone-number').customPOST({
            "number": $scope.user.phone,
            "phone_number_type_id": 2,
            "business_organization_id": business_organization_id
          });

          prePromisesArray.push(phoneReq);
        }

        if($scope.user.city_id && $scope.user.address1 && $scope.user.address1.length) {
          addressReq = Restangular.one("account/address").customPOST({
            city_id: $scope.user.city_id,
            street1: $scope.user.address1,
            street2: $scope.user.address2,
            mail_code: $scope.user.postal_code,
            person_id: $scope.pdata.person_id,
            business_organization_id: business_organization_id
          });

          prePromisesArray.push(addressReq);
        }
        
        if(prePromisesArray && prePromisesArray.length) {
          $q.all(prePromisesArray).then(function(success) {
            
            angular.forEach(success, function(value) {
              if(value && value.hasOwnProperty('address_id')) {
                $scope.pdata.shipping_address_id = value.address_id;
              }
              if(value && value.hasOwnProperty('phone_number_id')) {
                $scope.pdata.phone_number_id = value.phone_number_id;
              }
            });
  
            manualTransactionPromise(business_organization_id);
  
          });        
        } else {
          manualTransactionPromise(business_organization_id);
        }
      });    
      
      return;
    } 

    var prePhoneReq = Restangular.one("account").customGET("phone-number", {
      "person_id": personID
    });

    prePhoneReq.then(function(success) {
      phoneReqResult = success;
    });

    var preAddressReq = Restangular.one("account").customGET("address", {
      "person_id": personID
    });

    preAddressReq.then(function(success) {
      addressReqResult = success;
    });


    prePromisesArray = [prePhoneReq, preAddressReq];

    $q.all(prePromisesArray).then(function(success) {
      var promisesArray = [];

      $scope.phoneInfo = {
        number: $scope.user.phone,
        person_id: $scope.pdata.person_id
      }

      if ($scope.user.phone) {
        var phoneReq;
        if (phoneReqResult.personal == null) {
          phoneReq = Restangular.one('account/phone-number').customPOST({
            "number": $scope.user.phone,
            "phone_number_type_id": 2
          });
        } else if (phoneReqResult.personal[0]) {
          phoneReq = Restangular.one('account/phone-number', phoneReqResult.personal[0].id).customPUT({
            "person_id": personID,
            "number": $scope.user.phone
          });
        }
        phoneReq.then(function(success) {
          $scope.pdata.phone_number_id = success.phone_number_id;
        }, function(failed) {
          $scope.pdata.phone_number_id = "";
        });

        promisesArray.push(phoneReq);
      }

      if ($scope.selectedReward != null) {
        $scope.pdata.pledge_level_id = $scope.selectedReward.pledge_level_id;
      }

      if ($scope.user.address1) {
        var shipdetails = {
          city_id: $scope.user.city_id,
          street1: $scope.user.address1,
          street2: $scope.user.address2,
          mail_code: $scope.user.postal_code,
          person_id: $scope.pdata.person_id
        }
        var addressReq;

        if (addressReqResult.personal && addressReqResult.personal.length) {
          shipdetails.shipping_address_id = addressReqResult.personal[0].id;
          addressReq = Restangular.one("account/address", addressReqResult.personal[0].id).customPUT(shipdetails);
        } else {
          addressReq = Restangular.one("account/address").customPOST(shipdetails);
        }

        addressReq.then(function(success) {
          $scope.pdata.shipping_address_id = success.address_id;
        }, function(failed) {
          $scope.pdata.shipping_address_id = '';
        });

        promisesArray.push(addressReq);
      } else {
        $scope.transaction_error = true;
        $scope.eMessage = "tab_campaigns_shipping_address_required";
      }

      $q.all(promisesArray).then(function(success) {
        Restangular.one('campaign/' + $scope.campaignSelected.entry_id + '/pledge/manual').customPOST($scope.pdata).then(function(success) {
          msg = {
            'header': 'tab_campaigns_manual_transaction_added',
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          $scope.manualOrder = false;
          $scope.user = '';
          hideMsg();

          // Regrab the data and hide the modal
          $scope.showdetail($scope.cid, $scope.cname, $scope.cEntryStatus, $scope.ccurrency, $scope.total_backers, $scope.backer_offset);
          $scope.setEnabled();
          // $('.manual_transaction').modal('hide');
          $scope.showManualTransactionFromCamp = false;
          $scope.showManualTransactionFromTrans = false;

        }, function(failed) {
          $scope.eMessage = failed.data.message;

          if (failed.data.code == 'account_profile_stripe_pledge_direct_off_missing_connected') {
            msg = {
              'header': 'portal_setting_pledge_campaign_missing_connect',
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
            hideMsg();
          }

        });
      });
    });
  }

  $scope.TransactionAdd = function(personID) {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    // Check phone and address first before actually adding transaction
    var prePromisesArray = [];
    var phoneReqResult, addressReqResult;

    var prePhoneReq = Restangular.one("account").customGET("phone-number", {
      "person_id": personID
    });

    prePhoneReq.then(function(success) {
      phoneReqResult = success;
    });

    var preAddressReq = Restangular.one("account").customGET("address", {
      "person_id": personID
    });

    preAddressReq.then(function(success) {
      addressReqResult = success;
    });

    prePromisesArray = [prePhoneReq, preAddressReq];

    if($scope.selectedAccountType == 'Organization') {
      preBusinessOrgReq = Restangular.one("account/business").customPOST({
        "business_organization_id": '',
        "person_id": personID,
        "name": $scope.organizationFields.name,
        "description": $scope.organizationFields.description
      });
    }


    $q.all(prePromisesArray).then(function(success) {
      var promisesArray = [];

      $scope.phoneInfo = {
        number: $scope.user.phone,
        person_id: $scope.pdata.person_id
      }

      if ($scope.user.phone) {
        var phoneReq;
        if (phoneReqResult.personal == null) {
          phoneReq = Restangular.one('account/phone-number').customPOST({
            "number": $scope.user.phone,
            "phone_number_type_id": 2
          });
        } else if (phoneReqResult.personal[0]) {
          phoneReq = Restangular.one('account/phone-number', phoneReqResult.personal[0].id).customPUT({
            "person_id": personID,
            "number": $scope.user.phone
          });
        }
        phoneReq.then(function(success) {
          $scope.pdata.phone_number_id = success.phone_number_id;
        }, function(failed) {
          $scope.pdata.phone_number_id = "";
        });

        promisesArray.push(phoneReq);
      }

      if ($scope.selectedReward != null) {
        $scope.pdata.pledge_level_id = $scope.selectedReward.pledge_level_id;
      }

      if ($scope.user.address1) {
        var shipdetails = {
          city_id: $scope.user.city_id,
          street1: $scope.user.address1,
          street2: $scope.user.address2,
          mail_code: $scope.user.postal_code,
          person_id: $scope.pdata.person_id
        }
        var addressReq;

        if (addressReqResult.personal && addressReqResult.personal.length) {
          shipdetails.shipping_address_id = addressReqResult.personal[0].id;
          addressReq = Restangular.one("account/address", addressReqResult.personal[0].id).customPUT(shipdetails);
        } else {
          addressReq = Restangular.one("account/address").customPOST(shipdetails);
        }

        addressReq.then(function(success) {
          $scope.pdata.shipping_address_id = success.address_id;
        }, function(failed) {
          $scope.pdata.shipping_address_id = '';
        });

        promisesArray.push(addressReq);
      } else {
        $scope.transaction_error = true;
        $scope.eMessage = "tab_campaigns_shipping_address_required";
      }

      $q.all(promisesArray).then(function(success) {
        Restangular.one('campaign/' + $scope.campaignSelected.entry_id + '/pledge/manual').customPOST($scope.pdata).then(function(success) {
          msg = {
            'header': 'tab_campaigns_manual_transaction_added',
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          $scope.manualOrder = false;
          $scope.user = '';
          hideMsg();

          // Regrab the data and hide the modal
          $scope.showdetail($scope.cid, $scope.cname, $scope.cEntryStatus, $scope.ccurrency, $scope.total_backers, $scope.backer_offset);
          $scope.setEnabled();
          // $('.manual_transaction').modal('hide');
          $scope.showManualTransactionFromCamp = false;
          $scope.showManualTransactionFromTrans = false;

        }, function(failed) {
          $scope.eMessage = failed.data.message;

          if (failed.data.code == 'account_profile_stripe_pledge_direct_off_missing_connected') {
            msg = {
              'header': 'portal_setting_pledge_campaign_missing_connect',
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
            hideMsg();
          }

        });
      });
    });
  }

  $scope.changeOrderId = function () {
    $('.order-by-priority').checkbox('uncheck');
    $scope.idshow = true;
    $scope.startshow = false;
    $scope.endshow = false;
    $scope.nameshow = false;
    if ($scope.ordertypeid == '-entry_id') {
      $scope.ordertypeid = "entry_id";
      $scope.orderbtnid = false;
      $scope.sortOrFiltersCampaign.sort = 'entry_id,display_priority,created,ends';
    } else {
      $scope.orderbtnid = true;
      $scope.ordertypeid = "-entry_id";
      $scope.sortOrFiltersCampaign.sort = '-entry_id,-display_priority,-created,-ends';
    }
    $scope.sortOrFiltersCampaign.page_entries = $('#resultValue').text();
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }

  $scope.changeOrderEnd = function () {
    $('.order-by-priority').checkbox('uncheck');
    $scope.idshow = false;
    $scope.startshow = false;
    $scope.endshow = true;
    $scope.nameshow = false;
    if ($scope.ordertypeend == '-ends') {
      $scope.ordertypeend = "ends";
      $scope.orderbtnend = false;
      $scope.sortOrFiltersCampaign.sort = 'ends,display_priority,created,entry_id';
    } else {
      $scope.orderbtnend = true;
      $scope.ordertypeend = "-ends";
      $scope.sortOrFiltersCampaign.sort = '-ends,-display_priority,-created,-entry_id';
    }
    $scope.sortOrFiltersCampaign.page_entries = $('#resultValue').text();
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }

  updateCampaignListing($scope.sortOrFiltersCampaign);
  $scope.updateCampaignListing = function () {
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }

  $scope.updateSortCampaign = function (sort) {
    $scope.sortOrFiltersCampaign.sort = sort ? sort : "";
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }

  $scope.updateFiltersCampaignCategory = function (category) {
    $scope.sortOrFiltersCampaign.filters.category = category.id;
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }

  $scope.updateFiltersCampaignStatus = function (status) {
    if (status) {
      $scope.sortOrFiltersCampaign.filters.entry_status_id = status.id;
    } else {
      $scope.sortOrFiltersCampaign.filters.entry_status_id = "";
    }
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }

  $scope.updateFiltersCampaignType = function (type) {
    if (type == 1) {
      $scope.sortOrFiltersCampaign.filters.hidden = true;
    } else {
      $scope.sortOrFiltersCampaign.filters.hidden = false;
    }
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }

  function updateCampaignListing(sortOrFilters) {
    RestFullResponse.all('campaign').getList(sortOrFilters).then(function (success) {
      $scope.campaigns = success.data;
      $scope.campaigndata = [];
      // Uncheck all select all checkboxes.
      $(".campaign-select-all input").each(function () {
        $(this).prop('checked', false);;
      });

      // Grab featured campaigns
      $scope.getFeaturedCampaigns();

      var headers = success.headers();
      $scope.sortOrFiltersCampaign.pagination.currentpage = headers['x-pager-current-page'];
      $scope.sortOrFiltersCampaign.pagination.numpages = headers['x-pager-last-page'];
      $scope.sortOrFiltersCampaign.pagination.nextpage = headers['x-pager-next-page'];
      $scope.sortOrFiltersCampaign.pagination.pagesinset = headers['x-pager-pages-in-set'];
      $scope.sortOrFiltersCampaign.pagination.totalentries = headers['x-pager-total-entries'];
      $scope.sortOrFiltersCampaign.pagination.entriesperpage = headers['x-pager-entries-per-page'];

      // fill data for csv
      var value = $translate.instant(['tab_campaign_start', 'tab_campaign_bank', 'tab_campaign_featureYes', 'tab_campaign_featureNo', 'ApprovedRunning', 'NotApproved', 'Paused', 'BeingEdited', 'ProcessingPreAuth', 'AceptedForCapture', 'DeclineForCapture', 'ProcessingCapture', 'CaptureComplete', 'SentForReview', 'Cancelled', 'BeingReviewed', 'NotFunded', 'tab_campaign_campaign_feature', 'tab_campaign_campaign_id', 'tab_campaign_campaign_name', 'tab_campaign_campaign_creator', 'tab_campaign_campaign_end', 'tab_campaign_campaign_status']);
      $scope.cfeature = value.tab_campaign_campaign_feature;
      $scope.cid_column = value.tab_campaign_campaign_id;
      $scope.cname = value.tab_campaign_campaign_name;
      $scope.ccreator = value.tab_campaign_campaign_creator;
      $scope.cend = value.tab_campaign_campaign_end;
      $scope.cstatus = value.tab_campaign_campaign_status;
      $scope.startdate = value.tab_campaign_start;
      $scope.csvHeaders = {
        'Feature': $scope.cfeature,
        'Id': $scope.cid_column,
        'Name': $scope.cname,
        'Creator': $scope.ccreator,
        'Start': $scope.startdate,
        'End': $scope.cend,
        'Status': $scope.cstatus
      };
      if ($scope.portal_settings.site_campaign_country_funding_step) {
        $scope.csvHeaders["Bank"] = value.tab_campaign_bank;
      }
      $scope.campaigndata.push($scope.csvHeaders);
      angular.forEach($scope.campaigns, function (values) {
        CampaignSettingsService.setCampaignId(values.entry_id);
        CampaignSettingsService.processSettings(values.settings);
        values.settings = CampaignSettingsService.getSettings();
        var data2 = {};
        if (!values.featured) {
          $scope.featurestat = value.tab_campaign_featureNo;
        } else {
          $scope.featurestat = value.tab_campaign_featureYes;
        }
        switch (values.entry_status_id) {
          case 1:
            $scope.entrystat = value.BeingEdited;
            break;
          case 2:
            $scope.entrystat = value.ApprovedRunning;
            break;
          case 3:
            $scope.entrystat = value.NotApproved;
            break;
          case 4:
            $scope.entrystat = value.Paused;
            break;
          case 5:
            $scope.entrystat = value.ProcessingPreAuth;
            break;
          case 6:
            $scope.entrystat = value.AceptedForCapture;
            break;
          case 7:
            $scope.entrystat = value.DeclineForCapture;
            break;
          case 8:
            $scope.entrystat = value.ProcessingCapture;
            break;
          case 9:
            $scope.entrystat = value.CaptureComplete;
            break;
          case 10:
            $scope.entrystat = value.SentForReview;
            break;
          case 11:
            $scope.entrystat = value.Cancelled;
            break;
          case 12:
            $scope.entrystat = value.BeingReviewed;
            break;
          case 13:
            $scope.entrystat = value.NotFunded;
            break;
        }
        $scope.creator = values.managers[0].first_name + " " + values.managers[0].last_name;
        if (values.starts) {
          $scope.startdate = values.starts.slice(0, 10);
        } else {
          $scope.startdate = "";
        }
        if (values.ends) {
          $scope.enddate = values.ends.slice(0, 10);
        } else {
          $scope.enddate = "";
        }
        data2 = {
          'Feature': $scope.featurestat,
          'Id': values.id,
          'Name': values.name,
          'Creator': $scope.creator,
          'Start': $scope.startdate,
          'End': $scope.enddate,
          'Status': $scope.entrystat
        };
        if ($scope.portal_settings.site_campaign_country_funding_step) {
          data2["bank"] = JSON.stringify(values.settings.bank);
        }
        $scope.campaigndata.push(data2);
      });
    });
  }

  $scope.createCampaignCSV = createCampaignCSV;

  // Create campaign csv based on the given campaign data and it will output the csv based on campaignDataCSV parameter
  function createCampaignCSV() {
    var campaignRequestArray = [];
    var totalNumCampaigns = $scope.sortOrFiltersCampaign.pagination.totalentries;
    var requiredNumCalls = 0;
    $scope.allCampaignsArray = [];
    var reqArg = {
      "page": 1
    }

    requiredNumCalls = parseInt(parseInt(totalNumCampaigns) / 100);
    if (totalNumCampaigns % 100 != 0) {
      requiredNumCalls += 1;
    }
    for (var curNumCall = 0; curNumCall < requiredNumCalls; curNumCall++) {
      var request = RestFullResponse.all('campaign').getList(reqArg);
      campaignRequestArray.push(request);
      reqArg.page += 1;
    }

    return $q.all(campaignRequestArray).then(function (success) {
      $scope.allCampaignscsv = [];
      $scope.allCampaignsCompletecsv = [];
      success.forEach(function (resArr) {
        $scope.allCampaignsArray = $scope.allCampaignsArray.concat(resArr.data);
      });

      // fill data for csv
      var value = $translate.instant(['tab_campaign_start', 'tab_campaign_bank', ' tab_campaign_featureYes', 'tab_campaign_featureNo', 'ApprovedRunning', 'NotApproved', 'Paused', 'BeingEdited', 'ProcessingPreAuth', 'AceptedForCapture', 'DeclineForCapture', 'ProcessingCapture', 'CaptureComplete', 'SentForReview', 'Cancelled', 'BeingReviewed', 'NotFunded', 'tab_campaign_campaign_feature', 'tab_campaign_campaign_id', 'tab_campaign_campaign_name', 'tab_campaign_campaign_creator', 'tab_campaign_campaign_end', 'tab_campaign_campaign_status']);
      $scope.cfeature = value.tab_campaign_campaign_feature;
      $scope.cid_column = value.tab_campaign_campaign_id;
      $scope.cname = value.tab_campaign_campaign_name;
      $scope.ccreator = value.tab_campaign_campaign_creator;
      $scope.cend = value.tab_campaign_campaign_end;
      $scope.cstatus = value.tab_campaign_campaign_status;
      $scope.startdate = value.tab_campaign_start;
      $scope.csvHeaders = {
        'Feature': $scope.cfeature,
        'Id': $scope.cid_column,
        'Name': $scope.cname,
        'Creator': $scope.ccreator,
        'Start': $scope.startdate,
        'End': $scope.cend,
        'Status': $scope.cstatus
      };
      if ($scope.portal_settings.site_campaign_country_funding_step) {
        $scope.csvHeaders["bank"] = value.tab_campaign_bank;
      }
      $scope.allCampaignscsv.push($scope.csvHeaders);
      angular.forEach($scope.allCampaignsArray, function (values) {
        CampaignSettingsService.processSettings(values.settings);
        values.settings = CampaignSettingsService.getSettings();
        var data2 = {};
        if (!values.featured) {
          $scope.featurestat = value.tab_campaign_featureNo;
        } else {
          $scope.featurestat = value.tab_campaign_featureYes;
        }
        switch (values.entry_status_id) {
          case 1:
            $scope.entrystat = value.BeingEdited;
            break;
          case 2:
            $scope.entrystat = value.ApprovedRunning;
            break;
          case 3:
            $scope.entrystat = value.NotApproved;
            break;
          case 4:
            $scope.entrystat = value.Paused;
            break;
          case 5:
            $scope.entrystat = value.ProcessingPreAuth;
            break;
          case 6:
            $scope.entrystat = value.AceptedForCapture;
            break;
          case 7:
            $scope.entrystat = value.DeclineForCapture;
            break;
          case 8:
            $scope.entrystat = value.ProcessingCapture;
            break;
          case 9:
            $scope.entrystat = value.CaptureComplete;
            break;
          case 10:
            $scope.entrystat = value.SentForReview;
            break;
          case 11:
            $scope.entrystat = value.Cancelled;
            break;
          case 12:
            $scope.entrystat = value.BeingReviewed;
            break;
          case 13:
            $scope.entrystat = value.NotFunded;
            break;
        }
        $scope.creator = values.managers[0].first_name + " " + values.managers[0].last_name;
        if (values.starts) {
          $scope.startdate = values.starts.slice(0, 10);
        } else {
          $scope.startdate = "";
        }
        if (values.ends) {
          $scope.enddate = values.ends.slice(0, 10);
        } else {
          $scope.enddate = "";
        }
        data2 = {
          'Feature': $scope.featurestat,
          'Id': values.id,
          'Name': values.name,
          'Creator': $scope.creator,
          'Start': $scope.startdate,
          'End': $scope.enddate,
          'Status': $scope.entrystat
        };
        if ($scope.portal_settings.site_campaign_country_funding_step) {
          data2["bank"] = JSON.stringify(values.settings.bank);
        }
        $scope.allCampaignscsv.push(data2);
      });
      return $scope.allCampaignscsv;
    });
  }

  // Set a status that indicates if all campaigns data are ready for CSV download
  function setAllCampCSVReady(readyStatus) {
    $scope.isAllCamCSVReady = readyStatus;
  }

  $scope.createCampaignCompleteCSV = createCampaignCompleteCSV;

  // Create COMPLETE campaign csv based on the given campaign data and it will output the csv based on campaignDataCSV parameter
  function createCampaignCompleteCSV() {
    var campaignRequestArray = [];
    var totalNumCampaigns = $scope.sortOrFiltersCampaign.pagination.totalentries;
    var requiredNumCalls = 0;
    $scope.allCampaignsArray = [];
    var reqArg = {
      "page": 1
    }

    requiredNumCalls = parseInt(parseInt(totalNumCampaigns) / 100);
    if (totalNumCampaigns % 100 != 0) {
      requiredNumCalls += 1;
    }
    for (var curNumCall = 0; curNumCall < requiredNumCalls; curNumCall++) {
      var request = RestFullResponse.all('campaign').getList(reqArg);
      campaignRequestArray.push(request);
      reqArg.page += 1;
    }

    return $q.all(campaignRequestArray).then(function (success) {
      $scope.allCampaignscsv = [];
      $scope.allCampaignsCompletecsv = [];
      success.forEach(function (resArr) {
        $scope.allCampaignsArray = $scope.allCampaignsArray.concat(resArr.data);
      });

      // fill data for csv
      var value = $translate.instant(['tab_campaign_start', 'tab_campaign_bank', 'tab_campaign_featureYes', 'tab_campaign_featureNo', 'ApprovedRunning', 'NotApproved', 'Paused', 'BeingEdited', 'ProcessingPreAuth', 'AceptedForCapture', 'DeclineForCapture', 'ProcessingCapture', 'CaptureComplete', 'SentForReview', 'Cancelled', 'BeingReviewed', 'NotFunded', 'tab_campaign_campaign_feature', 'tab_campaign_campaign_id', 'tab_campaign_campaign_name', 'tab_campaign_campaign_creator', 'tab_campaign_campaign_end', 'tab_campaign_campaign_status', 'tab_campaign_campaign_currency', 'tab_campaign_campaign_category', 'tab_campaign_campaign_business', 'tab_campaign_campaign_file', 'tab_campaign_campaign_recurring', 'tab_campaign_campaign_blurb', 'tab_campaign_campaign_runtimedays', 'tab_campaign_campaign_totalbackers', 'tab_campaign_campaign_fundedamount', 'tab_campaign_campaign_fundedgoal', 'tab_campaign_campaign_fundedpercentage']);

      $scope.cfeature = value.tab_campaign_campaign_feature;
      $scope.cid_column = value.tab_campaign_campaign_id;
      $scope.cname = value.tab_campaign_campaign_name;
      $scope.ccreator = value.tab_campaign_campaign_creator;
      $scope.cend = value.tab_campaign_campaign_end;
      $scope.cstatus = value.tab_campaign_campaign_status;
      $scope.startdate = value.tab_campaign_start;
      $scope.csvHeaders = {
        'Feature': $scope.cfeature,
        'Id': $scope.cid_column,
        'Name': $scope.cname,
        'Creator': $scope.ccreator,
        'Blurb': value.tab_campaign_campaign_blurb,
        'Business Organization': value.tab_campaign_campaign_business,
        'Category': value.tab_campaign_campaign_category,
        'Location': "Location",
        'Currency': value.tab_campaign_campaign_currency,
        'File': value.tab_campaign_campaign_file,
        'Start': $scope.startdate,
        'End': $scope.cend,
        'Runtime Days': value.tab_campaign_campaign_runtimedays,
        'Total Backers': value.tab_campaign_campaign_totalbackers,
        "Funded Amount": value.tab_campaign_campaign_fundedamount,
        "Funded Goal": value.tab_campaign_campaign_fundedgoal,
        "Funded Percentage": value.tab_campaign_campaign_fundedpercentage,
        'Status': $scope.cstatus
      };
      if ($scope.portal_settings.site_campaign_country_funding_step) {
        $scope.csvHeaders["bank"] = value.tab_campaign_bank;
      }
      $scope.allCampaignsCompletecsv.push($scope.csvHeaders);
      angular.forEach($scope.allCampaignsArray, function (values) {
        CampaignSettingsService.setCampaignId(values.entry_id);
        CampaignSettingsService.processSettings(values.settings);
        values.settings = CampaignSettingsService.getSettings();
        var business_organizations = "";
        var url_paths = "";
        var categories = "";
        var currencies = "";
        var path_external = "";
        var campaign_locations = "";

        if (values.business_organizations) {
          business_organizations = values.business_organizations[0].name;
        }
        if (values.url_paths) {
          url_paths = values.url_paths[0].path;
        }
        if (values.categories) {
          categories = values.categories[0].name;
        }
        if (values.currencies) {
          currencies = values.currencies[0].name;
        }
        if (values.files) {
          path_external = values.files[0].path_external;
        }
        if (values.cities) {
          angular.forEach(values.cities, function (city) {
            campaign_locations = campaign_locations + city.city_full + "; ";
          })
        }
        var data2 = {};
        if (!values.featured) {
          $scope.featurestat = value.tab_campaign_featureNo;
        } else {
          $scope.featurestat = value.tab_campaign_featureYes;
        }
        switch (values.entry_status_id) {
          case 1:
            $scope.entrystat = value.BeingEdited;
            break;
          case 2:
            $scope.entrystat = value.ApprovedRunning;
            break;
          case 3:
            $scope.entrystat = value.NotApproved;
            break;
          case 4:
            $scope.entrystat = value.Paused;
            break;
          case 5:
            $scope.entrystat = value.ProcessingPreAuth;
            break;
          case 6:
            $scope.entrystat = value.AceptedForCapture;
            break;
          case 7:
            $scope.entrystat = value.DeclineForCapture;
            break;
          case 8:
            $scope.entrystat = value.ProcessingCapture;
            break;
          case 9:
            $scope.entrystat = value.CaptureComplete;
            break;
          case 10:
            $scope.entrystat = value.SentForReview;
            break;
          case 11:
            $scope.entrystat = value.Cancelled;
            break;
          case 12:
            $scope.entrystat = value.BeingReviewed;
            break;
          case 13:
            $scope.entrystat = value.NotFunded;
            break;
        }
        $scope.creator = values.managers[0].first_name + " " + values.managers[0].last_name;
        if (values.starts) {
          $scope.startdate = values.starts.slice(0, 10);
        } else {
          $scope.startdate = "";
        }
        if (values.ends) {
          $scope.enddate = values.ends.slice(0, 10);
        } else {
          $scope.enddate = "";
        }
        data2 = {
          'Feature': $scope.featurestat,
          'Id': values.id,
          'Name': values.name,
          'Creator': $scope.creator,
          'Blurb': values.blurb,
          'Business Organization': business_organizations,
          'Category': categories,
          'Location': campaign_locations,
          'Currency': currencies,
          'File': path_external,
          'Start': $scope.startdate,
          'End': $scope.enddate,
          'Runtime Days': values.runtime_days,
          'Total Backers': values.total_backers,
          "Funded Amount": values.funded_amount,
          "Funded Goal": values.funding_goal,
          "Funded Percentage": values.funded_percentage,
          'Status': $scope.entrystat
        };
        if ($scope.portal_settings.site_campaign_country_funding_step) {
          data2["bank"] = JSON.stringify(values.settings.bank);
        }
        $scope.allCampaignsCompletecsv.push(data2);
      });

      return $scope.allCampaignsCompletecsv;
    });
  }

  // Set a status that indicates if all campaigns data are ready for CSV download
  function setAllCampCSVCompleteReady(readyStatus) {
    $scope.isAllCamCSVCompleteReady = readyStatus;
  }


  $scope.data = [];
  /*
    @params index - campaign entry_id (required)
    @params cname - campaign name (required)
    @params cstatus - campaign entry_status (optional)
    */
  $scope.showdetail = function (index, cname, cstatus, ccurrency, total_backers, backer_offset) {

    $scope.cindex = index;
    $scope.cname = cname;
    $scope.cstatus = cstatus;
    $scope.ccurrency = ccurrency;
    detailTransactionData.cindex = index;
    detailTransactionData.cname = cname;
    detailTransactionData.cstatus = cstatus;
    $scope.data = [];
    $scope.isTransaction = true;
    $scope.transactiondata = [];
    $scope.details = true;
    $scope.campaign_name = cname;
    $scope.cid = index;
    $scope.currency = ccurrency;
    $scope.total_backers = total_backers;
    $scope.backer_offset = backer_offset;

    //Reset transaction pagination
    $scope.transaction_pagination = {
      "sort": '-created',
      "page_entries": 100,
      "page_limit": 100,
      "page": 1,
      "pagination": {},
      "summary": 0
    };

    if (cstatus == "Approved / Running") {
      $scope.approvedCamp = "true";
    }
    Restangular.one('portal/setting').getList().then(
      function (success) {
        $scope.public_settings = {};
        angular.forEach(success, function (value) {
          if (value.setting_type_id == 3) {
            $scope.public_settings[value.name] = value.value;
            $scope.payment_gateway = $scope.public_settings.site_payment_gateway;
          }
        });
        if ($scope.payment_gateway == 1) {
          Restangular.one('campaign/' + index + '/stats').customGET(null, {
            summary: 1
          }).then(function (success) {
            $scope.transaction_summary = success;
            //renderSummaryChart();
          });

          //Get Transactions for each campaign, based on index
          $scope.getTransactions(index);
        } else if ($scope.payment_gateway == 3) {
          Restangular.one('campaign/' + index + '/stats').customGET(null, {
            summary: 1,
            use_paypal: 1
          }).then(function (success) {
            $scope.transaction_summary = success;
            $scope.getTransactions(index);
            //renderSummaryChart();
          });
        } else {
          Restangular.one('campaign/' + index + '/stats').customGET(null, {
            summary: 1,
            use_widgetmakr: 1
          }).then(function (success) {
            $scope.transaction_summary = success;
            $scope.getTransactions(index);
            //renderSummaryChart();
          });
        }

      },
      function (failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
  };

  $scope.setSelectedCampaign = function (selectedC) {
    $scope.selectedCampaign = selectedC;
  }

  $scope.transaction_pagination = {
    "sort": '-created',
    "page_entries": 100,
    "page_limit": 100,
    "page": 1,
    "pagination": {},
    "summary": 0
  };


  $scope.getTransactions = function (index) {
    if ($scope.payment_gateway == 3) {
      $scope.transaction_pagination.use_paypal = 1;
    }

    RestFullResponse.all('campaign/' + index + '/stats').getList($scope.transaction_pagination).then(function (success) {
      $scope.transaction_detail = success.data;
      $scope.na = "";
      var headers = success.headers();
      if (!headers['x-pager-total-entries']) {
        $scope.transaction_length = "0";
      } else {
        $scope.transaction_length = headers['x-pager-total-entries'];
      }
      $scope.transaction_pagination.currentpage = headers['x-pager-current-page'];
      $scope.transaction_pagination.numpages = headers['x-pager-last-page'];
      $scope.transaction_pagination.nextpage = headers['x-pager-next-page'];
      $scope.transaction_pagination.pagesinset = headers['x-pager-pages-in-set'];
      $scope.transaction_pagination.totalentries = headers['x-pager-total-entries'];
      $scope.transaction_pagination.entriesperpage = headers['x-pager-entries-per-page'];
    });
  }

  // Create transaction csv based on all transaction data 
  $scope.createTransactionCSV = function (campaign_id) {
    console.log('this is the one');
    var transactionRequestArray = [];
    var totalNumTransaction = $scope.transaction_pagination.totalentries;
    var requiredNumCalls = 0;
    $scope.allTransactionArray = [];
    var reqArg = {
      "page": 1
    }
    requiredNumCalls = parseInt(parseInt(totalNumTransaction) / 100);
    if (totalNumTransaction % 100 != 0) {
      requiredNumCalls += 1;
    }
    // Transaction pagination CSV, needs to be different from original transaction_pagination to avoid conflict
    $scope.transaction_pagination_csv = {
      "sort": '-created',
      "page_entries": 100,
      "page_limit": 150,
      "page": 1,
      "pagination": {},
      "summary": 0
    };

    if ($scope.payment_gateway == 3) {
      $scope.transaction_pagination_csv.use_paypal = 1;
    }

    for (var curNumCall = 0; curNumCall < requiredNumCalls; curNumCall++) {
      var request = RestFullResponse.all('campaign/' + campaign_id + '/stats').getList($scope.transaction_pagination_csv);
      transactionRequestArray.push(request);
      $scope.transaction_pagination_csv.page += 1;
    }
    return $q.all(transactionRequestArray).then(function (success) {
      $scope.allTransactioncsv = [];
      success.forEach(function (resArr) {
        $scope.allTransactionArray = $scope.allTransactionArray.concat(resArr.data);
      });
      var nativeLookup = $scope.public_settings.site_theme_shipping_native_lookup;
      var value = $translate.instant(['transaction_details_street_address', 'transaction_details_postal_code','transaction_details_city', 'transaction_details_country', 'transaction_details_withdrawn', 'transaction_details_campaign', 'transaction_details_card_number', 'transaction_details_Manual_Transaction', 'transaction_details_na', 'transaction_details_transaction_id', 'transaction_details_contributors_first', 'transaction_details_contributors_last', 'transaction_details_reward', 'transaction_details_amount', 'transaction_details_status', 'transaction_details_date', 'transaction_details_contributors_email', 'transaction_details_shipping_address', 'transaction_details_phone_number', 'transaction_details_reward_attribute', "transaction_details_charity_UK_taxpayer", "transaction_details_charity_giftaid", "transaction_details_charity_fullname", "transaction_details_charity_fulladdress", "transaction_details_charity_postcode", "transaction_details_charity_amount", "transaction_details_organization_name", "transaction_details_organization_email", "transaction_details_organization_phone", "transaction_details_organization_address", "tab_campaign_transaction_details_tip_amount", 'transaction_details_coupon_code', 'transaction_details_coupon_amount', 'transaction_details_coupon_type', 'transaction_details_coupon_name']);
      $scope.cardnum = value.transaction_details_card_number;
      $scope.noreward = value.transaction_details_na;
      $scope.tid = value.transaction_details_transaction_id;
      $scope.tcampaign = value.transaction_details_campaign;
      $scope.treward = value.transaction_details_reward;
      $scope.tamount = value.transaction_details_amount;
      $scope.tstatus = value.transaction_details_status;
      $scope.tnamef = value.transaction_details_contributors_first;
      $scope.tnamel = value.transaction_details_contributors_last;
      $scope.temail = value.transaction_details_contributors_email;
      $scope.tdate = value.transaction_details_date;
      $scope.taddress = value.transaction_details_street_address;
      $scope.tcountry = value.transaction_details_country;
      $scope.tcity = value.transaction_details_city;
      $scope.tpostal = value.transaction_details_postal_code;
      $scope.tphone = value.transaction_details_phone_number;
      $scope.twithdraw = value.transaction_details_withdrawn;
      $scope.manual = value.transaction_details_Manual_Transaction;
      $scope.attributes = value.transaction_details_reward_attribute;
      $scope.tbusiness_organization = value.transaction_details_organization_name;
      $scope.tbusiness_organization_email = value.transaction_details_organization_email;
      $scope.tbusiness_organization_phone = value.transaction_details_organization_phone;
      $scope.tbusiness_organization_address = value.transaction_details_organization_address;
      $scope.csvHeaders = {
        'ID': $scope.tid,
        'Campaign': $scope.tcampaign,
        'Reward': $scope.treward,
        'Amount': $scope.tamount,
        'Coupon Code': value.transaction_details_coupon_code,
        'Coupon Name': value.transaction_details_coupon_name,
        'Coupon Amount': value.transaction_details_coupon_amount,
        'Coupon Type': value.transaction_details_coupon_type,
        'Status': $scope.tstatus,
        'First Name': $scope.tnamef,
        'Last Name': $scope.tnamel,
        'Email': $scope.temail,
        'Card': $scope.cardnum,
        'Date': $scope.tdate,
        'Address': $scope.taddress,
        'City': $scope.tcity,
        'Country': $scope.tcountry,
        'Postal Code': $scope.tpostal,
        'Phone': $scope.tphone,
        'Attributes': $scope.attributes,
        'Organization Name': $scope.tbusiness_organization,
        'Organization Email': $scope.tbusiness_organization_email,
        'Organization Phone': $scope.tbusiness_organization_phone,
        'Organization Address': $scope.tbusiness_organization_address,
      };

      if ($scope.tippingOptions.toggle) {
        $scope.csvHeaders.Tip = value.tab_campaign_transaction_details_tip_amount;
      }
      // if charity is enabled site_campaign_charity_helper_enable
      if ($scope.public_settings.site_campaign_charity_helper_enable) {
        $scope.csvHeaders["UK Tax Payer"] = value.transaction_details_charity_UK_taxpayer;
        $scope.csvHeaders["Gift Aid"] = value.transaction_details_charity_giftaid;
        $scope.csvHeaders["Full name"] = value.transaction_details_charity_fullname;
        $scope.csvHeaders["Full Address"] = value.transaction_details_charity_fulladdress;
        $scope.csvHeaders["Postcode"] = value.transaction_details_charity_postcode;
        $scope.csvHeaders["Gift Amount"] = value.transaction_details_charity_amount;
      }

      if ($scope.public_settings.site_campaign_allow_contribution_message) {
        $scope.csvHeaders['Note'] = 'Note';
      }

      $scope.allTransactioncsv.push($scope.csvHeaders);
      angular.forEach($scope.allTransactionArray, function (value) {
        // ($scope.twithdraw);
        var data1 = {};
        var organization_name = '';
        var organization_email = '';
        $scope.businessDataPhoneNumber = '';
        $scope.busCompleteaddress = '';

        var translations = $translate.instant(['tab_coupon_percent', 'tab_coupon_amount']);

        if (value.coupon && value.coupon.length > 0) {
          $scope.coupon_code = value.coupon[0].code;
          $scope.coupon_name = value.coupon[0].name;
          //they are mutually exclusive
          if (value.coupon[0].discount_amount > value.coupon[0].discount_percentage) {
            $scope.coupon_amount = value.coupon[0].discount_amount;
            $scope.coupon_type = translations.tab_coupon_amount;
          } else {
            $scope.coupon_amount = value.coupon[0].discount_percentage;
            $scope.coupon_type = translations.tab_coupon_percent;
          }
        } else {
          $scope.coupon_code = '';
          $scope.coupon_name = '';
          $scope.coupon_amount = '';
          $scope.coupon_type = '';
        }

        if (value.card) {
          $scope.cardn = '****' + ' ' + '****' + ' ' + '****' + value.card[0].last4;
          $scope.tstatus = globalStripeStatus[value.stripe_transaction_status_id - 1];
        } else {
          $scope.cardn = value.reference_no;
          $scope.tstatus = $scope.manual;
        }
        if (value.backer) {
          if (value.backer[0].disabled) {
            $scope.tstatus = $scope.twithdraw;
          }

          if (value.backer[0].business_organization && value.backer[0].business_organization[0]) {
            organization_name = value.backer[0].business_organization[0].name;
            organization_email = value.backer[0].business_organization[0].email;

            var businessPhoneNumberObj = value.backer[0].business_organization[0].business_organization_shipping_phone_number;
            var businessPhoneType;
            if (businessPhoneNumberObj != null) {
              businessPhoneType = globalPhoneNumberType[businessPhoneNumberObj[0].phone_number_type];
            }
            $scope.businessDataPhoneNumber = businessPhoneNumberObj != null ? businessPhoneNumberObj[0].number + " " + businessPhoneType : "";

            if (value.backer[0].hasOwnProperty('business_organization') && value.backer[0].business_organization[0].business_organization_shipping_address) {
              $scope.busShipadd = value.backer[0].business_organization[0].business_organization_shipping_address[0];
            }

            if (nativeLookup) {
              $scope.busShipadd.city = $scope.busShipadd.city_native_name != null ? $scope.busShipadd.city_native_name : $scope.busShipadd.city;
              $scope.busShipadd.subcountry = $scope.busShipadd.subcountry_native_name != null ? $scope.busShipadd.subcountry_native_name : $scope.busShipadd.subcountry;
              $scope.busShipadd.country = $scope.busShipadd.country_native_name != null ? $scope.busShipadd.country_native_name : $scope.busShipadd.country;
              $scope.busCompleteaddress = $scope.busShipadd.country + ", " + $scope.busShipadd.mail_code + ", " + $scope.shipadd.subcountry + ", " + $scope.busShipadd.city + ", " + $scope.busShipadd.street1;
            } else {
              if($scope.busShipadd !== undefined){
                if ($scope.busShipadd.hasOwnProperty('city_alt') && $scope.public_settings.hasOwnProperty('site_campaign_alt_city_input_toggle')) {
                  $scope.busShipadd.city = $scope.busShipadd.city_alt;
                }
                $scope.busCompleteaddress = $scope.busShipadd.street1 + " , " + $scope.busShipadd.city + " " + $scope.busShipadd.subcountry + " " + $scope.busShipadd.mail_code + " , " + $scope.busShipadd.country;
              }
            }
          }
          if (value.backer[0].person) {
            $scope.addbacker = value.backer[0].person[0];
            if (value.backer[0].pledge_level) {
              $scope.rewardname = value.backer[0].pledge_level[0].name;
            } else {
              $scope.rewardname = $scope.noreward;
            }
            var phoneNumberObj = value.backer[0].person[0].person_shipping_phone_number;
            var phoneType;
            if (phoneNumberObj != null) {
              phoneType = globalPhoneNumberType[phoneNumberObj[0].phone_number_type];
            }
            $scope.dataPhoneNumber = phoneNumberObj != null ? phoneNumberObj[0].number + " " + phoneType : "";
            var parsedEmail = $scope.addbacker.email.split("|||")[0];

            var transaction_id = "";
            if($scope.payment_gateway == 1) {
              transaction_id = value.stripe_transaction_id;
            } else if($scope.payment_gateway == 3) {
              transaction_id = value.paypal_transaction_id;
            }

            if ($scope.addbacker.person_shipping_address) {
              $scope.shipadd = $scope.addbacker.person_shipping_address[0];
              if (nativeLookup) {
                $scope.shipadd.city = $scope.shipadd.city_native_name != null ? $scope.shipadd.city_native_name : $scope.shipadd.city;
                if ($scope.shipadd.hasOwnProperty('city_alt') && $scope.public_settings.hasOwnProperty('site_campaign_alt_city_input_toggle')) {
                  $scope.shipadd.city = $scope.shipadd.city_alt;
                }
                $scope.shipadd.subcountry = $scope.shipadd.subcountry_native_name != null ? $scope.shipadd.subcountry_native_name : $scope.shipadd.subcountry;
                $scope.shipadd.country = $scope.shipadd.country_native_name != null ? $scope.shipadd.country_native_name : $scope.shipadd.country;
                $scope.completeaddress = $scope.shipadd.street1 + ' ' + $scope.shipadd.street2;
                // $scope.completeaddress = $scope.shipadd.country + ", " + $scope.shipadd.mail_code + ", " + $scope.shipadd.subcountry + ", " + $scope.shipadd.city + ", " + $scope.shipadd.street1;
              } else {
                if ($scope.shipadd.hasOwnProperty('city_alt') && $scope.public_settings.hasOwnProperty('site_campaign_alt_city_input_toggle')) {
                  $scope.shipadd.city = $scope.shipadd.city_alt;
                }
                $scope.completeaddress = $scope.shipadd.street1 + ' ' + $scope.shipadd.street2;
                // $scope.completeaddress = $scope.shipadd.street1 + ", " + $scope.shipadd.city + " " + $scope.shipadd.subcountry + " " + $scope.shipadd.mail_code + " , " + $scope.shipadd.country;
              }

              data1 = {
                'ID': transaction_id,
                'Campaign': $scope.campaign_name,
                'Reward': $scope.rewardname,
                'Amount': value.backer[0].amount,
                'Coupon Code': $scope.coupon_code,
                'Coupon Name': $scope.coupon_name,
                'Coupon Amount': $scope.coupon_amount,
                'Coupon Type': $scope.coupon_type,
                'Status': $scope.tstatus,
                'First Name': $scope.addbacker.first_name,
                'Last Name': $scope.addbacker.last_name,
                'Email': parsedEmail,
                'Card': $scope.cardn,
                'Date': value.created.slice(0, 19),
                'Address': $scope.completeaddress,
                'City': $scope.shipadd.city,
                'Country': $scope.shipadd.country,
                'Postal Code': $scope.shipadd.mail_code,
                'Phone': $scope.dataPhoneNumber,
                'Attributes': JSON.stringify(value.backer[0].attributes),
                'Organization Name': organization_name,
                'Organization Email': organization_email,
                'Organization Phone': $scope.businessDataPhoneNumber,
                'Organization Address': $scope.busCompleteaddress
              };
            } else {
              data1 = {
                'ID': transaction_id,
                'Campaign': $scope.campaign_name,
                'Reward': $scope.rewardname,
                'Amount': value.backer[0].amount,
                'Coupon Code': $scope.coupon_code,
                'Coupon Name': $scope.coupon_name,
                'Coupon Amount': $scope.coupon_amount,
                'Coupon Type': $scope.coupon_type,
                'Status': $scope.tstatus,
                'First Name': $scope.addbacker.first_name,
                'Last Name': $scope.addbacker.last_name,
                'Email': parsedEmail,
                'Card': $scope.cardn,
                'Date': value.created.slice(0, 19),
                'Address': $scope.na,
                'City': $scope.na,
                'Country': $scope.na,
                'Postal Code': $scope.na,
                'Phone': $scope.dataPhoneNumber,
                'Attributes': JSON.stringify(value.backer[0].attributes),
                'Organization Name': organization_name,
                'Organization Email': organization_email,
                'Organization Phone': $scope.businessDataPhoneNumber,
                'Organization Address': $scope.busCompleteaddress
              };
            }
            if ($scope.tippingOptions.toggle) {
              if (value.backer[0].amount_tip && value.backer[0].amount_tip != 0) {
                data1.Tip = value.backer[0].amount_tip;
              } else {
                data1.Tip = 0;
              }
            }

            // if charity is enabled site_campaign_charity_helper_enable
            if ($scope.public_settings.site_campaign_charity_helper_enable) {
              if (value.backer[0].attributes) {
                if (value.backer[0].attributes.charity) {
                  data1["UK Tax Payer"] = value.backer[0].attributes.charity.is_a_tax_payer;
                  data1["Gift Aid"] = value.backer[0].attributes.charity.is_a_gift;
                  data1["Full name"] = value.backer[0].attributes.charity.fullname;
                  data1["Full Address"] = value.backer[0].attributes.charity.address;
                  data1["Postcode"] = value.backer[0].attributes.charity.postcode;
                  data1["Gift Amount"] = value.backer[0].charity_helper_amount;
                }
              }
            }

            if ($scope.public_settings.site_campaign_allow_contribution_message) {
              if (value.backer[0].hasOwnProperty('note') && typeof value.backer[0].note != 'undefined') {
                data1["Note"] = value.backer[0].note;
              }
            }

            $scope.allTransactioncsv.push(data1);
          }
        }
      });
      return $scope.allTransactioncsv;
    });
  }
  
  $scope.createTransactionCompleteCSV = function () {

    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var campaignQueue = getSelectedItems(),
      requestQueue = []
    if (campaignQueue.length === 0) {
      msg = {
        'header': "tab_campaigns_select_error",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();

    } else {

      angular.forEach(campaignQueue, function (campaign) {
        // make put request to change campaign status
        requestQueue.push(RestFullResponse.all('campaign/' + campaign.id + '/stats').getList().then(function (success) {
          // $scope.transaction_detail = success.data;
          for(var i = 0; i< success.data.length; i++) {
            success.data[i]["campaign_name"] = campaign.name;
          }

          return success; 
        }));
      });
      
      return $q.all(requestQueue).then(function (success) {
        var selectedTransactionsArray = [];
        var selectedTransactionsCsv = []
        // Create array of transactions
        success.forEach(function (resArr) {
          selectedTransactionsArray = selectedTransactionsArray.concat(resArr.data);
        });
        var nativeLookup = $scope.public_settings.site_theme_shipping_native_lookup;
        var value = $translate.instant(['transaction_details_street_address', 'transaction_details_postal_code','transaction_details_city', 'transaction_details_country', 'transaction_details_withdrawn', 'transaction_details_campaign', 'transaction_details_card_number', 'transaction_details_Manual_Transaction', 'transaction_details_na', 'transaction_details_transaction_id', 'transaction_details_contributors_first', 'transaction_details_contributors_last', 'transaction_details_reward', 'transaction_details_amount', 'transaction_details_status', 'transaction_details_date', 'transaction_details_contributors_email', 'transaction_details_shipping_address', 'transaction_details_phone_number', 'transaction_details_reward_attribute', "transaction_details_charity_UK_taxpayer", "transaction_details_charity_giftaid", "transaction_details_charity_fullname", "transaction_details_charity_fulladdress", "transaction_details_charity_postcode", "transaction_details_charity_amount", "transaction_details_organization_name", "transaction_details_organization_email", "transaction_details_organization_phone", "transaction_details_organization_address", "tab_campaign_transaction_details_tip_amount", 'transaction_details_coupon_code', 'transaction_details_coupon_amount', 'transaction_details_coupon_type', 'transaction_details_coupon_name']);
        
        $scope.cardnum = value.transaction_details_card_number;
        $scope.noreward = value.transaction_details_na;
        $scope.tid = value.transaction_details_transaction_id;
        $scope.tcampaign = value.transaction_details_campaign;
        $scope.treward = value.transaction_details_reward;
        $scope.tamount = value.transaction_details_amount;
        $scope.tstatus = value.transaction_details_status;
        $scope.tnamef = value.transaction_details_contributors_first;
        $scope.tnamel = value.transaction_details_contributors_last;
        $scope.temail = value.transaction_details_contributors_email;
        $scope.tdate = value.transaction_details_date;
        $scope.taddress = value.transaction_details_street_address;
        $scope.tcountry = value.transaction_details_country;
        $scope.tcity = value.transaction_details_city;
        $scope.tpostal = value.transaction_details_postal_code;
        $scope.tphone = value.transaction_details_phone_number;
        $scope.twithdraw = value.transaction_details_withdrawn;
        $scope.manual = value.transaction_details_Manual_Transaction;
        $scope.attributes = value.transaction_details_reward_attribute;
        $scope.tbusiness_organization = value.transaction_details_organization_name;
        $scope.tbusiness_organization_email = value.transaction_details_organization_email;
        $scope.tbusiness_organization_phone = value.transaction_details_organization_phone;
        $scope.tbusiness_organization_address = value.transaction_details_organization_address;
        $scope.csvHeaders = {
          'ID': $scope.tid,
          'Campaign': $scope.tcampaign,
          'Reward': $scope.treward,
          'Amount': $scope.tamount,
          'Coupon Code': value.transaction_details_coupon_code,
          'Coupon Name': value.transaction_details_coupon_name,
          'Coupon Amount': value.transaction_details_coupon_amount,
          'Coupon Type': value.transaction_details_coupon_type,  
          'Status': $scope.tstatus,
          'First Name': $scope.tnamef,
          'Last Name': $scope.tnamel,
          'Email': $scope.temail,
          'Card': $scope.cardnum,
          'Date': $scope.tdate,
          'Address': $scope.taddress,
          'City': $scope.tcity,
          'Country': $scope.tcountry,
          'Postal Code': $scope.tpostal,
          'Phone': $scope.tphone,
          'Attributes': $scope.attributes,
          'Organization Name': $scope.tbusiness_organization,
          'Organization Email': $scope.tbusiness_organization_email,
          'Organization Phone': $scope.tbusiness_organization_phone,
          'Organization Address': $scope.tbusiness_organization_address,
        };

        if ($scope.tippingOptions.toggle) {
          $scope.csvHeaders.Tip = value.tab_campaign_transaction_details_tip_amount;
        }

        // if charity is enabled site_campaign_charity_helper_enable
        if ($scope.public_settings.site_campaign_charity_helper_enable) {
          $scope.csvHeaders["UK Tax Payer"] = value.transaction_details_charity_UK_taxpayer;
          $scope.csvHeaders["Gift Aid"] = value.transaction_details_charity_giftaid;
          $scope.csvHeaders["Full name"] = value.transaction_details_charity_fullname;
          $scope.csvHeaders["Full Address"] = value.transaction_details_charity_fulladdress;
          $scope.csvHeaders["Postcode"] = value.transaction_details_charity_postcode;
          $scope.csvHeaders["Gift Amount"] = value.transaction_details_charity_amount;
        }
  
        if ($scope.public_settings.site_campaign_allow_contribution_message) {
          $scope.csvHeaders['Note'] = 'Note';
        }

        selectedTransactionsCsv.push($scope.csvHeaders);

        angular.forEach(selectedTransactionsArray, function (value) {
          // ($scope.twithdraw);
          var data1 = {};
          var organization_name = '';
          var organization_email = '';
          $scope.businessDataPhoneNumber = '';
          $scope.busCompleteaddress = '';

          var translations = $translate.instant(['tab_coupon_percent', 'tab_coupon_amount']);

          if (value.coupon && value.coupon.length > 0) {
            $scope.coupon_code = value.coupon[0].code;
            $scope.coupon_name = value.coupon[0].name;
            //they are mutually exclusive
            if (value.coupon[0].discount_amount > value.coupon[0].discount_percentage) {
              $scope.coupon_amount = value.coupon[0].discount_amount;
              $scope.coupon_type = translations.tab_coupon_amount;
            } else {
              $scope.coupon_amount = value.coupon[0].discount_percentage;
              $scope.coupon_type = translations.tab_coupon_percent;
            }
          } else {
            $scope.coupon_code = '';
            $scope.coupon_name = '';
            $scope.coupon_amount = '';
            $scope.coupon_type = '';
          }

          // $scope.campaign_name = cname;
          if (value.card) {
            $scope.cardn = '****' + ' ' + '****' + ' ' + '****' + value.card[0].last4;
            $scope.tstatus = globalStripeStatus[value.stripe_transaction_status_id - 1];
          } else {
            $scope.cardn = value.reference_no;
            $scope.tstatus = $scope.manual;
          }
          if (value.backer) {
            if (value.backer[0].disabled) {
              $scope.tstatus = $scope.twithdraw;
            }
  
            if (value.backer[0].business_organization && value.backer[0].business_organization[0]) {
              organization_name = value.backer[0].business_organization[0].name;
              organization_email = value.backer[0].business_organization[0].email;
  
              var businessPhoneNumberObj = value.backer[0].business_organization[0].business_organization_shipping_phone_number;
              var businessPhoneType;
              if (businessPhoneNumberObj != null) {
                businessPhoneType = globalPhoneNumberType[businessPhoneNumberObj[0].phone_number_type];
              }
              $scope.businessDataPhoneNumber = businessPhoneNumberObj != null ? businessPhoneNumberObj[0].number + " " + businessPhoneType : "";
  
              if (value.backer[0].hasOwnProperty('business_organization') && value.backer[0].business_organization[0].business_organization_shipping_address) {
                $scope.busShipadd = value.backer[0].business_organization[0].business_organization_shipping_address[0];
              }
  
              if (nativeLookup) {
                $scope.busShipadd.city = $scope.busShipadd.city_native_name != null ? $scope.busShipadd.city_native_name : $scope.busShipadd.city;
                $scope.busShipadd.subcountry = $scope.busShipadd.subcountry_native_name != null ? $scope.busShipadd.subcountry_native_name : $scope.busShipadd.subcountry;
                $scope.busShipadd.country = $scope.busShipadd.country_native_name != null ? $scope.busShipadd.country_native_name : $scope.busShipadd.country;
                $scope.busCompleteaddress = $scope.busShipadd.country + ", " + $scope.busShipadd.mail_code + ", " + $scope.shipadd.subcountry + ", " + $scope.busShipadd.city + ", " + $scope.busShipadd.street1;
              } else {
                if($scope.busShipadd !== undefined){
                  if ($scope.busShipadd.hasOwnProperty('city_alt') && $scope.public_settings.hasOwnProperty('site_campaign_alt_city_input_toggle')) {
                    $scope.busShipadd.city = $scope.busShipadd.city_alt;
                  }
                  $scope.busCompleteaddress = $scope.busShipadd.street1 + " , " + $scope.busShipadd.city + " " + $scope.busShipadd.subcountry + " " + $scope.busShipadd.mail_code + " , " + $scope.busShipadd.country;
                }
              }
            }
            if (value.backer[0].person) {
              $scope.addbacker = value.backer[0].person[0];
              if (value.backer[0].pledge_level) {
                $scope.rewardname = value.backer[0].pledge_level[0].name;
              } else {
                $scope.rewardname = $scope.noreward;
              }
              var phoneNumberObj = value.backer[0].person[0].person_shipping_phone_number;
              var phoneType;
              if (phoneNumberObj != null) {
                phoneType = globalPhoneNumberType[phoneNumberObj[0].phone_number_type];
              }
              $scope.dataPhoneNumber = phoneNumberObj != null ? phoneNumberObj[0].number + " " + phoneType : "";
              var parsedEmail = $scope.addbacker.email.split("|||")[0];
              if ($scope.addbacker.person_shipping_address) {
                $scope.shipadd = $scope.addbacker.person_shipping_address[0];
                if (nativeLookup) {
                  $scope.shipadd.city = $scope.shipadd.city_native_name != null ? $scope.shipadd.city_native_name : $scope.shipadd.city;
                  if ($scope.shipadd.hasOwnProperty('city_alt') && $scope.public_settings.hasOwnProperty('site_campaign_alt_city_input_toggle')) {
                    $scope.shipadd.city = $scope.shipadd.city_alt;
                  }
                  $scope.shipadd.subcountry = $scope.shipadd.subcountry_native_name != null ? $scope.shipadd.subcountry_native_name : $scope.shipadd.subcountry;
                  $scope.shipadd.country = $scope.shipadd.country_native_name != null ? $scope.shipadd.country_native_name : $scope.shipadd.country;                  
                  $scope.completeaddress = $scope.shipadd.street1 + ' ' + $scope.shipadd.street2;
                  // $scope.completeaddress = $scope.shipadd.country + ", " + $scope.shipadd.mail_code + ", " + $scope.shipadd.subcountry + ", " + $scope.shipadd.city + ", " + $scope.shipadd.street1;
                } else {
                  if ($scope.shipadd.hasOwnProperty('city_alt') && $scope.public_settings.hasOwnProperty('site_campaign_alt_city_input_toggle')) {
                    $scope.shipadd.city = $scope.shipadd.city_alt;
                  }
                  $scope.completeaddress = $scope.shipadd.street1 + ' ' + $scope.shipadd.street2;
                  // $scope.completeaddress = $scope.shipadd.street1 + ", " + $scope.shipadd.city + " " + $scope.shipadd.subcountry + " " + $scope.shipadd.mail_code + " , " + $scope.shipadd.country;
                }
                
                data1 = {
                  'ID': value.stripe_transaction_id,
                  'Campaign': value.campaign_name,
                  'Reward': $scope.rewardname,
                  'Amount': value.backer[0].amount,
                  'Coupon Code': $scope.coupon_code,
                  'Coupon Name': $scope.coupon_name,
                  'Coupon Amount': $scope.coupon_amount,
                  'Coupon Type': $scope.coupon_type,
                  'Status': $scope.tstatus,
                  'First Name': $scope.addbacker.first_name,
                  'Last Name': $scope.addbacker.last_name,
                  'Email': parsedEmail,
                  'Card': $scope.cardn,
                  'Date': value.created.slice(0, 19),
                  'Address': $scope.completeaddress,
                  'City': $scope.shipadd.city,
                  'Country': $scope.shipadd.country,
                  'Postal Code': $scope.shipadd.mail_code,
                  'Phone': $scope.dataPhoneNumber,
                  'Attributes': JSON.stringify(value.backer[0].attributes),
                  'Organization Name': organization_name,
                  'Organization Email': organization_email,
                  'Organization Phone': $scope.businessDataPhoneNumber,
                  'Organization Address': $scope.busCompleteaddress
                };
              } else {
                data1 = {
                  'ID': value.stripe_transaction_id,
                  'Campaign': value.campaign_name,
                  'Reward': $scope.rewardname,
                  'Amount': value.backer[0].amount,
                  'Coupon Code': $scope.coupon_code,
                  'Coupon Name': $scope.coupon_name,
                  'Coupon Amount': $scope.coupon_amount,
                  'Coupon Type': $scope.coupon_type,
                  'Status': $scope.tstatus,
                  'First Name': $scope.addbacker.first_name,
                  'Last Name': $scope.addbacker.last_name,
                  'Email': parsedEmail,
                  'Card': $scope.cardn,
                  'Date': value.created.slice(0, 19),
                  'Address': $scope.na,
                  'City': $scope.na,
                  'Country': $scope.na,
                  'Postal Code': $scope.na,
                  'Phone': $scope.dataPhoneNumber,
                  'Attributes': JSON.stringify(value.backer[0].attributes),
                  'Organization Name': organization_name,
                  'Organization Email': organization_email,
                  'Organization Phone': $scope.businessDataPhoneNumber,
                  'Organization Address': $scope.busCompleteaddress
                };
              }
              if ($scope.tippingOptions.toggle) {
                if (value.backer[0].amount_tip && value.backer[0].amount_tip != 0) {
                  data1.Tip = value.backer[0].amount_tip;
                } else {
                  data1.Tip = 0;
                }
              }
  
              // if charity is enabled site_campaign_charity_helper_enable
              if ($scope.public_settings.site_campaign_charity_helper_enable) {
                if (value.backer[0].attributes) {
                  if (value.backer[0].attributes.charity) {
                    data1["UK Tax Payer"] = value.backer[0].attributes.charity.is_a_tax_payer;
                    data1["Gift Aid"] = value.backer[0].attributes.charity.is_a_gift;
                    data1["Full name"] = value.backer[0].attributes.charity.fullname;
                    data1["Full Address"] = value.backer[0].attributes.charity.address;
                    data1["Postcode"] = value.backer[0].attributes.charity.postcode;
                    data1["Gift Amount"] = value.backer[0].charity_helper_amount;
                  }
                }
              }
  
              if ($scope.public_settings.site_campaign_allow_contribution_message) {
                if (value.backer[0].hasOwnProperty('note') && typeof value.backer[0].note != 'undefined') {
                  data1["Note"] = value.backer[0].note;
                }
              }
  
              selectedTransactionsCsv.push(data1);
            }
          }
        });

        msg = {
          'header': 'tab_campaign_transactions_export',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();

        return selectedTransactionsCsv;

      }, function (failed) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });


    }
  }

  $scope.goBackUser = function () {
    if (!$scope.showManualTransactionFromTrans) {
      $scope.details = false;
      $scope.user = "";
      $scope.transaction_message = false;
      $scope.manualOrder = false;
      $scope.transaction_error = false;
      $scope.approvedCamp = false;
      $scope.isTransaction = false;
      $scope.showManualTransactionFromCamp = false;
    }
    $scope.showManualTransactionFromTrans = false;

  }
  $scope.showManualTransactionFromTrans = false;

  $scope.backCampaign = function () {
    // $scope.showManualTransaction = false;
  }

  $scope.showContact = function (index) {
    var nativeLookup = $scope.public_settings.site_theme_shipping_native_lookup;
    $scope.shippingPhoneNumber = null;
    $scope.shippingAdress = null;
    if ($scope.transaction_detail[index].backer[0].person[0].person_shipping_phone_number != null) {
      var phoneNumber = $scope.transaction_detail[index].backer[0].person[0].person_shipping_phone_number[0].number;
      var phoneType = $scope.transaction_detail[index].backer[0].person[0].person_shipping_phone_number[0].phone_number_type;

      $scope.shippingPhoneNumber = phoneNumber;
      $translate(phoneType).then(function (translation) {
        $scope.shippingPhoneType = translation;
      });
    }
    if ($scope.transaction_detail[index].backer[0].person[0].person_shipping_address != null) {
      $scope.address = $scope.transaction_detail[index].backer[0].person[0].person_shipping_address;
      $scope.shippingAdress = $scope.address;
      if (!$scope.alt_shipping) {
        var name = $scope.transaction_detail[index].backer[0].person[0].first_name + " " + $scope.transaction_detail[index].backer[0].person[0].last_name;
        var city = ($scope.address[0].city_native_name != null && nativeLookup) ? $scope.address[0].city_native_name : $scope.address[0].city;
        var country = ($scope.address[0].country_native_name != null && nativeLookup) ? $scope.address[0].country_native_name : $scope.address[0].country;
        var street = $scope.address[0].street1;
        var mailcode = $scope.address[0].mail_code;
        var subcountry = ($scope.address[0].subcountry_native_name != null && nativeLookup) ? $scope.address[0].subcountry_native_name : $scope.address[0].subcountry;
        var address = city + ', ' + subcountry + " " + mailcode;

        if ($scope.address[0].city_alt && $scope.public_settings.site_campaign_alt_city_input_toggle) {
          var address = $scope.address[0].city_alt + ', ' + subcountry + " " + mailcode;
        }

        $('#backername').text(name);
        $('#street').text(street);
        $('#main_address').text(address);
        $('#country_name').text(country);
      } else if ($scope.alt_shipping) {
        var name = $scope.transaction_detail[index].backer[0].person[0].first_name + " " + $scope.transaction_detail[index].backer[0].person[0].last_name;
        var city = ($scope.address[0].city_native_name != null && nativeLookup) ? $scope.address[0].city_native_name : $scope.address[0].city;
        var country = ($scope.address[0].country_native_name != null && nativeLookup) ? $scope.address[0].country_native_name : $scope.address[0].country;
        var street = $scope.address[0].street1;
        var mailcode = $scope.address[0].mail_code;
        var subcountry = ($scope.address[0].subcountry_native_name != null && nativeLookup) ? $scope.address[0].subcountry_native_name : $scope.address[0].subcountry;
        var address = subcountry + ", " + city;

        if ($scope.address[0].city_alt && $scope.public_settings.site_campaign_alt_city_input_toggle) {
          var address = subcountry + ", " + $scope.address[0].city_alt;
        }
        $('#backername').text(name);
        $('#street').text(street);
        $('#main_address').text(address);
        $('#country_name').text(country);
        $("#postcode").text(mailcode);
      }
    }

    $('.small.test.modal').modal('show');
  }

  function getSelectedItems() {
    var selectedItems = [];
    var $table;
    if ($scope.isTransaction) {
      $table = $('.transaction-table');
    } else {
      $table = $('.campaign-table');
    }
    $table.find('tbody > tr').each(function (index) {
      if ($(this).find('.t-check-box input').prop('checked')) {
        if ($scope.isTransaction) {
          selectedItems.push($scope.transaction_detail[index]);
        } else {
          selectedItems.push($(this).scope().campaign);
        }
      }
    });
    return selectedItems;
  }

  $scope.changeCampaignsStatus = function (statusID) {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var campaignQueue = getSelectedItems(),
      requestQueue = []
    if (campaignQueue.length === 0) {
      msg = {
        'header': "tab_campaigns_select_error",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();

    } else {
      angular.forEach(campaignQueue, function (campaign) {
        var data = {
          entry_status_id: statusID,
        };
        // make put request to change campaign status
        requestQueue.push(Restangular.one('campaign', campaign.id).customPUT(data).then(function (success) {
          campaign = success;
          $scope.syncCampaignandFeatured(campaign.id, "entry_status_id", statusID);
        }));
      });
      $q.all(requestQueue).then(function () {
        msg = {
          'header': 'tab_campaigns_campaign_status_set',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }, function (failed) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
  }

  $scope.progressStatusEnabled = function () {
    if($scope.portal_settings.site_campaign_state_hide == undefined) {
      return false;
    }
    if($scope.portal_settings.site_campaign_state_settings == undefined) {
      return false;
    }
    return $scope.portal_settings.site_campaign_state_hide && $scope.portal_settings.site_campaign_state_settings.length >= 1;
  }
  $scope.changeMultipleCampaignsStatus = function () {
    if (getSelectedItems().length === 0) {
      msg = {
        'header': "tab_campaigns_select_error",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    } else {
      $('.change-status-modal').modal({
        onApprove: function () {
          angular.forEach($scope.progressQueue, function (campaign) {
            Restangular.one("campaign", campaign["id"]).one("setting").customPUT(campaign["data"]).then(function (success) { });
          });
        }
      }).modal('show');
    }
  }

  // click event for State select
  $scope.stateSelected = function (data) {
    var campaignQueue = getSelectedItems();
    angular.forEach(campaignQueue, function (campaign) {
      var campaignId = campaign["entry_id"];
      // var campaignId = 106;
      $scope.progressQueue = [];
      CampaignSettingsService.retreiveSettings(campaignId).then(function (success) {
        $scope.data = {};
        angular.forEach(success, function (value) {
          $scope.data[value.name] = value.value;
        });

        $scope.data["state_current"] = $scope.portal_settings.site_campaign_state_settings[data];

        var setting = {};
        setting["id"] = campaignId;
        setting["data"] = $scope.data;
        $scope.progressQueue.push(setting);
      });
    });


  }

  $scope.featureCampaigns = function (feature) {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var campaignQueue = getSelectedItems(),
      requestQueue = [];
    if (campaignQueue.length === 0) {
      msg = {
        'header': "tab_campaigns_select_error",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    } else {
      angular.forEach(campaignQueue, function (campaign) {
        var data = {
          featured: feature,
        };
        requestQueue.push(Restangular.one('campaign', campaign.id).customPUT(data).then(function (success) {
          campaign.featured = feature;
          $scope.syncCampaignandFeatured(campaign.id, "featured", feature);
        }));
      });
      $q.all(requestQueue).then(function () {
        msg = {
          'header': 'tab_campaigns_campaign_featured_set',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        $scope.getFeaturedCampaigns();
      }, function (failed) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
  }

  $scope.hideCampaigns = function (hide) {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var campaignQueue = getSelectedItems(),
      requestQueue = [];

    if (campaignQueue.length === 0) {
      msg = {
        'header': "tab_campaigns_select_error",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    } else {
      angular.forEach(campaignQueue, function (campaign) {
        var data = {
          hidden: hide,
        };
        requestQueue.push(Restangular.one('campaign', campaign.id).customPUT(data).then(function (success) {
          campaign.hidden = hide;
          $scope.syncCampaignandFeatured(campaign.id, "hidden", hide);
        }));
      });
      $q.all(requestQueue).then(function () {
        /*$scope.getFeaturedCampaigns();
        updateCampaignListing();*/
        msg = {
          'header': 'tab_campaigns_campaign_visibility_set',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      },
        function (failure) {
          msg = {
            'header': failure.data.message,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
    }
  }
  $scope.getTotalItemsCampaign = function () {
    var desiredtotal = $scope.sortOrFiltersCampaign.pagination.entriesperpage * $scope.sortOrFiltersCampaign.page_limit;
    if (desiredtotal > $scope.sortOrFiltersCampaign.pagination.totalentries)
      return $scope.sortOrFiltersCampaign.pagination.totalentries;
    else
      return desiredtotal;
  }

  $scope.editCampaign = function ($event, campaign) {
    $scope.campaign = campaign;
    window.open('getstarted/' + campaign.entry_id);
  }

  // Checks if the Date object is correct. Especially important when calculating something like end date where start date + xxxx
  // may be so far away it becomes no longer a valid Date object
  function isValidDate(d) {
    if (Object.prototype.toString.call(d) !== "[object Date]") {
      return false;
    }
    return !isNaN(d.getTime());
  }

  function convertDate(d) {
    var value = d;
    var date = new Date(value);
    // if the date is not able to be converted
    if (!isValidDate(date)) {
      // get the year, month, day
      var year = value.substring(0, 4);
      var month = value.substring(5, 7);
      var day = value.substring(8, 10);
      // do a pure convertion
      return new Date(year, month - 1, day);
    }
    return d;
  }

  function fix_date(s) {
    if (typeof s == 'string') {
      return Date.parse(s);
    } else {
      if (s)
        return s.getTime();
      return;
    }
  }

  $scope.check = function() {
    $scope.checkstatus = true;
  }

  $scope.campaignManagerHasEndDate = function(campaign) {
    if(campaign.ends_date_time == undefined) {
      return false;
    }
    return true;
  }

  $scope.duration_type = [{
    id: '1',
    type: 'duration_type_day'
  }, {
    id: '2',
    type: 'duration_type_week'
  }, {
    id: '3',
    type: 'duration_type_month'
  }, {
    id: '4',
    type: 'duration_type_year'
  }];

  $scope.durationTypeSelected = function(typeID) {
    $scope.extendingCampaign.duration_type_id = typeID;
  };

  $scope.openExtendCampaignModal = function(campaign) {
    if (campaign) {
      $scope.extendingCampaign = campaign;
      $('.extend-campaign-modal').modal('show');
    }
  }
  $scope.extendCampaignEndDate = function() {
    // Increment current end date
    $scope.extendingCampaign.ends_date_time =  new Date($scope.extendingCampaign.ends_date_time);
    $scope.extendingCampaign.ends_date_time.setTime($scope.extendingCampaign.ends_date_time.getTime() + $scope.extendEndDays * 86400000);

    var month = $scope.extendingCampaign.ends_date_time.getMonth();
    if (month >= 9) {
      month = $scope.extendingCampaign.ends_date_time.getMonth() + 1;
    } else {
      month = $scope.extendingCampaign.ends_date_time.getMonth() + 1;
      month = "0" + month;
    }
    var day = $scope.extendingCampaign.ends_date_time.getDate();
    if (day > 9) {} else {

      day = "0" + day;
    }
    var hours = $scope.extendingCampaign.ends_date_time.getHours();
    if (hours > 9) {} else {
      hours = "0" + hours;
    }
    var mins = $scope.extendingCampaign.ends_date_time.getMinutes();
    if (mins > 9) {} else {
      mins = "0" + mins;
    }
    var datestring = $scope.extendingCampaign.ends_date_time.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + mins + ":00";
    $scope.extendingCampaign.ends = datestring;
    $scope.extendingCampaign.ends = $scope.extendingCampaign.ends.replace(/\//g, "-");

    if($scope.user.portal_admin == 1) {
      // Approve campaign
      $scope.extendingCampaign.entry_status_id = 2;
    }
    if($scope.user.campaign_manager == 1) {
      $scope.extendingCampaign.entry_status_id = 10;
    }

    Restangular.one('campaign', $scope.extendingCampaign.id).customPUT($scope.extendingCampaign).then(function(success) {
      // Update current campaign list
      angular.forEach($scope.campaigns, function(campaign, key) {
        if(campaign.id == $scope.extendingCampaign.id) {
          $scope.campaigns[key] = success;
        }
      });
      msg = {
        'header': 'campaign_management_extend_campaign_date_success',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      $('.extend-campaign-modal').modal('hide');
    });
  }
  $scope.setCampaignEndDate = function() {
    if (typeof $scope.extendingCampaign.starts_date_time == "string") {
      $scope.extendingCampaign.starts_date_time = new Date($scope.extendingCampaign.starts_date_time);
    }
    if ($scope.extendingCampaign.starts_date_time && typeof $scope.extendingCampaign.starts_date_time === "object") {
      if ($scope.extendingCampaign.starts_date_time.toString().length > 19) {
        var month = $scope.extendingCampaign.starts_date_time.getMonth();
        if (month >= 9) {
          month = $scope.extendingCampaign.starts_date_time.getMonth() + 1;
        } else {
          month = $scope.extendingCampaign.starts_date_time.getMonth() + 1;
          month = "0" + month;
        }
        var day = $scope.extendingCampaign.starts_date_time.getDate();
        if (day > 9) {} else {

          day = "0" + day;
        }
        var hours = $scope.extendingCampaign.starts_date_time.getHours();
        if (hours > 9) {} else {
          hours = "0" + hours;
        }
        var mins = $scope.extendingCampaign.starts_date_time.getMinutes();
        if (mins > 9) {} else {
          mins = "0" + mins;
        }
        var datestring = $scope.extendingCampaign.starts_date_time.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + mins + ":00";
        $scope.extendingCampaign.starts = datestring;
      } else {
        $scope.extendingCampaign.starts = $scope.extendingCampaign.starts_date_time.substring(0, 16) + ":00";
      }
    }
    if (typeof $scope.extendingCampaign.ends_date_time == "string") {
      $scope.extendingCampaign.ends_date_time = new Date($scope.extendingCampaign.ends_date_time);
    }
    var month = $scope.extendingCampaign.ends_date_time.getMonth();
    if (month >= 9) {
      month = $scope.extendingCampaign.ends_date_time.getMonth() + 1;
    } else {
      month = $scope.extendingCampaign.ends_date_time.getMonth() + 1;
      month = "0" + month;
    }
    var day = $scope.extendingCampaign.ends_date_time.getDate();
    if (day > 9) {} else {

      day = "0" + day;
    }
    var hours = $scope.extendingCampaign.ends_date_time.getHours();
    if (hours > 9) {} else {
      hours = "0" + hours;
    }
    var mins = $scope.extendingCampaign.ends_date_time.getMinutes();
    if (mins > 9) {} else {
      mins = "0" + mins;
    }
    var datestring = $scope.extendingCampaign.ends_date_time.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + mins + ":00";
    $scope.extendingCampaign.ends = datestring;
    $scope.extendingCampaign.ends = $scope.extendingCampaign.ends.replace(/\//g, "-");

    if($scope.user.portal_admin == 1) {
      // Approve campaign
      $scope.extendingCampaign.entry_status_id = 2;
    }
    if($scope.user.campaign_manager == 1) {
      $scope.extendingCampaign.entry_status_id = 10;
    }

    Restangular.one('campaign', $scope.extendingCampaign.id).customPUT($scope.extendingCampaign).then(function(success) {
      // Update current campaign list
      angular.forEach($scope.campaigns, function(campaign, key) {
        if(campaign.id == $scope.extendingCampaign.id) {
          $scope.campaigns[key] = success;
        }
      });
      msg = {
        'header': 'campaign_management_extend_campaign_date_success',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      $('.extend-campaign-modal').modal('hide');
    });
  }

  $scope.$watchGroup(['extendingCampaign.duration_type_id', 'extendingCampaign.runtime_days', 'extendingCampaign.starts_date_time'], function(values, oldValues) {
    // only watch after finish loading
    if (typeof oldValues[1] == "undefined") {
      return;
    }

    $scope.oldtype_id = angular.copy($scope.extendingCampaign.duration_type_id);
    if (!values[0] || values[1] < 0 || !values[2]) {
      // unset extendingCampaign.ends
      $scope.extendingCampaign.ends_date_time = "";
    }

    if (values[2]) {
      if (values[1]) {
        if (values[0]) {
          var ip = parseInt(values[0]);
          var days;
          switch (ip) {
            case 1:
              days = values[1];
              break;
            case 2:
              days = values[1] * 7;
              break;
            case 3:
              days = values[1] * 30;
              break;
            case 4:
              days = values[1] * 365;
              break;
            default:
              days = 0;
          }

          if (isValidDate(new Date(days * 86400000))) {
            if (typeof $scope.extendingCampaign.starts_date_time === 'string') {
              $scope.extendingCampaign.ends_date_time = new Date(fix_date($scope.extendingCampaign.starts_date_time) + (days * 86400000));
            } else {
              $scope.extendingCampaign.ends_date_time = new Date($scope.extendingCampaign.starts_date_time.getTime() + (days * 86400000));
            }

          }
        }
      }
    }
  });

  $scope.$watch('extendingCampaign.ends_date_time', function(values) {
    if (values) {
      $('#end-date-field .select-error').remove();
      $('#end-date-field').removeClass('error');
    }
    if ($scope.checkstatus) {
      $scope.checkstatus = false;
      $scope.extendingCampaign.starts = convertDate($scope.extendingCampaign.starts_date_time);
      // if extendingCampaign.end_days also exists
      if ($scope.extendingCampaign.starts_date_time) {
        // if valid value
        $scope.extendingCampaign.ends = convertDate(values);
        // assign extendingCampaign.ends
        $scope.extendingCampaign.runtime_days = Math.round((fix_date($scope.extendingCampaign.ends_date_time) - fix_date($scope.extendingCampaign.starts_date_time)) / 86400000);
        $scope.extendingCampaign.duration_type_id = 1;
        var day_option = $translate.instant('Day');
        $('#duration_dtext').text(day_option);
      }
    }
  });

  // Look up city based on search term, then find the cityID and store it
  $scope.searchCampaignCities = function (term) {
    var cityID = null;
    Geolocator.searchCities(term).then(function (cities) {
      $scope.cities = cities;
      cityID = Geolocator.lookupCityID($scope.campaign.city);
      if (cityID) {
        $scope.campaign.city_id = ctyID;
      } else {
        $scope.campaign.city_id = '';
      }
    });
  }
  $scope.cities = [];

  // search city input
  $scope.searchCities = function (term) {
    var cityID = null; // variable to hold city ID
    var countryID = null;
    var native_lookup = $scope.native_lookup == true ? 1 : 0;
    if (term) {
      // Check setting here to choose which one to use, check the layout
      // This one is to search cities directly
      if (!$scope.alt_shipping) {
        Geolocator.searchCities(term, native_lookup).then(function (cities) {
          $scope.cities = cities;
        });
      }
      // This one is to search with subcountry id to limit the area
      else {
        Geolocator.searchCitiesBySubcountry(term, $scope.selectedSubcountry.selected.id, native_lookup).then(function (cities) {
          if (native_lookup) {
            for (var i in cities) {
              if (cities[i].city_native_name != null) {
                cities[i].name = cities[i].city_native_name;
              }
              if (cities[i].country_native_name != null) {
                cities[i].country = cities[i].country_native_name;
              }
              if (cities[i].subcountry_native_name != null) {
                cities[i].subcountry = cities[i].subcountry_native_name;
              }
            }
          }
          $scope.cities = cities;
        });
      }
    }
  }

  // get featured campaigns
  $scope.getFeaturedCampaigns = function () {
    Restangular.all('campaign').getList({
      "sort": '-display_priority',
      'filters': {
        'featured': "t",
      },
      'page_entries': $scope.featuredCampaignsLimit,
    }).then(function (success) {
      // Emit event for hiding loader.
      //$scope.$emit("loading_finished");
      $scope.isFeaturedCampaignsLoaded = true;
      $scope.campaign_buffer = success;
      angular.forEach($scope.campaign_buffer, function (campaign) {
        CampaignSettingsService.processSettings(campaign.settings);
        campaign.settings = CampaignSettingsService.getSettings();
      });
    });
  }

  // set single campaign
  $scope.setFeatured = function (campaign, feature) {
    //$scope.clearMessage();

    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var id = campaign.entry_id;
    var data = {
      featured: feature,
    };

    if (!feature) {
      data.display_priority = 0;
    };

    Restangular.one('campaign', id).customPUT(data).then(
      function (success) {
        campaign.featured = feature;
        $scope.syncCampaignandFeatured(id, "featured", feature);
        $scope.getFeaturedCampaigns();
        msg = {
          'header': 'tab_campaigns_campaign_featured_set',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      },
      function (failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }
    );
  }

  $scope.syncCampaignandFeatured = function (entry_id, key, value) {

    // Sync up campaigns, without having to g
    for (var j = 0; j < $scope.campaigns.length; j++) {
      if ($scope.campaigns[j].entry_id && $scope.campaigns[j].entry_id == entry_id) {
        $scope.campaigns[j][key] = value;
        break;
      }
    }

    // Sync up Featured campaigns
    for (var j = 0; j < $scope.campaign_buffer.length; j++) {
      if ($scope.campaign_buffer[j].entry_id && $scope.campaign_buffer[j].entry_id == entry_id) {
        $scope.campaign_buffer[j][key] = value;
        break;
      }
    }
  }

  $scope.searchCampaignBy = function (search_value) {
    //Reset filter
    $scope.sortOrFiltersCampaign.filters["name"] = "";
    $scope.sortOrFiltersCampaign.filters["manager"] = "";
    $scope.sortOrFiltersCampaign.filters[$scope.searchTypeChosen] = search_value;
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }

  //Search Type
  $scope.searchTypeChosen = "name";
  $scope.searchType = function (search_type) {
    $("#searchname").val("");
    $scope.searchTypeChosen = search_type
  }

  $scope.deleteItems = function () {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var itemQueue = getSelectedItems(),
      requestQueue = [];
    if (itemQueue.length === 0) {
      msg = {
        'header': "tab_campaigns_select_error",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    } else {
      $('.delete-multi-items-modal').modal('setting', {
        onApprove: function () {
          angular.forEach(itemQueue, function (item) {
            angular.forEach($scope.campaignRevisions, function (revision) {
              if (item.entry_id == revision.entry_id) {
                requestQueue.push(deleteRevisionById(revision.entry_id, revision.entry_revision_id));
              }
            });
            if ($scope.isTransaction) {
              requestQueue.push(Restangular.one("campaign", $scope.cid).one("pledge", item.backer[0].entry_backer_id).customDELETE());
            } else {
              requestQueue.push(Restangular.one('campaign', item.id).customDELETE());
            }
          });

          $q.all(requestQueue).then(function () {
            $scope.loadCampaignRevisions();
            if ($scope.isTransaction) {
              if (requestQueue.length == 1) {
                msg = {
                  'header': 'tab_campaign_transaction_has_benn_deleted_single',
                }
              } else {
                msg = {
                  'header': 'tab_campaign_transaction_has_benn_deleted_plural',
                }
              }
              // Refresh transaction data
              $scope.showdetail(detailTransactionData.cindex, detailTransactionData.cname, detailTransactionData.cstatus);
            } else {
              msg = {
                'header': 'tab_campaign_selected_deleted_success',
              }
              // Refresh campaign data
              updateCampaignListing($scope.sortOrFiltersCampaign);
              $scope.getFeaturedCampaigns();
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          },
            function (failure) {
              msg = {
                'header': failure.data.message,
              }
              $rootScope.floatingMessage = msg;
              $scope.hideFloatingMessage();
            });
        },
      }).modal('show');
    }
  }

  $scope.reviewCampaign = function (campaign, e) {
    var data = {
      entry_status_id: 12,
    };
    Restangular.one('campaign', campaign.entry_id.toString()).customPUT(data).then(
      function (success) {
        for (var i = 0; i < $scope.campaigns.length; i++) {
          if ($scope.campaigns[i].entry_id == success.entry_id) {
            $scope.campaigns[i] = success;
            break;
          }
        }
      },
      function (failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }
    )
    window.open('/campaign-review/' + campaign.entry_id);
  }

  $scope.updateCampaignStatus = function (campaign, status) {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    campaign.entry_status_id = status.entry_status_id;
    campaign.entry_status = status.name;
    campaign_status = {
      entry_status_id: campaign.entry_status_id
    };
    Restangular.one('campaign/' + campaign.entry_id.toString()).customPUT(campaign_status).then(function (success) {
      $translate(['Campaign', 'updated']).then(function (value) {
        $scope.c = value.Campaign;
        $scope.update = value.updated
        msg = {
          'header': $scope.c + " " + campaign.name + " " + $scope.update,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        /*$scope.getFeaturedCampaigns();
        updateCampaignListing();*/
        $scope.syncCampaignandFeatured(campaign.entry_id, "entry_status_id", status.entry_status_id);
      });

    }, function (failure) {

      msg = {
        'header': failure.data.message,
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }

  function ISOtoPostgres(data) {
    if (!angular.isUndefined(data)) {
      if (typeof data !== 'string')
        data = data.toISOString();
      return data.slice(8, 25).replace('T', ' ');
    }
  }

  Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var h = this.getHours().toString();
    var m = this.getMinutes().toString();
    var s = this.getSeconds().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]) + " " + (h[1] ? h : "0" + h[0]) + ":" + (m[1] ? m : "0" + m[0]) + ":" + (s[1] ? s : "0" + s[0]); // padding
  };

  // change end of campaigns to current time
  $scope.endCampaignTest = function () {
    $scope.clearMessage();
    var campaignQueue = getSelectedItems(),
      requestQueue = [];
    if (campaignQueue.length === 0) {
      msg = {
        'header': "tab_campaigns_select_error",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    } else {
      angular.forEach(campaignQueue, function (campaign) {
        var id = campaign.entry_id,
          currentdate = new Date(),
          tmp = new Date(Date.parse(currentdate)),
          ret = tmp.yyyymmdd(),
          tmp1 = new Date(Date.parse(currentdate));
        tmp1.setDate(tmp1.getDate() - 7);

        var ret1 = tmp1.yyyymmdd();
        data = {
          ends: ret1,
          pledge_processing_started: ret1,
          // entry_status_id: 5,
        };

        requestQueue.push(Restangular.one('campaign', campaign.id).customPUT(data).then(function (success) {
          campaign = success;
          $scope.syncCampaignandFeatured(campaign.id, "ends", ret1);
        }));
      });

      $q.all(requestQueue).then(function () {
        msg = {
          'header': 'tab_campaigns_campaign_ended',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }, function (failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
  }

  // auto set the current date/time as end date/time and change status to capture complete
  $scope.endCampaign = function () {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var campaignQueue = getSelectedItems(),
      requestQueue = [];
    if (campaignQueue.length === 0) {
      msg = {
        'header': "tab_campaigns_select_error",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    } else {
      angular.forEach(campaignQueue, function (campaign) {
        var id = campaign.entry_id,

          currentdate = new Date(),
          tmp1 = new Date(Date.parse(currentdate));
        tmp1.setDate(tmp1.getDate());

        var ret1 = tmp1.yyyymmdd();
        data = {
          ends: ret1,
          time_remaining: "00:00:00",
          days_remaining: 0,
          hours_remaining: 0,
          minutes_remaining: 0,
          seconds_remaining: 0,
          days_remaining_inclusive: 0,
          hours_remaining_inclusive: 0,
          minutes_remaining_inclusive: 0,
          seconds_remaining_inclusive: 0,
        };
        requestQueue.push(Restangular.one('campaign', campaign.id).customPUT(data).then(function (success) {
          campaign = success;
          $scope.syncCampaignandFeatured(campaign.id, "ends", ret1);
        }));
      });

      $q.all(requestQueue).then(function () {
        msg = {
          'header': 'tab_campaigns_campaign_ended',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        // Refresh campaign data
        //updateCampaignListing($scope.sortOrFiltersCampaign);
      }, function (failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
  }
  ///
  $scope.customEntryPerPage = function (number) {
    $scope.sortOrFiltersCampaign.page_entries = number;
    updateCampaignListing($scope.sortOrFiltersCampaign);
  }

  //==========================================================================
  //to update campaign display priority by dragging across pages
  //===========================================================================
  var tmpList = [];

  for (var i = 1; i <= 6; i++) {
    tmpList.push({
      text: 'Item ' + i,
      value: i
    });
  }

  $scope.list = tmpList;


  $scope.duringSort = 0;
  $scope.showDropBlock = true;

  $scope.campaignSortOptions = {
    placeholder: "campaign-sortable-item",
    connectWith: '.campaign-sortable',
    start: function (e, ui) {
      $scope.duringSort = 1;
    },
    update: function (event, ui) {
      /*      $scope.duringSort = 0;
            mousex = event.pageX;
            mousey = event.pageY;
            var block = $('.campaign-buffer-block');
            var lefttop = block.offset();
            var coor = {
              dom: block,
              left: lefttop.left,
              top: lefttop.top,
              right: lefttop.left + block.width(),
              bottom: lefttop.top + block.height()
            }
            var insert = 0;*/

      ///////////////calculate priority/////////////////////
      /*      if (insert == 0) {
              if (ui.item.sortable.droptarget && ui.item.sortable.droptarget.hasClass('campaign-buffer')) {

              } else if (ui.item.sortable.droptarget && ui.item.sortable.droptarget.hasClass('campaign-list')) {
                var index = ui.item.sortable.index;
                var dropIndex = ui.item.sortable.dropindex;
                var id = $scope.campaigns[index].id;
                if (dropIndex == 0) {
                  var dp = $scope.campaigns[dropIndex].display_priority;
                  $scope.campaigns[index].display_priority = dp + 1;
                } else if (index == $scope.campaigns.length - 1) {} else {
                  var gap = 1;
                  var limit = 0.000001;
                  var pre = $scope.campaigns[dropIndex - 1].display_priority;
                  var next = $scope.campaigns[dropIndex].display_priority;
                  while (gap > limit) {
                    if (pre > next + gap) {
                      $scope.campaigns[index].display_priority = next + gap;
                      break;
                    }
                    gap = gap / 10;
                  }
                }
                Restangular.one('campaign').one(id.toString()).customPUT($scope.campaigns[index]);
              }
            }*/
    },
    stop: function (event, ui) {
      // REORDER FEATURES CAMPAIGNS
      for (var i = 0; i < $scope.campaign_buffer.length; i++) {
        $scope.campaign_buffer[i].display_priority = 4 - i;
        Restangular.one('campaign', $scope.campaign_buffer[i].entry_id).customPUT($scope.campaign_buffer[i]);
      }
    }
  }


  $scope.getTime = function (campaign) {
    $scope.timeStatusObj = TimeStatusService.getTimeStatus(campaign);
    campaign.timeStatNum = $scope.timeStatusObj.timeStatusNumber;
    campaign.timeStatText = $scope.timeStatusObj.timeStatusText;

    if (campaign.ends == null) {
      campaign.timeStatNum = "";
      $translate(['tab_campaign_campaign_continuous']).then(function (value) {
        campaign.timeStatText = value.tab_campaign_campaign_continuous;
      });
    }

  }

  // These are the required shipping variables for alternative layout and native_lookup
  function setShippingVar() {
    $scope.alt_shipping = $scope.portal_settings.site_theme_alt_shipping_layout;
    $scope.native_lookup = $scope.portal_settings.site_theme_shipping_native_lookup;
    if ($scope.native_lookup) {
      $scope.portal_settings.site_theme_default_shipping_country.name = $scope.portal_settings.site_theme_default_shipping_country.native_name;
    }
    $scope.default_country = $scope.portal_settings.site_theme_default_shipping_country;
    $scope.selectedCountry.selected = $scope.portal_settings.site_theme_default_shipping_country;
    $scope.setCountry($scope.selectedCountry.selected);
    if ($scope.selectedCountry.selected != null && Object.getOwnPropertyNames($scope.selectedCountry.selected).length) {
      getSubcountries($scope.selectedCountry.selected.id);
    }
    // Check alternative shipping setting
    if ($scope.alt_shipping) {
      getCountries();
    }
  }

  $scope.setCountry = function (country) {
    $scope.selectedCountry.selected = country;
  }

  function getCountries() {
    Geolocator.getCountries().then(function (countries) {
      if ($scope.native_lookup) {
        for (var i in countries) {
          if (countries[i].native_name != null) {
            countries[i].name = countries[i].native_name;
          }
        }
      }
      $scope.countries = countries;
      // Check if there is default country, if so, we put it at first index and remove the one originally in the array
      if ($scope.default_country) {
        for (var index in $scope.countries) {
          var value = $scope.countries[index];
          if (value.id == $scope.default_country.id) {
            // This line is to change output language of default_country according to native_lookup setting
            $scope.default_country = value;
            $scope.countries.splice(index, 1);
            break;
          }
        }
        $scope.countries.splice(0, 0, $scope.default_country);
      }
    });
  }

  function getSubcountries(countryID) {
    Geolocator.getSubcountriesByCountry(countryID).then(function (subcountries) {
      // Check which language to show
      if ($scope.native_lookup) {
        for (var i in subcountries) {
          if (subcountries[i].native_name != null) {
            subcountries[i].name = subcountries[i].native_name;
          }
        }
      }
      $scope.subcountries = subcountries;
    });
  }

  function clearAddress() {
    $scope.selectedCity.selected = undefined;
    $scope.selectedSubcountry.selected = undefined;
    $scope.selectedCountry.selected = $scope.portal_settings.site_theme_default_shipping_country;
    $scope.shipOptions = [];
    $scope.user.postal_code = "";
    $scope.user.street1 = "";
    $scope.user.street2 = "";
  }

  $scope.deleteTransaction = function () {
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var reqArr = [];
    var arrCheckBox = $(".transactions-table-body").find(".ui.checkbox");
    var deleteSelectReward = false;
    $.each(arrCheckBox, function (index, value) {
      if ($(value).hasClass("checked")) {
        deleteSelectReward = true;
        var campaignId = $scope.transaction_detail[index].backer[0].entry_id;
        var req = Restangular.one("campaign", campaignId).customDELETE("pledge/" + $scope.transaction_detail[index].backer[0].entry_backer_id);
        reqArr.push(req);
      }
    });
    $q.all(reqArr).then(function (success) {
      $scope.showdetail($scope.cindex, $scope.cname, $scope.cstatus, $scope.ccurrency, $scope.total_backers, $scope.backer_offset);
      msg = {
        header: 'tab_campaigns_transactions_deleted_success'
      }

      $rootScope.floatingMessage = msg;

      $scope.hideFloatingMessage();
    });
    if (!deleteSelectReward) {
      msg = {
        'header': "tab_campaigns_select_error",
      }

      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }
  }

  $scope.editTransaction = function (transaction) {
    var backer = transaction.backer[0];
    transaction.editing = transaction.editing == undefined ? false : transaction.editing;
    if (transaction.editing) {
      var param = {
        "amount": backer.amount
      }
      Restangular.one("campaign", backer.entry_id).one("pledge", backer.entry_backer_id).customPUT(param)
        .then(function (success) {
          transaction = success;
        });
    }
    transaction.editing = !transaction.editing;
  }

  $scope.editTipTransaction = function (transaction) {
    var backer = transaction.backer[0];
    transaction.tipEditing = transaction.tipEditing == undefined ? false : transaction.tipEditing;
    if (transaction.tipEditing) {
      var param = {
        "amount": backer.amount,
        "amount_tip": backer.amount_tip
      }
      Restangular.one("campaign", backer.entry_id).one("pledge", backer.entry_backer_id).customPUT(param)
        .then(function (success) {
          transaction = success;
        });
    }
    transaction.tipEditing = !transaction.tipEditing;
  }

  // watching variable changes
  $scope.$watch('selectedCity.selected', function (value, oldValue) {
    if (value != oldValue && value) {
      cityID = Geolocator.lookupCityID(value.name);

      if (cityID) {
        $scope.user.city_id = cityID;
      }
      countryID = Geolocator.lookupCountryID(value.name);
      if (countryID) {
        $scope.user.country_id = countryID;
      }
    }
  });

  $scope.$watch("selectedCountry.selected", function (value, oldValue) {
    if (value != oldValue && value) {
      $scope.selectedCity.selected = undefined;
      $scope.selectedSubcountry.selected = undefined;
      getSubcountries(value.id);
    }
  });
  //Show Modal for backers offset
  $scope.updateBackerOffset = function () {
    $('.small.backer-offset-modal.modal').modal({
      onHide: function () { },
      onShow: function () { },
      onApprove: function () {
        var data = {
          backer_offset: $scope.backer_offset
        }
        Restangular.one('campaign', $scope.cid).customPUT(data).then(function (success) {
          $scope.backer_offset = success.backer_offset;
        })
      }
    }).modal('show');
  }

  // Toggle view for campaign revisions
  $scope.toggleCampaignRevisionsView = function () {
    $scope.isCampaignRevisionsView = !$scope.isCampaignRevisionsView;
  }


  // Select individual campaign revision
  $scope.selectRevisionItem = function (event, revisionData) {
    $scope.selectedRevisions.push(revisionData);
  }

  // Delete all the selected revision
  $scope.deleteSelectedRevision = function () {
    var requestQueue = [];

    for (var i = 0; i < $scope.selectedRevisions.length; i++) {
      var tempCampaignId = $scope.selectedRevisions[i].entry_id;
      Restangular.one('campaign', $scope.selectedRevisions[i].entry_id).one('resource-revision/file/').customGET().then(function (success) {
        if (success.length) {
          var campaignImages = [];
          var campaignHeaderImages = [];
          for (var i = 0; i < success.length; i++) {
            if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.thumbnail) {
              campaignImages.push(success[i]);
            }
            if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.top_header) {
              campaignHeaderImages.push(success[i]);
            }
          }
          if (campaignImages.length != 0 && campaignImages[0].entry_file_revision_id) {
            Restangular.one('campaign', tempCampaignId).one('resource-revision/file').customDELETE(campaignImages[0].id);
          }
          if (campaignHeaderImages.length != 0 && campaignHeaderImages[0].entry_file_revision_id) {
            Restangular.one('campaign', tempCampaignId).one('resource-revision/file').customDELETE(campaignHeaderImages[0].id);
          }
        }
      });
      Restangular.one('campaign', $scope.selectedRevisions[i].entry_id).one('faq-revision').getList().then(function (success) {
        if (success.length) {
          if (success[0].faq_revision_id) {
            Restangular.one('campaign', tempCampaignId).one('faq-revision').customDELETE(success[0].faq_revision_id);
          }
        }
      });
      requestQueue.push(Restangular.one('campaign', $scope.selectedRevisions[i].entry_id).one('setting-revision/bio_enable').customDELETE());
      requestQueue.push(deleteRevisionById($scope.selectedRevisions[i].entry_id, $scope.selectedRevisions[i].entry_revision_id));
    }
    $q.all(requestQueue).then(function () {
      $scope.loadCampaignRevisions();
      msg = {
        'header': 'tab_campaigns_revision_delete_successful',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }, function (failed) {
      msg = {
        'header': failed.data.message,
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });

  }

  function deleteRevisionById(entry_id, entry_revision_id) {
    return Restangular.one('campaign', entry_id).customDELETE('revision/' + entry_revision_id);
  }

  // Delete all the revisions
  $scope.deleteAllRevisions = function () {
    var requestQueue = [];

    for (var i = 0; i < $scope.campaignRevisions.length; i++) {
      var tempCampaignId = $scope.campaignRevisions[i].entry_id;
      Restangular.one('campaign', $scope.campaignRevisions[i].entry_id).one('resource-revision/file/').customGET().then(function (success) {
        if (success.length) {
          var campaignImages = [];
          var campaignHeaderImages = [];
          for (var i = 0; i < success.length; i++) {
            if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.thumbnail) {
              campaignImages.push(success[i]);
            }
            if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.top_header) {
              campaignHeaderImages.push(success[i]);
            }
          }
          if (campaignImages.length != 0 && campaignImages[0].entry_file_revision_id) {
            Restangular.one('campaign', tempCampaignId).one('resource-revision/file').customDELETE(campaignImages[0].id);
          }
          if (campaignHeaderImages.length != 0 && campaignHeaderImages[0].entry_file_revision_id) {
            Restangular.one('campaign', tempCampaignId).one('resource-revision/file').customDELETE(campaignHeaderImages[0].id);
          }
        }
      });
      Restangular.one('campaign', $scope.campaignRevisions[i].entry_id).one('faq-revision').getList().then(function (success) {
        if (success.length) {
          if (success[0].faq_revision_id) {
            Restangular.one('campaign', tempCampaignId).one('faq-revision').customDELETE(success[0].faq_revision_id);
          }
        }
      });
      requestQueue.push(Restangular.one('campaign', $scope.campaignRevisions[i].entry_id).one('setting-revision/bio_enable').customDELETE());
      requestQueue.push(deleteRevisionById($scope.campaignRevisions[i].entry_id, $scope.campaignRevisions[i].entry_revision_id));
    }

    $q.all(requestQueue).then(function () {
      $scope.loadCampaignRevisions();
      msg = {
        'header': 'tab_campaigns_revision_delete_successful',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }, function (failed) {
      msg = {
        'header': failed.data.message,
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }



});

app.filter('dateconv', function ($filter) {
  return function (input) {
    if (input == null) {
      return "";
    }

    //var _date = $filter('date')(new Date(input), 'MMM dd yyyy');
    var year = input.substring(0, 4);
    var month = input.substring(5, 7);
    var day = input.substring(8, 10);
    var hr = input.substring(11, 13);
    var min = input.substring(14, 16);

    // do a pure convertion
    var d = year + "-" + month + "-" + day;
    return d;
  };
});
