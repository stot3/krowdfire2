app.controller('ProfileCtrl', function($scope, $routeParams, $rootScope, Restangular, $translatePartialLoader, $translate, RestFullResponse, RESOURCE_REGIONS, PortalSettingsService, $timeout) {
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  var person_id = $routeParams.person_id;
  $scope.loadingBacked = false;
  $scope.loadingCreated = false;
  $filter = {
    'filters': {
      'person_id': person_id.toString(),
    }
  }
  $scope.person = {};
  $scope.createdCampaigns = [];
  $scope.backedCampaigns = [];
  var public_setting;
  var native_lookup;
  var msg;

  $scope.organization_name = {};

  //================================ Response message ==============================
  $scope.successMessage = [];
  $scope.errorMessage = [];
  clearMessage = function() {
    $scope.successMessage = [];
    $scope.errorMessage = [];
  }

  $scope.createdCampaignFilter = {
    'filters': {
      'manager': person_id,
    },
    "page_entries": 12,
    "page_limit": 100,
    "pagination": {},
    "page": null
  }
  $scope.backedCampaignFilter = {
    'filters': {
      'backer': person_id,
    },
    "page_entries": 12,
    "page_limit": 100,
    "pagination": {},
    "page": null
  }

  PortalSettingsService.getSettingsObj().then(function(success) {
    public_setting = success.public_setting;
    $scope.public_settings = success.public_setting;
    native_lookup = public_setting.site_theme_shipping_native_lookup;
    $scope.removeContactUser = success.public_setting.site_campaign_contact_user;
    $scope.isHideCampaignCardCreatorCategory = success.public_setting.site_campaign_hide_campaign_card_creator_or_category;
    $scope.infiniteScroller = success.public_setting.site_infinite_scroller;

    if (typeof $scope.infiniteScroller === 'undefined' || !$scope.infiniteScroller) {
      $scope.infiniteScroller = {
        explore: false,
        featured: false,
        recent: false,
        profile: false
      }
    }

    if ($scope.public_settings.site_campaign_enable_organization_name) {
      Restangular.one('portal/person/attribute?filters={"person_id":"' + person_id + '"}').customGET().then(function(success) {
        $scope.organization_name.value = success[0].attributes['organization_name'];
        $scope.organization_name.ein = success[0].attributes['ein'];
      });
    }

    Restangular.one('account/person', person_id).customGET().then(
      function(success) {
        $scope.person = success;
        if (native_lookup) {
          success.addresses.forEach(function(value, index) {
            value = getNativeName(value);
          });
        }
        $rootScope.checkperson = $scope.person;
        $scope.$emit("loading_finished");
      },
      function(failure) {
        $scope.$emit("loading_finished");
      });
  });

  $scope.loadMoreBackedCampaigns = function() {
    $scope.loadingBacked = true;
    $scope.backedCampaignFilter.page_entries += 12;
    RestFullResponse.all('campaign').getList($scope.backedCampaignFilter).then(
      function(success) {
        if (success.length === 0) {
          $scope.noCampaignBacked = true;
        }
        $scope.backedCampaigns = success.data;
        var headers = success.headers();
        $scope.backedCampaignFilter.pagination.currentpage = headers['x-pager-current-page'];
        $scope.backedCampaignFilter.pagination.numpages = headers['x-pager-last-page'];
        $scope.backedCampaignFilter.pagination.nextpage = headers['x-pager-next-page'];
        $scope.backedCampaignFilter.pagination.pagesinset = headers['x-pager-pages-in-set'];
        $scope.backedCampaignFilter.pagination.totalentries = headers['x-pager-total-entries'] ? headers['x-pager-total-entries'] : 0;
        $scope.backedCampaignFilter.pagination.entriesperpage = headers['x-pager-entries-per-page'];

        $scope.loadingBacked = false;
        setTimeout(function() {
          $('html, body').animate({
            scrollTop: $("#backedDiscovered").offset().top + $("#backedDiscovered").outerHeight(true) - $(window).height()
          }, 1500);
        }, 1000);
      },
      function(failure) {
        $scope.noCampaignBacked = true;
      }
    )
  }

  $scope.loadMoreCreatedCampaigns = function() {
    $scope.loadingCreated = true;
    $scope.createdCampaignFilter.page_entries += 12;
    RestFullResponse.all('campaign').getList($scope.createdCampaignFilter).then(
      function(success) {
        $scope.createdCampaigns = success.data;
        var headers = success.headers();
        $scope.createdCampaignFilter.pagination.currentpage = headers['x-pager-current-page'];
        $scope.createdCampaignFilter.pagination.numpages = headers['x-pager-last-page'];
        $scope.createdCampaignFilter.pagination.nextpage = headers['x-pager-next-page'];
        $scope.createdCampaignFilter.pagination.pagesinset = headers['x-pager-pages-in-set'];
        $scope.createdCampaignFilter.pagination.totalentries = headers['x-pager-total-entries'] ? headers['x-pager-total-entries'] : 0;
        $scope.createdCampaignFilter.pagination.entriesperpage = headers['x-pager-entries-per-page'];
        ($scope.createdCampaigns);
        $scope.loadingCreated = false;
        setTimeout(function() {
          $('html, body').animate({
            scrollTop: $("#createdDiscovered").offset().top + $("#createdDiscovered").outerHeight(true) - $(window).height()
          }, 1500);
        }, 1000);
      }
    )
  }

  var updateCreateCampaignList = function() {
    RestFullResponse.all('campaign').getList($scope.createdCampaignFilter).then(
      function(success) {
        $scope.createdCampaigns = success.data;
        var headers = success.headers();
        $scope.createdCampaignFilter.pagination.currentpage = headers['x-pager-current-page'];
        $scope.createdCampaignFilter.pagination.numpages = headers['x-pager-last-page'];
        $scope.createdCampaignFilter.pagination.nextpage = headers['x-pager-next-page'];
        $scope.createdCampaignFilter.pagination.pagesinset = headers['x-pager-pages-in-set'];
        $scope.createdCampaignFilter.pagination.totalentries = headers['x-pager-total-entries'] ? headers['x-pager-total-entries'] : 0;
        $scope.createdCampaignFilter.pagination.entriesperpage = headers['x-pager-entries-per-page'];
        ($scope.createdCampaigns);
      },
      function(failure) {

      }
    )
  }
  var updateBackedCampaignList = function() {
    RestFullResponse.all('campaign').getList($scope.backedCampaignFilter).then(
      function(success) {
        if (success.length === 0) {
          $scope.noCampaignBacked = true;
        }
        $scope.backedCampaigns = success.data;
        var headers = success.headers();
        $scope.backedCampaignFilter.pagination.currentpage = headers['x-pager-current-page'];
        $scope.backedCampaignFilter.pagination.numpages = headers['x-pager-last-page'];
        $scope.backedCampaignFilter.pagination.nextpage = headers['x-pager-next-page'];
        $scope.backedCampaignFilter.pagination.pagesinset = headers['x-pager-pages-in-set'];
        $scope.backedCampaignFilter.pagination.totalentries = headers['x-pager-total-entries'] ? headers['x-pager-total-entries'] : 0;
        $scope.backedCampaignFilter.pagination.entriesperpage = headers['x-pager-entries-per-page'];
      },
      function(failure) {
        $scope.noCampaignBacked = true;
      }
    )
  }

  updateCreateCampaignList();
  updateBackedCampaignList();

  $scope.updateCreateCampaignList = function() {
    updateCreateCampaignList();
  }

  $scope.updateBackedCampaignList = function() {
    updateBackedCampaignList();
  }

  //Menu Tabs
  $('#user-profile-tabs .menu-tabs .item')
    .tab({
      context: $('#user-profile-tabs')
    });

  function getNativeName(addressObj) {
    var name = "";
    if (addressObj.country_native_name != null) {
      name += addressObj.country_native_name;
      addressObj.country = addressObj.country_native_name;
    } else {
      name += addressObj.country;
    }
    if (addressObj.subcountry_native_name != null) {
      name += " " + addressObj.subcountry_native_name;
      addressObj.subcountry = addressObj.subcountry_native_name;
    } else {
      name += " " + addressObj.subcountry;
    }
    if (addressObj.city_native_name != null && addressObj.city != "Other") {
      name += ", " + addressObj.city_native_name;
      addressObj.city = addressObj.city_native_name;
    } else if (addressObj.city != "Other") {
      name += ", " + addressObj.city;
    } else {
      addressObj.city = "";
    }
    addressObj.city_full = name;
    addressObj.name = name;
    return addressObj;
  }
});