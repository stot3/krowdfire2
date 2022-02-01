app.controller('CampaignManagementCtrl', function($location, $scope, $rootScope, RESOURCE_REGIONS, CampaignSettingsService, $translatePartialLoader, $translate, Restangular, $timeout, RestFullResponse, CreateCampaignService, $routeParams, UserService, RequestCacheService, ngQuickDateDefaults) {
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  $scope.user = UserService;
  window.a = $scope;
  $scope.campaign = {};
  $scope.campaignStatus = {};
  $scope.categories = {};
  $scope.toggle = {};
  $scope.sortOrFiltersCampaign = {
    "sort": '',
    "filters": {
      "category": {},
      "location": '',
      "entry_status_id": '',
      "manager": UserService.person_id,
    },
    "page_entries": 10,
    "page_limit": 100,
    "pagination": {},
    "page": null
  };
  processParams();
  $scope.days_text = "days ago";
  $scope.day_text = "day ago";
  $scope.rdays_text = "days to go";
  $scope.rday_text = "day to go";
  $scope.hours_text = "hours ago";
  $scope.hour_text = "hour ago";
  $scope.rhours_text = "hours to go";
  $scope.rhour_text = "hour to go";
  $scope.minutes_text = "minutes ago";
  $scope.minute_text = "minute ago";
  $scope.rminutes_text = "minutes to go";
  $scope.rminute_text = "minute to go";
  $scope.dateInPast = function(value, sec) {
    if (sec == 0 || sec == "00" || sec < 0) {
      return true;
    } else {
      return false;
    }
  }

  // Get Settings
  Restangular.one('portal/setting/').customGET().then(function(success) {
    $scope.$emit("loading_finished");
    $scope.public_settings = {};
    angular.forEach(success, function(value) {
      if (value.name == "site_campaign_state_hide") {
        $scope.public_settings[value.name] = value.value;
      }
      if (value.name == "site_campaign_progress_bar_hide") {
        $scope.public_settings[value.name] = value.value;
      }
      if (value.name == "site_campaign_exclude_shipping_cost") {
        $scope.public_settings[value.name] = value.value;
        return;
      }
      if (value.name == 'site_campaign_management') {
        $scope.public_settings[value.name] = value.value;
      }
    });
    if (typeof $scope.public_settings.site_campaign_management === 'undefined' || $scope.public_settings.site_campaign_management == null) {
      $scope.public_settings.site_campaign_management = {
        transaction_hide: false,
        pause_hide: false
      }
    }
    filterCampaign($scope.sortOrFiltersCampaign);
  });

  $scope.filterCampaign = function() {
    filterCampaign($scope.sortOrFiltersCampaign);
  }

  //======================== response message ================================
  $scope.successMessage = [];
  $scope.errorMessage = [];
  $scope.totalentry = [10, 25, 40, 55, 70];

  function backToTop() {
    //scroll to top
    $('html,body').animate({
      scrollTop: 0
    });
  }

  RequestCacheService.getCategory().then(function(success) {
    $scope.categories = success;

  });

  getCampaignStatus();

  function getCampaignStatus() {
    Restangular.one('campaign').all('status').getList().then(function(success) {
      $scope.campaignStatus = success;

    });
  }

  //================================
  //      CAMPAIGN MANAGEMENT
  //================================
  // Checks if the Date object is correct. Especially important when calculating something like end date where start date + xxxx
  // may be so far away it becomes no longer a valid Date object
  function isValidDate(d) {
    if (Object.prototype.toString.call(d) !== "[object Date]") {
      return false;
    }
    return !isNaN(d.getTime());
  }

  function convertDate(d) {
    var value = d;
    var date = new Date(value);
    // if the date is not able to be converted
    if (!isValidDate(date)) {
      // get the year, month, day
      var year = value.substring(0, 4);
      var month = value.substring(5, 7);
      var day = value.substring(8, 10);
      // do a pure convertion
      return new Date(year, month - 1, day);
    }
    return d;
  }

  function fix_date(s) {
    if (typeof s == 'string') {
      return Date.parse(s);
    } else {
      if (s)
        return s.getTime();
      return;
    }
  }

  $scope.check = function() {
    $scope.checkstatus = true;
  }

  $scope.campaignManagerHasEndDate = function(campaign) {
    if(campaign.ends_date_time == undefined) {
      return false;
    }
    return true;
  }

  $scope.duration_type = [{
    id: '1',
    type: 'duration_type_day'
  }, {
    id: '2',
    type: 'duration_type_week'
  }, {
    id: '3',
    type: 'duration_type_month'
  }, {
    id: '4',
    type: 'duration_type_year'
  }];

  $scope.durationTypeSelected = function(typeID) {
    $scope.extendingCampaign.duration_type_id = typeID;
  };

  $scope.openExtendCampaignModal = function(campaign) {
    if (campaign) {
      $scope.extendingCampaign = campaign;
      $('.extend-campaign-modal').modal('show');
    }
  }
  $scope.extendCampaignEndDate = function() {
    // Increment current end date
    $scope.extendingCampaign.ends_date_time =  new Date($scope.extendingCampaign.ends_date_time);
    $scope.extendingCampaign.ends_date_time.setTime($scope.extendingCampaign.ends_date_time.getTime() + $scope.extendEndDays * 86400000);

    var month = $scope.extendingCampaign.ends_date_time.getMonth();
    if (month >= 9) {
      month = $scope.extendingCampaign.ends_date_time.getMonth() + 1;
    } else {
      month = $scope.extendingCampaign.ends_date_time.getMonth() + 1;
      month = "0" + month;
    }
    var day = $scope.extendingCampaign.ends_date_time.getDate();
    if (day > 9) {} else {

      day = "0" + day;
    }
    var hours = $scope.extendingCampaign.ends_date_time.getHours();
    if (hours > 9) {} else {
      hours = "0" + hours;
    }
    var mins = $scope.extendingCampaign.ends_date_time.getMinutes();
    if (mins > 9) {} else {
      mins = "0" + mins;
    }
    var datestring = $scope.extendingCampaign.ends_date_time.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + mins + ":00";
    $scope.extendingCampaign.ends = datestring;
    $scope.extendingCampaign.ends = $scope.extendingCampaign.ends.replace(/\//g, "-");

    if($scope.user.portal_admin == 1) {
      // Approve campaign
      $scope.extendingCampaign.entry_status_id = 2;
    }
    if($scope.user.campaign_manager == 1) {
      $scope.extendingCampaign.entry_status_id = 10;
    }

    Restangular.one('campaign', $scope.extendingCampaign.id).customPUT($scope.extendingCampaign).then(function(success) {
      // Update current campaign list
      angular.forEach($scope.campaigns, function(campaign, key) {
        if(campaign.id == $scope.extendingCampaign.id) {
          $scope.campaigns[key] = success;
        }
      });
      msg = {
        'header': 'campaign_management_extend_campaign_date_success',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      $('.extend-campaign-modal').modal('hide');
    });
  }
  $scope.setCampaignEndDate = function() {
    if (typeof $scope.extendingCampaign.starts_date_time == "string") {
      $scope.extendingCampaign.starts_date_time = new Date($scope.extendingCampaign.starts_date_time);
    }
    if ($scope.extendingCampaign.starts_date_time && typeof $scope.extendingCampaign.starts_date_time === "object") {
      if ($scope.extendingCampaign.starts_date_time.toString().length > 19) {
        var month = $scope.extendingCampaign.starts_date_time.getMonth();
        if (month >= 9) {
          month = $scope.extendingCampaign.starts_date_time.getMonth() + 1;
        } else {
          month = $scope.extendingCampaign.starts_date_time.getMonth() + 1;
          month = "0" + month;
        }
        var day = $scope.extendingCampaign.starts_date_time.getDate();
        if (day > 9) {} else {

          day = "0" + day;
        }
        var hours = $scope.extendingCampaign.starts_date_time.getHours();
        if (hours > 9) {} else {
          hours = "0" + hours;
        }
        var mins = $scope.extendingCampaign.starts_date_time.getMinutes();
        if (mins > 9) {} else {
          mins = "0" + mins;
        }
        var datestring = $scope.extendingCampaign.starts_date_time.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + mins + ":00";
        $scope.extendingCampaign.starts = datestring;
      } else {
        $scope.extendingCampaign.starts = $scope.extendingCampaign.starts_date_time.substring(0, 16) + ":00";
      }
    }
    if (typeof $scope.extendingCampaign.ends_date_time == "string") {
      $scope.extendingCampaign.ends_date_time = new Date($scope.extendingCampaign.ends_date_time);
    }
    var month = $scope.extendingCampaign.ends_date_time.getMonth();
    if (month >= 9) {
      month = $scope.extendingCampaign.ends_date_time.getMonth() + 1;
    } else {
      month = $scope.extendingCampaign.ends_date_time.getMonth() + 1;
      month = "0" + month;
    }
    var day = $scope.extendingCampaign.ends_date_time.getDate();
    if (day > 9) {} else {

      day = "0" + day;
    }
    var hours = $scope.extendingCampaign.ends_date_time.getHours();
    if (hours > 9) {} else {
      hours = "0" + hours;
    }
    var mins = $scope.extendingCampaign.ends_date_time.getMinutes();
    if (mins > 9) {} else {
      mins = "0" + mins;
    }
    var datestring = $scope.extendingCampaign.ends_date_time.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + mins + ":00";
    $scope.extendingCampaign.ends = datestring;
    $scope.extendingCampaign.ends = $scope.extendingCampaign.ends.replace(/\//g, "-");

    if($scope.user.portal_admin == 1) {
      // Approve campaign
      $scope.extendingCampaign.entry_status_id = 2;
    }
    if($scope.user.campaign_manager == 1) {
      $scope.extendingCampaign.entry_status_id = 10;
    }

    Restangular.one('campaign', $scope.extendingCampaign.id).customPUT($scope.extendingCampaign).then(function(success) {
      // Update current campaign list
      angular.forEach($scope.campaigns, function(campaign, key) {
        if(campaign.id == $scope.extendingCampaign.id) {
          $scope.campaigns[key] = success;
        }
      });
      msg = {
        'header': 'campaign_management_extend_campaign_date_success',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      $('.extend-campaign-modal').modal('hide');
    });
  }

  $scope.$watchGroup(['extendingCampaign.duration_type_id', 'extendingCampaign.runtime_days', 'extendingCampaign.starts_date_time'], function(values, oldValues) {
    // only watch after finish loading
    if (typeof oldValues[1] == "undefined") {
      return;
    }

    $scope.oldtype_id = angular.copy($scope.extendingCampaign.duration_type_id);
    if (!values[0] || values[1] < 0 || !values[2]) {
      // unset extendingCampaign.ends
      $scope.extendingCampaign.ends_date_time = "";
    }

    if (values[2]) {
      if (values[1]) {
        if (values[0]) {
          var ip = parseInt(values[0]);
          var days;
          switch (ip) {
            case 1:
              days = values[1];
              break;
            case 2:
              days = values[1] * 7;
              break;
            case 3:
              days = values[1] * 30;
              break;
            case 4:
              days = values[1] * 365;
              break;
            default:
              days = 0;
          }

          if (isValidDate(new Date(days * 86400000))) {
            if (typeof $scope.extendingCampaign.starts_date_time === 'string') {
              $scope.extendingCampaign.ends_date_time = new Date(fix_date($scope.extendingCampaign.starts_date_time) + (days * 86400000));
            } else {
              $scope.extendingCampaign.ends_date_time = new Date($scope.extendingCampaign.starts_date_time.getTime() + (days * 86400000));
            }

          }
        }
      }
    }
  });

  $scope.$watch('extendingCampaign.ends_date_time', function(values) {
    if (values) {
      $('#end-date-field .select-error').remove();
      $('#end-date-field').removeClass('error');
    }
    if ($scope.checkstatus) {
      $scope.checkstatus = false;
      $scope.extendingCampaign.starts = convertDate($scope.extendingCampaign.starts_date_time);
      // if extendingCampaign.end_days also exists
      if ($scope.extendingCampaign.starts_date_time) {
        // if valid value
        $scope.extendingCampaign.ends = convertDate(values);
        // assign extendingCampaign.ends
        $scope.extendingCampaign.runtime_days = Math.round((fix_date($scope.extendingCampaign.ends_date_time) - fix_date($scope.extendingCampaign.starts_date_time)) / 86400000);
        $scope.extendingCampaign.duration_type_id = 1;
        var day_option = $translate.instant('Day');
        $('#duration_dtext').text(day_option);
      }
    }
  });

  $scope.campaignManagerTransactionHide = function(campaign) {
    if ($scope.public_settings.site_campaign_management.transaction_hide) {
      return ($scope.user.person_type_id == 1 && campaign.funded_amount) ? true : false;
    }
    if (!campaign.funded_amount) {
      return false;
    }
    return true;
  }
  $scope.campaignManagerPauseHide = function(campaign) {
    if ($scope.public_settings.site_campaign_management.pause_hide) {
      return ($scope.user.person_type_id == 1 && campaign.entry_status_id == 2) ? true : false;
    }
    if (campaign.entry_status_id != 2) {
      return false;
    }
    return true;
  }

  $scope.getTransecStats = function(campaignID) {
    $location.path('campaign-manager/transactions/' + campaignID);
    Restangular.one('campaign/' + campaignID + '/stats').customGET(null, {
      summary: 1
    }).then(function(success) {});
    Restangular.one('campaign/' + campaignID + '/stats').customGET(null, {
      summary: 0
    }).then(function(success) {});
  }

  /* this function changes the campaign status */
  $scope.changeCampaignStatus = function(campaign, statusID) {
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var changes = {
      entry_status_id: statusID,
    };

    Restangular.one('campaign', campaign.id).customPUT(changes).then(function(success) {
      $scope.delayUpdate(); // delay refresh
    }, function(failed) {});
  };

  $scope.delayUpdate = function() {
    $timeout(function() {
      filterCampaign($scope.sortOrFiltersCampaign);
      getCampaignStatus();
      msg = {
        'header': "action_success"
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }, 800);
  };

  $scope.updateSortCampaign = function(sort) {
    $scope.sortOrFiltersCampaign.sort = sort ? sort : "";
    filterCampaign($scope.sortOrFiltersCampaign);
  }

  $scope.updateFiltersCampaignCategory = function(category) {
    $scope.sortOrFiltersCampaign.filters.category = category
    filterCampaign($scope.sortOrFiltersCampaign);

  }

  $scope.updateFiltersCampaignStatus = function(statusID) {
    $scope.sortOrFiltersCampaign.filters.entry_status_id = statusID;
    filterCampaign($scope.sortOrFiltersCampaign);
  };

  $scope.updateFiltersCampaignOrder = function(order) {
    $scope.sortOrFiltersCampaign.sort = order;
    filterCampaign($scope.sortOrFiltersCampaign);
  };
  $scope.checkentry = function() {
    $scope.entries = $('#searchbtn').dropdown('get value');
    $scope.sortOrFiltersCampaign.page_entries = $scope.entries;
    filterCampaign($scope.sortOrFiltersCampaign);
  }

  function filterCampaign(filter) {
    if (filter.campaign_id) {
      return RestFullResponse.one('campaign', filter.campaign_id).customGET().then(function(success) {
        // update url with the filters
        updateURL();
        $scope.campaigns = [success.data.plain()];
        var headers = success.headers();
        $scope.sortOrFiltersCampaign.pagination.entriesperpage = 1;
        // Disable capture button if needed
        angular.forEach($scope.campaigns, function(campaign) {
          //Minus total_shipping_cost from funded amount if setting is toggled.
          if (typeof $scope.public_settings.site_campaign_exclude_shipping_cost !== 'undefined' && $scope.public_settings.site_campaign_exclude_shipping_cost) {
            campaign.funded_amount = campaign.funded_amount - campaign.total_shipping_cost;
          }
          $scope.tooLateForCapture(campaign);
        });
      });
    } else {
      return RestFullResponse.all('campaign').getList(filter).then(function(success) {
        // update url with the filters
        updateURL();
        $scope.campaigns = success.data;
        $rootScope.checkstart = true;
        var headers = success.headers();
        $scope.sortOrFiltersCampaign.pagination.currentpage = headers['x-pager-current-page'];
        $scope.sortOrFiltersCampaign.pagination.numpages = headers['x-pager-last-page'];
        $scope.sortOrFiltersCampaign.pagination.nextpage = headers['x-pager-next-page'];
        $scope.sortOrFiltersCampaign.pagination.pagesinset = headers['x-pager-pages-in-set'];
        $scope.sortOrFiltersCampaign.pagination.totalentries = headers['x-pager-total-entries'];
        $scope.sortOrFiltersCampaign.pagination.entriesperpage = headers['x-pager-entries-per-page'];
        // Disable capture button if needed
        angular.forEach($scope.campaigns, function(campaign) {
          // Process campaign setting
          CampaignSettingsService.processSettings(campaign.settings);
          campaign.settings = CampaignSettingsService.getSettings();
          $scope.tooLateForCapture(campaign);
          //Minus total_shipping_cost from funded amount if setting is toggled.
          if (typeof $scope.public_settings.site_campaign_exclude_shipping_cost !== 'undefined' && $scope.public_settings.site_campaign_exclude_shipping_cost) {
            campaign.funded_amount = campaign.funded_amount - campaign.total_shipping_cost;
          }
          $scope.progressHide = $scope.public_settings.site_campaign_progress_bar_hide;
          campaign.settings.master_progress_bar_hide = false;
          if ($scope.progressHide) {
            campaign.settings.master_progress_bar_hide = true;
          } else {
            campaign.settings.master_progress_bar_hide = false;
          }
          if (typeof campaign.settings.progress_bar_hide !== 'undefined') {
            campaign.settings.master_progress_bar_hide = campaign.settings.progress_bar_hide;
          }
        });
        // reset 'check all'
        $('.campaign-table thead tr .check-all input').prop('checked', false);
      });
    }
  }

  $scope.tooLateForCapture = function(campaign) {
    //Today's date and formatting
    var today_date = new Date();
    var offset = today_date.getTimezoneOffset();
    today_date.setMinutes(today_date.getMinutes() - offset);
    today_date = today_date.toISOString().substring(0, 19).replace("T", " ");

    //End Time's date and formatting
    var end_date = new Date(campaign.ends_date_time);
    end_date.setDate(end_date.getDate() + 5);
    end_date = end_date.toISOString().substring(0, 19).replace("T", " ");
    if (today_date > end_date) {
      campaign.too_late_capture = true;
    } else {
      campaign.too_late_capture = false;
    }
    return campaign.too_late_capture;
  }

  $scope.editCampaign = function(campaign) {
    $location.path('getstarted/' + campaign.entry_id);
  };
  // search campaign by name
  $scope.searchCampaign = function(word) {
    $scope.sortOrFiltersCampaign.filters.name = word;
    filterCampaign($scope.sortOrFiltersCampaign);
  };

  $scope.cancelCampaign = function(campaign) {
    if (campaign) {
      $scope.cancellingCampaign = campaign;
      $('.cancel-multi-campaign-modal').modal('show');
    } else {
      $('.not-select-modal').modal('show');
    }
  };
  $scope.confirmCancelCampaign = function(campaign) {
    $scope.changeCampaignStatus(campaign, 11);
  }

  /* table sorting */
  $scope.sortByDate = function() {
    $scope.toggle.created = !$scope.toggle.created;

    if ($scope.toggle.created) {
      // sort ascending
      $scope.sortOrFiltersCampaign.sort = 'created';
    } else {
      // sort desending
      $scope.sortOrFiltersCampaign.sort = '-created';
    }
    filterCampaign($scope.sortOrFiltersCampaign);
  };

  function updateURL() {
    var firstpage = ($routeParams.page == 1 || $scope.sortOrFiltersCampaign.page == 1); // Is this the first page?
    var pageparam = firstpage ? null : $scope.sortOrFiltersCampaign.page; // Clear the page param or set page param

    // if it is object
    if (typeof($scope.sortOrFiltersCampaign.filters.category) == 'object') {
      $location.search('category', null);
    } else {
      $location.search('category', $scope.sortOrFiltersCampaign.filters.category);
    }
    $location.search('name', $scope.sortOrFiltersCampaign.filters.name || null);
    $location.search('page', pageparam);
    $location.search('order', $scope.sortOrFiltersCampaign.sort || null);
    $location.search('status', $scope.sortOrFiltersCampaign.filters.entry_status_id || null);
  }

  // Process any filter/sort parameters when the page loads
  function processParams() {
    $scope.sortOrFiltersCampaign.filters.category = $routeParams.category || $scope.sortOrFiltersCampaign.filters.category;
    $scope.sortOrFiltersCampaign.filters.entry_status_id = $routeParams.status || $scope.sortOrFiltersCampaign.filters.entry_status_id;
    $scope.sortOrFiltersCampaign.filters.name = $routeParams.name || $scope.sortOrFiltersCampaign.filters.name;
    $timeout(function() {
      $scope.sortOrFiltersCampaign.page = $routeParams.page || 1;
    });
    $scope.sortOrFiltersCampaign.campaign_id = $routeParams.campaign_id || null;
    $scope.sortOrFiltersCampaign.sort = $routeParams.order || null;
  }

  $scope.manageStream = function(campaign) {
    $location.path('campaign-manager/stream-management/' + campaign.id);
  }

  function clearMessage() {
    $scope.successMessage = [];
    $scope.errorMessage = [];
  }

});