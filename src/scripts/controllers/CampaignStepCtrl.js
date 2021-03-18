app.controller('CampaignStepCtrl', function($location, CampaignSettingsService, Restangular, $routeParams, $scope, CreateCampaignService, PortalSettingsService, UserService, $rootScope) {
  // check the current path and set active class to the current step
  // campaign entry id is used in href
  $scope.verified = false;

  var paras = $location.$$path.split('/');
  $scope.path = paras[1];
  $scope.campaign_entry_id = $routeParams.campaign_id;
  $scope.thirdStepPath = '';
  if ($routeParams.revision_id) {
    $scope.revisionIdParam = '/?revision_id=' + $routeParams.revision_id;
  }
  $scope.uid = UserService.person_type_id;

  if ($rootScope.campaignInEditing && $rootScope.campaignInEditing.id == parseInt($scope.campaign_entry_id)) {
    $scope.campaign = $rootScope.campaignInEditing;
    getSiteSettings();
  } else {
    getSiteSettings();
  }



  // load portal settings to see which mode is allowed for campaign creation
  function getSiteSettings() {
    PortalSettingsService.getSettingsObj().then(function(success) {
      $scope.public_settings = success.public_setting;
      $scope.direct_transaction = success.public_setting.site_campaign_fee_direct_transaction;
      $scope.contributionEnabled = success.public_setting.site_campaign_contributions;
      $scope.reward_show = success.public_setting.site_theme_campaign_show_reward_section;
      $scope.payment_gateway = success.public_setting.site_payment_gateway;
      $scope.isStepFundingDelayed = success.public_setting.site_theme_campaign_delayed_funding_setup;
      $scope.enableCampaignRevisions = success.public_setting.site_campaign_enable_campaign_revisions;
      $scope.isStepRewardDelayed = success.public_setting.site_theme_campaign_delayed_reward_setup;
      $scope.hideAllCampaignRewardsFields = success.public_setting.site_campaign_creation_hide_campaign_rewards_fields;
      $scope.showCampaignDescription = success.public_setting.site_campaign_creation_show_campaign_description_field;
      $scope.hideCampaignImageField = success.public_setting.site_campaign_creation_hide_campaign_image_field;
      $scope.hideCampaignBlurbField = success.public_setting.site_campaign_creation_hide_campaign_blurb_field;
      $scope.hideCampaignCategoryField = success.public_setting.site_campaign_creation_hide_campaign_category_field;
      $scope.showCampaignImageField = success.public_setting.site_campaign_creation_show_campaign_image_field;
      $scope.moveLaunchButtonStep5 = success.public_setting.site_campaign_creation_launch_campaign_on_step5;
      $scope.bankFormEnabled = $scope.public_settings.site_campaign_country_funding_step;

      if (typeof $scope.public_settings.site_campaign_hide_profile == 'undefined' || $scope.public_settings.site_campaign_hide_profile == null) {
        $scope.public_settings.site_campaign_hide_profile = false;
      }

      //Get Current Campaign Information
      CreateCampaignService.load($scope.campaign_entry_id).then(function(success) {
        $rootScope.campaignInEditing = success;
        $scope.campaign = success;
        CampaignSettingsService.setCampaignId($scope.campaign_entry_id);
        CampaignSettingsService.processSettings(success.settings);
        $scope.campaign.settings = CampaignSettingsService.getSettings();

        Restangular.one('campaign', $scope.campaign.id).one('stripe-account').customGET().then(function(stripe) {
          if (stripe.length)
            $scope.stripe_account_id = stripe[0].id;
        });
        if (hasImage() && $scope.campaign.name && $scope.campaign.raise_mode_id && $scope.campaign.profile_type_id && $scope.campaign.blurb && $scope.campaign.categories && $scope.campaign.funding_goal && $scope.campaign.currency_id && $scope.campaign.description) {
          $scope.isPreviewDone = true;
        } else {
          $scope.isPreviewDone = false;
        }
        $scope.decideStepsNeeded();
      });
      
      if (($scope.hideAllCampaignRewardsFields) && ($scope.showCampaignDescription)) {
        $scope.thirdStepPath = 'story';
      } else {
        $scope.thirdStepPath = 'rewards';
      }
    });
  }

  $scope.decideStepsNeeded = function() {

    $scope.profile_show = !$scope.public_settings.site_campaign_hide_profile || $scope.uid == 1;
    $scope.master_reward_show = false;

    if ($scope.reward_show) {
      $scope.master_reward_show = true;
    }
    if ($scope.isStepRewardDelayed && $scope.campaign.entry_status_id != 2) {
      $scope.master_reward_show = false;
    }

    if ($scope.public_settings.site_enable_advanced_widget) {
      if ($scope.payment_gateway == 2) {
        if ($scope.master_reward_show) {
          $scope.step_class = 'six column';
          if (!$scope.profile_show) {
            $scope.step_class = 'five column';
          }
        } else {
          $scope.step_class = 'five column';
          if (!$scope.profile_show) {
            $scope.step_class = 'four column';
          }
        }
      } else if (($scope.direct_transaction && !$scope.bankFormEnabled) || !$scope.contributionEnabled || $scope.isStepFundingDelayed && !$scope.campaign.ever_published) {
        if ($scope.master_reward_show) {
          $scope.step_class = 'six column';
          if (!$scope.profile_show) {
            $scope.step_class = 'five column';
          }
        } else {
          $scope.step_class = 'five column';
          if (!$scope.profile_show) {
            $scope.step_class = 'four column';
          }
        }
      } else {
        if ($scope.master_reward_show) {
          $scope.step_class = 'seven column';
          if (!$scope.profile_show) {
            $scope.step_class = 'six column';
          }
        } else {
          $scope.step_class = 'six column';
          if (!$scope.profile_show) {
            $scope.step_class = 'five column';
          }
        }
      }
    } else {
      if ($scope.payment_gateway == 2) {
        if ($scope.master_reward_show) {
          $scope.step_class = 'five column';
          if (!$scope.profile_show) {
            $scope.step_class = 'four column';
          }
        } else {
          $scope.step_class = 'four column';
          if (!$scope.profile_show) {
            $scope.step_class = 'three column';
          }
        }
      } else if (($scope.direct_transaction && !$scope.bankFormEnabled) || !$scope.contributionEnabled || $scope.isStepFundingDelayed && !$scope.campaign.ever_published) {
        if ($scope.master_reward_show) {
          $scope.step_class = 'five column';
          if (!$scope.profile_show) {
            $scope.step_class = 'four column';
          }
        } else {
          $scope.step_class = 'four column';
          if (!$scope.profile_show) {
            $scope.step_class = 'three column';
          }
        }
      } else {
        if ($scope.master_reward_show) {
          $scope.step_class = 'six column';
          if (!$scope.profile_show) {
            $scope.step_class = 'five column';
          }
        } else {
          $scope.step_class = 'five column';
          if (!$scope.profile_show) {
            $scope.step_class = 'four column';
          }
        }
      }
    }
  };
  $scope.validateBasicStep = function() {
    if ($scope.hideCampaignBlurbField && $scope.hideCampaignCategoryField && $scope.hideCampaignImageField) {
      return $scope.campaign.name && $scope.campaign.funding_goal && $scope.campaign.starts && $scope.campaign.ends;
    } else if ($scope.hideCampaignBlurbField) {
      return $scope.campaign.name && $scope.campaign.funding_goal && hasImage() && $scope.campaign.starts && $scope.campaign.ends;
    } else if ($scope.hideCampaignImageField) {
      return $scope.campaign.name && $scope.campaign.blurb && $scope.campaign.funding_goal && $scope.campaign.starts && $scope.campaign.ends && $scope.campaign.categories;
    } else if ($scope.hideCampaignCategoryField) {
      return $scope.campaign.name && $scope.campaign.blurb && $scope.campaign.funding_goal && $scope.campaign.starts && $scope.campaign.ends && hasImage();
    } else if (!$scope.campaign.ends) {
      return $scope.campaign.name && $scope.campaign.blurb && $scope.campaign.funding_goal && $scope.campaign.starts && hasImage() && $scope.campaign.categories;
    } else {
      return $scope.campaign.name && $scope.campaign.blurb && $scope.campaign.funding_goal && $scope.campaign.starts && $scope.campaign.ends && hasImage() && $scope.campaign.categories;
    }
  };

  $scope.validateDetailStep = function() {
    if ($scope.showCampaignImageField) {
      return hasImage();
    } else if($scope.public_settings.site_campaign_enable_campaign_bio) {
      if($scope.campaign && $scope.campaign.settings)
        return $scope.campaign.settings.bio_enable;
    } else {
      return $scope.campaign.description;
    }
  };

  $scope.validateRewardStep = function() {
    if (($scope.hideAllCampaignRewardsFields) && ($scope.showCampaignDescription)) {
      return $scope.campaign.description;
    } else {
      if ($scope.public_settings.site_theme_campaign_show_reward_required) {
        if ($scope.campaign.pledges) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }
  };
  


  $scope.validateProfileStep = function() {
    if (typeof $scope.public_settings.site_verification == "undefined") {
      $scope.public_settings.site_verification = { toggle: false};
    }
    // personal profile check
    if ($scope.campaign.profile_type_id === 1) {
      if($scope.public_settings.site_verification.toggle){
        // check for verified
        return $rootScope.verified;
      } else {
        return true;
      }
    } else {
      if ($scope.campaign.business_organizations && $scope.campaign.business_organizations.length) {
        if($scope.public_settings.site_verification.toggle){
          // check for verified
          return $rootScope.verified;
        } else {
          return true;
        }
      }
    }
  };

  $scope.validateFundingStep = function() {
    if ($scope.campaign.settings) {
      if ($scope.campaign.settings.country_bank_form) {
        if ($scope.campaign.settings.bank) {
          return true;
        } else {
          return false;
        }
      } else {
        if ($scope.direct_transaction) {
          return true;
        } else {
          if ($scope.stripe_account_id) {

            return true;
          } else {
            return $scope.campaign.stripe_account_id;
          }
        }
      }
    }
  };

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

});