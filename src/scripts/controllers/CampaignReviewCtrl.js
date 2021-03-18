app.controller('campaignReviewCtrl', function ($timeout, $interval, $location, $scope, $filter, $browser, $translatePartialLoader, $translate, $routeParams, Restangular, RESOURCE_REGIONS, API_URL, PortalSettingsService, $rootScope, CampaignSettingsService, UserService, RestFullResponse, DisqusShortnameService, VideoLinkService, SOCIAL_SHARING_OPTIONS, $anchorScroll) {
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  $scope.duration = "";
  $scope.campaign = {};
  var msg;
  $scope.featuredMedia = true;
  $scope.campaignTab = true;

  $scope.campaign_id = $routeParams.campaign_id;
  $scope.user = UserService;
  $scope.$location = $location;
  $rootScope.currentLoc = $location.path();
  window.b = $location.path();
  $rootScope.campaign_path = $location.path();
  $scope.currentAbsUrl = $location.absUrl();
  $scope.stream_pagination = {};
  $scope.stream_filter = {
    'page_entries': 10,
    'page_limit': 100,
    "pagination": {},
    "page": 1
  }
  $scope.organization_name = {};

  var msg;
  $scope.hashcheck = $location.hash();
  var native_lookup;
  $scope.show_section = {};
  $scope.show_section['streamDetail'] = false;
  $scope.stream = {};
  $scope.duration = "";
  $scope.dtype = "";

  $timeout(function () {
    // initiate semantic tabs
    $('#campaign-tabs .menu-tabs .item').tab({
      context: $('#campaign-tabs')
    });
    $('.tabular.menu .item').tab();
  });

  $(document).ready(function () {
    window.scrollTo(0, 0);
  });

  $scope.showCampaign = 0;
  $scope.showFaq = 0;
  $scope.showBacker = 0;
  $scope.showComment = 0;
  $scope.showStream = 0;
  $scope.isPrivateCampaign = /campaign\/private/.test($rootScope.currentLoc);

  var guestContribDisabled = false;
  $scope.note = {};


  // load portal settings
  PortalSettingsService.getSettingsObj().then(function (success) {
    $scope.public_settings = success.public_setting;
    $scope.reward_html_editor = success.public_setting.site_theme_campaign_reward_html_editor;
    native_lookup = success.public_setting.site_theme_shipping_native_lookup;
    $scope.enabledContribution = success.public_setting.site_campaign_contributions;
    $scope.enabledContrubitionRewardsPopup = success.public_setting.site_theme_campaign_reward_modal;
    $scope.contributionInstruction = success.public_setting.site_campaign_contributions_instruction;
    $scope.removeContactUser = success.public_setting.site_campaign_contact_user;
    $scope.enableRewardVariation = success.public_setting.site_theme_campaign_show_reward_enable_variation;
    $scope.isRemoveCampaignFaq = success.public_setting.site_campaign_remove_campaign_faq;
    $scope.isCreatorNameOnly = success.public_setting.site_campaign_display_creator_info_name_only;
    $scope.isCreatorInfoOnMainBlock = success.public_setting.site_campaign_creator_info_display;
    $scope.isBackersOnSidebar = success.public_setting.site_campaign_backers_list_display;
    $scope.isCommentsOnMainBlock = success.public_setting.site_campaign_comments_display;
    $scope.isUpdatesOnMainBlock = success.public_setting.site_campaign_updates_display;
    $scope.isHideBackerProfileLink = success.public_setting.site_campaign_backer_hide_profile_link;
    $scope.isHideBackedCampaignsAmount = success.public_setting.site_campaign_backer_hide_backed_campaigns;
    $scope.isBlurbInSidebar = success.public_setting.site_campaign_move_blurb_sidebar;
    $scope.minContributionAmount = success.public_setting.site_theme_campaign_min_contribute_amount;
    $scope.isCreatorInfoTopBottomOfCampaign = success.public_setting.site_campaign_creator_info_display_top_bottom;
    $scope.isExplainerTextEnabled = success.public_setting.site_campaign_enable_explainer_text;
    $scope.isAllowAnonContactMsg = success.public_setting.site_allow_anonymous_contact_message;
    $scope.moveEmbedBelowCommentsAccordionMobile = success.public_setting.site_campaign_move_embed_below_comments_accordion;
    $scope.moveBackersBelowCreatorAccordionMobile = success.public_setting.site_campaign_move_backers_accordion_below_creator_accordion;
    $scope.moveCreatorInfoToSidebar = success.public_setting.site_campaign_creator_info_display_sidebar;
    $scope.moveSharingButtonsToSidebar = success.public_setting.site_campaign_share_campaign_actions_display_sidebar;
    $scope.site_campaign_enable_organization_name = success.public_setting.site_campaign_enable_organization_name;
    $scope.displayOnlyFbTwitterEmailShare = success.public_setting.site_campaign_share_display_only_fb_email_twitter;
    $scope.displayRewardsMobileTab = success.public_setting.site_campaign_display_reward_on_mobile_tabs;
    $scope.showShareHeaderAfterCampaignCreation = success.public_setting.site_campaign_page_show_share_header;
    $scope.isRemoveCampaignLinks = $scope.public_settings.site_campaign_remove_campaign_links;
    $scope.hideRaiseMode = $scope.public_settings.site_campaign_remove_raise_mode;

    //Inititialize min contribution amount if valid else == 1 
    $scope.pledge_amount = 1;
    if ($scope.minContributionAmount) {
      $scope.pledge_amount = $scope.minContributionAmount;
    }
    if (typeof $scope.public_settings.site_campaign_custom_button == 'undefined' || $scope.public_settings.site_campaign_custom_button == null) {
      $scope.public_settings.site_campaign_custom_button = {
        toggle: false,
        reward: "Choose Reward",
        contribution: "Contribution"
      };
    }
    $scope.customText = $scope.public_settings.site_campaign_custom_button;

    if (success.public_setting.site_contribute_behaviour.default == 4) {
      guestContribDisabled = true;
    } else {
      $scope.cursetting = success;
      if (!$scope.cursetting.public_setting.site_contribute_behaviour.default) {
        $scope.cursetting.public_setting.site_contribute_behaviour.default = 1;
      }
      if ($scope.cursetting.public_setting.site_contribute_behaviour.default == 2) {

        if (UserService.isLoggedIn()) {
          $scope.user_check = false;
        } else {
          $scope.user_check = true;
        }
      }
    }

    // hide campaign info
    if (success.public_setting.site_campaign_hide_creator_info) {
      $scope.site_campaign_hide_creator_info = success.public_setting.site_campaign_hide_creator_info;
    }

    // -- Comment Settings START -- //

    // default message textarea
    $scope.comment_form = {};
    $scope.comment_form.message = "";

    if (success.public_setting.comment_system != null) {
      $scope.comment_system = success.public_setting.comment_system;
    } else {
      // default = disqus
      $scope.comment_system = "disqus";
    }
    // If comment system == disqus, get disqus shortname
    if ($scope.comment_system == "disqus") {
      $scope.hasDisqusShortname;
      DisqusShortnameService.getDisqusShortname().then(function (shortname) {
        $scope.disqus_shortname;

        angular.forEach(shortname, function (value) {
          if (value.setting_type_id == 3) {
            $scope.disqus_shortname = value.value; // required: replace example with your forum shortname
          }
        });
        var disqus_identifier = $scope.campaign_id;
        $scope.identifier = $scope.campaign_id;
        var disqus_url = $location.absUrl();

        // if embed.js is already inserted. call reset function
        if (window.DISQUS) {
          $('<div id="disqus_thread"></div>').insertAfter('#insert_disqus');
          DISQUS.reset({
            reload: true,
            config: function () {
              this.page.identifier = disqus_identifier;
              this.page.url = disqus_url;
            }
          });
        } else {
          if ($scope.disqus_shortname) {
            $('<div id="disqus_thread"></div>').insertAfter('#insert_disqus');
            window.disqus_identifier = disqus_identifier;
            window.disqus_url = disqus_url;
            var dsq = document.createElement('script');
            dsq.type = 'text/javascript';
            dsq.async = true;
            dsq.src = '//' + $scope.disqus_shortname + '.disqus.com/embed.js';
            $('head').append(dsq);
          }
        }
      });
    } else if ($scope.comment_system == "custom") {
      // If comment system == custom
      $scope.comments_show_comment_picture = success.public_setting.custom_comment_show_comment_picture;
      $scope.getComments();

      // Custom Comment styles
      $scope.comments_background_style = {
        "background-color": '#' + success.public_setting.custom_comment_comment_background_color,
        'font-family': success.public_setting.custom_comment_font_family
      };

      $scope.comments_font_color = {
        "color": '#' + success.public_setting.custom_comment_font_color
      };

      if (success.public_setting.custom_comment_auto_refresh) {
        //retrieve comments every minute
        setInterval(function () {
          $scope.getComments();
        }, 60000);
      }
    }
    // -- Comment Settings END-- //
    getCampaign();
  });

  // Default comment parameters
  $scope.sortOrFiltersComments = {
    "sort": '-created',
    "page_entries": 5,
    "page_limit": 100,
    "page": 1,
    "pagination": {}
  };

  // Retrieve all comments, or a comment if comment_id is passed.
  $scope.getComments = function (comment_id, sort_order) {
    // Only change order after user changes it using dropdown
    if (sort_order) {
      $scope.sortOrFiltersComments.sort = sort_order;
    }
    if (!comment_id) {
      //("retrieving all campaign comments");
      RestFullResponse.one('campaign/' + $scope.campaign_id).customGET("comment", $scope.sortOrFiltersComments).then(function (success) {
        $scope.comments = success.data;

        // calculate comment creation time ago
        $scope.comments.forEach(function (comment, index) {
          var secondsElapsed = (Date.now() - Date.parse(comment.created)) / 1000;
          var timePeriod = "";
          var timeNumber = 0;

          if (secondsElapsed < 60) {
            //less than a minute ago
            timeNumber = "";
            timePeriod = "custom_comment_time_less_minute";
          } else if (secondsElapsed < 3600) {
            // less than an hour ago
            timeNumber = parseInt((secondsElapsed / 60));
            timePeriod = (timeNumber == 1) ? "custom_comment_time_a_minute" : "custom_comment_time_minute";

            $scope.comments[index].timeAgo = timePeriod;
          } else if (secondsElapsed < 86400) {
            // less than a day ago
            timeNumber = parseInt((secondsElapsed / 3600));
            timePeriod = (timeNumber == 1) ? "custom_comment_time_a_hour" : "custom_comment_time_hour";

            $scope.comments[index].timeAgo = timePeriod;
          } else if (secondsElapsed < 604800) {
            // less than a week ago
            timeNumber = parseInt((secondsElapsed / 86400));
            timePeriod = (timeNumber == 1) ? "custom_comment_time_a_day" : "custom_comment_time_day";

            $scope.comments[index].timeAgo = timePeriod;
          } else if (secondsElapsed < 2592000) {
            // less than a year ago
            timeNumber = parseInt((secondsElapsed / 604800));
            timePeriod = (timeNumber == 1) ? "custom_comment_time_a_week" : "custom_comment_time_week";

            $scope.comments[index].timeAgo = timePeriod;
          } else if (secondsElapsed < 31557600) {
            // less than a year ago
            timeNumber = parseInt((secondsElapsed / 2592000));
            timePeriod = (timeNumber == 1) ? "custom_comment_time_a_month" : "custom_comment_time_month";

            $scope.comments[index].timeAgo = timePeriod;
          } else {
            // more than a year ago
            timeNumber = parseInt((secondsElapsed / 31557600));
            timePeriod = (timeNumber == 1) ? "custom_comment_time_a_year" : "custom_comment_time_year";

            $scope.comments[index].timeAgo = timePeriod;
          }

          $scope.comments[index].timeNumber = (timeNumber == 1) ? "" : timeNumber;
          $scope.comments[index].timePeriod = timePeriod;


        });

        var headers = success.headers();
        $scope.sortOrFiltersComments.pagination.currentpage = headers['x-pager-current-page'];
        $scope.sortOrFiltersComments.pagination.numpages = headers['x-pager-last-page'];
        $scope.sortOrFiltersComments.pagination.nextpage = headers['x-pager-next-page'];
        $scope.sortOrFiltersComments.pagination.pagesinset = headers['x-pager-pages-in-set'];
        if (!headers['x-pager-total-entries']) {
          $scope.sortOrFiltersComments.pagination.totalentries = 0;
        } else {
          $scope.sortOrFiltersComments.pagination.totalentries = headers['x-pager-total-entries'];
        }
        $scope.sortOrFiltersComments.pagination.entriesperpage = headers['x-pager-entries-per-page'];
      });
    } else {
      //Grab only 1 comment
      var req = Restangular.one('campaign/' + $scope.campaign_id + '/comment/' + comment_id).customGET();
      return req;
    }
  }

  $scope.moment = function (value, suffix) {
    return moment(value).fromNow(suffix);
  }
  $scope.daysEndDateInPast = function (daysEnd, ends, seconds_remaining) {
    if (daysEnd == true) {
      return false;
    }
    if (!seconds_remaining || !ends) return false;

    return !$scope.dateInPast(ends, seconds_remaining);
  }
  $scope.dateInPast = function (value, sec) {
    //return moment(value) < moment(new Date());
    if (sec == 0 || sec == "00" || sec < 0) {
      return true;
    } else {
      return false;
    }
  }

  $scope.rewardExpired = function (value) {
    // if expire date is set for reward
    if (value) {
      // Format date and replace dashes from the first part of the string to backslashes
      var temp = value.split(' ');
      var firstPart = temp[0].replace(/-/g, '/');
      var rewardDateVal = firstPart + ' ' + temp[1];

      var today_date = new Date().toDateString();
      var reward_date = new Date(rewardDateVal).toDateString();
      if (reward_date == today_date) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  $scope.filterRewards = function () {
    var startindex = ($scope.rewardPagination.page - 1) * $scope.rewardPagination.page_entries;
    var endindex = startindex + $scope.rewardPagination.page_entries;
    $scope.campaign.pledges_to_show = angular.copy($scope.campaign.pledges);
    $scope.campaign.pledges_to_show = $scope.campaign.pledges_to_show.slice(startindex, endindex);
    if ($scope.customText.toggle) {
      angular.forEach($scope.campaign.pledges_to_show, function (value, key, obj) {
        obj[key].rewardCustom = $scope.customText.reward;
        var currency = $filter('formatCurrency')(obj[key].amount, $scope.campaign.currencies[0].code_iso4217_alpha, $scope.public_setting.site_campaign_decimal_option);
        var rewardCode = "[reward]";
        if ($scope.customText.toggle == true) {
          var rewardShortCode = obj[key].rewardCustom.indexOf(rewardCode) > -1;
          if (rewardShortCode) {
            obj[key].rewardCustom = obj[key].rewardCustom.replace(rewardCode, currency);
          }
        }
      });
    }
  }

  function getCampaign() {
    Restangular.one('campaign').customGET($scope.campaign_id, {
      use_path_lookup: /campaign\/private/.test($rootScope.currentLoc) ? 1 : 0,
      path: $rootScope.currentLoc.substring(1)
    }).then(function (success) {
      // anchorScroll if there is a hash
      if ($location.hash()) {
        $timeout(function () {
          $anchorScroll();
        });
      }

      // initiate profile types
      $scope.profileTypes = [{
        name: 'Campaign',
        profile_type_id: 1,
      }, {
        name: 'FAQ',
        profile_type_id: 2,
      }, {
        name: 'Backers',
        profile_type_id: 3,
      }, {
        name: 'Streams',
        profile_type_id: 4,
      }, {
        name: 'Comments',
        profile_type_id: 5,
      }];

      $scope.campaign = success;
      $scope.embed_path = $location.absUrl();
      $scope.embed_path = $scope.embed_path.replace(window.b, "/embed/card-view/" + $scope.campaign.entry_id);
      CampaignSettingsService.processSettings($scope.campaign.settings);
      var campaignSettings = CampaignSettingsService.getSettings();


      if (campaignSettings != null && (campaignSettings.enable_rewards_pagination || !campaignSettings.hasOwnProperty("enable_rewards_pagination"))) {
        $scope.progressHide = false;
        if ($scope.public_settings.site_campaign_progress_bar_hide) {
          $scope.progressHide = $scope.public_settings.site_campaign_progress_bar_hide;
        } else {
          $scope.progressHide = $scope.public_settings.site_campaign_progress_bar_hide;
        }
        if (typeof campaignSettings.progress_bar_hide !== 'undefined') {
          $scope.progressHide = campaignSettings.progress_bar_hide;
        }

        //Reward pagination
        $scope.rewardPagination = {
          "page": 1,
          "page_entries": 5,
          "pagination": {
            numpages: 1
          }
        }
      } else {
        //Reward pagination
        $scope.rewardPagination = {
          "page": 1,
          "page_entries": 9999,
          "pagination": {
            numpages: 1
          }
        }
      }

      Restangular.one('account/person', $scope.campaign.managers[0].id).customGET().then(function (success) {
        $scope.managerInfo = success;
      });

      // Get user attributes
      if ($scope.public_settings.site_campaign_enable_organization_name) {
        Restangular.one('portal/person/attribute?filters={"person_id":"' + $scope.campaign.managers[0].id + '"}').customGET().then(function (success) {
          $scope.organization_name.value = success[0].attributes['organization_name'];
          $scope.organization_name.ein = success[0].attributes['ein'];
        });
      }

      if ($scope.campaign.pledges) {
        var requiredNumCalls = parseInt($scope.campaign.pledges.length / $scope.rewardPagination.page_entries);
        if ($scope.campaign.pledges.length % $scope.rewardPagination.page_entries != 0) {
          requiredNumCalls += 1;
        }
        $scope.rewardPagination.pagination.numpages = requiredNumCalls;
        $scope.filterRewards();
      }

      switch ($scope.public_settings.site_campaign_sharing_options) {
        case SOCIAL_SHARING_OPTIONS.sharing_users:
          $scope.is_sharing_available = true;
          break;
        case SOCIAL_SHARING_OPTIONS.sharing_backers:
          $scope.is_sharing_available = false;
          if ($scope.campaign.managers[0].id == $scope.user.id || $scope.user.person_type_id == 1) {
            $scope.is_sharing_available = true;
          }
          break;
        case SOCIAL_SHARING_OPTIONS.sharing_disabled:
          $scope.is_sharing_available = false;
          break;
        default:
          $scope.is_sharing_available = true;
      }

      //Minus total_shipping_cost from funded amount if setting is toggled.
      if (typeof $scope.public_settings.site_campaign_exclude_shipping_cost !== 'undefined' && $scope.public_settings.site_campaign_exclude_shipping_cost) {
        $scope.campaign.funded_amount = $scope.campaign.funded_amount - $scope.campaign.total_shipping_cost;
      }

      // Grab Campaign Settings to use
      angular.forEach($scope.campaign.settings, function (value, index) {
        var setting_name = value.name;
        var setting_value = value.value;
        if (setting_name == "name") {
          return;
        }
        $scope.campaign[setting_name] = setting_value;
        if (!$scope.campaign['profile_type_view_id']) {
          $scope.campaign['profile_type_view_id'] = 0;
        }
        if ($scope.campaign['hide_contribute_button_per_campaign']) {

          $scope.hideThisContribButton = $scope.campaign['hide_contribute_button_per_campaign'];
        }
      });


      if (native_lookup && $scope.campaign.cities) {
        $scope.campaign.cities.forEach(function (value) {
          getNativeName(value);
        });
      }

      CampaignSettingsService.setCampaignId($scope.campaign_id);
      CampaignSettingsService.processSettings(success.settings);
      $scope.campaign.settings = CampaignSettingsService.getSettings();
      if ($scope.campaign.settings.top_header_link) {
        if ($scope.campaign.settings.top_header_link.length <= 0) {
          $scope.campaign.settings.top_header_link = "#";
        }
      }

      if ($scope.campaign.settings.top_header_link == "#") {
        delete $scope.campaign.settings.top_header_link;
      }

      if ($scope.campaign.settings.google_analytics_id) {
        setGACode($scope.campaign.settings.google_analytics_id);
      }

      $scope.remaining_time = $scope.campaign.time_remaining;
      $scope.days_rem = $scope.campaign.days_remaining_inclusive;
      $scope.campaign.timezoneText = moment().tz($scope.campaign.timezone).zoneAbbr();
      $translate(['seconds_to_go', 'second_to_go', 'seconds_ago', 'second_ago', 'minutes_to_go', 'minute_to_go', 'minutes_ago', 'minute_ago', 'hours_to_go', 'hour_to_go', 'hours_ago', 'hour_ago']).then(function (values) {
        if ($scope.days_rem == 0) {
          $scope.days_rem = $scope.campaign.hours_remaining_inclusive;
          if ($scope.days_rem == 0) {
            $scope.days_rem = $scope.campaign.minutes_remaining_inclusive;
            if ($scope.days_rem == 0) {
              $scope.days_rem = $scope.campaign.seconds_remaining_inclusive;
              if ($scope.days_rem >= 1) {
                if ($scope.days_rem > 1) {
                  $scope.day_text = values.seconds_to_go;
                } else {
                  $scope.day_text = values.second_to_go;
                }
              } else {
                $scope.days_rem = $scope.days_rem * -1;
                if ($scope.days_rem > 1) {
                  $scope.day_text = values.seconds_ago;
                } else {
                  $scope.day_text = values.second_ago;
                }
              }
            } else {
              if ($scope.days_rem >= 1) {
                if ($scope.days_rem > 1) {
                  $scope.day_text = values.minutes_to_go;
                } else {
                  $scope.day_text = values.minute_to_go;
                }

              } else {
                $scope.days_rem = $scope.days_rem * -1;
                if ($scope.days_rem > 1) {
                  $scope.day_text = values.minutes_ago;
                } else {
                  $scope.day_text = values.minute_ago;
                }
              }
            }
          } else {
            if ($scope.days_rem >= 1) {
              if ($scope.days_rem > 1) {
                $scope.day_text = values.hours_to_go;
              } else {
                $scope.day_text = values.hour_to_go;
              }

            } else {
              $scope.days_rem = $scope.days_rem * -1;
              if ($scope.days_rem > 1) {
                $scope.day_text = values.hours_ago;
              } else {
                $scope.day_text = values.hour_ago;
              }
            }
          }

        } else {
          if ($scope.days_rem >= 1) {
            if ($scope.days_rem > 1) {
              $scope.day_text = " days to go";
            } else {

              $scope.day_text = " day to go";
            }

          } else {
            $scope.days_rem = $scope.days_rem * -1;
            if ($scope.days_rem > 1) {
              $scope.day_text = "days ago";
            } else {
              $scope.day_text = "day ago";
            }
          }
        }
      });
      
      // duration
      var elapsedSecond = $scope.campaign.seconds_elapsed;
      var elapsedMinute = elapsedSecond / 60;
      var elapsedHour = elapsedMinute / 60;
      var elapsedDay = elapsedHour / 24;
      var elapsedMonth = elapsedDay / 30;
      var elapsedYear = elapsedMonth / 12;

      if (elapsedYear >= 1) {
        $scope.duration = Math.floor(elapsedYear);
        if ($scope.duration > 1) {
          $scope.dtype = "years";
        }
        else {
          $scope.dtype = "year";
        }
      }
      else if (elapsedMonth >= 1) {
        $scope.duration = Math.floor(elapsedMonth);
        if ($scope.duration > 1) {
          $scope.dtype = "months";
        }
        else {
          $scope.dtype = "month";
        }
      }
      else if (elapsedDay >= 1) {
        $scope.duration = Math.floor(elapsedDay);
        if ($scope.duration > 1) {
          $scope.dtype = "days";
        }
        else {
          $scope.dtype = "day";
        }
      }
      else if (elapsedHour >= 1) {
        $scope.duration = Math.floor(elapsedHour);
        if ($scope.duration > 1) {
          $scope.dtype = "hours";
        }
        else {
          $scope.dtype = "hour";
        }
      }
      else if (elapsedMinute >= 1) {
        $scope.duration = Math.floor(elapsedMinute);
        if ($scope.duration > 1) {
          $scope.dtype = "minutes";
        }
        else {
          $scope.dtype = "minute";
        }
      }
      else if (elapsedSecond >= 1) {
        $scope.duration = Math.floor(elapsedSecond);
        if ($scope.duration > 1) {
          $scope.dtype = "seconds";
        }
        else {
          $scope.dtype = "second";
        }
      }
      //end duration
 

      msg = {
        'header': "Maximum funding goal has been reached for this campaign",
      }
      if (!$scope.campaign.maximum_allowed_funds_raised) {
        $scope.thresholdallowed = false;
        $scope.thresholdallowedbtn = false;
      } else {
        if ($scope.campaign.funded_amount >= $scope.campaign.maximum_allowed_funds_raised) {
          $scope.thresholdallowed = true;
          $scope.thresholdallowedbtn = true;
          $scope.successMessage.push(msg);
        } else {
          $scope.thresholdallowedbtn = false;
          $scope.thresholdallowed = true;
        }
      }

      //campaign.streams
      $scope.FAQ = success.faqs;
      if (success.faqs) {
        $scope.faqs = success.faqs.length;
      }
      $scope.campaign.campaign_links = [];
      // filter all types of links we get
      if (success.links) {
        angular.forEach(success.links, function (value) {
          // filter links
          if (value.region_id == 1 && value.resource_content_type_id == 1 && value.resource_type == "link") {
            // video links
            $scope.campaign.video = value.uri.replace(/https?:\/\//gi, $location.protocol() + '://');
            VideoLinkService.processVideoLink($scope.campaign.video, "");
            $scope.campaign.video_type = VideoLinkService.get_video_type();
            if ($scope.campaign.video_type == "custom") {
              $scope.campaign.video = VideoLinkService.get_video_link();
            }
          }
          if (value.region_id == 2) {
            // campaign links
            $scope.campaign.campaign_links.push(value);
          }
        });
      }
      // disable pledge-level selection when the campaign ends
      if (success.ends) {
        // if campaign ended
        if ($scope.dateInPast(success.ends, success.seconds_remaining)) {
          $scope.disabled = true;
        }
      }
      // pop no description message if campaign has no description
      if (!success.description) {
        $scope.noDescription = true;
      }
      // pop placeholder image if campaign has no region 3 image files
      if (success.files) {
        var hasMainImage = false;
        angular.forEach(success.files, function (value) {
          if (value.region_id == 3) {
            hasMainImage = true;
            return;
          }
        });
        if (!hasMainImage) {
          $scope.noMainImage = true;
        }
      } else {
        $scope.noMainImage = true;
      }

      //get backer list
      $scope.backers_pagination = {
        "sort": '-created',
        "page_entries": 10,
        "page_limit": 100,
        "page": 1,
        "pagination": {}
      };
      $scope.campaign['backers'] = [];

      $scope.getBackers = function () {
        RestFullResponse.all('campaign/' + success.entry_id + '/backer').getList($scope.backers_pagination).then(
          function (success) {
            $scope.campaign.backers = success.data;
            var headers = success.headers();
            if (!headers['x-pager-total-entries']) {
              $scope.backer_length = '0'
            } else {
              if ($scope.campaign.backer_offset) {
                $scope.backer_length = parseInt(headers['x-pager-total-entries']) + parseInt($scope.campaign.backer_offset)
              } else {
                $scope.backer_length = parseInt(headers['x-pager-total-entries']);
              }
            }
            $scope.backers_pagination.currentpage = headers['x-pager-current-page'];
            $scope.backers_pagination.numpages = headers['x-pager-last-page'];
            $scope.backers_pagination.nextpage = headers['x-pager-next-page'];
            $scope.backers_pagination.pagesinset = headers['x-pager-pages-in-set'];
            $scope.backers_pagination.totalentries = headers['x-pager-total-entries'];
            $scope.backers_pagination.entriesperpage = headers['x-pager-entries-per-page'];

          }
        ).then(function(){
          if ($scope.public_settings.site_theme_campaign_backer_option != null) {
            if ($scope.public_settings.site_theme_campaign_backer_option == '2') {
              $scope.hideb = true;
              $scope.showBacker = 0;
            }
            if ($scope.public_settings.site_theme_campaign_backer_option == '1') {
              $scope.showBacker = 1;
              $scope.validUser = 1;
            }
            if ($scope.public_settings.site_theme_campaign_backer_option == '0') {
              $scope.showBacker = 0;
              $scope.validUser = 1;
            }
            if ($scope.public_settings.site_theme_campaign_backer_option == '3') {
              if ($scope.user.auth_token) {
                $scope.showBacker = 1;
                $scope.validUser = 1;
              } else {
                $scope.showBacker = 0;
                $scope.validUser = 0;
              }
            }
          } else {
            $scope.showBacker = 1;
            $scope.validUser = 1;
          }
          $scope.backer_show = (($scope.showBacker || (($scope.showBacker || $scope.campaign.backers.length) && $scope.public_settings.site_theme_campaign_backer_option != '2')) && $scope.validUser);
        });
      }
      $scope.getBackers();

      $scope.campaign['streams'] = [];
      RestFullResponse.all('campaign/' + success.entry_id + '/stream').getList($scope.stream_filter).then(
        function (success) {
          $scope.campaign.streams = success.data;
          var headers = success.headers();
          $scope.stream_pagination.currentpage = headers['x-pager-current-page'];
          $scope.stream_pagination.numpages = headers['x-pager-last-page'];
          $scope.stream_pagination.nextpage = headers['x-pager-next-page'];
          $scope.stream_pagination.pagesinset = headers['x-pager-pages-in-set'];
          $scope.stream_pagination.totalentries = headers['x-pager-total-entries'];
          $scope.stream_pagination.entriesperpage = headers['x-pager-entries-per-page'];

          if ($scope.public_settings.site_campaign_updates_display && $location.search().stream) {
            var stream_id = $location.search().stream;
            setTimeout(function () {
              angular.element('#campaign').click();
              angular.element('#streams').click();
              var element = $element.find('#stream-' + stream_id);
              element[0].scrollIntoView();
            }, 0);
          }


        });


      // check for hash and making the tab active
      $scope.checklink = function () {
        var translate = $translate.instant(['campaign_page_campaigntitle', 'campaign_page_faq', 'campaign_page_rewardstitle', 'campaign_page_backers', 'campaign_page_streams', 'campaign_page_comments', 'campaign_page_files']);

        if ($location.hash()) {
          $('#campaign').removeClass('active');
          $('#campaign-seg').removeClass('active');

          var hash = $location.hash();
          switch (hash) {
            case translate.campaign_page_faq:
              var faqLength = 0;
              if ($scope.campaign.faqs && typeof $scope.campaign.faqs[0] != 'undefined') {
                faqLength = $scope.campaign.faqs[0].faq_pairs.length;
              }
              $('.menu-tabs .item').removeClass('active');
              $('#faq').addClass('active');
              $('#mobile-faq').addClass('active');
              $('#faq-seg').addClass('active');
              break;
            case translate.campaign_page_backers:
              $('.menu-tabs .item').removeClass('active');
              $('#backer').addClass('active');
              $('#mobile-backer').addClass('active');
              $('#backer-seg').addClass('active');
              break;
            case translate.campaign_page_streams:
              $('.menu-tabs .item').removeClass('active');
              $('#stream').addClass('active');
              $('#mobile-stream').addClass('active');
              $('#stream-seg').addClass('active');
              break;
            case translate.campaign_page_comments:
              $('.menu-tabs .item').removeClass('active');
              $('#comment').addClass('active');
              $('#mobile-comment').addClass('active');
              $('#comment-seg').addClass('active');
              break;
            case translate.campaign_page_campaigntitle:
              $('.menu-tabs .item').removeClass('active');
              $('#campaign').addClass('active');
              $('#mobile-campaign').addClass('active');
              $('#campaign-seg').addClass('active');
              break;
            case translate.campaign_page_rewardstitle:
              $('.menu-tabs .item').removeClass('active');
              $('#rewards').addClass('active');
              $('#mobile-rewards').addClass('active');
              $('#rewards-seg').addClass('active');
              break;
            case translate.campaign_page_files:
              $('.menu-tabs .item').removeClass('active');
              $('#file').addClass('active');
              $('#mobile-file').addClass('active');
              $('#file-seg').addClass('active');
              break;
          }
        }
      }

      setTimeout(function () {
        $scope.checklink();
      }, 500);

      // setting hash for the link
      $scope.makeLink = function (id) {
        var linkpath = $location.path();
        $location.path(linkpath).hash(id).replace();
        $scope.hashcheck = $location.hash();
      }

      // Toggle campaign dropdown items using url hash
      $scope.toggleHash = function (selectedItemKey) {
        var translatedKey = $translate.instant(selectedItemKey);
        $location.search('').replace();
        $scope.makeLink(translatedKey);
        $scope.checklink();
      }

      // Override original page title once we get campaign name back
      $rootScope.page_title = $scope.campaign.name ? $scope.campaign.name + ' - ' + $rootScope.site_company : $rootScope.site_company;
      $rootScope.ogMeta.title = $rootScope.page_title;

      if ($scope.campaign.files) {
        // find the current campaign thumnail image
        var max_id = -1,
          image_index = -1;
        for (var i = 0; i < $scope.campaign.files.length; i++) {
          if ($scope.campaign.files[i].region_id === 3) {
            if ($scope.campaign.files[i].id > max_id) {
              max_id = $scope.campaign.files[i].id;
              image_index = i;
            }
          }
        }
        $rootScope.ogMeta.image = $scope.server + '/image/campaign_detail_large/' + $scope.campaign.files[image_index].path_external;
      }

      Restangular.one('portal/setting').getList().then(
        function (success) {
          $scope.public_settings = {};
          $scope.public_settings.site_theme_campaign_display_iso_date = success.site_theme_campaign_display_iso_date;
          angular.forEach(success, function (value) {
            if (value.setting_type_id == 3) {
              $scope.public_settings[value.name] = value.value;
            }
          });

          if (typeof $scope.public_settings.site_campaign_custom_button == 'undefined' || $scope.public_settings.site_campaign_custom_button == null) {
            $scope.public_settings.site_campaign_custom_button = {
              toggle: false,
              reward: "Choose Reward",
              contribution: "Contribution"
            };
          }
          $scope.customText = $scope.public_settings.site_campaign_custom_button;
          $scope.contribution = $scope.customText.contribution;

          var shortCode = "[min]";

          var currency = $filter('formatCurrency')($scope.public_settings.site_theme_campaign_min_contribute_amount, $scope.campaign.currencies[0].code_iso4217_alpha, $scope.public_setting.site_campaign_decimal_option);
          if ($scope.customText.toggle == true) {
            var contributionShortCode = $scope.contribution.indexOf(shortCode) > -1;
            if (contributionShortCode) {
              $scope.contribution = $scope.contribution.replace(shortCode, currency);
            }
          }


          if ($scope.public_settings.site_theme_campaign_min_button_show) {
            $scope.minamount = $scope.public_settings.site_theme_campaign_min_contribute_amount;
          } else {
            $scope.minamount = 1;
          }
          if (typeof $scope.public_settings.site_theme_campaign_per_min != 'undefined' && $scope.public_settings.site_theme_campaign_per_min) {
            if (typeof $scope.campaign.min_contribution != 'undefined') {
              $scope.minamount = $scope.campaign.min_contribution;
            }
          }
          if (typeof $scope.public_settings.site_theme_campaign_faq_option != "undefined") {
            if ($scope.public_settings.site_theme_campaign_faq_option == '2') {
              $scope.hidef = true;
              $scope.showFaq = 0;
            }
            if ($scope.public_settings.site_theme_campaign_faq_option == '1') {

              $scope.showFaq = 1;
            }
            if ($scope.public_settings.site_theme_campaign_faq_option == '0') {

              $scope.showFaq = 0;
            }
          } else {
            $scope.showFaq = 1;
          }

          if ($scope.public_settings.site_theme_campaign_comment_option != null) {
            if ($scope.public_settings.site_theme_campaign_comment_option == '2') {
              $scope.hidec = true;
              $scope.showComment = 0;
            }
            if ($scope.public_settings.site_theme_campaign_comment_option == '1') {
              $scope.showComment = 1;
            }
          } else {
            $scope.showComment = 1;
          }

          if ($scope.public_settings.site_theme_campaign_stream_option != null) {
            if ($scope.public_settings.site_theme_campaign_stream_option == '2') {
              $scope.hides = true;
              $scope.showStream = 0;
            }
            if ($scope.public_settings.site_theme_campaign_stream_option == '1') {
              $scope.showStream = 1;
            }
            if ($scope.public_settings.site_theme_campaign_stream_option == '0') {
              $scope.showStream = 0;
            }
          } else {
            $scope.showStream = 1;
          }

          $scope.comment_form.anonymous = $scope.public_settings.custom_comment_anonymous_force;

          // Show/Hide Campaign Minimum amount message
          if (typeof $scope.public_settings.site_theme_campaign_hide_min_contribute_message == "undefined") {
            $scope.public_settings.site_theme_campaign_hide_min_contribute_message = false;
          }
          if ($scope.user.person_id == 1 || $scope.user.person_id == $scope.campaign.managers[0].person_id) {
            $scope.validUser = 1;
          } else {
            $scope.validUser = 0;
          }
        },
        function (failure) {
          $msg = {
            'header': failure.data.message,
          }
          $scope.errorMessage.push($msg);
        });

      // Emit event for hiding loader.
      $scope.$emit("loading_finished");

      if ($location.search().scroll_to_reward == 1) {

        if ($scope.displayRewardsMobileTab && $(window).width() < 767) {
          $scope.scrollToMobileRewardsTab();
        } else {
          $scope.scrollToRewards();
        }
      }

    }, function (failure) {
      $location.path('404');
    });
  }

  // call getNote function
  getNote();
  $scope.$emit("loading_finished");

  /* this will open a modal for the admin to type in the note */
  $scope.addNotes = function (fieldName, key) {
    $translate(fieldName).then(function(value) {
      $scope.noteFieldName = value;
    });
    $scope.noteFieldKey = key; 
    $('.ui.modal.admin-notes').modal('show');
  };

  function getNote() {
    // server request to get admin note
    Restangular.one('campaign', $scope.campaign_id).one('note').customGET().then(function (success) {
      if (success && success.length) {
        $scope.note = success[0].value;
        $scope.note.id = success[0].id;
      }
    });
  }

  /* this function is called when admin wants to save the note */
  $scope.saveNote = function () {
    var data = {
      value: $scope.note,
    };
    if ($scope.note.id) {
      // if note id exists, use PUT request
      Restangular.one('campaign', $scope.campaign_id).one('note', $scope.note.id).customPUT(data);
    } else {
      Restangular.one('campaign', $scope.campaign_id).one('note', $scope.note.id).customPOST(data);
    }
  };

  $scope.action = function (actionName) {
    var data = {
      entry_status_id: '',
    }
    msg = {
      'loading': true,
      'loading_message': 'updating_campaign_status'
    }
    $rootScope.floatingMessage = msg;
    if (actionName == 'approve') {
      data.entry_status_id = 2;
      Restangular.one('campaign', $scope.campaign_id).customPUT(data).then(function (success) {
        msg = {
          'header': "approve_campaign"
        };
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();

      }, function (failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    } else if (actionName == 'disapprove') {
      data.entry_status_id = 3;
      Restangular.one('campaign', $scope.campaign_id).customPUT(data).then(function (success) {
        msg = {
          'header': "disapprove_campaign"
        };
        $rootScope.floatingMessage = msg;
        //$location.path('/admin/dashboard');
      }, function (failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
  };

  $scope.removeNote = function (fieldName) {
    $scope.note[fieldName] = "";
    $scope.saveNote();
  }

  $scope.dateInPast = function (value, sec) {
    //return moment(value) < moment(new Date());
    if (sec == 0 || sec == "00" || sec < 0) {
      return true;
    } else {
      return false;
    }
  }
  $scope.toggleFeaturedMedia = function (media) {
    if (media == 'image') {
      $scope.featuredMedia = true;
    }
    if (media == 'video') {
      $scope.featuredMedia = false;
    }
  }
  $scope.toggleCampaignTab = function (tab) {
    if (tab == 'campaign') {
      $scope.campaignTab = true;
    }
    if (tab == 'faq') {
      $scope.campaignTab = false;
    }
  }

  function checkTime() {
    // duration
    var elapsedSecond = $scope.campaign.seconds_elapsed;
    var elapsedMinute = elapsedSecond / 60;
    var elapsedHour = elapsedMinute / 60;
    var elapsedDay = elapsedHour / 24;
    var elapsedMonth = elapsedDay / 30;
    var elapsedYear = elapsedMonth / 12;

    if (elapsedYear >= 1) {
      $scope.duration = Math.floor(elapsedYear);
      if ($scope.duration > 1) {
        $scope.dtype = "years";
      }
      else {
        $scope.dtype = "year";
      }
    }
    else if (elapsedMonth >= 1) {
      $scope.duration = Math.floor(elapsedMonth);
      if ($scope.duration > 1) {
        $scope.dtype = "months";
      }
      else {
        $scope.dtype = "month";
      }
    }
    else if (elapsedDay >= 1) {
      $scope.duration = Math.floor(elapsedDay);
      if ($scope.duration > 1) {
        $scope.dtype = "days";
      }
      else {
        $scope.dtype = "day";
      }
    }
    else if (elapsedHour >= 1) {
      $scope.duration = Math.floor(elapsedHour);
      if ($scope.duration > 1) {
        $scope.dtype = "hours";
      }
      else {
        $scope.dtype = "hour";
      }
    }
    else if (elapsedMinute >= 1) {
      $scope.duration = Math.floor(elapsedMinute);
      if ($scope.duration > 1) {
        $scope.dtype = "minutes";
      }
      else {
        $scope.dtype = "minute";
      }
    }
    else if (elapsedSecond >= 1) {
      $scope.duration = Math.floor(elapsedSecond);
      if ($scope.duration > 1) {
        $scope.dtype = "seconds";
      }
      else {
        $scope.dtype = "second";
      }
    }
    //end duration 
  }

  // setting hash for the link
  $scope.makeLink = function (id) {
    var linkpath = $location.path();
    $location.path(linkpath).hash(id).replace();
    $scope.hashcheck = $location.hash();
  }
  $scope.showManager = function () {
    $window.open('profile/' + $scope.campaign.managers[0].person_id);
  }

  $scope.getTotalStream = function () {
    var tmp = parseInt($scope.stream_pagination.entriesperpage) * parseInt($scope.stream_filter.page_limit);
    if (tmp > $scope.stream_pagination.totalentries) {
      return $scope.stream_pagination.totalentries;
    } else {
      return tmp;
    }
  }

  $scope.toDate = function (str) {
    if (str && str.length) {
      var d = str.substring(0, 10);
      var lst = str.substring(0, 10).split('-');
      var time = str.substring(11, 16);
      var f = new Date(lst[0], lst[1] - 1, lst[2]);
      return d + "  " + time;
    }
  }

  $scope.showStreamDeail = function (stream, index) {
    $scope.stream = stream;
    //$('#streamfull').empty();
    $scope.stream.sindex = index;
    $location.search('stream', stream.id).replace();
  }
  check_path();

  function check_path() {
    var params = $location.search();
    if (params.stream) {
      $('#campaign-tabs .ui.menu .item').tab('change tab', 'streams');
      $scope.show_section.streamDetail = true;
      Restangular.one('campaign', $scope.campaign_id).one('stream', params.stream).customGET().then(function (success) {
        $scope.stream = success;
      });
    }
  }

  // Animated scroll to rewards section
  $scope.scrollToRewards = function () {
    $timeout(function () {

      $('html, body').animate({
        scrollTop: $('#campaign-seg #rewards-list').offset().top - 15
      }, 500);
    }, 800);
  }

  // Scroll to rewards section and set dropdown item to active
  $scope.scrollToMobileRewardsTab = function () {
    var rewardsString = $translate.instant('campaign_page_rewardstitle');
    $timeout(function () {
      if ($location.hash() !== rewardsString) {
        $location.search('').replace();
        $scope.makeLink(rewardsString);
        $scope.checklink();
      }

      $('html, body').animate({
        scrollTop: $('#rewards-seg #rewards-list').offset().top - 15
      }, 500);
    }, 800);
  }

});
