app.controller('CreateCampaignCtrl', function($q, $location, $routeParams, $rootScope, $scope, $interval, $timeout, $translatePartialLoader, $translate, $http, APICampaign, APIPortal, APILocale, API_URL, RESOURCE_REGIONS, UserService, CreateCampaignService, Restangular, Geolocator, $upload, CurrencyService, FileUploadService, ngQuickDateDefaults, PortalSettingsService, CampaignSettingsService, RestFullResponse) {
  $scope.urlHost = $location.protocol() + "://" + $location.host() + "/";
  $scope.clearMessage = function() {
    $rootScope.floatingMessage = [];
  };
  var msg;
  $scope.urlHost = $location.protocol() + "://" + $location.host() + "/";
  $scope.clearMessage = function() {
    $rootScope.floatingMessage = [];
  };

  var reward_priority = -1;

  var countriesWithShippingStatus = [];
  $scope.froalaOptionsCampaigns = {};

  $scope.organization_name = {};

  function initiateOptions(foption) {
    for (var prop in $rootScope.froalaOptions) {
      if ($rootScope.froalaOptions.hasOwnProperty(prop)) {
        foption[prop] = $rootScope.froalaOptions[prop];
      }
    }
  }
  // var user = UserService;

  $scope.thresholdvalue = {
    value: 0
  };

  var reqDeleteFileArr = [];
  $scope.currentUploadFile = {
    "title": "",
    "description": "",
    "fileName": "",
    "icon": "file",
    "path": "",
    "resourceId": -1
  };
  $scope.user = UserService;

  Restangular.one('portal/person/attribute?filters={"person_id":"' + $scope.user.id + '"}').customGET().then(function (success) {
    if(success[0].attributes && success[0].attributes.trulioo_verified == true){
      $rootScope.verified = true;
    }
  });

  var base_url = $location.absUrl().replace($location.path(), "") + "/";
  $scope.top_header_protocals = [{
    value: "http://"
  }, {
    value: "https://"
  }, {
    value: "Relative Path"
  }];
  $scope.top_header_link_default_protocal = $scope.top_header_protocals[0];

  // Strip http and https from link
  $scope.remove_link_protocals = function($event) {
    $event.target.value = $event.target.value.replace("https://", "").replace("http://", "");
  };

  $scope.showt = {
    "value": false
  };

  initiateOptions($scope.froalaOptionsCampaigns);

  // initialize campaign
  $scope.invalidThumbnailVideo = false;
  $scope.campaign = CreateCampaignService;
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  $scope.currentPath = $location.path().split("/")[1];
  $scope.countries = $scope.$parent.countries;
  $scope.allCategories = [];
  $scope.categories = $scope.$parent.categories;
  $scope.subcategories = [];
  $scope.campaign_image = "";
  $scope.category_ids = [];
  $scope.sub_category_ids = {ids: []};
  $scope.city = {};
  $scope.user = UserService;
  // Prepare data caching for location filter
  $scope.cities = [];
  $scope.multipleCity = {};
  $scope.campaign.rewards = [];
  $scope.run_mode = true;
  $scope.sub_country_ids = [];
  $scope.runMode = [{
    name: "Time_Based_Campaign",
    id: 1
  }, {
    name: "Continuous_Campaign",
    id: 2
  }];
  $scope.links = [];
  var initialLinks = [];
  $scope.campaignFundingGoal = {
    "value": 0
  };
  $scope.isCampaignRevised = false;
  $scope.in_revision = false;

  Restangular.one('campaign', $routeParams.campaign_id).customGET().then(function(success) {
    $scope.owner = success.managers[0];
  });

  function loadRunMode() {
    if ($scope.public_settings.site_campaign_defaults.toggle && $scope.public_settings.site_campaign_defaults_runMode == 2) {
      $scope.runModeSelected = $scope.public_settings.site_campaign_defaults_runMode;
      $scope.run_mode = false;
    }
    if ($scope.public_settings.site_campaign_defaults.toggle && $scope.public_settings.site_campaign_defaults_runMode == 1) {
      $scope.runModeSelected = $scope.public_settings.site_campaign_defaults_runMode;
      $scope.campaign.runtime_days = 1;
      $scope.run_mode = true;
    }
  }

  // load portal settings
  PortalSettingsService.getSettingsObj().then(function(success) {
    $scope.public_settings = success.public_setting;
    $scope.native_lookup = $scope.public_settings.site_theme_shipping_native_lookup;
    $scope.reward_html_editor = success.public_setting.site_theme_campaign_reward_html_editor;
    $scope.default_country = $scope.public_settings.site_theme_default_shipping_country;
    $scope.isCampaignPercetangeEnabled = $scope.public_settings.site_theme_campaign_percentage_enabled;
    $scope.enableRewardVariation = $scope.public_settings.site_theme_campaign_show_reward_enable_variation;
    $scope.enableRewardTimeLimit = success.public_setting.site_campaign_show_reward_enable_time_limit;
    $scope.isRemoveTopHeaderImg = $scope.public_settings.site_campaign_remove_top_header_image;
    $scope.isRemoveRaiseMode = $scope.public_settings.site_campaign_remove_raise_mode;
    $scope.isRemoveTimePeriod = $scope.public_settings.site_campaign_remove_time_period;
    $scope.isRemoveCampaignLinks = $scope.public_settings.site_campaign_remove_campaign_links;
    $scope.isRemoveCampaignFaq = $scope.public_settings.site_campaign_remove_campaign_faq;
    $scope.isRemoveCampaignBio = $scope.public_settings.site_campaign_enable_campaign_bio;
    $scope.isRemoveCampaignGA = $scope.public_settings.site_campaign_remove_campaign_google_analytics;
    $scope.isStepFundingDelayed = success.public_setting.site_theme_campaign_delayed_funding_setup;
    $scope.direct_transaction = success.public_setting.site_campaign_fee_direct_transaction;
    $scope.contributionEnabled = success.public_setting.site_campaign_contributions;
    $scope.enableCampaignRevisions = success.public_setting.site_campaign_enable_campaign_revisions;
    $scope.isStepRewardDelayed = success.public_setting.site_theme_campaign_delayed_reward_setup;
    $scope.isExplainerTextEnabled = success.public_setting.site_campaign_enable_explainer_text;
    $scope.isHideDaysToGoChecked = success.public_setting.site_campaign_toggle_hide_days_to_go_by_default;
    $scope.showRewardsTab = success.public_setting.site_theme_campaign_show_reward_section;
    $scope.isFieldDisplayStacked = success.public_setting.site_campaign_creation_field_display_stacked;
    $scope.hideCampaignImageField = success.public_setting.site_campaign_creation_hide_campaign_image_field;
    $scope.hideCampaignBlurbField = success.public_setting.site_campaign_creation_hide_campaign_blurb_field;
    $scope.hideCampaignCategoryField = success.public_setting.site_campaign_creation_hide_campaign_category_field;
    $scope.hideCampaignManagerField = success.public_setting.site_campaign_creation_hide_campaign_manager_field;
    $scope.hideCampaignDescriptionField = success.public_setting.site_campaign_creation_hide_campaign_description_field;
    $scope.showCampaignImageField = success.public_setting.site_campaign_creation_show_campaign_image_field;
    $scope.hideStartCampaignPage = success.public_setting.site_campaign_creation_hide_start_page;
    $scope.hideAllCampaignRewardsFields = success.public_setting.site_campaign_creation_hide_campaign_rewards_fields;
    $scope.showCampaignDescription = success.public_setting.site_campaign_creation_show_campaign_description_field;
    $scope.displayPrevButtonHeader = success.public_setting.site_campaign_creation_display_previous_button_on_header;
    $scope.hideStartCampaignPage = success.public_setting.site_campaign_creation_hide_start_page;
    $scope.startCampaignOnCurrentDate = success.public_setting.site_campaign_creation_start_campaign_on_current_date;
    $scope.enableContribButtonPerCampaign = success.public_setting.site_campaign_enable_contribute_button_per_campaign;
    $scope.hideWithdrawButton = success.public_setting.site_campaign_withdraw_hide;

    getCampaignImages();
    getCampaignHeaderImages();

    if (typeof $scope.enableCampaignRevisions == 'undefined' || $scope.enableCampaignRevisions == null) {
      $scope.enableCampaignRevisions = false;
    }

    if (typeof $scope.public_settings.site_campaign_hide_profile == 'undefined' || $scope.public_settings.site_campaign_hide_profile == null) {
      $scope.public_settings.site_campaign_hide_profile = false;
    }
    $scope.showProfile = !$scope.public_settings.site_campaign_hide_profile;
    if (typeof $scope.public_settings.site_campaign_defaults == 'undefined') {
      $scope.public_settings.site_campaign_defaults = {
        hide_fundraise: false,
        fundingGoal: 100000000,
        toggle: false,
        percentage_fee: 10
      };
    }
    if (typeof $scope.public_settings.site_campaign_faq == 'undefined' || $scope.public_settings.site_campaign_faq == null) {
      $scope.public_settings.site_campaign_faq = {
        toggle: false
      };
    }

    $scope.isDisableFaq = $scope.public_settings.site_campaign_faq.toggle;
    $scope.isRemoveFundraise = (!$scope.public_settings.site_campaign_defaults.hide_fundraise || $scope.user.person_type_id == 1);

    if ($scope.public_settings.site_campaign_defaults_runMode) {
      loadRunMode();
    } else {
      $scope.runModeSelected = 1;
    }

    loadCampaignData(false);

    // Allow thumbnail video field DEFAULT
    if (typeof $scope.public_settings.site_campaign_allow_thumbnail_video == "undefined") {
      $scope.public_settings.site_campaign_allow_thumbnail_video = true;
    }
  });
  $(document).ready(function() {
    // setTimeout(function() {
    //   $scope.textlabel = $('#lbaelid').text();
    //   $scope.label = $scope.textlabel.charAt(0);
    //   $('#lbaelid').text($scope.label);
    // }, 500);
  });
  // if campaign id exists in route, request data and prefill form
  if ($routeParams.campaign_id) {
    var campaign_id = $routeParams.campaign_id;
  }
  //User shipping details
  function reformatReward(rewards) {
    $scope.rewards_data = [];
    if (rewards.length > 0) {
      var count = 0;
      angular.forEach(rewards, function(val) {
        var tempAttributes = {};
        if (val.attributes) {
          tempAttributes = val.attributes;
        }

        var rewardsModel = {
          amount: val.amount,
          name: val.name,
          description: val.description,
          item_limit: val.item_limit,
          estimated_delivery_time: val.estimated_delivery_time,
          estimated_delivery_time_convert: convertDate(val.estimated_delivery_time),
          shipping_option_id: '',
          shipping: [],
          pledge_level_id: val.pledge_level_id,
          attributes: tempAttributes,
          expires: val.expires,
          priority: val.priority,
          coupon_id: val.coupon_id
        };
        
        var cID = [];
        $scope.rewards_data.push(rewardsModel);

        //fetch pledge data for each reward and add into rewards_data
        Restangular.one('campaign', campaign_id).one('pledge-level').customGET().then(
          function(success) {
            angular.forEach(success, function(value) {
              if (value.estimated_delivery_time) {
                //convert date
                value.estimated_delivery_time_convert = convertDate(value.estimated_delivery_time);
              }
              if (value.shipping === null) {
                value.shipping = [];
              }
              var index = $scope.rewards_data.findIndex(function (r) { return r.pledge_level_id == value.pledge_level_id; });
              $scope.rewards_data[index].selectedCoupons = value.coupon;
            });
          });
  

        if (val.shipping) {
          if (val.shipping.length > 0) {
            val.shipping = checkNative(val.shipping);
            angular.forEach(val.shipping, function(value) {
              if (value.shipping_option_type_id == 3) {
                var data = {
                  id: value.country_id,
                  sub_cont: []
                };
                getFAQ
                if (cID.length > 0) {
                  var insert = true;
                  angular.forEach(cID, function(v) {
                    if (v.id == data.id) {
                      insert = false;
                    }
                  });
                  if (insert) {
                    cID.push(data);
                  }
                } else {
                  cID.push(data);
                }
              }
            });
            angular.forEach(val.shipping, function(value) {
              var shippingOption = {
                cost: '',
                name: '',
                description: '',
                shipping_option_type_id: '',
                country_id: '',
                subcountry_id: '',
                sub_countries: [],
                worldwideOption: '',
                shipping_option_id: value.shipping_option_id,
                id: value.id
              };
              // if subcountry specific
              if (value.shipping_option_type_id == 3) {
                $scope.show_sub = true;
                var index = 0;
                var shipOption = {
                  cost: '',
                  name: '',
                  description: '',
                  shipping_option_type_id: 3,
                  country_id: '',
                  subcountry_id: '',
                  shipping_option_id: value.shipping_option_id,
                  id: value.id
                };
                angular.forEach(cID, function(subVal) {
                  if (value.country_id == subVal.id) {
                    shipOption = {
                      cost: value.cost,
                      name: value.name,
                      description: '',
                      shipping_option_type_id: value.shipping_option_type_id,
                      country_id: value.country_id,
                      subcountry_id: value.subcountry_id,
                      shipping_option_id: value.shipping_option_id,
                      id: value.id
                    };
                    cID[index].sub_cont.push(shipOption);
                  } else {
                    index++;
                  }
                });
              } else {
                shippingOption = {
                  cost: value.cost,
                  name: '',
                  description: '',
                  shipping_option_type_id: value.shipping_option_type_id,
                  country_id: value.country_id,
                  subcountry_id: '',
                  sub_countries: [],
                  shipping_option_id: value.shipping_option_id,
                  id: value.id
                };
                $scope.rewards_data[count].shipping.push(shippingOption);
              }
            });
            angular.forEach(cID, function(Val) {
              shippingOption = {
                cost: '',
                name: '',
                description: '',
                shipping_option_type_id: 3,
                country_id: Val.id,
                subcountry_id: '',
                sub_countries: Val.sub_cont,
                shipping_option_id: Val.shipping_option_id,
                id: Val.id

              };
              $scope.rewards_data[count].shipping.push(shippingOption);
            });
          }
        }
        count++;
      });
    }
    // Get countries
    $scope.getCountries();

    reward_priority = $scope.rewards_data.length;
  }

  function checkNative(addressData) {
    var newAddress = [];
    angular.forEach(addressData, function(address) {
      if ($scope.native_lookup) {
        if (address.country_native_name) {
          address.country = address.country_native_name;
        }
        if (address.subcountry_native_name) {
          address.subcountry = address.subcountry_native_name;
          address.name = address.subcountry;
        }
      }
      newAddress.push(address);
    });
    return newAddress;
  }

  Restangular.one('portal/setting').customGET().then(function(success) {
    angular.forEach(success, function(value) {
      if (value.name == 'site_campaign_raise_modes' && value.setting_type_id == 3) {
        $scope.mode_allowed = value.value;
        // generate mode dropdown options based on the allowed modes
        Restangular.one('campaign/raise-mode').customGET().then(function(modes) {
          $scope.fundingMode = modes;
          angular.forEach($scope.fundingMode, function(mode) {

            $translate(mode.description).then(function(value) {
              mode.description = value;
            });

            // compare with the mode allowed
            if ($scope.mode_allowed.allowed.indexOf(mode.id) > -1) {
              mode.allowed = true;
            }
          });
          $timeout(function() {
            $('.ui.dropdown').dropdown();
          }, 200);
        });
      }
      if (value.name == 'site_campaign_fee_percentage' && value.setting_type_id == 3) {
        $scope.percentage = value.value; // get the campaign fee percentage
      }
      if (value.name == 'site_theme_campaign_show_reward_section') {
        $scope.show_reward = value.value;
      }
      if (value.setting == null) {
        $scope.setting = {
          top_header_link: ""
        };
      }
      if (value.name == 'site_payment_gateway') {
        $scope.payment_gateway = value.value;
        if ($scope.payment_gateway == 2) {
          Restangular.one('account/widgetmakr/widget').customGET().then(function(success) {
            if (success.length > 0) {
              $scope.widget_accountID = success[0].widgetmakr_account_id;

            }
          });
        }
      }
      if (value.name == 'site_default_widget_makr_id') {
        if (value.value) {
          $scope.widget_default_accountID = value.value;

        }
      }
    });
    Restangular.one('campaign', campaign_id).one('ever_published').customGET().then(function(success) {

      $scope.fundingExist = $scope.direct_transaction || !$scope.contributionEnabled || ($scope.isStepFundingDelayed && !success.ever_published);
      $scope.master_show_reward = false;
      if ($scope.showRewardsTab) {
        $scope.master_show_reward = true;
      }
      if ($scope.isStepRewardDelayed && $scope.campaign.entry_status_id != 2) {
        $scope.master_show_reward = false;
      }
      if ($scope.currentPath == 'getstarted') {
        $scope.nextStepUrl = "campaign-setup/" + $routeParams.campaign_id;
        // Hide back button on this page
        $scope.firstPage = true;
      } else if ($scope.currentPath == 'campaign-setup') {
        $scope.backUrl = "getstarted/" + $routeParams.campaign_id;

        if ($scope.master_show_reward) {
          if (($scope.hideAllCampaignRewardsFields || typeof $scope.hideAllCampaignRewardsFields !== 'undefined') && ($scope.showCampaignDescription || typeof $scope.showCampaignDescription !== 'undefined')) {
            $scope.thirdStepPath = 'story';
          } else {
            $scope.thirdStepPath = 'rewards';
          }
          $scope.nextStepUrl = $scope.thirdStepPath + "/" + $routeParams.campaign_id;
        } else if ($scope.showProfile) {
          $scope.nextStepUrl = "profile-setup/" + $routeParams.campaign_id;
        } else if (!$scope.fundingExist) {
          $scope.nextStepUrl = "complete-funding/" + $routeParams.campaign_id;
        } else if ($scope.public_settings.site_enable_advanced_widget) {
          $scope.nextStepUrl = "campaign-widget/" + $routeParams.campaign_id;
        } else {
          $scope.nextStepUrl = "campaign-preview/" + $routeParams.campaign_id;
        }

      } else if ($scope.currentPath == 'rewards' || $scope.currentPath == 'story') {
        if ($scope.showProfile) {
          $scope.nextStepUrl = "profile-setup/" + $routeParams.campaign_id;
        } else if (!$scope.fundingExist) {
          $scope.nextStepUrl = "complete-funding/" + $routeParams.campaign_id;
        } else if ($scope.public_settings.site_enable_advanced_widget) {
          $scope.nextStepUrl = "campaign-widget/" + $routeParams.campaign_id;
        } else {
          $scope.nextStepUrl = "campaign-preview/" + $routeParams.campaign_id;
          $scope.backUrl = "campaign-setup/" + $routeParams.campaign_id;
        }
      }
      if ($routeParams.revision_id) {
        $scope.nextStepUrl += '?revision_id=' + $routeParams.revision_id;
        $scope.backUrl += '?revision_id=' + $routeParams.revision_id;
        if ($scope.currentPath == 'campaign-setup') {
          $scope.nextStepUrl = 'campaign-preview/' + $routeParams.campaign_id + '?revision_id=' + $routeParams.revision_id;
          $scope.backUrl = 'getstarted/' + $routeParams.campaign_id + '?revision_id=' + $routeParams.revision_id;
        }
      }
      $scope.$emit("loading_finished");
    });
  });

  function getFAQ() {
    // prefill faqs
    Restangular.one('campaign', campaign_id).one('faq').getList().then(function(success) {
      if (!success.length) {
        $scope.campaign.faq = [];
        $scope.addFAQ($scope.campaign.faq);
      } else {
        $scope.campaign.faq = success;
      }
      angular.forEach($scope.campaign.faq, function(value, key, obj) {
        if (!value.faq_pairs) {
          value.faq_pairs = [];
          $scope.addFAQPair(value.faq_pairs);
        }
      });
    });
  }

  function getRevisionFAQ() {
    // prefill faqs
    Restangular.one('campaign', campaign_id).one('faq-revision').getList().then(function(success) {
      if (!success.length) {
        $scope.no_faq_revisions = true;
        getFAQ();
      } else {
        $scope.campaign.faq = success;
        angular.forEach($scope.campaign.faq, function(value, key, obj) {
          if (!value.faq_pairs) {
            value.faq_pairs = [];
            $scope.addFAQPair(value.faq_pairs);
          }
        });
      }
    });
  }

  function loadCampaignData(inSaveData) {
    CreateCampaignService.load($routeParams.campaign_id).then(function(success) {
      // Emit event for hiding loader.
      $scope.$emit("loading_finished");

      $scope.campaign = success.plain();
      loadRunMode();

      if (!$scope.campaignFundingGoal.value && $scope.campaign.hasOwnProperty("funding_goal")) {
        if ($scope.public_settings.site_campaign_defaults.toggle && ($scope.campaign.funding_goal == 0)) {
          $scope.campaign.funding_goal = $scope.public_settings.site_campaign_defaults.fundingGoal;
          $scope.campaignFundingGoal.value = $scope.campaign.funding_goal;
        } else {
          $scope.campaignFundingGoal.value = $scope.campaign.funding_goal;
        }
      }

      setCampaignThumbnailVideo();
      //Replace text with actual campaign fee
      $translate('get_started_fundingdetails1', {
        campaign_fee: $scope.percentage + "%"
      }).then(function(value) {
        $scope.get_started_fundingdetails1 = value;
      });

      //Replace htmlencode apostrophe with apostrophe - For Facebook Sharing
      //campaign-basics-form
      if ($scope.campaign.blurb) {
        $scope.campaign.blurb = $scope.campaign.blurb.replace(/&#39;/g, "'");
      }

      /*  //Get Campaign Manager Name
        if(!$scope.campaign.settings){
           $scope.campaign.settings = {};
        }
        $scope.campaign.settings.campaign_manager_name = $scope.campaign.managers[0].first_name +" "+$scope.campaign.managers[0].last_name; */

      $scope.campaign.timezoneText = moment().tz($scope.campaign.timezone).zoneAbbr();
      CampaignSettingsService.setCampaignId($routeParams.campaign_id);
      CampaignSettingsService.processSettings(success.settings);
      $scope.campaign.settings = CampaignSettingsService.getSettings();
      if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2) {
        Restangular.one("campaign", campaign_id).customGET("setting-revision/bio_enable").then(function(success) {
          if (success.value) {
            $scope.settingRevisions = true;
            $scope.campaign.settings.bio_enable = success.value;
          }
        });
      }
      if (!$scope.campaign.settings.campaign_fee_percentage) {
        if ($scope.public_settings.site_theme_campaign_percentage_enabled && $scope.public_settings.site_campaign_defaults.toggle) {
          $scope.campaign.settings.campaign_fee_percentage = $scope.public_settings.site_campaign_defaults.percentage_fee;
        }
      }


      $scope.progressHide = false;
      if ($scope.public_settings.site_campaign_progress_bar_hide) {
        $scope.progressHide = true;
      } else {
        $scope.progressHide = false;
      }
      if (typeof $scope.campaign.settings.progress_bar_hide !== 'undefined') {
        $scope.progressHide = $scope.campaign.settings.progress_bar_hide;
      } else {
        $scope.campaign.settings.progress_bar_hide = $scope.public_settings.site_campaign_progress_bar_hide;
      }

      // Get user attributes
      if ($scope.public_settings.site_campaign_enable_organization_name) {
        Restangular.one('portal/person/attribute?filters={"person_id":"' + $scope.campaign.managers[0].id + '"}').customGET().then(function(success) {
          $scope.organization_name.value = success[0].attributes['organization_name'];
          $scope.organization_name.ein = success[0].attributes['ein'];
        });
      }

      if ((!$scope.hideCampaignManagerField || $scope.hideCampaignManagerField !== 'undefined')) {
        $scope.campaign.settings.campaign_manager_name = $scope.campaign.managers[0].first_name + " " + $scope.campaign.managers[0].last_name;
      }
      if ($scope.campaign.settings !== undefined) {
        if ("top_header_link" in $scope.campaign.settings) {
          for (var i in $scope.top_header_protocals) {
            var indexOf = $scope.campaign.settings.top_header_link.indexOf($scope.top_header_protocals[i].value);
            if (indexOf > -1) {
              $scope.top_header_link = $scope.campaign.settings.top_header_link.replace($scope.top_header_protocals[i].value, "");
              $scope.top_header_link_default_protocal = $scope.top_header_protocals[i];
              $scope.top_header_protocals[i].default = true;
              break;
            } else {
              if ($scope.campaign.settings.top_header_link != "undefined") {
                $scope.top_header_link = $scope.campaign.settings.top_header_link;
                $scope.top_header_link_default_protocal = $scope.top_header_protocals[2];
              }
            }
          }
        }
      }

      if (!$scope.campaign.settings.hasOwnProperty("enable_rewards_pagination")) {
        $scope.campaign.settings.enable_rewards_pagination = true;
      }

      if (!$scope.campaign.settings.hasOwnProperty("min_contribution")) {
        $scope.campaign.settings.min_contribution = null;
      }

      if (!$scope.campaign.settings.hasOwnProperty("max_contribution")) {
        $scope.campaign.settings.max_contribution = null;
      }


      if ($scope.startCampaignOnCurrentDate) {
        var currentDate = new Date();
        $scope.campaign.starts_date_time = currentDate;
      } else {
        $scope.campaign.starts_date_time = reformatDate($scope.campaign.starts_date_time);
      }
      $scope.campaign.ends_date_time = reformatDate($scope.campaign.ends_date_time);

      $scope.rewards_data = [];
      $scope.getCountries();
      if ($scope.campaign.pledges) {
        //check pledges for the shipping data
        reformatReward($scope.campaign.pledges);
      }
      $translate(['Time_Based_Campaign', 'Continuous_Campaign']).then(function(value) {
        if ($scope.campaign.starts && $scope.campaign.ends == null) {
          $('#default-run-mode').text(value.Continuous_Campaign);
          $scope.run_mode = false;
          $scope.runModeSelected = 2;
        }
        if ($scope.public_settings.site_campaign_continuous_run_mode) {
          if ($scope.campaign.ever_published || $scope.campaign.entry_status_id == 10) {
            if ($scope.public_settings.site_campaign_defaults_runMode == 2) {
              $('#default-run-mode').text(value.Continuous_Campaign);
              $scope.run_mode = false;
            }
            if ($scope.campaign.ends_date_time == null) {
              $('#default-run-mode').text(value.Continuous_Campaign);
              $scope.run_mode = false;
            } else {
              $('#default-run-mode').text(value.Time_Based_Campaign);
              $scope.run_mode = true;
              $scope.runModeSelected = 1;
            }
          }
        }
        // Set campaign start and end dates for new campaigns
        if ($scope.public_settings.site_campaign_fixed_campaign_duration_enable || ($scope.public_settings.site_campaign_defaults_runMode == 1 && $scope.public_settings.site_campaign_defaults.toggle)) {
          if ($scope.public_settings.site_campaign_defaults.toggle && !$scope.campaign.starts_date_time && !$scope.campaign.ends_date_time) {
            $scope.campaign.starts_date_time = $scope.public_settings.site_campaign_fixed_campaign_duration_start;
            $scope.campaign.ends_date_time = $scope.public_settings.site_campaign_fixed_campaign_duration_end;
          }
          if (!$scope.campaign.starts_date_time) {
            $scope.campaign.starts_date_time = $scope.public_settings.site_campaign_fixed_campaign_duration_start;
          }
          if (!$scope.campaign.ends_date_time && $scope.run_mode) {
            $scope.campaign.ends_date_time = $scope.public_settings.site_campaign_fixed_campaign_duration_end;
          }
          $scope.campaign.runtime_days = Math.round((fix_date($scope.campaign.ends_date_time) - fix_date($scope.campaign.starts_date_time)) / 86400000);
        }
        if ($scope.public_settings.site_campaign_defaults_runMode == 2 && $scope.public_settings.site_campaign_defaults.toggle) {
          if (!$scope.campaign.starts_date_time && $scope.public_settings.site_campaign_fixed_campaign_duration_enable) {
            $scope.campaign.starts_date_time = $scope.public_settings.site_campaign_fixed_campaign_duration_start;
          } else if (!$scope.campaign.starts_date_time) {
            var date = new Date();
            var newDate = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00';
            $scope.campaign.starts_date_time = newDate;
          }
        }
      });
      if ($scope.campaign.maximum_allowed_funds_raised) {
        $scope.thresholdvalue.value = $scope.campaign.maximum_allowed_funds_raised;
        $('#maxthreshold').checkbox('check');
      }

      if($scope.public_settings.hasOwnProperty('site_campaign_max_threshold_hide') && $scope.public_settings.site_campaign_max_threshold_hide) {
        $scope.campaign.maximum_allowed_funds_raised = 0;
        $scope.thresholdvalue.value = 0;
        $('#maxthreshold').checkbox('uncheck');
        
      }

      if (success.uri_paths.length) {
        $scope.campaign.uri_path = success.uri_paths[0].path;
      }
      $scope.old_path = success.uri_paths[0].path;
      if ($scope.campaign.funding_goal == 0) {
        $scope.campaign.funding_goal = "";
      }
      Restangular.one('campaign', campaign_id).one('stripe-account').customGET().then(function(stripe) {
        if (stripe.length) {
          $scope.campaign.stripe_account_id = stripe[0].id;
        }
        if ($scope.public_settings.hasOwnProperty('site_campaign_fee_direct_transaction') && $scope.public_settings.site_campaign_fee_direct_transaction) {
          $scope.campaign.stripe_account_id = null;
        }
      });
      // check campaign links
      // add empty array if link is null
      if (!$scope.campaign.links) {
        $scope.campaign.links = [];
        $scope.addLink($scope.campaign.links);
      } else {
        //pre-load video link
        $scope.links = [];
        angular.forEach($scope.campaign.links, function(value) {

          if (value.region_id == 1 && value.resource_content_type_id == 1 && value.resource_type == "link") {
            $scope.campaign.video = value;
          }
          if (value.region_id == $scope.RESOURCE_REGIONS.campaign.thumbnail_video && value.resource_type == "link") {
            $scope.campaignThumbnailVideo = value;
          }
          if (value.resource_content_type == "generic") {

            if (value.uri.substring(0, 7) == "http://") {
              value.uri = value.uri.replace("http://", "");
              value.default_protocol = "http://";
            } else if (value.uri.substring(0, 8) == "https://") {
              value.uri = value.uri.replace("https://", "");
              value.default_protocol = "https://";
            } else {
              // Relative
              value.default_protocol = "Relative Path";
            }
            $scope.links.push(value);
          }
        });
      }
      $scope.category_ids = [];
      // prefill categories
      if ($scope.campaign.categories) {
        Restangular.one("portal/category").customGET().then(function(success) {
          if (success && success.length) {
            var categoryTemp = [];
            success.forEach(function(value, index) {
              if (value.parent_category_id == null) {
                categoryTemp.push(value);
              }
            });
            $scope.categories = angular.copy(categoryTemp);
          }
          preFillCategories($scope.campaign.categories);
        });
      } else {
        // if category is null, initiate
        $scope.campaign.categories = [];
      }

      // prefill campaign location
      if ($scope.campaign.cities) {
        angular.forEach($scope.campaign.cities, function(value, index) {
          checkCitiesNative(value);
        });
        $scope.cities = $scope.campaign.cities;
        $scope.multipleCity.selected = $scope.campaign.cities;
      }
      if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2) {
        getRevisionFAQ();
      } else {
        getFAQ();
      }

      $timeout(function() {
        $translate(['get_started_funding_startdate_placeholder', 'get_started_funding_enddate_note']).then(function(value) {
          $scope.get_started_funding_startdate_placeholder = value.get_started_funding_startdate_placeholder;
          $scope.get_started_funding_enddate_note = value.get_started_funding_enddate_note;
        });
      }, 100);

      Restangular.one('campaign', campaign_id).one('pledge-level').customGET().then(
        function(success) {
          $scope.campaign.rewards = [];
          angular.forEach(success, function(value) {
            if (value.estimated_delivery_time) {
              //convert date
              value.estimated_delivery_time_convert = convertDate(value.estimated_delivery_time);
            }
            if (value.shipping === null) {
              value.shipping = [];
            }
            $scope.campaign.rewards.push(value);
          });
        });

      // load notes
      getNotes();
      getCurrency();

      if ($scope.public_settings.campaign_content_suggestion_enabled && $scope.public_settings.campaign_content_suggestion) {
        var suggestionEndpointUrl = $scope.public_settings.campaign_content_suggestion;
        if (suggestionEndpointUrl.indexOf("{email}") > -1) {
          suggestionEndpointUrl = suggestionEndpointUrl.replace("{email}", $scope.user.email);
        }
        $http({
          method: 'GET',
          url: suggestionEndpointUrl
        }).then(function(success) {
          var resData = success.data;
          if (resData.hasOwnProperty("suggestions")) {
            $scope.blurbSuggestions = resData.suggestions.blurb;
            $scope.descriptionSuggestions = resData.suggestions.description;
            $scope.faqSuggestions = resData.suggestions.faq;
          } else {
            console.error("Content suggestion not available");
          }
        }, function(error) {
          console.error(error);
        });
      }

      //Regular User
      if (!inSaveData && $scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 2) {
        createOrUpdateRevision();
      }
      //Admin
      if (!inSaveData && $scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 1) {
        adminUpdateRevision();
      }
      if ($routeParams.revision_id) {
        $scope.in_revision = true;
      }

      // Check if the explainer text toggle is enabled (admins only)
      if ($scope.isExplainerTextEnabled && $scope.user.person_type_id == 1) {
        var adminOnlyTranslation = $translate.instant(['admin_only_explainer_text_title_default', 'admin_only_explainer_text_msg_default']);
        if (typeof $scope.campaign.settings.explainer_text == 'undefined' || $scope.campaign.settings.explainer_text == null) {
          $scope.campaign.settings.explainer_text = {
            title: adminOnlyTranslation.admin_only_explainer_text_title_default,
            message: adminOnlyTranslation.admin_only_explainer_text_msg_default,
            close: false
          }
        }
      }

      // if ($scope.hideWithdrawButton && $scope.user.person_type_id == 1){
      //   $scope.campaign.settings.admin_enable_withdraw_button
      // }
      if ($scope.isHideDaysToGoChecked) {
        $scope.campaign.settings.days_to_go_hide = true;
      }

      if ($scope.hideStartCampaignPage && typeof $scope.hideStartCampaignPage !== 'undefined') {
        if ($scope.campaign.name === 'unnamed_campaign') {
          $scope.campaign.name = '';
        }
      }
      if ($scope.enableContribButtonPerCampaign !== 'undefined' || $scope.enableContribButtonPerCampaign) {
        $scope.campaign.settings.hide_contribute_button_per_campaign;
      }
    });
  }
  //Admin GET Revisions
  function adminUpdateRevision() {
    if ($routeParams.revision_id) {
      $scope.isCampaignRevised = true;
      Restangular.one('campaign', $scope.campaign.entry_id).one('revision', $routeParams.revision_id).customGET().then(function(success) {
        $scope.revision = success[0];
      });
    }

  }
  //Regular User GET Revisions
  function createOrUpdateRevision() {

    if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2) {
      Restangular.one('campaign', $scope.campaign.entry_id).one('revision').customGET().then(function(success) {
        try {
          $scope.revision = success[0];
          $location.search('revision_id', success[0].entry_revision_id);
        } catch (error) {
          Restangular.one('campaign/' + $scope.campaign.entry_id + '/revision').customPOST($scope.campaign).then(function(new_success) {
            $scope.revision = new_success[0];
            $scope.revision.blurb = $scope.campaign.blurb;
            $scope.revision.name = $scope.campaign.name;
            $scope.revision.description = $scope.campaign.description;
            $location.search('revision_id', new_success[0].entry_revision_id);
          });
        }
      });
    }
  }

  /**
   * Pre filled the campaign categories and sub-categories
   * 
   * @param {any} campaignCategories selected categories for the campaign
   */
  function preFillCategories(campaignCategories) {
    if (campaignCategories) {
      $scope.category_ids = [];
      $scope.sub_category_ids = { ids: []};
      var categoryIdsArray = [],
        subCategoryIdsArray = [];
      var campaignCategoriesCopy = angular.copy(campaignCategories);
      angular.forEach(campaignCategoriesCopy, function(value) {
        if (value.parent_category_id != null) {
          subCategoryIdsArray.push(value.category_id);
        } else {
          categoryIdsArray.push(value.category_id);
        }
      });
      $scope.category_ids = angular.copy(categoryIdsArray);
      $scope.sub_category_ids.ids = angular.copy(subCategoryIdsArray);
      $timeout(function() {
        $("#category-field select").val($scope.category_ids).trigger("change")
      }, 0);
    }
  }

  $scope.setBlurbFromSuggestion = function(blurbSuggestion) {
    $timeout(function() {
      $("textarea[name='blurb']").val(blurbSuggestion.content);
    });
  }

  $scope.setDescriptionFromSuggestion = function(descriptionSuggestion) {
    $scope.froalaOptionsCampaigns.froalaEditor('html.set', descriptionSuggestion.content);
  }

  $scope.setFAQFromSuggestion = function(faqSuggestion) {
    // $scope.campaign.faq = [];
    if ($scope.campaign.faq && $scope.campaign.faq.length) {
      $scope.campaign.faq[0].name = faqSuggestion.name;
      $scope.campaign.faq[0].description = faqSuggestion.title;
      if (!$scope.campaign.faq[0].faq_pairs) {
        $scope.campaign.faq[0].faq_pairs = [];
      }
    } else {
      $scope.campaign.faq = [];
      $scope.campaign.faq.push({
        "name": faqSuggestion.name,
        "description": faqSuggestion.title,
        "faq_pairs": []
      });
    }

    for (var faqIndex in faqSuggestion.content) {
      if (faqIndex < $scope.campaign.faq[0].faq_pairs.length) {
        $scope.campaign.faq[0].faq_pairs[faqIndex].question = faqSuggestion.content[faqIndex].question;
        $scope.campaign.faq[0].faq_pairs[faqIndex].answer = faqSuggestion.content[faqIndex].answer;
      } else {
        $scope.campaign.faq[0].faq_pairs.push({
          question: faqSuggestion.content[faqIndex].question,
          answer: faqSuggestion.content[faqIndex].answer,
          display_priority: faqSuggestion.content.length + 1
        });
      }
    }
  }

  $scope.dropdown = {} || $scope.dropdown;

  // Checking if there is a need to change the full city name to be displayed in native language
  function checkCitiesNative(cityObj) {
    var cityFull = "";
    if ($scope.native_lookup) {
      cityObj.country = cityObj.country_native_name != null ? cityObj.country_native_name : cityObj.country;
      cityObj.subcountry = cityObj.subcountry_native_name != null ? cityObj.subcountry_native_name : cityObj.subcountry;
      cityObj.city = cityObj.city_native_name != null ? cityObj.city_native_name : cityObj.city;
      cityFull = cityObj.country + ", " + cityObj.subcountry + ", " + cityObj.city;
      cityObj.city_full = cityFull;
      cityObj.name = cityFull;
    }
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

  // hard coded shipping options
  $scope.dropdown.shipping = [{
    id: "1",
    value: "campaign_reward_worldwide_shipping"
  }, {
    id: "2",
    value: "campaign_reward_countryspecific_shipping"

  }, {
    id: "3",
    value: "campaign_reward_subcountryspecific_shipping"
  }];

  $scope.setRunMode = function(mode) {
    $scope.runModeSelected = mode.id;
    if (mode.id == 2) {
      $scope.run_mode = false;
    } else {
      $scope.campaign.runtime_days = 1;
      $scope.run_mode = true;
    }
  }

  function getCampaignImages() {
    if ($scope.enableCampaignRevisions && $routeParams.revision_id) {
      Restangular.one('campaign', campaign_id).one('resource-revision/file/').customGET().then(function(success) {
        hasImage = false;
        if (success.length) {
          $scope.campaignImages = [];
          for (var i = 0; i < success.length; i++) {
            if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.thumbnail) {
              $scope.campaignImages.push(success[i]);
              hasImage = true;
            }
          }
        }
        if (!hasImage) {
          Restangular.one('campaign', campaign_id).one('resource/file/').customGET().then(function(success) {
            $scope.campaignImages = [];
            if (success.length) {
              $scope.nonRevisionCampaignImage = true;
              for (var i = 0; i < success.length; i++) {
                if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.thumbnail) {
                  $scope.campaignImages.push(success[i]);
                }
              }
            }
          }, function(fail) {
            $scope.campaignImages = [];
          });
        }
      }, function(fail) {
        $scope.campaignImages = [];
      });
    } else {
      Restangular.one('campaign', campaign_id).one('resource/file/').customGET().then(function(success) {
        $scope.campaignImages = [];
        if (success.length) {
          for (var i = 0; i < success.length; i++) {
            if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.thumbnail) {
              $scope.campaignImages.push(success[i]);
            }
          }
        }
      }, function(fail) {
        $scope.campaignImages = [];
      });
    }
  }


  $scope.uploadCampaignThumnail = function(files) {
    // if(files.type)
    if (files.length) {
      if ($scope.allowedImage(files[0].type)) {
        var endpoint = 'campaign/' + campaign_id + '/resource/file/';
        if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 2) {
          endpoint = 'campaign/' + campaign_id + '/resource-revision/file/';
        } else if ($scope.enableCampaignRevisions && $routeParams.revision_id && $scope.campaign.entry_status_id == 2 && $scope.campaignImages[0].entry_file_revision_id && $scope.user.person_type_id == 1) {
          endpoint = 'campaign/' + campaign_id + '/resource-revision/file/';
        }
        var params = {
          resource_content_type: 'image',
          region_id: $scope.RESOURCE_REGIONS.campaign.thumbnail
        };
        var $picNode = $('.campaignBasics');
        if ($scope.campaignImages != undefined && $scope.campaignImages.length == 0 || $scope.nonRevisionCampaignImage) {
          $scope.nonRevisionCampaignImage = false;
          FileUploadService.upload(endpoint, files, params, $picNode).then(function(success) {
            if (success.length != 0) {
              getCampaignImages();
            }
          });
        } else if ($scope.campaignImages != undefined && $scope.campaignImages.length > 0) {
          FileUploadService.modify(endpoint, files, params, $scope.campaignImages[0].id, $picNode).then(function(success) {
            if (success.length != 0) {
              getCampaignImages();
            }
          });
        }
      } else {
        //Show modal
        $('.wrong-filetype').modal('show');
      }
    }
  }

  $scope.allowedImage = function(file_type) {
    var allowed_type = ['image/vnd.microsoft.icon', 'image/x-icon', 'image/png', 'image/pjpeg', 'image/jpeg', 'image/gif'];
    if (allowed_type.indexOf(file_type) > -1) {
      return true;
    } else {
      return false;
    }
  }

  $scope.deleteCampaignThumnail = function(files) {
    if (files && files.length) {
      var file = files.pop();
      var endpoint = 'resource/file';
      if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2) {
        endpoint = 'resource-revision/file';
      }
      Restangular.one('campaign', campaign_id).one(endpoint).customDELETE(file.id).then(function(success) {
        getCampaignImages();
      });
      $('.imagePlace .dimmer').dimmer('hide');
      $('.ui.progress.upload-bar').show();
      $('.ui.loader.download-loader').hide();
    }
  };

  // Get campaign top banner image
  var getCampaignHeaderImages = function() {
    if ($scope.enableCampaignRevisions && $routeParams.revision_id) {
      Restangular.one('campaign', campaign_id).one('resource-revision/file/').customGET().then(function(success) {
        var hasHeader = false;
        if (success.length) {
          $scope.campaignHeaderImages = [];
          for (var i = 0; i < success.length; i++) {
            if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.top_header) {
              $scope.campaignHeaderImages.push(success[i]);
              hasHeader = true;
            }
          }
        }
        if (!hasHeader) {
          Restangular.one('campaign', campaign_id).one('resource/file/').customGET().then(function(success) {
            $scope.campaignHeaderImages = [];
            if (success.length) {
              $scope.nonRevisionCampaignHeaderImage = true;
              for (var i = 0; i < success.length; i++) {
                if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.top_header) {
                  $scope.campaignHeaderImages.push(success[i]);
                }
              }
            }
          });
        }
      });
    } else {
      Restangular.one('campaign', campaign_id).one('resource/file/').customGET().then(function(success) {
        $scope.campaignHeaderImages = [];
        if (success.length) {
          for (var i = 0; i < success.length; i++) {
            if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.top_header) {
              $scope.campaignHeaderImages.push(success[i]);
            }
          }
        }
      });
    }
  }

  // Upload campaign top banner image
  $scope.uploadCampaignHeaderImage = function(files) {
    if (files.length) {
      if ($scope.allowedImage(files[0].type)) {
        var endpoint = 'campaign/' + campaign_id + '/resource/file/';
        if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 2) {
          endpoint = 'campaign/' + campaign_id + '/resource-revision/file/';
        } else if ($scope.enableCampaignRevisions && $routeParams.revision_id && $scope.campaign.entry_status_id == 2 && $scope.campaignHeaderImages[0].entry_file_revision_id && $scope.user.person_type_id == 1) {
          endpoint = 'campaign/' + campaign_id + '/resource-revision/file/';
        }
        var params = {
          resource_content_type: 'image',
          region_id: $scope.RESOURCE_REGIONS.campaign.top_header
        };
        var $picNode = $('.campaignHeaderImage');
        if ($scope.campaignHeaderImages.length == 0 || $scope.nonRevisionCampaignHeaderImage) {
          $scope.nonRevisionCampaignHeaderImage = false;
          FileUploadService.upload(endpoint, files, params, $picNode).then(function(success) {
            if (success.length != 0) {
              getCampaignHeaderImages();
            }
          });
        } else if ($scope.campaignHeaderImages.length > 0) {
          FileUploadService.modify(endpoint, files, params, $scope.campaignHeaderImages[0].id, $picNode).then(function(success) {
            if (success.length != 0) {
              getCampaignHeaderImages();
            }
          });
        }
      } else {
        //Show modal
        $('.wrong-filetype').modal('show');
      }
    }
  }
  $scope.deleteCampaignHeaderImage = function(files) {
    if (files && files.length) {
      var file = files.pop();
      var endpoint = 'resource/file';
      if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2) {
        endpoint = 'resource-revision/file';
      }
      Restangular.one('campaign', campaign_id).one(endpoint).customDELETE(file.id).then(function(success) {
        getCampaignHeaderImages();
      });
      $('.imagePlace .dimmer').dimmer('hide');
      $('.ui.progress.upload-bar').show();
      $('.ui.loader.download-loader').hide();
    }
  };

  // Set the thumbnail video link
  function setCampaignThumbnailVideo() {
    var existing_id = false;

    if ($scope.campaignThumbnailVideo == undefined) {
      $scope.campaignThumbnailVideo = {};
    } else if ($scope.campaignThumbnailVideo.id !== undefined) {
      existing_id = $scope.campaignThumbnailVideo.id;
    }
    // Put if we know id exists and the entered fields aren't empty.
    if ($scope.campaignThumbnailVideo.uri !== undefined &&
      $scope.campaignThumbnailVideo.uri != "" &&
      existing_id) {
      var data = {
        entry_id: campaign_id,
        resource_type: 'link',
        resource_content_type: 'video',
        resource: $scope.campaignThumbnailVideo.uri,
        region_id: $scope.RESOURCE_REGIONS.campaign.thumbnail_video,
      }
      Restangular.one('campaign', campaign_id).one('resource/link', existing_id).customPUT(data).then(function(success) {
        $scope.campaignThumbnailVideo = success;
      });
    } else if ($scope.campaignThumbnailVideo.uri !== undefined &&
      $scope.campaignThumbnailVideo.uri != "") {
      // Post if the values aren't empty and we don't have an id.
      var data = {
        entry_id: campaign_id,
        resource_type: 'link',
        resource_content_type: 'video',
        resource: $scope.campaignThumbnailVideo.uri,
        region_id: $scope.RESOURCE_REGIONS.campaign.thumbnail_video,
      }
      Restangular.one('campaign', campaign_id).one('resource/link/').customPOST(data).then(function(success) {
        $scope.campaignThumbnailVideo = success;
      });
    } else if ($scope.campaignThumbnailVideo.uri == "") {
      // Delete if entered value is empty.
      Restangular.one('campaign', campaign_id).one('resource/link/').customDELETE(existing_id).then(function(success) {
        $scope.campaignThumbnailVideo = {};
      });
    }
  }

  $scope.setRaiseMode = function(data) {
    $scope.campaign.raise_mode_id = data.raise_mode_id;
  }

  // click event for State select
  $scope.stateSelected = function(data) {
    $scope.campaign.settings.state_current = $scope.public_settings.site_campaign_state_settings[data];
  }

  $scope.durationTypeSelected = function(typeID) {
    $scope.campaign.duration_type_id = typeID;
  };
  /*delay get campaign_image*/
  $scope.delayGetImage = function(campaignID) {
    $timeout(function() {
      Restangular.one('campaign', campaignID).one('resource/file').customGET().then(function(images) {
        $scope.campaign.files = images;
      });
    }, 800);
  };

  // Checks if a category list already exists, otherwise, send a request to the server for all categories and cache it
  if (angular.isUndefined($scope.categories)) {
    APIPortal.categories({},
      function(success) {
        $scope.categories = $scope.$parent.categories = success;
      }
    );
  }

  $scope.getCountries = function() {
    Geolocator.getCountries().then(function(countries) {
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
      $scope.updateDuplicatedCountryList($scope.countries);
    });
  }

  // Function for checking duplicated country and update the country list with these tags
  // This function gets called when the controller is asking for countries data
  // Or when the data in select2, which is to select country, changes
  $scope.updateDuplicatedCountryList = function(countries) {
    countriesWithShippingStatus = [];
    if (!countries && $scope.countries) {
      countries = $scope.countries;
    }
    // Clean out the shipping status from the countries if they exist
    for (var index in countries) {
      if (countries[index].hasOwnProperty("shipping_status")) {
        delete countries[index].shipping_status;
      }
    }
    // Looping through all rewards
    for (var rewardIndex in $scope.rewards_data) {
      var reward = $scope.rewards_data[rewardIndex];
      // Checking if reward has the property of shipping and its value is not null, also it has property reward_index
      if (reward.hasOwnProperty("shipping") && reward["shipping"] != null) {
        // Looping through all the shipping in this reward
        for (var shipIndex in reward.shipping) {
          var shipping = reward.shipping[shipIndex];
          // Checking if the shipipng object has property country_id and shipping_option_type_id
          if (shipping.hasOwnProperty("country_id") && shipping.hasOwnProperty("shipping_option_type_id")) {
            // Looping through all countries to give appropriate shipping status
            for (var countryIndex in countries) {
              var country = countries[countryIndex];
              var theCountry = null;
              if (country.id == shipping["country_id"]) {
                theCountry = country;
                break;
              }
            }
            var shippingStatus = {
              "reward_index": rewardIndex,
              "shipping_option_type_id": parseInt(shipping["shipping_option_type_id"])
            }
            if (theCountry != null) {
              if (!theCountry.hasOwnProperty("shipping_status")) {
                theCountry.shipping_status = [];
              }
              theCountry.shipping_status.push(shippingStatus);
              countriesWithShippingStatus.push(theCountry);
            }
          }
        }
      }
    }
  }



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
          if ($scope.public_settings.site_campaign_defaults.toggle) {
            $scope.campaign.currency_id = $scope.public_settings.site_campaign_currency_id;
          }
          if (value.currency_id == $scope.campaign.currency_id) {
            $scope.ccode = value.code_iso4217_alpha;
          }
        });
        if (!$scope.campaign.currency_id) {
          $scope.campaign.currency_id = success[0].currency_id;
        }
      }
    });
  }

  //Set the currency exchange
  $scope.$watch('campaign.currency_id', function(value, oldValue) {
    if (value) {
      $('#campaign-currency-field .select-error').remove();
      $('#campaign-currency-field').removeClass('error');
    }
    angular.forEach($scope.currency_options, function(value) {
      if (value.currency_id == $scope.campaign.currency_id) {
        $scope.ccode = value.code_iso4217_alpha;
        return;
      }
    });
  });


  $scope.removeLink = function(link, index) {
    $scope.links.splice(index, 1);
    if (link.id) {
      Restangular.one('campaign', campaign_id).one('resource/link', link.id).customDELETE().then(function(success) {
        refreshLinks();
      });
    }
  }

  $scope.removeFaqPair = function(faq, pair) {
    faq.faq_pairs.splice(faq.faq_pairs.indexOf(pair), 1);
    if (pair.faq_pair_id) {
      Restangular.one('campaign', campaign_id).one('faq', faq.id).one('faq-pair', pair.faq_pair_id).customDELETE().then(function(success) {
        getFAQ();
      });
    }
    if (pair.faq_pair_revision_id) {
      if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2) {
        Restangular.one('campaign', campaign_id).one('faq-revision', faq.id).one('faq-pair-revision', pair.faq_pair_revision_id).customDELETE().then(function(success) {
          getRevisionFAQ();
        });
      }
    }

  }

  $('#pathID').blur(function() {

    Restangular.one('portal/uri-path', $scope.campaign.uri_path).customGET().then(function(success) {
      if (success.result == 1) {
        $translate(['duplicate_path_error']).then(function(value) {
          $scope.duplicatePath_message = value.duplicate_path_error;
        });
        //  $scope.duplicatePath_message='Specified path contains invalid characters (only letters/numbers and hyphen allowed)  or path is currently in use, please choose another path';
        $('#pathID').addClass('has-error');
        $scope.duplicatePath = true;
      } else {
        $('#pathID').removeClass('has-error');
        $scope.duplicatePath = false;
      }
    });

  });

  // Semantic UI form validation rule for checking if the integer is more than 0 then validate
  $timeout(function() {
    $.fn.form.settings.rules.lessThanInteger = function(integer) {
      return (integer > 0) ? true : false;
    }
  });

  $scope.basicsValidation = function() {

    var translation = $translate.instant(['get_started_titlemessage', 'get_started_blurbnote', 'get_started_fundingmoney_input', 'get_started_funding_numberdays_note', 'get_started_funding_mode_note']);

    var basicsFormObj = {
      title: {
        identifier: 'title',
        rules: [{
          type: 'empty',
          prompt: translation.get_started_titlemessage
        }]
      },
      goal: {
        identifier: 'goal',
        rules: [{
            type: 'empty',
            prompt: translation.get_started_fundingmoney_input
          },
          {
            type: 'lessThanInteger[goal]',
            prompt: translation.get_started_fundingmoney_input
          }
        ]
      },
      runtime_days: {
        identifier: 'runtime_days',
        rules: [{
          type: 'empty',
          prompt: translation.get_started_funding_numberdays_note
        }]

      },
    }

    // Add new elements to basics form object
    if (!$scope.hideCampaignBlurbField || typeof $scope.hideCampaignBlurbField == 'undefined') {
      basicsFormObj.blurb = {
        identifier: 'blurb',
        rules: [{
          type: 'empty',
          prompt: translation.get_started_blurbnote
        }]
      };
    }
    if (!$scope.hideCampaignBlurbField || typeof $scope.isRemoveRaiseMode == 'undefined') {
      basicsFormObj.funding_mode = {
        identifier: 'funding_mode',
        rules: [{
          type: 'empty',
          prompt: translation.get_started_funding_mode_note
        }]
      };
    }

    $('.campaign-basics-form.ui.form').form(basicsFormObj, {
      inline: true,
      onSuccess: function() {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function() {
        $scope.valcheck = $scope.valcheck && false;
      }
    }).form('validate form');
  }

  $scope.campaignFeeValidation = function() {
    var translation = $translate.instant(['get_started_campaign_percentage_empty']);
    $('.campaign-basics-form.ui.form').form({
      percentage_fee: {
        identifier: 'percentage_fee',
        rules: [{
          type: 'empty',
          prompt: translation.get_started_campaign_percentage_empty
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

  $scope.campaignMinContributionValidation = function() {
    $.fn.form.settings.rules.min_number = function(value) {
      if (!isNaN($scope.campaign.settings.min_contribution)) {
        return true;
      } else {
        return false;
      }
    }
    var translation = $translate.instant(['get_started_campaign_min_nan']);
    $('.campaign-basics-form.ui.form').form({
      campaign_min: {
        identifier: 'campaign_min',
        rules: [{
          type: 'min_number',
          prompt: translation.get_started_campaign_min_nan
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

  $scope.campaignMaxContributionValidation = function() {
    // $.fn.form.settings.rules.max_number = function (value) {
    //   if (!isNaN($scope.campaign.settings.max_contribution)) {
    //     $scope.valcheck = $scope.valcheck && true;
    //   } else {
    //     $scope.valcheck = $scope.valcheck && false;
    //   }
    // }
    var translation = $translate.instant(['get_started_campaign_max_nan']);
    $('.campaign-basics-form.ui.form').form({
      campaign_max: {
        identifier: 'campaign_max',
        rules: [{
          type: 'integer',
          prompt: translation.get_started_campaign_max_nan
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

  $scope.campaignVideoValidation = function() {
    var translation = $translate.instant(['get_started_campaign_video_empty']);
    $('.campaign-basics-form.ui.form').form({
      campaign_video: {
        identifier: 'campaign_video',
        rules: [{
          type: 'empty',
          prompt: translation.get_started_campaign_video_empty
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

  $scope.campaignContractNumberValidation = function() {
    var translation = $translate.instant(['get_started_campaign_contract_number_empty']);
    $('.campaign-basics-form.ui.form').form({
      contract_number: {
        identifier: 'contract_number',
        rules: [{
          type: 'empty',
          prompt: translation.get_started_campaign_contract_number_empty
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

  // Separate validations for non semantic ui validations
  // Check if it does not have a class
  function inlineBasicsValidations() {
    var translation = $translate.instant(['campaign_basics_currency_prompt', 'campaign_basics_uploadimage_prompt', 'campaign_basics_selectcategory_prompt', 'campaign_basics_description_prompt', 'campaign_basics_selectstartdate_prompt', 'campaign_basics_select_end_date_prompt']);
    if (!$scope.campaign.currency_id) {
      $('.select-error').remove();
      $('#campaign-currency-field').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.campaign_basics_currency_prompt + '</div>');
      $('#campaign-currency-field').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }

    if (!$scope.currency_options) {;
      $('.select-error').remove();
      $('#campaign-currency-field').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }
    if (!$('#featured-img-field .ui.image').hasClass('image-uploaded') && (typeof $scope.hideCampaignImageField == 'undefined' || !$scope.hideCampaignImageField)) {
      $('#featured-img-field .select-error').remove();
      $('#featured-img-field').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.campaign_basics_uploadimage_prompt + '</div>');
      $('#featured-img-field').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }

    if (!$('#category-field .select2-choices li').hasClass('select2-search-choice') && (typeof $scope.hideCampaignCategoryField == 'undefined' || !$scope.hideCampaignCategoryField)) {
      $('#category-field .select-error').remove();
      $('#category-field').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.campaign_basics_selectcategory_prompt + '</div>');
      $('#category-field').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }

    if (!$('#start-date-field .quickdate').hasClass('startdate-selected')) {
      $('#start-date-field .select-error').remove();
      $('#start-date-field').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.campaign_basics_selectstartdate_prompt + '</div>');
      $('#start-date-field').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }

    if (!$('#end-date-field .quickdate').hasClass('enddate-selected') && $scope.run_mode) {
      $('#end-date-field .select-error').remove();
      $('#end-date-field').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.campaign_basics_select_end_date_prompt + '</div>');
      $('#end-date-field').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }

    if ($scope.invalidVideo) {
      $('#campaign-video .select-error').remove();
      $('#campaign-video').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }

    if ($scope.invalidThumbnailVideo) {
      $('#campaign-thumbnail-video .select-error').remove();
      $('#campaign-thumbnail-video').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }
  }

  // Validate Campaign manager field
  $scope.campaignManagerValidation = function() {
    var translation = $translate.instant(['get_started_campaign_manager_error'])
    $('.campaign-details-form.ui.form').form({
      recipient: {
        identifier: 'recipient',
        rules: [{
          type: 'empty',
          prompt: translation.get_started_campaign_manager_error
        }]
      },
    }, {
      inline: true,
      onSuccess: function() {
        $scope.passCampaignManagerCheck = true;
        $scope.valcheck = true;
      },
      onFailure: function() {
        $scope.passCampaignManagerCheck = false;
        $scope.valcheck = false;
      }
    }).form('validate form')
  }

  function inlineDetailsValidation() {
    var translation = $translate.instant(['campaign_basics_currency_prompt', 'campaign_basics_uploadimage_prompt', 'campaign_basics_selectcategory_prompt', 'campaign_basics_description_prompt']);
    if (!$scope.campaign.description && (!$scope.hideCampaignDescriptionField)) {
      $('#campaign-details-field .select-error').remove();
      $('#campaign-details-field').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.campaign_basics_description_prompt + '</div>');
      $('#campaign-details-field').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }

    if (!$('#featured-img-field .ui.image').hasClass('image-uploaded') && ($scope.showCampaignImageField)) {
      $('#featured-img-field .select-error').remove();
      $('#featured-img-field').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.campaign_basics_uploadimage_prompt + '</div>');
      $('#featured-img-field').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }


    if ($('.faq-description').hasClass('has-error')) {
      $('#faq-description').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    } else {
      $('#faq-description').removeClass('error');
    }
  }
  //Regex Reward Froala Validation
  $.fn.form.settings.rules.regexFroalaValidation = function(value, validate) {
    return (validate <= 0) ? false : true;
  }

  $scope.rewardsValidation = function() {
    var translation = $translate.instant(['campaign_reward_reward_contribution_description_error', 'campaign_reward_reward_contribution_name_error', 
    'campaign_reward_reward_contribution_message_error', 'campaign_reward_reward_contribution_message_error2']);

    $scope.rewards_validation = {
      reward_amount: {
        identifier: 'reward_amount',
        rules: [{
          type: 'not[0]',
          prompt: translation.campaign_reward_reward_contribution_message_error
        }, {
          type: 'empty',
          prompt: translation.campaign_reward_reward_contribution_message_error2
        }]
      },
      reward_title: {
        identifier: 'reward_title',
        rules: [{
          type: 'empty',
          prompt: translation.campaign_reward_reward_contribution_name_error
        }]
      }
    }

    angular.forEach($scope.rewards_data, function(value, key) {
      var descriptionLength;
      if (typeof value.description === 'undefined' || value.description == null) {
        descriptionLength = 0;
      } else {
        descriptionLength = value.description.length;
      }
      var validation = {
        identifier: 'description' + (key + 1),
        rules: [{
          type: 'regexFroalaValidation[' + value.description.length + ']',
          prompt: translation.campaign_reward_reward_contribution_description_error
        }]
      }

      $scope.rewards_validation['description' + (key + 1)] = validation;
    });
    $('.campaign-rewards-form.ui.form').form($scope.rewards_validation, {
      inline: true,
      onSuccess: function() {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function() {
        $scope.valcheck = $scope.valcheck && false;
      }
    }).form('validate form');
  }

  function campaignLinkValidate() {
    var translation = $translate.instant(['campaign_setup_links_label_error', 'campaign_setup_links_url_error']);

    window.formObj = {};

    for (var i = 0; i < 8; i++) {
      if (i < 4) {
        formObj["link_label" + i] = {};
        formObj["link_label" + i]["identifier"] = "link_label" + i;
        formObj["link_label" + i]["rules"] = [];
        formObj["link_label" + i]["rules"].push({
          type: 'empty',
          prompt: translation.campaign_setup_links_label_error
        });
      } else {
        var j = i - 4;
        formObj["link_url" + j] = {};
        formObj["link_url" + j]["identifier"] = "link_url" + j;
        formObj["link_url" + j]["rules"] = [];
        formObj["link_url" + j]["rules"].push({
          type: 'empty',
          prompt: translation.campaign_setup_links_url_error
        });
      }
    }

    $('.ui.form.campaign-links')
      .form(formObj, {
        inline: true,
        on: 'blur',
        onSuccess: function() {
          $scope.valcheck = $scope.valcheck && true;
        },
        onFailure: function() {
          $scope.valcheck = $scope.valcheck && false;
        }
      }).form("validate form");
  }


  // sending PUT request to update campaign info
  $scope.saveData = function($event) {
    $scope.valcheck = true;
    // Check current path then initialize inline validations
    if ($scope.currentPath == 'getstarted') {

      //Replace apostrophe with htmlencdoe - For Facebook Sharing
      if ($scope.campaign.blurb) {
        $scope.campaign.blurb = $scope.campaign.blurb.replace(/'/g, "&#39;");
      }

      $scope.basicsValidation();
      inlineBasicsValidations();

      // if campaign fee is required
      if ($scope.public_settings.site_campaign_percentage_required) {
        $scope.campaignFeeValidation();
      }
      if ($scope.public_settings.site_theme_campaign_per_min) {
        $scope.campaignMinContributionValidation();
      }
      if ($scope.public_settings.site_theme_campaign_per_max) {
        $scope.campaignMaxContributionValidation();
      }
      // if video is required
      if ($scope.public_settings.site_campaign_video_required) {
        $scope.campaignVideoValidation();
      }
      // if contract number is required
      if ($scope.public_settings.site_theme_campaign_contract_number_enable) {
        $scope.campaignContractNumberValidation();
      }


    } else if ($scope.currentPath == 'campaign-setup') {

      if ($scope.campaign.settings) {
        if ($scope.campaign.settings.campaign_manager_name && (!$scope.hideCampaignManagerField || $scope.hideCampaignManagerField == 'undefined')) {
          var manager_validated = $scope.campaignManagerValidation();
        }
      }
      if (!$scope.hideCampaignDescriptionField) {
        $scope.froalaOptionsCampaigns.froalaEditor("events.trigger", "form.submit", [], true);
      }
      campaignLinkValidate();
      inlineDetailsValidation();
    } else if ($scope.currentPath == 'rewards' || $scope.currentPath == 'story') {
      if (typeof $scope.showCampaignDescription == 'undefined' || !$scope.showCampaignDescription) {
        $scope.rewardsValidation();
      }

      if (!$scope.campaign.description && ($scope.showCampaignDescription)) {
        var translation = $translate.instant(['campaign_basics_description_prompt']);

        $('#campaign-details-field .select-error').remove();
        $('#campaign-details-field').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.campaign_basics_description_prompt + '</div>');
        $('#campaign-details-field').addClass('error');
        $scope.valcheck = $scope.valcheck && false;
      }
    }

    // Check for error on the .field element
    $rootScope.scrollToError();

    var currentEle = $event.currentTarget;
    var navigating = $(currentEle).hasClass("save-campaign-button") ? false : true;

    if ($scope.valcheck) {
      if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2) {
        if ($scope.revision) {
          Restangular.one('campaign', $scope.campaign.entry_id).one('revision', $scope.revision.entry_revision_id).customPUT($scope.revision).then(function(success) {});
        }
      }
      if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 1) {
        if ($scope.revision) {
          if ($routeParams.revision_id) {
            $scope.campaign.blurb = $scope.revision.blurb;
            $scope.campaign.description = $scope.revision.description;
            $scope.campaign.name = $scope.revision.name;
          }
        }
      }

      $scope.campaign.rewards = [];
      var count = 0;
      angular.forEach($scope.rewards_data, function(val) {
        //Show estimated delivery time
        var rewardsModel = {
          amount: val.amount,
          name: val.name,
          description: val.description,
          shipping_option_id: '',
          shipping: [],
          item_limit: val.item_limit,
          estimated_delivery_time: ISOtoPostgres(val.estimated_delivery_time_convert),
          pledge_level_id: val.pledge_level_id,
          id: val.pledge_level_id,
          attributes: val.attributes,
          expires: val.expires,
          priority: val.priority,
          coupon_id: val.selectedCoupons && val.selectedCoupons.length > 0 ? val.selectedCoupons[0].coupon_id : "__NULL__",
          selectedCoupons: val.selectedCoupons //temporary value
        };
        $scope.campaign.rewards.push(rewardsModel);
        if (val.shipping.length > 0) {
          // loop through shipping
          angular.forEach(val.shipping, function(value) {
            var shippingOption = {
              cost: '',
              name: '',
              description: '',
              shipping_option_type_id: '',
              country_id: '',
              subcountry_id: '',
              shipping_option_id: '',
              worldwideOption: ''
            };
            //Shipping type
            if (value.sub_countries.length > 0) {
              angular.forEach(value.sub_countries, function(sub) {
                shippingOption = {
                  cost: sub.cost,
                  name: sub.name,
                  description: '',
                  shipping_option_type_id: sub.shipping_option_type_id,
                  country_id: sub.country_id,
                  shipping_option_id: sub.shipping_option_id,
                  subcountry_id: sub.subcountry_id,
                  worldwideOption: false
                };
                $scope.campaign.rewards[count].shipping.push(shippingOption);
              });

            } else {
              shippingOption = {
                cost: value.cost,
                name: '',
                description: '',
                shipping_option_type_id: value.shipping_option_type_id,
                country_id: value.country_id,
                shipping_option_id: value.shipping_option_id,
                subcountry_id: '',
                worldwideOption: ''
              };
              if (value.shipping_option_type_id == 1) {
                shippingOption.worldwideOption = true;
              } else {
                shippingOption.worldwideOption = false;
              }
              $scope.campaign.rewards[count].shipping.push(shippingOption);
            }
          });
        }
        count++;
      });

      $scope.campaign.skip_path_update = 1;

      if ($scope.hideStartCampaignPage && typeof $scope.hideStartCampaignPage !== 'undefined') {
        $scope.campaign.uri_path = 'campaign/' + $scope.campaign.entry_id + '/' + $scope.campaign.name.toLowerCase().replace(/\s+/g, "-");
      }

      $scope.campaign.uri_paths[0].path = $scope.campaign.uri_path;

      //Campaign duration
      if ($scope.runModeSelected == 2) {
        $scope.campaign.ends = "__NULL__";
        $scope.campaign.runtime_days = 1
        $scope.campaign.raise_mode_id = 2;
      }

      if ($scope.payment_gateway == 2) {
        $scope.campaign.currency_id = 162;
        if ($scope.widget_default_accountID) {
          $scope.campaign.widgetmakr_account_id = $scope.widget_default_accountID;
        } else {
          $scope.campaign.widgetmakr_account_id = $scope.widget_accountID;
        }
      }
      // delete entry_status_id before saving
      if ($scope.campaign.entry_status_id !== 2) {
        delete $scope.campaign.entry_status_id;
      }

      if ($scope.currentPath == 'getstarted') {
        // Concate the selected protocal to the user entered link/path.
        // If the field is empty, delete the attribute from settings
        if ($scope.campaign.settings !== undefined && $scope.campaign.settings != null) {
          if ($scope.top_header_link) {
            var selectedProtocal = $(".dropdown.top-header-link-protocol").dropdown("get value");
            // If the protocal isn't the relative link we will append it.
            if (selectedProtocal !== $scope.top_header_protocals[2].value.toLowerCase()) {
              $scope.campaign.settings.top_header_link = selectedProtocal + $scope.top_header_link;
            } else {
              $scope.campaign.settings.top_header_link = $scope.top_header_link;
            }
          } else {
            CampaignSettingsService.deleteSettings({ top_header_link: '__NULL__' });
            delete $scope.campaign.settings.top_header_link;
          }
        }
        if ($('#maxthreshold').checkbox('is checked') && !$scope.public_settings.site_campaign_max_threshold_hide) {
          if ($scope.thresholdvalue.value > $scope.campaign.funding_goal) {
            $scope.campaign.maximum_allowed_funds_raised = $scope.thresholdvalue.value;
          } else {
            $scope.campaign.maximum_allowed_funds_raised = $scope.campaign.funding_goal;
            $scope.thresholdvalue.value = $scope.campaign.funding_goal;
          }
        } else {
          $scope.thresholdvalue.value = 0;
          $scope.campaign.maximum_allowed_funds_raised = 0;
        }

        if ($scope.runModeSelected == 1) {
          if (!($scope.campaign.starts_date_time && $scope.campaign.ends_date_time && $scope.campaign.runtime_days > 0 || !$scope.campaign.starts_date_time && !$scope.campaign.runtime_days && !$scope.campaign.ends_date_time)) {
            $scope.saveError = true;
            $timeout(function() {
              $scope.saveError = false;
            }, 1500);
            return;
          }
        }

        if (!$('#location').text()) {
          $scope.campaign.city_id = "__NULL__";
        }

      } else {
        if (!$scope.campaign.maximum_allowed_funds_raised) {} else {
          $scope.thresholdvalue.value = $scope.campaign.maximum_allowed_funds_raised;
          $('#maxthreshold').checkbox('check');
          $scope.showt.value = true;
        }
      }

      if ($scope.currentPath == 'rewards' || $scope.currentPath == 'story') {
        saveRewards();
        $scope.backUrl = "campaign-setup/" + $routeParams.campaign_id;
      } else {
        // re-assignment
        $scope.campaign.category_id = $scope.category_ids.concat($scope.sub_category_ids.ids);
        if ($scope.runModeSelected != 2) {
          // Checking if it's object is necessary because if user doesn't touch date, it's grabbed directly from server as String
          // If user does modify date, then it's object and these functions related to Date will work
          if (typeof $scope.campaign.ends_date_time == "string") {
            $scope.campaign.ends_date_time = new Date($scope.campaign.ends_date_time);
          }
          if ($scope.campaign.ends_date_time && typeof $scope.campaign.ends_date_time === "object") {
            if ($scope.campaign.ends_date_time.toString().length > 19) {
              var month = $scope.campaign.ends_date_time.getMonth();
              if (month >= 9) {
                month = $scope.campaign.ends_date_time.getMonth() + 1;
              } else {
                month = $scope.campaign.ends_date_time.getMonth() + 1;
                month = "0" + month;
              }
              var day = $scope.campaign.ends_date_time.getDate();
              if (day > 9) {} else {

                day = "0" + day;
              }
              var hours = $scope.campaign.ends_date_time.getHours();
              if (hours > 9) {} else {
                hours = "0" + hours;
              }
              var mins = $scope.campaign.ends_date_time.getMinutes();
              if (mins > 9) {} else {
                mins = "0" + mins;
              }
              var datestring = $scope.campaign.ends_date_time.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + mins + ":00";
              $scope.campaign.ends = datestring;
            } else if ($scope.campaign.ends_date_time.getTime()) {
              $scope.campaign.ends = $scope.campaign.ends_date_time.toString().substring(0, 16) + ":00";
            }
          }
        }

        if (typeof $scope.campaign.starts_date_time == "string") {
          $scope.campaign.starts_date_time = new Date($scope.campaign.starts_date_time);
        }
        if ($scope.campaign.starts_date_time && typeof $scope.campaign.starts_date_time === "object") {
          if ($scope.campaign.starts_date_time.toString().length > 19) {
            var month = $scope.campaign.starts_date_time.getMonth();
            if (month >= 9) {
              month = $scope.campaign.starts_date_time.getMonth() + 1;
            } else {
              month = $scope.campaign.starts_date_time.getMonth() + 1;
              month = "0" + month;
            }
            var day = $scope.campaign.starts_date_time.getDate();
            if (day > 9) {} else {

              day = "0" + day;
            }
            var hours = $scope.campaign.starts_date_time.getHours();
            if (hours > 9) {} else {
              hours = "0" + hours;
            }
            var mins = $scope.campaign.starts_date_time.getMinutes();
            if (mins > 9) {} else {
              mins = "0" + mins;
            }
            var datestring = $scope.campaign.starts_date_time.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + mins + ":00";
            $scope.campaign.starts = datestring;
          } else {
            $scope.campaign.starts = $scope.campaign.starts_date_time.substring(0, 16) + ":00";
          }
        }

        // Change the format of the date string back to ISO format
        if ($scope.campaign.starts && $scope.campaign.starts != null) {
          $scope.campaign.starts_date_time = new Date($scope.campaign.starts_date_time.toString());
          $scope.campaign.starts_date_time = $scope.campaign.starts_date_time.toString().replace(/\//g, "-");
          $scope.campaign.starts = $scope.campaign.starts.replace(/\//g, "-");
        }
        if ($scope.campaign.ends != "__NULL__" && $scope.campaign.ends != null) {
          $scope.campaign.ends_date_time = new Date($scope.campaign.ends_date_time.toString());
          $scope.campaign.ends_date_time = $scope.campaign.ends_date_time.toString().replace(/\//g, "-");
          $scope.campaign.ends = $scope.campaign.ends.replace(/\//g, "-");
        }

        // do different things base on different paths
        if ($scope.currentPath == 'campaign-setup') {
          // $scope.froalaOptionsCampaigns.froalaEditor("events.trigger", "form.submit", [], true);
          saveLinks();
          if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 2) {
            saveRevisionFAQs();
          } else if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 1) {
            adminSaveRevisionFAQs();
          } else {
            saveFAQs();
          }
          if (reqDeleteFileArr.length) {
            reqDeleteFileArr.forEach(function(value) {
              Restangular.one("campaign", $scope.campaign.id).one("resource/file", value).customDELETE();
            });
            reqDeleteFileArr = [];
          }
        }

        // Save campaign video but only doing this on getstarted page
        // First grab GET what video is associated with this campaign
        // True then PUT to modify; False then POST to add
        // PUT request will remove the old data, create new one and attach itself to edited campaign
        // Before, it was trying to modify the old one that was already deleted
        if ($scope.currentPath == "getstarted") {
          setCampaignThumbnailVideo();
          if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 1) {
            adminSaveImages();
          }
          // Meaning there is already video associated with this campaign
          // We only need the video id for our PUT
          if ($scope.campaign.video == undefined) {
            $scope.campaign.video = {};
          }
          // Commence PUT if video id is not undefined and entered value is not not empty
          if ($scope.campaign.video.id !== undefined &&
            $scope.campaign.video.uri != "") {
            $scope.campaign.video.entry_id = campaign_id;
            $scope.campaign.video.resource_id = $scope.campaign.video.id;
            $scope.campaign.video.resource = $scope.campaign.video.uri;
            $scope.campaign.video.resource_content_type = "video";
            Restangular.one('campaign', campaign_id).one('resource/link', $scope.campaign.video.id).customPUT($scope.campaign.video).then(function(success) {
              $scope.campaign.video = success;
            });
          } else if ($scope.campaign.video.uri != "" &&
            $scope.campaign.video.uri !== undefined) {
            var data = {
              entry_id: campaign_id,
              resource_type: 'link',
              resource_content_type: 'video',
              resource: $scope.campaign.video.uri,
              region_id: 1,
            }
            Restangular.one('campaign', campaign_id).one('resource/link/').customPOST(data).then(function(success) {
              $scope.campaign.video = success;
            });
          }
          // Delete the video if URI is empty
          else if ($scope.campaign.video.uri == "") {
            Restangular.one('campaign', campaign_id).one('resource/link/').customDELETE($scope.campaign.video.id).then(function(success) {
              $scope.campaign.video = {};
            });
          }
        }
      }

      var delObj = {};
      for (var property in $scope.campaign.settings) {
        if ($scope.campaign.settings.hasOwnProperty(property) && $scope.campaign.settings[property] == "" && typeof $scope.campaign.settings[property] != "boolean") {
          delObj[property] = 1;
        }
      }
      var reqArr = [];
      if ($scope.campaign.settings != null && $scope.campaign.settings != undefined && Object.getOwnPropertyNames($scope.campaign.settings).length) {
        if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 2) {
          reqArr.push(Restangular.one("campaign", campaign_id).one("setting-revision").customPUT({ bio_enable: $scope.campaign.settings.bio_enable }));
        } else if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 1) {
          if ($scope.settingRevisions) {
            reqArr.push(Restangular.one("campaign", campaign_id).one("setting-revision").customPUT({ bio_enable: $scope.campaign.settings.bio_enable }));
          }
          reqArr.push(CampaignSettingsService.saveSettings($scope.campaign.settings));
        } else {
          reqArr.push(CampaignSettingsService.saveSettings($scope.campaign.settings));
        }
      }
      msg = {
        'loading': true,
        'loading_message': 'in_progress'
      }
      $rootScope.floatingMessage = msg;
      var campaignSaveReq = Restangular.one('campaign', campaign_id).customPUT($scope.campaign).then(function(success) {
        CreateCampaignService.cacheIn(success);
        loadCampaignData(true);
        if ($scope.rewards_save_error) {
          msg = {
            'header': 'success_message_save_changes_reward_save_error'
          }
        } else {
          // If not admin and at least 1 backer
          if ($scope.user.person_type_id != 1 && success.total_backers > 0 && $scope.currentPath == "getstarted") {
            // translation message
            var translation_value = $rootScope.checkTranslation("success_message_save_changes_button", "success_message_save_changes_not_admin_button");
          } else {
            var translation_value = "success_message_save_changes_button";
          }

          if ($scope.enableCampaignRevisions && $scope.user.person_type_id == 2 && $scope.campaign.entry_status_id == 2) {
            var translation_value = "success_message_save_changes_button_revision";
          } else if ($scope.enableCampaignRevisions && $scope.user.person_type_id == 1 && $scope.campaign.entry_status_id == 2) {
            var translation_value = "success_message_save_changes_button_admin_revision";
          }
          msg = {
            'header': translation_value
          }
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        if (!navigating) {
          var isIE = window.navigator.userAgent.indexOf("Trident");
          if (isIE > -1) {
            window.location.reload();
          }
        }
      }, function(failure) {
        msg = {
          'header': failure.data.message
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
      reqArr.push(campaignSaveReq);
      if (Object.getOwnPropertyNames(delObj).length) {
        reqArr.push(CampaignSettingsService.deleteSettings(delObj));
      }
      $q.all(reqArr);


    } else {
      // Need to fill out required fields before moving on
      $event.preventDefault();
      msg = {
        'header': 'fail_message_save_changes_button'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      return false;
    }
  }

  function saveRewards() {
    $scope.rlength = 0;
    $scope.rewards_save_error = false;
    // Delete the property we added to the countries objects so they don't get saved when saving
    if (countriesWithShippingStatus) {
      angular.forEach(countriesWithShippingStatus, function(value, index) {
        if (value.hasOwnProperty("shipping_status")) {
          delete value["shipping_status"];
        }
      });
    }
    
    $scope.campaign.rewards.forEach(function(reward) {
      if ($("#description" + ($scope.campaign.rewards.indexOf(reward) + 1)).froalaEditor('codeView.isActive') && $("#description" + ($scope.campaign.rewards.indexOf(reward) + 1)).froalaEditor('codeView.get') != "") {
        reward.description = $("#description" + ($scope.campaign.rewards.indexOf(reward) + 1)).froalaEditor('codeView.get');
      }
      // send request if the fields are filled out
      if (reward.name && reward.description && reward.amount > 0) {
        var request1;
        if (!reward.item_limit || reward.item_limit == 0) {
          reward.item_limit = "__NULL__";
        }
        // Format expire date correctly
        if (reward.expires) {
          reward.expires = convertDate(reward.expires);
          if (typeof reward.expires != "string") {
            reward.expires = reward.expires.toISOString();
          }
          reward.expires = reward.expires.substring(0, 10);
        }

        if (!reward.id) {
          reward.entry_id = campaign_id;
          request1 = Restangular.one('campaign', campaign_id).one('pledge-level').customPOST(reward);
        } else {
          var id = reward.id;
          request1 = Restangular.one('campaign', campaign_id).one('pledge-level', id).customPUT(reward);
        }

        // process shipping options
        request1.then(function(success) {
          reward.id = success.id;
          saveShippingOption(reward, success.id);
          // $scope.savingData = false;
          $scope.saveSuccessful = true;
          if ($scope.rlength == $scope.campaign.rewards.length) {
            $timeout(function() {
              loadCampaignData(true);
            }, 500);
          }
          $scope.updateDuplicatedCountryList();
          // change to false after a few seconds
          $timeout(function() {
            $scope.saveSuccessful = false;
          }, 1500);
        }, function(fail) {
          $scope.rewards_save_error = fail.data.message;
          reward.errorMessage = fail.data.message;
          $scope.updateDuplicatedCountryList();
        });
      }
    });
  }
  
  // for each reward save multiple shipping options
  function saveShippingOption(reward, rewardID) {
    var shipping = $scope.campaign.rewards[$scope.campaign.rewards.indexOf(reward)].shipping;

    angular.forEach(shipping, function(obj) {
      if (obj.shipping_option_type_id == 1) {
        delete obj.country_id;
      }
      //for each shipping options use post/put/delete based on different situations
      //if the shipping id is empty but there is type id, use post to create new type
      if (!(parseInt(obj.shipping_option_id)) && parseInt(obj.shipping_option_type_id)) {
        Restangular.one('campaign', campaign_id).one('pledge-level', rewardID).one('shipping-option').customPOST(obj).then(function(success) {
          // assign the id in response back to the object
          obj.shipping_option_id = success.id;
        });
      }
      // if there is shipping id but the type id is empty, delete the type
      else if (obj.shipping_option_id && !obj.shipping_option_type_id) {
        Restangular.one('campaign', campaign_id).one('pledge-level', rewardID).one('shipping-option', obj.shipping_option_id).customDELETE();
      }
      // if there are shipping id and type id, use put to update
      else {
        Restangular.one('campaign', campaign_id).one('pledge-level', rewardID).one('shipping-option', obj.shipping_option_id).customPUT(obj);
      }

    });
    $scope.rlength++;
  }

  function saveLinks() {
    var selectedProtocols = $(".dropdown.top-header-link-protocol").dropdown("get text");
    /*    (selectedProtocols);
        ($scope.links);return;*/
    // Grab the old data to compare
    // Request will only be called when new data is different from old data
    Restangular.one('campaign', campaign_id).customGET().then(function(success) {
      // Empty array to store the old data of generic links
      initialLinks = [];
      angular.forEach(success.links, function(value) {
        if (value.resource_content_type == "generic") {
          initialLinks.push(value);
        }
      });
      angular.forEach($scope.links, function(link, index) {

        if (Array.isArray(selectedProtocols)) {
          if (selectedProtocols[index] != "Relative Path") {
            link.uri = link.uri.replace(/^https?\:\/\//i, "");
            link.resource = selectedProtocols[index] + link.uri;
          } else {
            link.resource = link.uri;
          }
        } else {
          if (selectedProtocols != "Relative Path") {
            link.uri = link.uri.replace(/^https?\:\/\//i, "");
            link.resource = selectedProtocols + link.uri;
          } else {
            link.resource = link.uri;
          }
        }

        var data_link = angular.copy(link);
        data_link.uri = link.resource;
        data_link.label = link.uri_text;
        // If URI text field is not empty
        if (data_link.uri) {
          // If it alraedy has ID, it means there is data in the database, then we can modify it
          if (data_link.id) {
            // PUT request
            // We only modify if data is different
            if (data_link.uri_text != initialLinks[index].uri_text || data_link.uri != initialLinks[index].uri) {
              data_link.resource_type = "link";
              Restangular.one('campaign', campaign_id).one('resource/link', data_link.id).customPUT(data_link).then(function(success) {
                refreshLinks();
              });
            }
          }
          // ID doesn't exist, then we add new
          else {
            // POST request
            data_link.resource_type = "link";
            Restangular.one('campaign', campaign_id).one('resource/link').customPOST(data_link).then(function(success) {
              $scope.links[index] = success.plain();
              refreshLinks();
            });
          }
        }
      });
    });
  }

  function refreshLinks() {
    Restangular.one('campaign', campaign_id).customGET().then(function(success) {
      // This newIndex is the position in array where new data should be inserted
      // Not using the index because GET campaign has other types of links that are not generic
      var newIndex = 0;
      angular.forEach(success.links, function(value, index) {
        if (value.resource_content_type == "generic") {
          // Remove Protocol
          if (value.uri.substring(0, 7) == "http://") {
            value.uri = value.uri.replace("http://", "");
            value.default_protocol = "http://";
          } else if (value.uri.substring(0, 8) == "https://") {
            value.uri = value.uri.replace("https://", "");
            value.default_protocol = "https://";
          } else {
            // Relative
            value.default_protocol = "Relative Path";
          }
          $scope.links[newIndex] = value;
          newIndex += 1;
        }
      });
    });
  }

  function adminSaveImages() {
    if ($scope.campaignImages[0] && $scope.campaignImages[0].entry_file_revision_id) {
      Restangular.one('campaign', campaign_id).one('resource/file/').customGET().then(function(success) {
        var tempCampaignImages = [];
        if (success.length) {
          for (var i = 0; i < success.length; i++) {
            if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.thumbnail) {
              tempCampaignImages.push(success[i]);
            }
          }
          var imageObj = { file_sync_resource_id: tempCampaignImages[0].id, file_sync: true };
          Restangular.one('campaign', campaign_id).one('resource-revision/file', $scope.campaignImages[0].id).customPUT(imageObj).then(function(success) {
            Restangular.one('campaign', campaign_id).one('resource-revision/file').customDELETE($scope.campaignImages[0].id).then(function(success) {
              getCampaignImages();
            });
          });
        }
      });
    }

    if ($scope.campaignHeaderImages[0] && $scope.campaignHeaderImages[0].entry_file_revision_id) {
      Restangular.one('campaign', campaign_id).one('resource/file/').customGET().then(function(success) {
        var tempCampaignHeaderImages = [];
        if (success.length) {
          for (var i = 0; i < success.length; i++) {
            if (success[i].region_id == $scope.RESOURCE_REGIONS.campaign.top_header) {
              tempCampaignHeaderImages.push(success[i]);
            }
          }
          var imageObj = { file_sync_resource_id: tempCampaignHeaderImages[0].id, file_sync: true };
          Restangular.one('campaign', campaign_id).one('resource-revision/file', $scope.campaignHeaderImages[0].id).customPUT(imageObj).then(function(success) {
            Restangular.one('campaign', campaign_id).one('resource-revision/file').customDELETE($scope.campaignHeaderImages[0].id).then(function(success) {
              getCampaignHeaderImages();
            });
          });
        }
      });
    }
  }

  function adminSaveRevisionFAQs() {
    if ($scope.campaign.faq[0].faq_revision_id) {
      Restangular.one('campaign', campaign_id).one('faq').getList().then(function(success) {
        if (success.length) {
          success.forEach(function(faq) {
            if (faq.faq_id) {
              Restangular.one('campaign', $scope.campaign.entry_id).one('faq').customDELETE(faq.faq_id);
            }
            if (faq.faq_revision_id) {
              Restangular.one('campaign', $scope.campaign.entry_id).one('faq-revision').customDELETE(faq.faq_revision_id);
            }
          });
        }
        $scope.campaign.faq.forEach(function(faq) {
          if (faq.faq_id) {
            Restangular.one('campaign', $scope.campaign.entry_id).one('faq').customDELETE(faq.faq_id);
            faq.faq_id = null;
          }
          if (faq.faq_revision_id) {
            Restangular.one('campaign', $scope.campaign.entry_id).one('faq-revision').customDELETE(faq.faq_revision_id);
            faq.faq_revision_id = null;
          }

          angular.forEach(faq.faq_pairs, function(value, key) {
            if (value.id) {
              value.id = null;
            }
          });
          Restangular.one('campaign', campaign_id).one('faq').customPOST(faq).then(function(success) {
            // save the faq id for future use
            var faqID = success[0].id;
            // if faq created successfully, assign the id from response back to object
            faq.faq_id = faqID;
            if (faq.faq_pairs.length) {
              updateFAQPairs(faq);
            }
          });
        });
      });
    } else {
      saveFAQs();
    }
  }

  function saveFAQs() {
    $scope.campaign.faq.forEach(function(faq) {
      // if id not found, POST to create new
      if (!faq.faq_id) {
        // make sure the faq has name and description
        if (faq.name && faq.description) {
          Restangular.one('campaign', campaign_id).one('faq').customPOST(faq).then(function(success) {
            // save the faq id for future use
            var faqID = success[0].id;
            // if faq created successfully, assign the id from response back to object
            faq.faq_id = faqID;
            if (faq.faq_pairs.length) {
              updateFAQPairs(faq);
            }
          });
        }
      }
      // if id found, PUT to edit
      else {
        Restangular.one('campaign', campaign_id).one('faq', faq.faq_id).customPUT(faq);
        updateFAQPairs(faq);
      }
    });

    if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2 && $scope.user.person_type_id == 1) {

    }
    getFAQ();
  }

  function updateFAQPairs(faq) {
    var rep = [];
    angular.forEach(faq.faq_pairs, function(value, key) {
      // make sure not sending empty request
      if (value.question && value.answer) {
        // if it has id, use PUT request to update
        if (value.id) {
          var faq_pair = value;
          var req = Restangular.one('campaign', campaign_id).one('faq', faq.faq_id).one('faq-pair', value.id).customPUT(value);
          rep.push(req);
        }
        // else use POST request to create
        else {
          var req = Restangular.one('campaign', campaign_id).one('faq', faq.faq_id).one('faq-pair').customPOST({
            "pairs": [value]
          });
          rep.push(req);
        }
      }
    });
    $q.all(rep).then(function(success) {
      //Causing rollback behavior on frontend
      /*getFAQ();*/
    });
  }

  function saveRevisionFAQs() {
    $scope.campaign.faq.forEach(function(faq) {
      // if id not found, POST to create new
      if ($scope.no_faq_revisions) {
        // make sure the faq has name and description
        if (faq.name && faq.description) {
          var faqObj = {};
          faqObj.description = faq.description;
          faqObj.name = faq.name;
          Restangular.one('campaign', campaign_id).one('faq-revision').customPOST(faqObj).then(function(success) {
            // save the faq id for future use
            var faqID = success[0].id;
            // if faq created successfully, assign the id from response back to object
            faq.faq_revision_id = faqID;
            if (faq.faq_pairs.length) {
              updateRevisionFAQPairs(faq);
            }
          });
        }
      } else {
        var faqObj = {};
        faqObj.description = faq.description;
        faqObj.name = faq.name;
        Restangular.one('campaign', campaign_id).one('faq-revision', faq.faq_revision_id).customPUT(faqObj);
        updateRevisionFAQPairs(faq);
      }
    });
  }

  function updateRevisionFAQPairs(faq) {
    var rep = [];
    angular.forEach(faq.faq_pairs, function(value, key) {
      // make sure not sending empty request
      if (value.question && value.answer) {
        // if it has id, use PUT request to update
        if (value.id && !$scope.no_faq_revisions) {
          var faq_pair = value;
          $scope.no_faq_revisions = false;
          var req = Restangular.one('campaign', campaign_id).one('faq-revision', faq.faq_revision_id).one('faq-pair-revision', value.id).customPUT(value);
          rep.push(req);
        }
        // else use POST request to create
        else {
          var req = Restangular.one('campaign', campaign_id).one('faq-revision', faq.faq_revision_id).one('faq-pair-revision').customPOST({
            "pairs": [value]
          });
          rep.push(req);
        }
      }
    });
    $q.all(rep).then(function(success) {
      //   //Causing rollback behavior on frontend
      //   /*getFAQ();*/
    });
  }

  $scope.uploadCampaignFile = function(files) {
    if (files.length) {
      $scope.isUploading = true;
      var url = "campaign/" + $scope.campaign.id + "/resource/file";
      FileUploadService.uploadFile(url, files).then(function(success) {
        $scope.currentUploadFile.resourceId = success.data.id;
        $scope.currentUploadFile.title = $scope.currentUploadFile.title ? $scope.currentUploadFile.title : success.data.name;
        $scope.currentUploadFile.fileName = success.data.name;
        $scope.currentUploadFile.path = success.data.path_external;
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

  $scope.addCampaignFile = function() {
    if ($scope.currentUploadFile.fileName) {
      if (!$scope.campaign.settings.hasOwnProperty("campaign_files")) {
        $scope.campaign.settings.campaign_files = [];
      }
      $scope.campaign.settings.campaign_files.push($scope.currentUploadFile);
      resetFileUpload();
    }
  }

  $scope.cancelCampaignFile = function() {
    Restangular.one("campaign", $scope.campaign.id).one("resource/file", $scope.currentUploadFile.resourceId).customDELETE();
    resetFileUpload();
  }

  function resetFileUpload() {
    $scope.currentUploadFile = {
      "title": "",
      "description": "",
      "fileName": "",
      "icon": "file",
      "path": "",
      "resourceId": -1
    };
  }

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

  $scope.removeFileFromSetting = function(fileObjIndex) {
    if ($scope.enableCampaignRevisions && $scope.campaign.entry_status_id == 2) {
      return false;
    } else {
      addToDeleteFileQueue($scope.campaign.settings.campaign_files[fileObjIndex].resourceId);
      $scope.campaign.settings.campaign_files.splice(fileObjIndex, 1);
    }
  }

  $scope.saveVideoLink = function() {
    var link = window.prompt('Please enter a URL to insert', 'https://');
    Restangular.one('campaign', campaign_id).one('resource/link').customPOST({
      resource: link,
      resource_content_type: 'video',
      region_id: $scope.RESOURCE_REGIONS.campaign.campaign.header
    });
  }

  // Search cities and check if the result needs to be displayed in native language
  $scope.searchCities = function(term) {
    var cityID = null; // variable to hold city ID
    var countryID = null;
    var native_lookup = $scope.native_lookup == true ? 1 : 0;
    if (term) {
      // Check setting here to choose which one to use, check the layout
      // This one is to search cities directly
      Geolocator.searchCities(term, native_lookup).then(function(cities) {
        angular.forEach(cities, function(value) {
          checkCitiesNative(value);
        });
        $scope.cities = cities;
      });
    }
  }

  // Search coupons available to the campaign manager
  $scope.coupons = [];
  $scope.selectedCoupons = {selected: []};
  $scope.searchCoupons = function(term, reward) {
    if (!reward.selectedCoupons) reward.selectedCoupons = [];
    if (reward.selectedCoupons.length >= 1) {
      $scope.coupons = [];
      return;
    }
    var filters = {
      "sort": '-created',
      "filters": {code: term}
    };
    if (term) {
      RestFullResponse.one('portal').all('coupon').getList(filters).then(function (success) {
        $scope.coupons = success.data;
      });
    }
  }

  $scope.$watch('multipleCity.selected', function(value) {
    if (value) {
      $scope.campaign.city_id = [];
      angular.forEach(value, function(city) {
        var cityID = Geolocator.lookupCityID(city.name);
        if (cityID) {
          $scope.campaign.city_id.push(cityID);
        } else if (city.id) {
          $scope.campaign.city_id.push(city.id);
        }
      });
    }
  });

  // Watching how variable starts_date_time changes
  // If it changes from null to a value, which is when user first created a campaign and set start date
  // we put a default value in runtime_days such as 1
  var tempStartsDateTime;
  $scope.$watch("campaign.starts_date_time", function(newValue, oldValue) {
    if ((oldValue == null || oldValue == undefined) && newValue != null && newValue != undefined) {
      if ($scope.campaign.runtime_days == null || $scope.campaign.runtime_days == undefined) {
        $scope.campaign.runtime_days = 1;
      }
    }
  });

  // Custom filter for ngQuickDate so it disables all dates before today
  $scope.noPastDates = function(d) {
    if (!d) {
      return true;
    }
    var dayIndex = d.getDay();

    var now = new Date();

    // Set to the beginning of the day
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    // Return comparison
    return (d >= now);
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

  // Convert from Javascript ISO Date format (2014-07-25T07:00:00.000Z) to what Postgres is looking for (2014-07-25 07:00:00)
  function ISOtoPostgres(data) {
    if (data) {
      if (typeof data !== 'string')
        data = data.toISOString();
      // return date only. get rid of the time just for now
      return data.slice(0, 10).replace('T', ' ');
    } else {
      return '__NULL__';
    }
  }

  // Setting up field configs for ui-select-2 plugin
  $scope.categorypicker = {
    placeholder: 'Please select one or more categories',
    width: '100%',
  };
  $scope.subcategorypicker = {
    placeholder: 'You can select sub-categories',
    width: '100%',
  };

  $scope.currencypicker = {
    width: '100%'
  };

  // Takes an array and adds a reward to it, otherwise just creates a reward
  $scope.addReward = function(arr) {
    if (!$scope.reward_html_editor) {
      var rewardsModel = {
        amount: 0,
        name: '',
        pledge_level_id: '',
        description: ' ',
        shipping_option_id: '',
        shipping: [],
        attributes: {},
      };
    } else {
      var rewardsModel = {
        amount: 0,
        name: '',
        pledge_level_id: '',
        description: '<p><br></p>',
        shipping_option_id: '',
        shipping: [],
        attributes: {},
      };
    }
    if (arr) {

      if(reward_priority == -1) {
        reward_priority = 0;
      }
      rewardsModel.priority = reward_priority++;
      arr.push(angular.copy(rewardsModel));
    }
  }

  // Takes an array and adds a shipping option to it, otherwise just creates a shipping option
  $scope.addShippingOption = function(arr) {

    // when adding, check the existing objects
    var worldwideInList = false;
    angular.forEach(arr, function(value, key) {
      if (value.shipping_option_type_id == 1) {
        worldwideInList = true;
      }
    });

    var shippingOption = {
      cost: '',
      name: '',
      description: '',
      shipping_option_type_id: '',
      country_id: '',
      subcountry_id: '',
      sub_countries: [],
      worldwideOption: worldwideInList
    };

    if (arr)
      arr.push(angular.copy(shippingOption));

  }


  // AWARD VARIATION - START
  $scope.addVariationOption = function(reward) {
    if (reward.attributes) {
      if (!reward.attributes['variation']) {
        reward.attributes['variation'] = [];
      }
    } else {
      reward.attributes = {};
    }
    var variationOption = {
      name: '',
      choice: []
    };
    if (reward.attributes['variation']) {
      reward.attributes['variation'].push(angular.copy(variationOption));
    } else {
      reward.attributes['variation'] = [];
      reward.attributes['variation'].push(angular.copy(variationOption));
    }
  }

  $scope.removeVariationOption = function(reward, index) {
    reward.attributes['variation'].splice(index, 1);
  }

  $scope.addChoice = function(variation) {
    var choiceOption = {
      value: '',
    };
    if (variation) {
      variation.choice.push(angular.copy(choiceOption));
    }
  }

  $scope.removeChoice = function(choice, index) {
      choice.splice(index, 1);
    }
    // AWARD VARIATION - END

  $scope.addsubCountry = function(arr, index) {
      angular.forEach($scope.subCountries, function(val) {
        if (val.cost) {
          $scope.campaign.rewards[index].shipping.push(val);
        }
      });
    }
    // Takes an array and adds a link to it, otherwise just creates a link
  $scope.addLink = function(arr) {
    var link = {
      uri: '',
      resource: '',
      label: '',
      resource_content_type: "generic",
      region_id: 2
    };
    if (arr)
      arr.push(angular.copy(link));
  }

  // Takes an array and adds an FAQ to it, otherwise just creates an FAQ
  $scope.addFAQ = function(arr) {
    if ($scope.public_settings.site_campaign_faq.toggle) {
      var FAQ = {
        name: $scope.public_settings.site_campaign_faq.name,
        description: $scope.public_settings.site_campaign_faq.description,
        faq_pairs: []
      }
    } else {
      var FAQ = {
        name: '',
        description: '',
        faq_pairs: []
      };
    }
    if (arr)
      arr.push(angular.copy(FAQ));
  }

  // Takes an array and adds an FAQ pair to it, otherwise just creates an FAQ pair
  $scope.addFAQPair = function(FAQ) {
    var pair = {
      question: '',
      answer: '',
      display_priority: FAQ.length + 1
    };
    if (FAQ)
      return FAQ.push(angular.copy(pair));
  }

  // faq sort filter
  // For now, it's only for single FAQ, not designed for multiple ones
  $scope.faqSortOptions = {
    stop: function(e, ui) {
      var pairs = ui.item.scope().faq.faq_pairs;
      for (var i = 0; i < pairs.length; i++) {
        pairs[i].display_priority = i + 1;
        $scope.campaign.faq[0].faq_pairs[i] = pairs[i];
      }
    }
  };

  // For now, it's only for single FAQ, not designed for multiple ones
  $scope.rewardVariationSortOptions = {
    stop: function(e, ui) {
      var pairs = ui.item.scope().faq.faq_pairs;
      for (var i = 0; i < pairs.length; i++) {
        pairs[i].display_priority = i + 1;
        $scope.campaign.faq[0].faq_pairs[i] = pairs[i];
      }
    }
  };

  // select shipping option click function
  $scope.selectShippingOption = function(rewardIndex, sIndex, optionID) {

    var default_country_id = '';
    if ($scope.public_settings.hasOwnProperty('site_theme_default_shipping_country')) {
      default_country_id = $scope.public_settings.site_theme_default_shipping_country.country_id;
    }
    // assign option ID
    // use index of to get the reward index then assign it t;o the scope object
    $scope.rewards_data[rewardIndex].shipping[sIndex].cost = '';
    $scope.rewards_data[rewardIndex].shipping[sIndex].shipping_option_type_id = optionID;
    $scope.rewards_data[rewardIndex].shipping[sIndex].country_id = default_country_id;
  };

  // shipping option -> country specific shipping selected country
  $scope.selectedCountry = function(reward, sIndex, countryID) {
    var shipping = $scope.campaign.rewards[$scope.campaign.rewards.indexOf(reward)].shipping;
    angular.forEach(shipping, function(value, key) {
      if (key != sIndex && countryID == value.country_id) {
        countryID = null;
        country_exist = true;
      }
    });
    $scope.campaign.rewards[$scope.campaign.rewards.indexOf(reward)].shipping[sIndex].country_id = countryID;
  };


  //show delete-faq modal
  $scope.deleteFaq = function(faq) {
    $scope.faq = faq;
    $('.delete-faq-modal').modal('show');
  }

  //confirm delete faq
  $scope.confirmDeleteFaq = function($event) {
    $scope.faq.entry_id = $scope.campaign.entry_id;
    if ($scope.faq.faq_id) {
      Restangular.one('campaign', $scope.campaign.entry_id).one('faq', $scope.faq.faq_id).customDELETE($scope.faq);
    }
    if ($scope.faq.faq_revision_id) {
      Restangular.one('campaign', $scope.campaign.entry_id).one('faq-revision').customDELETE($scope.faq.faq_revision_id);
    }
    var FAQ = {
      name: '',
      description: '',
      faq_pairs: []
    };
    angular.copy(FAQ, $scope.campaign.faq[0]);
  }

  //show delete-reward modal
  $scope.deleteReward = function(reward, index) {
    $scope.reward = reward;
    $scope.reward.$index = index;
    $('.delete-reward-modal').modal('show');
  };

  $scope.removeShippingOption = function(item, array) {
    angular.forEach(array.shipping, function(value, key) {
      if (item.$$hashKey == value.$$hashKey) {
        array.shipping.splice(key, 1);
      }
    });

    if (item.sub_countries.length > 0) {
      angular.forEach(item.sub_countries, function(value) {
        if (value.shipping_option_id) {
          Restangular.one('campaign', campaign_id).one('pledge-level', array.pledge_level_id).one('shipping-option', value.shipping_option_id).customDELETE();
        }
      })
    } else {

      if (item.shipping_option_id) {
        Restangular.one('campaign', campaign_id).one('pledge-level', array.pledge_level_id).one('shipping-option', item.shipping_option_id).customDELETE();
      }
    }
  };

  //confirm delete reward
  $scope.confirmDeleteReward = function() {
    var rewardsModel = {
      amount: 0,
      name: '',
      description: '',
      pledge_level_id: '',
      shipping_option_id: '',
    };
    if ($scope.reward.pledge_level_id) {
      Restangular.one('campaign', $scope.campaign.entry_id).one('pledge-level', $scope.reward.pledge_level_id).customDELETE();
    }

    if ($scope.rewards_data.length === 1) {
      $scope.rewards_data = [];
    } else {
      $scope.rewards_data.splice($scope.reward.$index, 1)
    }
  };

  $scope.checkShippingOption = function(data) {
    var index = -1; // to hold index of world wide shipping option

    // loop through shipping options list once to see if there is a world wide shipping option
    angular.forEach(data, function(value, key) {
      if (value.shipping_option_type_id == 1) // if there is, mark down its index
      {
        index = key;
        return false; // break for loop
      }
    });

    if (index == -1) // if no world wide option in the list
    {
      angular.forEach(data, function(value, key) { // loop through the list and change the flag

        value['worldwideOption'] = false;
      });
    } else // if there is world wide shipping already in the list
    {
      angular.forEach(data, function(value, key) { // loop through the list and change the flag

        value['worldwideOption'] = true;
      });
    }
  };

  function getNotes() {
    Restangular.one('campaign', $scope.campaign.entry_id).one('note').customGET().then(function(success) {
      if (success) {
        $scope.notes = success[0].value;
      }
    });
  }

  $scope.showSubCountry = function(id, rindex, shipId, shipIndex) {
    var data = {
      country_id: id
    };
    if (shipId == 3) {
      Geolocator.getSubcountriesByCountry(id).then(function(subcountries) {
        // Check which language to show
        if ($scope.native_lookup) {
          for (var i in subcountries) {
            if (subcountries[i].native_name != null) {
              subcountries[i].name = subcountries[i].native_name;
            }
          }
        }
        if (subcountries) {
          $scope.subCountries = [];
          angular.forEach(subcountries, function(val) {
            var sub = {
              cost: 0,
              name: '',
              description: '',
              shipping_option_type_id: 3,
              country_id: id,
              subcountry_id: '',
              worldwideOption: false
            };
            sub.name = val.name;
            sub.subcountry_id = val.subcountry_id;
            $scope.subCountries.push(sub);
          });
          $scope.rewards_data[rindex].shipping[shipIndex].sub_countries = $scope.subCountries;
          $scope.show_sub = true;
        }
      });
    }
  }

  $scope.validLink = function(link) {
    $scope.invalidThumbnailVideo = false;
    $('#campaign-thumbnail-video .select-error').remove();
    $('#campaign-thumbnail-video').removeClass('error');
    if (link) {
      link = link.replace(/https?:\/\//gi, $location.protocol() + '://');
      var encoded_link = btoa(link);
      Restangular.one('campaign/video-check').customGET(encoded_link).then(function(success) {
        var result = success.result;
        if (result == 0) {
          $scope.invalidThumbnailVideo = true;
        }
      });
    } else {
      $scope.invalidThumbnailVideo = false;
    }
  }

  $scope.videoCheck = function(link) {
      $scope.invalidVideo = false;
      $('#campaign-video .select-error').remove();
      $('#campaign-video').removeClass('error');
      if (link) {
        $scope.campaign.video.uri = link.replace(/https?:\/\//gi, $location.protocol() + '://');
        var encoded_link = btoa(link);
        Restangular.one('campaign/video-check').customGET(encoded_link).then(function(success) {
          var result = success.result;
          if (result == 0) {
            $scope.invalidVideo = true;
          }
        });
      } else {
        $scope.invalidVideo = false;
      }
    }
    // Reformat the date string retrieved when grabbing campaign data
    // It's necessary as Firefox doesn't work well with Date.parse when it's '-'' instead of '/'
  function reformatDate(dateString) {
    if (dateString != null) {
      // Using regex to look for all chars that are '-' and replace them with '/'
      dateString = dateString.replace(/\-/g, "/");
      return dateString;
    }
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

  // Translate placeholder text for calender
  $translate(['get_started_funding_startdate_placeholder', 'get_started_funding_enddate_placeholder']).then(function(value) {
    $scope.get_started_funding_startdate_placeholder = value.get_started_funding_startdate_placeholder;
    $scope.get_started_funding_enddate_placeholder = value.get_started_funding_enddate_placeholder;
  });

  $scope.$watchGroup(['campaign.duration_type_id', 'campaign.runtime_days', 'campaign.starts_date_time'], function(values, oldValues) {
    // only watch after finish loading
    if (typeof oldValues[1] == "undefined") {
      return;
    }

    $scope.oldtype_id = angular.copy($scope.campaign.duration_type_id);
    if (!values[0] || values[1] < 0 || !values[2]) {
      // unset campaign.ends
      $scope.campaign.ends_date_time = "";
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
            if (typeof $scope.campaign.starts_date_time === 'string') {
              $scope.campaign.ends_date_time = new Date(fix_date($scope.campaign.starts_date_time) + (days * 86400000));
            } else {
              $scope.campaign.ends_date_time = new Date($scope.campaign.starts_date_time.getTime() + (days * 86400000));
            }

          }
        }
      }
    }
  });

  $scope.$watch('campaign.starts_date_time', function(newValue, oldValue) {
    if (newValue) {
      $('#start-date-field .select-error').remove();
      $('#start-date-field').removeClass('error');
    }
  });

  $scope.$watch('campaign.ends_date_time', function(values) {
    if (values) {
      $('#end-date-field .select-error').remove();
      $('#end-date-field').removeClass('error');
    }
    if ($scope.checkstatus) {
      $scope.checkstatus = false;
      $scope.campaign.starts = convertDate($scope.campaign.starts_date_time);
      // if campaign.end_days also exists
      if ($scope.campaign.starts_date_time) {
        // if valid value
        $scope.campaign.ends = convertDate(values);
        // assign campaign.ends
        $scope.campaign.runtime_days = Math.round((fix_date($scope.campaign.ends_date_time) - fix_date($scope.campaign.starts_date_time)) / 86400000);
        $scope.campaign.duration_type_id = 1;
        var day_option = $translate.instant('Day');
        $('#duration_dtext').text(day_option);
      }
    }
  });

  $scope.$watch('category_ids', function(newValue, oldValue) {
    if (!$scope.allCategories.length) {
      Restangular.one("portal/category").customGET().then(function(success) {
        $scope.allCategories = angular.copy(success);
      }, function(error) {
        console.error("Category Retrieve Error", error);
      });
    }
    if (!isArrayEqual(newValue, oldValue)) {
      if ($('#category-field .select2-choices li').hasClass('select2-search-choice')) {
        $('#category-field .select-error').remove();
        $('#category-field').removeClass('error');
      }

      // Checking if the category id array is not empty
      if (newValue && newValue.length) {
        var subcategory_temp = [];
        for (var i = 0; i < newValue.length; i++) {
          for (var j = 0; j < $scope.allCategories.length; j++) {
            if ($scope.allCategories[j].parent_category_id == newValue[i]) {
              subcategory_temp.push($scope.allCategories[j]);
            }
          }
        }
        $scope.subcategories = angular.copy(subcategory_temp);
        // Manually prefill the data
        $timeout(function() {
          $("#sub-category-field select").val($scope.sub_category_ids.ids).trigger("change")
        }, 0);
      }
    }
  });

  $scope.$watch('sub_category_ids.ids', function(newValue, oldValue) {
    if (newValue != oldValue) {
      if ($('#sub-category-field .select2-choices li').hasClass('select2-search-choice')) {
        $('#sub-category-field .select-error').remove();
        $('#sub-category-field').removeClass('error');
      }
    }
  });

  $scope.$watch('campaignImages', function(newValue, oldValue) {
    if (newValue) {
      $('#featured-img-field .select-error').remove();
      $('#featured-img-field').removeClass('error');
    }
  });

  $scope.$watch('campaign.description', function(newValue, oldValue) {
    if (newValue) {
      $('#campaign-details-field .select-error').remove();
      $('#campaign-details-field').removeClass('error');
    }
  });

  $scope.$watch('campaign.faq[0].description', function(newValue, oldValue) {
    if (newValue) {
      $('#faq-description').removeClass('error');
    }
  });

  // Get new list of users.
  $scope.updateUserList = function(name) {
    // Reset to first page.
    $("input[name='recipient']").removeAttr('value');
    $scope.user_list_page = 1;
    $scope.getPeopleNames(name);
  }

  // Get list of usernames for composing messages
  $scope.getPeopleNames = function(name, append) {
    $scope.append = false;
    if (append !== undefined) {
      $scope.append = append;
    }
    var filters = {
        "filters": {
          "name": name,
        },
        "page": $scope.user_list_page,
        "page_entries": $scope.user_list_page_entries,
      }
      /*Restangular.one("portal/person-public").get(filters).then(function(success, limit){*/
    RestFullResponse.all('portal/person-public').getList(filters).then(function(success) {
      $scope.pagination_info = success.headers();

      if (!$scope.append) {
        $scope.list_users = [];
      }

      for (var i in success.data) {
        if (success.data[i] !== undefined &&
          success.data[i] !== null &&
          typeof success.data[i] == "object") {
          if ("id" in success.data[i]) {
            $scope.list_users.push(success.data[i]);
          }
        }
      }

      // Need timeout or semantic function will not run correctly.
      // Show drop down if more results are found since semantic hides dropdown before api result is returned.
      $timeout(function() {
        if ($scope.list_users.length > 0) {
          $(".recipient.dropdown").dropdown("show");
        }
      }, 0);

    }, function(failed) {
      $scope.list_users = false;
    });
  }

  $scope.setRecipient = function(event) {
    var first_name = event.target.attributes["first-name"].value;
    var last_name = event.target.attributes["last-name"].value;
    var id = event.target.attributes["data-value"].value;

    $scope.campaign.manager_id = id;
    $scope.campaign.settings.campaign_manager_name = first_name + " " + last_name;
  }

  $scope.$watch(function() {
    return $scope.campaign.private
  }, function(newValue, oldValue) {
    if (newValue != oldValue) {
      if (newValue) {
        if ($scope.campaign.settings && !$scope.campaign.settings.original_uri_path) {
          $scope.campaign.settings.original_uri_path = $scope.campaign.uri_path;
        }
        if (!/campaign\/private/.test($scope.campaign.uri_path)) {
          Restangular.one("portal/token").customGET().then(function(success) {
            $scope.campaign.uri_path = "campaign/private/" + success.token;
          });
        }
      } else {
        if ($scope.campaign.settings && $scope.campaign.settings.original_uri_path) {
          $scope.campaign.uri_path = $scope.campaign.settings.original_uri_path;
        }
      }
    }
  });

  $scope.$watch('campaignFundingGoal.value', function(newValue, oldValue) {
    if (newValue != oldValue && newValue) {
      if ($scope.campaign && typeof newValue === "string") {
        $scope.campaign.funding_goal = $rootScope.formatFundingGoal(newValue);
      }
    }
  });

  $scope.$watch('thresholdvalue.value', function(newValue, oldValue) {
    if (newValue != oldValue && newValue) {
      if ($scope.campaign && typeof newValue === "string") {
        $scope.campaign.threshold = $rootScope.formatFundingGoal(newValue);
      }
    }
  });

  function isArrayEqual(arr1, arr2) {
    if (arr1.length != arr2.length) {
      return false;
    }
    for (var i = 0; i < arr1.length; i++) {
      for (var j = 0; j < arr2.length; j++) {
        if (j == arr2.length - 1 && arr1[i] != arr2) {
          return false;
        }
        if (arr1[i] == arr2[j]) {
          continue;
        }
      }
    }
    return true;
  }


});