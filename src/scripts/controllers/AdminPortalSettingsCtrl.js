//------------------------------------------------------
//      PORTAL SETTINGS TAB / SETTINGS CONTROLLER
//------------------------------------------------------
app.controller('AdminPortalSettingsCtrl', function($scope, $rootScope, $location, $timeout, $window, Restangular, $translatePartialLoader, $translate, $q, SiteLogoService, ThemeService, UserService, DisqusShortnameService, FileUploadService, PortalSettingsService, StripeService, CurrencyService, Geolocator, LANG, AUTH_SCHEME, VideoLinkService, API_URL, ANONYMOUS_COMMENT, SOCIAL_SHARING_OPTIONS, $http) {
  angular.element(document).ready(function(){
    if($rootScope.showNewPlatformModal === true){
      delete $rootScope.showNewPlatformModal;
      $('.ui.modal.new-platform-modal').modal({
        onApprove: function() {
          var tab = $('#payment-settings-tab');
          var elem = angular.element(tab);
          var data_tab = elem.attr('data-tab');
          // remove active class
          elem.parent().find('.item').removeClass('active');
          elem.parent().parent().find('.tab').removeClass('active');
          // add active class to clicked tab
          elem.addClass('active');
          $("[data-tab='" + data_tab + "']").addClass('active');
        }
      }).modal('show');
    }
  })
  $scope.froalaOptionsMain = {};
  $scope.froalaOptionsBot = {};
  $scope.froalaOptionsExplore = {};
  $scope.froalaFooterCustomHtmlBlock = {};
  $scope.clearMessage = function() {
    $rootScope.floatingMessage = [];
  }
  var user = UserService;
  var stripeAdminAccounts;
  var msg = [];
  // Values and objects for block alignment settings
  // It contains the keys for translations and values for CSS style
  var blockAlignmentsTexts = ["tab_portalsetting_block_alignment_left", "tab_portalsetting_block_alignment_center", "tab_portalsetting_block_alignment_right"];
  $scope.blockAlignConfigs = [];
  var values = ["left", "center", "right"];
  for (var i = 0; i < blockAlignmentsTexts.length; i++) {
    var obj = {
      "text": blockAlignmentsTexts[i],
      "value": values[i]
    }
    $scope.blockAlignConfigs.push(obj);
  }
  $scope.searchFilters = ['name', 'campaign ID', 'description', 'manager'];
  $scope.run_mode = true;
  $scope.runModeSelected = 1;
  $scope.runMode = [{
    name: "Time_Based_Campaign",
    id: 1
  }, {
    name: "Continuous_Campaign",
    id: 2
  }];

  $scope.inlineContributionOptions = {
    register: false,
    guest: false,
    express: false
  }

  $scope.stripe_no_keys = false;

  // Set default explore sort
  $translate(['tab_portalsetting_set_explore_default_sort_dropdown_random', 'tab_portalsetting_set_explore_default_sort_dropdown', 'tab_portalsetting_set_explore_default_sort_dropdown_featured']).then(function(value) {
    var defaultText = value.tab_portalsetting_set_explore_default_sort_dropdown;
    var featured_text = value.tab_portalsetting_set_explore_default_sort_dropdown_featured;
    var random_text = value.tab_portalsetting_set_explore_default_sort_dropdown_random;

    $scope.exploreDefaultSort = [{
      type: defaultText,
      value: 'default',
    }, {
      type: featured_text,
      value: '-featured,display_priority',
    }, {
      type: random_text,
      value: 'entry_id%'
    }];
  });

  $('.ui.accordion')
    .accordion();

  $('.site-attributes-non-admin-disallow')
    .popup();

  $scope.setRunMode = function(mode) {
    $scope.runModeSelected = mode.id;
    $scope.public_settings.site_campaign_defaults_runMode = $scope.runModeSelected;
    if (mode.id == 2) {
      $scope.run_mode = false;
    } else {
      $scope.run_mode = true;
    }
  }

  function initiateOptions(foption) {
    for (var prop in $rootScope.froalaOptions) {
      if ($rootScope.froalaOptions.hasOwnProperty(prop)) {
        foption[prop] = $rootScope.froalaOptions[prop];
      }
    }
  }

  if ($rootScope.isConnectWithStripe) {
    $timeout(function() {
      $("a[data-tab='portal-settings/payment-settings']").click();
    });
  }

  initiateOptions($scope.froalaOptionsMain);
  initiateOptions($scope.froalaOptionsBot);
  initiateOptions($scope.froalaOptionsExplore);
  initiateOptions($scope.froalaFooterCustomHtmlBlock);
  $scope.loginRedirect = {
    "text": "",
    "link": ""
  }
  $scope.registerRedirect = {
    "text": "",
    "link": ""
  }

  // select semantic tabs

  var refreshCount = 0;

  $scope.selectTab = function($event) {
    var $elem = $event.target;
    var elem = angular.element($elem);
    var data_tab = elem.attr('data-tab');
    // remove active class
    elem.parent().find('.item').removeClass('active');
    elem.parent().parent().find('.tab').removeClass('active');
    // add active class to clicked tab
    elem.addClass('active');
    $("[data-tab='" + data_tab + "']").addClass('active');
  }

  $scope.showDirectTransaction = true;
  $scope.showMarketPlace = false;
  $scope.stripe_test_clientId = '';
  $scope.stripe_test_secretkey = '';
  $scope.stripe_test_publishkey = '';

  $scope.stripe_live_clientId = '';
  $scope.stripe_live_secretkey = '';
  $scope.stripe_live_publishkey = '';

  // Comment System
  $scope.comment = '';

  $scope.menuSelect = {
    headerSelect: [],
    footerLeftSelect: [],
    footerMiddleSelect: [],
    footerRightSelect: [],
  };
  $scope.widget_makr_links = [{
    name: '',
    widget_instance_id: '',
    api_key: '',
    widgetmakr_account_id: ''
  }];

  $scope.paymenttype = [{
      name: 'Stripe',
      type_id: 1
    },
    {
      name: 'PayPal',
      type_id: 3
    },
    // {
    //   name: 'Widget Makr',
    //   type_id: 2
    // }
  ];

  //Decimal Option
  $scope.decimal_option_modes = [{
    name: 'tab_portalsetting_Decimal_Option_display_use',
    type_id: 1
  }, {
    name: "tab_portalsetting_Decimal_Option_display_only",
    type_id: 2
  }, {
    name: "tab_portalsetting_Decimal_Option_disable",
    type_id: 3
  }];

  $scope.customSection = [{
    name: 'Business Profile Section',
    type_id: 1
  }, {
    name: 'Personal Profile Section',
    type_id: 2
  }];
  $scope.custom_section_id = 1;
  var countries_orig;

  $scope.auth_scheme = AUTH_SCHEME;
  $scope.cur_type = 1;
  $scope.customType = function(type) {
    if (type.type_id == 1) {
      $scope.cur_type = 1;
      $scope.custom_section_id = 1;
      if (typeof $scope.public_settings.site_campaign_business_section_custom == 'undefined' || $scope.public_settings.site_campaign_business_section_custom.length == 0) {
        $scope.custom_link = [{
          name: ''
        }];
      } else {
        $scope.custom_link = $scope.public_settings.site_campaign_business_section_custom;
      }
    }
    if (type.type_id == 2) {
      $scope.cur_type = 2;
      $scope.custom_section_id = 2;
      if (typeof $scope.public_settings.site_campaign_personal_section_custom == 'undefined' || $scope.public_settings.site_campaign_personal_section_custom.length == 0) {

        if ($scope.public_settings.site_campaign_personal_section_enhanced) {
          $scope.custom_link = [{
            name: '',
            option: 'Text',
            dropdown_array: null,
            profile_step_show: false,
            profile_setting_register_show: false,
            profile_setting_show: false,
            register_show: false
          }];
        } else {
          $scope.custom_link = [{
            name: ''
          }];
        }

      } else {

        $scope.custom_link = $scope.public_settings.site_campaign_personal_section_custom;
      }
    }
  }
  $scope.customTypeOption = ['Text', 'Dropdown'];
  $scope.customFieldType = function(index, link) {
    link.option = $scope.customTypeOption[index];
  }
  $scope.removeCustomFiled = function(link, index) {
    $scope.custom_link.splice(index, 1);
  }

  $scope.addCustomField = function(arr) {
    var link = {
      name: '',
      option: 'Text',
      validate: '',
      dropdown_array: null,
      profile_step_show: false,
      profile_setting_register_show: false,
      profile_setting_show: false,
      register_show: false
    };
    if (arr)
      arr.push(angular.copy(link));
  }

  $scope.saveCustomField = function() {
    $scope.customFieldSaveAttrPermission();
    //$scope.clearMessage();
    var valcheck = true;
    msg = {
      'loading': true,
      'loading_message': 'saving_settings'
    }
    $rootScope.floatingMessage = msg;

    angular.forEach($scope.custom_link, function(val, key, obj) {
      if (obj[key].dropdown_array && !Array.isArray(obj[key].dropdown_array)) {
        var array = obj[key].dropdown_array.split(",");
        obj[key].dropdown_array = array;
      }
    });

    var publicSettings;
    if ($scope.custom_section_id == 1) {
      publicSettings = {
        site_campaign_business_section_custom: $scope.custom_link
      }
    } else if ($scope.custom_section_id == 2) {
      publicSettings = {
        site_campaign_personal_section_custom: $scope.custom_link,
        site_campaign_personal_section_enhanced: $scope.public_settings.site_campaign_personal_section_enhanced
      }
    }

    if ($scope.public_settings.site_campaign_personal_section_enhanced) {
      angular.forEach($scope.custom_link, function(value) {
        if (!value.name.length) {
          valcheck = false;
        }
      });
      if (!valcheck) {

        $timeout(function() {
          $rootScope.removeFloatingMessage();
          // Inform the user if there was an error
          msg = {
            'header': 'pcustom_name_error'
          }
          $rootScope.floatingMessage = msg;
        }, 500);

        return;
      }
    }

    Restangular.one('portal/setting/public').customPUT(publicSettings).then(function(success) {
      msg = {
        'header': "success_message_save_changes_button",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });

  }
  $scope.paymentType = function(type) {

    $scope.paymentId = type.type_id;
    if ($scope.paymentId == 1) {
      $scope.showStripe = true;
      $scope.showWidgetMkr = false;
      $scope.showPayPal = false;
    }
    if ($scope.paymentId == 2) {
      $scope.showStripe = false;
      $scope.showWidgetMkr = true;
      $scope.showPayPal = false;
    }
    if ($scope.paymentId == 3) {
      $scope.showStripe = false;
      $scope.showPayPal = true;
    }
  }

  $rootScope.$on('$locationChangeSuccess', function() {
    updateSiteMenu();
  });

  $scope.menuOptionsFaq = {
    '0': 'tab_portalsetting_faq_tab_option1',
    '1': 'tab_portalsetting_faq_tab_option2',
    '2': 'tab_portalsetting_faq_tab_option3'
  }
  $scope.menuOptionsBacker = {
    '0': 'tab_portalsetting_backers_tab_option1',
    '1': 'tab_portalsetting_backers_tab_option2',
    '2': 'tab_portalsetting_backers_tab_option3',
    '3': 'tab_portalsetting_backers_tab_option4'
  }
  $scope.menuOptionsComment = {
    '0': 'tab_portalsetting_comments_tab_option1',
    '1': 'tab_portalsetting_comments_tab_option2'
  }
  $scope.menuOptionsStream = {
    '0': 'tab_portalsetting_streams_tab_option1',
    '1': 'tab_portalsetting_streams_tab_option2',
    '2': 'tab_portalsetting_streams_tab_option3'
  }

  // Translate the values in the array and put them back into the array
  // Eliminating the chances of big code rearrangement
  translateArrays($scope.menuOptionsFaq);
  translateArrays($scope.menuOptionsBacker);
  translateArrays($scope.menuOptionsComment);
  translateArrays($scope.menuOptionsStream);

  function translateArrays(arrayObj) {
    var menuOptionsFaq = [];
    for (var menuFaq in arrayObj) {
      menuOptionsFaq.push(arrayObj[menuFaq]);
    }
    $translate(menuOptionsFaq).then(function(success) {
      for (var menuFaq in arrayObj) {
        arrayObj[menuFaq] = success[menuOptionsFaq[menuFaq]];
      }
    });
  }

  $scope.menuSections = ['Navigation', 'Footer 1', 'Footer 2'];
  $scope.menuShow = false;
  $scope.menu_links = [];

  $scope.color_list = [{
    index: 1,
    name: 'purple',
  }, {
    index: 2,
    name: 'light green',
  }, {
    index: 3,
    name: 'teal',
  }, {
    index: 4,
    name: 'blue',
  }, {
    index: 5,
    name: 'red',
  }, {
    index: 6,
    name: 'orange',
  }, {
    index: 7,
    name: 'yellow',
  }, {
    index: 8,
    name: 'dark purple',
  }, {
    index: 9,
    name: 'black',
  }, {
    index: 10,
    name: 'white',
  }, {
    index: 11,
    name: 'sky blue',
  }, {
    index: 12,
    name: 'pink',
  }];

  setTimeout(function() {

    $translate(['button_color', 'table_color', 'banner_color', 'font_color', 'reward_block_color', 'top_nav_background_color', 'top_nav_font_color', 'footer_background_color', 'footer_font_color']).then(function(value) {

      $scope.color_sections = [{
        name: value.button_color,
        index: 1,
        var_name: 'button_color',
      }, {
        name: 'Table',
        index: 2,
        var_name: 'table_color',
      }, {
        name: 'Banner',
        index: 3,
        var_name: 'banner_color',
      }, {
        name: 'Font',
        index: 4,
        var_name: 'font_color',
      }, {
        name: 'Reward Block',
        index: 5,
        var_name: 'reward_block_color',
      }, {
        name: 'Top Nav Background',
        index: 6,
        var_name: 'top_nav_background_color',
      }, {
        name: 'Top Nav Font',
        index: 7,
        var_name: 'top_nav_font_color',
      }, {
        name: 'Footer Background',
        index: 8,
        var_name: 'footer_background_color',
      }, {
        name: 'Footer Font',
        index: 9,
        var_name: 'footer_font_color',
      }];

    });

  }, 1000);
  updateSiteMenu();

  function processStripeApplicationAccount() {
    if ($scope.stripe_setting.publishable_key.indexOf('test') >= 0) {
      $('#testbtn').addClass('positive');
      $scope.testmode = true;
      $scope.livemode = false;
      $scope.stripe_test1_clientId = $scope.stripe_setting.client_id;
      $scope.stripe_test1_publishkey = $scope.stripe_setting.publishable_key;
      $scope.stripe_test1_secretkey = $scope.stripe_setting.secret_key;
    } else if ($scope.stripe_setting.publishable_key.indexOf('live') >= 0) {
      $('#livebtn').addClass('positive');
      $scope.livemode = true;
      $scope.stripe_live1_clientId = $scope.stripe_setting.client_id;
      $scope.stripe_live1_publishkey = $scope.stripe_setting.publishable_key;
      $scope.stripe_live1_secretkey = $scope.stripe_setting.secret_key;
    }

    // if ( ($scope.standard_mode == null && $scope.express_mode == null) || 
    //       $scope.standard_mode ) {
    //   $scope.standard_mode = true;
    //   $scope.express_mode = false;
    //   $('#standard-btn').addClass('positive');
    // } else if ($scope.express_mode) {
    //   $scope.express_mode = true;
    //   $scope.standard_mode = false;
    //   $('#express-btn').addClass('positive');
    // }

    if ($scope.stripe_setting.country_id) {
      // retrieve stripe currency
      $scope.setStripeCountry($scope.stripe_setting.country_id);
    }
    Restangular.one('account/stripe/connect').customGET().then(function(stripe_accounts) {
      stripeAdminAccounts = stripe_accounts.plain();
      $scope.admin_stripe_accounts = stripe_accounts.plain();

      filterStripeAccount(stripeAdminAccounts, $scope.livemode);
      if ($rootScope.isConnectWithStripe) {
        $timeout(function() {
          $(".direct-transaction").dropdown("set selected", 0);
        }, 1000);
      }
    });
    var cur_mode = (typeof $scope.livemode === 'defined' || !$scope.livemode) ? 'test' : 'live';
    $scope.setMode(cur_mode);
  }

  // portal settings stripe settings request
  function getStripeApplication() {
    Restangular.one('account/stripe/application').customGET().then(function(success) {
      $scope.stripe_setting = success.plain();
      $scope.stripe_setting_origin = angular.copy(success);
      processStripeApplicationAccount();
    }, function(failure) {
      if (failure.data.code == "entity_not_found") {
        //If stripe application is removed or does not exist, use dummy
        if (typeof $scope.stripe_setting == 'undefined' || !$scope.stripe_setting) {
          $scope.stripe_setting = {
            "connect_code": null,
            "secret_key": "",
            "created": "2018-10-09 13:26:07.195958-07",
            "disabled": 0,
            "stripe_account_id": "1",
            "person_id": user.person_id,
            "email": null,
            "id": "1",
            "country_id": null,
            "stripe_account_type_id": 1,
            "currency_id": null,
            "client_id": "",
            "modified": "2018-10-10 20:20:32.108648-07",
            "access_token": null,
            "publishable_key": "",
            "refresh_token": null,
            "user_id": "acct_non_valid",
            "not_in_database": true,
            "stripe_standard_mode": true,
            "stripe_express_mode": false
          };
          $scope.stripe_setting_origin = angular.copy($scope.stripe_setting);

          processStripeApplicationAccount();
        }
      }
    });

  }

  function filterStripeAccount(stripeAccounts, isLiveMode) {
    $scope.admin_stripe_accounts = stripeAdminAccounts.filter(function(account) {
      return isLiveMode ? /sk_live/.test(account.access_token) : /sk_test/.test(account.access_token);
    });
  }

  // used in portal settings. campaign raise mode
  Restangular.one('campaign/raise-mode').customGET().then(function(success) {
    $scope.raise_modes = success;
    PortalSettingsService.getSettingsObj().then(function(success) {
      angular.forEach($scope.raise_modes, function(mode, index) {
        // id toString
        if (success.public_setting.site_campaign_raise_modes.allowed.indexOf(mode.id) > -1) {
          mode.allowed = true;
          // set default
          if (mode.id == success.public_setting.site_campaign_raise_modes.default) {
            mode.default = true;
          }
        }
      });

    });
  });

  function updateSiteMenu() {
    //site_campaign_hide_creator_info
    Restangular.one('portal/setting').getList().then(
      function(success) {
        // seperate settings into two categories
        $scope.public_settings = {};
        $scope.private_settings = {};
        // loop and categorize the response data. put them into object
        angular.forEach(success, function(value) {
          if (value.setting_type_id == 3) {
            $scope.public_settings[value.name] = value.value;

          } else if (value.setting_type_id == 1) {
            $scope.private_settings[value.name] = value.value;
          }
        });

        updateThemeColor();

        // Set default value of sort if setting is undefined/null
        if (typeof $scope.public_settings.site_set_explore_default_sort == 'undefined' || $scope.public_settings.site_set_explore_default_sort == null) {
          $scope.public_settings.site_set_explore_default_sort = {
            default: $scope.exploreDefaultSort[0].value,
            default_text: $scope.exploreDefaultSort[0].type
          };
        }

        if (typeof $scope.public_settings.site_search_explore === 'undefined' || !$scope.public_settings.site_search_explore) {
          $scope.public_settings.site_search_explore = $scope.searchFilters[0];
        }
        if (typeof $scope.public_settings.site_stripe_tokenization === 'undefined' || !$scope.public_settings.site_stripe_tokenization) {
          $scope.public_settings.site_stripe_tokenization = {
            toggle: false,
            public_stripe_key: ''
          };
        }
        if (typeof $scope.public_settings.site_infinite_scroller === 'undefined' || !$scope.public_settings.site_infinite_scroller) {
          $scope.public_settings.site_infinite_scroller = {
            explore: false,
            featured: false,
            recent: false,
            profile: false
          }
        }
        if (typeof $scope.public_settings.site_default_campaign_rows === 'undefined' || !$scope.public_settings.site_default_campaign_rows) {
          $scope.public_settings.site_default_campaign_rows = {
            featured: 1,
            recent: 1
          }
        }
        if (!$scope.public_settings.site_campaign_defaults_runMode) {
          $scope.public_settings.site_campaign_defaults_runMode = 1;
        }
        if (!$scope.public_settings.site_campaign_currency_id) {
          $scope.public_settings.site_campaign_currency_id = 30;
        }
        if (!$scope.public_settings.site_campaign_enable_campaign_bio) {
          $scope.public_settings.site_campaign_enable_campaign_bio = false;
        }
        if (!$scope.public_settings.site_campaign_faq) {
          $scope.public_settings.site_campaign_faq = {
            name: "",
            description: "",
            toggle: false
          };
        }
        if (typeof $scope.public_settings.site_campaign_hide_profile == 'undefined') {
          $scope.public_settings.site_campaign_hide_profile = false;
        }
        if (!$scope.public_settings.site_campaign_defaults) {
          $scope.public_settings.site_campaign_defaults = {
            hide_fundraise: false,
            fundingGoal: 100000000,
            toggle: false,
            percentage_fee: 10
          };
        }
        if (!$scope.public_settings.site_campaign_defaults.percentage_fee) {
          $scope.public_settings.site_campaign_defaults.percentage_fee = 10;
        }
        if (typeof $scope.public_settings.site_campaign_pledge_redirect == 'undefined' || !$scope.public_settings.site_campaign_pledge_redirect) {
          $scope.public_settings.site_campaign_pledge_redirect = {
            toggle: false,
            url: ''
          };
        }
        // if (!$scope.public_settings.site_campaign_defaults.fundingGoal) {
        //   $scope.public_settings.site_campaign_defaults.fundingGoal = 100000000;
        // }
        getCurrency();

        $scope.default_country = $scope.public_settings.site_theme_default_shipping_country;
        getStripeApplication();
        getPayPalApplication();

        // If paypal is payment gateway default to direct charge
        if ($scope.public_settings.site_payment_gateway == 3) {
          $scope.public_settings.site_campaign_raise_modes.pledge_processing.default = {1:"2", 2:"2"};
        }

        getCountries();
        if ($scope.public_settings.site_theme_banner_is_image === undefined) {
          $scope.public_settings.site_theme_banner_is_image = true;
        }

        $scope.loadPreviewVideo();

        $scope.loginRedirect = $scope.public_settings.site_login_redirect != null ? $scope.public_settings.site_login_redirect : {};
        $scope.registerRedirect = $scope.public_settings.site_register_redirect != null ? $scope.public_settings.site_register_redirect : {};
        $scope.public_settings.site_theme_shipping_native_lookup = $scope.public_settings.site_theme_shipping_native_lookup ? true : false;
        $scope.public_settings.site_theme_campaign_percentage_enabled = $scope.public_settings.site_theme_campaign_percentage_enabled ? true : false;
        if ($scope.public_settings.site_theme_shipping_native_lookup && $scope.default_country) {
          $scope.public_settings.site_theme_default_shipping_country.name = $scope.public_settings.site_theme_default_shipping_country.native_name;
        }

        if (typeof $scope.public_settings.site_verification == "undefined") {
          $scope.public_settings.site_verification = { toggle: false};
        }

        if (typeof $scope.public_settings.social_login == "undefined") {
          $scope.public_settings.social_login = { toggle: false };
        }

        if (typeof $scope.public_settings.site_theme_sticky_menu == "undefined") {
          $scope.public_settings.site_theme_sticky_menu = false;
        }
        if (typeof $scope.public_settings.site_tipping == "undefined") {
          $scope.public_settings.site_tipping = { type: 1, tier_type: 1, tiers: [] };
        } else {
          if (typeof $scope.public_settings.site_tipping.type == "undefined") {
            $scope.public_settings.site_tipping.type = 1;
          }

          if (typeof $scope.public_settings.site_tipping.tier_type == "undefined") {
            $scope.public_settings.site_tipping.tier_type = 1;
          }

          if (typeof $scope.public_settings.site_tipping.tiers == 'undefined') {
            $scope.public_settings.site_tipping.tiers = [];
            $scope.public_settings.site_tipping.tiers.length = 0;
          }
        }
        if (typeof $scope.public_settings.site_campaign_combine_amount_tip == 'undefined') {
          $scope.public_settings.site_campaign_combine_amount_tip = false;
        }
        if ($scope.public_settings.site_payment_gateway == 3) {
          $scope.public_settings.site_campaign_combine_amount_tip = true;
        }

        if (typeof $scope.public_settings.logo_links == 'undefined') {
          $scope.public_settings.logo_links = [];
          $scope.public_settings.logo_links.length = 0;
        }

        if (typeof $scope.public_settings.site_campaign_business_section_custom == 'undefined' || $scope.public_settings.site_campaign_business_section_custom.length == 0) {
          $scope.custom_link = [{
            name: '',
            id: ''
          }];
        } else {
          $scope.custom_link = $scope.public_settings.site_campaign_business_section_custom;
        }

        if ($scope.private_settings.site_campaign_processing_days) {

        } else {
          $scope.private_settings.site_campaign_processing_days = 5;
        }
        $scope.crimson = $scope.private_settings.site_crimson_setting;

        $scope.selected_mode = $scope.public_settings.site_campaign_raise_modes.default-1;

        if ($scope.raise_modes) {
          $('#mode_dtext').text($scope.raise_modes[$scope.selected_mode].description);
        }
        if ($scope.public_settings.site_default_widget_makr_id) {
          $scope.widgetdefault_id = $scope.public_settings.site_default_widget_makr_id;

        }
        if (typeof $scope.public_settings.site_tos_contribution_ui == 'undefined') {
          $('#contribcheck').checkbox('check');
        } else {
          $scope.contrib = $scope.public_settings.site_tos_contribution_ui;
        }

        //site_campaign_hide_creator_info
        if (typeof $scope.public_settings.site_campaign_hide_creator_info == 'undefined') {
          $scope.public_settings.site_campaign_hide_creator_info = false;
        } else {
          $scope.site_campaign_hide_creator_info = $scope.public_settings.site_campaign_hide_creator_info;
          if ($scope.site_campaign_hide_creator_info) {
            $('#hidecheck').checkbox('check');
          }
        }
        // allow_thumbnail_video
        if (typeof $scope.public_settings.site_campaign_allow_thumbnail_video == 'undefined') {
          $scope.public_settings.site_campaign_allow_thumbnail_video = true;
          $('#thumbnail-video-check').checkbox('check');
        } else {
          if ($scope.public_settings.site_campaign_allow_thumbnail_video) {
            $('#thumbnail-video-check').checkbox('check');
          }
        }

        if (typeof $scope.public_settings.site_payment_gateway == 'undefined') {
          $timeout(function() {
            $('#card-type').dropdown('set text', $scope.paymenttype[0].name);
            $('#card-type').dropdown('set selected', $scope.paymenttype[0].type_id);
          });
          $scope.showStripe = true;
        } else {

          angular.forEach($scope.paymenttype, function(value) {
            if (value.type_id == $scope.public_settings.site_payment_gateway) {
              $('#default-payment-text').text(value.name);
              $scope.paymentId = $scope.public_settings.site_payment_gateway;
            }
          });
          if ($scope.public_settings.site_payment_gateway == 3) {
            // PayPal is selected
            $scope.showStripe = false;
            $scope.showWidgetMkr = false;
            $scope.showPayPal = true;
          } else if ($scope.public_settings.site_payment_gateway == 2) {
            $scope.showStripe = false;
            $scope.showWidgetMkr = true;
            $scope.showPayPal = false;
          } else {
            $scope.showStripe = true;
            $scope.showWidgetMkr = false;
            $scope.showPayPal = false;
          }
        }

        if ($scope.public_settings.site_contribute_behaviour.default == 1) { //(Register Ony)
          $scope.inlineContributionOptions.register = true;
          $scope.inlineContributionOptions.guest = false;
          $scope.inlineContributionOptions.express = false;
        }
        if ($scope.public_settings.site_contribute_behaviour.default == 2) { //(Guest Only)
          $scope.inlineContributionOptions.register = false;
          $scope.inlineContributionOptions.guest = true;
          $scope.inlineContributionOptions.express = false;
        }
        if ($scope.public_settings.site_contribute_behaviour.default == 3) { //(Register and Guest)
          $scope.inlineContributionOptions.register = true;
          $scope.inlineContributionOptions.guest = true;
          $scope.inlineContributionOptions.express = false;
        }
        if ($scope.public_settings.site_contribute_behaviour.default == 4) { //(Disabled)
          $scope.inlineContributionOptions.register = false;
          $scope.inlineContributionOptions.guest = false;
          $scope.inlineContributionOptions.express = false;
        }
        if ($scope.public_settings.site_contribute_behaviour.default == 5) { //(Express only)
          $scope.inlineContributionOptions.register = false;
          $scope.inlineContributionOptions.guest = false;
          $scope.inlineContributionOptions.express = true;
        }
        if ($scope.public_settings.site_contribute_behaviour.default == 6) { //(Register and Express)
          $scope.inlineContributionOptions.register = true;
          $scope.inlineContributionOptions.guest = false;
          $scope.inlineContributionOptions.express = true;
        }
        if ($scope.public_settings.site_contribute_behaviour.default == 7) { //(Guest and Express)
          $scope.inlineContributionOptions.register = false;
          $scope.inlineContributionOptions.guest = true;
          $scope.inlineContributionOptions.express = true;
        }
        if ($scope.public_settings.site_contribute_behaviour.default == 8) { //(Register and Guest and Express)
          $scope.inlineContributionOptions.register = true;
          $scope.inlineContributionOptions.guest = true;
          $scope.inlineContributionOptions.express = true;
        }


        if (!$scope.public_settings.site_home_page_text.bottom_banner.learn_more_button_text || $scope.public_settings.site_home_page_text.bottom_banner.learn_more_button_text.length == 0) {
          // set default text if button enabled but no custom text
          $scope.public_settings.site_home_page_text.bottom_banner.learn_more_button_text = 'Learn more';
        }

        if (!$scope.public_settings.site_home_page_text.bottom_banner.learn_more_button_text_link || $scope.public_settings.site_home_page_text.bottom_banner.learn_more_button_text_link.length == 0) {
          // set default text if button enabled but no custom text
          $scope.public_settings.site_home_page_text.bottom_banner.learn_more_button_text_link = 'about';
        }

        if (!$scope.public_settings.site_home_page_text.main_banner.button_text || $scope.public_settings.site_home_page_text.main_banner.button_text.length == 0) {
          // set default text if button enabled but no custom text
          $scope.public_settings.site_home_page_text.main_banner.button_text = 'Start Project';
        }

        if (!$scope.public_settings.site_home_page_text.main_banner.button_text_link || $scope.public_settings.site_home_page_text.main_banner.button_text_link.length == 0) {
          // set default text if button enabled but no custom text
          $scope.public_settings.site_home_page_text.main_banner.button_text_link = 'start';
        }

        if (typeof $scope.public_settings.site_home_page_text.bottom_banner.learn_more_display_button == "undefined") {
          // set default text if button enabled but no custom text
          $scope.public_settings.site_home_page_text.bottom_banner.learn_more_display_button = true;
        }
        if (typeof $scope.private_settings.site_stripe == "undefined") {
          $scope.stripe_test_clientId = $scope.stripe_test1_clientId;
          $scope.stripe_test_secretkey = $scope.stripe_test1_secretkey;
          $scope.stripe_test_publishkey = $scope.stripe_test1_publishkey;

          $scope.stripe_live_clientId = $scope.stripe_live1_clientId;
          $scope.stripe_live_secretkey = $scope.stripe_live1_secretkey;
          $scope.stripe_live_publishkey = $scope.stripe_live1_publishkey;

          $scope.stripe_no_keys = true;

        } else {

          $scope.stripe_test_clientId = $scope.private_settings.site_stripe.test.clientId;
          $scope.stripe_test_secretkey = $scope.private_settings.site_stripe.test.secretkey;
          $scope.stripe_test_publishkey = $scope.private_settings.site_stripe.test.publishkey;

          $scope.stripe_live_clientId = $scope.private_settings.site_stripe.live.clientId;
          $scope.stripe_live_secretkey = $scope.private_settings.site_stripe.live.secretkey;
          $scope.stripe_live_publishkey = $scope.private_settings.site_stripe.live.publishkey;
        }

        // Stripe connection mode
        if (($scope.public_settings.stripe_standard_mode == undefined && $scope.public_settings.stripe_express_mode == undefined) ||
             $scope.public_settings.stripe_standard_mode ) {
          $scope.public_settings.stripe_standard_mode = true;
          $scope.public_settings.stripe_express_mode = false;
          $('#standard-btn').addClass('positive');
        } else if ($scope.public_settings.express_mode != undefined && $scope.public_settings.stripe_express_mode) {
          $scope.public_settings.stripe_express_mode = true;
          $scope.public_settings.stripe_standard_mode = false;
          $('#express-btn').addClass('positive');
        }

        $scope.public_settings.site_home_page_text.main_banner.html = $scope.replaceStyleTag($scope.public_settings.site_home_page_text.main_banner.html);
        if (!$scope.public_settings.site_home_page_text.main_banner.block_alignment) {
          $scope.public_settings.site_home_page_text.main_banner.block_alignment = $scope.blockAlignConfigs[1];
        }
        $scope.public_settings.site_home_page_text.bottom_banner.html = $scope.replaceStyleTag($scope.public_settings.site_home_page_text.bottom_banner.html);
        $scope.public_settings.site_explore_page_text.html = $scope.replaceStyleTag($scope.public_settings.site_explore_page_text.html);
        if (!$scope.public_settings.site_explore_page_text.homeSetting) {
          $scope.public_settings.site_explore_page_text.homeSetting = false;
        }
        $scope.featuredproject = $scope.public_settings.site_home_page_text.titles.top_show;
        $scope.newproject = $scope.public_settings.site_home_page_text.titles.bottom_show;
        $scope.recentProjectHideFeatured = $scope.public_settings.recentProjectHideFeatured;

        if (!$scope.public_settings.site_auth_scheme || $scope.public_settings.site_auth_scheme.id == 1) {
          $scope.public_settings.site_auth_scheme = $scope.auth_scheme[0];
        }

        // Show/Hide Campaign Minimum amount message
        if (typeof $scope.public_settings.site_theme_campaign_hide_min_contribute_message == "undefined") {
          $scope.public_settings.site_theme_campaign_hide_min_contribute_message = false;
        }

        if (typeof $scope.public_settings.site_theme_campaign_delayed_funding_setup == "undefined") {
          $scope.public_settings.site_theme_campaign_delayed_funding_setup = false;
        }

        if (typeof $scope.public_settings.site_theme_campaign_delayed_reward_setup == "undefined") {
          $scope.public_settings.site_theme_campaign_delayed_reward_setup = false;
        }

        if (typeof $scope.public_settings.payment_setting_enabled == "undefined") {
          $scope.public_settings.payment_setting_enabled = true;
        }

        if (typeof $scope.public_settings.site_footer_custom_html_block == 'undefined' || !$scope.public_settings.site_footer_custom_html_block.hasOwnProperty('html')) {
          $scope.public_settings.site_footer_custom_html_block = {
            html: ''
          };
        }

        for (var i = 0; i < success.length; i++) {
          if (success[i].name == "site_campaign_fee_currency") {
            $scope.currency_setting = {};
            $scope.currency_setting.currency_ids = [];
            var tmp = success[i].value;
            for (var j = 0; j < tmp.length; j++) {
              $scope.currency_setting.currency_ids.push(tmp[j].currency_id);
            }
          }


          if (success[i].name == "site_favicon") {
            $scope.site_favicon = success[i];
          }
          if (success[i].name == "site_logo") {
            $scope.site_logo = success[i];
          }
          if (success[i].name == "site_theme_main_background") {
            $scope.main_background = success[i];
          }
          if (success[i].name == "site_theme_explore_background") {
            $scope.explore_background = success[i];
          }

          if (success[i].name == "site_load_icon") {
            $scope.site_load_icon = success[i];
          }
          if (success[i].name == "site_load_class") {
            $scope.site_load_class = success[i].value;
          }

          if (success[i].name == "site_api_connection_message") {
            $scope.site_api_connection_message = success[i];
          }
          if (success[i].name == "site_campaign_fee_percentage" && success[i].setting_type_id == 3) {
            $scope.stripe_fee.campaign_fee = success[i].value;
          }

          if ($scope.public_settings.site_theme_campaign_backer_option == null) {
            $('#backer_dtext').text($scope.menuOptionsBacker[1]);
            $('#backer_dtext').removeClass('default');
          } else {
            $('#backer_dtext').text($scope.menuOptionsBacker[$scope.public_settings.site_theme_campaign_backer_option]);
            $('#backer_dtext').removeClass('default');
          }
          if ($scope.public_settings.site_theme_campaign_faq_option == null) {

            $('#faq_dtext').text($scope.menuOptionsFaq[1]);
            $('#faq_dtext').removeClass('default');
          } else {
            $('#faq_dtext').text($scope.menuOptionsFaq[$scope.public_settings.site_theme_campaign_faq_option]);
            $('#faq_dtext').removeClass('default');
          }
          if ($scope.public_settings.site_theme_campaign_comment_option == null) {

            $('#comment_dtext').text($scope.menuOptionsComment[1]);
            $('#comment_dtext').removeClass('default');
          } else {
            $('#comment_dtext').text($scope.menuOptionsComment[$scope.public_settings.site_theme_campaign_comment_option - 1]);
            $('#comment_dtext').removeClass('default');
          }

          if ($scope.public_settings.site_theme_campaign_stream_option == null) {
            $('#stream_dtext').text($scope.menuOptionsStream[1]);
            $('#stream_dtext').removeClass('default');
          } else {
            $('#stream_dtext').text($scope.menuOptionsStream[$scope.public_settings.site_theme_campaign_stream_option]);
            $('#stream_dtext').removeClass('default');
          }

          // Video related setting
          if ($scope.public_settings.site_theme_banner_video_mute == true) {
            $translate("tab_portalsetting_video_toggle_mute_on").then(function(success) {
              $scope.videoMuteToggle = success;
            });
          } else {
            $translate("tab_portalsetting_video_toggle_mute_off").then(function(success) {
              $scope.videoMuteToggle = success;
            });
          }

          // Set default campaign decimal option
          if (typeof $scope.public_settings.site_campaign_decimal_option == "undefined" || $scope.public_settings.site_campaign_decimal_option == 0) {
            $scope.public_settings.site_campaign_decimal_option = 1;
          }

          // -- Comment Settings -- //

          // Default settings
          if (typeof $scope.public_settings.comment_system == "undefined") {
            $scope.public_settings.comment_system = "disqus";
            $scope.comment = "disqus";
            $scope.public_settings.custom_comment_show_comment_picture = true;
            $scope.public_settings.custom_comment_auto_refresh = false;
            $scope.public_settings.custom_comment_anonymous_commenting = ANONYMOUS_COMMENT.anonymous_disabled;
            $scope.public_settings.custom_comment_comment_background_color = "FFFFFF";
            $scope.public_settings.custom_comment_font_color = "000000";
          }

          // Tab to show when refresh
          if ($scope.public_settings.comment_system == "custom") {
            $('#custom-comment').addClass('positive');
            $scope.comment = "custom";
          } else if ($scope.public_settings.comment_system == "disqus") {
            $('#disqus-comment').addClass('positive');
            $scope.comment = "disqus";
          } else if ($scope.public_settings.comment_system == "facebook") {
            $('#facebook-comment').addClass('positive');
            $scope.comment = "facebook";
          }

          // Show checkbox setting
          if ($scope.public_settings.custom_comment_show_comment_picture == true) {
            $('.ui.checkbox#show_comment_picture').checkbox('check');
          }
          if ($scope.public_settings.custom_comment_auto_refresh == true) {
            $('.ui.checkbox#auto_refresh').checkbox('check');
          }
        }

        $scope.anonymousValuesObject = ANONYMOUS_COMMENT;
        $scope.setAnonymousSetting = function(anonymousValue) {
          if (anonymousValue == $scope.anonymousValuesObject.anonymous_disabled) {
            $scope.public_settings.custom_comment_anonymous_commenting_force = false;
            $timeout(function() {
              $("#custom-comment-anonymous-force").checkbox("uncheck");
            });
          }
          $scope.public_settings.custom_comment_anonymous_commenting = anonymousValue;
        }

        $scope.sharingOptions = SOCIAL_SHARING_OPTIONS;
        $timeout(function() {
          // initiate accordion
          // $('.ui.accordion').accordion();
          if ($scope.widgetdefault_id) {
            var id = "d" + $scope.widgetdefault_id;
            $('#' + id).attr("checked", "checked");
          }
          // initiate colors
          $('.main-color-setting .color-item:nth-child(' + $scope.public_settings.site_theme_color.button_color.index + ')').addClass('active');
          $('.table-color-setting .color-item:nth-child(' + $scope.public_settings.site_theme_color.table_color.index + ')').addClass('active');
          $('.banner-color-setting .color-item:nth-child(' + $scope.public_settings.site_theme_color.banner_color.index + ')').addClass('active');
          $('.font-color-setting .color-item:nth-child(' + $scope.public_settings.site_theme_color.font_color.index + ')').addClass('active');
          $('.reward-color-setting .color-item:nth-child(' + $scope.public_settings.site_theme_color.reward_block_color.index + ')').addClass('active');
          $('.top-nav-background-color-setting .color-item:nth-child(' + $scope.public_settings.site_theme_color.top_nav_background_color.index + ')').addClass('active');
          $('.top-nav-font-color-setting .color-item:nth-child(' + $scope.public_settings.site_theme_color.top_nav_font_color.index + ')').addClass('active');
          $('.footer-background-color-setting .color-item:nth-child(' + $scope.public_settings.site_theme_color.footer_background_color.index + ')').addClass('active');
          $('.footer-font-color-setting .color-item:nth-child(' + $scope.public_settings.site_theme_color.footer_font_color.index + ')').addClass('active');

          if ($scope.featuredproject == 1) {
            $('.ui.checkbox #featured').checkbox('check');
          }
          if (!$scope.featuredproject) {
            $('.ui.checkbox #featured').checkbox('check');
          }

          if ($scope.newproject == 1) {
            $('.ui.checkbox #new').checkbox('check');
          }
          if (!$scope.newproject) {
            $('.ui.checkbox #new').checkbox('check');
          }

          if ($scope.recentProjectHideFeatured == 1) {
            $('.ui.checkbox #hide-featured-in-recent').checkbox('check');
          }
          if (!$scope.recentProjectHideFeatured) {
            $('.ui.checkbox #hide-featured-in-recent').checkbox('check');
          }

          $(".anonymous-commenting").dropdown("set selected", $scope.public_settings.custom_comment_anonymous_commenting);
          $(".dropdown.sharing-options").dropdown("set selected", $scope.public_settings.site_campaign_sharing_options);
        });

      },
      function(failure) {
        msg = {
          'header': failure.data.message,

        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });


  }


  $scope.checkChecked = function($event) {
    var $label = $($event.currentTarget);
    var $parentDiv = $label.parent();

    // False means checked bacause click event happens before semantic class changes
    if (!$parentDiv.hasClass("checked")) {
      $translate("tab_portalsetting_video_toggle_mute_on").then(function(success) {
        $scope.videoMuteToggle = success;
      });
    } else {
      $translate("tab_portalsetting_video_toggle_mute_off").then(function(success) {
        $scope.videoMuteToggle = success;
      });
    }
  }

  $scope.stripeSettingsValidation = function() {
    var translation = $translate.instant(['tab_portalsetting_stripe_country_error']);
    var postTranslation = $translate.instant(['tab_portalsetting_post_processing_interval_error']);
    $.fn.form.settings.rules.postProcessingRule = function(param) {
      if (param < 1) {
        return false;
      } else if (param > 6) {
        return false;
      } else {
        return true;
      }
    }
    $('#stripe-settings-form.ui.form').form({
      stripe_country: {
        identifier: 'stripe_country',
        rules: [{
          type: 'empty',
          prompt: translation.tab_portalsetting_stripe_country_error
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

    $('#post-processing-interval.ui.form').form({
      processing_days: {
        identifier: 'processing_days',
        rules: [{
          type: 'postProcessingRule[param]',
          prompt: postTranslation.tab_portalsetting_post_processing_interval_error
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

  /**
   * Quick checking on if Stripe ID is in the Stripe accounts pool
   *
   * @param {any} stripeId
   * @param {any} stripeAccounts
   * @returns
   */
  function isStripeIdValid(stripeId, stripeAccounts) {
    var isValid = false;
    var stripeAccountsCopy = angular.copy(stripeAccounts);
    for (var i = 0; i < stripeAccountsCopy.length; i++) {
      if (stripeAccountsCopy[i].id == stripeId) {
        isValid = true;
        break;
      }
    }
    return isValid;
  }

  $scope.stripeTokenizationValidation = function() {
    if ($scope.livemode) {
      if ($scope.public_settings.site_stripe_tokenization.toggle &&
        (($scope.stripe_live_publishkey && !$scope.stripe_live_publishkey.length) || ($scope.stripe_live_secretkey && !$scope.stripe_live_secretkey.length))) {
        msg = {
          'header': "stripe_tokenize_error",
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        return false;
      }
    } else if ($scope.testmode) {
      if ($scope.public_settings.site_stripe_tokenization.toggle &&
        (($scope.stripe_test_publishkey && !$scope.stripe_test_publishkey.length) || ($scope.stripe_test_secretkey && !$scope.stripe_test_secretkey.length))) {
        msg = {
          'header': "stripe_tokenize_error",
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        return false;
      }
    }
    return true;
  };


  $scope.checkBank = function() {
    if ($scope.public_settings.site_campaign_country_funding_step) {
      $('.toggle-bank').checkbox('uncheck');
      $scope.public_settings.site_campaign_country_funding_step = false;
    }
  }

  $scope.checkDirect = function() {
    if (!$scope.public_settings.site_campaign_fee_direct_transaction) {
      // $('.toggle-stripe').checkbox('uncheck');
      $('.toggle-stripe').checkbox('check');
      $scope.public_settings.site_campaign_fee_direct_transaction = true;
    }
  }

  $scope.savePayment = function() {
    $scope.valcheck = true;

    if ($scope.showStripe) {
      $scope.countryCurrencyValidate();
    }
    if ($scope.public_settings.payment_setting_enabled) {
      if ($scope.showStripe) {
        $scope.stripeSettingsValidation();
        
        $scope.directTransactionValidation();
        
        // Check Stripe Tokenization Validation
        if (!$scope.stripeTokenizationValidation()) {
          $scope.valcheck = false;
        };
      }
      if ($scope.showPayPal) {
        $scope.paypalValidate();
      }
    }

    // Check for error on the .field element
    $rootScope.scrollToError();

    if ($scope.valcheck) {

      //$scope.clearMessage();
      var privateSettings = {
        site_campaign_processing_days: $scope.private_settings.site_campaign_processing_days,
      };

      // save private settings
      Restangular.one('portal/setting').customPUT(privateSettings).then(function(success) {

        if (!$scope.public_settings.payment_setting_enabled) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();

          $scope.stripe_setting['']
        }

        // $scope.stripe_api_first_save

        //Once save is complete check if direct transaction is saved - need to refresh to reflect properly
        if ($scope.public_settings.site_campaign_fee_direct_transaction) {
          filterStripeAccount(stripeAdminAccounts, $scope.livemode);
          if ($rootScope.isConnectWithStripe) {
            $timeout(function() {
              $(".direct-transaction").dropdown("set selected", 0);
            }, 1000);
          }
        }
      });

      if ($scope.testmode && $scope.stripe_test_publishkey) {
        $scope.public_settings.site_stripe_tokenization = {
          'toggle': true,
          'public_stripe_key': $scope.stripe_test_publishkey
        }
      } else if ($scope.livemode && $scope.stripe_live_publishkey) {
        $scope.public_settings.site_stripe_tokenization = {
          'toggle': true,
          'public_stripe_key': $scope.stripe_live_publishkey
        }
      }

      var publicSettings = {
        payment_setting_enabled: $scope.public_settings.payment_setting_enabled,
        site_payment_gateway: $scope.paymentId,
        site_default_widget_makr_id: $scope.widget_default_id,
        site_theme_portal_company_name: $scope.public_settings.site_theme_portal_company_name,
        site_theme_portal_company_number: $scope.public_settings.site_theme_portal_company_number,
        site_stripe_tokenization: $scope.public_settings.site_stripe_tokenization,
        site_campaign_country_funding_step: $scope.public_settings.site_campaign_country_funding_step,
        site_campaign_country_ids: $scope.public_settings.site_campaign_country_ids,
        site_campaign_contributions: $scope.public_settings.site_campaign_contributions,
        site_campaign_contributions_instruction: $scope.public_settings.site_campaign_contributions_instruction,
        site_campaign_strong_customer_auth: $scope.public_settings.site_campaign_strong_customer_auth,
        stripe_standard_mode: $scope.public_settings.stripe_standard_mode,
        stripe_express_mode: $scope.public_settings.stripe_express_mode,
      };
      if($scope.paypal_setting) {
        publicSettings.paypal_publishable_key = $scope.paypal_setting.publishable_key;
      }
      
      Restangular.one('portal/setting/public').customPUT(publicSettings).then(function(success) {
        if ($scope.paymentId == 3) {
          $scope.savePayPal();
        } else {
          $scope.updateStripe();
        }

      });
    }
  }

  Restangular.one('account/widgetmakr/widget').customGET().then(function(success) {
    if (success.length > 0) {
      $scope.widget_accountID = success[0].widgetmakr_account_id;
      $scope.widgetMakr_link = success;
    } else {
      $scope.widgetMakr_link = [{
        name: '',
        widget_instance_id: '',
        api_key: '',
        widgetmakr_account_id: ''
      }];
    }
  });
  $scope.saveWidgetMkr = function() {
    msg = {
      'loading': true,
      'loading_message': 'saving_settings'
    }
    $rootScope.floatingMessage = msg;
    //$scope.clearMessage();
    var privateSettings = {
      site_crimson_setting: $scope.crimson,
    };
    // save private settings
    Restangular.one('portal/setting').customPUT(privateSettings);
    $scope.widgetMakr_link.forEach(function(link, index) {

      if (link.widgetmakr_account_id > 0) {
        $scope.widget_makr_links.widgetmakr_account_id = link.widget_accountID;
        Restangular.one('account/widgetmakr/widget', link.widgetmakr_account_id).customPUT(link).then(function(success) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      } else {
        Restangular.one('account/widgetmakr/widget').customPOST(link).then(function(success) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      }
    });
  };

  $scope.removeLink = function(link, index) {
    $scope.widgetMakr_link.splice(index, 1);
    if (link.widgetmakr_account_id) {
      Restangular.one('account/widgetmakr/widget', link.widgetmakr_account_id).customDELETE();
    }
  }

  $scope.addWLink = function(arr) {
    var link = {
      name: '',
      widget_instance_id: '',
      api_key: '',
      widgetmakr_account_id: ''
    };
    if (arr)
      arr.push(angular.copy(link));
  }

  $scope.setMode = function(id) {
    // Switch Stripe settings
    if (id === "live") {
      $scope.livemode = true;
      $scope.testmode = false;
      $('#livebtn').addClass('positive');
      $('#testbtn').removeClass('positive');
      if (stripeAdminAccounts != null) {
        filterStripeAccount(stripeAdminAccounts, $scope.livemode);
      }
    } else if (id === "test") {
      $scope.livemode = false;
      $scope.testmode = true;
      $('#livebtn').removeClass('positive');
      $('#testbtn').addClass('positive');
      if (stripeAdminAccounts != null) {
        filterStripeAccount(stripeAdminAccounts, $scope.livemode);
      }
    // Stripe connection mode
    } else if (id === 'standard') {
      $scope.public_settings.stripe_standard_mode = true;
      $scope.public_settings.stripe_express_mode = false;
      $('#standard-btn').addClass('positive');
      $('#express-btn').removeClass('positive');
    } else if (id === 'express') {
      $scope.public_settings.stripe_standard_mode = false;
      $scope.public_settings.stripe_express_mode = true;
      $('#express-btn').addClass('positive');
      $('#standard-btn').removeClass('positive');
    }
    // Choose Comment System
    else if (id === 'custom') {
      $scope.comment = id;
      $('#custom-comment').addClass('positive');
      $('#disqus-comment').removeClass('positive');
      $('#facebook-comment').removeClass('positive');
    } else if (id === 'disqus') {
      $scope.comment = id;
      $('#disqus-comment').addClass('positive');
      $('#custom-comment').removeClass('positive');
      $('#facebook-comment').removeClass('positive');
    } else if (id === 'facebook') {
      $scope.comment = id;
      $('#disqus-comment').removeClass('positive');
      $('#custom-comment').removeClass('positive');
      $('#facebook-comment').addClass('positive');
    }
  }

  $scope.setPayPalMode = function(mode) {
    // Switch Stripe settings
    if (mode === "live") {
      $scope.paypalLiveMode = true;
      $scope.paypalTestMode = false;
      $('.paypal-live').addClass('positive');
      $('.paypal-test').removeClass('positive');
      if ($scope.paypal_setting_live) {
        $scope.paypal_setting = $scope.paypal_setting_live;
        $scope.paypal_live_secretkey = $scope.paypal_setting.secret_key;
        $scope.paypal_live_publishkey = $scope.paypal_setting.publishable_key;
      } else {
        $scope.paypal_live_secretkey = "";
        $scope.paypal_live_publishkey = "";
      }
    } else if (mode === "test") {
      $scope.paypalLiveMode = false;
      $scope.paypalTestMode = true;
      $('.paypal-live').removeClass('positive');
      $('.paypal-test').addClass('positive');
      if ($scope.paypal_setting_test) {
        $scope.paypal_setting = $scope.paypal_setting_test;
        $scope.paypal_test_secretkey = $scope.paypal_setting.secret_key;
        $scope.paypal_test_publishkey = $scope.paypal_setting.publishable_key;
      } else {
        $scope.paypal_live_secretkey = "";
        $scope.paypal_live_publishkey = "";
      }
    }
  }

  $scope.loader_enabled = false;
  if (API_URL.loader_enabled !== undefined) {
    $scope.loader_enabled = API_URL.loader_enabled;
  }

  $scope.uploadLoadIcon = function(files) {

    if (files.length) {
      var params = {
        resource_content_type: 'image',
      };
      var $picNode = $('.loadScreenIcon');
      FileUploadService.upload('portal/resource/file', files, params, $picNode).then(function(success) {
        var data = {
          site_load_icon: success[0].data,
        }
        SiteLogoService.setLoadIcon(data);
        if (!$scope.site_load_icon.value) {
          $scope.site_load_icon.value = {};
        }
        $scope.site_load_icon.value.path_external = success[0].data.path_external;
      });
    }
  }

  $scope.deleteLoadIcon = function() {
    $scope.site_load_icon = {};
    SiteLogoService.setLoadIcon({
      site_load_icon: {}
    });
  }

  $scope.uploadFavIcon = function(files) {

    if (files.length) {
      var params = {
        resource_content_type: 'image',
      };
      var $picNode = $('.websiteFavicon');
      FileUploadService.upload('portal/resource/file', files, params, $picNode).then(function(success) {
        var data = {
          site_favicon: success[0].data,
        }
        SiteLogoService.setFavIcon(data);
        if (!$scope.site_favicon.value) {
          $scope.site_favicon.value = {};
        }
        $scope.site_favicon.value.path_external = success[0].data.path_external;
      });
    }
  }

  var reqDeleteFileArr = [];
  $scope.currentUploadFile = {
    "title": "",
    "description": "",
    "label" : "",
    "fileName": "",
    "icon": "file",
    "path": "",
    "resourceId": -1
  };

  function setFileIconType(mimeType) {
    if (/image/.test(mimeType)) {
      $scope.currentUploadFile.icon = "file image";
    } else if (/pdf/.test(mimeType)) {
      $scope.currentUploadFile.icon = "file pdf";
    } else if (/text/.test(mimeType)) {
      $scope.currentUploadFile.icon = "file text";
    } else if (/excel/.test(mimeType)) {
      $scope.currentUploadFile.icon = "file excel";
    } else if (/powerpoint/.test(mimeType)) {
      $scope.currentUploadFile.icon = "file powerpoint";
    } else if (/msword/.test(mimeType)) {
      $scope.currentUploadFile.icon = "file word";
    } else if (/video/.test(mimeType)) {
      $scope.currentUploadFile.icon = "file video";
    } else if (/audio/.test(mimeType)) {
      $scope.currentUploadFile.icon = "file audio";
    } else {
      $scope.currentUploadFile.icon = "file";
    }
  }


  $scope.uploadStateFile = function(files) {
    if (files.length) {
      $scope.isUploading = true;
      var url = "portal/resource/file";
      FileUploadService.uploadFile(url, files).then(function(success) {
        $scope.currentUploadFile.resourceId = success.data.id;
        $scope.currentUploadFile.title = $scope.currentUploadFile.title ? $scope.currentUploadFile.title : success.data.name;
        $scope.currentUploadFile.fileName = success.data.name;
        $scope.currentUploadFile.path = success.data.path_external;
        //$scope.currentUploadFile.label = success.data.label;
        setFileIconType(success.data.mime_type);
        $scope.isUploading = false;
      }, function(error) {
        $scope.isUploading = false;
      });
    }
  }

  function addToDeleteFileQueue(resourceId) {
    reqDeleteFileArr.push(resourceId);
  }

  $scope.addStateFile = function() {
    if ($("#currentUploadeFileTitleEditor").froalaEditor('codeView.isActive') && $("#currentUploadeFileTitleEditor").froalaEditor('codeView.get') != "") {
      $scope.currentUploadFile.title = $("#currentUploadeFileTitleEditor").froalaEditor('codeView.get');

    }
   // $scope.currentUploadFile.label = $("#currentUploadeFileLabel").val();
    if ($scope.currentUploadFile.fileName) {
      if (!$scope.public_settings.site_campaign_state_settings) {
        $scope.public_settings.site_campaign_state_settings = [];
      }
      $scope.public_settings.site_campaign_state_settings.push($scope.currentUploadFile);

      resetFileUpload();
    }
  }

  function resetFileUpload() {
    $scope.currentUploadFile = {
      "title": "",
      "label" : "",
      "fileName": "",
      "icon": "file",
      "path": "",
      "resourceId": -1
    };
  }
  $scope.cancelStateFile = function() {
    Restangular.one("portal").one("resource/file", $scope.currentUploadFile.resourceId).customDELETE();
    resetFileUpload();
  }
  $scope.removeFileFromSetting = function(fileObjIndex) {
    addToDeleteFileQueue($scope.public_settings.site_campaign_state_settings[fileObjIndex].resourceId);
    $scope.public_settings.site_campaign_state_settings.splice(fileObjIndex, 1);
  }

  $scope.makedefault = function(link) {
    $scope.widget_default_id = link.widgetmakr_account_id;
  }
  $scope.deleteFavIcon = function() {
    $scope.site_favicon = {};
    SiteLogoService.setFavIcon({
      site_favicon: {}
    });
  }

  $scope.uploadLogo = function(files) {
    if (files.length) {
      var params = {
        resource_content_type: 'image',
      };
      var $picNode = $('.websiteLogo');
      FileUploadService.upload('portal/resource/file', files, params, $picNode).then(function(success) {
        var data = {
          site_logo: success[0].data,
        }
        SiteLogoService.setLogoUrl(data);
        if (!$scope.site_logo.value) {
          $scope.site_logo.value = {};
        }
        $scope.site_logo.value.path_external = success[0].data.path_external;
      });
    }
  }

  $scope.deleteLogo = function() {
    $scope.site_logo = {};
    SiteLogoService.setLogoUrl({
      site_logo: {}
    });
    $('.imagePlace .dimmer').dimmer('hide');
    $('.ui.progress.upload-bar').show();
    $('.ui.loader.download-loader').hide();
  }

  $scope.uploadMainBackground = function(files) {
    if (files.length) {
      var params = {
        resource_content_type: 'image',
      };
      var $picNode = $('#home-media-image, #home-media-video');
      FileUploadService.upload('portal/resource/file', files, params, $picNode).then(function(success) {
        var data = {
          site_theme_main_background: success[0].data,
        }
        SiteLogoService.setMainBackground(data);
        if (!$scope.main_background.value) {
          $scope.main_background.value = {};
        }
        $scope.main_background.value.path_external = success[0].data.path_external;
      });
    }
  }

  $scope.deleteMainBackground = function() {
    $scope.main_background = {};
    SiteLogoService.setMainBackground({
      site_theme_main_background: {}
    });
    $('.imagePlace .dimmer').dimmer('hide');
    $('.ui.progress.upload-bar').show();
    $('.ui.loader.download-loader').hide();
  }

  $scope.uploadExploreBackground = function(files) {
    if (files.length) {
      var params = {
        resource_content_type: 'image',
      };
      var $picNode = $('#explore-media-image, #explore-media-video');
      FileUploadService.upload('portal/resource/file', files, params, $picNode).then(function(success) {
        var data = {
          site_theme_explore_background: success[0].data,
        }
        SiteLogoService.setExploreBackground(data);
        if (!$scope.explore_background.value) {
          $scope.explore_background.value = {};
        }
        $scope.explore_background.value.path_external = success[0].data.path_external;
      });
    }
  }

  $scope.deleteExploreBackground = function() {
    $scope.explore_background = {};
    SiteLogoService.setExploreBackground({
      site_theme_explore_background: {}
    });
    $('.imagePlace .dimmer').dimmer('hide');
    $('.ui.progress.upload-bar').show();
    $('.ui.loader.download-loader').hide();
  }

  $scope.menuManage = function(menu) {
    $scope.menuShow = true;
    $scope.menu_selected = menu;
    if (menu == 'Navigation') {
      $scope.menu_links = $scope.public_settings.site_menu_header;
    } else if (menu == 'Footer 1') {
      $scope.menu_links = $scope.public_settings.site_menu_footer.left;
    } else if (menu == "Footer 2") {
      $scope.menu_links = $scope.public_settings.site_menu_footer.right;
    }
  }

  $scope.findPageByID = function(id) {
    for (var i = 0; i < $scope.pages.length; i++) {
      if ($scope.pages[i].id == id) {
        return $scope.pages[i];

      }
    }
    return {};
  }

  $scope.showExternalLinkFields = function() {
    $scope.externalLink = {
      "name": "",
      "path": ""
    };
    $scope.isAddExternalLink = true;
  }

  $scope.setExternalLink = function() {
    if ($scope.externalLink.name != "" && $scope.externalLink.path != "") {
      $scope.menu_links.push($scope.externalLink);
      $scope.isAddExternalLink = false;
      $scope.externalLink = {
        "name": "",
        "path": ""
      };
    }
  }

  $scope.clearExternalLink = function() {
    $scope.isAddExternalLink = false;
    $scope.externalLink = {
      "name": "",
      "path": ""
    };
  }

  $scope.addLink = function(page) {
    var $form = {
      id: page.id,
    };
    var count = 0;
    for (var i = 0; i < $scope.menu_links.length; i++) {
      if ($form.id == $scope.menu_links[i].id) {
        count++;
        break;
      }
    }

    if (count == 0) {
      var insert = true;

      //TODO: update the menus when add, remove or reorder the links
      if ($scope.menu_selected == 'Navigation') {
        if ($scope.menu_links.length >= 7) {
          $translate(['too_many_links']).then(function(value) {
            $scope.$parent.formData.error = value.too_many_links;
          });
          $('.response-error-modal').modal('show');
          insert = false;
        }
      }
      if (insert) {
        $scope.menu_links.push($form);
      }
    }
  }

  $scope.deleteLink = function(link) {
    for (var i = 0; i < $scope.menu_links.length; i++) {
      if (link.id != undefined && $scope.menu_links[i].id == link.id) {
        $scope.menu_links.splice(i, 1);
      } else if (link.name != undefined && $scope.menu_links[i].name == link.name) {
        $scope.menu_links.splice(i, 1);
      }
    }
  }

  $scope.deleteMultiLink = function() {
    $('.menu-item').each(function() {
      if ($(this).find('.t-check-box input').prop('checked')) {
        $scope.deleteLink($(this).scope().link);
      }
    });
  }

  $scope.editLink = function(link) {
    if (!link.edit) {
      link.edit = true;
    } else {
      link.edit = false;
    }
  }

  $scope.showContent = function(e) {
    var tar = $(e.target);
    var content = tar.closest(".portal-settings-wrap").find('.setting-content');
    content.toggle(400);
    var icon = tar.closest(".portal-settings-wrap").find('.ui.block.header i.triangle.icon');
    if (icon.hasClass('right')) {
      icon.removeClass('right');
      icon.addClass('down');
    } else if (icon.hasClass('down')) {
      icon.removeClass('down');
      icon.addClass('right');
    }
  }

  function updateThemeColor() {
    //ThemeService.refresh();
    //legacy colors
      legacyColors = [
        '#FAFAFA',
        '#DB4DDB',
        '#94CA20',
        '#00B5AD',
        '#4C9EE7',
        '#D13F2B',
        '#FF9E35',
        '#FFCC00',
        '#8B69DB',
        '#333333',
        '#ffffff',
        '#00caf2',
        '#FF0081',
      ]

      var root = document.documentElement;
      var colors = $scope.public_settings.site_theme_color;
      if(colors.top_nav_background_color.value){
        root.style.setProperty('--top-nav-bg-color', colors.top_nav_background_color.value);
      }
      else{
        root.style.setProperty('--top-nav-bg-color', legacyColors[colors.top_nav_background_color.index]);
        $scope.public_settings.site_theme_color.top_nav_background_color.value = legacyColors[colors.top_nav_background_color.index];
      }
      if(colors.top_nav_font_color.value){
        root.style.setProperty('--top-nav-font-color', colors.top_nav_font_color.value);
      }
      else{
        root.style.setProperty('--top-nav-font-color', legacyColors[colors.top_nav_font_color.index]);
        $scope.public_settings.site_theme_color.top_nav_font_color.value = legacyColors[colors.top_nav_font_color.index];
      }
      if(colors.table_color.value){
        root.style.setProperty('--table-color', colors.table_color.value);
      }
      else{
        root.style.setProperty('--table-color', legacyColors[colors.table_color.index]);
        $scope.public_settings.site_theme_color.table_color.value = legacyColors[colors.table_color.index];
      }
      //root.style.setProperty('--table-color-hover', colors);
      //root.style.setProperty('--table-color-alter', colors);
      if(colors.reward_block_color.value){
        root.style.setProperty('--reward-color', colors.reward_block_color.value);
      }
      else{
        root.style.setProperty('--reward-color', legacyColors[colors.reward_block_color.index]);
        $scope.public_settings.site_theme_color.reward_block_color.value = legacyColors[colors.reward_block_color.index];
      }
      if(colors.footer_font_color.value){
        root.style.setProperty('--footer-font-color', colors.footer_font_color.value);
      }
      else{
        root.style.setProperty('--footer-font-color', legacyColors[colors.footer_font_color.index]);
        $scope.public_settings.site_theme_color.footer_font_color.value = legacyColors[colors.footer_font_color.index];
      }
      if(colors.footer_background_color.value){
        root.style.setProperty('--footer-bg-color', colors.footer_background_color.value);
      }
      else{
        root.style.setProperty('--footer-bg-color', legacyColors[colors.footer_background_color.index]);
        $scope.public_settings.site_theme_color.footer_background_color.value = legacyColors[colors.footer_background_color.index];
      }
      if(colors.font_color.value){
        root.style.setProperty('--font-color', colors.font_color.value);
      }
      else{
        root.style.setProperty('--font-color', legacyColors[colors.font_color.index]);
        $scope.public_settings.site_theme_color.font_color.value = legacyColors[colors.font_color.index];
      }
      if(colors.button_color.value){
        root.style.setProperty('--button-color', colors.button_color.value);
      }
      else{
        root.style.setProperty('--button-color', legacyColors[colors.button_color.index]);
        $scope.public_settings.site_theme_color.button_color.value = legacyColors[colors.button_color.index];
      }
      if(colors.banner_color.value){
        root.style.setProperty('--banner-color', colors.banner_color.value);
      }
      else{
        root.style.setProperty('--banner-color', legacyColors[colors.banner_color.index]);
        $scope.public_settings.site_theme_color.banner_color.value = legacyColors[colors.banner_color.index];
      }
  }

  // Decimal Notation
  $scope.decimalNotationSelected = function(index) {
    $scope.public_settings.site_campaign_decimal_option = index;
  }
  $scope.faqSelected = function(index) {
    $scope.public_settings.site_faq_option = index;
  }
  $scope.backerSelected = function(index) {
    $scope.public_settings.site_backer_option = index;
  }
  $scope.commentSelected = function(index) {
    index = index + 1;
    $scope.public_settings.site_comment_option = index;
  }
  $scope.streamSelected = function(index) {
    $scope.public_settings.site_stream_option = index;
  }

  $scope.setRaiseMode = function(mode) {
    $scope.public_settings.site_campaign_raise_modes.default = mode.id;
  }

  $scope.setSharingOptions = function(sharingOption) {
    $scope.public_settings.site_campaign_sharing_options = sharingOption;
  }

  // only allow one comment option max
  $('input.comment_display_replace_reward').on('change', function() {
    $('input.comment_display').not(this).prop('checked', false);
    $scope.public_settings.site_campaign_comments_display = false;
  });

  $('input.comment_display').on('change', function() {
    $('input.comment_display_replace_reward').not(this).prop('checked', false);
    $scope.public_settings.site_campaign_comments_display_replace_reward = false;
  });

  // $scope.stateChanged = function() {
  //   let field = document.getElementsByClassName('field');
  //   let checkedValue = document.getElementById("fundraise_default").checked
  //   if (checkedValue) {
  //     $(field).addClass('required');
  //   } else {
  //     $(field).removeClass('required');
  //   }
  // }

  $scope.customFormattingValidation = function() {
    var translation = $translate.instant(['tab_portalsetting_custom_reward_text_error', 'tab_portalsetting_custom_contribution_text_error']);

    $('.ui.form#custom-formatting-form').form({
      custom_reward_text: {
        identifier: 'custom_reward_text',
        rules: [{
          type: 'empty',
          prompt: translation.tab_portalsetting_custom_reward_text_error
        }]
      },
      custom_contribution_text: {
        identifier: 'custom_contribution_text',
        rules: [{
          type: 'empty',
          prompt: translation.tab_portalsetting_custom_contribution_text_error
        }]
      },
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

  $scope.selectTipCurrency = function(currency) {
    $scope.public_settings.site_tip_currency = currency;
  }

  $scope.scrollTo = function(idOrClass) {
    setTimeout(function() { 
      var element = jQuery(idOrClass);
      var offset = element ? element.offset() : null;
      var top = offset ? offset.top : null;
      jQuery("html, body").animate({
        scrollTop: top - 15
      }, "fast");
    });
  }

  $scope.saveCampaignSetting = function() {

    msg = {
      'loading': true,
      'loading_message': 'saving_settings'
    }
    $rootScope.floatingMessage = msg;

    if ($scope.public_settings.site_theme_campaign_min_button_show) {
      $scope.minamount = $scope.public_settings.site_theme_campaign_min_contribute_amount;
    } else {
      $scope.minamount = 1;
    }

    if ($scope.public_settings.site_campaign_private) {
      $scope.public_settings.site_campaign_custom_uri = true;
    }

    if ($scope.public_settings.site_campaign_defaults_runMode == 2) {
      $scope.public_settings.site_campaign_fixed_campaign_duration_end = null;
      $scope.public_settings.site_campaign_fixed_campaign_duration_start = null;
    }

    //Check Raise Modes
    var raise_modes_selected = [];
    $scope.raise_modes.forEach(function(v) {
      if (v.allowed) {
        raise_modes_selected.push(v);
      }
    });
    //Only one selected
    if (raise_modes_selected.length == 1) {
      $scope.setRaiseMode(raise_modes_selected[0]);
    } else if (raise_modes_selected.length == 0) {
      //Show error message
      var translate = $translate.instant(['tab_portalsetting_campaign_raise_mode_error_msg']);
      msg = {
        'header': translate.tab_portalsetting_campaign_raise_mode_error_msg
      };
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      return;
    }

    if($scope.public_settings.site_theme_alt_shipping_layout){
      console.log($scope.public_settings.site_theme_default_shipping_country);
      if(!$scope.public_settings.site_theme_default_shipping_country || !$scope.public_settings.site_theme_default_shipping_country.name){
        var translate = $translate.instant(['tab_portalsetting_campaign_default_shipping_error_msg']);
        msg = {
          'header': translate.tab_portalsetting_campaign_default_shipping_error_msg
        };
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        return;
      }
    }

    /*
    if($scope.public_settings.social_login && $scope.public_settings.social_login.toggle){
      
      if($scope.public_settings.social_login.okta_domain || $scope.private_settings.social_login.okta_clientId){
        var translate = $translate.instant(['tab_portalsetting_campaign_missing_social_login_info']);
        msg = {
          'header': translate.tab_portalsetting_campaign_missing_social_logi_info
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        $scope.scrollTo('#socialLogin-options');
        return;
      }

      console.log($scope.private_settings)
    }
    */

    //make sure all referralcandy data is integrated
    if ($scope.public_settings.site_campaign_referralcandy_analytics && $scope.public_settings.site_campaign_referralcandy_analytics.toggle) {
      if (!$scope.public_settings.site_campaign_referralcandy_analytics.id 
        || !$scope.private_settings.site_campaign_referralcandy_analytics_secret
        || !$scope.private_settings.site_campaign_referralcandy_analytics_secret.secretkey) {
          var translate = $translate.instant(['tab_portalsetting_campaign_missing_referralcandy_info']);
          msg = {
            'header': translate.tab_portalsetting_campaign_missing_referralcandy_info
          };
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          $scope.scrollTo("#refcandy-options");
          return;
      }
    }

    var publicSettings = {
      site_theme_no_campaign_message: $scope.public_settings.site_theme_no_campaign_message,
      site_theme_campaign_grid_display: $scope.public_settings.site_theme_campaign_grid_display,
      site_theme_campaign_min_button_show: $scope.public_settings.site_theme_campaign_min_button_show,
      site_theme_campaign_per_min: $scope.public_settings.site_theme_campaign_per_min,
      site_theme_campaign_per_max: $scope.public_settings.site_theme_campaign_per_max,
      site_theme_campaign_min_contribute_amount: $scope.minamount,
      site_theme_campaign_max_pledge_enabled: $scope.public_settings.site_theme_campaign_max_pledge_enabled,
      site_theme_campaign_max_contribute_amount: $scope.public_settings.site_theme_campaign_max_contribute_amount,
      site_campaign_custom_uri: $scope.public_settings.site_campaign_custom_uri,
      site_theme_campaign_show_start_date: $scope.public_settings.site_theme_campaign_show_start_date,
      site_theme_campaign_display_iso_date: $scope.public_settings.site_theme_campaign_display_iso_date,
      allow_admin_past_dates: $scope.public_settings.allow_admin_past_dates,
      site_theme_alt_shipping_layout: $scope.public_settings.site_theme_alt_shipping_layout,
      site_theme_default_shipping_country: $scope.public_settings.site_theme_default_shipping_country,
      site_theme_shipping_native_lookup: $scope.public_settings.site_theme_shipping_native_lookup,
      site_campaign_raise_modes: {
        allowed: [],
        default: $scope.public_settings.site_campaign_raise_modes.default,
        'pledge_processing': $scope.public_settings.site_campaign_raise_modes.pledge_processing,
      },
      site_theme_campaign_faq_option: $scope.public_settings.site_faq_option,
      site_theme_campaign_backer_option: $scope.public_settings.site_backer_option,
      site_theme_campaign_comment_option: $scope.public_settings.site_comment_option,
      site_theme_campaign_stream_option: $scope.public_settings.site_stream_option,
      site_campaign_continuous_run_mode: $scope.public_settings.site_campaign_continuous_run_mode,
      campaign_raise_mode_only_admin: $scope.public_settings.campaign_raise_mode_only_admin,
      site_theme_campaign_show_reward_section: $scope.public_settings.site_theme_campaign_show_reward_section,
      site_theme_campaign_show_reward_required: $scope.public_settings.site_theme_campaign_show_reward_required,
      site_theme_campaign_show_reward_enable_variation: $scope.public_settings.site_theme_campaign_show_reward_enable_variation,
      site_campaign_show_reward_enable_time_limit: $scope.public_settings.site_campaign_show_reward_enable_time_limit,
      site_theme_campaign_reward_modal: $scope.public_settings.site_theme_campaign_reward_modal,
      site_theme_campaign_reward_html_editor: $scope.public_settings.site_theme_campaign_reward_html_editor,
      site_theme_campaign_percentage_enabled: $scope.public_settings.site_theme_campaign_percentage_enabled,
      site_campaign_percentage_enabled_nonadmin: $scope.public_settings.site_campaign_percentage_enabled_nonadmin,
      site_campaign_percentage_required: $scope.public_settings.site_campaign_percentage_required,
      site_admin_campaign_management_only: $scope.public_settings.site_admin_campaign_management_only,
      campaign_keep_status: $scope.public_settings.campaign_keep_status,
      campaign_always_capture: $scope.public_settings.campaign_always_capture,
      site_campaign_categories_limit_1: $scope.public_settings.site_campaign_categories_limit_1,
      site_campaign_group_management_non_admin: $scope.public_settings.site_campaign_group_management_non_admin,
      site_campaign_always_anonymous_contribution: $scope.public_settings.site_campaign_always_anonymous_contribution,
      site_theme_campaign_contribution_type_radio: $scope.public_settings.site_theme_campaign_contribution_type_radio,
      site_campaign_sharing_options: $scope.public_settings.site_campaign_sharing_options,
      site_campaign_hide_creator_info: $scope.public_settings.site_campaign_hide_creator_info,
      site_campaign_allow_thumbnail_video: $scope.public_settings.site_campaign_allow_thumbnail_video,
      site_campaign_video_required: $scope.public_settings.site_campaign_video_required,
      site_campaign_exclude_shipping_cost: $scope.public_settings.site_campaign_exclude_shipping_cost,
      site_campaign_contact_user: $scope.public_settings.site_campaign_contact_user,
      site_campaign_decimal_option: $scope.public_settings.site_campaign_decimal_option,
      site_theme_campaign_hide_min_contribute_message: $scope.public_settings.site_theme_campaign_hide_min_contribute_message,
      site_theme_campaign_delayed_funding_setup: $scope.public_settings.site_theme_campaign_delayed_funding_setup,
      site_campaign_private: $scope.public_settings.site_campaign_private,
      dedicated_campaign_files: $scope.public_settings.dedicated_campaign_files,
      campaign_content_suggestion_enabled: $scope.public_settings.campaign_content_suggestion_enabled,
      campaign_content_suggestion: $scope.public_settings.campaign_content_suggestion,
      site_campaign_charity_helper_enable: $scope.public_settings.site_campaign_charity_helper_enable,
      site_campaign_charity_helper_alternate_form: $scope.public_settings.site_campaign_charity_helper_alternate_form,
      site_campaign_charity_helper_percentage: $scope.public_settings.site_campaign_charity_helper_percentage,
      site_theme_campaign_contract_number_enable: $scope.public_settings.site_theme_campaign_contract_number_enable,
      site_campaign_max_threshold_hide: $scope.public_settings.site_campaign_max_threshold_hide,
      site_campaign_remove_top_header_image: $scope.public_settings.site_campaign_remove_top_header_image,
      site_campaign_remove_raise_mode: $scope.public_settings.site_campaign_remove_raise_mode,
      site_campaign_remove_time_period: $scope.public_settings.site_campaign_remove_time_period,
      site_campaign_fixed_campaign_duration_enable: $scope.public_settings.site_campaign_fixed_campaign_duration_enable,
      site_campaign_fixed_campaign_duration_start: $scope.public_settings.site_campaign_fixed_campaign_duration_start,
      site_campaign_fixed_campaign_duration_end: $scope.public_settings.site_campaign_fixed_campaign_duration_end,
      site_campaign_remove_campaign_links: $scope.public_settings.site_campaign_remove_campaign_links,
      site_campaign_remove_campaign_faq: $scope.public_settings.site_campaign_remove_campaign_faq,
      site_campaign_remove_campaign_google_analytics: $scope.public_settings.site_campaign_remove_campaign_google_analytics,
      
      site_campaign_display_creator_info_name_only: $scope.public_settings.site_campaign_display_creator_info_name_only,
      site_campaign_creator_info_display: $scope.public_settings.site_campaign_creator_info_display,
      site_campaign_backers_list_display: $scope.public_settings.site_campaign_backers_list_display,
      site_campaign_comments_display: $scope.public_settings.site_campaign_comments_display,
      site_campaign_comments_display_replace_reward: $scope.public_settings.site_campaign_comments_display_replace_reward,
      site_campaign_comments_display_verbose_date: $scope.public_settings.site_campaign_comments_display_verbose_date,
      site_campaign_page_verbose_campaign_info: $scope.public_settings.site_campaign_page_verbose_campaign_info,
      site_campaign_page_line_up_sidebar: $scope.public_settings.site_campaign_page_line_up_sidebar,
      site_campaign_page_about_share_btn: $scope.public_settings.site_campaign_page_about_share_btn,
      site_campaign_page_alternate_share_btn: $scope.public_settings.site_campaign_page_alternate_share_btn,
      site_campaign_page_simplify_backer: $scope.public_settings.site_campaign_page_simplify_backer,
      site_campaign_page_show_share_header: $scope.public_settings.site_campaign_page_show_share_header,
      site_campaign_updates_display: $scope.public_settings.site_campaign_updates_display,
      site_campaign_anonymous_contribution_type_only: $scope.public_settings.site_campaign_anonymous_contribution_type_only,
      site_campaign_allow_contribution_message: $scope.public_settings.site_campaign_allow_contribution_message,
      site_campaign_switch_card_label: $scope.public_settings.site_campaign_switch_card_label,
      site_campaign_backer_hide_profile_link: $scope.public_settings.site_campaign_backer_hide_profile_link,
      site_campaign_backer_hide_backed_campaigns: $scope.public_settings.site_campaign_backer_hide_backed_campaigns,
      site_campaign_progress_bar_hide: $scope.public_settings.site_campaign_progress_bar_hide,
      // site_campaign_country_funding_step: $scope.public_settings.site_campaign_country_funding_step,
      // site_campaign_country_ids: $scope.public_settings.site_campaign_country_ids,
      site_campaign_state_settings: $scope.public_settings.site_campaign_state_settings,
      site_campaign_state_hide: $scope.public_settings.site_campaign_state_hide,
      site_campaign_state_card_image_omit: $scope.public_settings.site_campaign_state_card_image_omit,
      site_campaign_pledge_update: $scope.public_settings.site_campaign_pledge_update,
      site_campaign_defaults: $scope.public_settings.site_campaign_defaults,
      site_campaign_defaults_runMode: $scope.public_settings.site_campaign_defaults_runMode,
      site_campaign_enable_campaign_bio: $scope.public_settings.site_campaign_enable_campaign_bio,
      site_campaign_currency_id: $scope.public_settings.site_campaign_currency_id,
      site_campaign_faq: $scope.public_settings.site_campaign_faq,
      site_campaign_move_blurb_sidebar: $scope.public_settings.site_campaign_move_blurb_sidebar,
      site_campaign_reward_attributes_required: $scope.public_settings.site_campaign_reward_attributes_required,
      site_campaign_reward_phone_required: $scope.public_settings.site_campaign_reward_phone_required,
      site_campaign_hide_profile: $scope.public_settings.site_campaign_hide_profile,
      site_campaign_custom_button: $scope.public_settings.site_campaign_custom_button,
      site_campaign_withdraw_hide: $scope.public_settings.site_campaign_withdraw_hide,
      site_campaign_contribution_layout_toggle_1: $scope.public_settings.site_campaign_contribution_layout_toggle_1,
      site_campaign_alt_city_input_toggle: $scope.public_settings.site_campaign_alt_city_input_toggle,
      site_campaign_express_toggle: $scope.public_settings.site_campaign_express_toggle,
      
      site_campaign_ecommerce_analytics: $scope.public_settings.site_campaign_ecommerce_analytics,
      site_campaign_facebook_analytics: $scope.public_settings.site_campaign_facebook_analytics,
      site_campaign_referralcandy_analytics: $scope.public_settings.site_campaign_referralcandy_analytics,
      site_campaign_coupon_management: $scope.public_settings.site_campaign_coupon_management,
      site_campaign_enable_campaign_revisions: $scope.public_settings.site_campaign_enable_campaign_revisions,
      site_campaign_end_hide: $scope.public_settings.site_campaign_end_hide,
      site_campaign_goog_shortener: $scope.public_settings.site_campaign_goog_shortener,

      site_campaign_hide_campaign_card_creator_or_category: $scope.public_settings.site_campaign_hide_campaign_card_creator_or_category,
      site_campaign_display_backers_campaign_card: $scope.public_settings.site_campaign_display_backers_campaign_card,
      site_theme_campaign_delayed_reward_setup: $scope.public_settings.site_theme_campaign_delayed_reward_setup,
      site_campaign_creator_info_display_top_bottom: $scope.public_settings.site_campaign_creator_info_display_top_bottom,
      site_campaign_enable_explainer_text: $scope.public_settings.site_campaign_enable_explainer_text,
      site_campaign_management: $scope.public_settings.site_campaign_management,
      site_campaign_toggle_hide_days_to_go_by_default: $scope.public_settings.site_campaign_toggle_hide_days_to_go_by_default,
      site_campaign_move_embed_below_comments_accordion: $scope.public_settings.site_campaign_move_embed_below_comments_accordion,
      site_campaign_move_backers_accordion_below_creator_accordion: $scope.public_settings.site_campaign_move_backers_accordion_below_creator_accordion,
      site_campaign_creator_info_display_sidebar: $scope.public_settings.site_campaign_creator_info_display_sidebar,
      site_campaign_share_campaign_actions_display_sidebar: $scope.public_settings.site_campaign_share_campaign_actions_display_sidebar,
      site_campaign_enable_organization_name: $scope.public_settings.site_campaign_enable_organization_name,
      site_campaign_restrict_stripe_change: $scope.public_settings.site_campaign_restrict_stripe_change,
      site_campaign_creator_info_display_left_header: $scope.public_settings.site_campaign_creator_info_display_left_header,
      site_campaign_share_display_only_fb_email_twitter: $scope.public_settings.site_campaign_share_display_only_fb_email_twitter,
      site_campaign_display_reward_on_mobile_tabs: $scope.public_settings.site_campaign_display_reward_on_mobile_tabs,
      site_campaign_creation_hide_start_page: $scope.public_settings.site_campaign_creation_hide_start_page,
      site_campaign_creation_field_display_stacked: $scope.public_settings.site_campaign_creation_field_display_stacked,
      site_campaign_creation_hide_campaign_image_field: $scope.public_settings.site_campaign_creation_hide_campaign_image_field,
      site_campaign_creation_hide_campaign_blurb_field: $scope.public_settings.site_campaign_creation_hide_campaign_blurb_field,
      site_campaign_creation_hide_campaign_category_field: $scope.public_settings.site_campaign_creation_hide_campaign_category_field,
      site_campaign_creation_hide_campaign_manager_field: $scope.public_settings.site_campaign_creation_hide_campaign_manager_field,
      site_campaign_creation_hide_campaign_description_field: $scope.public_settings.site_campaign_creation_hide_campaign_description_field,
      site_campaign_creation_show_campaign_image_field: $scope.public_settings.site_campaign_creation_show_campaign_image_field,
      site_campaign_creation_hide_campaign_rewards_fields: $scope.public_settings.site_campaign_creation_hide_campaign_rewards_fields,
      site_campaign_creation_show_campaign_description_field: $scope.public_settings.site_campaign_creation_show_campaign_description_field,
      site_campaign_creation_hide_widget_step: $scope.public_settings.site_campaign_creation_hide_widget_step,
      site_campaign_creation_hide_campaign_website_widget_previews: $scope.public_settings.site_campaign_creation_hide_campaign_website_widget_previews,
      site_campaign_creation_show_campaign_user_address_fields: $scope.public_settings.site_campaign_creation_show_campaign_user_address_fields,
      site_campaign_creation_split_profile_name_address_fields_to_steps: $scope.public_settings.site_campaign_creation_split_profile_name_address_fields_to_steps,
      site_campaign_creation_make_user_profile_address_required: $scope.public_settings.site_campaign_creation_make_user_profile_address_required,
      site_campaign_creation_display_previous_button_on_header: $scope.public_settings.site_campaign_creation_display_previous_button_on_header,
      site_campaign_creation_launch_campaign_on_step5: $scope.public_settings.site_campaign_creation_launch_campaign_on_step5,
      site_campaign_creation_start_campaign_on_current_date: $scope.public_settings.site_campaign_creation_start_campaign_on_current_date,
      site_campaign_enable_contribute_button_per_campaign: $scope.public_settings.site_campaign_enable_contribute_button_per_campaign,
      site_campaign_display_funding_goal_amount_on_campaign_cards: $scope.public_settings.site_campaign_display_funding_goal_amount_on_campaign_cards,

      site_campaign_profile_data_on_pledge: $scope.public_settings.site_campaign_profile_data_on_pledge,
      site_campaign_pledge_redirect: $scope.public_settings.site_campaign_pledge_redirect,
      site_campaign_campaign_toggle_disclaimer_text: $scope.public_settings.site_campaign_campaign_toggle_disclaimer_text,

    };

    var privateSettings = {
      site_hide_transaction_details_campaign_manager: $scope.private_settings.site_hide_transaction_details_campaign_manager,
      site_campaign_referralcandy_analytics_secret: $scope.private_settings.site_campaign_referralcandy_analytics_secret,
    }

    if (!$scope.public_settings.site_campaign_defaults.toggle) {
      $scope.public_settings.site_campaign_defaults.hide_fundraise = false;
    } else if ($scope.public_settings.site_campaign_defaults_runMode == 1) {
      var validDate = true;
      if (typeof !$scope.public_settings.site_campaign_fixed_campaign_duration_start === 'undefined' || $scope.public_settings.site_campaign_fixed_campaign_duration_start == null) {
        validDate = false;
      }
      if (typeof !$scope.public_settings.site_campaign_fixed_campaign_duration_end === 'undefined' || $scope.public_settings.site_campaign_fixed_campaign_duration_end == null) {
        validDate = false;
      }
      if (!validDate) {

        var translate = $translate.instant(['tab_portalsetting_campaign_defaults_error_msg']);
        msg = {
          'header': translate.tab_portalsetting_campaign_defaults_error_msg
        };
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        return;
      }
    }

    // Check if custom formatting toggle is enabled
    // Show fields if enabled then validate otherwise hide it
    if (typeof publicSettings.site_campaign_custom_button !== 'undefined') {
      if (publicSettings.site_campaign_custom_button.toggle) {
        $scope.valcheck = true;
        $scope.customFormattingValidation();

        $rootScope.scrollToError();

        if (!$scope.valcheck) {
          var translate = $translate.instant(['tab_portalsetting_campaign_custom_formatting_error_msg']);
          msg = {
            'header': translate.tab_portalsetting_campaign_custom_formatting_error_msg
          };
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          return;
        }
      } else {
        // Reset to empty value if toggle is not enabled
        publicSettings.site_campaign_custom_button.reward = '';
        publicSettings.site_campaign_custom_button.contribution = '';
      }

      // Reset custom formatting field for rewards button
      if (!publicSettings.site_theme_campaign_show_reward_enable_variation) {
        publicSettings.site_campaign_custom_button.reward = '';
      }
    }

    if ($scope.public_settings.site_campaign_defaults.percentage_fee.length == 0) {
      $scope.public_settings.site_campaign_defaults.percentage_fee = 10;
    }
    if ($scope.public_settings.site_campaign_defaults.fundingGoal.length == 0) {
      $scope.public_settings.site_campaign_defaults.fundingGoal = 100000000;
    }
    for (var i = 0; i < $scope.raise_modes.length; i++) {
      if ($scope.raise_modes[i].allowed) {
        publicSettings.site_campaign_raise_modes.allowed.push($scope.raise_modes[i].id);
      }
    }

    var requestQueue = [
      Restangular.one('portal/setting/public').customPUT(publicSettings),
      Restangular.one('portal/setting').customPUT(privateSettings)
    ]

    $q.all(requestQueue).then(function() {
      msg = {
        'header': "success_message_save_changes_button",
      }

      // Delete state images
      if (reqDeleteFileArr.length) {
        reqDeleteFileArr.forEach(function(value) {
          Restangular.one("portal").one("resource/file", value).customDELETE();
        });
        reqDeleteFileArr = [];
      }

      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }, function(failed) {
      msg = {
        'header': failed.data.message,
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }

  $scope.saveCompanyInfo = function() {

    msg = {
      'loading': true,
      'loading_message': 'saving_settings'
    }
    $rootScope.floatingMessage = msg;
    var publicSettings = {
      site_theme_portal_company_name: $scope.public_settings.site_theme_portal_company_name,
      site_theme_portal_company_number: $scope.public_settings.site_theme_portal_company_number
    };
    var request = Restangular.one('portal/setting/public').customPUT(publicSettings);
    request.then(function() {
      // $('.save-site-setting-success-modal').modal('show');
      msg = {
        'header': "success_message_save_changes_button",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }, function(failed) {
      msg = {
        'header': failed.data.message,
      }
      $rootScope.floatingMessage = failed.data.message;
      $scope.hideFloatingMessage();
    });
  }

  $scope.setBlockAlign = function(config) {
    $scope.public_settings.site_home_page_text.main_banner.block_alignment = config;
  }

  $scope.confirmAPISetting = function(tab) {
    //boolean for checking if links are secure
    var protocol_secure = true;

    //grab api url depending on tab
    switch (tab) {
      case "site_webhooks_processor":
        var api_array = $scope.private_settings.site_webhooks_processor;
        break;

      case "site_webhooks_campaign":
        var api_array = $scope.private_settings.site_webhooks_campaign;
        break;
    }

    // Test if each link is valid and if protocol is secure
    angular.forEach(api_array, function(value, key) {
      //open warning unsecure modal if not secure https link
      var webhook_uri = value.uri;

      if ((webhook_uri != "") && (webhook_uri.substring(0, 8) != "https://")) {
        protocol_secure = false;
      }
    });
    // If warning acknowledged, save anyways
    if (!protocol_secure) {
      $('.ui.modal.api-setting-unsecure-modal').modal('show');
      $('.api-setting-unsecure-modal').modal('setting', {
        onApprove: function() {
          $scope.saveAPISetting(tab);
        }
      });
    } else {
      $scope.saveAPISetting(tab);
    }
  }

  $scope.saveAPISetting = function(tab) {
    var api_settings = {};

    switch (tab) {
      case "site_webhooks_processor":
        api_settings['site_webhooks_processor'] = $scope.private_settings.site_webhooks_processor;
        break;

      case "site_webhooks_campaign":
        api_settings['site_webhooks_campaign'] = $scope.private_settings.site_webhooks_campaign;
        break;
    }

    msg = {
      'loading': true,
      'loading_message': 'saving_settings'
    }
    $rootScope.floatingMessage = msg;
    // Save API settings
    Restangular.one('portal/setting').customPUT(api_settings).then(function(success) {
      msg = {
        'header': "success_message_save_changes_button",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }, function(failed) {
      msg = {
        'header': failed.data.message,
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }

  // Check if document.write exists in the code, if so throw an error msg
  function isDocumentWrite(htmlBlock) {
    if (htmlBlock && htmlBlock.match(/document.write/g)) {
      msg = {
        'header': 'document_write_prompt_msg',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      return true;
    }
    return false;
  }

  $scope.saveThemeSetting = function() {
    msg = {
      'loading': true,
      'loading_message': 'saving_settings'
    }
    $rootScope.floatingMessage = msg;
    // contentChanged gets called when events form.submit is fired
    $scope.froalaOptionsMain.froalaEditor("events.trigger", "form.submit", [], true);
    $scope.froalaOptionsBot.froalaEditor("events.trigger", "form.submit", [], true);
    $scope.froalaOptionsExplore.froalaEditor("events.trigger", "form.submit", [], true);
    $scope.froalaFooterCustomHtmlBlock.froalaEditor("events.trigger", "form.submit", [], true);
    //$scope.clearMessage();
    if ($('#featured').is(":checked")) {
      $scope.public_settings.site_home_page_text.titles.top_show = 1;
    } else {
      $scope.public_settings.site_home_page_text.titles.top_show = 0;
    }
    if ($('#new').is(":checked")) {
      $scope.public_settings.site_home_page_text.titles.bottom_show = 1;
    } else {
      $scope.public_settings.site_home_page_text.titles.bottom_show = 0;
    }
    if ($('#hide-featured-in-recent').is(":checked")) {
      $scope.public_settings.recentProjectHideFeatured = true;
    } else {
      $scope.public_settings.recentProjectHideFeatured = false;
    }

    if ($('#banner_video_mute').is(":checked")) {
      $scope.public_settings.site_theme_banner_video_mute = true;
    } else {
      $scope.public_settings.site_theme_banner_video_mute = false;
    }
    if (typeof $scope.public_settings.site_logo_link != 'undefined') {
      if ($scope.public_settings.site_logo_link.length == 0) {
        $scope.public_settings.site_logo_link = $location.protocol() + "://" + $location.host();
      }
    } else {
      $scope.public_settings.site_logo_link = $location.protocol() + "://" + $location.host();
    }
    var logoUrl = SiteLogoService.getLogoUrl();
    var mainBackground = SiteLogoService.getMainBackground();
    var exploreBackground = SiteLogoService.getExploreBackground();
    var favIcon = SiteLogoService.getFavIcon();
    var loadIcon = SiteLogoService.getLoadIcon();

    // Clear edit property in the link objects
    angular.forEach($scope.public_settings.site_menu_header, function(link) {
      if (link.hasOwnProperty("edit")) {
        delete link.edit;
      }
    });
    angular.forEach($scope.public_settings.site_menu_footer.left, function(link) {
      if (link.hasOwnProperty("edit")) {
        delete link.edit;
      }
    });
    angular.forEach($scope.public_settings.site_menu_footer.right, function(link) {
      if (link.hasOwnProperty("edit")) {
        delete link.edit;
      }
    });

    if ($scope.public_settings.site_theme_banner_video_link == "") {
      $scope.public_settings.site_theme_banner_video_link = "__NULL__";
    }
    var publicSettings = {
      site_theme_sticky_menu: $scope.public_settings.site_theme_sticky_menu,
      site_top_nav_theme: $scope.top_nav_theme,
      site_theme_category_display: $scope.public_settings.site_theme_category_display,
      site_theme_category_display_footer: $scope.public_settings.site_theme_category_display_footer,
      site_home_page_text: $scope.public_settings.site_home_page_text,
      site_explore_page_text: $scope.public_settings.site_explore_page_text,
      site_footer_text: $scope.public_settings.site_footer_text,
      site_menu_header: $scope.public_settings.site_menu_header,
      site_menu_footer: $scope.public_settings.site_menu_footer,
      site_company: $scope.public_settings.site_company,
      site_theme_color: $scope.public_settings.site_theme_color,
      site_favicon: favIcon ? favIcon.site_favicon : null,
      site_logo: logoUrl ? logoUrl.site_logo : null,
      site_load_icon: loadIcon ? loadIcon.site_load_icon : null,
      site_load_class: $scope.site_load_class,
      site_theme_main_background: mainBackground ? mainBackground.site_theme_main_background : null,
      site_theme_explore_background: exploreBackground ? exploreBackground.site_theme_explore_background : null,
      site_logo_link: $scope.public_settings.site_logo_link,
      site_theme_category_display_explore_sidebar: $scope.public_settings.site_theme_category_display_explore_sidebar,
      site_theme_category_display_with_campaigns_only: $scope.public_settings.site_theme_category_display_with_campaigns_only,
      site_theme_banner_video_link: $scope.public_settings.site_theme_banner_video_link,
      site_theme_banner_is_image: $scope.public_settings.site_theme_banner_is_image,
      site_theme_banner_video_mute: $scope.public_settings.site_theme_banner_video_mute,
      recentProjectHideFeatured: $scope.public_settings.recentProjectHideFeatured,
      exclude_ended_from_recent: $scope.public_settings.exclude_ended_from_recent,
      campaign_randomize: $scope.public_settings.campaign_randomize,
      logo_links: $scope.public_settings.logo_links,
      site_enable_auto_select_subcat: $scope.public_settings.site_enable_auto_select_subcat,
      site_search_explore: $scope.public_settings.site_search_explore,
      site_homepage_custom_html_block: $scope.public_settings.site_homepage_custom_html_block,
      site_footer_custom_html_block: $scope.public_settings.site_footer_custom_html_block,
      site_search_explore: $scope.public_settings.site_search_explore,
      site_campaign_strong_customer_auth: $scope.public_settings.site_campaign_strong_customer_auth
    };

    if (typeof $scope.public_settings.site_home_page_text.main_banner !== "undefined") {
      $scope.public_settings.site_home_page_text.main_banner.html = $scope.replaceInsideStyleTag($scope.public_settings.site_home_page_text.main_banner.html);

      $scope.isCodeValid = !isDocumentWrite($scope.public_settings.site_home_page_text.main_banner.html);
      if (!$scope.isCodeValid) {
        return;
      }
    }

    if (typeof $scope.public_settings.site_home_page_text.bottom_banner !== "undefined") {
      $scope.public_settings.site_home_page_text.bottom_banner.html = $scope.replaceInsideStyleTag($scope.public_settings.site_home_page_text.bottom_banner.html);

      $scope.isCodeValid = !isDocumentWrite($scope.public_settings.site_home_page_text.bottom_banner.html);
      if (!$scope.isCodeValid) {
        return;
      }
    }

    if (typeof $scope.public_settings.site_footer_custom_html_block !== "undefined") {
      $scope.public_settings.site_footer_custom_html_block.html = $scope.replaceInsideStyleTag($scope.public_settings.site_footer_custom_html_block.html);

      $scope.isCodeValid = !isDocumentWrite($scope.public_settings.site_footer_custom_html_block.html);
      if (!$scope.isCodeValid) {
        return;
      }
    }

    if (typeof $scope.public_settings.site_homepage_custom_html_block !== "undefined") {
      $scope.public_settings.site_homepage_custom_html_block.html = $scope.replaceInsideStyleTag($scope.public_settings.site_homepage_custom_html_block.html);

      $scope.isCodeValid = !isDocumentWrite($scope.public_settings.site_homepage_custom_html_block.html);
      if (!$scope.isCodeValid) {
        return;
      }
    }
    if (typeof $scope.public_settings.site_explore_page_text !== "undefined") {
      $scope.public_settings.site_explore_page_text.html = $scope.replaceInsideStyleTag($scope.public_settings.site_explore_page_text.html);

      $scope.isCodeValid = !isDocumentWrite($scope.public_settings.site_explore_page_text.html);
      if (!$scope.isCodeValid) {
        return;
      }
    }

    if ($scope.isCodeValid) {

      var request = Restangular.one('portal/setting/public').customPUT(publicSettings);

      // clear service
      SiteLogoService.setLogoUrl(null);
      SiteLogoService.setMainBackground(null);
      SiteLogoService.setExploreBackground(null);
      SiteLogoService.setFavIcon(null);
      SiteLogoService.setLoadIcon(null);

      updateThemeColor();
      $scope.loadPreviewVideo();

      request.then(function() {
        msg = {
          'header': "success_message_save_changes_button",
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }, function(failed) {
        msg = {
          'header': failed.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
  }

  $scope.setBannerIsImage = function(val) {
    $scope.public_settings.site_theme_banner_is_image = val;
  }

  setTimeout(function() {
    $translate(['allow_registereduser', 'allow_guest', 'allow_both', 'disabledguest']).then(function(value) {
      $scope.registeruser = value.allow_registereduser;
      $scope.guest = value.allow_guest;
      $scope.both = value.allow_both;
      $scope.disable = value.disabledguest;

      $scope.contribution_modes = [{
        type: $scope.registeruser,
        value: 1
      }, {
        type: $scope.guest,
        value: 2
      }, {
        type: $scope.both,
        value: 3
      }, {
        type: $scope.disable,
        value: 4
      }];
    });
  }, 1000);

  $scope.setExploreDefaultSort = function(item) {
    $scope.public_settings.site_set_explore_default_sort.default = item.value;
    $scope.public_settings.site_set_explore_default_sort.default_text = item.type;
  }

  $scope.customFieldSaveAttrPermission = function() {
    $scope.public_settings.site_person_attributes_non_admin = true;
    $scope.saveSiteSetting();
  }

  $scope.validateTipTier = function() {
    var translation = $translate.instant(['tab_portalsetting_tipping_tier_specify']);
    msg = {
      'header': translation.tab_portalsetting_tipping_tier_specify
    }
    $rootScope.floatingMessage = msg;
    $('html, body').animate({
      scrollTop: $(".campaign-tipping-form.ui.form").offset().top
    }, 1000);
  }

  $scope.validateEmail = function(email){ 
    var re = /(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/
    if (!re.test(email.toLowerCase())){
      return false;
    }

    return true;
  }
  $scope.validateMailSendFrom = function() {
    var translation = $translate.instant(['tab_portalsetting_Mail_SendFrom_invalid']);
    msg = {
      'header': translation.tab_portalsetting_Mail_SendFrom_invalid
    }
    $rootScope.floatingMessage = msg;
    $('html, body').animate({
      scrollTop: $("#mail-sendfrom").offset().top
    }, 1000);
  }
  $scope.validateMailAdmin = function() {
    var translation = $translate.instant(['tab_portalsetting_Mail_Admin_invalid']);
    msg = {
      'header': translation.tab_portalsetting_Mail_Admin_invalid
    }
    $rootScope.floatingMessage = msg;
    $('html, body').animate({
      scrollTop: $("#mail-admin").offset().top
    }, 1000);
  }

  $scope.validateTippingOptions = function() {
    var translation = $translate.instant(['tab_portalsetting_tipping_error']);
    $('.campaign-tipping-form.ui.form').form({
      no_tip: {
        identifier: 'tip_manual',
        rules: [{
          type: 'checked',
          prompt: translation.tab_portalsetting_tipping_error
        }]
      },
      toggle_tiers: {
        identifier: 'toggle_tiers',
        rules: [{
          type: 'checked',
          prompt: translation.tab_portalsetting_tipping_error
        }]
      }
    }, {
      inline: true,
      onFailure: function() {
        $('html, body').animate({
          scrollTop: $(".field.error").offset().top
        }, 1000);
      }
    }).form('validate form');
  }

  $.fn.form.settings.rules.url = function(value) {
    return (value.indexOf("http://") == 0 || value.indexOf("https://") == 0)
  };
  $scope.validateOktaSettings = function() {
    if ($scope.public_settings.social_login.okta_domain 
      && $scope.public_settings.social_login.okta_clientId
      && $scope.private_settings.social_login.okta_apiKey){
      if($scope.public_settings.social_login.okta_domain.indexOf("http://") == 0 || $scope.public_settings.social_login.okta_domain.indexOf("https://") == 0) {
        return true
      }
    }
    var translation = $translate.instant([
      'tab_portalsetting_social_login_okta_domain_invalid',
      'tab_portalsetting_social_login_okta_domain_empty',
      'tab_portalsetting_social_login_okta_client_id_empty',
      'tab_portalsetting_social_login_okta_group_id_empty',
      'tab_portalsetting_social_login_okta_api_key_empty',
    ]);
    $('#socialLogin-options').form({
      okta_domain: {
        identifier: 'okta_domain',
        rules: [
          {
            type: 'empty',
            prompt: translation.tab_portalsetting_social_login_okta_domain_empty
        },
        {
          type: 'url',
          prompt: translation.tab_portalsetting_social_login_okta_domain_invalid,
        }
      ]
      },
      okta_clientId: {
        identifier: 'okta_clientId',
        rules: [{
          type: 'empty',
          prompt: translation.tab_portalsetting_social_login_okta_client_id_empty
        }]
      },
      okta_apiKey: {
        identifier: 'okta_apiKey',
        rules: [{
          type: 'empty',
          prompt: translation.tab_portalsetting_social_login_okta_api_key_empty
        }]
      },
    }, {
      inline: true,
      onFailure: function() {
        $('html, body').animate({
          scrollTop: $(".field.error").offset().top
        }, 1000);
      }
    }).form('validate form');
    return false;
  }

  $scope.saveSiteSetting = function() {

    if ($scope.public_settings.site_tipping.toggle_tiers && ($scope.public_settings.site_tipping.tiers.length == 0)) {
      $scope.validateTipTier();
      return;
    }
    //Return if you fail validation for website tipping
    if ($scope.public_settings.site_tipping.toggle && (!$scope.public_settings.site_tipping.toggle_tiers && !$scope.public_settings.site_tipping.toggle_dynamic)) {
      $scope.validateTippingOptions();
      return;
    }
    if($scope.private_settings.site_email_address_from){
      if(!$scope.validateEmail($scope.private_settings.site_email_address_from)){
        $scope.validateMailSendFrom();
        return;
      }
    }

    if($scope.private_settings.site_email_address_admin){
      if(!$scope.validateEmail($scope.private_settings.site_email_address_admin)){
        $scope.validateMailAdmin();
        return;
      }
    }

    if($scope.public_settings.social_login.toggle){
      if(!$scope.validateOktaSettings()){
        return;
      }
    }

    //need placeholder to save
    if (!$scope.public_settings.site_analytics_code) {
      $scope.public_settings.site_analytics_code = "<script></script>";
    }
    msg = {
      'loading': true,
      'loading_message': 'saving_settings'
    }
    $rootScope.floatingMessage = msg;


    //$scope.clearMessage();
    var requestQueue = [];

    if (!$scope.loginRedirect.text && !$scope.loginRedirect.link) {
      $scope.loginRedirect = {
        "text": "",
        "link": ""
      }
    }

    if (!$scope.registerRedirect.text && !$scope.registerRedirect.link) {
      $scope.registerRedirect = {
        "text": "",
        "link": ""
      }
    }
    if ($scope.public_settings.site_contribute_behaviour) {

    }

    var register = false,
      guest = false,
      express = false;

    angular.forEach($scope.inlineContributionOptions, function(value, key, obj) {
      if (value && key == 'register') {
        register = true;
      }
      // Guest checkout is legacy now, use express instead
      if (value && key == 'express' || 
          value && key == 'guest') {
        express = true;
      }
    });

    // Guest checkout is removed
    // public_setting.site_contribute_behaviour.default = 1 //(Register Only)
    // public_setting.site_contribute_behaviour.default = 2 //(Guest Only)
    // public_setting.site_contribute_behaviour.default = 3 //(Register and Guest)
    // public_setting.site_contribute_behaviour.default = 4 //(Disabled)
    // public_setting.site_contribute_behaviour.default = 5 //(Express only)
    // public_setting.site_contribute_behaviour.default = 6 //(Register and Express)
    // public_setting.site_contribute_behaviour.default = 7 //(Guest and Express)
    // public_setting.site_contribute_behaviour.default = 8 //(Register and Guest and Express)
    if (register && !guest && !express) {
      $scope.public_settings.site_contribute_behaviour.default = 1 //(Register Only)
    }
    if (!register && guest && !express) {
      $scope.public_settings.site_contribute_behaviour.default = 2 //(Guest Only)
    }
    if (register && guest && !express) {
      $scope.public_settings.site_contribute_behaviour.default = 3 //(Register and Guest)
    }
    if (!register && !guest && !express) {
      $scope.public_settings.site_contribute_behaviour.default = 4 //(Disabled)
    }
    if (!register && !guest && express) {
      $scope.public_settings.site_contribute_behaviour.default = 5 //(Express only)
    }
    if (register && !guest && express) {
      $scope.public_settings.site_contribute_behaviour.default = 6 //(Register and Express)
    }
    if (!register && guest && express) {
      $scope.public_settings.site_contribute_behaviour.default = 7 //(Guest and Express)
    }
    if (register && guest && express) {
      $scope.public_settings.site_contribute_behaviour.default = 8 //(Register and Guest and Express)
    }
    // save partial settings
    var publicSettings = {
      site_social_media_links: $scope.public_settings.site_social_media_links,
      site_maintenance_mode: $scope.site_maintenance_mode,
      site_api_connection_message: $scope.site_api_connection_message.value,
      site_analytics_code: $scope.public_settings.site_analytics_code,
      site_contribute_behaviour: $scope.public_settings.site_contribute_behaviour,
      site_auto_approve_new_users: $scope.public_settings.site_auto_approve_new_users,
      site_auto_account_approve_email_notify: $scope.public_settings.site_auto_account_approve_email_notify,
      site_auto_approve_new_campaigns: $scope.public_settings.site_auto_approve_new_campaigns,
      site_person_attributes_non_admin_read_all_disallow: $scope.public_settings.site_person_attributes_non_admin_read_all_disallow,
      site_tos_contribution_ui: $scope.public_settings.site_tos_contribution_ui,
      site_tos_campaign_submit: $scope.public_settings.site_tos_campaign_submit,
      site_tos_registration_ui: $scope.public_settings.site_tos_registration_ui,
      site_tos_login_ui: $scope.public_settings.site_tos_login_ui,
      site_case_insensitive_campaign_path: $scope.public_settings.site_case_insensitive_campaign_path,
      site_notify_admin_all_contributions: $scope.public_settings.site_notify_admin_all_contributions,
      site_auth_scheme: $scope.public_settings.site_auth_scheme,
      site_disable_account_setting: $scope.public_settings.site_disable_account_setting,
      site_person_attributes_non_admin: $scope.public_settings.site_person_attributes_non_admin,
      site_person_public_view: $scope.public_settings.site_person_public_view,
      site_login_redirect: $scope.loginRedirect,
      site_register_redirect: $scope.registerRedirect,
      site_enable_advanced_widget: $scope.public_settings.site_enable_advanced_widget,
      site_remove_user_profile_bio: $scope.public_settings.site_remove_user_profile_bio,
      site_allow_anonymous_contact_message: $scope.public_settings.site_allow_anonymous_contact_message,
      site_increase_featured_campaigns_limit: $scope.public_settings.site_increase_featured_campaigns_limit,
      site_set_explore_default_sort: $scope.public_settings.site_set_explore_default_sort,
      site_infinite_scroller: $scope.public_settings.site_infinite_scroller,
      site_default_campaign_rows: $scope.public_settings.site_default_campaign_rows,
      site_enable_cookie_consent: $scope.public_settings.site_enable_cookie_consent,
      site_disable_unsupported_browsers: $scope.public_settings.site_disable_unsupported_browsers,
      site_tipping: $scope.public_settings.site_tipping,
      site_verification: $scope.public_settings.site_verification,
      social_login: $scope.public_settings.social_login,
      site_campaign_combine_amount_tip: $scope.public_settings.site_campaign_combine_amount_tip,
      site_tip_currency: $scope.public_settings.site_tip_currency
    };
    publicSettings.social_login = {
      toggle: $scope.public_settings.social_login.toggle,
      providers: $scope.public_settings.social_login.providers
    }
    $scope.isCodeValid = !isDocumentWrite($scope.public_settings.site_analytics_code);

    if ($scope.isCodeValid) {
      // campaign modes
      requestQueue.push(Restangular.one('portal/setting/public').customPUT(publicSettings));

      var privateSettings = {
        site_email_address_from: $scope.private_settings.site_email_address_from,
        site_email_address_admin: $scope.private_settings.site_email_address_admin,
      };
      if($scope.private_settings.social_login){
        privateSettings.okta_domain = $scope.private_settings.social_login.okta_domain
        privateSettings.otka_clientId = $scope.private_settings.social_login.otka_clientId
      }

      if($scope.public_settings.social_login){
        publicSettings.social_login = {
          toggle: $scope.public_settings.social_login.toggle,
          toggle_iframe: $scope.public_settings.social_login.toggle_iframe,
          providers: $scope.public_settings.social_login.providers,
          okta_clientId: $scope.public_settings.social_login.okta_clientId,
          okta_domain: $scope.public_settings.social_login.okta_domain,
          //  TODO: Use public_settings for: redirect_uri          
        }
      }
      if($scope.private_settings.social_login){
        privateSettings.social_login = {
          okta_apiKey: $scope.private_settings.social_login.okta_apiKey,
        }
      }

      // save private settings
      requestQueue.push(Restangular.one('portal/setting').customPUT(privateSettings));

      $q.all(requestQueue).then(function() {
        // $('.save-site-setting-success-modal').modal('show');
        msg = {
          'header': "success_message_save_changes_button",
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }, function(failed) {
        msg = {
          'header': failed.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
  }

  $scope.getStripeCountry = function() {
    return Restangular.one('account/stripe/country').customGET().then(function(success) {
      $scope.stripeCountries = success;
    });
  }

  $scope.getStripeCountry();

  $scope.setStripeCountry = function(cid) {
    $scope.stripe_setting.country_id = cid;
    $scope.stripe_setting_origin.country_id = cid;

    Restangular.one('account/stripe').customGET("currency", {
      country_id: cid
    }).then(function(success) {
      if ($scope.public_settings.site_theme_shipping_native_lookup) {
        success.forEach(function(value) {
          value.name = value.native_name ? value.native_name : value.name;
        });
      }
      $scope.stripeSupportedCurrencies = success;
    });
  }

  $scope.stripeCountryEnter = function(event) {
    if (event.keyCode == 13) {
      var country_id = event.target.querySelector("input").value;
      $scope.setStripeCountry(country_id);
    }
  }

  $scope.saveStripePortalSettings = function() {
    var privateSettings = {
      site_stripe: {
        test: {
          clientId: $scope.stripe_test_clientId,
          publishkey: $scope.stripe_test_publishkey,
          secretkey: $scope.stripe_test_secretkey,
        },
        live: {
          clientId: $scope.stripe_live_clientId,
          publishkey: $scope.stripe_live_publishkey,
          secretkey: $scope.stripe_live_secretkey,
        },
      }
    };

    Restangular.one('portal/setting').customPUT(privateSettings).then(function() {
      angular.copy($scope.stripe_setting_origin, $scope.stripe_setting);
    });
  }

  $scope.updateStripeApplication = function() {

    //Remove the errors for key formats
    resetStripeKeyErrors();

    Restangular.one('account/stripe/application').customPUT($scope.stripe_setting).then(
      function(success) {

        $scope.saveStripePortalSettings();

        msg = {
          'header': "success_message_save_changes_button",
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();

        $scope.public_settings.site_campaign_fee_currency = [];

        for (var j = 0; j < $scope.currency_setting.currency_ids.length; j++) {
          for (var i = 0; i < $scope.stripeSupportedCurrencies.length; i++) {
            if ($scope.stripeSupportedCurrencies[i].currency_id == $scope.currency_setting.currency_ids[j]) {
              $scope.public_settings.site_campaign_fee_currency.push($scope.stripeSupportedCurrencies[i]);

            }
          }
        }
        if ($scope.public_settings.site_campaign_fee_direct_transaction) {
          $scope.stripe_fee.campaign_fee = 0;
        }
        var data = {
          'site_campaign_fee_percentage': $scope.stripe_fee.campaign_fee,
          'site_campaign_fee_currency': $scope.public_settings.site_campaign_fee_currency,
          'site_campaign_fee_direct_transaction': $scope.public_settings.site_campaign_fee_direct_transaction,
        };
        var public_setting_call = Restangular.one('portal/setting/public').customPUT(data);

        var private_data = {
          'site_campaign_fee_direct_transaction_account': $scope.private_settings.site_campaign_fee_direct_transaction_account,
        };
        var private_setting_call = Restangular.one('portal/setting').customPUT(private_data);

        // wait for all requests
        $q.all([public_setting_call, private_setting_call]).then(function(success) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        }, function(failure) {
          msg = {
            'header': failure.data.message,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      },
      function(failure) {
        msg = {
          'header': failure.data.message,
        }
        if (failure.data.code == "account_profile_stripe_application_update" || failure.data.code == "account_profile_stripe_group_application_update") {
          msg.header = $translate.instant('tab_portalsetting_payment_Setting_stripe_keys_incorrect');
        }

        triggerStripeKeyErrors();

        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();

        // Check for error on the .field element
        $rootScope.scrollToError();
      });
  }

  function resetStripeKeyErrors() {
    $('.secret-key-error').remove();
    $('.publish-key-error').remove();
    $('.client-key-error').remove();

    $('#live_secret_key').removeClass('error');
    $('#live_publish_key').removeClass('error');
    $('#live_client_id').removeClass('error');

    $('#test_secret_key').removeClass('error');
    $('#test_publish_key').removeClass('error');
    $('#test_client_id').removeClass('error');
  }

  function triggerStripeKeyErrors() {
    var translation = $translate.instant(['tab_portalsetting_payment_Setting_public_key_format', 'tab_portalsetting_payment_Setting_secret_key_format', 'tab_portalsetting_payment_Setting_client_key_format']);

    if ($scope.livemode) {
      $('.secret-key-error').remove();
      $('#live_secret_key').append('<div class="secret-key-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_payment_Setting_secret_key_format + '</div>');
      $('#live_secret_key').addClass('error');

      $('.publish-key-error').remove();
      $('#live_publish_key').append('<div class="publish-key-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_payment_Setting_public_key_format + '</div>');
      $('#live_publish_key').addClass('error');

      if (!$('#live_client_id').parent().hasClass('ng-hide')) {
        $('.client-key-error').remove();
        $('#live_client_id').append('<div class="client-key-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_payment_Setting_client_key_format + '</div>');
        $('#live_client_id').addClass('error');
      }
    } else {
      $('.secret-key-error').remove();
      $('#test_secret_key').append('<div class="secret-key-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_payment_Setting_secret_key_format + '</div>');
      $('#test_secret_key').addClass('error');

      $('.publish-key-error').remove();
      $('#test_publish_key').append('<div class="publish-key-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_payment_Setting_public_key_format + '</div>');
      $('#test_publish_key').addClass('error');

      if (!$('#test_client_id').parent().hasClass('ng-hide')) {
        $('.client-key-error').remove();
        $('#test_client_id').append('<div class="client-key-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_payment_Setting_client_key_format + '</div>');
        $('#test_client_id').addClass('error');
      }
    }
  }

  $scope.createStripeApplication = function() {
    Restangular.one('account/stripe/application').customPOST($scope.stripe_setting).then(
      function(success) {

        $scope.saveStripePortalSettings();

        msg = {
          'header': "success_message_save_changes_button",
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();

        $scope.public_settings.site_campaign_fee_currency = [];

        for (var j = 0; j < $scope.currency_setting.currency_ids.length; j++) {
          for (var i = 0; i < $scope.stripeSupportedCurrencies.length; i++) {
            if ($scope.stripeSupportedCurrencies[i].currency_id == $scope.currency_setting.currency_ids[j]) {
              $scope.public_settings.site_campaign_fee_currency.push($scope.stripeSupportedCurrencies[i]);

            }
          }
        }
        if ($scope.public_settings.site_campaign_fee_direct_transaction) {
          $scope.stripe_fee.campaign_fee = 0;
        }
        var data = {
          'site_campaign_fee_percentage': $scope.stripe_fee.campaign_fee,
          'site_campaign_fee_currency': $scope.public_settings.site_campaign_fee_currency,
          'site_campaign_fee_direct_transaction': $scope.public_settings.site_campaign_fee_direct_transaction,
        };
        var public_setting_call = Restangular.one('portal/setting/public').customPUT(data);

        // wait for all requests
        $q.all([public_setting_call]).then(function(success) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        }, function(failure) {
          msg = {
            'header': failure.data.message,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      },
      function(failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
  }

  $scope.currency_setting = {};
  $scope.updateStripe = function() {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'saving_settings'
    }
    $rootScope.floatingMessage = msg;

    var privateSettings = {
      site_stripe: {
        test: {
          clientId: $scope.stripe_test_clientId,
          publishkey: $scope.stripe_test_publishkey,
          secretkey: $scope.stripe_test_secretkey,
        },
        live: {
          clientId: $scope.stripe_live_clientId,
          publishkey: $scope.stripe_live_publishkey,
          secretkey: $scope.stripe_live_secretkey,
        },
      }
    };

    if ($('#livebtn').hasClass('positive')) {
      if (!$scope.public_settings.site_campaign_fee_direct_transaction) {
        $scope.stripe_setting.client_id = privateSettings.site_stripe.live.clientId;
      } else {
        $scope.stripe_setting.client_id = 'client_id_dummy';
      }
      $scope.stripe_setting.publishable_key = privateSettings.site_stripe.live.publishkey;
      $scope.stripe_setting.secret_key = privateSettings.site_stripe.live.secretkey;
    }
    if ($('#testbtn').hasClass('positive')) {
      if (!$scope.public_settings.site_campaign_fee_direct_transaction) {
        $scope.stripe_setting.client_id = privateSettings.site_stripe.test.clientId;
      } else {
        $scope.stripe_setting.client_id = 'client_id_dummy';
      }
      $scope.stripe_setting.publishable_key = privateSettings.site_stripe.test.publishkey;
      $scope.stripe_setting.secret_key = privateSettings.site_stripe.test.secretkey;
    }

    // Stripe connection mode
    if ($('#standard-btn').hasClass('positive')) {
      $scope.public_settings.stripe_standard_mode = true;
      $scope.public_settings.stripe_express_mode = false;
      $('#standard-btn').addClass('positive');
      $('#express-btn').removeClass('positive');
    } else if ($('#express-btn').hasClass('positive')) {
      $scope.public_settings.stripe_standard_mode = false;
      $scope.public_settings.stripe_express_mode = true;
      $('#express-btn').addClass('positive');
      $('#standard-btn').removeClass('positive');
    }

    if ($scope.testmode && isEmpty(privateSettings.site_stripe.test)) {
      $scope.stripe_no_keys = true;
    }

    if ($scope.livemode && isEmpty(privateSettings.site_stripe.live)) {
      $scope.stripe_no_keys = true;
    }

    if (((!$scope.public_settings.site_campaign_fee_direct_transaction && ($scope.stripe_setting.client_id !== $scope.stripe_setting_origin.client_id)) || $scope.stripe_setting.secret_key !== $scope.stripe_setting_origin.secret_key || $scope.stripe_setting.publishable_key !== $scope.stripe_setting_origin.publishable_key) && $scope.public_settings.payment_setting_enabled) {
      $rootScope.floatingMessage = [];

      Restangular.one('account/stripe/application').customGET().then(function(success) {
        msg = {
          'loading': true,
          'loading_message': 'saving_settings'
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();

        var stripe_setting = success.plain();
        var hide_modal = false;

        if (!stripe_setting.publishable_key || stripe_setting.publishable_key == "public_id_dummy") {
          hide_modal = true;
        }

        if (!stripe_setting.secret_key || stripe_setting.secret_key == "secret_key_dummy") {
          hide_modal = true;
        }

        if (hide_modal) {
          if ($scope.stripe_setting.not_in_database == true) {
            $scope.stripe_setting.skip_user_id = true;
            delete $scope.stripe_setting.not_in_database;
            $scope.createStripeApplication();
          } else {
            $scope.updateStripeApplication();
          }
        } else {
          $('.ui.modal.dangerous-action-alert').modal({
            onApprove: function() {
              $scope.updateStripeApplication();
            },
            onDeny: function() {
              angular.copy($scope.stripe_setting_origin, $scope.stripe_setting);
            }
          }).modal('show');
        }

      });

      // $('.ui.modal.dangerous-action-alert').modal({
      //   onApprove: function() {
      //     msg = {
      //       'loading': true,
      //       'loading_message': 'saving_settings'
      //     }
      //     $rootScope.floatingMessage = msg;

      //     if ($scope.stripe_setting.not_in_database == true) {
      //       $scope.stripe_setting.skip_user_id = true;
      //       delete $scope.stripe_setting.not_in_database;
      //       $scope.createStripeApplication();
      //     } else {
      //       $scope.updateStripeApplication();
      //     }


      //   },
      //   onDeny: function() {
      //     angular.copy($scope.stripe_setting_origin, $scope.stripe_setting);
      //   }
      // }).modal('show');

    } else {
      $scope.saveStripePortalSettings();

      msg = {
        'loading': true,
        'loading_message': 'saving_settings'
      }
      $rootScope.floatingMessage = msg;
      $scope.public_settings.site_campaign_fee_currency = [];
      for (var j = 0; j < $scope.currency_setting.currency_ids.length; j++) {
        for (var i = 0; i < $scope.stripeSupportedCurrencies.length; i++) {
          if ($scope.stripeSupportedCurrencies[i].currency_id == $scope.currency_setting.currency_ids[j]) {
            $scope.public_settings.site_campaign_fee_currency.push($scope.stripeSupportedCurrencies[i]);
          }
        }
      }

      if ($scope.public_settings.site_campaign_fee_direct_transaction) {
        $scope.stripe_fee.campaign_fee = 100;
      }

      var data = {
        'site_campaign_fee_percentage': $scope.stripe_fee.campaign_fee,
        'site_campaign_fee_currency': $scope.public_settings.site_campaign_fee_currency,
        'site_campaign_fee_direct_transaction': $scope.public_settings.site_campaign_fee_direct_transaction,
      };

      var paymentSettingReq = [];
      var public_setting_call = Restangular.one('portal/setting/public').customPUT(data);
      paymentSettingReq.push(public_setting_call);


      if ($scope.public_settings.payment_setting_enabled) {
        $scope.stripe_setting.skip_user_id = false;
        var site_campaign_contribution_request = Restangular.one('portal/setting/public').customPUT({
          site_campaign_contributions: true
        });
        //$(".site-campaign-contribution").checkbox("check");
      } else {
        $scope.stripe_setting.skip_user_id = true;
        var site_campaign_contribution_request = Restangular.one('portal/setting/public').customPUT({
          site_campaign_contributions: false,
          site_campaign_contributions_instruction: $scope.public_settings.site_campaign_contributions_instruction ? $scope.public_settings.site_campaign_contributions_instruction : "<p>Your campaign contribution instructions.</p>"
        });
        //$(".site-campaign-contribution").checkbox("uncheck");
      }
      paymentSettingReq.push(site_campaign_contribution_request);

      if (!$scope.stripe_setting.secret_key) {
        $scope.stripe_setting.secret_key = "secret_key_dummy";
      }
      if (!$scope.stripe_setting.client_id) {
        $scope.stripe_setting.client_id = "client_id_dummy";
      }
      if (!$scope.stripe_setting.publishable_key) {
        $scope.stripe_setting.publishable_key = "public_id_dummy";
      }
      // Stripe connection mode
      if (!$scope.public_settings.stripe_standard_mode && !$scope.public_settings.stripe_express_mode) {
        $scope.public_settings.stripe_standard_mode = true;
        $scope.public_settings.stripe_express_mode = false;
      }
      if (!$scope.public_settings.stripe_standard_mode && $scope.public_settings.stripe_express_mode) {
        $scope.public_settings.stripe_standard_mode = false;
        $scope.public_settings.stripe_express_mode = true;
      }

      var save_stripe_application = Restangular.one('account/stripe/application').customPUT($scope.stripe_setting);
      paymentSettingReq.push(save_stripe_application);

      // wait for all requests
      $q.all(paymentSettingReq).then(function(success) {
        // $('.save-stripe-setting-success-modal').modal('show');
        updateSiteMenu();
        msg = {
          'header': "success_message_save_changes_button",
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }, function(failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });

    }
  }

  $scope.paypalValidate = function() {
    var translation = $translate.instant([
      'tab_portalsetting_Paypalsetting_country_incorrect',
      'tab_portalsetting_currency_prompt_empty',
      'tab_portalsetting_Paypalsetting_client_key_incorrect',
      'tab_portalsetting_Paypalsetting_secret_key_incorrect',
    ]);
    var validation = {
      paypal_country: {
        identifier: 'paypal_country',
        rules: [{
          type: 'empty',
          prompt: translation.tab_portalsetting_Paypalsetting_country_incorrect
        }]
      },
      test_secret_key: {
        identifier: 'test_secret_key_paypal',
        rules: [{
          type: 'empty',
          prompt: translation.tab_portalsetting_Paypalsetting_secret_key_incorrect
        }]
      },
      test_publish_key: {
        identifier: 'test_publish_key_paypal',
        rules: [{
          type: 'empty',
          prompt: translation.tab_portalsetting_Paypalsetting_client_key_incorrect
        }]
      }
    };
    if($scope.paypalLiveMode) {
      validation = {
        paypal_country: {
          identifier: 'paypal_country',
          rules: [{
            type: 'empty',
            prompt: translation.tab_portalsetting_Paypalsetting_country_incorrect
          }]
        },
        live_secret_key: {
          identifier: 'live_secret_key_paypal',
          rules: [{
            type: 'empty',
            prompt: translation.tab_portalsetting_Paypalsetting_secret_key_incorrect
          }]
        },
        live_publish_key: {
          identifier: 'live_publish_key_paypal',
          rules: [{
            type: 'empty',
            prompt: translation.tab_portalsetting_Paypalsetting_client_key_incorrect
          }]
        }
      };
    }
    $('.ui.form')
      .form(validation, {
        inline: true,
        onSuccess: function() {
          $scope.valcheck = $scope.valcheck && true;
        },
        onFailure: function() {
          $scope.valcheck = $scope.valcheck && false;
        }
      }).form('validate form');

    if (!$('.paypal-currency-field .select2-choices li').hasClass('select2-search-choice')) {
      $('.select-error').remove();
      $('.paypal-currency-field').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_currency_prompt_empty + '</div>');
      $('.paypal-currency-field').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    } else {
      $('.select-error').remove();
      $('.paypal-currency-field').removeClass('error');
      $scope.valcheck = $scope.valcheck && true;
    }
  }

  $scope.getPaypalCountry = function() {
    return Restangular.one('account/paypal/country').customGET().then(function(success) {
      $scope.paypalCountries = success;
    });
  }

  $scope.getPaypalCountry();

  $scope.setPaypalCountry = function(cid) {
    $scope.paypal_setting.country_id = cid;
    $scope.paypal_setting_origin.country_id = cid;

    Restangular.one('account/paypal').customGET("currency", {
      country_id: cid
    }).then(function(success) {
      if ($scope.public_settings.site_theme_shipping_native_lookup) {
        success.forEach(function(value) {
          value.name = value.native_name ? value.native_name : value.name;
        });
      }
      $scope.paypalSupportedCurrencies = success;
    });
  }

  $scope.paypalCountryEnter = function(event) {
    if (event.keyCode == 13) {
      var country_id = event.target.querySelector("input").value;
      $scope.setPaypalCountry(country_id);
    }
  }

  function getPayPalApplication() {
    if($scope.public_settings.paypal_live_id) {
      Restangular.one('account/paypal/application').customGET($scope.public_settings.paypal_live_id).then(function(success) {
        $scope.paypal_setting_live = success.plain();
        if( $scope.public_settings.paypal_mode && $scope.public_settings.paypal_mode=="live" ) {
          $scope.paypal_setting = success.plain();
          $scope.paypal_setting_origin = angular.copy(success);
          if($scope.paypal_setting.country_id) {
            $scope.setPaypalCountry($scope.paypal_setting.country_id);
          }
        }
  
        $scope.paypalTestMode = true;
  
        if ($scope.public_settings.paypal_mode && $scope.public_settings.paypal_mode == 'test') {
          $('#testbtn').addClass('positive');
          $scope.paypalTestMode = true;
          $scope.paypalLiveMode = false;
        }
        if ($scope.public_settings.paypal_mode && $scope.public_settings.paypal_mode == 'live') {
          $('#livebtn').addClass('positive');
          $scope.paypalLiveMode = true;
          $scope.paypalTestMode = false;
          $scope.paypal_live_publishkey = $scope.paypal_setting.publishable_key;
          $scope.paypal_live_secretkey = $scope.paypal_setting.secret_key;
        }
  
      }, function(failure) {
        if (failure.data.code == "entity_not_found") {
          //If stripe application is removed or does not exist, use dummy
          if (typeof $scope.paypal_setting == 'undefined' || !$scope.stripe_setting) {
            $scope.paypal_setting = {
              "connect_code": null,
              "secret_key": "",
              "created": "2018-10-09 13:26:07.195958-07",
              "disabled": 0,
              "stripe_account_id": "1",
              "person_id": user.person_id,
              "email": null,
              "id": "1",
              "country_id": null,
              "currency_id": null,
              "client_id": "",
              "modified": "2018-10-10 20:20:32.108648-07",
              "access_token": null,
              "publishable_key": "",
              "refresh_token": null,
              "user_id": "acct_non_valid",
              "not_in_database": true
            };
            $scope.paypal_setting_origin = angular.copy($scope.paypal_setting);
  
            // Set live mode if live key is set else testmode
            if ($scope.public_settings.paypal_mode && $scope.public_settings.paypal_mode=="live") {
              $('#livebtn').addClass('positive');
              $scope.paypalLiveMode = true;
              $scope.paypalTestMode = false;
            } else {
              $('#testbtn').addClass('positive');
              $scope.paypalTestMode = true;
              $scope.paypalLiveMode = false;
              $scope.paypal_test_publishkey = $scope.paypal_setting.publishable_key;
              $scope.paypal_test_secretkey = $scope.paypal_setting.secret_key;
            }
          }
        }
      });
    }

    if($scope.public_settings.paypal_test_id) {
      Restangular.one('account/paypal/application').customGET($scope.public_settings.paypal_test_id).then(function(success) {
        $scope.paypal_setting_test = success.plain();
        if($scope.public_settings.paypal_mode ) {
          if($scope.public_settings.paypal_mode != "live" ) {
            $scope.paypal_setting = success.plain();
            $scope.paypal_setting_origin = angular.copy(success);
            if($scope.paypal_setting.country_id) {
              $scope.setPaypalCountry($scope.paypal_setting.country_id);
            }
          }
        } else {
          $scope.paypal_setting = success.plain();
          $scope.paypal_setting_origin = angular.copy(success);
          if($scope.paypal_setting.country_id) {
            $scope.setPaypalCountry($scope.paypal_setting.country_id);
          }
        }
  
        $scope.paypalTestMode = true;
  
        if ($scope.public_settings.paypal_mode && $scope.public_settings.paypal_mode == 'test') {
          $('#testbtn').addClass('positive');
          $scope.paypalTestMode = true;
          $scope.paypalLiveMode = false;
          $scope.paypal_test_publishkey = $scope.paypal_setting.publishable_key;
          $scope.paypal_test_secretkey = $scope.paypal_setting.secret_key;
        }
        
        if ($scope.public_settings.paypal_mode && $scope.public_settings.paypal_mode == 'live') {
          $('#livebtn').addClass('positive');
          $scope.paypalLiveMode = true;
          $scope.paypalTestMode = false;
          $scope.paypal_live_publishkey = $scope.paypal_setting.publishable_key;
          $scope.paypal_live_secretkey = $scope.paypal_setting.secret_key;
        }
  
      }, function(failure) {
        if (failure.data.code == "entity_not_found") {
          //If stripe application is removed or does not exist, use dummy
          if (typeof $scope.paypal_setting == 'undefined' || !$scope.stripe_setting) {
            $scope.paypal_setting = {
              "connect_code": null,
              "secret_key": "",
              "created": "2018-10-09 13:26:07.195958-07",
              "disabled": 0,
              "stripe_account_id": "1",
              "person_id": user.person_id,
              "email": null,
              "id": "1",
              "country_id": null,
              "currency_id": null,
              "client_id": "",
              "modified": "2018-10-10 20:20:32.108648-07",
              "access_token": null,
              "publishable_key": "",
              "refresh_token": null,
              "user_id": "acct_non_valid",
              "not_in_database": true
            };
            $scope.paypal_setting_origin = angular.copy($scope.paypal_setting);
  
            // Set live mode if live key is set else testmode
            if ($scope.public_settings.paypal_mode && $scope.public_settings.paypal_mode=="live") {
              $('#livebtn').addClass('positive');
              $scope.paypalLiveMode = true;
              $scope.paypalTestMode = false;
              $scope.paypal_live_publishkey = $scope.paypal_setting.publishable_key;
              $scope.paypal_live_secretkey = $scope.paypal_setting.secret_key;
            } else {
              $('#testbtn').addClass('positive');
              $scope.paypalTestMode = true;
              $scope.paypalLiveMode = false;
              $scope.paypal_test_publishkey = $scope.paypal_setting.publishable_key;
              $scope.paypal_test_secretkey = $scope.paypal_setting.secret_key;
            }
          }
        }
      });
    }
    
    if(!$scope.public_settings.paypal_test_id && !$scope.public_settings.paypal_live_id )  {
      //If stripe application is removed or does not exist, use dummy
      if (typeof $scope.paypal_setting == 'undefined' || !$scope.stripe_setting) {
        $scope.paypal_setting = {
          "connect_code": null,
          "secret_key": "",
          "created": "2018-10-09 13:26:07.195958-07",
          "disabled": 0,
          "stripe_account_id": "1",
          "person_id": user.person_id,
          "email": null,
          "id": "1",
          "country_id": null,
          "currency_id": null,
          "client_id": "",
          "modified": "2018-10-10 20:20:32.108648-07",
          "access_token": null,
          "publishable_key": "",
          "refresh_token": null,
          "user_id": "acct_non_valid",
          "not_in_database": true
        };
        $scope.paypal_setting_origin = angular.copy($scope.paypal_setting);

        // Set live mode if live key is set else testmode
        if ($scope.public_settings.paypal_mode && $scope.public_settings.paypal_mode=="live") {
          $('#livebtn').addClass('positive');
          $scope.paypalLiveMode = true;
          $scope.paypalTestMode = false;
          $scope.paypal_live_publishkey = $scope.paypal_setting.publishable_key;
          $scope.paypal_live_secretkey = $scope.paypal_setting.secret_key;
        } else {
          $('#testbtn').addClass('positive');
          $scope.paypalTestMode = true;
          $scope.paypalLiveMode = false;
          $scope.paypal_test_publishkey = $scope.paypal_setting.publishable_key;
          $scope.paypal_test_secretkey = $scope.paypal_setting.secret_key;
        }
      }
    }
  }

  $scope.savePayPal = function() {
    console.log("savePaypal");
    msg = {
      'loading': true,
      'loading_message': 'saving_settings'
    }
    $rootScope.floatingMessage = msg;

    if ($('.paypal-live').hasClass('positive')) {
      $scope.paypal_setting.publishable_key = $scope.paypal_live_publishkey;
      $scope.paypal_setting.secret_key = $scope.paypal_live_secretkey;
    }
    if ($('.paypal-test').hasClass('positive')) {
      $scope.paypal_setting.publishable_key = $scope.paypal_test_publishkey;
      $scope.paypal_setting.secret_key = $scope.paypal_test_secretkey;
    }

    if ($scope.paypalTestMode && isEmpty($scope.paypal_test_secretkey) && isEmpty($scope.paypal_test_publishkey)) {
      $scope.paypal_no_keys = true;
    }

    if ($scope.paypalLiveMode && isEmpty($scope.paypal_test_secretkey) && isEmpty($scope.paypal_live_publishkey)) {
      $scope.paypal_no_keys = true;
    }

    $rootScope.floatingMessage = [];

    var application_id = "1";

    if( $scope.public_settings.paypal_test_id && $scope.public_settings.paypal_mode && $scope.public_settings.paypal_mode=="test" ) {
      application_id = $scope.public_settings.paypal_test_id;
    }

    if( $scope.public_settings.paypal_live_id && $scope.public_settings.paypal_mode && $scope.public_settings.paypal_mode=="live" ) {
      application_id = $scope.public_settings.paypal_live_id;
    }

    $scope.public_settings.site_campaign_fee_currency = [];
    for (var j = 0; j < $scope.currency_setting.currency_ids.length; j++) {
      for (var i = 0; i < $scope.paypalSupportedCurrencies.length; i++) {
        if ($scope.paypalSupportedCurrencies[i].currency_id == $scope.currency_setting.currency_ids[j]) {
          $scope.public_settings.site_campaign_fee_currency.push($scope.paypalSupportedCurrencies[i]);
        }
      }
    }
    if($scope.public_settings.site_campaign_fee_currency[0]) {
      $scope.paypal_setting.currency_id = $scope.public_settings.site_campaign_fee_currency[0].currency_id;
    }

    Restangular.one('account/paypal/application').customGET(application_id).then(function(success) {
      msg = {
        'loading': true,
        'loading_message': 'saving_settings'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();

      if (($scope.public_settings.paypal_live_id && $scope.paypalLiveMode && !parseInt($scope.public_settings.paypal_live_id) ) || 
        ($scope.public_settings.paypal_test_id && $scope.paypalLiveMode && $scope.public_settings.paypal_test_id == $scope.paypal_setting.id)) {
          // Add new live application if live application id not set or equal to test.
        $scope.paypal_setting.not_in_database = false;

        $scope.paypal_setting.id = "1";
        Restangular.one('account/paypal/application').customPOST($scope.paypal_setting).then(function(success) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();

          $scope.paypalSaveApplicationID(success);
        });
      } else if (($scope.public_settings.paypal_test_id && $scope.paypalTestMode && !parseInt($scope.public_settings.paypal_test_id) ) ||
        ($scope.public_settings.paypal_live_id && $scope.paypalTestMode && $scope.public_settings.paypal_live_id == $scope.paypal_setting.id)) {
          // Add new live application if live application id not set or equal to test.
          $scope.paypal_setting.not_in_database = false;

          $scope.paypal_setting.id = "1";
        Restangular.one('account/paypal/application').customPOST($scope.paypal_setting).then(function(success) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();

          $scope.paypalSaveApplicationID(success);
        });
      } else {
        Restangular.one('account/paypal/application').customPUT($scope.paypal_setting).then(function(success) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();

          $scope.paypalSaveApplicationID(success);
        });
      }

      // var paymentSettingReq = [];
      // var public_setting_call = Restangular.one('portal/setting/public').customPUT($scope.public_settings);
      // paymentSettingReq.push(public_setting_call);

      // // wait for all requests
      // $q.all(paymentSettingReq).then(function(success) {
      //   updateSiteMenu();
      //   msg = {
      //     'header': "success_message_save_changes_button",
      //   }
      //   $rootScope.floatingMessage = msg;
      //   $scope.hideFloatingMessage();
      // }, function(failure) {
      //   msg = {
      //     'header': failure.data.message,
      //   }
      //   $rootScope.floatingMessage = msg;
      //   $scope.hideFloatingMessage();
      // });
      
    }, function(failure) {
      if (failure.data.code == "entity_not_found") {
        Restangular.one('account/paypal/application').customPOST($scope.paypal_setting).then(function(success) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();

          $scope.paypalSaveApplicationID(success);
        });
      }
    });
  }

  // Save paypal application id, publish key and mode to public settings.
  $scope.paypalSaveApplicationID = function (application) {
    
    var paymentSettingReq = [];
    if($scope.paypalLiveMode) {
      $scope.public_settings.paypal_live_id = application.id;
    }
    if($scope.paypalTestMode) {
      $scope.public_settings.paypal_test_id = application.id;
    }

    $scope.public_settings.site_campaign_fee_currency = [];
    for (var j = 0; j < $scope.currency_setting.currency_ids.length; j++) {
      for (var i = 0; i < $scope.paypalSupportedCurrencies.length; i++) {
        if ($scope.paypalSupportedCurrencies[i].currency_id == $scope.currency_setting.currency_ids[j]) {
          $scope.public_settings.site_campaign_fee_currency.push($scope.paypalSupportedCurrencies[i]);
        }
      }
    }
    $scope.public_settings.site_payment_gateway = $scope.paymentId;
    $scope.public_settings.paypal_publishable_key = $scope.paypal_setting.publishable_key;
    $scope.public_settings.paypal_mode = "live";
    if($scope.paypalTestMode) {
      $scope.public_settings.paypal_mode = "test";
    }

    var public_setting_call = Restangular.one('portal/setting/public').customPUT($scope.public_settings);
    paymentSettingReq.push(public_setting_call);

    // wait for all requests
    $q.all(paymentSettingReq).then(function(success) {
      // Reload paypal application data
      getPayPalApplication();
      msg = {
        'header': "success_message_save_changes_button",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }, function(failure) {
      msg = {
        'header': failure.data.message,
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }

  $scope.raiseModeChange = function(mode) {
    if (mode.allowed == false) {
      mode.default = false;
      var count = 0;
      for (var i = 0; i < $scope.raise_modes.length; i++) {
        if ($scope.raise_modes[i].allowed) {
          count++;
          break;
        }
      }
      if (count == 0) {
        $scope.error_content = "tab_portalsetting_select_raise_mode_error";
        $('.error-modal').modal('show');
        mode.allowed = true;
      } else if (count == 1) {
        var index = 0;
        for (var j = 0; j < $scope.raise_modes.length; j++) {
          if ($scope.raise_modes[j].allowed) {
            index = j;
          }
        }
        $('.default_mode').attr('value', index + 1);
        $('.default-mode-text').text($scope.raise_modes[index].description);
      } else if ($('.default_mode').val() == mode.id) {
        $('.default_mode').removeAttr('value');
        $('.default-mode-text').text('Select Default Mode');
      }
    }
    if (mode.default && mode.allowed) {
      $scope.default_mode = mode.description;
    }
  }

  $scope.currencypicker = {
    width: '100%'
  };

  /*
  function initialThemeColor() {
    var number_theme = 10;
    for (var i = 0; i < number_theme; i++) {
      $('.main-color').removeClass('theme-button-' + (i + 1));
      $('.main-color').removeClass('theme-table-' + (i + 1));
      $('.main-color').removeClass('theme-banner-' + (i + 1));
      $('.main-color').removeClass('theme-font-' + (i + 1));
      $('.main-color').removeClass('theme-reward-' + (i + 1));
      $('.main-color').removeClass('theme-top-nav-background-' + (i + 1));
      $('.main-color').removeClass('theme-top-nav-font-' + (i + 1));
      $('.main-color').removeClass('theme-footer-background-' + (i + 1));
      $('.main-color').removeClass('theme-footer-font-' + (i + 1));
    }
    $('.main-color').addClass('theme-button-' + $scope.public_settings.site_theme_color.button_color.index);
    $('.main-color').addClass('theme-table-' + $scope.public_settings.site_theme_color.table_color.index);
    $('.main-color').addClass('theme-banner-' + $scope.public_settings.site_theme_color.banner_color.index);
    $('.main-color').addClass('theme-font-' + $scope.public_settings.site_theme_color.font_color.index);
    $('.main-color').addClass('theme-reward-' + $scope.public_settings.site_theme_color.reward_block_color.index);
    $('.main-color').addClass('theme-top-nav-background-' + $scope.public_settings.site_theme_color.top_nav_background_color.index);
    $('.main-color').addClass('theme-top-nav-font-' + $scope.public_settings.site_theme_color.top_nav_font_color.index);
    $('.main-color').addClass('theme-footer-background-' + $scope.public_settings.site_theme_color.footer_background_color.index);
    $('.main-color').addClass('theme-footer-font-' + $scope.public_settings.site_theme_color.footer_font_color.index);
  }

  function setColorActive(index) {
    var $elem = $('.color-setting-list .color-item:nth-child(' + index + ')');
    var parent = $elem.closest('.color-grid');
    parent.find('.color-item').removeClass('active');
    parent.find('.top-nav-color-item').removeClass('active');
    $elem.addClass('active');
  }

  $scope.selectThemeColor = function(color, section) {
    $scope.public_settings.site_theme_color[section].index = color.index;
    // set active
    setColorActive(color.index);
    initialThemeColor();
  }
  */

  $scope.restoreThemeSettings = function() {

    $scope.public_settings.site_theme_color["banner_color"].index = 4;
    $scope.public_settings.site_theme_color["banner_color"].value = '#4C9EE7';
    $scope.public_settings.site_theme_color["button_color"].index = 4;
    $scope.public_settings.site_theme_color["button_color"].value = '#4C9EE7';
    $scope.public_settings.site_theme_color["font_color"].index = 4;
    $scope.public_settings.site_theme_color["font_color"].value = '#4C9EE7';
    $scope.public_settings.site_theme_color["footer_background_color"].index = 9;
    $scope.public_settings.site_theme_color["footer_background_color"].value = '#333333';
    $scope.public_settings.site_theme_color["footer_font_color"].index = 10;
    $scope.public_settings.site_theme_color["footer_font_color"].value = '#ffffff';
    $scope.public_settings.site_theme_color["reward_block_color"].index = 3;
    $scope.public_settings.site_theme_color["reward_block_color"].value = '#00B5AD';
    $scope.public_settings.site_theme_color["table_color"].index = 4;
    $scope.public_settings.site_theme_color["table_color"].value = '#4C9EE7';
    $scope.public_settings.site_theme_color["top_nav_background_color"].index = 9;
    $scope.public_settings.site_theme_color["top_nav_background_color"].value = '#333333';
    $scope.public_settings.site_theme_color["top_nav_font_color"].index = 10;
    $scope.public_settings.site_theme_color["top_nav_font_color"].value = '#ffffff';

    //initialThemeColor();
    //$scope.selectColorSection($scope.selected_color_section);

  }

  $scope.selectLoadClass = function(semantic_icon) {
    $scope.site_load_class = semantic_icon.name;
  }

  $scope.selectColorSection = function(section) {
    // pass section variable
    $scope.selected_color_section = section;
    // set active index
    //setColorActive($scope.public_settings.site_theme_color[section.var_name].index);
  }

  $scope.selectSocialMedia = function(obj) {
    $scope.media_selected = obj;
  }

  $scope.selectSearchFilter = function(index) {
    $scope.public_settings.site_search_explore = $scope.searchFilters[index];
  }

  $scope.validateFacebookComment = function() {
    var translation = $translate.instant(['tab_portalsetting_facebook_app_id_validation']);
    $('.ui.form').form({
      facebook_app_id: {
        identifier: 'facebook_app_id',
        rules: [{
          type: 'empty',
          prompt: translation.tab_portalsetting_facebook_app_id_validation
        }]
      },
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

  $scope.saveDisqusShortname = function(value) {
    $scope.valcheck = true;

    if ($scope.comment && $scope.comment == 'facebook') {
      $scope.validateFacebookComment();
    }

    if ($scope.valcheck) {
      msg = {
        'loading': true,
        'loading_message': 'saving_settings'
      }
      $rootScope.floatingMessage = msg;
      //$scope.clearMessage();
      // set comment system
      publicSettings = {
        custom_comment_show_comment_picture: $scope.public_settings.custom_comment_show_comment_picture,
        comment_system: $scope.comment,
        custom_comment_comment_background_color: $scope.public_settings.custom_comment_comment_background_color,
        custom_comment_auto_refresh: $scope.public_settings.custom_comment_auto_refresh,
        custom_comment_anonymous_commenting: $scope.public_settings.custom_comment_anonymous_commenting,
        custom_comment_anonymous_force: $scope.public_settings.custom_comment_anonymous_commenting_force,
        custom_comment_font_family: $scope.public_settings.custom_comment_font_family,
        custom_comment_font_color: $scope.public_settings.custom_comment_font_color,
        site_facebook_app_id: $scope.public_settings.site_facebook_app_id
      }

      Restangular.one('portal/setting/public').customPUT(publicSettings).then(function(success) {
        msg = {
          'header': "success_message_save_changes_button",
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }, function(failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });

      //if using Disqus, save disqus shortname
      if ($scope.comment == "disqus") {
        window.disqus_shortname = value;
        DisqusShortnameService.setDisqusShortname(value).then(function(success) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        }, function(failure) {
          msg = {
            'header': failure.data.message,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      }
    }
  }

  // WIDGET SETTINGS

  $scope.widget_dropdown = [{
    name: 'WordPress',
    idx: 2
  }, {
    name: 'Twitter',
    idx: 3
  }];

  $scope.displayWidgetSection = function(obj) {
    $scope.widget_display = obj.idx;
  }

  $scope.saveComponentSettings = function() {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'saving_settings'
    }
    $rootScope.floatingMessage = msg;
    var requestQueue = [];
    var publicSettings = {
      site_widget_contact_form_receiver: $scope.public_settings.site_widget_contact_form_receiver,
      site_widget_twitter_widget: $scope.public_settings.site_widget_twitter_widget,
    };


    if ($scope.public_settings.hasOwnProperty('site_widget_twitter_widget') && $scope.public_settings.site_widget_twitter_widget.hasOwnProperty('code')) {
      $scope.isCodeValid = !isDocumentWrite($scope.public_settings.site_widget_twitter_widget.code);
    }

    if ($scope.public_settings.hasOwnProperty('site_widget_wp_api') && $scope.public_settings.site_widget_wp_api.hasOwnProperty('url')) {
      $scope.isCodeValid = $scope.public_settings.site_widget_wp_api.url.length > 0;
    }

    if (!publicSettings.site_widget_contact_form_receiver || publicSettings.site_widget_contact_form_receiver.length == 0) {
      publicSettings.site_widget_contact_form_receiver = $scope.private_settings.site_email_address_admin;
    }

    if ($scope.public_settings.hasOwnProperty('site_widget_wp_api') && $scope.public_settings.site_widget_wp_api.url) {
      var req = {
        method: 'GET',
        url: $scope.public_settings.site_widget_wp_api.url + 'posts',
        transformRequest: function(data, headersGetter) {
          var headers = headersGetter();
          // headers['location'] = 'WP-Service';
          delete headers['X-Auth-Token'];
          return headers;
        },
        withCredentials: false,
        functionLocation: 'wp_service'
      };

      $http(req).then(function(data, status, headers, config) {
        $scope.wp_error = false;
        publicSettings['site_widget_wp_api'] = $scope.public_settings.site_widget_wp_api;
        requestQueue.push(Restangular.one('portal/setting/public').customPUT(publicSettings));
      }, function(failure) {
        if (failure.status != 200) {
          $scope.wp_error = true;
          requestQueue.push(Restangular.one('portal/setting/public').customPUT(publicSettings));
        }
      })
    } else {
      requestQueue.push(Restangular.one('portal/setting/public').customPUT(publicSettings));
    }

    $q.all(requestQueue).then(function() {
      msg = {
        'header': "success_message_save_changes_button",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }, function(failed) {
      msg = {
        'header': failed.data.message,
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }

  $scope.stripeConnect = function() {
    if ($scope.stripe_setting.client_id && $scope.stripe_setting.publishable_key && $scope.stripe_setting.secret_key) {
      if ($scope.public_settings.site_campaign_fee_direct_transaction) {
        $scope.stripe_fee.campaign_fee = 100;
      }
      var data = {
        'site_campaign_fee_percentage': $scope.stripe_fee.campaign_fee,
        'site_campaign_fee_direct_transaction': $scope.public_settings.site_campaign_fee_direct_transaction,
      };
      Restangular.one('portal/setting/public').customPUT(data);
      var client_id = $scope.stripe_setting.client_id;
      var redirect = StripeService.redirectURL();
      var state = StripeService.generateStateParam('/admin/dashboard#portal-settings');
      $window.location.href = "https://connect.stripe.com/oauth/authorize?response_type=code&client_id=" + client_id + "&scope=read_write&redirect_uri=" + redirect + "&state=" + state;
    } else {
      setTimeout(function() {
        $translate(['stripe_not_setup']).then(function(value) {
          $scope.notsetup = value.stripe_not_setup;
          msg = {
            'header': $scope.notsetup,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        })
      }, 50);
    }
  }

  $scope.showBannerEditor = function(place) {
    $scope.bannerEditor = place == "main" ? "main" : "bot";
  }

  $scope.$watch("public_settings.site_campaign_custom_button.toggle", function(newValue, oldValue) {
    if (!newValue) {
      $timeout(function() {
        $('.ui.form#custom-formatting-form').form('reset');
      });
    }
  });
  $scope.$watch("public_settings.site_theme_campaign_show_reward_enable_variation", function(newValue, oldValue) {
    if (newValue) {
      $scope.rewardAttributesEnabled = true;
    } else {
      $scope.rewardAttributesEnabled = false;
    }
  });
  $scope.$watch("public_settings.site_theme_alt_shipping_layout", function(newValue, oldValue) {
    var $defCountry = $(".defaultCountry");
    if (newValue) {
      $defCountry.removeClass("disabled");
    }
    // Avoid undesirable first initialization call
    if (newValue !== oldValue) {
      // Check if set default country is disabled, if so then change value and checked to unchecked
      if (newValue) {
        $defCountry.removeClass("disabled");
      } else {
        $scope.public_settings.site_theme_default_shipping_country = {};
        $defCountry.dropdown("clear");
        $defCountry.addClass("disabled");
      }
    }
  });

  $scope.$watch('currency_setting.currency_ids', function(newValue, oldValue) {
    if (newValue) {
      if ($('#campaign-currency-field .select2-choices li').hasClass('select2-search-choice')) {
        $('.select-error').remove();
        $('#campaign-currency-field').removeClass('error');
      }
    }
  });
  $scope.setCountry = function(country) {
    for (var i in countries_orig) {
      if (countries_orig[i].id == country.id) {
        $scope.public_settings.site_theme_default_shipping_country = countries_orig[i];
      }
    }
  }

  function getCountries() {
    Geolocator.getCountries().then(function(countries) {
      countries_orig = countries;
      if ($scope.public_settings.site_theme_shipping_native_lookup) {
        for (var i in countries) {
          if (countries[i].native_name != null) {
            countries[i].name = countries[i].native_name;
          }
        }
      }
      $scope.countries = countries;
      // Move default country to the first item if it exists
      if ($scope.default_country) {
        for (var index in $scope.countries) {
          var value = $scope.countries[index];
          if (value.id == $scope.default_country.id) {
            $scope.default_country = value;
            $scope.countries.splice(index, 1);
            break;
          }
        }
        $scope.countries.splice(0, 0, $scope.default_country);
      }
    });
  }

  $scope.setAuthScheme = function(auth) {
    $scope.public_settings.site_auth_scheme = auth;
  }

  $scope.setInlineContrib = function(inline) {
    $scope.public_settings.site_contribute_behaviour.default = inline;
  }

  // Loads the preview for video link.
  $scope.loadPreviewVideo = function() {
    if ($scope.public_settings.site_theme_banner_is_image == false &&
      $scope.public_settings.site_theme_banner_video_link !== undefined) {
      var videoSettings = {
        mute: false,
        autoplay: false
      };
      VideoLinkService.setSettings(videoSettings);

      var initialVideoLink = $scope.public_settings.site_theme_banner_video_link;
      VideoLinkService.processVideoLink(initialVideoLink);

      $scope.site_theme_banner_video_link_type = VideoLinkService.get_video_type();
      $scope.site_theme_banner_video_link_preview = VideoLinkService.get_video_link();
    }
  }

  // Hides the preview video.
  $scope.deletePreviewVideo = function() {
    $scope.public_settings.site_theme_banner_video_link = "";
    $scope.site_theme_banner_video_link_preview = "";
    $scope.site_theme_banner_video_link_type = "none";
  }

  $scope.setAccord = function() {
    $("#homeAccordion").accordion("open", 0);
  }

  $scope.load_icons = [{
    index: 0,
    name: 'add user',
  }, {
    index: 1,
    name: 'add to cart',
  }, {
    index: 2,
    name: 'adjust',
  }, {
    index: 3,
    name: 'alarm',
  }, {
    index: 4,
    name: 'alarm outline',
  }, {
    index: 5,
    name: 'alarm slash',
  }, {
    index: 6,
    name: 'alarm slash outline',
  }, {
    index: 7,
    name: 'anchor',
  }, {
    index: 8,
    name: 'archive',
  }, {
    index: 9,
    name: 'asterisk',
  }, {
    index: 10,
    name: 'at',
  }, {
    index: 11,
    name: 'ban',
  }, {
    index: 12,
    name: 'bar',
  }, {
    index: 13,
    name: 'bomb',
  }, {
    index: 14,
    name: 'book',
  }, {
    index: 15,
    name: 'bookmark',
  }, {
    index: 16,
    name: 'browser',
  }, {
    index: 17,
    name: 'bug',
  }, {
    index: 18,
    name: 'bullseye',
  }, {
    index: 19,
    name: 'calculator',
  }, {
    index: 20,
    name: 'calendar',
  }, {
    index: 21,
    name: 'calendar outline',
  }, {
    index: 22,
    name: 'call',
  }, {
    index: 23,
    name: 'call square',
  }, {
    index: 24,
    name: 'certificate',
  }, {
    index: 25,
    name: 'checkered flag',
  }, {
    index: 26,
    name: 'circle',
  }, {
    index: 27,
    name: 'circle notched',
  }, {
    index: 28,
    name: 'circle thin',
  }, {
    index: 29,
    name: 'cloud',
  }, {
    index: 30,
    name: 'cloud download',
  }, {
    index: 31,
    name: 'cloud upload',
  }, {
    index: 32,
    name: 'cocktail',
  }, {
    index: 33,
    name: 'code',
  }, {
    index: 34,
    name: 'comment',
  }, {
    index: 35,
    name: 'comment outline',
  }, {
    index: 36,
    name: 'comments',
  }, {
    index: 37,
    name: 'comments outline',
  }, {
    index: 38,
    name: 'compress',
  }, {
    index: 39,
    name: 'configure',
  }, {
    index: 40,
    name: 'copyright',
  }, {
    index: 41,
    name: 'crosshairs',
  }, {
    index: 42,
    name: 'cube',
  }, {
    index: 43,
    name: 'cubes',
  }, {
    index: 44,
    name: 'dashboard',
  }, {
    index: 45,
    name: 'diamond',
  }, {
    index: 46,
    name: 'download',
  }, {
    index: 47,
    name: 'edit',
  }, {
    index: 48,
    name: 'ellipsis horizontal',
  }, {
    index: 49,
    name: 'ellipsis vertical',
  }, {
    index: 50,
    name: 'empty heart',
  }, {
    index: 51,
    name: 'empty star',
  }, {
    index: 52,
    name: 'erase',
  }, {
    index: 53,
    name: 'exchange',
  }, {
    index: 54,
    name: 'expand',
  }, {
    index: 55,
    name: 'external',
  }, {
    index: 56,
    name: 'external share',
  }, {
    index: 57,
    name: 'external square',
  }, {
    index: 58,
    name: 'eyedropper',
  }, {
    index: 59,
    name: 'fax',
  }, {
    index: 60,
    name: 'feed',
  }, {
    index: 61,
    name: 'filter',
  }, {
    index: 62,
    name: 'find',
  }, {
    index: 63,
    name: 'fire',
  }, {
    index: 64,
    name: 'fire extinguisher',
  }, {
    index: 65,
    name: 'flag',
  }, {
    index: 66,
    name: 'flag outline',
  }, {
    index: 67,
    name: 'forward mail',
  }, {
    index: 68,
    name: 'frown',
  }, {
    index: 69,
    name: 'gift',
  }, {
    index: 70,
    name: 'heart',
  }, {
    index: 71,
    name: 'heartbeat',
  }, {
    index: 72,
    name: 'hide',
  }, {
    index: 73,
    name: 'history',
  }, {
    index: 74,
    name: 'home',
  }, {
    index: 75,
    name: 'idea',
  }, {
    index: 76,
    name: 'in cart',
  }, {
    index: 77,
    name: 'inbox',
  }, {
    index: 78,
    name: 'lab',
  }, {
    index: 79,
    name: 'leaf',
  }, {
    index: 80,
    name: 'legal',
  }, {
    index: 81,
    name: 'lemon',
  }, {
    index: 82,
    name: 'life ring',
  }, {
    index: 83,
    name: 'lightning',
  }, {
    index: 84,
    name: 'lock',
  }, {
    index: 85,
    name: 'magnet',
  }, {
    index: 86,
    name: 'mail',
  }, {
    index: 87,
    name: 'mail outline',
  }, {
    index: 88,
    name: 'mail square',
  }, {
    index: 89,
    name: 'map',
  }, {
    index: 90,
    name: 'meh',
  }, {
    index: 91,
    name: 'money',
  }, {
    index: 92,
    name: 'moon',
  }, {
    index: 93,
    name: 'options',
  }, {
    index: 94,
    name: 'paint brush',
  }, {
    index: 95,
    name: 'payment',
  }, {
    index: 96,
    name: 'pin',
  }, {
    index: 97,
    name: 'plane',
  }, {
    index: 98,
    name: 'print',
  }, {
    index: 99,
    name: 'privacy',
  }, {
    index: 100,
    name: 'protect',
  }, {
    index: 101,
    name: 'puzzle',
  }, {
    index: 102,
    name: 'quote left',
  }, {
    index: 103,
    name: 'quote right',
  }, {
    index: 104,
    name: 'rain',
  }, {
    index: 105,
    name: 'random',
  }, {
    index: 106,
    name: 'recycle',
  }, {
    index: 107,
    name: 'refresh',
  }, {
    index: 108,
    name: 'remove bookmark',
  }, {
    index: 109,
    name: 'remove user',
  }, {
    index: 110,
    name: 'repeat',
  }, {
    index: 111,
    name: 'reply',
  }, {
    index: 112,
    name: 'reply all',
  }, {
    index: 113,
    name: 'retweet',
  }, {
    index: 114,
    name: 'road',
  }, {
    index: 115,
    name: 'rocket',
  }, {
    index: 116,
    name: 'search',
  }, {
    index: 117,
    name: 'send',
  }, {
    index: 118,
    name: 'send outline',
  }, {
    index: 119,
    name: 'setting',
  }, {
    index: 120,
    name: 'settings',
  }, {
    index: 121,
    name: 'share',
  }, {
    index: 122,
    name: 'share alternate',
  }, {
    index: 123,
    name: 'share alternate square',
  }, {
    index: 124,
    name: 'share square',
  }, {
    index: 125,
    name: 'shipping',
  }, {
    index: 126,
    name: 'shop',
  }, {
    index: 127,
    name: 'sign in',
  }, {
    index: 128,
    name: 'sign out',
  }, {
    index: 129,
    name: 'signal',
  }, {
    index: 130,
    name: 'sitemap',
  }, {
    index: 131,
    name: 'smile',
  }, {
    index: 132,
    name: 'soccer',
  }, {
    index: 133,
    name: 'spinner',
  }, {
    index: 134,
    name: 'star',
  }, {
    index: 135,
    name: 'star half',
  }, {
    index: 136,
    name: 'star half empty',
  }, {
    index: 137,
    name: 'suitcase',
  }, {
    index: 138,
    name: 'sun',
  }, {
    index: 139,
    name: 'tag',
  }, {
    index: 140,
    name: 'tags',
  }, {
    index: 141,
    name: 'tasks',
  }, {
    index: 142,
    name: 'terminal',
  }, {
    index: 143,
    name: 'text telephone',
  }, {
    index: 144,
    name: 'theme',
  }, {
    index: 145,
    name: 'thumbs down',
  }, {
    index: 146,
    name: 'thumbs outline down',
  }, {
    index: 147,
    name: 'thumbs outline up',
  }, {
    index: 148,
    name: 'thumbs up',
  }, {
    index: 149,
    name: 'ticket',
  }, {
    index: 150,
    name: 'translate',
  }, {
    index: 151,
    name: 'travel',
  }, {
    index: 152,
    name: 'treatment',
  }, {
    index: 153,
    name: 'trophy',
  }, {
    index: 154,
    name: 'undo',
  }, {
    index: 155,
    name: 'unhide',
  }, {
    index: 156,
    name: 'unlock',
  }, {
    index: 157,
    name: 'unlock alternate',
  }, {
    index: 158,
    name: 'upload',
  }, {
    index: 159,
    name: 'wait',
  }, {
    index: 160,
    name: 'wifi',
  }, {
    index: 161,
    name: 'wizard',
  }, {
    index: 162,
    name: 'world',
  }, {
    index: 163,
    name: 'write',
  }, {
    index: 164,
    name: 'write square',
  }];

  // Upload Partner Logo Image
  $scope.uploadPartnerLogo = function(files, index) {
    if (files.length) {
      var params = {
        resource_content_type: 'image',
      };
      var $picNode = $('.partner-logo');
      FileUploadService.upload('portal/resource/file', files, params, $picNode).then(function(success) {
        $scope.public_settings.logo_links[index].image_link = success[0].data.path_external;
      });
    }
  }

  // Add Another Partner Logo
  $scope.addPartnerLogo = function(arr) {
    if (arr.length < 6) {
      var link = {
        name: '',
        url: ''
      };
      if (arr) {
        arr.push(angular.copy(link));
      }
    }
  }

  // Remove Partner Logo
  $scope.removePartnerLogo = function(link, index) {
    $scope.public_settings.logo_links.splice(index, 1);
  }

  // Add Another Tier
  $scope.addTier = function() {
    if (!$scope.public_settings.site_tipping.tiers || $scope.public_settings.site_tipping.tiers.length == 0) {
      $scope.public_settings.site_tipping.tiers = [];
      $scope.public_settings.site_tipping.tiers.length = 0;
    }
    var tier = {
      name: '',
      value: '',
      type: 'Dollar'
    };
    $scope.public_settings.site_tipping.tiers.push(angular.copy(tier));
  }

  $scope.updateTierType = function(index, type) {
    $scope.public_settings.site_tipping.tiers[index].type = type;
  }

  $scope.removeTier = function(index) {
    $scope.public_settings.site_tipping.tiers.splice(index, 1);
  }

  $scope.setTipDefault = function(type) {
    $scope.public_settings.site_tipping.selectedTipDefault = type;
  }

  $scope.$watchGroup(["testmode", "stripe_test_secretkey", "stripe_test_publishkey", "livemode", "stripe_live_secretkey", "stripe_live_publishkey"], function(newValue, oldValue) {
    if (newValue != oldValue) {
      var isTestMode = true,
        isLiveMode = true;

      for (var i = 0; i <= 2; i++) {
        isTestMode = isTestMode && !!newValue[i];
      }
      for (var i = 4; i <= 5; i++) {
        isLiveMode = isLiveMode && !!newValue[i];
      }
      resetStripeKeyErrors();

      // $scope.showDirectTransaction = isTestMode || isLiveMode;
    }
  });

  function getCurrency() {
    CurrencyService.getCurrency(function(success) {
      if (success) {
        if ($scope.native_lookup) {
          success.forEach(function(value) {
            value.name = value.native_name ? value.native_name : value.name;
          });
        }
        $scope.currency_options = success;
        angular.forEach($scope.currency_options, function(value) {
          if (value.currency_id == $scope.public_settings.site_campaign_currency_id) {
            $scope.ccode = value.code_iso4217_alpha;
          }
        });
        if (!$scope.public_settings.site_campaign_currency_id) {
          $scope.public_settings.site_campaign_currency_id = success[0].currency_id;
        }
        if (!$scope.public_settings.site_tip_currency) {
          angular.forEach(success, function(value) {
            if (value.currency_id == $scope.public_settings.site_campaign_currency_id) {
              $scope.public_settings.site_tip_currency = value;
            }
          });
        }
        if (!$scope.ccode) {
          $scope.ccode = "CAD";
        }
      }
    });
  }

  $scope.directTransactionValidation = function() {
    var translation = $translate.instant(['tab_portalsetting_payment_Setting_public_key_incorrect', 'tab_portalsetting_payment_Setting_secret_key_incorrect', 'tab_portalsetting_payment_Setting_client_key_incorrect', 'tab_portalsetting_payment_Setting_stripe_country_incorrect', 'tab_portalsetting_payment_Setting_transaction_key_incorrect', 'tab_portalsetting_payment_Setting_transaction_key_empty', 'tab_portalsetting_currency_prompt_empty', 'tab_portalsetting_bank_form_country_empty']);

    $.fn.form.settings.rules.transactionFeeRange = function(param) {
      if (param >= 0 && param <= 100) {
        return true
      } else {
        return false;
      }
    }

    if ($scope.public_settings.site_campaign_fee_direct_transaction) {
      //else its test mode
      if ($scope.livemode) {
        $('.ui.form')
          .form({
            live_secret_key: {
              identifier: 'live_secret_key',
              rules: [{
                type: 'empty',
                prompt: translation.tab_portalsetting_payment_Setting_secret_key_incorrect
              }]
            },
            live_publish_key: {
              identifier: 'live_publish_key',
              rules: [{
                type: 'empty',
                prompt: translation.tab_portalsetting_payment_Setting_public_key_incorrect
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

        if ($scope.public_settings.site_campaign_country_funding_step) {
          if (!$('#bankform-country-field .select2-choices li').hasClass('select2-search-choice')) {
            $('.bankform-select-error').remove();
            $('#bankform-country-field').append('<div class="bankform-select-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_bank_form_country_empty + '</div>');
            $('#bankform-country-field').addClass('error');
            $scope.valcheck = $scope.valcheck && false;
          } else {
            $('.bankform-select-error').remove();
            $('#bankform-country-field').removeClass('error');
            $scope.valcheck = $scope.valcheck && true;
          }
        }
      } else {
        $('.ui.form')
          .form({
            test_secret_key: {
              identifier: 'test_secret_key',
              rules: [{
                type: 'empty',
                prompt: translation.tab_portalsetting_payment_Setting_secret_key_incorrect
              }]
            },
            test_publish_key: {
              identifier: 'test_publish_key',
              rules: [{
                type: 'empty',
                prompt: translation.tab_portalsetting_payment_Setting_public_key_incorrect
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

        if ($scope.public_settings.site_campaign_country_funding_step) {
          if (!$('#bankform-country-field .select2-choices li').hasClass('select2-search-choice')) {
            $('.bankform-select-error').remove();
            $('#bankform-country-field').append('<div class="bankform-select-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_bank_form_country_empty + '</div>');
            $('#bankform-country-field').addClass('error');
            $scope.valcheck = $scope.valcheck && false;
          } else {
            $('.bankform-select-error').remove();
            $('#bankform-country-field').removeClass('error');
            $scope.valcheck = $scope.valcheck && true;
          }
        }
      }
    } else {
      //else its test mode
      if ($scope.livemode) {
        $('.ui.form')
          .form({
            live_secret_key: {
              identifier: 'live_secret_key',
              rules: [{
                type: 'empty',
                prompt: translation.tab_portalsetting_payment_Setting_secret_key_incorrect
              }]
            },
            live_publish_key: {
              identifier: 'live_publish_key',
              rules: [{
                type: 'empty',
                prompt: translation.tab_portalsetting_payment_Setting_public_key_incorrect
              }]
            },
            live_client_id: {
              identifier: 'live_client_id',
              rules: [{
                type: 'empty',
                prompt: translation.tab_portalsetting_payment_Setting_client_key_incorrect
              }]
            },
            campaign_fee: {
              identifier: 'campaign_fee',
              rules: [{
                  type: 'empty',
                  prompt: translation.tab_portalsetting_payment_Setting_transaction_key_empty
                },
                {
                  type: 'integer',
                  prompt: translation.tab_portalsetting_payment_Setting_transaction_key_empty
                },
                {
                  type: 'transactionFeeRange[param]',
                  prompt: translation.tab_portalsetting_payment_Setting_transaction_key_incorrect
                }
              ]
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

        if ($scope.public_settings.site_campaign_country_funding_step) {
          if (!$('#bankform-country-field .select2-choices li').hasClass('select2-search-choice')) {
            $('.bankform-select-error').remove();
            $('#bankform-country-field').append('<div class="bankform-select-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_bank_form_country_empty + '</div>');
            $('#bankform-country-field').addClass('error');
            $scope.valcheck = $scope.valcheck && false;
          } else {
            $('.bankform-select-error').remove();
            $('#bankform-country-field').removeClass('error');
            $scope.valcheck = $scope.valcheck && true;
          }
        }
      } else {
        $('.ui.form')
          .form({
            test_secret_key: {
              identifier: 'test_secret_key',
              rules: [{
                type: 'empty',
                prompt: translation.tab_portalsetting_payment_Setting_secret_key_incorrect
              }]
            },
            test_publish_key: {
              identifier: 'test_publish_key',
              rules: [{
                type: 'empty',
                prompt: translation.tab_portalsetting_payment_Setting_public_key_incorrect
              }]
            },
            test_client_id: {
              identifier: 'test_client_id',
              rules: [{
                type: 'empty',
                prompt: translation.tab_portalsetting_payment_Setting_client_key_incorrect
              }]
            },
            campaign_fee: {
              identifier: 'campaign_fee',
              rules: [{
                  type: 'empty',
                  prompt: translation.tab_portalsetting_payment_Setting_transaction_key_empty
                },
                {
                  type: 'integer',
                  prompt: translation.tab_portalsetting_payment_Setting_transaction_key_empty
                },
                {
                  type: 'transactionFeeRange[param]',
                  prompt: translation.tab_portalsetting_payment_Setting_transaction_key_incorrect
                }
              ]
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

        if ($scope.public_settings.site_campaign_country_funding_step) {
          if (!$('#bankform-country-field .select2-choices li').hasClass('select2-search-choice')) {
            $('.bankform-select-error').remove();
            $('#bankform-country-field').append('<div class="bankform-select-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_bank_form_country_empty + '</div>');
            $('#bankform-country-field').addClass('error');
            $scope.valcheck = $scope.valcheck && false;
          } else {
            $('.bankform-select-error').remove();
            $('#bankform-country-field').removeClass('error');
            $scope.valcheck = $scope.valcheck && true;
          }
        }
      }
    }
  }

  $scope.countryCurrencyValidate = function() {
    var translation = $translate.instant(['tab_portalsetting_payment_Setting_stripe_country_incorrect', 'tab_portalsetting_currency_prompt_empty']);

    $('.ui.form')
      .form({
        stripe_country: {
          identifier: 'stripe_country',
          rules: [{
            type: 'empty',
            prompt: translation.tab_portalsetting_payment_Setting_stripe_country_incorrect
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

    if (!$('#campaign-currency-field .select2-choices li').hasClass('select2-search-choice')) {
      $('.select-error').remove();
      $('#campaign-currency-field').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.tab_portalsetting_currency_prompt_empty + '</div>');
      $('#campaign-currency-field').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    } else {
      $('.select-error').remove();
      $('#campaign-currency-field').removeClass('error');
      $scope.valcheck = $scope.valcheck && true;
    }
  }

  /*
  $scope.$watch(["public_settings.payment_setting_enabled"], function(newValue, oldValue) {
    if (newValue) {
      $scope.public_settings.site_campaign_contributions = true;
      $(".site-campaign-contribution").checkbox("check");
    } 

    if(newValue === false) {
      $scope.public_settings.site_campaign_contributions = false;
      $(".site-campaign-contribution").checkbox("uncheck");
    }
  });
  */

  $scope.$watch("currency_setting.currency_ids", function(newValue, oldValue) {
    if (newValue) {
      if ($('#campaign-currency-field .select2-choices li').hasClass('select2-search-choice')) {
        if (newValue !== undefined && newValue.length) {
          $timeout(function() {
            $('.select-error').remove();
            $('#campaign-currency-field').removeClass('error');
            $scope.valcheck = $scope.valcheck && true;
          });
        }
      }
    }
  });


  $scope.clickCC = function(a, b) {
    if (a && b) {
      $(".site-campaign-contribution").removeClass("disabled");
      angular.element(document.querySelector('.site-campaign-contribution')).click();
    }
    if (!a && !b) {
      $(".site-campaign-contribution").removeClass("disabled");
      angular.element(document.querySelector('.site-campaign-contribution')).click();
    }
    if (!a && b) {
      $(".site-campaign-contribution").removeClass("disabled");
      angular.element(document.querySelector('.site-campaign-contribution')).click();
    }
  };

  function isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
});