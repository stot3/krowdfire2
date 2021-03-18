app.controller('NavbarCtrl', function ($location, $route, $scope, $rootScope, Restangular, UserService, API_URL, RequestCacheService, PortalSettingsService, $translatePartialLoader, $translate, $timeout) {

  $scope.user = UserService;
  $scope.pages = [];
  $scope.logo_url = "";
  $scope.headerMenu = [];
  $scope.logoUrl = "";
  $scope.showLogoPlaceholder = false;
  $scope.$location = $location;

  PortalSettingsService.getSettingsObj().then(function (success) {
    $scope.public_setting = success.public_setting;
    // get site logo
    var logo_url = success.public_setting.site_logo.path_external;
    $scope.payment_gateway = success.public_setting.site_payment_gateway;
    $scope.logoUrl = logo_url ? API_URL.url + '/image/site_logo_320x80/' + logo_url : "images/placeholder-images/placeholder_logo.png";
    if (typeof success.public_setting.site_logo_link == 'undefined') {
      $scope.site_logo_link = '/';
    } else {
      $scope.site_logo_link = success.public_setting.site_logo_link;
    }
    // retrieve menu item ids, then retrieve pages info
    $scope.headerMenu = success.public_setting.site_menu_header
    $scope.hideStartCampaignPage = success.public_setting.site_campaign_creation_hide_start_page;
    $scope.mode_allowed = success.public_setting.site_campaign_raise_modes.allowed;
    $rootScope.checkstart = $scope.mode_allowed;


    if ($scope.hideStartCampaignPage && typeof $scope.hideStartCampaignPage !== 'undefined') {
      // initiate the campaign
      $scope.campaign = {};
      $scope.campaign.profile_type_id = 1;
      $scope.campaign.raise_mode_id = success.public_setting.site_campaign_raise_modes.default;
    }

    RequestCacheService.getPage().then(function (success) {
      for (var i = 0; i < $scope.headerMenu.length; i++) {
        for (var j = 0; j < success.length; j++) {
          if ($scope.headerMenu[i].id == success[j].id) {
            if (success[j].path == '/') {
              $scope.headerMenu[i]['name'] = success[j].name;
              $scope.headerMenu[i]['path'] = '/';
            } else if ($scope.headerMenu[i].id) {
              $scope.headerMenu[i]['name'] = success[j].name;
              $scope.headerMenu[i]['path'] = success[j].path;

            }

            // Change start path to getstarted step 1 path if toggle is enabled
            if ($scope.hideStartCampaignPage && typeof $scope.hideStartCampaignPage !== 'undefined') {
              if ($scope.headerMenu[i].name == 'Start') {
                $scope.headerMenu[i].path = 'getstarted'
              }
            }
          }
        }
      }

      if ($scope.public_setting.site_admin_campaign_management_only) {
        for (var i = 0; i < $scope.headerMenu.length; i++) {
          if ($scope.headerMenu[i].name == "Start" && UserService.person_type_id != 1) {
            $scope.headerMenu.splice(i, 1);
            break;
          }
        }
      }

      $scope.hideCampaignNav = $scope.public_setting.site_admin_campaign_management_only && $scope.user.person_type_id != 1;

      // Make a POST request and redirect to getstarted path if toggle is enabled
      if ($scope.hideStartCampaignPage && typeof $scope.hideStartCampaignPage !== 'undefined') {
        var navElements = document.querySelectorAll('.menu .item');

        for (var n = 0; n < navElements.length; n++) {
          if (navElements[n].text == 'Start') {
            navElements[n].onclick = function (e) {
              e.preventDefault();
              for (var i = 0; i < $scope.headerMenu.length; i++) {
                if ($scope.headerMenu[i].name == 'Start') {
                  $scope.campaign.name = 'unnamed_campaign';
                  if ($scope.user.isLoggedIn()) {
                    Restangular.one('campaign').customPOST($scope.campaign).then(function (response) {
                      var id = response.entry_id;
                      // promote user to be campaign manager
                      var data = {
                        campaign_manager: 1,
                      };
                      UserService.updateUserData(data);


                      // //redirect
                      $location.path('/getstarted/' + id);
                    }, function (error) { // if there is an error
                      $scope.errorMsg = error.data.message; // get the error message
                    });
                  } else {
                    $timeout(function () {
                      $location.path('/login');
                    });
                  }
                }
              }
            }

          }
        }
      }
      $scope.navItem = function(){
        $route.reload();
      }
    });

    $scope.stickyMenu = success.public_setting.site_theme_sticky_menu;
    $scope.enabledContribution = success.public_setting.site_campaign_contributions;


  });

  // page reload
  $scope.reload = function () {
    $route.reload();

  }

  // submenu show on hover
  $timeout(function () {
    $('.menu-items .menu-dropdown').dropdown({
      on: 'hover'
    });
  });

  $scope.checkForSubMenu = function(page) {
    if(page.hasOwnProperty('subpages')){
      if(page.subpages.length > 0) {
        return true;
      }
    }
    return false;
  }
    // toggle mobile side bar
  $scope.closeMobileSidebar = function () {
    $('#mobile-sidebar').sidebar('hide');
    $('body').removeClass('mobile-sidebar-no-scroll');
  }
  $scope.showMobileSidebar = function () {
    if ($('#mobile-sidebar').sidebar('is visible')) {
      $('#mobile-sidebar').sidebar('hide');
    } else {
      $('#mobile-sidebar').sidebar('show');
      $('body').addClass('mobile-sidebar-no-scroll');
    }
  }
});
