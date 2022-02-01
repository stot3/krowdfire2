// Service for getting and setting campaign settings
app.service('CampaignSettingsService', function (Restangular) {
  var campaign_id = 0;
  var campaign_settings = {};

  this.getSettings = function () {
    return campaign_settings;
  };

  // Set settings from array, should use processSettings if raw request data.
  this.setSettings = function (settings) {
    campaign_settings = settings;
  };

  this.setCampaignId = function (id) {
    campaign_id = id;
  };

  // Process raw data from request settings.
  this.processSettings = function (settings) {
    if (settings === undefined) {
      return;
    }
    var processed = {};
    // loop and categorize the response data. put them into object
    angular.forEach(settings, function (value) {
      processed[value.name] = value.value;
    });

    this.setSettings(processed);
  };

  // Request to get settings
  this.retreiveSettings = function (id) {
    if (id !== undefined) {
      this.setCampaignId(id);
    }
    var request = Restangular.one("campaign", campaign_id).customGET("setting");
    return request;
  };

  // Save settings
  this.saveSettings = function (data) {
    if (!data) {
      return;
    }
    var request = Restangular.one("campaign", campaign_id).one("setting").customPUT(data);
    return request;
  };

  this.deleteSettings = function (data) {
    if (!data) {
      return;
    }
    var request = Restangular.one("campaign", campaign_id).customDELETE("setting", data);
    return request;
  };
});
