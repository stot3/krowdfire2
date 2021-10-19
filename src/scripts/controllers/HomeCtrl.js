app.controller('HomeCtrl', function ($timeout, $scope, $route, $rootScope, $location, CampaignSettingsService, $translatePartialLoader, $translate, CreateCampaignService, Restangular, RESOURCE_REGIONS, PortalSettingsService, RequestCacheService, TimeStatusService, $sce, VideoLinkService, UserService, $q, RestFullResponse) {
  var nativeLookup;
  //Thrinacia home page
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  $scope.entriesPerType = 4;
  $scope.timeStatusObj = {};
  $scope.loadingFeatured = false;
  $scope.loadingActive = false;
  $scope.moment = function (value, suffix) {
    return moment(value).fromNow(suffix);
  }
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
  $scope.home_page_text = {
    "main_banner": {
      "header_one": "",
      "header_two": "",
      "paragraph": "",
      "display": "",
    },
    "middle_header": "",
    "bottom_banner": {
      "header_top": "",
      "paragraph": "",
      "header_bottom": "",
      "left_column": {
        'display': 1,
        'header': "",
        "paragraph": "",
      },
      "middle_column": {
        "display": 1,
        "header": "",
        "paragraph": "",
      },
      "right_column": {
        "display": 1,
        "header": "",
        "paragraph": "",
      },
    },
  }

  $scope.home_page_html_content = {
    'main_banner': "",
    "bottom_banner": "",
  }
  var arr_count = 0;
  var categoryId = [];
  var newar = [];

  PortalSettingsService.getSettingsObj().then(function (success) {

    $scope.home_page_text = success.public_setting.site_home_page_text;
    nativeLookup = success.public_setting.site_theme_shipping_native_lookup;

    //Default values for exclude shipping
    $scope.public_settings = {};
    $scope.public_settings.site_campaign_exclude_shipping_cost = success.public_setting.site_campaign_exclude_shipping_cost;
    $scope.isFeaturedCampaignLimitIncreased = success.public_setting.site_increase_featured_campaigns_limit;
    $scope.isHideCampaignCardCreatorCategory = success.public_setting.site_campaign_hide_campaign_card_creator_or_category;
    $scope.isCampaignCardBackers = success.public_setting.site_campaign_display_backers_campaign_card;
    $scope.infiniteScroller = success.public_setting.site_infinite_scroller;
    $scope.public_settings.site_default_campaign_rows = success.public_setting.site_default_campaign_rows;
    $scope.homepageCustomHtmlBlock = success.public_setting.site_homepage_custom_html_block;
    $scope.hideStartCampaignPage = success.public_setting.site_campaign_creation_hide_start_page;
    $scope.displayGoalAmountOnCampaignCard = success.public_setting.site_campaign_display_funding_goal_amount_on_campaign_cards;

    if (typeof $scope.infiniteScroller === 'undefined' || !$scope.infiniteScroller) {
      $scope.infiniteScroller = {
        explore: false,
        featured: false,
        recent: false,
        profile: false
      }
    }

    if (typeof $scope.public_settings.site_default_campaign_rows === 'undefined' || !$scope.public_settings.site_default_campaign_rows) {
      $scope.public_settings.site_default_campaign_rows = {
        featured: 1,
        recent: 1
      }
    }

    // Check if setting is true then change featured campaigns limit to 100 otherwise use the default limit
    // if ($scope.isFeaturedCampaignLimitIncreased) {
    //   $scope.featuredCampaignsLimit = 100;
    // } else {
    $scope.featuredCampaignsLimit = 4;
    // }

    get_recent_campaigns(success.public_setting.recentProjectHideFeatured, success.public_setting.exclude_ended_from_recent);
    getFeaturedCampaigns();
    // Video banner controls
    $scope.site_theme_banner_is_image = success.public_setting.site_theme_banner_is_image;
    $scope.site_theme_banner_video_mute = success.public_setting.site_theme_banner_video_mute;
    $scope.isCardLabelSwitch = success.public_setting.site_campaign_switch_card_label;

    if ($scope.site_theme_banner_is_image == false) {
      var initialVideoLink = success.public_setting.site_theme_banner_video_link;
      var videoSettings = {
        "mute": $scope.site_theme_banner_video_mute,
        autoplay: true
      };
      VideoLinkService.setSettings(videoSettings);
      VideoLinkService.processVideoLink(initialVideoLink);
      $scope.site_theme_banner_video_link_type = VideoLinkService.get_video_type();
      $scope.site_theme_banner_video_link = VideoLinkService.get_video_link();
    }

    $scope.site_theme_main_background = success.public_setting.site_theme_main_background;

    $scope.main_banner_font_color = {
      color: '#' + success.public_setting.site_home_page_text.main_banner.font_color,
      'font-family': success.public_setting.site_home_page_text.main_banner.font_family,
    };
    $scope.middle_font_color = {
      color: '#' + success.public_setting.site_home_page_text.middle_font_color,
      'font-family': success.public_setting.site_home_page_text.middle_font_family,
    };
    $scope.bottom_banner_top_header_color = {
      "color": '#' + success.public_setting.site_home_page_text.bottom_banner.top_header_font_color,
      'font-family': success.public_setting.site_home_page_text.bottom_banner.top_header_font_family
    };
    $scope.bottom_banner_paragraph_color = {
      "color": '#' + success.public_setting.site_home_page_text.bottom_banner.paragraph_font_color,
      'font-family': success.public_setting.site_home_page_text.bottom_banner.paragraph_font_family
    };
    $scope.bottom_banner_column_header_font_style = {
      "color": '#' + success.public_setting.site_home_page_text.bottom_banner.column_header_font_color,
      'font-family': success.public_setting.site_home_page_text.bottom_banner.column_header_font_family
    };

    var bottom_header_color = success.public_setting.site_home_page_text.bottom_banner.bottom_header_font_color;
    if (!bottom_header_color) {
      bottom_header_color = "FFFFFF";
    }

    $scope.bottom_banner_bottom_header_color = {
      "color": '#' + bottom_header_color,
      'font-family': success.public_setting.site_home_page_text.bottom_banner.bottom_header_font_family
    };

    if (!success.public_setting.site_home_page_text.bottom_banner.learn_more_button_text || success.public_setting.site_home_page_text.bottom_banner.learn_more_button_text.length == 0) {
      // set default text if button enabled but no custom text
      $scope.home_page_text.bottom_banner.learn_more_button_text = 'Learn more';
    }

    if (!success.public_setting.site_home_page_text.bottom_banner.learn_more_button_text_link || success.public_setting.site_home_page_text.bottom_banner.learn_more_button_text_link.length == 0) {
      // set default text if button enabled but no custom text
      $scope.home_page_text.bottom_banner.learn_more_button_text_link = 'about';
    }

    if (!success.public_setting.site_home_page_text.main_banner.button_text || success.public_setting.site_home_page_text.main_banner.button_text.length == 0) {
      // set default text if button enabled but no custom text
      $scope.home_page_text.main_banner.button_text = 'Start Project';
    }

    if (!success.public_setting.site_home_page_text.main_banner.button_text_link || success.public_setting.site_home_page_text.main_banner.button_text_link.length == 0) {
      // set default text if button enabled but no custom text
      $scope.home_page_text.main_banner.button_text_link = 'start';
    }

    if (success.public_setting.site_home_page_text.main_banner.block_alignment) {
      $scope.blockAlignmentStyle = {
        'text-align': success.public_setting.site_home_page_text.main_banner.block_alignment.value
      };
    }

    if (success.public_setting.site_home_page_text.bottom_banner.learn_more_display_button === undefined) {
      // set default text if button enabled but no custom text
      $scope.learn_more_display_button = true;
    } else {
      $scope.learn_more_display_button = success.public_setting.site_home_page_text.bottom_banner.learn_more_display_button;
    }

    $scope.no_campaign_message = success.public_setting.site_theme_no_campaign_message;
    $scope.hasCategory = success.public_setting.site_theme_category_display;
    $scope.campaign_display = success.public_setting.site_theme_campaign_grid_display;
    $scope.isISODate = success.public_setting.site_theme_campaign_display_iso_date;

    $scope.hideStartButton = success.public_setting.site_admin_campaign_management_only && $scope.home_page_text.main_banner.button_text_link == "/start" && UserService.person_type_id != 1;

    if ($scope.hideStartCampaignPage && typeof $scope.hideStartCampaignPage !== 'undefined') {
      $scope.goToCampaignCreation = function () {
        $scope.campaign = {};
        $scope.campaign.profile_type_id = 1;
        $scope.campaign.raise_mode_id = success.public_setting.site_campaign_raise_modes.default;

        $scope.campaign.name = 'unnamed_campaign';

        if (UserService.isLoggedIn()) {
          Restangular.one('campaign').customPOST($scope.campaign).then(function (response) {
            var id = response.entry_id;
            // promote user to be campaign manager
            var data = {
              campaign_manager: 1,
            };
            UserService.updateUserData(data);

            //redirect
            $location.path('/getstarted/' + id)
          }, function (error) { // if there is an error
            $scope.errorMsg = error.data.message; // get the error message
          });
        } else {
          $timeout(function(){
            $location.path('/login');
          });
        }
      }
    }
  });



  RestFullResponse.all('campaign').getList().then(function (success) {
    $scope.allcampaigns = success.data;
    angular.forEach($scope.allcampaigns, function (value, key) {
      if (value.categories) {
        angular.forEach(value.categories, function (v, k) {
          categoryId[arr_count] = v.category_id;
          arr_count++;
        });
      }
      CampaignSettingsService.processSettings(value.settings);
      value.settings = CampaignSettingsService.getSettings();
    });
    newar = $.unique(categoryId.sort()).sort();
    $.each(newar, function (index, val) { })
    var headers = success.headers();
    $scope.campaignFinished = true;
    checkLoader();
  });

  Restangular.one('portal/setting').getList().then(
    function (success) {
      $scope.public_settings = {};
      angular.forEach(success, function (value) {
        if (value.setting_type_id == 3) {
          $scope.public_settings[value.name] = value.value;
        }
      });

      // allow_thumbnail_video
      if (typeof $scope.public_settings.site_campaign_allow_thumbnail_video == 'undefined') {
        $scope.public_settings.site_campaign_allow_thumbnail_video = true;
      }

      // Exclude ended campaigns from recent
      if (typeof $scope.public_settings.exclude_ended_from_recent == 'undefined') {
        $scope.public_settings.exclude_ended_from_recent = false;
      }

      if ($scope.public_settings.site_theme_category_display) {
        var categoryParam = {
          "active_only": 0
        }
        categoryParam.active_only = !$scope.public_settings.site_theme_category_display_with_campaigns_only ? 1 : 0;
        Restangular.one("portal").customGET("category", categoryParam)
          .then(function (categories) {
            $scope.categories = categories;
            $rootScope.checkhome = $scope.categories;
            $scope.categoryFinished = true;
            checkLoader();
          });
      }

      //Set Video Height
      $scope.setVideoHeight();
      $scope.settingsFinished = true;
      checkLoader();
    },
    function (failure) {
      $msg = {
        'header': failure.data.message,
      }
      $scope.errorMessage.push($msg);
      $scope.settingsFinished = true;
      checkLoader();
    });

  // check if category has campaign
  $scope.hascampaigns = function (id) {
    var bool = 0;
    $.each(newar, function (index, val) {
      if (id == val) {
        bool++;
      } else {

      }
    });
    return bool;

  }

  var get_recent_campaigns = function (recentProjectHideFeatured, exclude_ended_from_recent) {
    if (recentProjectHideFeatured === undefined) {
      recentProjectHideFeatured = false;
    }
    if (exclude_ended_from_recent === undefined) {
      exclude_ended_from_recent = false;
    }

    if (recentProjectHideFeatured) {
      $scope.recent_campaigns_filters = {
        'sort': '-created',
        'filters': {
          'featured': "f"
        },
        'page_entries': $scope.entriesPerType,
      }
    } else {
      if (exclude_ended_from_recent) {
        var sort = 'entry_status_id,-created';
      } else {
        var sort = '-created';
      }
      $scope.recent_campaigns_filters = {
        'sort': sort,
        'page_entries': $scope.entriesPerType,
      }
    }

    if ($scope.public_settings.site_default_campaign_rows && $scope.public_settings.site_default_campaign_rows.recent) {
      var rows = $scope.public_settings.site_default_campaign_rows.recent;
      var entries = 4;
      $scope.entriesPerType = rows * entries;
      $scope.recent_campaigns_filters.page_entries = $scope.entriesPerType;
    }

    // randomize campaign
    // if (campaign_randomize) {
    //   $scope.recent_campaigns_filters["sort"] = $scope.recent_campaigns_filters["sort"].replace("-created", "*random()");
    // }

    // get recent campaigns
    RestFullResponse.all('campaign').getList($scope.recent_campaigns_filters).then(function (success) {
      $scope.recentcampaigns = success.data;
      $scope.recentcampaigns = proccessVideoLinks($scope.recentcampaigns);
      angular.forEach($scope.recentcampaigns, function (value, index) {
        if (value.cities != null) {
          checkNative(value.cities[0]);
        }
        //Minus total_shipping_cost from funded amount if setting is toggled.
        //
        if (typeof $scope.public_settings.site_campaign_exclude_shipping_cost !== 'undefined' && $scope.public_settings.site_campaign_exclude_shipping_cost) {
          value.funded_amount = value.funded_amount - value.total_shipping_cost;
        }

        CampaignSettingsService.processSettings(value.settings);
        value.settings = CampaignSettingsService.getSettings();
        $scope.progressHide = $scope.public_settings.site_campaign_progress_bar_hide;
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
      var headers = success.headers();
      $scope.totalEntriesRecent = headers['x-pager-total-entries'];
      $scope.campaignListFinished = true;
      checkLoader();
    });
  }

  // get featured campaigns
  var getFeaturedCampaigns = function () {

    if ($scope.public_settings.site_default_campaign_rows && $scope.public_settings.site_default_campaign_rows.featured) {
      var rows = $scope.public_settings.site_default_campaign_rows.featured;
      var entries = 4;
      $scope.featuredCampaignsLimit = rows * entries;
    }

    RestFullResponse.all('campaign').getList({
      "sort": '-display_priority',
      'filters': {
        'featured': "t"
      },
      'page_entries': $scope.featuredCampaignsLimit,
    }).then(function (success) {
      $scope.featuredcampaigns = success.data;
      $scope.featuredcampaigns = proccessVideoLinks($scope.featuredcampaigns);
      angular.forEach($scope.featuredcampaigns, function (value, index) {
        if (value.cities != null) {
          checkNative(value.cities[0]);
        }
        //Minus total_shipping_cost from funded amount if setting is toggled.
        if (typeof $scope.public_settings.site_campaign_exclude_shipping_cost !== 'undefined' && $scope.public_settings.site_campaign_exclude_shipping_cost) {
          value.funded_amount = value.funded_amount - value.total_shipping_cost;
        }
        CampaignSettingsService.processSettings(value.settings);
        value.settings = CampaignSettingsService.getSettings();
        $scope.progressHide = $scope.public_settings.site_campaign_progress_bar_hide;
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
      var headers = success.headers();
      $scope.totalEntriesFeatured = headers['x-pager-total-entries'];
      $scope.featuredCampaignFinished = true;
      checkLoader();
    });
  }

  // Checking everything is finished loading
  function checkLoader() {
    if ($scope.campaignFinished && $scope.settingsFinished && $scope.campaignListFinished && $scope.featuredCampaignFinished) {
      $scope.$emit("loading_finished");
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
  $scope.loadMoreFeaturedCampaigns = function () {
    $scope.featuredCampaignsLimit += 12;
    $scope.loadingFeatured = true;
    RestFullResponse.all('campaign').getList({
      "sort": '-display_priority',
      'filters': {
        'featured': "t"
      },
      'page_entries': $scope.featuredCampaignsLimit,
    }).then(function (success) {
      $scope.featuredcampaigns = success.data;
      $scope.featuredcampaigns = proccessVideoLinks($scope.featuredcampaigns);
      angular.forEach($scope.featuredcampaigns, function (value, index) {
        if (value.cities != null) {
          checkNative(value.cities[0]);
        }
        //Minus total_shipping_cost from funded amount if setting is toggled.
        if (typeof $scope.public_settings.site_campaign_exclude_shipping_cost !== 'undefined' && $scope.public_settings.site_campaign_exclude_shipping_cost) {
          value.funded_amount = value.funded_amount - value.total_shipping_cost;
        }
        CampaignSettingsService.processSettings(value.settings);
        value.settings = CampaignSettingsService.getSettings();
        $scope.progressHide = $scope.public_settings.site_campaign_progress_bar_hide;
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
      $scope.featuredCampaignFinished = true;

      var headers = success.headers();
      $scope.totalEntriesFeatured = headers['x-pager-total-entries'];

      $scope.loadingFeatured = false;

      setTimeout(function () {
        $('html, body').animate({
          scrollTop: $("#featureDiscovered").offset().top + $("#featureDiscovered").outerHeight(true) - $(window).height()
        }, 1500);
      }, 1000);

    });
  }
  $scope.loadMoreRecentCampaigns = function () {
    $scope.loadingActive = true;
    $scope.entriesPerType += 12;
    $scope.recent_campaigns_filters['page_entries'] = $scope.entriesPerType;

    // get recent campaigns
    RestFullResponse.all('campaign').getList($scope.recent_campaigns_filters).then(function (success) {
      $scope.recentcampaigns = success.data;;
      $scope.recentcampaigns = proccessVideoLinks($scope.recentcampaigns);
      angular.forEach($scope.recentcampaigns, function (value, index) {
        if (value.cities != null) {
          checkNative(value.cities[0]);
        }
        //Minus total_shipping_cost from funded amount if setting is toggled.
        //
        if (typeof $scope.public_settings.site_campaign_exclude_shipping_cost !== 'undefined' && $scope.public_settings.site_campaign_exclude_shipping_cost) {
          value.funded_amount = value.funded_amount - value.total_shipping_cost;
        }

        CampaignSettingsService.processSettings(value.settings);
        value.settings = CampaignSettingsService.getSettings();
        $scope.progressHide = $scope.public_settings.site_campaign_progress_bar_hide;
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

      var headers = success.headers();
      $scope.totalEntriesRecent = headers['x-pager-total-entries'];

      $scope.loadingActive = false;
      setTimeout(function () {
        $('html, body').animate({
          scrollTop: $("#recentDiscovered").offset().top + $("#recentDiscovered").outerHeight(true) - $(window).height()
        }, 1500);
      }, 1000);

    });
  }

  $scope.getTime = function (campaign) {
    $scope.timeStatusObj = TimeStatusService.getTimeStatus(campaign);
    campaign.timeStatNum = $scope.timeStatusObj.timeStatusNumber;
    campaign.timeStatText = $scope.timeStatusObj.timeStatusText;
  }

  $scope.getTimeZoneAbbr = function (campaign) {
    if (campaign.campaign_started == 'f') {
      campaign.timezoneText = moment().tz(campaign.timezone).zoneAbbr();
    }
  }

  // Set video height
  $scope.setVideoHeight = function () {
    var screenWidth = $(window).width();
    var screenHeight = $('#topbanner-main iframe, #topbanner-main video').height();

    var maxScreenSize = 1440;

    if (screenWidth <= 1024) {
      $('#topbanner-main #video-wrapper').css('height', 'auto');
    } else if (maxScreenSize >= screenWidth) {

      $('#topbanner-main #video-wrapper').css('height', screenHeight);
    } else if (screenWidth > maxScreenSize) {
      $('#topbanner-main #video-wrapper').css('height', '800px');
    }
  }

  // Resize the window and set the video height on #topbanner-main
  $(window).resize(function () {
    $scope.setVideoHeight();
  });

  // Checks region 6 for a link and extracts video id.
  function proccessVideoLinks(campaigns) {
    if (campaigns.length <= 0) {
      return campaigns;
    }
    for (var i = 0; i < campaigns.length; i++) {
      if (campaigns[i].links) {
        var thumbnailVideoLink = "";
        for (var j = 0; j < campaigns[i].links.length; j++) {
          if (campaigns[i].links[j].region_id == RESOURCE_REGIONS.campaign.thumbnail_video) {
            thumbnailVideoLink = campaigns[i].links[j].uri;
          }
        };
        if (thumbnailVideoLink != "") {
          var videoSettings = {
            mute: true,
            autoplay: true
          };
          VideoLinkService.setSettings(videoSettings);

          VideoLinkService.processVideoLink(thumbnailVideoLink, campaigns[i].id);

          campaigns[i].thumbnail_video_type = VideoLinkService.get_video_type();
          campaigns[i].thumbnail_video_link = VideoLinkService.get_video_link();
        }
      }
    };
    return campaigns;
  }

  // translation for campaign top right corner text
  $timeout(function () {
    $scope.campaign_status_corner_closed = $rootScope.checkTranslation("index_closed", "index_status_corner_closed");
  }, 1000);
});

//main page banner background controller
app.controller('mastheadCtrl', function ($scope, Restangular, $timeout, PortalSettingsService, $rootScope) {
  PortalSettingsService.getSettingsObj().then(function (success) {
    var url = success.public_setting.site_theme_main_background.path_external;
    if (url) {
      $rootScope.ogMeta.image = $scope.server + "/static/images/" + url;
      $('.masthead').css('background-image', 'url(' + $rootScope.ogMeta.image + ')');
    } else {
      $rootScope.ogMeta.image = "images/placeholder-images/placeholder_home_bg.png";
      $('.masthead').css('background-image', 'url(' + $rootScope.ogMeta.image + ')');
      $('.masthead').css('background-size', 'cover');
      $('.masthead').css('background-repeat', 'no-repeat');
      $('.masthead').css('background-position', 'center center');
    }
  }, function (failure) {
    $rootScope.ogMeta.image = "images/placeholder-images/placeholder_home_bg.png";
    $('.masthead').css('background-image', 'url(' + $rootScope.ogMeta.image + ')');
    $('.masthead').css('background-size', 'cover');
    $('.masthead').css('background-repeat', 'no-repeat');
    $('.masthead').css('background-position', 'center center');
  });
});