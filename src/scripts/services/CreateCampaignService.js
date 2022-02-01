app.service('CreateCampaignService', function ($q, $location, Restangular, PortalSettingsService) {
	var Campaign = {
		campaign: {}
	};
	var portalsetting;
	PortalSettingsService.getSettingsObj().then(function (success) {
		portalsetting = success.public_setting;
	});
	Campaign.load = function (campaignID) {
		return Restangular.one('campaign', campaignID).customGET().then(function (success) {
			Campaign.cacheIn(success.plain());
			return success;
		}, function (failure) {
			$location.path('404');
		});

		// return Restangular.one('campaign', campaignID).customGET().then(function(success) {
		// 	return Campaign.copy(success.plain());
		// }, function(failure) {
		// 	$location.path('404');
		// });
	};

	Campaign.cacheIn = function (campaignData) {
		angular.forEach(campaignData, function (value, key) {
			Campaign[key] = value;
		});
	}

	// Campaign.copy = function(campaignData) {
	// 	// caching campaign data
	// 	angular.copy(campaignData, Campaign.campaign);
	// 	return Campaign.campaign;
	// };

	Campaign.save = function (campaign) {
		Campaign.copy(campaign);
		Restangular.one('campaign', campaign.id).customPUT(campaign);
	};


	// change campaign status id to 10 (being reviewed)
	Campaign.sendForReview = function () {


		if (portalsetting.site_payment_gateway == 1) {
			var data = {
				'entry_status_id': 10,
			}
		} else if (portalsetting.site_payment_gateway == 3) {
			var data = {
				'entry_status_id': 10,
				'use_paypal': 1
			}
		} else {
			var data = {
				'entry_status_id': 10,
				'use_widgetmakr': 1
			}
		}
		return Restangular.one('campaign', Campaign.entry_id).customPUT(data).then(function (success) {
			// clear notes
			Restangular.one('campaign', Campaign.entry_id).one('note').customGET().then(function (notes) {
				if (notes) {
					angular.forEach(notes, function (value) {
						Restangular.one('campaign', Campaign.entry_id).one('note', value.id).customPUT({
							value: {
								name: ''
							}
						});
					});
				}
			});
		}); // send update request
	};
	return Campaign;

});