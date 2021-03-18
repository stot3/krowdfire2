//------------------------------------------------------
//          PORTAL SETTINGS MAIN CONTROLLER
//------------------------------------------------------

app.controller('PortalSettingCtrl', function($location, $browser, $compile, $rootScope, $scope, $translate, RESOURCE_REGIONS, $translatePartialLoader, Restangular, CreateCampaignService, FONT_FAMILY, PortalSettingsService, RequestCacheService) {
  $scope.formData = {};
  $scope.font_list = FONT_FAMILY;

  $scope.clearMessage = function() {
    $rootScope.floatingMessage = [];
  };
  var msg;
  $scope.$emit("loading_finished");
  // global scope variables
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  $scope.stripe_fee = {};
  // $scope.persons = {};
  $scope.page = {
    showHtml: false,
  };
  // $scope.campaign = {};
  $scope.home_url = $location.protocol() + "://" + $location.host() + $browser.baseHref();

  $scope.successShown = false;
  $scope.errorShown = false;
  // $scope.successMessage = [];
  // $scope.errorMessage = [];
  $scope.error = false;

  $scope.showportals = false;

  // edit, add page
  $scope.pageShown = false;

  $scope.froalaOptionsContributionInfo = {};

  function initiateOptions(foption) {
    for (var prop in $rootScope.froalaOptions) {
      if ($rootScope.froalaOptions.hasOwnProperty(prop)) {
        foption[prop] = $rootScope.froalaOptions[prop];
      }
    }
  }

  initiateOptions($scope.froalaOptionsContributionInfo);

  // home page text setting
  $scope.home_page_text = {
    "main_banner": {
      "header_one": "Acme Helps!",
      "header_two": "Crowdfund, anywhere and anytime!",
      "paragraph": "We are here to help you fundraise your own creative campaign!",
      "display": "text",
      "html": "",
      "display_button": true,
    },
    "middle_header": "Be passionate, explore and share your ideas!",
    "bottom_banner": {
      "header_top": "Why choose us?",
      "paragraph": "We're helping out many unique campaigns around the world in order for them to accomplish their fundraising goals. Whether it's a small amount or huge amount of money, We are here to help you and don't worry about owing us right away! Take your time until your funding is done!",
      "header_bottom": "Each and every project is unique with your own creations. Still eager to know more?",
      "left_column": {
        'icon_class': "circular thumbs up icon",
        'display': 1,
        'header': "Easy to use",
        "paragraph": "We have the easiest steps for you to start your campaign. You will be creating one in no time!",
      },
      "middle_column": {
        'icon_class': "circular certificate icon",
        "display": 1,
        "header": "Trusted",
        "paragraph": "We are a fully licensed company, with professionals helping us fund you what you need!",
      },
      "right_column": {
        'icon_class': "circular globe icon",
        "display": 1,
        "header": "Global",
        "paragraph": "You will gain so much exposure you won't even realize it! We also offer our services to almost all the countries in the world.",
      },
      "display": "text",
      "html": ""
    },
    "titles": {
      "top_title": "Featured Projects",
      "bottom_title": "Recent Projects",
    }
  }

  $scope.footer_text = {
    'media_header': 'Follow our Social Media to keep yourself updated!',
  };

  $scope.explore_page_text = {
    'banner_header': "Start exploring different possibilities and passion!",
    "display": "text",
    "html": "",
  }

  // HTML CONTENT
  $scope.home_page_html_content = {
    'main_banner': "",
    "bottom_banner": "",
  }

  $scope.explore_page_html_content = {
      'top_banner': "",
    }
    // detect location hash
  var hashVal = $location.hash();

  // Variables for events and dimmer DOM
  var includeLoaded = false;
  var translationLoaded = false;
  $scope.showDimmer = false;

  // tabStatus object that indicates if tabs have been visited/loaded before
  var tabStatus = {
    "reports": true,
    "users": false,
    "categories": false,
    "campaigns": false,
    "portal-settings": false,
    "pages": false,
    "api-settings": false
  };

  // hash value handler
  if (hashVal) {
    $('.portal-setting-tabs').find('[data-tab]').removeClass('active');
    $('.portal-setting-tabs').find('[data-tab=' + hashVal + ']').addClass('active');
  }
  if ($location.hash() == 'reports' || $location.hash() == "") {
    $scope.showreports = true;
  } else if ($location.hash() == 'portal-settings') {
    $scope.showportals = true;
  } else if ($location.hash() == 'pages') {
    $scope.showpages = true;
  } else if ($location.hash() == 'campaigns') {
    $scope.showcampaigns = true;
  } else if ($location.hash() == 'categories') {
    $scope.showcategories = true;
  } else if ($location.hash() == 'site-menus') {
    $scope.showSiteMenus = true;
  } else if ($location.hash() == 'coupons') {
    $scope.showcoupons = true;
  } else if ($location.hash() == 'users') {
    $scope.showusers = true;
  } else if ($location.hash() == "web-settings") {
    $scope.showapi = true;
  } else if ($location.hash() == "subscription-settings") {
    $scope.showSubscriptionSettings = true;
  }

  // Upon when page loads, we set status for it so loader wouldn't show
  if ($location.hash() == "") {
    tabStatus['reports'] = true;
  } else {
    tabStatus[$location.hash()] = true;
  }

  RequestCacheService.getCategory().then(function(success) {
    $scope.categories = success;
  })

  // click hash function
  var lastTab = "";
  $scope.clickHash = function(tabName) {
    var currentTabStatus = false;
    $scope.showDimmer = false;
    $('.partialLoading .dimmer').dimmer('hide');
    includeLoaded = false;

    // If user clicks other tabs before $includeContentLoaded fires
    // Manually make it true since it's most likely loaded
    if (lastTab != "") {
      tabStatus[lastTab] = true;
      $scope["show" + lastTab] = true;
    }

    if (tabName == "reports") {
      $scope.showreports = true;
    } else if (tabName == 'users') {
      $scope.showusers = true;
    } else if (tabName == 'categories') {
      $scope.showcategories = true;
    } else if (tabName == 'site-menus') {
      $scope.showSiteMenus = true;
    } else if (tabName == 'campaigns') {
      $scope.showcampaigns = true;
    } else if (tabName == 'coupons') {
      $scope.showcoupons = true;
    } else if (tabName == 'portal-settings') {
      $scope.showportals = true;
    } else if (tabName == 'pages') {
      $scope.showpages = true;
    } else if (tabName == 'web-settings') {
      $scope.showapi = true;
    } else if (tabName == 'subscription-settings') {
      $scope.showSubscriptionSettings = true;
    }

    // Checks if this page has been visited before
    // If not, then we show dimmer and loading screen as it needs time to fetch
    if (!tabStatus[tabName]) {
      $scope.showDimmer = true;
      $('.partialLoading .dimmer').dimmer({
        closable: false
      }).dimmer('show');
    }

    // Update the tab status to visited
    tabStatus[tabName] = true;
    lastTab = tabName;
    $location.hash(tabName).replace();
  };

  /* initialize semantic tabbing*/
  $('#admin-setting-tabs .menu-tabs .item').tab({
    context: $('#admin-setting-tabs')
  });

  // show go back button in user edit tabs
  $scope.showGoBack = true;

  window.a = $scope;

  // check all boxes
  $scope.checkall = function($evt, wrapper_class) {
    var $elem = $evt.currentTarget;
    var elem = angular.element($elem);
    var input = elem.children('input:checkbox').prop('checked');
    if (input) {
      $(wrapper_class).find('.ui.checkbox').checkbox('uncheck');
    } else {
      $(wrapper_class).find('.ui.checkbox').checkbox('check');
    }
  }

  // global functions
  $scope.clearMessage = function() {
    $scope.selectErrorShown = [];
  }

  $scope.replaceStyleTag = function(content) {
    return content;
  }

  $scope.replaceInsideStyleTag = function(content) {
    return content;
  }

  //validate email address
  function isValidEmailAddress(emailAddress) {
    var temp = emailAddress.match(/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/);
    if (temp) {
      return true;
    }
    return false;
  };

  // page request used in settings tab
  RequestCacheService.getPage().then(function(success) {
    for (var i = 0; i < success.length; i++) {
      var page = success[i];
      if (page.content) {
        page.content = $scope.replaceStyleTag(page.content);
      }
      if (!page.meta) {
        page.meta = [];
      }
    }
    $scope.pages = success;

  });

  //get currencies
  Restangular.one('account/stripe/currency').customGET().then(function(success) {
    $scope.stripeSupportedCurrencies = success;

    $scope.defaultCurrency = $scope.stripeSupportedCurrencies[0];
    PortalSettingsService.getSettingsObj().then(function(success) {
      var tmp = success.public_setting.site_campaign_fee_currency;
      if (tmp) {
        $scope.stripeSupportedCurrencies = tmp;
        $scope.defaultCurrency = tmp[0];
      }
    });
  });

  // Listening to event that indicats the content in ngInclude has been loaded or not
  // If both event, this and the one beneath it, have run, then we can hide dimmer
  $scope.$on('$includeContentLoaded', function() {
    if (!includeLoaded) {
      includeLoaded = true;
      if (includeLoaded) {
        $('.partialLoading .dimmer').dimmer('hide');
        $scope.showDimmer = false;
      }
    }
  });


});



//------------------------------------------------------
//         REPORT TAB / REPORT CONTROLLER
//------------------------------------------------------
app.controller('AdminReportsCtrl', function($scope, $timeout, $translatePartialLoader, $translate, Restangular) {
  $scope.report = {};

  $scope.strToDate = function(str) {
    var date = new Date(str);
    return date.toString().substring(4, 21);
  }

  $scope.formatMoney = function(num) {
    var ret = 0;
    if (num) {
      ret = parseInt(num);
    }
    var tmp = ret / 1;
    return ret.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  $scope.calTotalEarn = function() {
    return $scope.formatMoney($scope.stripe_fee.campaign_fee * $scope.report.total_campaign_funding_raised_capture_complete / 100.0);
  }

  $scope.refreshReport = function() {
    Restangular.one('portal/stats').customGET().then(function(success) {
      $scope.report = success;
      $("#myloader").fadeOut(4000, function() {
        $('body').removeClass("loading");
      });
      $scope.chart1 = [{
        value: parseInt($scope.report.total_campaigns_sent_for_review),
        color: "#F7464A",
        highlight: "#FF5A5E",
        label: 'Sent for Review',
      }, {
        value: parseInt($scope.report.total_campaigns_being_reviewed),
        color: "#46BFBD",
        highlight: "#5AD3D1",
        label: "Being Reviewed",
      }, {
        value: parseInt($scope.report.total_campaigns_cancelled),
        color: "#FDB45C",
        highlight: "#FFC870",
        label: "Cancelled",
      }, {
        value: parseInt($scope.report.total_campaigns_being_edited),
        color: "#FFB6EC",
        highlight: "#FFCEF3",
        label: "Being Edited",
      }, {
        value: parseInt($scope.report.total_campaigns_not_funded),
        color: "#F7464A",
        highlight: "#FF5A5E",
        label: "Not Funded",
      }, {
        value: parseInt($scope.report.total_campaigns_processing_processing_capture),
        color: "#9FFFFF",
        highlight: "#D9FFFF",
        label: "Processing Capture",
      }, {
        value: parseInt($scope.report.total_campaigns_processing_accepted_capture),
        color: "#3399FF",
        highlight: "#99CCFF",
        label: "Capture Accepted",
      }, {
        value: parseInt($scope.report.total_campaigns_processing_pre_auth),
        color: "#CCFF66",
        highlight: "#E0FFA3",
        label: "Pre Authorizing",
      }, {
        label: "Paused",
        color: "#FF5050",
        highlight: "#FFA8A8",
        value: parseInt($scope.report.total_campaigns_paused),
      }, {
        label: "Capture Declined",
        color: "#6666FF",
        highlight: "#B2B2FF",
        value: parseInt($scope.report.total_campaigns_processing_declined_capture),
      }, {
        label: "Running",
        color: "#00CC66",
        highlight: "#80E6B2",
        value: parseInt($scope.report.total_campaigns_running),
      }, {
        label: "Capture Completed",
        color: "#3333CC",
        highlight: "#8585E0",
        value: parseInt($scope.report.total_campaigns_processing_capture_complete),
      }, {
        label: "Not Approved",
        color: "#FF3399",
        highlight: "#FF99CC",
        value: parseInt($scope.report.total_campaigns_not_approved),
      }];

      var ctx = $('#chart1').get(0).getContext('2d');
      $scope.myDoughnutChart = new Chart(ctx);

      $scope.myDoughnutChart.Doughnut($scope.chart1, {}).update();

      $scope.chart2 = {
        labels: ["Funding Sought Total", "Funding Sought Running", "Funding Sought Captured",
          "Funding Raised Running", "Sought Capture Completed", "Raised Capture Completed"
        ],
        datasets: [{
          label: "My First dataset",
          fillColor: "rgba(151,187,205,0.5)",
          strokeColor: "rgba(151,187,205,0.8)",
          highlightFill: "rgba(151,187,205,0.75)",
          highlightStroke: "rgba(151,187,205,1)",
          data: [$scope.report.total_campaign_funding_sought,
            $scope.report.total_campaign_funding_sought_running,
            $scope.report.total_campaign_funding_sought_capture_complete,
            $scope.report.total_campaign_funding_raised_running,
            $scope.report.total_campaign_funding_sought_capture_complete,
            $scope.report.total_campaign_funding_raised_capture_complete
          ]
        }, ]
      };
      var ctx2 = $('#chart2').get(0).getContext('2d');
      $scope.barChart = new Chart(ctx2);
      $scope.barChart.Bar($scope.chart2, {});
    });

  }

  // function for letting the dom load
  init();
  //$('.ui loader').removeClass('active');
  function init() {
    if ($('#chart1').get(0)) {
      $scope.refreshReport();
      $("#myloader").fadeOut(1000, function() {
        $('body').removeClass("loading");

      });
      return;
    } else {

    }
    $timeout(function() {
      init();
    }, 100);
  }
});



//------------------------------------------------------
//         EMAIL MANAGEMENT / EMAIL CONTROLLER
//------------------------------------------------------
app.controller('AdminEmailNotificationsCtrl', function($scope, $timeout, $translatePartialLoader, $translate, Restangular, $rootScope, PortalSettingsService) {
  var publicSettings = {},
    privateSettings = {};
  $scope.settingLoaded = false;
  getEmailNotification();

  $scope.email_preview = false;

  $scope.toggle_email = function() {
    $scope.email_preview = !$scope.email_preview;
  }

  Restangular.one('portal/setting').getList().then(function(success) {
    // loop and categorize the response data. put them into object
    angular.forEach(success, function(value) {
      if (value.setting_type_id == 3) {
        publicSettings[value.name] = value.value;
      } else if (value.setting_type_id == 1) {
        privateSettings[value.name] = value.value;
      }
    });
    $scope.settingLoaded = true;
  });
  // PortalSettingsService.getSettingsObj().then(function(success) {
  //   publicSettings = success.public_setting;
  //   privateSettings = success.private_setting;
  //   $scope.settingLoaded = true;
  // });

  $scope.checkAccordion = function(accordionIndex, $event) {
    $scope.accordionNum = accordionIndex;
    var currentAccordion = $event.currentTarget;
    $timeout(function() {
      $(currentAccordion).next().find(".fr-view").focus();
    }, 500);
  }

  function insertIntoCodeView(text, $codemirror) {
    $codemirror.CodeMirror.replaceSelection(text);
  }

  var fEditor;
  // Listen to the focus event on froala editor
  // When focused, the insert button would be bound to the editor that's focused
  // Therefore, it can insert HTML into the editor
  $rootScope.froalaOptions.events["froalaEditor.focus"] = function(e, editor) {
    fEditor = editor;
    fEditor.events.bindClick($('body'), 'div.button.tokens', function(event) {
      // This is the tag we are checking
      var customTag = "TMPLVAR";

      // Return the name of the tag the marker is at right now
      var element = fEditor.selection.element();

      // Check if the current marker's position is our defined customTag
      if ($(element).prop("tagName") == customTag) {
        // Put the marker after the node and restore selection using Froala's method
        $(element).after($.FroalafEditor.MARKERS);
        fEditor.selection.restore();
      }
      // Find the fr-box in the left column
      var frBox = $(event.currentTarget).parent().prev().find(".fr-box");
      if (!$(frBox).hasClass("fr-code-view")) {
        fEditor.undo.saveStep();
        fEditor.html.insert($scope.select_token);
        fEditor.undo.saveStep();
      } else {
        var $codemirror = $(frBox).find(".CodeMirror")[0];
        insertIntoCodeView($scope.select_token, $codemirror);
      }
    });
  }

  function getEmailNotification() {
    Restangular.one('portal').one('setting').one('site_email_notification').customGET().then(
      function(success) {
        $scope.emails = success;
        $timeout(function() {
          $('#emailaccord')
            .accordion({
              selector: {
                trigger: '.title .notification-title-left'
              }
            });
        });

        for (var i = 0; i < $scope.emails.length; i++) {
          if ($scope.emails[i].name == "site_email_notification_enable") {
            $scope.emails.splice(i, 1);
            break;
          }
        }

        //replace style tag
        for (var k = 0; k < $scope.emails.length; k++) {
          $scope.emails[k].value.html = $scope.replaceStyleTag($scope.emails[k].value.html);
          $scope.emails[k].showHtml = false;
        }
        $scope.emails.sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });
        $scope.email_copy = angular.copy($scope.emails);
        for (var i = 0; i < $scope.emails.length; i++) {
          if ($scope.emails[i].value.available_tokens) {
            for (var j = 0; j < $scope.emails[i].value.available_tokens.length; j++) {
              $scope.emails[i].value.available_tokens[j].token = "<tmplvar>" + $scope.emails[i].value.available_tokens[j].name + "</tmplvar>";
            }
          }
        }
      },
      function(failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
  }

  ////////////////////// toggle html button click event
  $timeout(function() {
    $('button[name="html"]').click(function(event) {
      var email_target = $(event.target).closest('.email-accordion');
      var email = email_target.scope().email;
      email.showHtml = !email.showHtml;
      $scope.toggle_email()
      email_target.find('.token-dropdown .token-selected').removeClass('default');
      $scope.selectToken(email.value.available_tokens[0], event);
    });
  }, 6000);

  // Check if document.write exists in the code, if so throw an error msg
  function isDocumentWrite(htmlBlock) {
    if (htmlBlock && htmlBlock.match(/document.write/g)) {
      msg = {
        'header': 'document_write_prompt_msg',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      return true;
    }
    return false;
  }

  $scope.confirmUpdateEmail = function(email) {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    // contentChanged gets called when events form.submit is fired
    $rootScope.froalaOptions.froalaEditor("events.trigger", "form.submit", [], true);
    var $form = {};
    email.value.html = email.value.html.replace(/&lt;/g, '<');
    email.value.html = email.value.html.replace(/&gt;/g, '>');
    email.value.html = email.value.html.replace(/&#10;/g, '');
    email.value.html = email.value.html.replace(/&#9;/g, ' ');
    email.value.html = email.value.html.replace(/&#8;/g, ' ');
    email.value.html = $scope.replaceInsideStyleTag(email.value.html);
    $form[email.name] = {
      'subject': email.value.subject,
      'available_tokens': email.value.available_tokens,
      'html': email.value.html,
    }

    $scope.isCodeValid = !isDocumentWrite($form[email.name].html);

    if ($scope.isCodeValid) {
      Restangular.one('portal', 'setting').customPUT($form).then(
        function(success) {
          msg = {
            'header': 'site_email_notification_saved_successfully'
          }
          email.value.html = $scope.replaceStyleTag(email.value.html);

          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        },
        function(failure) {
          msg = {
            'header': 'site_email_notification_error',
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          email.value.html = $scope.replaceStyleTag(email.value.html);
        }
      );
    }
  }

  $scope.resetEmailContent = function(email) {
    for (var i = 0; i < $scope.email_copy.length; i++) {
      if ($scope.email_copy[i].id == email.id) {
        email.value.html = $scope.email_copy[i].value.html;
      }
    }
  };

  $scope.selectToken = function(token, $event) {
    var email_target = $($event.target).closest('.email-accordion');
    $scope.select_token = token.token;
    var description = token.description;
    var ret = description;
    // shorten description
    if (description.length > 28) {
      ret = ret.slice(0, 25) + "...";
    }
    email_target.find('.token-selected').html(ret);

    var $insertBtn = $($event.currentTarget).parent().parent().next();
    $($insertBtn).removeClass("disabled");
  }

  // Wanted to combine getNotificationEnabledString and checkNotificationEnabled
  // But it gave me infinite loop that didn't even have error
  /**
   * Check email setting and return translation
   * @param  {Object} email
   * @return {String} translation key
   */
  $scope.getNotificationEnabledString = function(email) {
    if (privateSettings.site_email_notification_enable && privateSettings.site_email_notification_enable.hasOwnProperty(email.name)) {
      if (privateSettings.site_email_notification_enable[email.name] == true) {
        return "site_email_notification_disable";
      } else {
        return "site_email_notification_enable"
      }
    } else {
      return "site_email_notification_disable";
    }
  }

  /**
   * Check email setting and set button check or uncheck
   * @param  {Object}} email
   * @param  {Number} index Index in email array
   */
  $scope.checkNotificationEnabled = function(email, index) {
    if (privateSettings.site_email_notification_enable && privateSettings.site_email_notification_enable.hasOwnProperty(email.name)) {
      if (privateSettings.site_email_notification_enable[email.name] == true) {
        $timeout(function() {
          $($(".enable-notification").get(index)).checkbox("check");
        });
      } else {
        $timeout(function() {
          $($(".enable-notification").get(index)).checkbox("uncheck");
        });
      }
    } else {
      $($(".enable-notification").get(index)).checkbox("check");
    }
  }

  /**
   * Update setting when clicked
   * @param {Object} event $event object
   * @param {Object} email
   */
  $scope.setNotificationEnabled = function(event, email) {
    // save portal setting
    var $elem = $(event.currentTarget);
    var emailName = email.name;
    var emailEnabled = !$elem.hasClass("checked");
    var param = {
      site_email_notification_enable: privateSettings.site_email_notification_enable
    };

    // param.site_email_notification_enable = privateSettings.site_email_notification_enable;
    param.site_email_notification_enable[emailName] = emailEnabled;
    Restangular.one("portal", "setting").customPUT(param);
  }
});