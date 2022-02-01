app.controller('EmbedViewsCtrl', function ($scope, $rootScope, $routeParams, Restangular, RESOURCE_REGIONS, $translate, $translatePartialLoader, PortalSettingsService) {
  $translatePartialLoader.addPart("explore");
  $translate.refresh();

  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  $rootScope.nav_disabled = true;
  $rootScope.footer_disabled = true;
  var campaign_id = $routeParams.campaign_id;

  PortalSettingsService.getSettingsObj().then(function (success) {
    $scope.public_settings = success.public_setting;
    $scope.isISODate = success.public_setting.site_theme_campaign_display_iso_date;
  });

  Restangular.one('campaign').customGET(campaign_id, {
    use_path_lookup: $routeParams.privatepath ? 1 : 0,
    path: $routeParams.privatepath ? $routeParams.privatepath.substring(1) : null
  }).then(function (success) {
    $scope.campaign = success.plain();
    $scope.$emit("loading_finished");
  });

  $scope.getTimeZoneAbbr = function (campaign) {
    if (campaign.campaign_started == 'f') {
      campaign.timezoneText = moment().tz(campaign.timezone).zoneAbbr();
    }
  }

  $scope.dateInPast = function (value, sec) {
    if (sec == 0 || sec == "00" || sec < 0) {
      return true;
    } else {
      return false;
    }
  }

});