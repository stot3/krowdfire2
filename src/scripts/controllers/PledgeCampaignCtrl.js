app.controller('PledgeCampaignCtrl', function(
  $q,
  $location,
  $rootScope,
  $scope,
  $filter,
  UserService,
  StripeService,
  PaypalService,
  PledgeService,
  $translate,
  $routeParams,
  Restangular,
  Geolocator,
  RESOURCE_REGIONS,
  PortalSettingsService,
  $sce,
  $timeout,
  PHONE_TYPE,
  SOCIAL_SHARING_OPTIONS
) {

  var msg;

  getPhoneNumber(paramID);

  $scope.pledgeReplace = false;
  $scope.rewardsQueue = [];
  var attr_array = [];

  var businessData = {
    business_id: null,
    phone_id: null,
    address_id: null
  };

  $scope.organization_name = {};

  $scope.selectedContributionAnon = {};
  $scope.totalAmountPlusTip = 0;
  $scope.user = UserService;
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  $scope.campaign_loc = $rootScope.currentLoc;
  $scope.pledgeLevel = $routeParams.plid;
  $scope.allow_max = false;
  $scope.pledgeAmount = parseInt($routeParams.m);
  $scope.directContribution = ($scope.pledgeAmount) ? true : false;
  $scope.campaign_id = $routeParams.eid;
  // grab rewards variation choice if set
  if ($routeParams.attr) {
    $scope.selectedRewardAttrs = $routeParams.attr;
  }
  $scope.selectedCity = {};
  $scope.selectedSubcountry = {};
  $scope.selectedCountry = {};

  $scope.charity = {};
  if ($rootScope.charity) {
    $scope.charity = $rootScope.charity;
    $rootScope.charity = {};
  }

  console.log($scope.user);

  $scope.chosenPhoneNumberId = "";
  $scope.failed_submit = false;
  $scope.phoneInfo = {
    number: '',
    phone_number_type_id: '',
    business_organization_id: '',
    person_id: ''
  }

  $scope.newNumberCreated = {
    number: '',
    phonetype: ''
  }

  $scope.selectedReward = null;

  $scope.contributionMessage = '';
  if ($rootScope.contributionMessage) {
    $scope.contributionMessage = $rootScope.contributionMessage;
    $rootScope.contributionMessage = {};
  }
  $scope.stripeExtraDetails = {
    address_city: '',
    address_country: '',
    address_line1: '',
    name: ''
  };

  // set toggle object
  $scope.toggle = {
    newCard: false,
    newAddress: false,
    newNumber: false,
    selectedCard: false,
    selectedAddress: false,
    selectedNumber: false,
    newCompany: false
  };
  // contribution types
  $scope.contribution = [{
    name: 'contribution_type_regular',
    type: 1
  }, {
    name: 'contribution_type_partiallyanon',
    type: 3
  }, {
    name: 'contribution_type_fullyanon',
    type: 2
  }];
  $scope.cardselected = "Visa";
  $scope.cardtype = [{
    name: 'Visa',
    id: 1
  }, {
    name: 'American Express',
    id: 2
  }, {
    name: 'Master Card',
    id: 3
  }, {
    name: 'Discover',
    id: 4
  }];

  $scope.selectedAccountType = 'Individual';
  $scope.businessSelected = {
    name: '',
    email: ''
  };
  var phonetype = PHONE_TYPE;
  // Translate phone type, even on refresh
  var trans_array = [];
  angular.forEach(PHONE_TYPE, function(value) {
    trans_array.push(value.name);
  });

  $translate(trans_array).then(function(translation) {
    angular.forEach(translation, function(value, key) {
      for (var i = 0; i < phonetype.length; i++) {
        if (phonetype[i].name == key) {
          phonetype[i].name = value;
        }
      }
    });
    $scope.phonetype = phonetype;
  });

  $scope.campaignFundingGoal = {
    "value": $scope.pledgeAmount
  };

  $scope.lowestAmount;
  $scope.tipInfo;
  $scope.requiresShipping = false;
  $scope.pledgeReplaceShippingFound = false;
  
  $scope.pledgeReplacement = function() {
    if ($routeParams.r != null) {
      var plid_index, reward_id;
      $scope.campaign_id = $routeParams.eid;
      $scope.rewards = [];
      $scope.pledgeReplace = true;
      $scope.replaceId = $routeParams.r;
      $scope.pledgeAmount = parseInt($routeParams.m);
      $scope.totalReplacedCost = 0;
      $scope.totalReplacedCost = ($scope.pledgeAmount) ? $scope.pledgeAmount : 0;
      angular.forEach($routeParams, function(value, key, obj) {
        if ((plid_index = key.indexOf('plid')) != -1) {
          reward_id = value;
          $scope.rewards.push({
            plid: reward_id
          });
        }
        var searchString = reward_id + '_quantity';

        if ($scope.rewards.length && key.indexOf(reward_id + '_quantity') != -1) {
          for (var i = 0; i < $scope.rewards.length; i++) {
            if ($scope.rewards[i].plid == reward_id) {
              $scope.rewards[i].quantity = value;
            }
          }
        }
        if ($scope.rewards.length && key.indexOf(reward_id + '_amount') != -1) {
          for (var i = 0; i < $scope.rewards.length; i++) {
            if ($scope.rewards[i].plid == reward_id) {
              $scope.rewards[i].amount = value;
            }
          }
        }
        var attr_index;
        if ($scope.rewards.length && (attr_index = key.indexOf(reward_id + '_attr')) != -1) {
          for (var i = 0; i < $scope.rewards.length; i++) {
            if ($scope.rewards[i].plid == reward_id) {
              if (!$scope.rewards[i].attr) {
                $scope.rewards[i].attr = [];
              }
              $scope.rewards[i].attr.push(value);
            }
          }
        }
      });
      angular.forEach($scope.rewards, function(value) {
        //NEED TO GET PLEDGES
        Restangular.one('campaign', $scope.campaign_id).one('pledge-level', value.plid).get().then(function(success) {
          var selectedReward = success;
          selectedReward.quantity = value.quantity;
          selectedReward.attr = value.attr;
          if (selectedReward.shipping) {
            $scope.requiresShipping = true;
          }
          $scope.totalReplacedCost += (parseFloat(selectedReward.amount) * parseInt(selectedReward.quantity));
          $scope.rewardsQueue.push(selectedReward);
        });
      });
    }
  }

  $scope.pledgeReplacement();

  $scope.tip = { value: null, dollar_amount: 0, type: 'Dollar', name: '' };
  $scope.tipTypeError = false;


  var portal_settings;
  // load portal settings
  PortalSettingsService.getSettingsObj().then(function(success) {
    portal_settings = success.public_setting;
    $scope.allowDecimalNotation = portal_settings.site_campaign_decimal_option;
    $scope.reward_html_editor = success.public_setting.site_theme_campaign_reward_html_editor;
    $scope.contributionTypeRadio = portal_settings.site_theme_campaign_contribution_type_radio;
    $scope.enableRewardVariation = portal_settings.site_theme_campaign_show_reward_enable_variation;
    $scope.charity_percentage_fee = portal_settings.site_campaign_charity_helper_percentage;
    $scope.anonymousContributionTypeOnly = portal_settings.site_campaign_anonymous_contribution_type_only;
    $scope.isEnableContributionMessage = portal_settings.site_campaign_allow_contribution_message;
    $scope.isContributionLayout1 = portal_settings.site_campaign_contribution_layout_toggle_1;
    $scope.site_stripe_tokenization_settings = portal_settings.site_stripe_tokenization;
    $scope.site_campaign_alt_city_input_toggle = portal_settings.site_campaign_alt_city_input_toggle;
    $scope.selectedTipCurrency = portal_settings.site_tip_currency;
    $scope.acceptExtraPledgeData = portal_settings.site_campaign_profile_data_on_pledge;
    $scope.tippingOptions = portal_settings.site_tipping;
    $scope.displayCampaignDisclaimer = success.public_setting.site_campaign_campaign_toggle_disclaimer_text;
    $scope.forceAnonymousPledge = portal_settings.site_campaign_always_anonymous_contribution;
    $scope.combineTip = portal_settings.site_campaign_combine_amount_tip;
    $scope.site_campaign_fee_direct_transaction = portal_settings.site_campaign_fee_direct_transaction;
    $scope.stripe_standard_mode = portal_settings.stripe_standard_mode;

    if (typeof $scope.tippingOptions === 'undefined' || $scope.tippingOptions == null) {
      $scope.tippingOptions = { toggle: false };
    }

    //Defined and Turned on
    if ($scope.tippingOptions.hasOwnProperty('toggle') && $scope.tippingOptions.toggle) {
      setUpTipping();
    }

    if ($scope.anonymousContributionTypeOnly) {
      $scope.selecteContribution = false;
    } else {
      $scope.selecteContribution = "contribution_type_regular";
    }


    setShippingVar();
    if (portal_settings.site_campaign_always_anonymous_contribution) {
      $scope.contribution = $scope.contribution.slice($scope.contribution.length - 1);
      $scope.anonymous_contribution = 1;
      $scope.partial_anonymous_contribution = 0;
    }

    if (typeof $scope.acceptExtraPledgeData == 'undefined' || !$scope.acceptExtraPledgeData) {
      $scope.acceptExtraPledgeData = false;
    }

    if (typeof success.public_setting.site_campaign_pledge_redirect == 'undefined' || !success.public_setting.site_campaign_pledge_redirect) {
      $scope.site_campaign_pledge_redirect = {
        toggle: false,
        url: ''
      };
    } else {
      $scope.site_campaign_pledge_redirect = success.public_setting.site_campaign_pledge_redirect;
    }
  });

  function setUpTipping() {

    Restangular.one('account/stripe/charge-amount').customGET().then(function(success) {
      if (success[0]) {
        $scope.lowestAmount = parseFloat(success[0].minimum_charge_amount);
        if ($scope.selectedTipCurrency) {
          $scope.tipInfo = $scope.selectedTipCurrency;
        } else {
          $scope.tipInfo = success[0];
        }
      } else {
        $scope.lowestAmount = 0.5;
        if ($scope.campaign) {
          if ($scope.selectedTipCurrency) {
            $scope.tipInfo = $scope.selectedTipCurrency;
          } else {
            $scope.tipInfo = $scope.campaign.currencies[0];
          }
        }
      }

      if (!$scope.tippingOptions.selectedTipDefault) {
        $scope.tippingOptions.selectedTipDefault = 'tiers';
      }
      if ($scope.tippingOptions.toggle_dynamic && !$scope.tippingOptions.toggle_tiers || $scope.tippingOptions.selectedTipDefault == 'dynamic') {
        $scope.tip = { value: null, dollar_amount: 0, type: 'Dollar', name: '' };
        if ($scope.tippingOptions.toggle_dynamic_min_max && $scope.tippingOptions.dynamic_min) {
          $scope.tip.value = $scope.tippingOptions.dynamic_min;
          $scope.tip.dollar_amount = $scope.tippingOptions.dynamic_min;
        }
        $scope.selectedTipType = 'dynamic';
        $scope.tip = { value: null, dollar_amount: 0, type: 'Dollar' };
        if ($scope.tippingOptions.toggle_dynamic_min_max && $scope.tippingOptions.dynamic_min) {
          $scope.tip.value = $scope.tippingOptions.dynamic_min;
          $scope.tip.dollar_amount = $scope.tippingOptions.dynamic_min;
        }
      } else if ($scope.tippingOptions.toggle_tiers || $scope.tippingOptions.selectedTipDefault == 'tiers') {
        $scope.tip = { value: null, dollar_amount: 0, type: 'Dollar', name: '' };
        if ($scope.tippingOptions.tiers[0]) {
          $scope.updateTierValues();
          var dollarAmount = $scope.tippingOptions.tiers[0].dollar_amount;
          $scope.tip = { value: $scope.tippingOptions.tiers[0].value, dollar_amount: dollarAmount, type: $scope.tippingOptions.tiers[0].type, name: $scope.tippingOptions.tiers[0].name };
        }
        $scope.selectedTipType = 'tiers';
      } else if (!$scope.tippingOptions.toggle_dynamic && !$scope.tippingOptions.toggle_tiers && $scope.tippingOptions.toggle_no_tip) {
        $scope.selectedTipType = 'no_tip';
        $scope.tip = { value: null, dollar_amount: 0, type: 'Dollar' };
      }

      if ($scope.tippingOptions.toggle_no_tip && $scope.tippingOptions.selectedTipDefault == 'no_tip') {
        $scope.selectedTipType = 'no_tip';
        $scope.tip = { value: null, dollar_amount: 0, type: 'Dollar' };
      }

      //tip params
      if ($routeParams.tiptype) {
        $scope.selectedTipType = $routeParams.tiptype;
        if ($scope.selectedTipType == 'no_tip') {
          $scope.tip = { value: null, dollar_amount: 0, type: 'Dollar' };
        } else if ($scope.selectedTipType == 'tiers') {
          $scope.tiersIndex = 0;
          if ($routeParams.tipindex) {
            $scope.tiersIndex = $routeParams.tipindex;
          }
          if ($scope.tippingOptions.tiers[$scope.tiersIndex]) {
            $scope.updateTierValues();
            var dollarAmount = $scope.tippingOptions.tiers[$scope.tiersIndex].dollar_amount;
            $scope.tip = { value: $scope.tippingOptions.tiers[$scope.tiersIndex].value, dollar_amount: dollarAmount, type: $scope.tippingOptions.tiers[$scope.tiersIndex].type, name: $scope.tippingOptions.tiers[$scope.tiersIndex].name };
          }
        } else if ($scope.selectedTipType == 'dynamic') {
          $scope.initialDynamicTip = 0;
          if ($scope.tippingOptions.toggle_dynamic_min_max && $scope.tippingOptions.dynamic_min) {
            $scope.initialDynamicTip = $scope.tippingOptions.dynamic_min;
          }
          $scope.tip = { value: $scope.initialDynamicTip, dollar_amount: $scope.initialDynamicTip, type: 'Dollar', name: '' };
          if ($routeParams.tipvalue) {
            $scope.tip = { value: $routeParams.tipvalue, dollar_amount: $routeParams.tipvalue, type: 'Dollar', name: '' };
            $scope.tipValueInt = parseInt($routeParams.tipvalue);
            if ($scope.tippingOptions.toggle_dynamic_min_max) {
              if ($scope.tippingOptions.dynamic_min && ($scope.tipValueInt < $scope.tippingOptions.dynamic_min)) {
                $scope.tip.value = $scope.tippingOptions.dynamic_min;
                $scope.tip.dollar_amount = $scope.tippingOptions.dynamic_min;
              } else if ($scope.tippingOptions.dynamic_max && ($scope.tipValueInt > $scope.tippingOptions.dynamic_max)) {
                $scope.tip.value = $scope.tippingOptions.dynamic_max;
                $scope.tip.dollar_amount = $scope.tippingOptions.dynamic_max;
              }
            }
          }
        }
      }

      if (typeof $scope.tippingOptions !== 'undefined') {
        if ($scope.tippingOptions.hasOwnProperty('tiers') && $scope.tippingOptions.tiers.length) {
          $scope.tipTiersDefaultName = $scope.tippingOptions.tiers[0].name;
          $scope.tipTiersDefaultAmount = $scope.tippingOptions.tiers[0].dollar_amount;
          if ($routeParams.tipindex) {
            $scope.tipTiersDefaultName = $scope.tippingOptions.tiers[$routeParams.tipindex].name;
            $scope.tipTiersDefaultAmount = $scope.tippingOptions.tiers[$routeParams.tipindex].dollar_amount;
          }
        }
      }

    });


  }

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

  // These are the required shipping variables for alternative layout and native_lookup
  function setShippingVar() {
    $scope.alt_shipping = portal_settings.site_theme_alt_shipping_layout;
    $scope.native_lookup = portal_settings.site_theme_shipping_native_lookup;
    if ($scope.native_lookup) {
      portal_settings.site_theme_default_shipping_country.name = portal_settings.site_theme_default_shipping_country.native_name;
    }
    $scope.default_country = portal_settings.site_theme_default_shipping_country;
    if (portal_settings.site_theme_default_shipping_country != null) {
      if (portal_settings.site_theme_default_shipping_country.name) {
        $scope.selectedCountry.selected = portal_settings.site_theme_default_shipping_country;
      }
    }
    $scope.setCountry($scope.selectedCountry.selected);
    if ($scope.selectedCountry.selected != null && Object.getOwnPropertyNames($scope.selectedCountry.selected).length) {
      getSubcountries($scope.selectedCountry.selected.id);
    }
    // Check alternative shipping setting
    if ($scope.alt_shipping) {
      if ($scope.selectedReward && $scope.selectedReward.shipping) {
        getCountries().then(function(countries) {
          var newCountries = [];
          var worldShippingExist = false;
          var countryShippingList = [];
          angular.forEach($scope.selectedReward.shipping, function(value, key) {
            if (value.shipping_option_type_id == 1 || value.shipping_option_type_id == 3) {
              worldShippingExist = true;
            }
            if (value.shipping_option_type_id == 2) {
              countryShippingList.push(value);
            }
          });
          // If world shipping does not exist,then get new shipping list
          if (!worldShippingExist) {
            angular.forEach(countryShippingList, function(item, key) {
              angular.forEach(countries, function(country, key) {
                if (item.country_id == country.id) {
                  newCountries.push(country);
                }
              });
            });
            $scope.countries = newCountries;
          }
        });
      } else {
        getCountries();
      }
    }
  }

  function getSettings() {
    $('i').popup();
    Restangular.one('portal/setting').getList().then(
      function(success) {
        $scope.public_settings = {};
        $scope.private_settings = {};
        angular.forEach(success, function(value) {
          if (value.setting_type_id == 3) {
            $scope.public_settings[value.name] = value.value;
            $scope.payment_gateway = $scope.public_settings.site_payment_gateway;

            if ($scope.public_settings.site_theme_campaign_min_contribute_amount) {
              $scope.public_settings.site_theme_campaign_min_contribute_amount = parseInt($scope.public_settings.site_theme_campaign_min_contribute_amount);
              $scope.pledgeAmount = parseInt($scope.pledgeAmount);
              // if ($scope.pledgeAmount < $scope.public_settings.site_theme_campaign_min_contribute_amount) {
              //   $scope.pledgeAmount = $scope.public_settings.site_theme_campaign_min_contribute_amount;
              //   $scope.campaignFundingGoal.value = $scope.public_settings.site_theme_campaign_min_contribute_amount;
              //   $scope.pledgeAmount = $scope.public_settings.site_theme_campaign_min_contribute_amount;
              // }
            }
            switch ($scope.public_settings.site_campaign_sharing_options) {
              case SOCIAL_SHARING_OPTIONS.sharing_users:
                $scope.is_sharing_available = true;
                break;
              case SOCIAL_SHARING_OPTIONS.sharing_backers:
                $scope.is_sharing_available = false;
                if ($scope.campaign.managers[0].id == $scope.user.id || $scope.user.person_type_id == 1) {
                  $scope.is_sharing_available = true;
                }
                break;
              case SOCIAL_SHARING_OPTIONS.sharing_disabled:
                $scope.is_sharing_available = false;
                break;
              default:
                $scope.is_sharing_available = true;
            }
          }
        });

        if (typeof $scope.site_stripe_tokenization_settings === 'undefined' || $scope.site_stripe_tokenization_settings == null) {
          $scope.site_stripe_tokenization_settings = {
            public_stripe_key: '',
            toggle: false
          };
        } else {
          getStripeExtraDetails();
        }
        // maximum amount pledge
        $scope.max_amoumt = parseInt($scope.public_settings.site_theme_campaign_max_contribute_amount);
        if ($scope.public_settings.site_theme_campaign_max_pledge_enabled) {
          if (typeof $scope.pledgeLevel === 'undefined') {
            $scope.allow_max = true;
          }
        }
        if (typeof $scope.public_settings.site_theme_campaign_per_min != 'undefined' && $scope.public_settings.site_theme_campaign_per_min) {
          if (typeof $scope.campaign.min_contribution != 'undefined') {
            $scope.public_settings.site_theme_campaign_min_contribute_amount = parseFloat($scope.campaign.min_contribution);
            $scope.pledgeAmount = parseFloat($scope.pledgeAmount);
            if ($scope.pledgeAmount < $scope.public_settings.site_theme_campaign_min_contribute_amount) {
              $scope.pledgeAmount = $scope.public_settings.site_theme_campaign_min_contribute_amount;
              $scope.campaignFundingGoal = {
                "value": $scope.pledgeAmount
              };
            }
          }
        }
        if (typeof $scope.public_settings.site_theme_campaign_per_max != 'undefined' && $scope.public_settings.site_theme_campaign_per_max) {
          if (typeof $scope.campaign.max_contribution != 'undefined') {
            $scope.max_amoumt = parseFloat($scope.campaign.max_contribution);
            $scope.allow_max = true;
          }
        }
        if (typeof $scope.public_settings.site_tos_contribution_ui == 'undefined') {
          $scope.contrib = true;
        } else {

          $scope.contrib = $scope.public_settings.site_tos_contribution_ui;

        }

        if ($scope.public_settings.site_campaign_charity_helper_alternate_form) {
          getCountries();
        }

        $scope.$emit('settings_loaded');
      },
      function(failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
      }
    );
  }

  // Check card type when card number changes
  $scope.checkCardType = function() {
    var cardNumber = $scope.creditCard.number;
    var isCardValid = $.payment.validateCardNumber(cardNumber);
    var cardType = $.payment.cardType(cardNumber);

    var $card = $("input.creditCardNumber");

    switch (cardType) {
      case "visa":
        $card.css("background", "#fff url(images/cards/Visa.png) no-repeat right 10px center");
        break;
      case "mastercard":
        $card.css("background", "#fff url(images/cards/MasterCard.png) no-repeat right 10px center");
        break;
      case "amex":
        $card.css("background", "#fff url(images/cards/American%20Express.png) no-repeat right 10px center");
        break;
      case "dinersclub":
        $card.css("background", "#fff url(images/cards/diners.png) no-repeat right 10px center");
        break;
      case "discover":
        $card.css("background", "#fff url(images/cards/Discover.png) no-repeat right 10px center");
        break;
      case "jcb":
        $card.css("background", "#fff url(images/cards/jcb.png) no-repeat right 10px center");
        break;
      default:
        $card.css("background-image", "none");
    }
  }

  $scope.initStripePayment = function() {
    $("input.creditCardNumber").payment("formatCardNumber");
    $("input.cardCVC").payment("formatCardCVC");
  }

  var count = 0;
  //get the campaign
  Restangular.one('campaign').customGET($scope.campaign_id, {
    use_path_lookup: $routeParams.privatepath ? 1 : 0,
    path: $routeParams.privatepath
  }).then(function(success) {
    $scope.campaign = success;
    $rootScope.campaign_path = $scope.campaign.uri_paths[0].path;
    $rootScope.page_title = $scope.campaign.name ? $scope.campaign.name + ' - Contribution' : 'Contribution';
    $scope.campaign_loc = $scope.campaign.uri_paths[0].path;
    window.b = $scope.campaign_loc;

    angular.forEach($scope.campaign.pledges, function(value, key) {
      if ($scope.pledgeLevel == value.pledge_level_id) {
        $scope.pledgeindex = count;
      }
      count++;
    });
    // Grab Campaign Settings to use
    angular.forEach($scope.campaign.settings, function(value, index) {
      var setting_name = value.name;
      var setting_value = value.value;
      if (setting_name == "name") {
        return;
      }
      $scope.campaign[setting_name] = setting_value;
    });

    getSettings();
    getStripeMode();
    
    $scope.$on('settings_loaded', function(event) { checkInitPaypal(); });

    // Get user attributes
    if (portal_settings.site_campaign_enable_organization_name) {
      Restangular.one('portal/person/attribute?filters={"person_id":"' + $scope.campaign.managers[0].id + '"}').customGET().then(function(success) {
        $scope.organization_name.value = success[0].attributes['organization_name'];
        $scope.organization_name.ein = success[0].attributes['ein'];
      });
    }
    $scope.$emit("loading_finished");
  });

  //get specific pledge level
  if ($scope.pledgeLevel) {
    Restangular.one('campaign', $scope.campaign_id).one('pledge-level', $scope.pledgeLevel).get().then(function(success) {
      $scope.selectedReward = success;

      $scope.rname = $scope.selectedReward.name;
    });
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

  // Check if payment gateway is PayPal and initialize the buttons.
  function checkInitPaypal() {
    if($scope.public_settings.site_payment_gateway == 3 && $scope.public_settings.paypal_publishable_key) {
      PaypalService.init($scope.campaign).then(function(){
        paypal.Buttons({
          style: {
            layout: 'vertical',
            color:  'blue',
            shape:  'rect',
            label:  'paypal'
          },
          createOrder: function(data, actions) {
            var campaign_currency = "USD";
            if($scope.campaign.currencies.length > 0) {
              campaign_currency = $scope.campaign.currencies[0].code_iso4217_alpha;
            }

            var total = parseInt($scope.campaignFundingGoal.value);
            var items = [
              {
                name: "Contribution",
                description: "Contribution towards " + $scope.campaign.name + " campaign", 
                unit_amount: { currency_code: campaign_currency, value: $scope.campaignFundingGoal.value},
                quantity: "1",
                tax: { currency_code: campaign_currency, value: "0.00"},
              },
            ];

            // Calculate discount
            if($scope.currentCoupon) {
              var discount_amount = 0;
              if($scope.currentCoupon.discount_amount > 0) {
                discount_amount = parseInt($scope.currentCoupon.discount_amount);
              }
              if($scope.currentCoupon.discount_percentage) {
                discount_amount = total*$scope.currentCoupon.discount_percentage/100;
              }
            }

            // Add tip
            if($scope.tip.dollar_amount) {
              total += parseInt($scope.tip.dollar_amount);
              items.push(
                {
                  name: "Tip",
                  description: "Platform tip via " + $scope.campaign.name + " campaign",
                  unit_amount: { currency_code: campaign_currency, value: $scope.tip.dollar_amount},
                  quantity: "1",
                  tax: { currency_code: campaign_currency, value: "0.00"},
                }
              );
            }

            var final_total = total;
            // Calculate discount
            if($scope.currentCoupon) {
              final_total -= discount_amount;
            }

            var purchase_units = [
              {
                amount: { currency_code: campaign_currency, value: final_total,
                  breakdown: {
                    item_total: { currency_code: campaign_currency, value: total },
                  }
                },
                items: items,
              }
            ];

            // Add discount
            if($scope.currentCoupon) {
              purchase_units[0].amount.breakdown.discount = {
                currency_code: campaign_currency,
                value: discount_amount
              };
            }

            var prefill_email = "";
            var prefill_first_name = "";
            var prefill_last_name = "";

            if ($scope.user.email) {
              prefill_email = $scope.user.email;
            }

            if ($scope.user.first_name) {
              prefill_first_name = $scope.user.first_name;
            }

            if ($scope.user.last_name) {
              prefill_last_name = $scope.user.last_name;
            }

            return actions.order.create({
              purchase_units: purchase_units,
              payer: {
                email_address: prefill_email,
                name: {
                  given_name: prefill_first_name,
                  surname: prefill_last_name,
                }
              },
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
              paypalPledge(details.id);
            });
          },
          onInit: function(data, actions)  {
            // Disable the buttons
            actions.disable();
      
            // Listen for changes to the checkbox
            document.querySelector('.agreement input[type="checkbox"]')
            .addEventListener('change', function(event) {
              // Enable or disable the button when it is checked or unchecked
              if (event.target.checked)  {
                actions.enable();
              } else  {
                actions.disable();
              }
            });
          },
          onClick: function()  {
            var translation = $translate.instant(['pledge_campaign_selectcity_error', 'pledge_campaign_selectsubcountry_error']);
            $scope.valcheck = true;
            if (!$scope.selectedSubcountry.selected) {
              $('.select-error').remove();
              $('#select-subcountry').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.pledge_campaign_selectsubcountry_error + '</div>');
              $('#select-subcountry').addClass('error');
            }
            
            if (!$('#select-city .select2-container').hasClass('select2-container-disabled')) {
              if (!$scope.selectedCity.selected && !$scope.site_campaign_alt_city_input_toggle) {
                $('.select-error').remove();
                $('#select-city').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.pledge_campaign_selectcity_error + '</div>');
                $('#select-city').addClass('error');
              }
            }
            
            if ($scope.tippingOptions.toggle) {
              $scope.tipValidation();
            }
            
            if ($scope.public_settings.site_campaign_reward_attributes_required) {
              attributesValidation();
            }
            if ($scope.pledgeReplace && $scope.requiresShipping && $scope.public_settings.site_campaign_reward_phone_required) {
              if ($scope.toggle.newNumber) {
                phoneNumberValidation();
              } else {
                newPhoneNumberValidation();
              }
            }
            if (typeof $scope.pledgeindex == "number" && $scope.public_settings.site_campaign_reward_phone_required && $scope.shippingOption && $scope.shippingOption.length && !$scope.pledgeReplace) {
              if ($scope.toggle.newNumber) {
                phoneNumberValidation();
              } else {
                newPhoneNumberValidation();
              }
            }
            if (!$scope.pledgeReplace) {
              $scope.contributeAmountValidation();
            } else if (!$scope.pledgeReplace && $scope.pledgeAmount) {
              $scope.contributeAmountValidation();
            } else if ($scope.pledgeReplace && $scope.pledgeAmount) {
              $scope.contributeAmountValidation();
            }
            
            if ($scope.toggle.newAddress) {
              $scope.chooseAddressFormValidation();
            } else {
              $scope.newAddressFormValidation();
            }
            
            if ($scope.acceptExtraPledgeData) {
              
              if ($scope.selectedAccountType == 'Organization') {
                if ($scope.toggle.newCompany) {
                  $scope.chooseBusinessFormValidation();
                } else {
                  $scope.newBusinessFormValidation();
                }
              }
              
              if ($scope.toggle.newNumber) {
                phoneNumberValidation();
              } else {
                newPhoneNumberValidation();
              }
            }
        
            if (!$scope.isContributionLayout1) {
              if ($scope.public_settings.site_tos_contribution_ui) {
        
                if (!$('.agreement input[type="checkbox"]').is(':checked')) {
                  $scope.tos_not_checked = true;
                  $rootScope.scrollToError();
                  return;
                } else {
                  $scope.tos_not_checked = false;
                }
              }
            }
        
            if ($scope.valcheck) {
              $rootScope.scrollToError();
              // actions.enable();
            } else {
              // actions.disable();
              document.querySelector('#error').classList.remove('hidden');
            }
          }
        }).render('#paypal-button-container');
      })
    }
  }

  function paypalPledge(paypal_order_id) {
    // if toggle is set so anon is a checkbox
    if ($scope.anonymousContributionTypeOnly) {
      if ($scope.selectedContributionAnon.toggle == true) {
        $scope.selecteContribution = 2;
      } else {
        $scope.selecteContribution = 1;
      }
    }

    // variable to store all attribute values
    var pledgeAttributes = {};

    //If toggle is on, we need to assign a dummy city ID - 
    if ($scope.site_campaign_alt_city_input_toggle && !$scope.alt_shipping) {
      $scope.address.city_id = 258463;
    }

    if ($scope.selectedReward) {
      if ($scope.selectedReward.attributes) {
        if (typeof $scope.selectedReward.attributes.variation != 'undefined') {
          var variation_choice = angular.copy($scope.selectedReward.attributes.variation);
          $('input[name="variation_value"]').each(function(key) {
            if ($(this).val() != "") {
              variation_choice[key].choice = variation_choice[key].choice[$(this).val()].value;
            } else {
              variation_choice[key].choice = null;
            }
          });
          pledgeAttributes['variation'] = variation_choice;
        }
      }
    }

    //Get all pledge reward replace attributes
    if ($scope.pledgeReplace) {
      angular.forEach($scope.rewardsQueue, function(selectedReward) {
        if (selectedReward.attributes) {
          if (typeof selectedReward.attributes.variation != 'undefined') {
            var variation_choice = angular.copy(selectedReward.attributes.variation);
            $('input[name="variation_value"]').each(function(key) {
              if (this.id == selectedReward.pledge_level_id) {
                if ($(this).val() != "") {
                  if (variation_choice[key]) {
                    variation_choice[key].choice = variation_choice[key].choice[$(this).val()].value;
                  }
                } else {
                  if (variation_choice[key]) {
                    variation_choice[key].choice = null;
                  }
                }
              }
            });
            if (!selectedReward.pledgeAttributes) {
              selectedReward.pledgeAttributes = {};
            }
            if ($scope.public_settings.site_campaign_charity_helper_enable) {
              if ($scope.charity.country) {
                $scope.charity.country_name = $scope.countries[$scope.charity.country - 1].name;
              }
              selectedReward.pledgeAttributes['charity'] = $scope.charity;
            }
            selectedReward.pledgeAttributes['variation'] = variation_choice;
          }
        }
      });
    }
    if ($scope.public_settings.site_campaign_charity_helper_enable) {
      if ($scope.charity.country) {
        $scope.charity.country_name = $scope.countries[$scope.charity.country - 1].name;
      }
      pledgeAttributes['charity'] = $scope.charity;
    }

    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;

    var promises = [];

    $scope.businessSelectedAttribute = {
      business_contribution: 0,
      business_organization_id: null
    };

    if ($scope.selectedReward) {
      if ($scope.selectedReward.shipping) {
        if ($scope.shipping_error) {
          return;
        }
      }
    }

    $scope.checkContribution();
    $('#finalpledge').addClass('disabled');


    //Check reward queue for shipping
    if ($scope.pledgeReplace) {
      //submit new address if address field being toggled on
      var postShipping = false;
      if (!$scope.toggle.newAddress && $scope.rewardsQueue.length) {
        angular.forEach($scope.rewardsQueue, function(selectedReward) {
          if (selectedReward.shipping) {
            postShipping = true;
          }
          if (postShipping) {
            promises.push(Restangular.one('account/address').customPOST($scope.address));
          }
        });
      }
    }

    var businessRequest = null;
    var businessPromises = [];

    if ($scope.acceptExtraPledgeData) {

      //Check Selected Account Type - Organization
      if ($scope.selectedAccountType == 'Organization') {
        //Check if need to make a new one
        if (!$scope.selectedCompany) {
          businessRequest = Restangular.one('account/business').customPOST($scope.businessSelected).then(function(success) {
            businessData.business_id = success.business_organization_id;
            attachBusinessToAddressPhone(businessData.business_id, businessPromises, $scope.address, $scope.phoneInfo, businessData);
          });
        }

        //No need to make a new one
        if ($scope.selectedCompany) {
          attachBusinessToAddressPhone($scope.selectedCompany.business_organization_id, businessPromises, $scope.address, $scope.phoneInfo, businessData, promises, pledgeAttributes);
        }
      }

      if ($scope.selectedAccountType == 'Individual') {
        attachBusinessToAddressPhone(null, businessPromises, $scope.address, $scope.phoneInfo, businessData, promises, pledgeAttributes);
      }
      return;
    }

    //Just Pledge
    addAddressPhoneNumber(null, businessPromises, $scope.address, $scope.phoneInfo, false);
    //Resolve Address/Phone
    $q.all(businessPromises).then(function(resolved) {
      // loop through the results and find value
      angular.forEach(resolved, function(value) {
        if (value.address_id) {
          businessData.address_id = value.address_id;
          $scope.selectedAddressID = value.address_id;
        }
        if (value.phone_number_id) {
          businessData.phone_id = value.phone_number_id;
          $scope.chosenPhoneNumberId = value.phone_number_id;
        }
      });

      //Pledge
      var total = parseInt($scope.campaignFundingGoal.value);
      if($scope.tip.dollar_amount) {
        total += parseInt($scope.tip.dollar_amount);
      }

      var pledgeInfo = {
        paypal_order_id: paypal_order_id,
        pledge_level_id: $scope.pledgeLevel,
        amount: total,
        shipping_address_id: $scope.selectedAddressID || '',
        phone_number_id: $scope.chosenPhoneNumberId,
        anonymous_contribution: $scope.anonymous_contribution,
        anonymous_contribution_partial: $scope.partial_anonymous_contribution,
        attributes: JSON.stringify(pledgeAttributes),
        use_sca: 0
      };

      if ($scope.acceptExtraPledgeData && ($scope.selectedAccountType == 'Organization')) {
        if (businessData) {
          if ($scope.selectedCompany && $scope.selectedCompany.hasOwnProperty('business_organization_id')) {
            pledgeInfo['business_organization_id'] = parseInt($scope.selectedCompany.business_organization_id);
          } else {
            pledgeInfo['business_organization_id'] = parseInt(businessData.business_organization_id);
          }
          if ($scope.selectedAddressID) {
            pledgeInfo['shipping_address_id'] = parseInt($scope.selectedAddressID);
          }
          if ($scope.chosenPhoneNumberId) {
            pledgeInfo['phone_number_id'] = parseInt($scope.chosenPhoneNumberId);
          }
        }
      }

      if ($scope.couponCodeValid && $scope.currentCoupon) {
        pledgeInfo['coupon_code'] = $scope.currentCoupon.code;
      }

      //if website tipping is enabled
      if ($scope.tippingOptions.toggle) {
        if ($scope.tip.dollar_amount && $scope.tip.dollar_amount != 0) {
          pledgeInfo.amount_tip = parseFloat($scope.tip.dollar_amount).toFixed(2);
          if ($scope.tippingOptions.toggle_process_tips_immediately) {
            pledgeInfo.force_tip_processing = true;
          }
        }
      }

      // if backer approve as charity
      if (pledgeAttributes.hasOwnProperty('charity') && pledgeAttributes['charity']) {
        if (pledgeAttributes['charity'].charity_final_confirmation) {
          pledgeInfo.charity_helper = 1;
        }
      }

      if ($scope.contributionMessage) {
        pledgeInfo.note = $scope.contributionMessage;
      }

      // Verify and store pledge
      Restangular.one('campaign', $scope.campaign_id).one('pledge').customPOST(pledgeInfo).then(function(success){
        // put campaign_backer in User
        var data = {
          campaign_backer: 1,
        };
        UserService.updateUserData(data);
        if(success.amount_tip) {
          $scope.tip.dollar_amount = parseFloat(success.amount_tip).toFixed(2);
        }

        msg = {
          'header': 'pledge_campaign_pledge_success'
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        // display a thank you note
        $('.pledge-thank-you')
          .modal({
            selector: {
              close: '.actions .button',
              deny: '.actions .negative, .actions .deny, .actions .cancel, .close'
            },
            closable: false
          }).modal('show');

        if (typeof $scope.campaign.settings != 'undefined' && $scope.campaign.contribution_redirect) {
          $timeout(function() {
            window.location.href = $scope.campaign.contribution_redirect;
          }, 5000);
        } else if (typeof $scope.site_campaign_pledge_redirect != 'undefined' && $scope.site_campaign_pledge_redirect.toggle) {
          $timeout(function() {
            window.location.href = $scope.site_campaign_pledge_redirect.url;
          }, 5000);
        }
        if ($scope.public_settings.site_campaign_ecommerce_analytics && $scope.public_settings.site_campaign_ecommerce_analytics.toggle) {
          sendGATransaction(success, $scope.public_settings.site_campaign_ecommerce_analytics.code);
        }
        if ($scope.public_settings.site_campaign_facebook_analytics && $scope.public_settings.site_campaign_facebook_analytics.toggle) {
          sendFBTransaction(success, $scope.public_settings.site_campaign_facebook_analytics.code);
        }
        if ($scope.public_settings.site_campaign_referralcandy_analytics && $scope.public_settings.site_campaign_referralcandy_analytics.toggle) {
          sendRCTransaction(
            success, 
            $scope.public_settings.site_campaign_referralcandy_analytics.id);
        }
      }, function(failed) {
        errorHandling(failed);

        $('#finalpledge').removeClass('disabled');
        $scope.failed_code = failed.data.code;
        msg = {
          'loading': true,
          'loading_message': failed.data.message
        }
        $rootScope.floatingMessage = msg;
      });
    });
  }

  // retrieve the pledger account
  StripeService.getPledgerAccount().then(function(success) {
    // assuming pledgers only have one account
    success = success[0];
    if (success == null) {
      $scope.pledgerAccountConnected = false;
      $scope.toggle.newCard = false; // show setup new card section if no existing account
      $scope.oldcard = false;
    } else {
      $scope.toggle.newCard = true; // hide setup new card if there are existing cards
      $scope.pledgerAccountConnected = true;
      $scope.pledgerAccountID = success.stripe_account_id;
      $scope.pledgerCards = success.cards;
      for (var i in $scope.pledgerCards) {
        if ($scope.pledgerCards[i].default_card == true) {
          $scope.default_card = $scope.pledgerCards[i];
          $scope.defaultindex = i;
        }
      }

      if (success.cards != null && success.cards.length > 0) {
        $scope.oldcard = true;
      } else {
        $scope.oldcard = false;
      }
    }
  });
  // regular pledgers selections
  $scope.contributionSelectionHelp = "Contribution Selection 1 is selected";
  $scope.contributionSelected = function(type) {
    $scope.selecteContribution = type.type;

    // Defining the help text according to the selected item
    if ($scope.selecteContribution == 1) {
      $scope.contributionSelectionHelp = "Contribution Selection 1 is selected";
    } else if ($scope.selecteContribution == 2) {
      $scope.contributionSelectionHelp = "Contribution Selection 2 is selected";
    } else if ($scope.selecteContribution == 3) {
      $scope.contributionSelectionHelp = "Contribution Selection 3 is selected";
    }

    // Changes - Popup behavior for help circle icon for contribution selection
    $('.help-popup').popup({
      content: $scope.contributionSelectionHelp,
      on: 'click'
    });
  }

  // Charity if Checked
  $scope.isAGift = function() {
    $scope.charity.is_a_gift = $("input[name='is_a_gift_aid']").is(":checked");
    // if(!$scope.is_a_gift){
    //   $scope.is_a_tax_payer = false;
    //   $("input[name='is_a_tax_payer']").attr('checked', false);
    // }
  }

  // Start up - Popup behavior for help circle icon for contribution selection
  $('.help-popup').popup({
    content: $scope.contributionSelectionHelp,
    on: 'click'
  });
  // after pledging go to the rewards page
  $scope.gotoRewards = function() {
    $location.path($scope.currentLoc);
  }
  $scope.cardID = 1;
  $scope.cardTypeSelected = function(type) {
    $scope.cardselected = type.name;
    $scope.cardID = type.id;
  }

  // set toggle variable
  $scope.setFlag = function(key, value) {
    $scope.toggle[key] = value;
    if (key == "newAddress" && value) {
      clearAddress();
    }

  };
  // reset select box dropdown to default
  $scope.dropdownReset = function(selector) {

    if (selector == '.address-select') {
      $scope.selectedAddress = null;
    } else if (selector == '.number-select') {
      $scope.chosenPhoneNumberId = null;
    } else {
      $scope.selectedCardID = null;
    }
    // restore dropdown
    $(selector).dropdown('clear');
    $(selector).dropdown('restore defaults');
  };

  function clearAddress() {
    $scope.selectedCity.selected = undefined;
    $scope.selectedSubcountry.selected = undefined;
    if (portal_settings.site_theme_default_shipping_country != null) {
      if (portal_settings.site_theme_default_shipping_country.name) {
        $scope.selectedCountry.selected = portal_settings.site_theme_default_shipping_country;
      }
    }
    $scope.shipOptions = [];
    $scope.address.mail_code = "";
    $scope.address.street1 = "";
    $scope.address.street2 = "";
  }

  /*
  Address section
  */

  //get address
  Restangular.one('account/address').customGET().then(function(success) {
    $scope.profileAddress = success.plain();
    $scope.profileAddress.personal = checkNative($scope.profileAddress.personal);
    $scope.profileAddress.business = checkNative($scope.profileAddress.business);
    if (!$scope.profileAddress.personal) {
      $scope.hasAddress = false;
      $scope.toggle.newAddress = false;
    } else {
      $scope.hasAddress = true;
      $scope.toggle.newAddress = true;
    }
  });

  function checkNative(addressData) {
    angular.forEach(addressData, function(value, key) {
      // Format: City name, Subcountry Country
      if ($scope.native_lookup) {
        var name = "";
        if (value.country_native_name != null) {
          name += value.country_native_name;
          value.country = value.country_native_name;
        } else {
          name += value.country;
        }
        if (value.subcountry_native_name != null) {
          name += " " + value.subcountry_native_name;
          value.subcountry = value.subcountry_native_name;
        } else {
          name += " " + value.subcountry;
        }
        if (value.city_native_name != null && value.city != "Other") {
          name += ", " + value.city_native_name;
          value.city = value.city_native_name;
        } else if (value.city != "Other") {
          name += ", " + value.city;
        } else {
          value.city = "";
        }
        value.city_full = name;
      }
    });
    return addressData;
  }

  // get pledge level shipping
  if ($scope.pledgeLevel) {
    // get shipping options
    Restangular.one('campaign', $scope.campaign_id).one('pledge-level', $scope.pledgeLevel).one('shipping-option').customGET().then(function(data) {
      $scope.shippingOption = data;


      setTimeout(function() {
        //Default to landline
        if (!$scope.newNumberCreated.number && !$scope.newNumberCreated.phonetype) {
          $('#phone_type_Landline').click();
        }

        //If already chosen, use chosen one instead
        if ($scope.newNumberCreated.phonetype) {
          $('#phone_type_' + $scope.newNumberCreated.phonetype.name).click();
        }
      }, 100);
    });
  }
  // set up objects to send through POST
  $scope.address = {
    city_id: '',
    mail_code: '',
    street1: '',
    street2: '',
    country_id: ''
  };
  $scope.creditCard = {
    number: '',
    exp_month: '',
    exp_year: '',
    cvc: '',
    name: '',
    card_token: ''
  };

  $scope.person = {
    fname: '',
    lname: '',
    address1: '',
    zip: '',
    number: '',
    occupation: '',
    employer: ''
  };

  $scope.checkContribution = function() {
    if ($scope.selecteContribution == 2) {
      $scope.anonymous_contribution = 1;

    } else {
      $scope.anonymous_contribution = 0;
    }

    if ($scope.selecteContribution == 3) {
      $scope.partial_anonymous_contribution = 1;

    } else {
      $scope.partial_anonymous_contribution = 0;
    }
    if ($scope.selecteContribution == 1) {
      $scope.anonymous_contribution = 0;
      $scope.partial_anonymous_contribution = 0;
    }
    if (portal_settings.site_campaign_always_anonymous_contribution) {
      $scope.anonymous_contribution = 1;
      $scope.partial_anonymous_contribution = 0;
    }
  };

  // toggle button
  $scope.clickToggle = function(key) {
    if (key == 'newCard') {
      $scope.toggle.selectedCard = false;
      $('.choose-card-form.ui.form').form('clear');
      $('.credit-card-form').removeClass('error');

    } else if (key == 'newAddress') {
      $scope.shipOptions = [];
      $scope.toggle.selectedAddress = false;
      $('.choose-address-form.ui.form').form('clear');
      $('.select-error').remove();

    } else if (key == "newNumber") {
      $scope.toggle.selectedNumber = false;
      $('#phone-number-form').form('clear');

      setTimeout(function() {
        //Default to landline
        if (!$scope.newNumberCreated.number && !$scope.newNumberCreated.phonetype) {
          $('#phone_type_Landline').click();
        }

        //If already chosen, use chosen one instead
        if ($scope.newNumberCreated.phonetype) {
          $('#phone_type_' + $scope.newNumberCreated.phonetype.name).click();
        }
      }, 100);

    } else if (key == "newCompany") {
      $scope.toggle.newCompany = false;
      $('#new-user-company-form').form('clear');

      //Default to landline
      if (!$scope.newNumberCreated.number && !$scope.newNumberCreated.phonetype) {
        $('#phone_type_Landline').click();
      }

      //If already chosen, use chosen one instead
      if ($scope.newNumberCreated.phonetype) {
        $('#phone_type_' + $scope.newNumberCreated.phonetype.name).click();
      }
    }
    $scope.toggle[key] = !$scope.toggle[key];
    if ($scope.toggle[key] == false && key == "newAddress") {
      clearAddress();
    }
  };

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

  function attributesValidation() {
    var translation = $translate.instant(['pledge_campaign_attribute_required_error']);

    // Choose card
    $('#reward-variation').find('input[name="variation_value"]').each(function() {
      if (!$(this).val()) {
        $scope.valcheck = $scope.valcheck && false;
        $(this).parent().parent('.field').addClass('error');
        $(this).parent().parent('.field').append('<div class="error-text ui red pointing prompt label">' + translation.pledge_campaign_attribute_required_error + '</div>');
      } else {
        $scope.valcheck = $scope.valcheck && true;
        $(this).parent().parent('.field').removeClass('error');
        $(this).parent().parent('.field').find('.error-text').remove();
      }
    });
    $('#reward-variation').find('input[name="variation_value"]').change(function() {
      $scope.valcheck = $scope.valcheck && true;
      $(this).parent().parent('.field').removeClass('error');
      $(this).parent().parent('.field').find('.error-text').remove();
    });
  }

  function phoneNumberValidation() {
    var translation = $translate.instant(['pledge_campaign_phone_required_error']);

    $('#phone-number-form').form({
      phone_value: {
        identifier: 'phone_value',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_phone_required_error
        }]
      }
    }, {
      inline: true,
      onSuccess: function() {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function() {
        $scope.valcheck = $scope.valcheck && false;
      }
    }).form('validate form');
  }

  function newPhoneNumberValidation() {
    var translation = $translate.instant(['pledge_campaign_new_phone_value_required_error', 'pledge_campaign_new_phone_type_required_error']);

    $('#new-phone-number-form').form({
      new_phone_number: {
        identifier: 'new_phone_number',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_new_phone_value_required_error
        }]
      },
      new_phone_type: {
        identifier: 'new_phone_type',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_new_phone_type_required_error
        }]
      }
    }, {
      inline: true,
      onSuccess: function() {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function() {
        $scope.valcheck = $scope.valcheck && false;
      }
    }).form('validate form');
  }

  $scope.chooseCardFormValidation = function() {
    var translation = $translate.instant(['pledge_campaign_choose_card_error']);

    // Choose card
    $('.choose-card-form.ui.form').form({
      choose_card: {
        identifier: 'choose_card',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_choose_card_error
        }]
      }
    }, {
      inline: true,
      onSuccess: function() {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function() {
        $scope.valcheck = $scope.valcheck && false;
      }
    }).form('validate form');
  }
  $scope.chooseAddressFormValidation = function() {
    var translation = $translate.instant(['pledge_campaign_choose_address_error']);
    // Choose shipping address
    $('.choose-address-form.ui.form').form({
      choose_address: {
        identifier: 'choose_address',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_choose_address_error
        }]
      }
    }, {
      inline: true,
      onSuccess: function() {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function() {
        $scope.valcheck = $scope.valcheck && false;
      }
    }).form('validate form');
  }
  $scope.chooseBusinessFormValidation = function() {
    var translation = $translate.instant(['pledge_campaign_choose_company_error']);
    // Choose shipping address
    $('.user-company-form.ui.form').form({
      choose_address: {
        identifier: 'company_value',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_choose_company_error
        }]
      }
    }, {
      inline: true,
      onSuccess: function() {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function() {
        $scope.valcheck = $scope.valcheck && false;
      }
    }).form('validate form');
  }
  $scope.newBusinessFormValidation = function() {
    var translation = $translate.instant(['pledge_campaign_business_company_error', 'pledge_campaign_business_primary_lastName_error', 'pledge_campaign_business_primary_firstName_error', 'pledge_campaign_business_primary_email_error']);

    var validation = {
      company_name: {
        identifier: 'company_name',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_business_company_error
        }]
      },
      primaryEmail: {
        identifier: 'businessEmail',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_business_primary_email_error
        }]
      }
    };

    $('.user-new-company-form.ui.form').form(
      validation, {
        inline: true,
        onSuccess: function() {
          $scope.valcheck = $scope.valcheck && true;
        },
        onFailure: function() {
          $scope.valcheck = $scope.valcheck && false;
        }
      }).form('validate form');
  }

  $scope.newCardFormValidation = function() {
    var translation = $translate.instant(['pledge_campaign_card_number_error', 'pledge_campaign_card_exp_month_error', 'pledge_campaign_card_exp_year_error', 'pledge_campaign_card_cvc_error']);
    $('.credit-card-form.ui.form').form({
      card_number: {
        identifier: 'card_number',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_card_number_error
        }]
      },
      card_exp_month: {
        identifier: 'card_exp_month',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_card_exp_month_error
        }]
      },
      card_exp_year: {
        identifier: 'card_exp_year',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_card_exp_year_error
        }]
      },
      card_cvc: {
        identifier: 'card_cvc',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_card_cvc_error
        }]
      }
    }, {
      inline: true,
      onSuccess: function() {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function() {
        $scope.valcheck = $scope.valcheck && false;
      }
    }).form('validate form');
  }

  $scope.contributeAmountValidation = function() {
    $.fn.form.settings.rules.under_minimum = function(value) {
      if ($scope.pledgeAmount < $scope.public_settings.site_theme_campaign_min_contribute_amount) {
        return false;
      } else {
        return true;
      }
    }

    $.fn.form.settings.rules.over_maximum = function(value) {
      if ($scope.pledgeAmount > $scope.max_amoumt && $scope.allow_max) {
        return false;
      } else {
        return true;
      }
    }
    var translation = $translate.instant(['pledge_campaign_contribution_empty', 'pledge_campaign_contribution_under_minimum', 'pledge_campaign_contribution_over_maximum']);
    if ($scope.allowDecimalNotation == 2 || $scope.allowDecimalNotation == 3) {
      $('.contribution-form.ui.form').form({
        contribution_amount: {
          identifier: 'contribution_amount',
          rules: [{
            type: 'empty',
            prompt: translation.pledge_campaign_contribution_empty
          }, {
            type: 'under_minimum',
            prompt: translation.pledge_campaign_contribution_under_minimum
          }, {
            type: 'over_maximum',
            prompt: translation.pledge_campaign_contribution_over_maximum
          }]
        }
      }, {
        inline: true,
        onSuccess: function() {
          $scope.valcheck = $scope.valcheck && true;
        },
        onFailure: function() {
          $scope.valcheck = $scope.valcheck && false;
        }
      }).form('validate form');
    } else {
      $('.contribution-form.ui.form').form({
        contribution_amount: {
          identifier: 'contribution_amount_decimal',
          rules: [{
            type: 'empty',
            prompt: translation.pledge_campaign_contribution_empty
          }, {
            type: 'under_minimum',
            prompt: translation.pledge_campaign_contribution_under_minimum
          }, {
            type: 'over_maximum',
            prompt: translation.pledge_campaign_contribution_over_maximum
          }]
        }
      }, {
        inline: true,
        onSuccess: function() {
          $scope.valcheck = $scope.valcheck && true;
        },
        onFailure: function() {
          $scope.valcheck = $scope.valcheck && false;
        }
      }).form('validate form');
    }
  }

  $scope.tipValidation = function() {
    if (!$scope.selectedTipType) {
      $scope.tipTypeError = true;
      $scope.valcheck = $scope.valcheck && false;
      return;
    }
    $.fn.form.settings.rules.tip_zero = function(value) {
      if ($scope.tip.dollar_amount == 0) {
        return false;
      } else {
        return true;
      }
    }

    $.fn.form.settings.rules.tip_number = function(value) {
      if ($scope.tip.dollar_amount) {
        if ($scope.tip.dollar_amount.match(/^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/)) {
          return true;
        } else {
          return false;
        }
      }
    }

    $.fn.form.settings.rules.tip_under_minimum = function(value) {

      if (!$scope.tippingOptions.dynamic_min) {
        return true;
      }
      if (Number($scope.tip.dollar_amount) < Number($scope.tippingOptions.dynamic_min)) {
        return false;
      } else {
        return true;
      }
    }

    $.fn.form.settings.rules.tip_over_maximum = function(value) {
      if (!$scope.tippingOptions.dynamic_max) {
        return true;
      }
      if (Number($scope.tip.dollar_amount) > Number($scope.tippingOptions.dynamic_max)) {
        return false;
      } else {
        return true;
      }
    }
    if ($scope.selectedTipType == "dynamic") {

      var translation = $translate.instant(['pledge_campaign_tip_empty', 'pledge_campaign_tip_invalid', 'pledge_campaign_tip_under_minimum', 'pledge_campaign_tip_over_maximum']);
      if ($scope.tippingOptions.toggle_dynamic_min_max || $scope.tippingOptions.dynamic_min) {
        $('.dynamic-tipping-form.ui.form').form({
          dynamic_tip: {
            identifier: 'dynamic_tip',
            rules: [{
              type: 'empty',
              prompt: translation.pledge_campaign_tip_empty
            }, {
              type: 'tip_zero',
              prompt: translation.pledge_campaign_tip_empty
            }, {
              type: 'tip_number',
              prompt: translation.pledge_campaign_tip_invalid
            }, {
              type: 'tip_under_minimum',
              prompt: translation.pledge_campaign_tip_under_minimum
            }, {
              type: 'tip_over_maximum',
              prompt: translation.pledge_campaign_tip_over_maximum
            }]
          }
        }, {
          inline: true,
          onSuccess: function() {
            $scope.valcheck = $scope.valcheck && true;
          },
          onFailure: function() {
            $scope.valcheck = $scope.valcheck && false;
          }
        }).form('validate form');
      } else {
        $('.dynamic-tipping-form.ui.form').form({
          dynamic_tip: {
            identifier: 'dynamic_tip',
            rules: [{
              type: 'empty',
              prompt: translation.pledge_campaign_tip_empty
            }, {
              type: 'tip_zero',
              prompt: translation.pledge_campaign_tip_empty
            }, {
              type: 'tip_number',
              prompt: translation.pledge_campaign_tip_invalid
            }]
          }
        }, {
          inline: true,
          onSuccess: function() {
            $scope.valcheck = $scope.valcheck && true;
          },
          onFailure: function() {
            $scope.valcheck = $scope.valcheck && false;
          }
        }).form('validate form');
      }
    }
  }

  $scope.newAddressFormValidation = function() {
    var translation = $translate.instant(['pledge_campaign_shipping_country_error', 'pledge_campaign_shipping_subcountry_error', 'pledge_campaign_shipping_city_error', 'pledge_campaign_shipping_mailcode_error', 'pledge_campaign_shipping_streetaddress_error']);

    var validation = {
      country: {
        identifier: 'country',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_shipping_country_error
        }]
      },
      mail_code: {
        identifier: 'mail_code',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_shipping_mailcode_error
        }]
      },
      street_address: {
        identifier: 'street_address',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_shipping_streetaddress_error
        }]
      }
    };

    if ($scope.site_campaign_alt_city_input_toggle) {
      validation['city'] = {
        identifier: 'city',
        rules: [{
          type: 'empty',
          prompt: translation.pledge_campaign_shipping_city_error
        }]
      }
    }

    $('.new-shipping-address-form.ui.form').form(
      validation, {
        inline: true,
        onSuccess: function() {
          $scope.valcheck = $scope.valcheck && true;
        },
        onFailure: function() {
          $scope.valcheck = $scope.valcheck && false;
        }
      }).form('validate form');
  }

  $scope.submitWidgetPledge = function() {
    $scope.loadingIcon = true;
    $scope.responseMsg = 'pledge_campaign_loading_text';

    if ($scope.contrib) {
      if ($('#pledgecheck').checkbox('is checked')) {} else {
        return;
      }
    }
    if ($scope.selectedReward) {
      if ($scope.selectedReward.shipping) {
        if ($scope.shipping_error) {
          return;
      }
      }
    }
    var invalid_elements = $('form, ng-form').find('.ng-invalid,.has-error');
    if (invalid_elements.length > 0) {
      return;

    }
    // Check contribution to be at least one dollar
    $scope.checkContribution();

    $scope.responseMsg = "";
    if ($scope.totalAmount <= 1) {
      $scope.responseMsg = 'Donation Amount must be a number and  atleast greater than 1 dollar';
    } else {
      $("div.loader").addClass("active");
      var promises = [];
      $('#finalpledge').addClass('disabled');
      var pledgeInfo = {
        entry_id: $scope.campaign_id,
        number: $scope.creditCard.number,
        cvc: $scope.creditCard.cvc,
        exp_month: $scope.creditCard.exp_month,
        exp_year: $scope.creditCard.exp_year,
        amount: $scope.totalAmount,
        first_name: $scope.person.fname,
        last_name: $scope.person.lname,
        personal_address_line1: $scope.person.address1,
        personal_address_zip: $scope.person.zip,
        personal_city_id: $scope.city_id,
        personal_phone_number: $scope.person.number,
        occupation: $scope.person.occupation || '',
        employer: $scope.person.employer || ''

      };

      if ($scope.tippingOptions.toggle) {
        if ($scope.tip.dollar_amount && $scope.tip.dollar_amount != 0) {
          pledgeInfo.amount_tip = parseFloat($scope.tip.dollar_amount).toFixed(2);
          if ($scope.tippingOptions.toggle_process_tips_immediately) {
            pledgeInfo.force_tip_processing = true;
          }
        }
      }

      Restangular.one('account/widgetmakr').customPOST(pledgeInfo).then(function(success) {
        $scope.wcardID = success.cards[0].widgetmakr_account_card_id;
        $scope.ctype = success.cards[0].widgetmakr_account_card_type;
        var infoPledge = {
          widgetmakr_account_card_id: $scope.wcardID,
          amount: $scope.totalAmount,
          anonymous_contribution: $scope.anonymous_contribution,
          anonymous_contribution_partial: $scope.partial_anonymous_contribution
        };
        Restangular.one('campaign', $scope.campaign_id).one('pledge').customPOST(infoPledge).then(function(success) {
          $scope.responseMsg = false;
          $scope.loadingIcon = false;
          // $scope.responseMsg = "Pledge Successful";
          // $translate('Pledge_Success').then(function(value) {
          //   $scope.responseMsg = value;
          // });
          $('.pledge-thank-you')
            .modal({
              selector: {
                close: '.actions .button',
                deny: '.actions .negative, .actions .deny, .actions .cancel, .close'
              },
              onDeny: function() {},
              // onHide: function() {
              //   window.location.href = $rootScope.campaign_path;
              // },
            }).modal('show');
          //put campaign_backer in User
          var data = {
            campaign_backer: 1,
          };
          UserService.updateUserData(data);
        }, function(failed) {
          $scope.responseMsg = false;
          $scope.loadingIcon = false;


          $('#finalpledge').removeClass('disabled');
        });

      }, function(failed) {
        $scope.responseMsg = false;
        $scope.loadingIcon = false;

        $('#finalpledge').removeClass('disabled');

        if (failed.data.message == "Provided credit card number appears to be invalid.") {

          $scope.responseMsg = 'Provided credit card number appears to be invalid';
        }
        if (failed.data.message == "Provided credit card number is too large.") {

          $scope.responseMsg = 'Provided credit card number is too large';
        }
        if (failed.data.message == "Invalid Credit Card Number.") {

          $scope.responseMsg = 'Invalid Credit Card Number';
        }
        if (failed.data.message === 'Invalid Card Expiration Date.') {
          $scope.responseMsg = 'Invalid Card Expiration Date';
        }
        if (failed.data.message === 'Donation Amount must be a number and at least 1 dollar') {
          $scope.responseMsg = 'Donation Amount must be a number and  atleast greater than 1 dollar';
        }
        if (failed.data.message === 'Ccv can only contain numbers.') {
          $scope.responseMsg = 'Ccv can only contain numbers';
        }
        if (failed.data.message === "Validation failed for one or more entities. See 'EntityValidationErrors' property for more details.") {
          $scope.responseMsg = 'Pledge failed';
        }

      });
    }
  }

  // Handling error requests
  function errorHandling(failed) {
    var msg = {
      'header': ""
    }
    if (failed.data) {
      if (failed.data.errors) {
        for (var prop in failed.data.errors) {
          msg.header = failed.data.errors[prop][0].code;
          break;
        }
      } else if (failed.data.type) {
        msg.header = failed.data.message;

      } else {
        msg.header = failed.data.code;
      }
      if (/No such token/.test(msg.header)) {
        msg.extra_message = $translate.instant("pledge_campaign_no_such_token");
      }
      if (failed.data.code == 'entity_not_found') {
        msg.header = $translate.instant("pledge_campaign_entity_not_found_error");
      }
      if (failed.data.code == 'account_profile_stripe_pledge_direct_off_missing_connected') {
        msg.header = $translate.instant("pledge_campaign_missing_connect");
      }
      $rootScope.floatingMessage = msg;
    }
  }

  function generateTokenOrPledge(promises, pledgeAttributes, businessData) {
    //Check for Stripe Tokenization Toggle - Don't create token if Card Selected
    //Attach credit card token to $scope.creditCard if Stripe Tokenization
    if ($scope.site_stripe_tokenization_settings.toggle && !$scope.toggle.selectedCard) {

      //Create Token
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
          }, 500);

          $scope.valcheck = false;
        } else {
          // Assign token to credit card 
          if ($scope.pledgerAccountConnected == false) {
            //Use Token to Extract CC Info
            $scope.creditCard.card_token = result.token.id;
            promises.push(StripeService.newPledgerAccount($scope.creditCard));
          } else if (!$scope.toggle.newCard && !$scope.selectedCardID) {
            $scope.creditCard.card_token = result.token.id;
            //Pledger Acc found, extract CC info with Token
            promises.push(StripeService.createCard($scope.pledgerAccountID, $scope.creditCard));
          }
          $scope.resolvePromiseChain(promises, pledgeAttributes, businessData);
        }
      });
    } else {
      //Don't attach credit card_token to $scope.creditCard  
      if ($scope.pledgerAccountConnected == false) {
        promises.push(StripeService.newPledgerAccount($scope.creditCard));
      } else if (!$scope.toggle.newCard && !$scope.selectedCardID) {
        promises.push(StripeService.createCard($scope.pledgerAccountID, $scope.creditCard));
      }

      $scope.resolvePromiseChain(promises, pledgeAttributes, businessData);
    }
  }

  function addAddressPhoneNumber(business_organization_id, businessPromises, addressInfo, phoneInfo, bypass_extra) {
    if (business_organization_id) {
      addressInfo['business_organization_id'] = business_organization_id;
      phoneInfo['business_organization_id'] = business_organization_id;
    }
    if (!$scope.toggle.newAddress && bypass_extra) {
      businessPromises.push(Restangular.one('account/address').customPOST(addressInfo));
    }
    if (!$scope.toggle.newAddress && !bypass_extra) {
      //Check selectedAddress
      if (!$scope.selectedAddress && $scope.selectedReward && $scope.selectedReward.shipping) {
        businessPromises.push(Restangular.one('account/address').customPOST(addressInfo));
      }
    }
    if ($scope.newNumberCreated.number.length > 0 && $scope.newNumberCreated.phonetype) {
      phoneInfo.number = $scope.newNumberCreated.number;
      phoneInfo.phone_number_type_id = $scope.newNumberCreated.phonetype.id;
      phoneInfo.person_id = UserService.id;
      businessPromises.push(Restangular.one('account/phone-number').customPOST(phoneInfo));
    }
  }

  function attachBusinessToAddressPhone(business_id, businessPromises, address, phoneInfo, businessData, promises, pledgeAttributes) {

    if(!pledgeAttributes) {
      pledgeAttributes = {}
    }
    addAddressPhoneNumber(business_id, businessPromises, address, phoneInfo, true);
    //Resolve Address/Phone
    if (businessPromises && businessPromises.length) {
      return $q.all(businessPromises).then(function(resolved) {
        // loop through the results and find value
        angular.forEach(resolved, function(value) {
          if (value.address_id) {
            businessData.address_id = value.address_id;
            $scope.selectedAddressID = value.address_id;
          }
          if (value.phone_number_id) {
            businessData.phone_id = value.phone_number_id;
            $scope.chosenPhoneNumberId = value.phone_number_id;
          }
        });

        return generateTokenOrPledge(promises, pledgeAttributes, businessData);
      });
    }
    generateTokenOrPledge(promises, pledgeAttributes, businessData);
  }

  //submit form
  $scope.submit = function() {
    // if toggle is set so anon is a checkbox
    if ($scope.anonymousContributionTypeOnly) {
      if ($scope.selectedContributionAnon.toggle == true) {
        $scope.selecteContribution = 2;
      } else {
        $scope.selecteContribution = 1;
      }
    }
 
    $scope.stripe_pledge = $scope.stripe
    $scope.stripe_tip = $scope.stripe;
    if(!$scope.site_campaign_fee_direct_transaction && $scope.stripe_standard_mode && $scope.campaign.managers[0] && $scope.campaign.managers[0].publishable_key){
      $scope.stripe_pledge = Stripe($scope.campaign.managers[0].publishable_key);
    }

    // variable to store all attribute values
    var pledgeAttributes = {};


    //If toggle is on, we need to assign a dummy city ID - 
    if ($scope.site_campaign_alt_city_input_toggle && !$scope.alt_shipping) {
      $scope.address.city_id = 258463;
    }

    if ($scope.selectedReward) {
      if ($scope.selectedReward.attributes) {
        if (typeof $scope.selectedReward.attributes.variation != 'undefined') {
          var variation_choice = angular.copy($scope.selectedReward.attributes.variation);
          $('input[name="variation_value"]').each(function(key) {
            if ($(this).val() != "") {
              variation_choice[key].choice = variation_choice[key].choice[$(this).val()].value;
            } else {
              variation_choice[key].choice = null;
            }
          });
          pledgeAttributes['variation'] = variation_choice;
        }
      }
    }

    //Get all pledge reward replace attributes
    if ($scope.pledgeReplace) {
      angular.forEach($scope.rewardsQueue, function(selectedReward) {
        if (selectedReward.attributes) {
          if (typeof selectedReward.attributes.variation != 'undefined') {
            var variation_choice = angular.copy(selectedReward.attributes.variation);
            $('input[name="variation_value"]').each(function(key) {
              if (this.id == selectedReward.pledge_level_id) {
                if ($(this).val() != "") {
                  if (variation_choice[key]) {
                    variation_choice[key].choice = variation_choice[key].choice[$(this).val()].value;
                  }
                } else {
                  if (variation_choice[key]) {
                    variation_choice[key].choice = null;
                  }
                }
              }
            });
            if (!selectedReward.pledgeAttributes) {
              selectedReward.pledgeAttributes = {};
            }
            if ($scope.public_settings.site_campaign_charity_helper_enable) {
              if ($scope.charity.country) {
                $scope.charity.country_name = $scope.countries[$scope.charity.country - 1].name;
              }
              selectedReward.pledgeAttributes['charity'] = $scope.charity;
            }
            selectedReward.pledgeAttributes['variation'] = variation_choice;
          }
        }
      });
    }
    // if ($scope.contributionMessage) {
    //     pledgeAttributes['contribution_message'] = $scope.contributionMessage
    // }
    // if charity helper is enabled
    if ($scope.public_settings.site_campaign_charity_helper_enable) {
      if ($scope.charity.country) {
        $scope.charity.country_name = $scope.countries[$scope.charity.country - 1].name;
      }
      pledgeAttributes['charity'] = $scope.charity;
    }

    var translation = $translate.instant(['pledge_campaign_selectcity_error', 'pledge_campaign_selectsubcountry_error']);
    $scope.valcheck = true;
    if (!$scope.selectedSubcountry.selected) {
      $('.select-error').remove();
      $('#select-subcountry').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.pledge_campaign_selectsubcountry_error + '</div>');
      $('#select-subcountry').addClass('error');
    }

    if (!$('#select-city .select2-container').hasClass('select2-container-disabled')) {
      if (!$scope.selectedCity.selected && !$scope.site_campaign_alt_city_input_toggle) {
        $('.select-error').remove();
        $('#select-city').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.pledge_campaign_selectcity_error + '</div>');
        $('#select-city').addClass('error');
      }
    }

    if ($scope.tippingOptions.toggle) {
      $scope.tipValidation();
    }

    if ($scope.public_settings.site_campaign_reward_attributes_required) {
      attributesValidation();
    }
    if ($scope.pledgeReplace && $scope.requiresShipping && $scope.public_settings.site_campaign_reward_phone_required) {
      if ($scope.toggle.newNumber) {
        phoneNumberValidation();
      } else {
        newPhoneNumberValidation();
      }
    }
    if (typeof $scope.pledgeindex == "number" && $scope.public_settings.site_campaign_reward_phone_required && $scope.shippingOption && $scope.shippingOption.length && !$scope.pledgeReplace) {
      if ($scope.toggle.newNumber) {
        phoneNumberValidation();
      } else {
        newPhoneNumberValidation();
      }
    }
    if (!$scope.pledgeReplace) {
      $scope.contributeAmountValidation();
    } else if (!$scope.pledgeReplace && $scope.pledgeAmount) {
      $scope.contributeAmountValidation();
    } else if ($scope.pledgeReplace && $scope.pledgeAmount) {
      $scope.contributeAmountValidation();
    }
    if ($scope.toggle.newCard) {
      $scope.chooseCardFormValidation();
    } else {
      $scope.newCardFormValidation();
    }

    if ($scope.toggle.newAddress) {
      $scope.chooseAddressFormValidation();
    } else {
      $scope.newAddressFormValidation();
    }

    if ($scope.acceptExtraPledgeData) {

      if ($scope.selectedAccountType == 'Organization') {
        if ($scope.toggle.newCompany) {
          $scope.chooseBusinessFormValidation();
        } else {
          $scope.newBusinessFormValidation();
        }
      }

      if ($scope.toggle.newNumber) {
        phoneNumberValidation();
      } else {
        newPhoneNumberValidation();
      }
    }

    if (!$scope.isContributionLayout1) {
      if ($scope.public_settings.site_tos_contribution_ui) {

        if (!$('.agreement input[type="checkbox"]').is(':checked')) {
          $scope.tos_not_checked = true;
          $rootScope.scrollToError();
          return;
        } else {
          $scope.tos_not_checked = false;
        }
      }
    }


    if ($scope.valcheck) {

      msg = {
        'loading': true,
        'loading_message': 'in_progress'
      }
      $rootScope.floatingMessage = msg;


      var promises = [];

      $scope.businessSelectedAttribute = {
        business_contribution: 0,
        business_organization_id: null
      };

      if ($scope.selectedReward) {
        if ($scope.selectedReward.shipping) {
          if ($scope.shipping_error) {
            return;
          }
        }
      }

      $scope.checkContribution();
      $('#finalpledge').addClass('disabled');


      //Check reward queue for shipping
      if ($scope.pledgeReplace) {
        //submit new address if address field being toggled on
        var postShipping = false;
        if (!$scope.toggle.newAddress && $scope.rewardsQueue.length) {
          angular.forEach($scope.rewardsQueue, function(selectedReward) {
            if (selectedReward.shipping) {
              postShipping = true;
            }
            if (postShipping) {
              promises.push(Restangular.one('account/address').customPOST($scope.address));
            }
          });
        }
      }

      var businessRequest = null;
      var businessPromises = [];

      if ($scope.acceptExtraPledgeData) {

        //Check Selected Account Type - Organization
        if ($scope.selectedAccountType == 'Organization') {
          //Check if need to make a new one
          if (!$scope.selectedCompany) {
            businessRequest = Restangular.one('account/business').customPOST($scope.businessSelected).then(function(success) {
              businessData.business_id = success.business_organization_id;
              attachBusinessToAddressPhone(businessData.business_id, businessPromises, $scope.address, $scope.phoneInfo, businessData);
            });
          }

          //No need to make a new one
          if ($scope.selectedCompany) {
            attachBusinessToAddressPhone($scope.selectedCompany.business_organization_id, businessPromises, $scope.address, $scope.phoneInfo, businessData, promises, pledgeAttributes);
          }
        }

        if ($scope.selectedAccountType == 'Individual') {
          attachBusinessToAddressPhone(null, businessPromises, $scope.address, $scope.phoneInfo, businessData, promises, pledgeAttributes);
        }

        return;
      }

      //Just Pledge
      addAddressPhoneNumber(null, businessPromises, $scope.address, $scope.phoneInfo, false);
      //Resolve Address/Phone
      $q.all(businessPromises).then(function(resolved) {
        // loop through the results and find value
        angular.forEach(resolved, function(value) {
          if (value.address_id) {
            businessData.address_id = value.address_id;
            $scope.selectedAddressID = value.address_id;
          }
          if (value.phone_number_id) {
            businessData.phone_id = value.phone_number_id;
            $scope.chosenPhoneNumberId = value.phone_number_id;
          }
        });

        //Pledge
        generateTokenOrPledge(promises, pledgeAttributes, businessData);
      });

    } else {
      $rootScope.scrollToError();
    }
  }

  //Resolves all promise chains and then calls Pledge with final constructed Pledge Obj
  $scope.resolvePromiseChain = function(promises, pledgeAttributes, businessData) {
    // wait until all the above requests return promises and got resolved
    $q.all(promises).then(function(resolved) {
      // loop through the results and find value
      angular.forEach(resolved, function(value) {
        if (value.cards) {
          $scope.selectedCardID = value.cards[0].stripe_account_card_id;
          $scope.pledgerAccountConnected == true;
        } else if (value.stripe_account_card_id) {
          $scope.selectedCardID = value.stripe_account_card_id;
        }
        if (value.address_id) {
          $scope.selectedAddressID = value.address_id;
        }
        if (value.business_organization_id) {
          $scope.business_organization_id = value.business_organization_id;
        }
      });

      if($scope.forceAnonymousPledge) {
        $scope.anonymous_contribution = 1;
      }

      // setup the object for POST request
      var pledgeInfo = {
        stripe_account_card_id: $scope.selectedCardID,
        pledge_level_id: $scope.pledgeLevel,
        amount: $scope.totalAmount,
        shipping_address_id: $scope.selectedAddressID || '',
        phone_number_id: $scope.chosenPhoneNumberId,
        anonymous_contribution: $scope.anonymous_contribution,
        anonymous_contribution_partial: $scope.partial_anonymous_contribution,
        attributes: JSON.stringify(pledgeAttributes),
        use_sca: 1
      };

      if ($scope.acceptExtraPledgeData && ($scope.selectedAccountType == 'Organization')) {
        if (businessData) {
          if ($scope.selectedCompany && $scope.selectedCompany.hasOwnProperty('business_organization_id')) {
            pledgeInfo['business_organization_id'] = parseInt($scope.selectedCompany.business_organization_id);
          } else {
            pledgeInfo['business_organization_id'] = parseInt(businessData.business_organization_id);
          }
          if ($scope.selectedAddressID) {
            pledgeInfo['shipping_address_id'] = parseInt($scope.selectedAddressID);
          }
          if ($scope.chosenPhoneNumberId) {
            pledgeInfo['phone_number_id'] = parseInt($scope.chosenPhoneNumberId);
          }
        }
      }

      if ($scope.couponCodeValid && $scope.currentCoupon) {
        pledgeInfo['coupon_code'] = $scope.currentCoupon.code;
      }

      //if website tipping is enabled
      if ($scope.tippingOptions.toggle) {
        if ($scope.tip.dollar_amount && $scope.tip.dollar_amount != 0) {
          pledgeInfo.amount_tip = parseFloat($scope.tip.dollar_amount).toFixed(2);
          if ($scope.tippingOptions.toggle_process_tips_immediately) {
            pledgeInfo.force_tip_processing = true;
          }
        }
      }

      // if backer approve as charity
      if (pledgeAttributes.hasOwnProperty('charity') && pledgeAttributes['charity']) {
        if (pledgeAttributes['charity'].charity_final_confirmation) {
          pledgeInfo.charity_helper = 1;
        }
      }

      if ($scope.contributionMessage) {
        pledgeInfo.note = $scope.contributionMessage;
      }

      if ($scope.pledgeReplace) {
        var country, validShipping = false;
        angular.forEach($scope.rewardsQueue, function(value) {
          if (!country && value.shipOptions) {
            country = value.shipOptions[0].country;
          }
          if (value.shipOptions && ((value.shipOptions[0].shipping_option_type_id == 2 && value.shipOptions[0].country == country) || value.shipOptions[0].shipping_option_type_id == 1)) {
            validShipping = true;
          }
        });
        if (!validShipping && $scope.requiresShipping) {
          msg = {
            'header': 'pledge_campaign_replace_specific_country_message'
          }
          $rootScope.floatingMessage = msg;
          return;
        }
        Restangular.one('campaign', $scope.campaign_id).one('pledge', $scope.replaceId).customDELETE().then(function(success) {
          var promises = [];
          //Direct Contribution
          if ($scope.directContribution) {
            // setup the object for POST request
            var pledgeInfo = {
              stripe_account_card_id: $scope.selectedCardID,
              amount: $scope.pledgeAmount,
              anonymous_contribution: $scope.anonymous_contribution,
              anonymous_contribution_partial: $scope.partial_anonymous_contribution,
              use_sca: 1
            };
            
            var pledge = PledgeService.makePledge(pledgeInfo, $scope.campaign_id, $scope.stripe_pledge, $scope.stripe_tip)
            promises.push(pledge);
          }

          if ($scope.rewardsQueue.length) {
            angular.forEach($scope.rewardsQueue, function(value, key, obj) {
              var total = (value.shipOptions) ? $scope.total(value.shipOptions[0].cost) : value.amount;

              var pledgeInfo = {
                stripe_account_card_id: $scope.selectedCardID,
                pledge_level_id: value.pledge_level_id,
                amount: total,
                shipping_address_id: $scope.selectedAddressID || '',
                phone_number_id: $scope.chosenPhoneNumberId,
                anonymous_contribution: $scope.anonymous_contribution,
                anonymous_contribution_partial: $scope.partial_anonymous_contribution,
                attributes: JSON.stringify(value.pledgeAttributes),
                use_sca: 1
              };

              var pledge = PledgeService.makePledge(pledgeInfo, $scope.campaign_id, $scope.stripe_pledge, $scope.stripe_tip);

              obj[key].total_cost_with_quantity = 0;
              obj[key].total_cost_with_quantity = value.amount * value.quantity;
              for (var i = 0; i < value.quantity; i++) {
                promises.push(pledge);
              }
            });
          }
          $scope.resolvePledgeReplaceQueue(promises);
        }, function(failed) {
          var error_msg = failed.data.errors.entry_backer_id[0].message;
          msg = {
            'header': error_msg
          }
          $rootScope.floatingMessage = msg;
        });
      }
      //Regular Pledge Start
      if (!$scope.pledgeReplace) {
        PledgeService.makePledge(pledgeInfo, $scope.campaign_id, $scope.stripe_pledge, $scope.stripe_tip).then(function(success){
          $scope.tip.dollar_amount = parseFloat(success.amount_tip).toFixed(2);
          msg = {
            'header': 'pledge_campaign_pledge_success'
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          if ($scope.site_stripe_tokenization_settings.toggle && $scope.cardNumberElement) {
            // Remove CC Clear - Monday December 3, 2018
            // $scope.cardNumberElement.clear();
            // $scope.cardExpiryElement.clear();
            // $scope.cardCvcElement.clear();
          }
          // display a thank you note
          $('.pledge-thank-you')
            .modal({
              selector: {
                close: '.actions .button',
                deny: '.actions .negative, .actions .deny, .actions .cancel, .close'
              },
              closable: false
            }).modal('show');

          if (typeof $scope.campaign.settings != 'undefined' && $scope.campaign.contribution_redirect) {
            $timeout(function() {
              window.location.href = $scope.campaign.contribution_redirect;
            }, 5000);
          } else if (typeof $scope.site_campaign_pledge_redirect != 'undefined' && $scope.site_campaign_pledge_redirect.toggle) {
            $timeout(function() {
              window.location.href = $scope.site_campaign_pledge_redirect.url;
            }, 5000);
          }
          // put campaign_backer in User
          var data = {
            campaign_backer: 1,
          };
          UserService.updateUserData(data);
          if ($scope.public_settings.site_campaign_ecommerce_analytics && $scope.public_settings.site_campaign_ecommerce_analytics.toggle) {
            sendGATransaction(success, $scope.public_settings.site_campaign_ecommerce_analytics.code);
          }
          if ($scope.public_settings.site_campaign_facebook_analytics && $scope.public_settings.site_campaign_facebook_analytics.toggle) {
            sendFBTransaction(success, $scope.public_settings.site_campaign_facebook_analytics.code);
          }
          if ($scope.public_settings.site_campaign_referralcandy_analytics && $scope.public_settings.site_campaign_referralcandy_analytics.toggle) {
            sendRCTransaction(
              success, 
              $scope.public_settings.site_campaign_referralcandy_analytics.id);
          }
        }, function(failed) { // Maximum funds allowed
          errorHandling(failed);

          $('#finalpledge').removeClass('disabled');
          $scope.failed_code = failed.data.code;

          if ($scope.failed_code === 'account_campaign_transaction_max_allowed_funds_raised') {
            $translate('account_campaign_transaction_max_allowed_funds_raised').then(function(value) {
              $scope.responseMsg = value;
            });
          } else {
            $translate('Card_is_invalid').then(function(value) {
              $scope.responseMsg = value;
              StripeService.getPledgerAccount().then(function(success) {
                // assuming pledgers only have one account
                success = success[0];
                if (success == null) {
                  $scope.pledgerAccountConnected = false;
                  $scope.toggle.newCard = false; // show setup new card section if no existing account
                  $scope.oldcard = false;
                } else {
                  $scope.toggle.newCard = true; // hide setup new card if there are existing cards
                  $scope.pledgerAccountConnected = true;
                  $scope.pledgerAccountID = success.stripe_account_id;
                  $scope.pledgerCards = success.cards;

                  if (success.cards.length > 0) {
                    $scope.oldcard = true;
                  } else {
                    $scope.oldcard = false;
                  }
                }
              });
            });
          }

        });
      }
      //Regular Pledge End

    }, function(failed) { // Check for credit card expiration date
      $('#finalpledge').removeClass('disabled');
      errorHandling(failed);

    });
  };

  $scope.resolvePledgeReplaceQueue = function(promises) {
    $q.all(promises).then(function(resolved) {
      msg = {
        'header': 'pledge_campaign_pledge_success'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      if ($scope.site_stripe_tokenization_settings.toggle && $scope.cardNumberElement) {
        $scope.cardNumberElement.clear();
        $scope.cardExpiryElement.clear();
        $scope.cardCvcElement.clear();
      }
      // display a thank you note
      $('.pledge-thank-you')
        .modal({
          selector: {
            close: '.actions .button',
            deny: '.actions .negative, .actions .deny, .actions .cancel, .close'
          },
          closable: false
        }).modal('show');
      // put campaign_backer in User
      var data = {
        campaign_backer: 1,
      };
      UserService.updateUserData(data);
    }, function(failed) { // Maximum funds allowed
      errorHandling(failed);

      $('#finalpledge').removeClass('disabled');
      $scope.failed_code = failed.data.code;

      if ($scope.failed_code === 'account_campaign_transaction_max_allowed_funds_raised') {
        $translate('account_campaign_transaction_max_allowed_funds_raised').then(function(value) {
          $scope.responseMsg = value;
        });
      } else {
        $translate('Card_is_invalid').then(function(value) {
          $scope.responseMsg = value;
          StripeService.getPledgerAccount().then(function(success) {
            // assuming pledgers only have one account
            success = success[0];
            if (success == null) {
              $scope.pledgerAccountConnected = false;
              $scope.toggle.newCard = false; // show setup new card section if no existing account
              $scope.oldcard = false;
            } else {
              $scope.toggle.newCard = true; // hide setup new card if there are existing cards
              $scope.pledgerAccountConnected = true;
              $scope.pledgerAccountID = success.stripe_account_id;
              $scope.pledgerCards = success.cards;

              if (success.cards.length > 0) {
                $scope.oldcard = true;
              } else {
                $scope.oldcard = false;
              }
            }
          });
        });
      }

    });
  };

  $scope.stateTypes = [];
  $scope.Cities = function(term) {
    var cityID = null; // variable to hold city ID
    var countryID = null;
    var count = 0;
    if (term) {
      Geolocator.searchCities(term).then(function(cities) {
        angular.forEach(cities, function(value) {
          if (value.country_id == '211') {
            $scope.stateTypes[count] = value;
            count++;
          }
        });
      });
    }
  };

  /* get information from form */
  $scope.cardSelected = function(card, index) {
    $scope.selectedCardID = card.stripe_account_card_id;
    $scope.stripe_account_id = card.stripe_account_id;
    $scope.toggle.selectedCard = true;
    $scope.cardindex = index;


    $scope.vlaueofindex = $('#cardinfo').attr('value');
    $('#deletemodal').css("visibility", "visible");
  };

  $scope.openModalById = function(id) {
    $('.ui.modal#' + id).modal('show');
  };

  //card deleted
  $scope.deleteCard = function() {

    StripeService.deleteCard($scope.stripe_account_id, $scope.selectedCardID).then(function() {
      $scope.pledgerCards.splice($scope.cardindex, 1);
      $("#carddropdown option[value='$scope.vlaueofindex']").remove();

      $('.dropdown.card-select').dropdown('restore defaults');


    });
  };

  $scope.tipTypeSelection = function(type) {
    $scope.tipTypeError = false;
    $scope.tip = { value: null, dollar_amount: 0, type: 'Dollar' };
    if (type == 'tiers') {
      if ($scope.tippingOptions.tiers[0]) {
        $scope.updateTierValues();
        $scope.tip = { value: $scope.tippingOptions.tiers[0].value, dollar_amount: $scope.tippingOptions.tiers[0].dollar_amount, type: $scope.tippingOptions.tiers[0].type, name: $scope.tippingOptions.tiers[0].name, index: 0 };

        $scope.tipTiersDefaultName = ($scope.tippingOptions.toggle_tier_names) ? $scope.tippingOptions.tiers[0].name : '';
        $scope.tipTiersDefaultAmount = $scope.tippingOptions.tiers[0].dollar_amount;
        var percentString = $scope.tipTiersDefaultName + ' - ' + $filter('formatCurrency')($scope.tipTiersDefaultAmount, $scope.tipInfo.code_iso4217_alpha, $scope.public_setting.site_campaign_decimal_option);
        $('.tip-tiers').dropdown('set text', percentString);
      }
    } else if (type == 'dynamic') {
      if ($scope.tippingOptions.toggle_dynamic_min_max && $scope.tippingOptions.dynamic_min) {
        $scope.tip.value = $scope.tippingOptions.dynamic_min;
        $scope.tip.dollar_amount = $scope.tippingOptions.dynamic_min;
      }
    }

    $scope.selectedTipType = type;
  };

  $scope.tipTierSelection = function(value, type, dollarAmount, name, index) {
    $scope.tip = { value: parseFloat(value), dollar_amount: parseFloat(dollarAmount), type: type, name: name, index: index };
  };

  $scope.updateTierValues = function() {
    angular.forEach($scope.tippingOptions.tiers, function(value) {
      if (value.type == "Percent") {
        value.dollar_amount = ((value.value / 100) * $scope.pledgeAmount);
      } else {
        value.dollar_amount = value.value;
      }

      if(!$scope.combineTip){
        if (value.dollar_amount < $scope.lowestAmount) {
          value.dollar_amount += $scope.lowestAmount;
        }
      }
    });
  }

  function sendGATransaction(success, gaId) {
    var ea = { //ecommerce analytics
      'id': success.id,
      'affiliation': $scope.campaign.name,
      'revenue': success.amount,
      'name': $scope.rname
    };
    var name = ($scope.rname) ? $scope.rname : 'contribution';

    var script = "<script>" +
      "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){" +
      "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o)," +
      "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)" +
      "})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');" +
      
      "ga('create','" + gaId + "', 'auto', {'name': 'ecommerceTracking'});" +

      "ga('ecommerceTracking.require', 'ecommerce');" +

      "ga('ecommerceTracking.ecommerce:addTransaction',{" +
      "    'id': '" + ea.id + "'," +
      "    'affiliation': '" + ea.affiliation + "'," +
      "    'revenue': '" + ea.revenue + "'," +
      "  });" +

      "ga('ecommerceTracking.ecommerce:addItem',{" +
      "    'id': '" + ea.id + "'," +
      "    'price': '" + ea.revenue + "'," +
      "    'name': '" + name + "'," +
      "  });" +
      "ga('ecommerceTracking.ecommerce:send');" +
      "ga('send', 'pageview');" +
      "</script>";

    $scope.gaScript = $sce.trustAsHtml(script);
  }

  function sendFBTransaction(success, fbId) {
    var ea = { //ecommerce analytics
      'id': success.id,
      'affiliation': $scope.campaign.name,
      'revenue': success.amount,
      'name': $scope.rname
    };
    var name = ($scope.rname) ? $scope.rname : 'contribution';

    var script = "<script>console.log('Facebook Pixel ready with ID"+fbId+"');"+
    "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};"+
    "if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];"+
    "s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '"+fbId+"');fbq('track', 'PageView');"+
    "</script><noscript><img height='1' width='1' style='display:none'src='https://www.facebook.com/tr?id="+fbId+"&ev=PageView&noscript=1'/></noscript><!-- End Facebook Pixel Code -->";

    $scope.fbScript = $sce.trustAsHtml(script);
  }

  function sendRCTransaction(success, appId) {

    var rcData = {
      appId: appId,
      unixTimestamp: Math.floor(Date.now() / 1000),
      invoiceNumber: success.entry_backer_id,
      firstName: $scope.user.first_name,
      lastName: $scope.user.last_name,
      email: $scope.user.email,
      amount: $scope.pledgeAmount,
      currencyCode: $scope.campaign.currencies[0].code_iso4217_alpha
    };

    Restangular.one('portal').customGET('integration/referral-candy', {
      "email": rcData.email,
      "first_name": rcData.firstName,
      "invoice_amount": rcData.amount,
      "timestamp": rcData.unixTimestamp
    }).then(function(success) {

      rcData.hash = success.signature;

      console.log(success);
      console.log(rcData);

      var popsicle = 
          '<div id="refcandy-popsicle" data-app-id="'+appId+'" data-fname="'+rcData.firstName+'" data-lname="'+rcData.lastName+'" data-email="'+rcData.email+'" data-amount="'+rcData.amount+'" data-currency="'+rcData.currencyCode+'" data-timestamp="'+rcData.unixTimestamp+'" data-external-reference-id="'+rcData.invoiceNumber+'" data-signature="'+rcData.hash+'"></div>'+
          '<script>(function(e){var t,n,r,i,s,o,u,a,f,l,c,h,p,d,v;z="script";l="refcandy-purchase-js";c="refcandy-popsicle";p="go.referralcandy.com/purchase/";t="data-app-id";r={email:"a",fname:"b",lname:"c",amount:"d",currency:"e","accepts-marketing":"f",timestamp:"g","referral-code":"h",locale:"i","external-reference-id":"k",signature:"ab"};i=e.getElementsByTagName(z)[0];s=function(e,t){if(t){return""+e+"="+encodeURIComponent(t)}else{return""}};d=function(e){return""+p+h.getAttribute(t)+".js?lightbox=1&aa=75&"};if(!e.getElementById(l)){h=e.getElementById(c);if(h){o=e.createElement(z);o.id=l;a=function(){var e;e=[];for(n in r){u=r[n];v=h.getAttribute("data-"+n);e.push(s(u,v))}return e}();o.src="//"+d(h.getAttribute(t))+a.join("&");return i.parentNode.insertBefore(o,i)}}})(document);</script>';
      var mint = 
          '<div id="refcandy-mint" data-app-id="'+appId+'" data-fname="'+rcData.firstName+'" data-lname="'+rcData.lastName+'" data-email="'+rcData.email+'" data-amount="'+rcData.amount+'" data-currency="'+rcData.currencyCode+'" data-timestamp="'+rcData.unixTimestamp+'" data-external-reference-id="'+rcData.invoiceNumber+'" data-signature="'+rcData.hash+'"></div>'+
          '<script>(function(e){var t,n,r,i,s,o,u,a,f,l,c,h,p,d,v;z="script";l="refcandy-purchase-js";c="refcandy-mint";p="go.referralcandy.com/purchase/";t="data-app-id";r={email:"a",fname:"b",lname:"c",amount:"d",currency:"e","accepts-marketing":"f",timestamp:"g","referral-code":"h",locale:"i","external-reference-id":"k",signature:"ab"};i=e.getElementsByTagName(z)[0];s=function(e,t){if(t){return""+e+"="+encodeURIComponent(t)}else{return""}};d=function(e){return""+p+h.getAttribute(t)+".js?aa=75&"};if(!e.getElementById(l)){h=e.getElementById(c);if(h){o=e.createElement(z);o.id=l;a=function(){var e;e=[];for(n in r){u=r[n];v=h.getAttribute("data-"+n);e.push(s(u,v))}return e}();o.src="//"+d(h.getAttribute(t))+a.join("&");return i.parentNode.insertBefore(o,i)}}})(document);</script>';

      if($scope.public_settings.site_campaign_referralcandy_analytics.enable_popup){
        $scope.rcScript = $sce.trustAsHtml(popsicle);
      }
      else{
        $scope.rcScript = $sce.trustAsHtml(mint);
      }
  
    });

  }

  function setNativeName(placeValue) {
    if (placeValue.country_native_name) {
      placeValue.country = placeValue.country_native_name;
    }
    if (placeValue.subcountry_native_name) {
      placeValue.subcountry = placeValue.subcountry_native_name;
    }
    if (placeValue.city_native_name) {
      placevalue.city = placeValue.city_native_name;
    }
    return placeValue;
  }

  // Choosing the type of shipping
  function chooseShipping(address) {
    if (address != undefined && address != null) {
      $scope.shipping_error = false;
      $scope.shipOptions = [];
      if ($scope.selectedReward && $scope.selectedReward.shipping && !$scope.pledgeReplace) {
        var len = $scope.selectedReward.shipping.length;
        var count = 0;
        var found = false;
        angular.forEach($scope.selectedReward.shipping, function(val) {
          if (!found) {

            if (val.country_id == address.country_id && val.subcountry_id == address.subcountry_id && val.shipping_option_type_id == 3) {
              if ($scope.native_lookup) {
                val = setNativeName(val);
              }
              $scope.shipOptions = [{
                shipping_option_type: val.shipping_option_type,
                shipping_option_type_id: val.shipping_option_type_id,
                country: val.country,
                sub_country: val.subcountry,
                cost: val.cost
              }];
              count = count - len;
              found = true;
            } else {
              count++;
            }

            if (count == len) {
              var dummy = 0;
              angular.forEach($scope.selectedReward.shipping, function(v) {
                if (v.country_id == address.country_id && v.shipping_option_type_id == 2) {
                  if ($scope.native_lookup) {
                    v = setNativeName(v);
                  }
                  $scope.shipOptions = [{
                    shipping_option_type: v.shipping_option_type,
                    shipping_option_type_id: v.shipping_option_type_id,
                    country: v.country,
                    sub_country: '',
                    cost: v.cost
                  }];
                  dummy = dummy - len;
                  found = true;
                } else {
                  dummy++;
                }
                if (dummy == len) {
                  angular.forEach($scope.selectedReward.shipping, function(value) {
                    if (value.shipping_option_type_id == 1) {
                      $scope.shipOptions = [{
                        shipping_option_type: value.shipping_option_type,
                        shipping_option_type_id: value.shipping_option_type_id,
                        country: '',
                        sub_country: '',
                        cost: value.cost
                      }];
                      found = true;
                    }
                  });
                  if ($scope.shipOptions.length < 1) {
                    $scope.shipping_error = true;
                  }
                }
              });
            }
          }
        });
      } else if ($scope.rewardsQueue.length && $scope.pledgeReplace) {
        $scope.totalPledgeReplacementShippingCost = 0;
        angular.forEach($scope.rewardsQueue, function(selectedReward) {
          if (selectedReward.shipping) {
            $scope.pledgeReplaceShippingFound = true;
            var len = selectedReward.shipping.length;
            var count = 0;
            var found = false;
            angular.forEach(selectedReward.shipping, function(val) {
              if (!found) {
                if (val.country_id == address.country_id && val.subcountry_id == address.subcountry_id && val.shipping_option_type_id == 3) {
                  msg = {
                    'header': 'pledge_campaign_replace_sub_country_message'
                  }
                  $rootScope.floatingMessage = msg;

                  count = count - len;
                  found = true;
                } else {
                  count++;
                }

                if (count == len) {
                  var dummy = 0;
                  angular.forEach(selectedReward.shipping, function(v) {
                    if (v.country_id == address.country_id && v.shipping_option_type_id == 2) {
                      if ($scope.native_lookup) {
                        v = setNativeName(v);
                      }
                      selectedReward.shipOptions = [{
                        shipping_option_type: v.shipping_option_type,
                        shipping_option_type_id: v.shipping_option_type_id,
                        country: v.country,
                        sub_country: '',
                        cost: v.cost
                      }];
                      dummy = dummy - len;
                      found = true;
                    } else {
                      dummy++;
                    }
                    if (dummy == len) {
                      angular.forEach(selectedReward.shipping, function(value) {
                        if (value.shipping_option_type_id == 1) {
                          selectedReward.shipOptions = [{
                            shipping_option_type: value.shipping_option_type,
                            shipping_option_type_id: value.shipping_option_type_id,
                            country: '',
                            sub_country: '',
                            cost: value.cost
                          }];
                          found = true;
                        }
                      });
                      if (selectedReward.shipOptions.length < 1) {
                        $scope.shipping_error = true;
                      }
                    }
                  });
                }
              }
            });
          }
          //Calculate total costs 
          if (selectedReward.shipOptions) {
            $scope.totalPledgeReplacementShippingCost += parseFloat(selectedReward.shipOptions[0].cost);
          }
        });
      }

      setSubCountryAltShipping(address.subcountry_id);

    }
  }

  function setSubCountryAltShipping(subcountry_id) {
    if($scope.alt_shipping && $scope.site_campaign_alt_city_input_toggle) {
      Restangular.one('locale').customGET('city', {"subcountry_id": subcountry_id}).then(function(success) {
        if(success && success.length) {
          $scope.address.city_id = success[0].city_id;
        }
      });
    }
  }

  $scope.shippingOptionString = function(shipOpID) {
    // Check using ID instead of String
    // == 1 is Worldwide Shipping
    if (shipOpID == 1) {
      $translate('Worldwide Shipping').then(function(value) {
        $scope.shipping_option = value;
      });
    }
    // == 2 is Country Specific Shipping
    else if (shipOpID == 2) {
      $translate('Country Specific Shipping').then(function(value) {
        $scope.shipping_option = value;
      });
    }
    // == 3 is Subcountry Specific Shipping
    else {
      $translate('SubCountry Specific Shipping').then(function(value) {
        $scope.shipping_option = value;
      });
    }
  }

  // select city to ship to
  $scope.citySelect = function(city) {
    chooseShipping(city);
  }
  $scope.addressSelected = function(address) {
    chooseShipping(address);
    $scope.toggle.selectedAddress = true;
    $scope.selectedAddress = address;
    $scope.address.country_id = address.country_id;
    $scope.selectedAddressID = address.address_id;
  };

  // Prepare data caching for location filter
  $scope.cities = [];

  // search city input
  $scope.searchCities = function(term) {
    var cityID = null; // variable to hold city ID
    var countryID = null;
    var native_lookup = $scope.native_lookup == true ? 1 : 0;

    if (term) {
      // Check setting here to choose which one to use, check the layout
      // This one is to search cities directly
      if (!$scope.alt_shipping) {
        Geolocator.searchCities(term, native_lookup).then(function(cities) {
          $scope.cities = cities;
        });
      }
      // This one is to search with subcountry id to limit the area
      else {
        Geolocator.searchCitiesBySubcountry(term, $scope.selectedSubcountry.selected.id, native_lookup).then(function(cities) {
          $scope.cities = cities;
          if (!cities || cities instanceof Array && cities.length === 0) {
            Geolocator.searchCitiesBySubcountry(term, $scope.selectedSubcountry.selected.id, 0).then(function(cities) {
              $scope.cities = cities;
            });
          } else if (native_lookup) {
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
            $scope.cities = cities;
          }
        });
      }
    }
  }

  function getCountries() {
    return Geolocator.getCountries().then(function(countries) {
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
      return $scope.countries;
    });
  }

  $scope.contactPhoneSelected = function(selectedNumber) {
    $scope.toggle.selectedNumber = true;
    $scope.chosenPhoneNumberId = selectedNumber.phone_number_id;
  }

  $scope.phoneTypeSelected = function(type) {
    $scope.newNumberCreated.phonetype = type;
  }

  /*
    Get phone number for individual and business
    paramID is to specify this function to grab info from the campaign manager
    @params paramID - An object that contains person_id and business_organization_id
    */
  function getPhoneNumber(paramID) {
    Restangular.one('account/').customGET('phone-number', paramID).then(function(success) {
      if (success.personal) {
        $scope.hasNumber = true;
        $scope.toggle.newNumber = true;
        $scope.personalNumbers = success.personal;
        $scope.businessNumbers = success.business;
      } else {
        $scope.hasNumber = false;
        $scope.toggle.newNumber = false;
      }
    });
  }

  $scope.userCompanySelected = function(selectedCompany) {
    $scope.selectedCompany = selectedCompany;
  }

  function getUserCompany(paramID) {
    Restangular.one('account/').customGET('business', paramID).then(function(success) {
      $scope.userCompanies = success.plain();
      if (!$scope.userCompanies.length) {
        $scope.toggle.newCompany = false;
      } else {
        $scope.toggle.newCompany = true;
      }
    });
  }

  var paramID = {
    "person_id": UserService.id
  }

  function checktype(id) {
    var type;
    angular.forEach($scope.phonetype, function(value) {
      if (value.id == id) {
        type = value.name;
      }

    });
    return type;
  }

  $scope.setCountry = function(country) {
    $scope.selectedCountry.selected = country;
  }

  function getSubcountries(countryID) {
    Geolocator.getSubcountriesByCountry(countryID).then(function(subcountries) {
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

  // watching variable changes
  $scope.$watch('selectedCity.selected', function(value, oldValue) {
    if (value != oldValue && value) {
      cityID = Geolocator.lookupCityID(value.name);

      if (cityID) {
        $scope.address.city_id = cityID;
      }
      countryID = Geolocator.lookupCountryID(value.name);
      if (countryID) {
        $scope.address.country_id = countryID;
      }
      $scope.citySelect(value);
      $('#select-city .select-error').remove();
      $('#select-city').removeClass('error');
    }
  });

  $scope.$watch("selectedCountry.selected", function(value, oldValue) {
    if (value != oldValue && value) {
      if ($scope.selectedReward) {
        chooseShipping(value);
      }
      $scope.selectedCity.selected = undefined;
      $scope.selectedSubcountry.selected = undefined;
      getSubcountries(value.id);
    }
  });

  $scope.$watch("selectedSubcountry.selected", function(value, oldValue) {
    if (value != oldValue && value) {
      chooseShipping(value);
      $('#select-subcountry .select-error').remove();
      $('#select-subcountry').removeClass('error');
    }
  });

  $scope.$watch('address.country_id', function(countryID) {
    var worldWide = null;
    var country = null;
    if (countryID) {
      // find out the index
      angular.forEach($scope.shippingOption, function(item, key) {
        if (item.country_id == countryID) {
          country = key;
          // return; // break loop when match country found
        }

        if (item.shipping_option_type_id == 1) {
          worldWide = key;
        }
      });

      // determine country or worldwide
      if (country != null) {
        $scope.costIndex = country;
      } else if (worldWide != null) {
        $scope.costIndex = worldWide;
      }
    }
  });

  $scope.goBackToCampaign = function() {
    try {
      window.location.href = $scope.campaign.uri_paths[0].path;
    } catch (e) {
      console.error(e);
    }
  }

  // total cost of shipping
  $scope.total = function(shipping, tip, coupon) {

    $scope.totalAmount = parseFloat($scope.pledgeAmount);

    if (coupon) {
      if (coupon.discount_percentage > 0) {
        var discount = ($scope.pledgeAmount * (coupon.discount_percentage / 100.0));
        $scope.amountDiscounted = discount;
        $scope.totalAmount = Math.max(0, $scope.pledgeAmount - discount);
      }
      if (coupon.discount_amount > 0) {
        $scope.amountDiscounted = coupon.discount_amount > $scope.pledgeAmount ? $scope.pledgeAmount : coupon.discount_amount;
        $scope.totalAmount = Math.max(0, $scope.pledgeAmount - coupon.discount_amount);
      }
    }

    if (shipping) {
      $scope.totalAmount += parseFloat(shipping);
    }

    // Calculate tip with current total amount & display this as total ONLY on the template to avoid backend issues
    if (tip) {
      $scope.totalAmountPlusTip = parseFloat($scope.totalAmount) + parseFloat(tip);
      return $scope.totalAmountPlusTip;
    }

    var total = parseFloat($scope.totalAmount);
    return total;
  }

  //COUPON Entered by Customer
  $scope.couponCode = '';
  $scope.couponCodeValid = true;

  $scope.applyCoupon = function(couponCode) {
    $scope.couponAppliedMessage = $translate.instant("pledge_campaign_searching_coupon");
    Restangular.one('campaign', $scope.campaign_id).one('coupon?code='+couponCode+'&pledge_level_id='+$scope.pledgeLevel).customGET().then(
      function(success) {
        $scope.currentCoupon = success;
        $scope.couponCodeValid = true;
        if (success.discount_percentage > 0) $scope.couponAppliedMessage = success.discount_percentage+"%";
        if (success.discount_amount > 0) 
          $scope.couponAppliedMessage = $filter('formatCurrency')(success.discount_amount, $scope.campaign.currencies[0].code_iso4217_alpha, $scope.public_setting.site_campaign_decimal_option);
        $scope.couponAppliedMessage += " "+$translate.instant('pledge_campaign_discount_applied');
      },
      function(failure) {
        $scope.couponCodeValid = false;
        $scope.currentCoupon = undefined;
        $scope.couponCode = "";
        $scope.couponAppliedMessage = $translate.instant('pledge_campaign_coupon_invalid');
      }
    );
  }

  $scope.replacedTotal = function(amount, shipping, tip, coupon) {
    $scope.totalAmount = parseFloat($scope.pledgeAmount);

    if (coupon) {
      if (coupon.discount_percentage > 0) {
        var discount = ($scope.pledgeAmount * (coupon.discount_percentage / 100.0));
        $scope.amountDiscounted = discount;
        $scope.totalAmount = Math.max(0, $scope.pledgeAmount - discount);
      }
      if (coupon.discount_amount > 0) {
        $scope.amountDiscounted = coupon.discount_amount > $scope.pledgeAmount ? $scope.pledgeAmount : coupon.discount_amount;
        $scope.totalAmount = Math.max(0, $scope.pledgeAmount - coupon.discount_amount);
      }
    }

    if (shipping) {
      $scope.totalAmount += parseFloat(shipping);
    }

    // Calculate tip with current total amount & display this as total ONLY on the template to avoid backend issues
    if (tip) {
      $scope.totalAmountPlusTip = parseFloat($scope.totalAmount) + parseFloat(tip);
      return $scope.totalAmountPlusTip;
    }

    var total = parseFloat($scope.totalAmount);
    return total;
  }

  $scope.accountTypeSelected = function(type) {
      $scope.selectedAccountType = type;
      if (type == 'Organization') {
        getUserCompany(paramID);
      }
    }
    // duration to reach the destination
  $scope.current_host = $location.host();
  var m_names = new Array("January", "February", "March",
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December");
  var currdate = new Date();
  $scope.currdate = (m_names[currdate.getMonth()]) + " " + currdate.getDate() + " " + currdate.getFullYear() + " " + currdate.getHours() + ":" + currdate.getMinutes();



  $scope.$watch('campaignFundingGoal.value', function(newValue, oldValue) {
    if (newValue != oldValue && newValue) {
      if ($scope.campaign && typeof newValue === "string") {
        if ($scope.pledgeReplace) {
          var t = 0;
          angular.forEach($scope.rewardsQueue, function(selectedReward) {
            t += (parseFloat(selectedReward.amount) * parseInt(selectedReward.quantity));
          });
          total_replaced = parseInt(t) + parseInt(newValue);
          $scope.totalReplacedCost = $rootScope.formatFundingGoal("" + total_replaced);
          $scope.pledgeAmount = $rootScope.formatFundingGoal(newValue);
        } else {
          $scope.pledgeAmount = $rootScope.formatFundingGoal(newValue);
        }
        if ($scope.selectedTipType == 'tiers') {
          $scope.updateTierValues();
        }
        if ($scope.tip.value && $scope.tip.value != 0 && $scope.tip.type == 'Percent') {
          var index = ($routeParams.tipindex) ? $routeParams.tipindex : 0;
          var tipAmount = $scope.tippingOptions.tiers[index].dollar_amount;

          angular.forEach($scope.tippingOptions.tiers, function(value, key, obj) {
            if ($scope.tip.index == key) {
              tipAmount = value.dollar_amount;
            }
          });

          $scope.tip.dollar_amount = tipAmount;

          if ($scope.tippingOptions.toggle_tier_names) {
            var percentString = $scope.tip.name + ' - ';
          } else {
            var percentString = ''
          }
          percentString = percentString + $filter('formatCurrency')(tipAmount, $scope.tipInfo.code_iso4217_alpha, $scope.public_setting.site_campaign_decimal_option);
          $('.tip-tiers').dropdown('set text', percentString)
        }
      }
    }
  });

  // Animated scroll to rewards section
  $scope.scrollToRewardParam = function() {
    $location.search({});
    $location.path($scope.campaign_loc).search('scroll_to_reward', 1);
  }
});