app.controller('WidgetCtrl', function($q, $routeParams, $rootScope, $location, $scope, $timeout, $translate, Geolocator, UserService, Restangular, CreateCampaignService, PortalSettingsService, API_URL) {
  $scope.campaignSettings = {};
  $scope.campaign_id = $routeParams.campaign_id;
  $scope.apihost = API_URL.url;
  $scope.widgetURL = $location.protocol() + "://" + $location.host() + "/widget.js";
  $scope.backUrl = "/complete-funding/" + $routeParams.campaign_id;
  $scope.nextStepUrl = "/campaign-preview/" + $routeParams.campaign_id;
  $scope.user = UserService;
  $scope.fontSection = '';
  $scope.tabColors = '';
  $scope.clearMessage = function() {
    $rootScope.floatingMessage = [];
  };
  var msg = [];

  PortalSettingsService.getSettingsObj().then(function(success) {
    $scope.public_settings = success.public_setting;
    $scope.contributionEnabled = success.public_setting.site_campaign_contributions;
    $scope.isStepFundingDelayed = success.public_setting.site_theme_campaign_delayed_funding_setup;
    $scope.reward_show = success.public_setting.site_theme_campaign_show_reward_section;
    $scope.displayPrevButtonHeader = success.public_setting.site_campaign_creation_display_previous_button_on_header;

    if (typeof $scope.public_settings.site_campaign_hide_profile == 'undefined' || $scope.public_settings.site_campaign_hide_profile == null) {
      $scope.public_settings.site_campaign_hide_profile = false;
    }
    $scope.showProfile = !$scope.public_settings.site_campaign_hide_profile;

    CreateCampaignService.load($routeParams.campaign_id).then(function(success) {
      $scope.campaign = success;
      angular.forEach($scope.campaign.settings, function(value, index) {
        var setting_name = value.name;
        var setting_value = value.value;
        $scope.campaign[setting_name] = setting_value;
      });
      if (!$scope.contributionEnabled || $scope.isStepFundingDelayed && !$scope.campaign.ever_published) {
        if ($scope.showProfile) {
          $scope.backUrl = "/profile-setup/" + $routeParams.campaign_id;
        } else if ($scope.reward_show) {
          $scope.backUrl = "/rewards/" + $routeParams.campaign_id;
        } else {
          $scope.backUrl = "/campaign-setup/" + $routeParams.campaign_id;
        }
      }
    });
    $scope.$emit("loading_finished");
  });

  $scope.pickFontSection = function (section) {
      $scope.fontSection = section;
  }

    $scope.pickTabColors = function (section) {
      $scope.tabColors = section;
  }

  function setDefaultWidgetSettings() {
    if (!$scope.campaignSettings.widget_settings) {
      $scope.campaignSettings.widget_settings = {
        "themecolor": "00B5AD",
        "fontcolor": "313131",
        "fontfamily": "Helvetica"
      };
    }

    if (!$scope.campaignSettings.widget_settings.backersfontcolor) {
        $scope.campaignSettings.widget_settings.backersfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.blurbfontcolor) {
        $scope.campaignSettings.widget_settings.blurbfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.campaignfontcolor) {
        $scope.campaignSettings.widget_settings.campaignfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.commentsfontcolor) {
        $scope.campaignSettings.widget_settings.commentsfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.contactfontcolor) {
        $scope.campaignSettings.widget_settings.contactfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.creatorfontcolor) {
        $scope.campaignSettings.widget_settings.creatorfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.faqfontcolor) {
        $scope.campaignSettings.widget_settings.faqfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.fundingfontcolor) {
        $scope.campaignSettings.widget_settings.fundingfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.paymentfontcolor) {
        $scope.campaignSettings.widget_settings.paymentfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.profilefontcolor) {
        $scope.campaignSettings.widget_settings.profilefontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.rewardsfontcolor) {
        $scope.campaignSettings.widget_settings.rewardsfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.streamsfontcolor) {
        $scope.campaignSettings.widget_settings.streamsfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.tabbackgroundcolor) {
        $scope.campaignSettings.widget_settings.tabbackgroundcolor = "FFFFFF"
    }
    if (!$scope.campaignSettings.widget_settings.tabselectedfontcolor) {
        $scope.campaignSettings.widget_settings.tabselectedfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.tabunselectedfontcolor) {
        $scope.campaignSettings.widget_settings.tabunselectedfontcolor = "000000"
    }
    if (!$scope.campaignSettings.widget_settings.topfontcolor) {
        $scope.campaignSettings.widget_settings.topfontcolor = "000000"
    }
  }

  Restangular.one("campaign", $routeParams.campaign_id).customGET("setting")
    .then(function(success) {
      if (success && success.length) {
        for (var index in success.plain()) {
          $scope.campaignSettings[success.plain()[index].name] = success.plain()[index].value;
        }
        setDefaultWidgetSettings();
      }
    })
    .then(function(failed) {
      setDefaultWidgetSettings();
    });

  function saveMsg() {
    //$scope.clearMessage();
    msg = {
      'header': "success_message_save_changes_button",
    };
    $rootScope.floatingMessage = msg;
    $scope.hideFloatingMessage();
  }

  $scope.campaign = {};

  $scope.saveData = function($event) {
    //$scope.clearMessage();
    var currentEle = $event.currentTarget;
    var navigating = $(currentEle).hasClass("save-campaign-button") ? false : true;

    Restangular.one("campaign/" + $routeParams.campaign_id, "setting").customPUT($scope.campaignSettings);

    // Checking if user is navigating or not
    if (!navigating) {
      msg = {
        'header': "success_message_save_changes_button",
      };
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    } else {
      $timeout(function() {
        $('html,body').animate({
          scrollTop: 0
        }, 800);
      });
    }
  };

  jscolor.init();
});