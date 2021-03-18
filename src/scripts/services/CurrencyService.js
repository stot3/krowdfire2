//portal currency service
app.service('CurrencyService', function(Restangular, PortalSettingsService) {
	var currency_obj = {};
	currency_obj.getCurrency = function(callback) {
		PortalSettingsService.getSettingsObj().then(function(success){
			callback(success.public_setting.site_campaign_fee_currency);
		});
	}
	return currency_obj;
});