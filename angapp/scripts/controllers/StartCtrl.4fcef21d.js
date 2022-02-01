app.controller("StartCtrl",["$location","CampaignSettingsService","$scope","$rootScope","CreateCampaignService","Restangular","UserService","StripeService","CurrencyService","PortalSettingsService","$translatePartialLoader","$translate",function($location,CampaignSettingsService,$scope,$rootScope,CreateCampaignService,Restangular,UserService,StripeService,CurrencyService,PortalSettingsService,$translatePartialLoader,$translate){UserService.isLoggedIn()||$location.path("/"),UserService.getPaidGuard().then((function(data){1!=data&&$location.path("/")})).catch((function(err){console.error(err),$location.path("/")})),$scope.campaign={},$scope.campaign_country="",$scope.campaign.profile_type_id=1;UserService.isLoggedIn();StripeService.clientID().then((function(success){success&&(success.client_id||($scope.stripe_not_set=!0))}),(function(failed){$scope.stripe_not_set=!0})),CurrencyService.getCurrency((function(success){success?1==success.length&&($scope.campaign.currency_id=success[0].currency_id):$scope.stripe_not_set=!0})),Restangular.one("account/stripe/application").customGET().then((function(success){$scope.stripe_application_account=success.plain()}),(function(failure){$scope.stripe_application_account=!1})),PortalSettingsService.getSettingsObj().then((function(success){$scope.direct_transaction=success.public_setting.site_campaign_fee_direct_transaction,$scope.mode_allowed=success.public_setting.site_campaign_raise_modes.allowed,$scope.campaign.raise_mode_id=success.public_setting.site_campaign_raise_modes.default,$rootScope.checkstart=$scope.mode_allowed,$scope.payment_gateway=success.public_setting.site_payment_gateway,$scope.payment_processing=success.public_setting.payment_setting_enabled,$scope.public_settings=success.public_setting,$scope.$emit("loading_finished")})),$scope.getStripeCountry=function(){return Restangular.one("account/stripe/country").customGET().then((function(success){$scope.stripeCountries=success;var country_array=[];(void 0!==$scope.public_settings.site_campaign_country_funding_step||$scope.public_settings.site_campaign_country_funding_step)&&(angular.forEach($scope.stripeCountries,(function(v,k,arr){-1!=$scope.public_settings.site_campaign_country_ids.indexOf(v.country_id.toString())&&country_array.push(v)})),$scope.stripeCountries=country_array)}))},$scope.getStripeCountry(),$.fn.form.settings.rules.stripeCustomValidation=function(value,validate){return 3==$scope.public_setting.site_payment_gateway||$scope.stripe_application_account&&$scope.stripe_application_account.publishable_key&&$scope.stripe_application_account.client_id},$scope.startValidation=function(){var translation=$translate.instant(["start_errormessage"]);$(".start-campaign.ui.form").form({title:{identifier:"title",rules:[{type:"empty",prompt:translation.start_errormessage}]}},{inline:!0,onSuccess:function(){$scope.valcheck=$scope.valcheck&&!0},onFailure:function(){$scope.valcheck=$scope.valcheck&&!1}}).form("validate form")},$scope.startCountryValidation=function(){var translation=$translate.instant(["start_country_errormessage"]);$(".start-campaign.ui.form").form({stripe_country:{identifier:"stripe_country",rules:[{type:"empty",prompt:translation.start_country_errormessage}]}},{inline:!0,onSuccess:function(){$scope.valcheck=$scope.valcheck&&!0},onFailure:function(){$scope.valcheck=$scope.valcheck&&!1}}).form("validate form")},$scope.validateStripePaymentSettings=function(){var translation=$translate.instant(["start_errormessage","start_stripeerrormessage"]);$(".start-campaign.ui.form").form({title:{identifier:"title",rules:[{type:"stripeCustomValidation",prompt:translation.start_stripeerrormessage}]}},{inline:!0,onSuccess:function(){$scope.valcheck=$scope.valcheck&&!0},onFailure:function(){$scope.valcheck=$scope.valcheck&&!1}}).form("validate form")},$scope.createCampaign=function(){$scope.valcheck=!0,$scope.startValidation(),$scope.public_settings.site_campaign_country_funding_step&&$scope.startCountryValidation(),($scope.payment_gateway&&1==$scope.payment_processing&&$scope.stripe_application_account&&!$scope.stripe_application_account.publishable_key&&!$scope.stripe_application_account.client_id||0==$scope.stripe_application_account)&&$scope.validateStripePaymentSettings(),$scope.valcheck&&(CreateCampaignService.cacheIn($scope.campaign),Restangular.one("campaign").customPOST($scope.campaign).then((function(response){var id=response.entry_id;UserService.updateUserData({campaign_manager:1}),$scope.campaign_country&&($scope.campaign.settings={country:$scope.campaign_country},$scope.public_settings.site_campaign_country_ids.indexOf($scope.campaign_country.country_id.toString())>-1?$scope.campaign.settings.country_bank_form=!0:$scope.campaign.settings.country_bank_form=!1,CampaignSettingsService.setCampaignId(id),CampaignSettingsService.processSettings(response.settings),CampaignSettingsService.saveSettings($scope.campaign.settings)),$location.path("/getstarted/"+id)}),(function(error){$scope.errorMsg=error.data.message})))},$scope.setStripeCountry=function($event){$scope.campaign_country=$event}}]);