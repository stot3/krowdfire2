app.service('twitterWidgetService', function(Restangular, API_URL, $timeout, PortalSettingsService) {
	var twitterObj = {};
	twitterObj.widget_code = "";
	twitterObj.getWidgetCode = function(callback) {
		PortalSettingsService.getSettingsObj().then(function(success){
			twitterObj.widget_code = success.public_setting.site_widget_twitter_widget.code;
			if (twitterObj.widget_code && twitterObj.widget_code.length) {
				callback.call();
			}
		});
	}
	return twitterObj;
});