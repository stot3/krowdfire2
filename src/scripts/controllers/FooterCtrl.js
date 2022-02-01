app.controller('FooterCtrl', function ($browser, $http, $scope, $rootScope, Restangular, $timeout, $sce, RequestCacheService, PortalSettingsService, $translate, $translatePartialLoader) {

  // ThemeService.themeColor();
  $scope.leftMenu = [];
  $scope.middleMenu = [];
  $scope.rightMenu = [];
  $scope.social_links = {};
  $scope.categories = [];
  $scope.left_category = [];
  $scope.middle_category = [];
  $scope.right_category = [];
  $scope.pages = [];
  $scope.footer_text = {};
  $scope.show_footer = true;

  // Get current year for Copyright
  var today = new Date;
  $scope.current_year = today.getFullYear();

  RequestCacheService.getPage().then(function (success) {
    $scope.pages = success;
    var length = $scope.pages.length;
    for (var i = 0; i < length; i++) {
      if ($scope.pages[i].id == 1 || $scope.pages[i].path == "/") {
        $scope.pages[i].path = "";
        break;
      }
    }
  });

  // a2a twitter configuration:
  $translate(['footer_page_twitter_share_message_pledge', 'footer_page_twitter_share_message_campaign']).then(function (values) {
    a2a_config.localize = {
      share_message_pledge_page: values["footer_page_twitter_share_message_pledge"],
      share_message_campaign_page: values["footer_page_twitter_share_message_campaign"]
    };
  });

  // get portal settings from service
  PortalSettingsService.getSettingsObj().then(function (success) {

    // count the valid social media icons
    var count = 0;
    $rootScope.checkfooter = success;
    $scope.leftMenu = success.public_setting.site_menu_footer.left;
    $scope.rightMenu = success.public_setting.site_menu_footer.right;
    $scope.footer_text = success.public_setting.site_footer_text;
    $scope.social_links = success.public_setting.site_social_media_links;
    $scope.hasCategory = success.public_setting.site_theme_category_display_footer;
    $scope.footerCustomHtmlBlock = success.public_setting.site_footer_custom_html_block;
    angular.forEach($scope.social_links, function (value, key) {
      if (value.url.length > 0) {
        count++;
      }
    });
    if (count === 0) {
      $scope.show_footer = false;
    }

    // wordpress and twitter
    $scope.wp_uri = success.public_setting.site_widget_wp_api;
    $scope.twitter_widget = success.public_setting.site_widget_twitter_widget;
  });

  Restangular.one('portal/setting').getList().then(
    function (success) {
      $scope.public_settings = {};
      angular.forEach(success, function (value) {
        if (value.setting_type_id == 3) {
          $scope.public_settings[value.name] = value.value;
        }
      });
      
      $scope.enableCookeConsent = $scope.public_settings.site_enable_cookie_consent;
      
      if ($scope.public_settings.site_theme_category_display_footer) {
        var categoryParam = {
          "active_only": 0
        }
        categoryParam.active_only = !$scope.public_settings.site_theme_category_display_with_campaigns_only ? 1 : 0;
        Restangular.one("portal").customGET("category", categoryParam)
          .then(function (categories) {
            $scope.categories = categories;
            for (var i = 0; i < $scope.categories.length; i++) {
              if (i < 4) {
                $scope.left_category.push($scope.categories[i]);
              } else if (i < 9) {
                $scope.middle_category.push($scope.categories[i]);
              } else if (i < 14) {
                $scope.right_category.push($scope.categories[i]);
              }
            }
          });
      }
    }
  );

  // Takes a link data to decide how path should look like
  $scope.findPageAndLink = function (link) {
    // First check id, because only pages have id's
    if (link.id != undefined) {
      for (var i = 0; i < $scope.pages.length; i++) {
        // If the page id equals to the link id
        if ($scope.pages[i].id == link.id) {
          // Checking if the first character of the page path is not "/" since this function gets called many times
          // Would like to avoid infinite concatenation
          if ($scope.pages[i].id == 1) {
            $scope.pages[i].path = $browser.baseHref();
          }
          return $scope.pages[i];
        }
      }
    }
    // Else we check if its name is not undefined since only custom link object has name but it doesn't have id
    // We simply return it
    else if (link.name != undefined) {
      return link;
    }
    return {};
  }
});
