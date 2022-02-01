app.controller('PledgeHistoryCtrl', function ($routeParams, $location, $timeout, $translatePartialLoader, $translate, $scope, $rootScope, RestFullResponse, UserService, Restangular, RESOURCE_REGIONS, RequestCacheService, PortalSettingsService, CampaignSettingsService) {
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  var user = UserService;
  // $scope.totalReplaced = 0;
  $scope.rewardAttr = [];
  $scope.replaceValidated = false;
  $scope.toggle = {};
  $scope.selectedRewards = [];
  $scope.rewardQueue = [];
  $scope.sortOrFiltersCampaign = {
    "sort": '',
    "filters": {
      "category": {},
      "entry_status_id": [],
      "backer": user.person_id,
    },
    "page_entries": 10,
    "page_limit": 100,
    "pagination": {},
    "page": 1
  }
  //campaign end = 2016-02-16 13:50:00-08
  //today = 2016-02-16T21:21:30.832Z
  $scope.totalentry = [10, 25, 40, 55, 70];
  var today_date = new Date();
  var offset = today_date.getTimezoneOffset();
  today_date.setMinutes(today_date.getMinutes() - offset);
  $scope.today = today_date.toISOString().substring(0, 19).replace("T", " ");
  $scope.campaign_status = ["tab_pledge_filter_all", "tab_pledge_filter_campaign_running", "tab_pledge_filter_campaign_ended"];
  processParams();
  filterCampaign($scope.sortOrFiltersCampaign); // filter campaign on page load

  var msg;

  //call to Portal setting service


  PortalSettingsService.getSettingsObj().then(function (success) {
    $scope.portalsetting = success;
    $scope.isISODate = success.public_setting.site_theme_campaign_display_iso_date;

    if (typeof success.public_setting.site_campaign_pledge_update === 'undefined') {
      success.public_setting.site_campaign_pledge_update = false;
    }
    if (typeof success.public_setting.site_campaign_withdraw_hide === 'undefined') {
      success.public_setting.site_campaign_withdraw_hide = false;
    }
    $scope.campaignWithdrawContribution = success.public_setting.site_campaign_withdraw_hide;

    $scope.campaignPledgeReplace = success.public_setting.site_campaign_pledge_update;

  });

  //
  //**************************** Restangular requests **************************//

  RequestCacheService.getCategory().then(function (success) {
    $scope.categories = success;
    $rootScope.checkpledgehistory = $scope.categories;

  });

  Restangular.one('campaign').all('status').getList().then(function (success) {
    $scope.campaignStatus = success;
  });

  $scope.searchCampaign = function (word) {
    $scope.sortOrFiltersCampaign.filters.name = word;
    filterCampaign($scope.sortOrFiltersCampaign);
  };

  $scope.updateFiltersCampaignCategory = function (category) {
    $scope.sortOrFiltersCampaign.filters.category = category;
    filterCampaign($scope.sortOrFiltersCampaign);

  };

  $scope.updateFiltersCampaignStatus = function (status) {

    $scope.sortOrFiltersCampaign.filters.entry_status_id = status.id;
    filterCampaign($scope.sortOrFiltersCampaign);
  };

  $scope.checkentry = function () {
    $scope.entries = $('#searchbtn').dropdown('get value');
    //($scope.entries);
    $scope.sortOrFiltersCampaign.page_entries = $scope.entries;
    filterCampaign($scope.sortOrFiltersCampaign);
  }
  $scope.updateFiltersCampaignOrder = function (order) {
    $scope.sortOrFiltersCampaign.sort = order;
    filterCampaign($scope.sortOrFiltersCampaign);
  };
  $scope.selectStatus = function (index) {
    // all
    if (index == 0) {
      $scope.sortOrFiltersCampaign.filters.entry_status_id = "";
    }
    // running campaigns
    else if (index == 1) {
      $scope.sortOrFiltersCampaign.filters.entry_status_id = [1, 2, 4];
    }
    // completed campaigns
    else if (index == 2) {
      $scope.sortOrFiltersCampaign.filters.entry_status_id = [5, 6, 7, 8, 9];
    }
    filterCampaign($scope.sortOrFiltersCampaign);
  };

  $scope.openPledgeDetail = function (parent, index, campaignIndex) {
    if ([2, 5, 6, 7, 8, 9, 13].indexOf(parent.campaign.entry_status_id) > -1) {
      $scope.hideWithdraw = true;
    } else {
      $scope.hideWithdraw = false;
    }
    $scope.parentIndex = parent.$index;
    $scope.pledgeDetails = parent.$parent.campaign;

    // Format campaign settings array
    CampaignSettingsService.setCampaignId($scope.pledgeDetails.entry_id);
    CampaignSettingsService.processSettings($scope.pledgeDetails.settings);
    $scope.pledgeDetails.settings = CampaignSettingsService.getSettings();

    $scope.detailIndex = index;

    // open the modal
    $timeout(function () {
      $('#pledge-details').modal('show');
    },100);

    $scope.currentCampaign = {
      currency: $scope.campaigns[campaignIndex].currencies[0],
      id: $scope.campaigns[campaignIndex].id,
      pledge: $scope.campaigns[campaignIndex].pledges,
      pledgeDetailId: $scope.campaigns[campaignIndex].pledge_details[index].id,
      amount: $scope.campaigns[campaignIndex].pledge_details[index].amount
    };
    Restangular.one('campaign', $scope.currentCampaign.id).customGET().then(function (success) {
      $scope.currentCampaign['pledge'] = success.pledges;
    });

    if ($scope.currentCampaign.pledge !== null) {
      $scope.isThereRewards = true;
    } else {
      $scope.isThereRewards = false;
    }
  };

  $scope.openModalById = function (id) {
    $('.ui.modal#' + id).modal('show');
  };

  $scope.deletePledge = function () {
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    Restangular.one('campaign', $scope.pledgeDetails.id).one('pledge', $scope.pledgeDetails.pledge_details[$scope.detailIndex].id).customDELETE().then(function (success) {
      msg = {
        'header': "action_success"
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  };
  /* table soring */
  $scope.sortByDate = function () {
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


  function filterCampaign(filter) {
    RestFullResponse.all('campaign').getList(filter).then(function (success) {
      updateURL();
      $scope.campaigns = success.data.plain();

      angular.forEach($scope.campaigns, function (campaignValue) {
        Restangular.one('campaign', campaignValue.id).one('pledge').customGET().then(function (pledge) {
          campaignValue.pledge_details = pledge.plain();

        });
        // Loop through the campaign files and push the file path to campaign obj if the region_name && file path is true
        angular.forEach(campaignValue.files, function (fileValue, index) {
          if (fileValue.region_name == 'Campaign Thumbnail' && fileValue.path_external) {
            campaignValue.campaign_thumb_url = fileValue.path_external;
          }
        });
      });
      var headers = success.headers();
      $scope.sortOrFiltersCampaign.pagination.currentpage = headers['x-pager-current-page'];
      $scope.sortOrFiltersCampaign.pagination.numpages = headers['x-pager-last-page'];
      $scope.sortOrFiltersCampaign.pagination.nextpage = headers['x-pager-next-page'];
      $scope.sortOrFiltersCampaign.pagination.pagesinset = headers['x-pager-pages-in-set'];
      $scope.sortOrFiltersCampaign.pagination.totalentries = headers['x-pager-total-entries'];
      $scope.sortOrFiltersCampaign.pagination.entriesperpage = headers['x-pager-entries-per-page'];

    });
  }

  $scope.filterCampaign = function () {
    filterCampaign($scope.sortOrFiltersCampaign);
  }
  $scope.$emit("loading_finished");
  $scope.getPledges = function (campaignID) {
    Restangular.one('campaign', campaignID).one('pledge').customGET().then(function (pledges) {
      $scope.pledge_histories = pledges;
      ////($scope.pledge_histories);
    });
  }

  function updateURL() {

    var firstpage = ($routeParams.page == 1 || $scope.sortOrFiltersCampaign.page == 1); // Is this the first page?
    var pageparam = firstpage ? null : $scope.sortOrFiltersCampaign.page; // Clear the page param or set page param

    // if it is object
    if (typeof ($scope.sortOrFiltersCampaign.filters.category) == 'object') {
      $location.search('category', null);
    } else {
      $location.search('category', $scope.sortOrFiltersCampaign.filters.category);
    }
    $location.search('name', $scope.sortOrFiltersCampaign.filters.name || null);
    $location.search('page', pageparam);
    // $location.search('status', $scope.sortOrFiltersCampaign.filters.entry_status_id || null);
  }

  // Process any filter/sort parameters when the page loads
  function processParams() {
    $scope.sortOrFiltersCampaign.filters.category = $routeParams.category || $scope.sortOrFiltersCampaign.filters.category;
    $scope.sortOrFiltersCampaign.filters.entry_status_id = $routeParams.status || $scope.sortOrFiltersCampaign.filters.entry_status_id;
    $scope.sortOrFiltersCampaign.filters.name = $routeParams.name || $scope.sortOrFiltersCampaign.filters.name;
    $scope.sortOrFiltersCampaign.page = $routeParams.page || 1;
  }

  $scope.rewardSelected = function (data) {
    $scope.currentReward = $scope.currentCampaign.pledge[data];
    $scope.rewardAttr = "";

    var exists = false;

    angular.forEach($scope.selectedRewards, function (value) {
      if (value.pledge_level_id == $scope.currentReward.pledge_level_id) {
        exists = true;
      }
    });
    if (!exists) {
      $scope.selectedRewards.push($scope.currentReward);
    }
  }
  $scope.chooseReward = function (reward) {
    if (!reward.quantity) {
      reward.quantity = 1;
    } else {
      reward.quantity++;
      angular.forEach($scope.rewardQueue, function (value, key, obj) {
        if (value.name == reward.name) {
          obj[key].quantity = reward.quantity;
        }
      });
    }
    if (reward.quantity == 1) {
      $scope.rewardQueue.push(reward);
    }
  }
  $scope.removeReward = function (reward) {
    angular.forEach($scope.rewardQueue, function (value, key, obj) {
      if (reward.pledge_level_id == value.pledge_level_id && reward.quantity == 1) {
        $scope.rewardQueue.splice(key, 1);
        reward.quantity = 0;
        return;
      } else if (reward.pledge_level_id == value.pledge_level_id) {
        obj[key].quantity--;
      }
    });
  }
  $scope.replaceContribution = function () {
    $('#replace-contribution-modal').modal({
      closable: false
    }).modal('show');
    $scope.hideInitialModal = true;
  }

  $scope.amountModalView = function () {
    $scope.isAmountContribution = true;
    $scope.isRewardsContribution = false;
    $scope.hideInitialModal = false;
  }

  $scope.rewardsModalView = function () {
    // set default award
    if ($scope.currentCampaign.pledge.length) {
      $scope.rewardSelected(0);
    };
    $scope.isRewardsContribution = true;
    $scope.isAmountContribution = false;
    $scope.hideInitialModal = false;
  }

  $scope.replacementClose = function () {
    $scope.isRewardsContribution = false;
    $scope.isAmountContribution = false;
    $scope.currentReward = null;
    $scope.contributionValue = null;
    $scope.rewardQueue = [];
    $scope.totalReplaced = 0;
    $scope.replaceValidated = false;
    $('#replace-contribution-modal').modal('hide');
  }

  $scope.submitReplacement = function () {
    $scope.replacedRewards = [];
    $scope.totalAmount = 0;

    if ($scope.submitReplacement.amount) {
      $scope.totalAmount += parseInt($scope.submitReplacement.amount);
    }
    angular.forEach($scope.selectedRewards, function (value) {
      if (value.quantity > 0) {
        $scope.replacedRewards.push({
          "plid": value.pledge_level_id,
          "pledge_name": value.name,
          "pledge_amount": value.amount,
          "quantity": value.quantity,
          "selected_attr": value.selectedAttr
        });
        $scope.totalAmount += value.amount * value.quantity;
      }
    });

    var redirect = {},
      count = 0;
    redirect['eid'] = $scope.currentCampaign.id;
    redirect['m'] = ($scope.submitReplacement.amount) ? $scope.submitReplacement.amount : 0;
    redirect['r'] = $scope.currentCampaign.pledgeDetailId;
    angular.forEach($scope.replacedRewards, function (value) {
      redirect['plid_' + count++] = value.plid;
      redirect[value.plid + '_quantity'] = value.quantity;
      redirect[value.plid + '_amount'] = value.pledge_amount;
    });
    $location.path('/pledge-campaign').search(redirect);

    $scope.replaceCheckout = true;
    $scope.isRewardsContribution = false;
    $scope.isAmountContribution = false;
    $scope.rewardQueue = [];
    $scope.totalReplaced = 0;
    $scope.replaceValidated = false;
    $scope.replacementClose();
    return;
  }

  $scope.$watch('[submitReplacement.amount, currentReward.quantity]',
    function (newValue) {
      var sumitReplaceAmount = parseInt(newValue[0]);
      var total = 0;
      if (sumitReplaceAmount != 0) {
        total += sumitReplaceAmount;
      }
      if ($scope.rewardQueue) {
        if (!total) total = 0;
        angular.forEach($scope.rewardQueue, function (value) {
          total += parseInt(value.amount) * value.quantity;
        })
      }
      $scope.totalReplaced = total;
      $scope.replaceValidated = ($scope.currentCampaign && ($scope.totalReplaced >= $scope.currentCampaign.amount)) ? true : false;

    }
  );
});