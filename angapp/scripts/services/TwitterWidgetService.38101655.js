app.service("twitterWidgetService",["Restangular","API_URL","$timeout","PortalSettingsService",function(Restangular,API_URL,$timeout,PortalSettingsService){var twitterObj={widget_code:"",getWidgetCode:function(callback){PortalSettingsService.getSettingsObj().then((function(success){twitterObj.widget_code=success.public_setting.site_widget_twitter_widget.code,twitterObj.widget_code&&twitterObj.widget_code.length&&callback.call()}))}};return twitterObj}]);