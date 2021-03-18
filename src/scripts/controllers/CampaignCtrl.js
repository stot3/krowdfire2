app.controller('CampaignCtrl', function(
  $timeout,
  $http,
  $element,
  $anchorScroll,
  $rootScope,
  $scope,
  $filter,
  $translate,
  $window,
  PortalSettingsService,
  RESOURCE_REGIONS,
  Restangular,
  $location,
  UserService,
  DisqusShortnameService,
  RestFullResponse,
  CampaignSettingsService,
  $sce,
  ANONYMOUS_COMMENT,
  SOCIAL_SHARING_OPTIONS,
  VideoLinkService,
  PaypalService
) {
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  $scope.campaign_id = $rootScope.campaignId;
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
  $scope.dropdown = {};

  var msg;
  $scope.hashcheck = $location.hash();
  var native_lookup;
  //=======================stream list variables================================
  $scope.show_section = {};
  $scope.show_section['streamDetail'] = false;
  $scope.stream = {};
  $scope.duration = "";
  $scope.dtype = "";

  $(document).ready(function() {
    window.scrollTo(0, 0);
  });

  $scope.facebook_url = null;

  $scope.showCampaign = 0;
  $scope.showFaq = 0;
  $scope.showBacker = 0;
  $scope.showComment = 0;
  $scope.showStream = 0;
  $scope.isPrivateCampaign = /campaign\/private/.test($rootScope.currentLoc);

  var guestContribDisabled = false;

  PortalSettingsService.getSettingsObj().then(function(success) {
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
    $scope.displayCampaignDisclaimer = success.public_setting.site_campaign_campaign_toggle_disclaimer_text;


    //Check facebook app id
    if ($scope.public_settings.hasOwnProperty('site_facebook_app_id')) {
      $rootScope.facebook_app_id = $scope.public_settings.site_facebook_app_id;
    }

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
      DisqusShortnameService.getDisqusShortname().then(function(shortname) {
        $scope.disqus_shortname;
        angular.forEach(shortname, function(value) {
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
            config: function() {
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
      })
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
        setInterval(function() {
          $scope.getComments();
        }, 60000);
      }
    }
    // -- Comment Settings END-- //
    getCampaign();
  });

  if ($scope.showShareHeaderAfterCampaignCreation) {
    if (document.referrer) {
      var prevUrl = document.referrer.split("/");
      var prevPage = prevUrl[prevUrl.length - 2];

      if (prevPage == "campaign-preview" || prevPage == "complete-funding") {
        $scope.fromCreation = true;
      } else {
        $scope.fromCreation = false;
      }
    } else {
      $scope.fromCreation = false;
    }
  }


  if (typeof $scope.public_settings.site_campaign_goog_shortener == 'undefined' || !$scope.public_settings.site_campaign_goog_shortener == null) {
    $scope.public_settings.site_campaign_goog_shortener = {
      toggle: false,
      code: ''
    };
  }

  if (typeof $scope.public_settings.site_campaign_goog_shortener !== undefined && $scope.public_settings.site_campaign_goog_shortener.toggle) {
    $http({
      method: 'POST',
      url: 'https://www.googleapis.com/urlshortener/v1/url?key=' + $scope.public_settings.site_campaign_goog_shortener.code,
      data: '{"longUrl": "' + $location.absUrl() + '"}'
    }).then(function successCallback(response) {
      // this callback will be called asynchronously}
      // when the response is available
      $scope.shortenedUrl = response.data.id;
    });
  } else {
    $scope.shortenedUrl = $location.absUrl();
  }

  // -- Comment Functions START-- //

  // Comment Form Validation
  var comment_error_msg = $translate.instant('custom_commment_form_error_msg');
  setTimeout(function() {
    $('.comment-form')
      .form({
        comment_message: {
          identifier: 'comment_message',
          rules: [{
            type: 'empty',
            prompt: comment_error_msg
          }]
        }
      }, {
        inline: true,
        onSuccess: function(event) {
          event.preventDefault();
        }
      });
  });

  switch ($scope.public_settings.custom_comment_anonymous_commenting) {
    case ANONYMOUS_COMMENT.anonymous_disabled:
      $scope.is_anonymous_available = false;
      break;
    case ANONYMOUS_COMMENT.anonymous_backers:
      $scope.is_anonymous_available = false;
      var backerFilters = {
        "person_id": $scope.user.id
      };
      Restangular.one("campaign", $scope.campaign_id).customGET("backer?filters=" + JSON.stringify(backerFilters)).then(function(success) {
        var successArr = success.plain();
        if (successArr != null && successArr.length > 0) {
          $scope.is_anonymous_available = true;
        }
      });
      break;
    case ANONYMOUS_COMMENT.anonymous_users:
      $scope.is_anonymous_available = true;
      break;
    default:
      $scope.is_anonymous_available = false;
  }

  // Add comment
  $scope.addComment = function(comment_form) {
    if (!comment_form.message) {
      return;
    }

    $scope.sendComment = {};
    if (comment_form.comment_title) {
      $scope.sendComment['title'] = comment_form.comment_title;
    }
    $scope.sendComment['entry_id'] = $scope.campaign_id;
    $scope.sendComment['message'] = comment_form.message;
    $scope.sendComment['anonymous'] = comment_form.anonymous;

    Restangular.one('campaign/' + $scope.campaign_id + '/comment').customPOST($scope.sendComment).then(function(success) {
      $scope.getComments();
      $scope.comment_form = {
        "anonymous": $scope.public_settings.custom_comment_anonymous_force
      };
    });
  }

  // Delete comment
  $scope.deleteComment = function(comment_id) {
    Restangular.one('campaign/' + $scope.campaign_id + '/comment/' + comment_id).customDELETE().then(function() {
      $scope.getComments();
    });
  }

  // Update comment
  $scope.updateComment = function(comment_form) {
    $scope.changeComment = {};
    if (comment_form.title) {
      $scope.changeComment['title'] = comment_form.title;
    }
    $scope.changeComment['entry_id'] = $scope.campaign_id;
    $scope.changeComment['message'] = comment_form.message;
    $scope.changeComment['comment_id'] = comment_form.comment_id;
    Restangular.one('campaign/' + $scope.campaign_id + '/comment/' + comment_form.comment_id).customPUT($scope.changeComment).then(function(success) {
      $scope.getComments();
    });
  }

  function setVote() {
    Restangular.one('campaign/' + $scope.campaign_id + '/comment/' + $scope.comment_action['comment_id'] + "/comment-action").customPOST($scope.comment_action).then(function(success) {
      $scope.getComments();
    });
  }

  $scope.setUpVote = function(isAnonymous) {
    if (isAnonymous) {
      $scope.comment_action['anonymous'] = true;
      setVote();
    } else {
      setVote();
    }
  }

  // Other comment actions, including reply, upvote, downvote
  $scope.commentAction = function(comment_action, comment_id) {
    // if not logged in
    if (!$scope.user.person_id) {
      return;
    }
    $scope.comment_action = {};
    // Upvote
    if (comment_action == "upvote") {
      $scope.comment_action['entry_id'] = $scope.campaign_id;
      $scope.comment_action['comment_action_type_id'] = 1;
      $scope.comment_action['comment_id'] = comment_id;
      if ($scope.is_anonymous_available) {
        $timeout(function() {
          $("#vote-anonymous").modal("show");
        });
      } else {
        $scope.comment_action['anonymous'] = false;
        setVote();
      }
    }
    // Downvote
    else if (comment_action == "downvote") {
      $scope.comment_action['entry_id'] = $scope.campaign_id;
      $scope.comment_action['comment_action_type_id'] = 2;
      $scope.comment_action['comment_id'] = comment_id;
      if ($scope.is_anonymous_available) {
        $timeout(function() {
          $("#vote-anonymous").modal("show");
        });
      } else {
        $scope.comment_action['anonymous'] = false;
        setVote();
      }
    }
    // Reply
    else if (comment_action == "reply") {
      $scope.comment_form.message += "'@" + comment_id + "' \n";

      //scrolls to text area and focus
      var commentMessageTextarea = document.querySelector('.ui.tab.active .custom_comment_message');
      $anchorScroll();
      commentMessageTextarea.focus();
    }
  }

  // Default comment parameters
  $scope.sortOrFiltersComments = {
    "sort": '-created',
    "page_entries": 5,
    "page_limit": 100,
    "page": 1,
    "pagination": {}
  };

  // Retrieve all comments, or a comment if comment_id is passed.
  $scope.getComments = function(comment_id, sort_order) {
    // Only change order after user changes it using dropdown
    if (sort_order) {
      $scope.sortOrFiltersComments.sort = sort_order;
    }
    if (!comment_id) {
      //("retrieving all campaign comments");
      RestFullResponse.one('campaign/' + $scope.campaign_id).customGET("comment", $scope.sortOrFiltersComments).then(function(success) {
        $scope.comments = success.data;

        // calculate comment creation time ago
        $scope.comments.forEach(function(comment, index) {
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

  // Modal function, for update and delete boxes
  $scope.openModalById = function(id, comment_id) {
    if (id == 'update-comment') {
      var old_comment = $scope.getComments(comment_id);
      old_comment.then(function(success) {
        $scope.old_comment = success.plain();
        $('.ui.modal#' + id).modal('show');
      });
    } else {
      $scope.current_selected_comment_id = comment_id;
      $('.ui.modal#' + id).modal('show');
    }
  }

  // -- Comment Functions END-- //

  $scope.moment = function(value, suffix) {
    return moment(value).fromNow(suffix);
  }
  $scope.daysEndDateInPast = function(daysEnd, ends, seconds_remaining) {
    if (daysEnd == true) {
      return false;
    }
    if (!seconds_remaining || !ends) return false;

    return !$scope.dateInPast(ends, seconds_remaining);
  }
  $scope.dateInPast = function(value, sec) {
    //return moment(value) < moment(new Date());
    if (sec == 0 || sec == "00" || sec < 0) {
      return true;
    } else {
      return false;
    }
  }

  $scope.rewardExpired = function(value) {
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

  $scope.filterRewards = function() {
    var startindex = ($scope.rewardPagination.page - 1) * $scope.rewardPagination.page_entries;
    var endindex = startindex + $scope.rewardPagination.page_entries;
    $scope.campaign.pledges_to_show = angular.copy($scope.campaign.pledges);
    $scope.campaign.pledges_to_show = $scope.campaign.pledges_to_show.slice(startindex, endindex);
    if ($scope.customText.toggle) {
      angular.forEach($scope.campaign.pledges_to_show, function(value, key, obj) {
        obj[key].rewardCustom = $scope.customText.reward;
        var currency_iso = " ";
        if ($scope.campaign.currencies != null) {
          currency_iso = $scope.campaign.currencies[0].code_iso4217_alpha;
        }
        var currency = $filter('formatCurrency')(obj[key].amount, currency_iso, $scope.public_setting.site_campaign_decimal_option);
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
    }).then(function(success) {

      $timeout(function() {
        // initiate semantic tabs
        $('#campaign-tabs .menu-tabs .item').tab({
          context: $('#campaign-tabs')
        });
        $('.tabular.menu .item').tab();
      }, 100);
      // anchorScroll if there is a hash
      if ($location.hash()) {
        $timeout(function() {
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

      $scope.progressHide = false;
      if ($scope.public_settings.site_campaign_progress_bar_hide) {
        $scope.progressHide = $scope.public_settings.site_campaign_progress_bar_hide;
      // } else if ($scope.campaign.settings.progress_bar_hide){
      //   $scope.progressHide = $scope.campaign.settings.progress_bar_hide;
      } else {
        $scope.progressHide = $scope.public_settings.site_campaign_progress_bar_hide;
      }
      if (typeof campaignSettings.progress_bar_hide !== 'undefined') {
        $scope.progressHide = campaignSettings.progress_bar_hide;
      }

      Restangular.one('account/person', $scope.campaign.managers[0].id).customGET().then(function(success) {
        $scope.managerInfo = success;
      });

      // Get user attributes
      if ($scope.public_settings.site_campaign_enable_organization_name) {
        Restangular.one('portal/person/attribute?filters={"person_id":"' + $scope.campaign.managers[0].id + '"}').customGET().then(function(success) {
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
      angular.forEach($scope.campaign.settings, function(value, index) {
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
        $scope.campaign.cities.forEach(function(value) {
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

      setMeta();
      $scope.remaining_time = $scope.campaign.time_remaining;
      $scope.days_rem = $scope.campaign.days_remaining_inclusive;
      $scope.campaign.timezoneText = moment().tz($scope.campaign.timezone).zoneAbbr();
      $translate(['seconds_to_go', 'second_to_go', 'seconds_ago', 'second_ago', 'minutes_to_go', 'minute_to_go', 'minutes_ago', 'minute_ago', 'hours_to_go', 'hour_to_go', 'hours_ago', 'hour_ago']).then(function(values) {
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
        angular.forEach(success.links, function(value) {
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
        angular.forEach(success.files, function(value) {
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

      $scope.getBackers = function() {
        RestFullResponse.all('campaign/' + success.entry_id + '/backer').getList($scope.backers_pagination).then(
          function(success) {
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
        function(success) {
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
            setTimeout(function() {
              angular.element('#campaign').click();
              angular.element('#streams').click();
              var element = $element.find('#stream-' + stream_id);
              element[0].scrollIntoView();
            }, 0);
          }


        });


      // check for hash and making the tab active
      $scope.checklink = function() {
        var translate = $translate.instant(['campaign_page_campaigntitle', 'campaign_page_faq', 'campaign_page_rewardstitle', 'campaign_page_backers', 'campaign_page_streams', 'campaign_page_comments', 'campaign_page_files']);

        if ($location.hash()) {
          $('#campaign').removeClass('active');
          $('#campaign-seg').removeClass('active');

          var hash = $location.hash();

          $scope.campaignTabHash = hash;
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

      setTimeout(function() {
        $scope.checklink();
      }, 500);

      // setting hash for the link
      $scope.makeLink = function(id) {
        var linkpath = $location.path();
        $location.path(linkpath).hash(id).replace();
        $scope.hashcheck = $location.hash();
      }

      // Toggle campaign dropdown items using url hash
      $scope.toggleHash = function(selectedItemKey) {
        var translatedKey = $translate.instant(selectedItemKey);
        $location.search('').replace();
        $scope.makeLink(translatedKey);
        $scope.checklink();

        $scope.campaignTabHash = translatedKey;
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

      function setMeta() {
        var metaTags = [{
          "type": "name",
          "name": "author",
          "content": $scope.campaign.managers[0].first_name
        }, {
          "type": "name",
          "name": "keyword",
          "content": $scope.campaign.categories ? $scope.campaign.categories[0].name : ''
        }, {
          "type": "name",
          "name": "description",
          "content": $scope.campaign.blurb || ''
        }];
        for (var i = 0; i < metaTags.length; i++) {
          var meta = "<meta ";
          meta += metaTags[i].type;
          meta += " = '";
          meta += metaTags[i].name;
          meta += "' content = '";
          meta += metaTags[i].content;
          meta += "' class='jMeta'> \n";
          $("meta[property]").first().before(meta);
          if (metaTags[i].type = "description") {
            $rootScope.ogMeta.description = metaTags[i].content;
          }
        }
      }

      Restangular.one('portal/setting').getList().then(
        function(success) {
          $scope.public_settings = {};
          $scope.public_settings.site_theme_campaign_display_iso_date = success.site_theme_campaign_display_iso_date;
          angular.forEach(success, function(value) {
            if (value.setting_type_id == 3) {
              $scope.public_settings[value.name] = value.value;
            }
          });

          PaypalService.init($scope.campaign)

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
          var currency_iso = " ";
          if ($scope.campaign.currencies != null) {
            currency_iso = $scope.campaign.currencies[0].code_iso4217_alpha;
          }
          var currency = $filter('formatCurrency')($scope.public_settings.site_theme_campaign_min_contribute_amount, currency_iso, $scope.public_setting.site_campaign_decimal_option);
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
        function(failure) {
          $msg = {
            'header': failure.data.message,
          }
          $scope.errorMessage.push($msg);
        });

      // Emit event for hiding loader.
      if($scope.campaign.pledges_to_show){
        $scope.campaign.pledges_to_show.forEach(function(pledge){
          if(pledge.attributes.variation != undefined) {
            pledge.attributes.variation.forEach(function(vari){
              $scope.dropdown[vari.name] = 0;
            });
          }
        });
      }
      $scope.$emit("loading_finished");
      
      $scope.preselectRewardAttributes();

      if ($location.search().scroll_to_reward == 1) {

        if ($scope.displayRewardsMobileTab && $(window).width() < 767) {
          $scope.scrollToMobileRewardsTab();
        } else {
          $scope.scrollToRewards();
        }
      }

    }, function(failure) {
      $location.path('404');
    });
  }

  // Animated scroll to rewards section
  $scope.scrollToRewards = function() {
    $timeout(function() {

      $('html, body').animate({
        scrollTop: $('#campaign-seg #rewards-list').offset().top - 15
      }, 500);
    }, 800);
  }

  // Scroll to rewards section and set dropdown item to active
  $scope.scrollToMobileRewardsTab = function() {
    var rewardsString = $translate.instant('campaign_page_rewardstitle');
    $timeout(function() {
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

  $scope.absurl = $location.absUrl();


  /*************************************************************************/
  //popup modal
  $scope.pledgeModal = function(pledge) {
    $('#pledge-modal').modal('show');
    $scope.oAmount = pledge.amount; // variable to hold original pledge amount
    $scope.pledgeAmount = pledge.amount; // binding with the html input
    $scope.pledgeDescription = pledge.description;
    $scope.pledgeName = pledge.name;
    $scope.pledgeLevel = pledge.pledge_level_id;
  }
  $scope.amountNextLevel = false;

  // showing the backer profile
  $scope.visitProfile = function(backerData, event) {
    if (!$scope.isHideBackerProfileLink && typeof $scope.isHideBackerProfileLink !== 'undefined' || !backerData.anonymous_contribution && !backerData.anonymous_contribution_partial) {
      $window.open('profile/' + backerData.person_id);
    } else {
      event.preventDefault();
    }
  }

  $scope.showManager = function() {
    $window.open('profile/' + $scope.campaign.managers[0].person_id);
  }

  $scope.getTotalStream = function() {
    var tmp = parseInt($scope.stream_pagination.entriesperpage) * parseInt($scope.stream_filter.page_limit);
    if (tmp > $scope.stream_pagination.totalentries) {
      return $scope.stream_pagination.totalentries;
    } else {
      return tmp;
    }
  }

  $scope.toDate = function(str) {
    if (str && str.length) {
      var d = str.substring(0, 10);
      var lst = str.substring(0, 10).split('-');
      var time = str.substring(11, 16);
      var f = new Date(lst[0], lst[1] - 1, lst[2]);
      console.log(d + " " + time);
      return d + " " + time;
    }
  }

  $scope.showStreamDeail = function(stream, index) {
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
      Restangular.one('campaign', $scope.campaign_id).one('stream', params.stream).customGET().then(function(success) {
        $scope.stream = success;
      });
    }
  }

  $scope.selectRewardAttribute = function($event, choiceItem, index) {
    var el = angular.element($event.currentTarget).parent().parent().find('input[name="variation_value"]').first();
    $(el).attr('data-attribute', choiceItem.value);
    $(el).attr('value', choiceItem.value);
  }

  // submit pledge
  $scope.submitPledge = function($event, pledge, index) {
    $location.search({});
    var rewardAttr = [];
    angular.element($event.currentTarget).parent().find('#reward-variation-' + index).first().find('input[name="variation_value"]').each(function() {
      rewardAttr.push($(this).attr('data-attribute'));
    });

    // Check if clicking on <a> inside reward or not. If is, then disable the redirect
    if (!($('.pledge-level .ng-isolate-scope a:hover').length)) {
      if (!$scope.enabledContribution) {
        $(".ui.modal.contribution-instruction").modal("show");
      } else if (UserService.isLoggedIn() || guestContribDisabled) {
        // if user is logged in redirect to regular user pledge page
        // also if guest contribution is disabled, go to this page(force login)
        $location.path('/pledge-campaign').search('eid', $rootScope.campaignId).search('plid', pledge.pledge_level_id).search('m', pledge.amount).search('m', pledge.amount).search('attr', rewardAttr);
        if (/campaign\/private/.test($rootScope.currentLoc)) {
          $location.search("privatepath", $rootScope.currentLoc.substring(1));
        }
      } else {
        // if it is a guest, redirect to guest pledge page
        $location.path('/inline-contribution').search('eid', $rootScope.campaignId).search('plid', pledge.pledge_level_id).search('m', pledge.amount).search('attr', rewardAttr);
        if (/campaign\/private/.test($rootScope.currentLoc)) {
          $location.search("privatepath", $rootScope.currentLoc.substring(1));
        }
      }
    }
  };

  $scope.submitContribute = function() {
    if (!$scope.enabledContribution) {
      if (UserService.isLoggedIn()) {
        $(".ui.modal.contribution-instruction").modal("show");
      } else {
        $location.path('/login');
      }
    } else if (UserService.isLoggedIn() || guestContribDisabled) {
      // also if guest contribution is disabled, go to this page(force login)
      $location.path('/pledge-campaign').search('m', $scope.pledge_amount).search('eid', $scope.campaign_id);
      if (/campaign\/private/.test($rootScope.currentLoc)) {
        $location.search("privatepath", $rootScope.currentLoc.substring(1));
      }
    } else {
      $location.path('/inline-contribution').search('m', $scope.pledge_amount).search('eid', $scope.campaign_id);
      if (/campaign\/private/.test($rootScope.currentLoc)) {
        $location.search("privatepath", $rootScope.currentLoc.substring(1));
      }
    }
  }

  $scope.miniContributeReward = function() {
    if (!$scope.enabledContribution) {
      $(".ui.modal.contribution-instruction").modal("show");
    } else if ($scope.enabledContrubitionRewardsPopup && $scope.campaign.pledges) {
      $(".ui.modal.rewards-popup-modal").modal("show");
    } else if (UserService.isLoggedIn() || guestContribDisabled) {
      // also if guest contribution is disabled, go to this page(force login)
      $location.path('/pledge-campaign').search('m', $scope.pledge_amount).search('eid', $scope.campaign_id);
      if (/campaign\/private/.test($rootScope.currentLoc)) {
        $location.search("privatepath", $rootScope.currentLoc.substring(1));
      }
    } else {
      $location.path('/inline-contribution').search('m', $scope.pledge_amount).search('eid', $scope.campaign_id);
      if (/campaign\/private/.test($rootScope.currentLoc)) {
        $location.search("privatepath", $rootScope.currentLoc.substring(1));
      }
    }


  };

  function getNativeName(cityObj) {
    var name = "";
    if (cityObj.country_native_name != null) {
      name += cityObj.country_native_name;
      cityObj.country = cityObj.country_native_name;
    } else {
      name += cityObj.country;
    }
    if (cityObj.subcountry_native_name != null) {
      name += " " + cityObj.subcountry_native_name;
      cityObj.subcountry = cityObj.subcountry_native_name;
    } else {
      name += " " + cityObj.subcountry;
    }
    if (cityObj.city_native_name != null && cityObj.city != "Other") {
      name += ", " + cityObj.city_native_name;
      cityObj.city = cityObj.city_native_name;
    } else if (cityObj.city != "Other") {
      name += ", " + cityObj.city;
    } else {
      cityObj.city = "";
    }
    cityObj.city_full = name;
    cityObj.name = name;
    return cityObj;
  }

  function setGACode(gaId) {
    var script = "<script>" +
      "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){" +
      "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o)," +
      "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)" +
      "})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');" +


      "ga('create','" + gaId + "', 'auto', 'id" + $scope.campaign_id + "');" +
      "ga('id" + $scope.campaign_id + ".send', 'pageview');" +

      "</script>";

    $scope.gaScript = $sce.trustAsHtml(script);
  }

  // Force browser to reload
  $scope.$on('$locationChangeSuccess', function(event) {
    if (!$location.hash()) {}
  });

  $scope.$on("$routeChangeStart", function(event, next, current) {
    // remove ga obj
    if (window.hasOwnProperty("ga")) {
      ga.remove("id" + $scope.campaign_id + ".remove");
    }
  });

  //////////////////////////////////////////////////////////
  // Contact User Start
  //////////////////////////////////////////////////////////
  $scope.receiver = {};
  $scope.message = {
    'first_name': '',
    'last_name': '',
    'email': '',
  };
  $scope.user_list_page = 1;
  $scope.user_list_page_entries = 10;
  var msg;

  $scope.isLoggedin = UserService.isLoggedIn();


  // PortalSettingsService.getSettingsObj().then(function (success) {
  //     $scope.isAllowAnonContactMsg = success.public_setting.site_allow_anonymous_contact_message;
  // });

  $scope.showContactModal = function(user) {
    if (user) {
      $scope.receiver = user;
    }

    if (UserService.isLoggedIn() || $scope.isAllowAnonContactMsg) {
      if (!user) {
        if ($('.contact-user-modal').modal('is active')) {
          $('.ui modal').modal('hide all');
          $('.ui dimmer').dimmer('hide');
        }
        $('.contact-user-modal').modal('show');
        $('.contact-user-modal').modal('setting', {
          onApprove: $scope.sendUserMessage
        });
      } else {
        if ($('.contact-message-modal').modal('is active')) {
          $('.ui modal').modal('hide all');
          $('.ui dimmer').dimmer('hide');
        }
        $('.contact-message-modal').modal('show');
        $('.contact-message-modal').modal('setting', {
          onApprove: $scope.sendContactMessage
        });
      }
    } else {
      $('.log-in-required-modal').modal('show');
    }
  }

  // Validate message form
  $scope.validateMessage = function(form_target) {
    var translation = $translate.instant(['contact_message_missing_subject', 'contact_message_missing_body', 'contact_message_missing_recipient', 'contact_message_missing_first_name', 'contact_message_missing_last_name', 'contact_message_missing_email', 'contact_email_validate_error']);
    var fields = {
      subject: {
        identifier: 'subject',
        rules: [{
          type: 'empty',
          prompt: translation.contact_message_missing_subject
        }]
      },
      body: {
        identifier: 'body',
        rules: [{
          type: 'empty',
          prompt: translation.contact_message_missing_body
        }]
      },
      recipient: {
        identifier: 'recipient',
        rules: [{
          type: 'empty',
          prompt: translation.contact_message_missing_recipient
        }]
      },
      first_name: {
        identifier: 'first_name',
        rules: [{
          type: 'empty',
          prompt: translation.contact_message_missing_first_name
        }]
      },
      last_name: {
        identifier: 'last_name',
        rules: [{
          type: 'empty',
          prompt: translation.contact_message_missing_last_name
        }]
      },
      email: {
        identifier: 'email',
        rules: [{
            type: 'empty',
            prompt: translation.contact_message_missing_email
          },
          {
            type: 'email',
            prompt: translation.contact_email_validate_error
          }
        ]
      },
    };

    if (form_target == "contact-message") {
      $('.ui.form.contact-message').form(fields, {
        inline: true,
        onSuccess: function() {
          $scope.validMessage = true;
        },
        onFailure: function() {
          $scope.validMessage = false;
        }
      }).form('validate form');
    }
    if (form_target == "contact-user") {
      $('.ui.form.contact-user').form(fields, {
        inline: true,
        onSuccess: function() {
          $scope.validMessage = true;
        },
        onFailure: function() {
          $scope.validMessage = false;
        }
      }).form('validate form');
    }
  }

  // Sends contact message to a preset user.
  $scope.sendContactMessage = function() {
    $scope.validateMessage("contact-message");

    if ($scope.validMessage) {
      // Need to replace newline with actual html tags to render properly in email clients
      $scope.message.body = $scope.message.body.replace(/(\r\n|\n|\r)/gm, "<br>");
      $scope.message['person_id'] = $scope.receiver.id;
      msg = {
        loading_message: "action_sending",
        loading: true
      }
      $rootScope.floatingMessage = msg;

      Restangular.one('account/message').customPOST($scope.message).then(
        function(success) {
          $translate('message_sentto').then(function(value) {
            msg = {
              'header': value + " " + $scope.receiver.first_name + " " + $scope.receiver.last_name,
            };
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          });
          $scope.cleartext();
        },
        function(failure) {
          msg = {
            'header': failure.data.message,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        }
      );
      $('.contact-message-modal').modal('hide');
    } else {
      return false;
    }
  }

  // Send message to a receiver specified by the user.
  $scope.sendUserMessage = function() {
    $scope.validateMessage("contact-user");
    if ($scope.validMessage) {
      // Need to replace newline with actual html tags to render properly in email clients
      var data = {
        "body": $scope.message.body.replace(/(\r\n|\n|\r)/gm, "<br>"),
        "person_id": $scope.receiver.id,
        "subject": $scope.message.subject
      };
      msg = {
        loading_message: "action_sending",
        loading: true
      };
      $rootScope.floatingMessage = msg;
      Restangular.one('account/message').customPOST(data).then(
        function(success) {
          $translate('message_sentto').then(function(value) {
            msg = {
              'header': value + " " + $scope.receiver.first_name + " " + $scope.receiver.last_name,
            };
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          });
          $scope.cleartext();
          // Update Message Center
          $scope.$emit("composed_new_message");
        },
        function(failure) {
          msg = {
            'header': failure.data.message,
          };
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        }
      );
      $('.contact-user-modal').modal('hide');
    } else {
      return false;
    }
  }

  // Sets the values of the user to send a message to.
  $scope.setRecipient = function(event) {

    var first_name = event.target.attributes["first-name"].value;
    var last_name = event.target.attributes["last-name"].value;
    var id = event.target.attributes["data-value"].value;

    $scope.receiver.id = id;
    $scope.receiver.first_name = first_name;
    $scope.receiver.last_name = last_name;
  }

  // Sets the values of the user to send a message to.
  $scope.setRecipientOnEnter = function(event) {
    // Only update on enter key
    if (event.keyCode == 13) {
      var updatedRecipient = angular.element("div.to-user a.profile-link");
      var first_name = updatedRecipient[0].attributes["first-name"].value;
      var last_name = updatedRecipient[0].attributes["last-name"].value;
      var id = updatedRecipient[0].attributes["user-id"].value;

      $scope.receiver.id = id;
      $scope.receiver.first_name = first_name;
      $scope.receiver.last_name = last_name;
    }
  }

  // Get new list of users.
  $scope.updateUserList = function(name) {
    // Reset to first page.
    $scope.user_list_page = 1;
    $scope.getPeopleNames(name);
  }

  // Get list of usernames for composing messages
  $scope.getPeopleNames = function(name, append) {
    $scope.append = false;
    if (append !== undefined) {
      $scope.append = append;
    }
    var filters = {
        "filters": {
          "name": name,
        },
        "page": $scope.user_list_page,
        "page_entries": $scope.user_list_page_entries,
      }
      /*Restangular.one("portal/person-public").get(filters).then(function(success, limit){*/
    RestFullResponse.all('portal/person-public').getList(filters).then(function(success) {
      $scope.pagination_info = success.headers();

      if (!$scope.append) {
        $scope.list_users = [];
      }

      for (var i in success.data) {
        if (success.data[i] !== undefined &&
          success.data[i] !== null &&
          typeof success.data[i] == "object") {
          if ("id" in success.data[i]) {
            $scope.list_users.push(success.data[i]);
          }
        }
      }

      // Need timeout or semantic function will not run correctly.
      // Show drop down if more results are found since semantic hides dropdown before api result is returned.
      $timeout(function() {
        if ($scope.list_users.length > 0) {
          $(".recipient.dropdown").dropdown("show");
        }
      }, 0);

    }, function(failed) {
      $scope.list_users = false;
    });
  }

  // Adjust page number variable.
  var pageAdjust = function(adjust) {
    if ($scope.user_list_page + adjust > 0) {
      $scope.user_list_page += adjust;
    }
  }

  // Increments page and append to current list of users.
  $scope.appendNextPage = function() {
    // Don't try to add next page if already on the last page.
    if ($scope.user_list_page >= $scope.pagination_info["x-pager-last-page"]) {
      return;
    }
    pageAdjust(1);
    $scope.getPeopleNames($scope.message.receiver, true);
  }

  // Increment page number and retreive new list of users.
  $scope.nextPage = function() {
    pageAdjust(1);
    $scope.getPeopleNames($scope.message.receiver);
  }

  // Decrement page number and retreive new list of users.
  $scope.previousPage = function() {
    pageAdjust(-1);
    $scope.getPeopleNames($scope.message.receiver);
  }

  // Clears the form data.
  $scope.cleartext = function() {
    $('#subject').val('');
    $('#message').val('');
    $('#subject-user').val('');
    $('#message-user').val('');
    if ($scope.message !== undefined) {
      if ("subject" in $scope.message) {
        $scope.message.subject = "";
      }
      if ("body" in $scope.message) {
        $scope.message.body = "";
      }
      if ("first_name" in $scope.message) {
        $scope.message.first_name = "";
      }
      if ("last_name" in $scope.message) {
        $scope.message.last_name = "";
      }
      if ("email" in $scope.message) {
        $scope.message.email = "";
      }
    }
  }

  // Load list of users on load.
  $scope.getPeopleNames("");
  //////////////////////////////////////////////////////////
  // Contact User End
  //////////////////////////////////////////////////////////

  $scope.reloadFacebook = function() {
  }

  $scope.preselectRewardAttributes = function(){
    if($scope.campaign.pledges_to_show){
      angular.forEach($scope.campaign.pledges_to_show, function(pledge){
        if(pledge.attributes.variation != undefined) {
          pledge.attributes.variation.foreach(function(vari){
           if(!$('#dropdown-'+vari.name).dropdown('get value')){
            $('#dropdown-'+vari.name).dropdown('set selected', vari.choice[0].value);
            var el = $('#dropdown-'+vari.name).children()[0];
            $(el).attr('data-attribute', vari.choice[0].value);
           }
          });
        }
      });
    }
  };

  $scope.setValue = function(index) {
    $dropdown[index] = 0;
  }
  
});
