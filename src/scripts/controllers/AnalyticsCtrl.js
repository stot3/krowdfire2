app.controller('AnalyticsCtrl', function($scope, $sce, PortalSettingsService) {
  PortalSettingsService.getSettingsObj().then(function(success) {
    if (success.public_setting.site_analytics_code && typeof success.public_setting.site_analytics_code === "string") {
      $scope.analyticsCode = $sce.trustAsHtml(success.public_setting.site_analytics_code);
    }
  });
});
