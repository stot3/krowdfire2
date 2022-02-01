app.controller('ExploreCtrl', function ($timeout, $scope, $rootScope, CampaignSettingsService, $routeParams, $translatePartialLoader, $translate, $location, $route, RESOURCE_REGIONS, Restangular, Geolocator, RestFullResponse, PortalSettingsService, RequestCacheService, VideoLinkService, $document) {
  var nativeLookup;
  //initialize theme color
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  $scope.cities = [];
  $scope.loading = false;
  $scope.explore_page_text = {};
  //for translating
  $scope.moment = function (value, suffix) {
    return moment(value).fromNow(suffix);
  }
  //Text for days to minutes
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
  $scope.dateInPast = function (value, sec) {
    if (sec == 0 || sec == "00" || sec < 0) {
      return true;
    } else {
      return false;
    }
  }
  var $msg;
  $scope.noCampaign = false;
  // initiate ui-select variable
  $scope.cityNameFilter = {};
  $scope.sortOrFilters = {
    "sort": '',
    "filters": {
      "category": [],
      "location": '',
      "manager": '',
      "blurb": '',
      "name": '',
      "description": '',
      "entry_status_id": '',
      "entry_custom_status":''
    },
    "page_entries": 9,
    "page_limit": 100,
    "pagination": {},
    "page": null
  }

  $scope.explore_page_html_content = {
    'top_banner': "",
  }
  $scope.noSubs = 0;
  $scope.firstTime = 0;
  $scope.isDesktop = true;

  // Animated scroll to rewards section
  $scope.scrollToCampaignCards = function () {
    $timeout(function () {
      $('html, body').animate({
        scrollTop: $('#campaign-card-list').offset().top - 15
      }, 500);
    });
  }

  $scope.loadMoreCampaigns = function () {
    $scope.sortOrFilters.page_entries += 9;

    $scope.loading = true;
    RestFullResponse.all('campaign').getList($scope.sortOrFilters).then(function (success) {
      if ($location.search().description && success.data.length === 0) {
        // if description search is done but no results
        $scope.sortOrFilters.filters.description = null;
        $scope.sortOrFilters.filters.name = $location.search().description;
        RestFullResponse.all('campaign').getList($scope.sortOrFilters).then(function (success) {
          $scope.campaigns = success.data;
          if (success.data.length === 0) {
            $scope.noCampaign = true;
          } else {
            $scope.noCampaign = false;
            $scope.campigns = VideoLinkService.proccessCampaigns($scope.campaigns);
          }
          var headers = success.headers();

          $scope.sortOrFilters.pagination.currentpage = headers['x-pager-current-page'];
          $scope.sortOrFilters.pagination.numpages = headers['x-pager-last-page'];
          $scope.sortOrFilters.pagination.nextpage = headers['x-pager-next-page'];
          $scope.sortOrFilters.pagination.pagesinset = headers['x-pager-pages-in-set'];
          $scope.sortOrFilters.pagination.totalentries = headers['x-pager-total-entries'];
          $scope.sortOrFilters.pagination.entriesperpage = headers['x-pager-entries-per-page'];
        });
      }
      $scope.campaigns = success.data;

      angular.forEach($scope.campaigns, function (value, index) {
        if (value.cities != null) {
          checkNative(value.cities[0]);
        }
        //Minus total_shipping_cost from funded amount if setting is toggled.
        if (typeof $scope.public_settings.site_campaign_exclude_shipping_cost !== 'undefined' && $scope.public_settings.site_campaign_exclude_shipping_cost) {
          value.funded_amount = value.funded_amount - value.total_shipping_cost;
        }

        CampaignSettingsService.processSettings(value.settings);
        value.settings = CampaignSettingsService.getSettings();

        value.settings.master_progress_bar_hide = false;
        if ($scope.progressHide) {
          value.settings.master_progress_bar_hide = true;
        } else {
          value.settings.master_progress_bar_hide = false;
        }
        if (typeof value.settings.progress_bar_hide !== 'undefined') {
          value.settings.master_progress_bar_hide = value.settings.progress_bar_hide;
        }
      });
      if (success.data.length === 0) {
        $scope.noCampaign = true;
      } else {
        $scope.noCampaign = false;
        $scope.campigns = VideoLinkService.proccessCampaigns($scope.campaigns);
      }
      var headers = success.headers();
      $scope.sortOrFilters.pagination.currentpage = headers['x-pager-current-page'];
      $scope.sortOrFilters.pagination.numpages = headers['x-pager-last-page'];
      $scope.sortOrFilters.pagination.nextpage = headers['x-pager-next-page'];
      $scope.sortOrFilters.pagination.pagesinset = headers['x-pager-pages-in-set'];
      $scope.sortOrFilters.pagination.totalentries = headers['x-pager-total-entries'];
      $scope.sortOrFilters.pagination.entriesperpage = headers['x-pager-entries-per-page'];


      $scope.loading = false;
      setTimeout(function () {
        $('html, body').animate({
          scrollTop: $("#discover").offset().top + $("#discover").outerHeight(true) - $(window).height()
        }, 1500);
      }, 1000);

    });

  }

  $scope.isDesktopScreen = function () {
    var currentScreenWidth = $(window).width();
    var element = $('.mobile-collapsed');

    if (currentScreenWidth <= 767) {
      $scope.isDesktop = false;
      element.removeClass('active');
    } else {
      $scope.isDesktop = true;
      element.addClass('active');
    }
  }
  $scope.isDesktopScreen();

  Restangular.one('portal/setting').getList().then(
    function (success) {
      $scope.public_settings = {};
      angular.forEach(success, function (value) {
        if (value.setting_type_id == 3) {
          $scope.public_settings[value.name] = value.value;
        }
      });

      $scope.infiniteScroller = $scope.public_settings.site_infinite_scroller;

      if (typeof $scope.infiniteScroller === 'undefined' || !$scope.infiniteScroller) {
        $scope.infiniteScroller = {
          explore: false,
          featured: false,
          recent: false,
          profile: false
        }
      }

      if (!$scope.public_settings.site_search_explore) {
        $scope.public_settings.site_search_explore = 'name';
      }
      $scope.translateSearchPlaceholder();

      nativeLookup = $scope.public_settings.site_theme_shipping_native_lookup;
      if ($scope.public_settings.site_theme_category_display_explore_sidebar) {
        getCategory();
      }

      if ($scope.public_settings.site_explore_page_text.homeSetting) {
        $scope.home_page_text = $scope.public_settings.site_home_page_text;
        $scope.main_banner_font_color = {
          color: '#' + $scope.public_settings.site_home_page_text.main_banner.font_color,
          'font-family': $scope.public_settings.site_home_page_text.main_banner.font_family,
        };
      }
      // allow_thumbnail_video
      if (typeof $scope.public_setting.site_campaign_allow_thumbnail_video == 'undefined') {
        $scope.public_settings.site_campaign_allow_thumbnail_video = true;
      }
      $scope.settingsLoaded = true;

    },
    function (failure) {
      if (failure.data != null) {
        $msg = {
          'header': failure.data.message
        }
      } else {
        $msg = {
          'header': "Error"
        }
      }
      $scope.errorMessage.push($msg);
    });

  /**
   * Sort out categories and sub-categories instead of being on flat list
   * 
   * @param {Array} categories 
   */
  function processCategory(categories) {
    var categoriesCopy = angular.copy(categories);
    $scope.subcategories = {};
    angular.forEach(categoriesCopy, function (value, key) {
      if (value.parent_category_id) {
        if (!$scope.subcategories[value.parent_category_id]) {
          $scope.subcategories[value.parent_category_id] = [];
        }
        $scope.subcategories[value.parent_category_id].push(value);
      }
    });
  }

  function getCategory() {
    var categoryParam = {
      "active_only": 0
    }
    categoryParam.active_only = !$scope.public_settings.site_theme_category_display_with_campaigns_only ? 1 : 0;
    Restangular.one("portal").customGET("category", categoryParam)
      .then(function (categories) {
        $scope.categories = categories.plain();
        processCategory($scope.categories);
        $rootScope.checkexplore = $scope.categories;
        processParams();
      });
  }
  $scope.translateSearchPlaceholder = function () {
    var translate = $translate.instant(['explore_search_bycampaignid', 'explore_search_bydescripton', 'explore_search_bymanager', 'explore_search_byname']);
    if ($scope.public_settings.site_search_explore == 'name') {
      $scope.searchPlaceholder = translate.explore_search_byname;
    }
    if ($scope.public_settings.site_search_explore == 'description') {
      $scope.searchPlaceholder = translate.explore_search_bydescripton;
    }
    if ($scope.public_settings.site_search_explore == 'campaign ID') {
      $scope.searchPlaceholder = translate.explore_search_bycampaignid;
    }
    if ($scope.public_settings.site_search_explore == 'manager') {
      $scope.searchPlaceholder = translate.explore_search_bymanager;
    }
  }
  $scope.selectAllSubCategories = function (category_id) {
    // Check for Sub Cat Remaining
    var cat = $location.search().category || [];
    if ($scope.noSubs == 1) {
      angular.forEach($scope.subcategories[category_id], function (value, key, obj) {
        for (var i = 0; i < cat.length; i++) {
          if (cat[i] == obj[key].category_id) {
            $location.search().category.splice(i, 1);
          }
        }
      });
      //Reset SubCat Remaining
      $scope.noSubs = 0;

      return;
    }
    array_cat = [];
    if ($(angular.element('#sub-cat-dropdown-' + category_id)).hasClass('active') == true) {
      angular.forEach($scope.subcategories[category_id], function (value, key, obj) {
        for (var i = 0; i < cat.length; i++) {
          if (cat[i] == obj[key].category_id) {
            $location.search().category.splice(i, 1);
          }
        }
      });
    } else {
      angular.forEach($scope.subcategories[category_id], function (value, key, obj) {
        $scope.updateCategoryFilters(obj[key]);
      });
    }
  }

  // Takes a property name for category or a boolean. If it's a boolean, it will set all category filters to that value.
  $scope.updateCategoryFilters = function (category) {
    // if there is param
    if (typeof $location.search().category == 'object') {
      var categories = $location.search().category || [];
    } else {
      var categories = [];
      var category_parse = parseInt($location.search().category);
      if (!isNaN(category_parse)) {
        categories.push(category_parse);
      }
    }
    if (category) {
      var index = categories.indexOf(category.id);
      // push if the category is not in array, else remove from array
      if (index > -1) {
        categories.splice(index, 1);
      } else {
        categories.push(parseInt(category.id));
      }
    } else {
      // Reset if All Categories is selected
      categories = [];
    }

    //If toggle set
    if ($scope.public_settings.site_enable_auto_select_subcat) {
      if ($scope.firstTime == 1) {
        // Expand Sub Cat Start
        if (category != null && category.parent_category_id != null) {
          var sizeOfSubCats = $scope.subcategories[category.parent_category_id].length;
          var sizeDeducted = sizeOfSubCats;
          //Size of Sub Categories of the Parent
          $('#sub-cat-' + category.parent_category_id + ' .content a').each(function (i, obj) {
            angular.forEach($location.search().category, function (val, key, object) {
              if (val == obj.id)
                sizeDeducted--;
            });
          });
          if (sizeOfSubCats == sizeDeducted) {
            setTimeout(function () {
              $scope.noSubs = 1;
              angular.element('#sub-cat-dropdown-' + category.parent_category_id).click();
            }, 0);
          }
        }
      }
    }
    $scope.firstTime = 1;

    $location.search('category', categories);

    if (!$scope.isDesktop) {
      $scope.scrollToCampaignCards();
    }

  }


  $scope.updateProgressFilters = function (status) {
    // if there is param
   /* if (typeof $location.search().entry_custom_status == 'object') {
      var custom_status = $location.search().entry_custom_status || [];
    } else {
      if ((typeof $location.search().entry_custom_status != 'unndefined') && $location.search().entry_custom_status.length > 0) {
        $location.search('entry_custom_status', $location.search().entry_custom_status);
      }
    }
    if ($location.search().entry_custom_status.length == 0)*/
    if (status == "reset"){
      $location.search('entry_custom_status', null);
      $route.reload();
    }else
      $location.search('entry_custom_status', status);
    if (!$scope.isDesktop) {
      $scope.scrollToCampaignCards();
    }

  }

  $timeout(function () {
    $(window).resize(function () {
      $scope.isDesktopScreen();
    });
  });

  $scope.updateCampaignListing = function () {
    updateCampaignListing();
  }

  $scope.updateSort = function (sort, random) {
    var randomModulo = Math.floor(Math.random() * 77) + 7;
    if (random) {
      sort += randomModulo;
    }
    if (sort) {
      $location.search('sort', sort);
    }
  }

  // Set pagination limit based on the smallest of either page limit, or totalentries, depending on entriesperpage
  $scope.getTotalItems = function () {
    var desiredtotal = $scope.sortOrFilters.pagination.entriesperpage * $scope.sortOrFilters.page_limit;
    if (desiredtotal > $scope.sortOrFilters.pagination.totalentries)
      return $scope.sortOrFilters.pagination.totalentries;
    else
      return desiredtotal;
  }


  // Look up city based on search term, then find the cityID and store it
  $scope.searchCities = function (term) {
    var cityID = null;
    if (term) {
      Geolocator.searchCities(term, nativeLookup).then(function (cities) {
        $scope.cities = cities;
        angular.forEach($scope.cities, function (value, index) {
          checkNative(value);
        });
      });
    }
  }

  $scope.getCityQuery = function (value) {
    var cityID;
    // value != oldvalue is to avoid the function to run when $watch is initializing
    if (value) {
      // If there's no value in location field, remove the query from URL
      if (!value) {
        $location.search('location', null);
      }
      // Construct the query in URL when city is found
      else {
        cityID = Geolocator.lookupCityID(value.name);
        $location.search('location', cityID);
      }
    }
    // This else if will only run when $watch initialized
    else if ($location.search().location) {
      processParams();
    }
  }
  // watching variable changes
  // Searching location
  $scope.$watch('cityNameFilter.selected', function (value, oldvalue) {
    $scope.searchCities(value);

  });

  $scope.$watch(function () {
    return $location.search();
  }, function (value) {
    processParams();
  }, true);

  //reset location filter select
  $scope.resetLocation = function () {
    $scope.cityNameFilter.selected = undefined;
    $location.search('location', null);
    $('.ui.dropdown').dropdown('clear');
    $('.ui.form').form('clear');
    var value = $translate.instant(['explore_search_location_placeholder']);
    $('#locationPlaceholder').text(value.explore_search_location_placeholder);
  };

  // Look up matching campaign via name
  $scope.searchTitles = function (term) {
    if (term)
      $location.search($scope.public_settings.site_search_explore, term);
    else
      $location.search($scope.public_settings.site_search_explore, null);
  }

  // Update the URL everytime a filter is applied to allow the user to utilize deep linking
  function updatePage() {
    var firstpage = ($routeParams.page == 1 || $scope.sortOrFilters.page == 1); // Is this the first page?
    var pageparam = firstpage ? null : $scope.sortOrFilters.page; // Clear the page param or set page param
    $location.search('page', pageparam);
  }

  function updateFilter() {

    var params = $location.search();

    //Check if excluded Ended from sort
    if (typeof $scope.public_settings == "undefined") {
      $scope.public_settings = {};
      $scope.public_settings.exclude_ended_from_recent = false;
    } else if (typeof $scope.public_settings.exclude_ended_from_recent == "undefined") {
      $scope.public_settings.exclude_ended_from_recent = false;
    }

    $scope.sortOrFilters.filters.category = [];

    // filter category by this custom url
    if ($routeParams.category_alias) {

      if ($scope.categories) {
        angular.forEach($scope.categories, function (value) {
          if (value.uri_paths && (value.uri_paths[0].path == $routeParams.category_alias)) {
            $scope.sortOrFilters.filters.category.push(value.id);
          }
        });
      } else {
        var categoryParam = {
          "active_only": 0
        }
        categoryParam.active_only = !$scope.public_settings.site_theme_category_display_with_campaigns_only ? 1 : 0;
        Restangular.one("portal").customGET("category", categoryParam)
          .then(function (categories) {
            $scope.categories = categories.plain();
            angular.forEach($scope.categories, function (value) {
              if (value.uri_paths && (value.uri_paths[0].path == $routeParams.category_alias)) {
                $scope.sortOrFilters.filters.category.push(value.id);
              }
            });
          });
      }
    }

    // check if category is array
    if (params.category instanceof Array) {
      angular.forEach(params.category, function (value) {
        // check if value is number
        var temp = parseInt(value);
        if (temp && !isNaN(temp))
          $scope.sortOrFilters.filters.category.push(temp);
      });
    } else if (params.category) {
      var temp = parseInt(params.category);
      if (temp && !isNaN(temp))
        $scope.sortOrFilters.filters.category.push(temp);
    }

    $scope.sortOrFilters.filters.location = params.location;
    $scope.sortOrFilters.filters.name = params.name;
    $scope.sortOrFilters.filters.description = params.description;
    if (params.entry_custom_status){
     $scope.sortOrFilters.filters.entry_custom_status = params.entry_custom_status;
    }
    if (params.sort) {
      $scope.sortOrFilters.sort = params.sort;
    } else if ($scope.public_settings.exclude_ended_from_recent) {
      $scope.sortOrFilters.sort = "entry_status_id";
    }
    $scope.sortOrFilters.page = params.page || 1;
  }

  // get portal settings from service
  PortalSettingsService.getSettingsObj().then(function (success) {
    $scope.progressHide = success.public_setting.site_campaign_progress_bar_hide;
    $scope.category_display = success.public_setting.site_theme_category_display_explore_sidebar;
    $scope.no_campaign_message = success.public_setting.site_theme_no_campaign_message;
    $scope.campaign_display = success.public_setting.site_theme_campaign_grid_display;
    $scope.explore_page_text = success.public_setting.site_explore_page_text;
    $scope.isISODate = success.public_setting.site_theme_campaign_display_iso_date;
    $scope.isCardLabelSwitch = success.public_setting.site_campaign_switch_card_label;
    $scope.isHideCampaignCardCreatorCategory = success.public_setting.site_campaign_hide_campaign_card_creator_or_category;
    $scope.setDefaultSort = success.public_setting.site_set_explore_default_sort;
    $scope.isCampaignCardBackers = success.public_setting.site_campaign_display_backers_campaign_card;
    $scope.displayGoalAmountOnCampaignCard = success.public_setting.site_campaign_display_funding_goal_amount_on_campaign_cards;

    // Remove active selected item when page is loaded
    if ((typeof $scope.setDefaultSort != 'undefined' && $scope.setDefaultSort) && $scope.setDefaultSort.default == 'default' && $scope.sortOrFilters.sort == '' && typeof $routeParams.sort == 'undefined') {
      $timeout(function () {
        $('#sort-campaigns').find('.item').removeClass('active selected');
      });
    }
  });

  function updateCampaignListing() {
    updatePage();

    RestFullResponse.all('campaign').getList($scope.sortOrFilters).then(function (success) {
      // Set Selected dropdown if url params is defined
      if (typeof $routeParams.sort !== 'undefined') {
        $('#sort-campaigns').dropdown('set selected', $routeParams.sort)
      }

      // Set default sort
      if (typeof $scope.setDefaultSort === 'undefined' || typeof $scope.setDefaultSort == null) {
        $scope.setDefaultSort = {
          default: '',
          default_text: ''
        }
      }
      if ($scope.setDefaultSort.default !== 'default') {
        if ($scope.setDefaultSort.default_text === 'Random' && $scope.sortOrFilters.sort == '') {
          $scope.updateSort($scope.setDefaultSort.default, 'random');
        } else if ($scope.sortOrFilters.sort == '') {
          $scope.updateSort($scope.setDefaultSort.default);
        }
        if ($location.search().sort == $scope.setDefaultSort.default) {
          $timeout(function () {
            $('#sort-campaigns').dropdown('set selected', $scope.setDefaultSort.default);
            $('#sort-campaigns').dropdown('set text', $scope.setDefaultSort.default_text);
          }, 0);
        }
      }

      if ($location.search().description && success.data.length === 0) {
        // if description search is done but no results
        $scope.sortOrFilters.filters.description = null;
        $scope.sortOrFilters.filters.name = $location.search().description;
        RestFullResponse.all('campaign').getList($scope.sortOrFilters).then(function (success) {
          $scope.campaigns = success.data;
          if (success.data.length === 0) {
            $scope.noCampaign = true;
          } else {
            $scope.noCampaign = false;
            $scope.campigns = VideoLinkService.proccessCampaigns($scope.campaigns);
          }
          var headers = success.headers();
          $scope.sortOrFilters.pagination.currentpage = headers['x-pager-current-page'];
          $scope.sortOrFilters.pagination.numpages = headers['x-pager-last-page'];
          $scope.sortOrFilters.pagination.nextpage = headers['x-pager-next-page'];
          $scope.sortOrFilters.pagination.pagesinset = headers['x-pager-pages-in-set'];
          $scope.sortOrFilters.pagination.totalentries = headers['x-pager-total-entries'];
          $scope.sortOrFilters.pagination.entriesperpage = headers['x-pager-entries-per-page'];
        });
      }
      $scope.campaigns = success.data;
      $scope.statuses = new Array();
      angular.forEach($scope.campaigns, function (value, index) {
        //console.log('In the loop. with status ' + value.entry_custom_status);


        if (value.entry_custom_status && $scope.statuses.indexOf(value.entry_custom_status) === -1)
          $scope.statuses.push(value.entry_custom_status);
           
      
       
        if (value.cities != null) {
          checkNative(value.cities[0]);
        }
        //Minus total_shipping_cost from funded amount if setting is toggled.
        if (typeof $scope.public_settings.site_campaign_exclude_shipping_cost !== 'undefined' && $scope.public_settings.site_campaign_exclude_shipping_cost) {
          value.funded_amount = value.funded_amount - value.total_shipping_cost;
        }

        CampaignSettingsService.processSettings(value.settings);
        value.settings = CampaignSettingsService.getSettings();

        value.settings.master_progress_bar_hide = false;
        if ($scope.progressHide) {
          value.settings.master_progress_bar_hide = true;
        } else {
          value.settings.master_progress_bar_hide = false;
        }
        if (typeof value.settings.progress_bar_hide !== 'undefined') {
          value.settings.master_progress_bar_hide = value.settings.progress_bar_hide;
        }
      });
     // console.log($scope.statuses);
      //$scope.statuses = statuses;  
      if (success.data.length === 0) {
        $scope.noCampaign = true;
      } else {
        $scope.noCampaign = false;
        $scope.campigns = VideoLinkService.proccessCampaigns($scope.campaigns);
      }
      var headers = success.headers();
      $scope.sortOrFilters.pagination.currentpage = headers['x-pager-current-page'];
      $scope.sortOrFilters.pagination.numpages = headers['x-pager-last-page'];
      $scope.sortOrFilters.pagination.nextpage = headers['x-pager-next-page'];
      $scope.sortOrFilters.pagination.pagesinset = headers['x-pager-pages-in-set'];
      $scope.sortOrFilters.pagination.totalentries = headers['x-pager-total-entries'];
      $scope.sortOrFilters.pagination.entriesperpage = headers['x-pager-entries-per-page'];

      // Emit event for hiding loader.
      $scope.$emit("loading_finished");
    });
  }

  $scope.paginateUpdate = function () {
    updateCampaignListing();
    setTimeout(function () {
      $('html, body').animate({
        scrollTop: $("#sort-campaigns").offset().top
      }, 100);
    }, 1000);
  }

  $scope.getCampaignThumbnailSrc = function (file) {
    if (file.file_type === 'GIF Image') {
      return $scope.server + '/static/images/' + file.path_external;
    } else {
      return $scope.server + '/image/campaign_thumbnail_xl/' + file.path_external;
    }
  }

  // Checking if there is a need to change the full city name to be displayed in native language
  function checkNative(cityObj) {
    var cityFull = "";
    if (nativeLookup) {
      cityObj.country = cityObj.country_native_name != null ? cityObj.country_native_name : cityObj.country;
      cityObj.subcountry = cityObj.subcountry_native_name != null ? cityObj.subcountry_native_name : cityObj.subcountry;
      cityObj.city = cityObj.city_native_name != null ? cityObj.city_native_name : cityObj.city;
      cityFull = cityObj.country + ", " + cityObj.subcountry + ", " + cityObj.city;
      cityObj.city_full = cityFull;
      cityObj.name = cityFull;
    }
  }

  // Process any filter/sort parameters when the page loads
  function processParams() {
    updateFilter();
    setTimeout(function () {
      updateCampaignListing();
    }, 1000);
  }

  $scope.getTimeZoneAbbr = function (campaign) {
    if (campaign.campaign_started == 'f') {
      campaign.timezoneText = moment().tz(campaign.timezone).zoneAbbr();
    }
  }

  // translation for campaign top right corner text
  $timeout(function () {
    $scope.campaign_status_corner_closed = $rootScope.checkTranslation("index_closed", "index_status_corner_closed");
  }, 1000);
});

//explor page banner background controller
app.controller('exploreHeadCtrl', function ($scope, Restangular, PortalSettingsService, $rootScope) {

  // get portal settings from service
  PortalSettingsService.getSettingsObj().then(function (success) {
    var url = success.public_setting.site_theme_explore_background.path_external;
    if (url) {
      $rootScope.ogMeta.image = $scope.server + "/static/images/" + url;
      $('.explore-head').css('background-image', 'url(' + $rootScope.ogMeta.image + ')');
    } else {
      $rootScope.ogMeta.image = "images/placeholder-images/placeholder_explore_bg.png";
      $('.explore-head').css('background-image', 'url(' + $rootScope.ogMeta.image + ')');
      $('.explore-head').css('background-size', 'cover');
      $('.explore-head').css('background-repeat', 'no-repeat');
      $('.explore-head').css('background-position', 'center center');
    }
  }, function (failure) {
    $rootScope.ogMeta.image = "images/placeholder-images/placeholder_explore_bg.png";
    $('.explore-head').css('background-image', 'url(' + $rootScope.ogMeta.image + ')');
    $('.explore-head').css('background-size', 'cover');
    $('.explore-head').css('background-repeat', 'no-repeat');
    $('.explore-head').css('background-position', 'center center');
  });
});

//main page banner background controller
app.controller('masthead2Ctrl', function ($scope, Restangular, $timeout, PortalSettingsService, $rootScope) {
  PortalSettingsService.getSettingsObj().then(function (success) {
    var url = success.public_setting.site_theme_explore_background.path_external;
    if (url) {
      $rootScope.ogMeta.image = $scope.server + "/static/images/" + url;
      $('.masthead').css('background-image', 'url(' + $rootScope.ogMeta.image + ')');
    } else {
      $rootScope.ogMeta.image = "images/placeholder-images/placeholder_explore_bg.png";
      $('.masthead').css('background-image', 'url(' + $rootScope.ogMeta.image + ')');
      $('.masthead').css('background-size', 'cover');
      $('.masthead').css('background-repeat', 'no-repeat');
      $('.masthead').css('background-position', 'center center');
    }
  }, function (failure) {
    $rootScope.ogMeta.image = "images/placeholder-images/placeholder_explore_bg.png";
    $('.masthead').css('background-image', 'url(' + $rootScope.ogMeta.image + ')');
    $('.masthead').css('background-size', 'cover');
    $('.masthead').css('background-repeat', 'no-repeat');
    $('.masthead').css('background-position', 'center center');
  });

});