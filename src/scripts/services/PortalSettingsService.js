app.service('PortalSettingsService', function($cacheFactory, Restangular) {
	var portal_settings = {};
	var cache = $cacheFactory('cached_settings');

	//this function gets settings and then put promise in cache
	// @param refresh - Pass a value to force the function to re-get the data
	this.getSettings = function(refresh) {
		var data = cache.get('portal_settings');
		if (!data || refresh) {
			var request = Restangular.one('portal/setting').customGET();
			cache.put('portal_settings', request);
			return request;
		} else {
			return data;
		}
	};

	// this function reloads settings
	this.reloadSettings = function() {
		// remove cache and call getSettings function
		cache.remove('portal_settings');
		this.getSettings();
	};

	// process promise and return well structured settings object
	this.getSettingsObj = function(refresh) {
		var refreshData = refresh == true ? true : false;
		var request = this.getSettings(refreshData);
		return request.then(function(success) {
			// initiation
			portal_settings.public_setting = {};
			portal_settings.private_setting = {};

			// categorize response data
			angular.forEach(success, function(value) {
				if (value.setting_type_id == 3) {
					portal_settings.public_setting[value.name] = value.value;
				} else if (value.setting_type_id == 1) {
					portal_settings.private_setting[value.name] = value.value;
				}
			});
			return portal_settings;
		});
	};

	this.savePublicSettings = function(data) {
		if (!data) {
			return;
		}
		var request = Restangular.one('portal/setting/public').customPUT(data);
		return request;
	};

	this.savePrivateSettings = function(data) {
		if (!data) {
			return;
		}
		var request = Restangular.one('portal/setting').customPUT(data);
		return request;
	};

	this.deletePublicSettings = function(data){
		if (!data) {
			return;
		}
		var request = Restangular.one('portal/setting/public').customDELETE(data);
		return request;
	};

	this.deletePrivateSettings = function(data){
		if (!data) {
			return;
		}
		var request = Restangular.one('portal/setting').customDELETE(data);
		return request;
	};
});
