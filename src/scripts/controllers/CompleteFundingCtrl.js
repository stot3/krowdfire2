app.controller('CompleteFundingCtrl', function($translate, CampaignSettingsService, $routeParams, $scope, $rootScope, $timeout, Restangular, CreateCampaignService, $location, StripeService, UserService, PortalSettingsService) {
  $scope.clearMessage = function() {
    $rootScope.floatingMessage = [];
  }
  var msg = [];

  var paras = $location.$$path.split('/');
  $scope.path = paras[1];

  $scope.isLastStep = false;
  if ($scope.path == 'complete-funding') {
    $scope.isLastStep = true;
  }

  //Funding page setup
  $scope.campaign = {};
  $scope.campaignID = $routeParams.campaign_id;
  $scope.nextStepUrl = "campaign-preview/" + $routeParams.campaign_id;
  $scope.backUrl = "profile-setup/" + $routeParams.campaign_id;
  $scope.saddress = {
    street: "",
    mail: "",
    city: "",
    country: ""
  };
  $scope.clientID = null;
  // get the stripe client ID
  StripeService.clientID().then(function(success) {
    if (success) {
      $scope.clientID = success;
    }
  });
  $scope.user = UserService;
  $scope.useremail = $scope.user.email;
  $scope.showCampaignbankForm = false;

  // load portal settings to see which mode is allowed for campaign creation
  PortalSettingsService.getSettingsObj().then(function(success) {

    $scope.$emit("loading_finished");
    $scope.portalsetting = success.public_setting;
    $scope.direct_transaction = success.public_setting.site_campaign_fee_direct_transaction;
    $scope.reward_show = success.public_setting.site_theme_campaign_show_reward_section;
    $scope.displayPrevButtonHeader = success.public_setting.site_campaign_creation_display_previous_button_on_header;
    $scope.moveLaunchButtonStep5 = success.public_setting.site_campaign_creation_launch_campaign_on_step5;
    if (typeof $scope.portalsetting.site_campaign_hide_profile === 'undefined' || $scope.portalsetting.site_campaign_hide_profile === null) {
      $scope.portalsetting.site_campaign_hide_profile = false;
    }
    if (typeof success.public_setting.site_campaign_creation_field_display_stacked !== 'undefined' || success.public_setting.site_campaign_creation_field_display_stacked) {
      $scope.isFieldDisplayStacked = success.public_setting.site_campaign_creation_field_display_stacked;
    } else {
      $scope.isFieldDisplayStacked = false;
    }
    $scope.showProfile = !$scope.portalsetting.site_campaign_hide_profile;
    if (!$scope.showProfile) {
      $scope.backUrl = "rewards/" + $routeParams.campaign_id;
    } else if (!$scope.showProfile && $scope.reward_show) {
      $scope.backUrl = "campaign-setup/" + $routeParams.campaign_id;
    } else {
      $scope.backUrl = "profile-setup/" + $routeParams.campaign_id;
    }
    if (!$scope.showProfile && !$scope.reward_show) {
      $scope.backUrl = "campaign-setup/" + $routeParams.campaign_id;
    }
    // if (!$scope.reward_show) {
    //   $scope.backUrl = "campaign-setup/" + $routeParams.campaign_id;
    // }
    if ($scope.portalsetting.site_enable_advanced_widget) {
      $scope.nextStepUrl = "campaign-widget/" + $routeParams.campaign_id;
    }
    // If using country direct transaction
    if ($scope.portalsetting.site_campaign_country_funding_step) {
      $scope.bank = {};
    }


    if (typeof $scope.portalsetting.site_campaign_country_funding_step !== 'undefined' || $scope.portalsetting.site_campaign_country_funding_step) {
      $scope.showCampaignbankForm = $scope.portalsetting.site_campaign_country_funding_step;
    }

    if ($scope.direct_transaction && UserService.person_type_id !== 1 && !$scope.showCampaignbankForm) {
      $location.path('/404');
    }
  });

  $scope.disallowStripeChanges = function disallowStripeChanges() {
    $scope.enableStripeConnect = false;
    $("#stripeDropdownSelector").addClass("disabled");
  }

  $scope.allowStripeChanges = function disallowStripeChanges() {
    $scope.enableStripeConnect = true;
    $("#stripeDropdownSelector").removeClass("disabled");
  }

  $scope.enableStripeConfirmation = function() {

    $('.enable-stripe-modal').modal({
      onApprove: $scope.allowStripeChanges()
    }).modal('show');

  }

  //Client details
  CreateCampaignService.load($routeParams.campaign_id).then(function(success) {
    $scope.campaign = success;
    //when $scope.portalsetting.site_campaign_raise_modes.pledge_processing.default[$scope.campaign.raise_mode_id] = 1, Post Charge is active
    //when $scope.portalsetting.site_campaign_raise_modes.pledge_processing.default[$scope.campaign.raise_mode_id] = 2, Direct Charge is active
    $scope.isPostProcessing = ($scope.portalsetting.site_campaign_raise_modes.pledge_processing.default[$scope.campaign.raise_mode_id] == 1);
    CampaignSettingsService.setCampaignId($routeParams.campaign_id);
    CampaignSettingsService.processSettings(success.settings);
    $scope.campaign.settings = CampaignSettingsService.getSettings();
    if ($scope.campaign.settings.bank) {
      $scope.bank = $scope.campaign.settings.bank;
    }
    if ($scope.campaign.settings.country_bank_form) {
      $scope.showCampaignbankForm = $scope.showCampaignbankForm && $scope.campaign.settings.country_bank_form;
    }
    $scope.campaigndesc = $scope.name + " " + "-" + $scope.campaign.blurb;

    //check to see if campaign has donations - disable option to change stripe account if donations have already been accepted
    if ($scope.campaign.funded_amount > 0 && $scope.isPostProcessing) {
      //check if changing stripe settings are allowed in Admin Portal
      if (!$scope.portalsetting.site_campaign_restrict_stripe_change) {
        $scope.allowStripeReenable = true;
      } else {
        $scope.allowStripeReenable = false;
      }
      //disable stripe changes
      $scope.disallowStripeChanges();
    } else {
      //allow stripe changes
      $scope.allowStripeChanges();
    }

    Restangular.one('account/business').customGET().then(function(success) {
      $scope.companies = success;
      if (typeof $scope.portalsetting.site_theme_portal_company_name == 'undefined' || typeof $scope.portalsetting.site_theme_portal_company_number == 'undefined') {
        if ($scope.companies.length > 0) {
          $scope.campaignName = $scope.companies[0].name;
        } else {
          $scope.campaignName = $scope.campaign.name;
          $scope.number = "xxxxxxxxxx";
        }
      } else {
        $scope.campaignName = $scope.portalsetting.site_theme_portal_company_name;
        $scope.number = $scope.portalsetting.site_theme_portal_company_number;
      }
    });

  });
  $scope.website = $location.protocol() + "://" + $location.host() + "/campaign/" + $scope.campaignID;
  Restangular.one('account/address').customGET().then(function(success) {
    $scope.address = success;
    if ($scope.address.business) {
      if ($scope.address.business.length > 0) {
        $scope.paddress = $scope.address.business;
      } else {
        $scope.paddress = $scope.address.personal;
      }
    } else {
      $scope.paddress = $scope.address.personal;
    }
    if ($scope.paddress) {

      $scope.saddress = {
        street: $scope.paddress[0].street1,
        mail: $scope.paddress[0].mail_code,
        city: $scope.paddress[0].city,
        country: $scope.paddress[0].code_iso3166_1
      };
    }
  });

  function fundingValidation() {
    var translation = $translate.instant(['complete_funding_bank_errormessage']);

    $('.startfunding-form.ui.form').form({
      stripe_account: {
        identifier: 'stripe_account',
        rules: [{
          type: 'empty',
          prompt: translation.complete_funding_bank_errormessage
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

  $scope.bankValidation = function() {
    var translation = $translate.instant(['complete_funding_bank_errormessage', 'complete_funding_bank_account_confirm_errormessage']);

    $('.startfunding-form.ui.form').form({
      bank_beneficiary: {
        identifier: 'bank_beneficiary',
        rules: [{
          type: 'empty',
          prompt: translation.complete_funding_bank_errormessage
        }]
      },
      // bank_cpf: {
      //   identifier: 'bank_cpf',
      //   rules: [{
      //     type: 'empty',
      //     prompt: translation.complete_funding_bank_errormessage
      //   }]
      // },
      bank_code: {
        identifier: 'bank_code',
        rules: [{
          type: 'empty',
          prompt: translation.complete_funding_bank_errormessage
        }]
      },
      bank_name: {
        identifier: 'bank_name',
        rules: [{
          type: 'empty',
          prompt: translation.complete_funding_bank_errormessage
        }]
      },
      bank_branch: {
        identifier: 'bank_branch',
        rules: [{
          type: 'empty',
          prompt: translation.complete_funding_bank_errormessage
        }]
      },
      bank_account: {
        identifier: 'bank_account',
        rules: [{
          type: 'empty',
          prompt: translation.complete_funding_bank_errormessage
        }]
      },
      bank_account_confirm: {
        identifier: 'bank_account_confirm',
        rules: [{
          type: 'match[bank_account]',
          prompt: translation.complete_funding_bank_account_confirm_errormessage
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

  function checkFunding() {
    $scope.public_settings = $scope.portalsetting;
    $scope.contributionEnabled = $scope.portalsetting.site_campaign_contributions;
    isStepFundingDelayed = $scope.portalsetting.site_theme_campaign_delayed_funding_setup;


    if ($scope.public_settings.site_campaign_country_funding_step && $scope.campaign.settings.country_bank_form) {
      if ($scope.campaign.settings.bank) {
        return "StripePlaceHolder";
      } else {
        return false;
      }
    }

    if ($scope.contributionEnabled) {
      if (isStepFundingDelayed) {
        if ($scope.campaign.ever_published) {
          return $scope.campaign.stripe_account_id;
        }
      } else {
        return $scope.campaign.stripe_account_id;
      }
    }
    return "StripePlaceHolder";
  }

  function hasImage() {
    var bool = false;
    if ($scope.campaign.files) {
      angular.forEach($scope.campaign.files, function(file) {
        if (file.region_id == 3) {
          bool = true;
          return;
        }
      });
    }

    return bool;
  }

  $scope.completionCheck = function() {
    $scope.cpath = $scope.campaign.uri_paths[0].path;

    var reqFieldsCheck;

    $scope.direct_transaction = $scope.portalsetting.site_campaign_fee_direct_transaction;
    $scope.payment_gateway = $scope.portalsetting.site_payment_gateway;
    $scope.public_settings = $scope.portalsetting;

    var campaign = $scope.campaign;
    if ($scope.direct_transaction || ($scope.payment_gateway == 2) || ($scope.public_settings.site_campaign_country_funding_step && $scope.campaign.settings.country_bank_form)) {
      campaign.stripe_account_id = -1;
    }

    // Check if rewards is required and if it is empty or not
    if ($scope.public_settings.site_theme_campaign_show_reward_required) {
      // if rewards is required
      if (campaign.pledges) {
        $scope.rewardsCheck = true;
      } else {
        $scope.rewardsCheck = false;
      }
    } else {
      //rewads is not required
      $scope.rewardsCheck = true;
    }
    if ($scope.in_revision) {
      $scope.confirmNotice = true;
      $scope.loadingText = false;

      if ($scope.isLastStep) {
        window.location.href = "/" + $scope.cpath;
      }
      return;
    }

    $scope.hideCampaignBlurbField = $scope.portalsetting.site_campaign_creation_hide_campaign_blurb_field;
    $scope.hideCampaignCategoryField = $scope.portalsetting.site_campaign_creation_hide_campaign_category_field;
    $scope.hideCampaignImageField = $scope.portalsetting.site_campaign_creation_hide_campaign_image_field;



    // Toggle check for campaign steps with hidden required fields
    if ($scope.hideCampaignBlurbField && $scope.hideCampaignCategoryField && $scope.hideCampaignImageField) {
      reqFieldsCheck = (campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.funding_goal && campaign.currency_id && $scope.rewardsCheck && checkFunding()) ? true : false;
    } else if ($scope.hideCampaignImageField) {
      reqFieldsCheck = (campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.categories && campaign.funding_goal && campaign.currency_id && campaign.description && $scope.rewardsCheck && checkFunding()) ? true : false;
    } else if ($scope.hideCampaignBlurbField) {
      reqFieldsCheck = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.categories && campaign.funding_goal && campaign.currency_id && campaign.description && $scope.rewardsCheck && checkFunding()) ? true : false;
    } else if ($scope.hideCampaignCategoryField) {
      reqFieldsCheck = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.funding_goal && campaign.currency_id && campaign.description && $scope.rewardsCheck && checkFunding()) ? true : false;
    } else {
      reqFieldsCheck = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.categories && campaign.funding_goal && campaign.currency_id && campaign.description && $scope.rewardsCheck && checkFunding()) ? true : false;
    }

    if (reqFieldsCheck) {
      $scope.loadingText = true;

      CreateCampaignService.sendForReview().then(function(success) {
        $scope.confirmNotice = true;
        $scope.loadingText = false;
        if ($scope.isLastStep) {
          window.location.href = "/" + $scope.cpath;
        }

        // $scope.errorNotice = "ERROR MESSAGE";
        // msg = {
        //   'header': "ERROR HEADER"
        // };
        // $rootScope.floatingMessage = msg;
        // $scope.hideFloatingMessage();
        // $scope.loadingText = false;

      }, function(failed) {
        $scope.errorNotice = failed.data.message;
        msg = {
          'header': failed.data.message
        };
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        $scope.loadingText = false;
      });
    } else {
      var steps = [];
      var step1ReqField, step2ReqField, step3ReqField;
      $timeout(function() {
        $translate(['basics', 'details', 'rewards', 'funding', 'uprofile']).then(function(value) {

          // Toggle check for campaign step 1 with hidden required fields
          if ($scope.hideCampaignBlurbField && $scope.hideCampaignCategoryField && $scope.hideCampaignImageField) {
            step1ReqField = (campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.funding_goal && campaign.currency_id) ? true : false;
          } else if ($scope.hideCampaignImageField) {
            step1ReqField = (campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.categories && campaign.funding_goal && campaign.currency_id) ? true : false;
          } else if ($scope.hideCampaignBlurbField) {
            step1ReqField = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.categories && campaign.funding_goal && campaign.currency_id) ? true : false;
          } else if ($scope.hideCampaignCategoryField) {
            step1ReqField = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.funding_goal && campaign.currency_id) ? true : false;
          } else {
            step1ReqField = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.categories && campaign.funding_goal && campaign.currency_id) ? true : false;
          }
          if (!step1ReqField) {
            steps.push(value.basics);
          }
          $scope.showCampaignImageField = $scope.portalsetting.site_campaign_creation_show_campaign_image_field;

          // Toggle check for campaign step 2 with hidden required fields
          if ($scope.showCampaignImageField) {
            step2ReqField = (hasImage()) ? true : false;
          } else {
            step2ReqField = (campaign.description) ? true : false;
          }
          if (!step2ReqField) {
            steps.push(value.details);
          }

          $scope.hideAllCampaignRewardsFields = $scope.portalsetting.site_campaign_creation_hide_campaign_rewards_fields;

          // Toggle check for campaign step 3 with hidden required fields
          if ($scope.hideAllCampaignRewardsFields) {
            step3ReqField = (campaign.description) ? true : false;
          } else {
            step3ReqField = (campaign.pledges && $scope.public_settings.site_theme_campaign_show_reward_required)
          }
          if (step3ReqField) {
            // set error message if no rewards
            steps.push(value.rewards);
          }
          if (!(campaign.stripe_account_id)) {
            steps.push(value.funding);
          }
          if (steps.length > 0) {
            missingText(steps);
          }
        });
      });
    }
  };

  $scope.saveData = function($event) {
    $scope.loadingText = true;
    $scope.backBtnEvent = ($event.currentTarget.id == "campaign-create-prev-button");
    $scope.valcheck = true;
    if ($scope.portalsetting.site_campaign_country_funding_step) {
      //validation for bank form
      $scope.bankValidation();
    } else {
      fundingValidation();
    }
    // Check for error on the .field element
    if ($('.field').hasClass('error')) {
      $('html, body').animate({
        scrollTop: $('.field.error').offset().top + 15
      }, 'fast');
    }

    var currentEle = $event.currentTarget;
    var navigating = $(currentEle).hasClass("save-campaign-button") ? false : true;

    if ($scope.valcheck) {
      msg = {
        'loading': true,
        'loading_message': 'in_progress'
      }
      $rootScope.floatingMessage = msg;
      if ($scope.portalsetting.site_campaign_country_funding_step && $scope.campaign.settings.country_bank_form) {
        $scope.campaign.settings.bank = $scope.bank;
        var data = {
          force_direct_transaction: 1
        };
        Restangular.one('campaign', $scope.campaignID).customPUT(data).then(function(success) {
          CampaignSettingsService.saveSettings($scope.campaign.settings);
          // Checking if user is navigating or not
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();

          if (!$scope.backBtnEvent) {
            $scope.launchCheck();
          }

        });
      } else {
        var data = {
          stripe_account_id: $scope.campaign.stripe_account_id
        };

        Restangular.one('campaign', $scope.campaignID).customPUT(data).then(function(success) {
          CampaignSettingsService.saveSettings($scope.campaign.settings);
          CreateCampaignService.cacheIn(success.plain());
          // Checking if user is navigating or not
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();

          if (!$scope.backBtnEvent) {
            $scope.launchCheck();
          }
        });
      }
    } else {
      // Need to fill out required fields before moving on
      $event.preventDefault();
      msg = {
        'header': 'fail_message_save_changes_button'
      };
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      $scope.loadingText = false;
      return false;
    }
  };

  $scope.launchCheck = function() {
    if ($scope.portalsetting.site_campaign_creation_launch_campaign_on_step5) {
      $scope.completionCheck();
    }
  }

  $scope.selectStripeId = function(id) {
    $scope.campaign.stripe_account_id = id;
  }

  // -------------------------------------------------------------
  // Stripe
  // -------------------------------------------------------------
  // load in campaign
  CreateCampaignService.load($routeParams.campaign_id).then(function(success) {
    $scope.campaign = success; // assign it to the scope variable
    $scope.campaign.settings = CampaignSettingsService.getSettings();
    // load stripe account
    Restangular.one('campaign', $routeParams.campaign_id).one('stripe-account').customGET().then(function(success) {
      var stripe_accounts = success.plain();
      if (UserService.id == $scope.campaign.managers[0].id || UserService.person_type_id == 1) {
        // if current user is the campaign manager
        StripeService.getAccount().then(function(success) {
          // get array of connected stripe accounts
          if (success.length) {
            // assign data if it exists
            $scope.stripeAccounts = success.plain();
            $scope.stripeConnected = true;
            if (!stripe_accounts.length && $scope.stripeAccounts.length) {
              $scope.campaign.stripe_account_id = $scope.stripeAccounts[0].id;
            } else if (stripe_accounts.length) {
              $scope.campaign.stripe_account_id = stripe_accounts[0].id;
              $scope.stripeAccounts.unshift(stripe_accounts[0]);
            }
            if ($rootScope.isConnectWithStripe) {
              $timeout(function() {
                $("button.save-campaign-button").click();
              }, 100);
            }
          } else {
            if (stripe_accounts.length) {
              // if there are accounts but current user is not creator
              $scope.stripeAccounts = stripe_accounts;
              if (stripe_accounts.length) {
                $scope.stripeConnected = true;
                $scope.campaign.stripe_account_id = stripe_accounts[0].id;
                if ($rootScope.isConnectWithStripe) {
                  $timeout(function() {
                    $("button.save-campaign-button").click();
                  }, 100);
                }
              }
            }
          }
        });
      } else {
        // if there are accounts but current user is not creator
        $scope.stripeAccounts = stripe_accounts;
        if (stripe_accounts.length) {
          $scope.stripeConnected = true;
          $scope.campaign.stripe_account_id = stripe_accounts[0].id;
          if ($rootScope.isConnectWithStripe) {
            $timeout(function() {
              $("button.save-campaign-button").click();
            }, 100);
          }
        }
      }
    });
  });
  // check for phone number
  Restangular.one('account/phone-number').customGET().then(function(success) {
    if (success.business) {
      $scope.number = success.business[0].number;
    } else if (success.personal) {
      $scope.number = success.personal[0].number;
    }
  });

  function missingText(array) {
    $translate(['steps', 'stepsmessage', 'step', 'stepmessage']).then(function(value) {
      if (array.length > 1) {
        $scope.steps = value.steps;
        $scope.stepsmessage = value.stepsmessage;
        $scope.missingFieldsText = $scope.steps + "\"" + array.toString() + "\"" + $scope.stepsmessage;
      } else {
        $scope.step = value.step;
        $scope.stepmessage = value.stepmessage;
        $scope.missingFieldsText = $scope.step + "\"" + array.toString() + "\"" + $scope.stepmessage;
      }
      msg = {
        'header': $scope.missingFieldsText,
      };
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();

    });
  }

  $scope.stateParam = StripeService.generateStateParam('/complete-funding/' + $scope.campaignID);
  $scope.stripeRedirect = StripeService.redirectURL();
  $scope.setRedirectUrl = function() {
    var baseUrl = "https://connect.stripe.com/oauth/authorize?";
    var params = {
      "response_type": "code",
      "client_id": $scope.clientID.client_id,
      "account": $scope.clientID.client_id,
      "stripe_user": {
        "product_description": $scope.campaigndesc,
        "business_name": $scope.campaignName,
        "first_name": $scope.user.first_name,
        "last_name": $scope.user.last_name,
        "country": $scope.saddress.country,
        "phone_number": $scope.number,
        "url": $scope.website,
        "email": $scope.useremail,
        "street_address": $scope.saddress.street,
        "city": $scope.saddress.city,
        "zip": $scope.saddress.mail
      },
      "scope": "read_write",
      "redirect_uri": $scope.stripeRedirect,
      "state": $scope.stateParam
    }
    // Express connection mode
    if($scope.portalsetting.stripe_express_mode) {
      baseUrl = "https://connect.stripe.com/express/oauth/authorize?";
      params = {
        "response_type": "code",
        "client_id": $scope.clientID.client_id,
        "account": $scope.clientID.client_id,
        "stripe_user": {
          "product_description": $scope.campaigndesc,
          "business_name": $scope.campaignName,
          "first_name": $scope.user.first_name,
          "last_name": $scope.user.last_name,
          "url": $scope.website,
          "email": $scope.useremail,
        },
        "scope": "read_write",
        "redirect_uri": $scope.stripeRedirect,
        "state": $scope.stateParam
      }
    }
    var finalUrl = baseUrl + $.param(params);
    window.location.href = finalUrl;
  }
});