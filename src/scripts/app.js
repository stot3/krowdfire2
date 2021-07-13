var app = angular.module('Atlas', [
  'ngRoute',
  'ngResource',
  'ipCookie',
  'ui.router',
  'ngSanitize',
  'ui.select',
  'ui.select2',
  'ui.sortable',
  'ngCsv',
  'restangular',
  'ngQuickDate',
  'flow',
  'angularFileUpload',
  'angularMoment',
  'angles',
  'videosharing-embed',
  'angulartics',
  'angulartics.piwik',
  'angulartics.google.analytics',
  'pascalprecht.translate',
  "froala"
]);

app.constant('OKTA_CONFIG', {
}); 

app.constant('BLOG_SETTINGS', {
  posts_per_page: '5',
});

app.run(function($sce, $http, $window, $rootScope, $route, $location, $templateCache, $timeout, Restangular, API_URL, RequestCacheService, PortalSettingsService, $translate, $translatePartialLoader, $q) {
  // Translate the texts shown in moment so it needs to wait for $translate to finish translating

  $rootScope.partsDone = false;
  $translatePartialLoader.addPart('global');
  $translatePartialLoader.addPart('navbar');
  $translatePartialLoader.addPart('footer');
  $translatePartialLoader.addPart('profile-setting');
  $translatePartialLoader.addPart('campaign-review');
  $translatePartialLoader.addPart('confirm-email');
  $translatePartialLoader.addPart('transaction-management');
  $translatePartialLoader.addPart('forgot-pasword');
  $translatePartialLoader.addPart('retry-card');
  $translatePartialLoader.addPart('error');
  $translatePartialLoader.addPart('calendar');
  $translatePartialLoader.addPart('response-message');
  $translatePartialLoader.addPart('home-page');
  $translatePartialLoader.addPart('login');
  $translatePartialLoader.addPart('explore');
  $translatePartialLoader.addPart('campaign-page');
  $translatePartialLoader.addPart('custom-comment');
  $translatePartialLoader.addPart('startCampaign');
  $translatePartialLoader.addPart('getStarted');
  $translatePartialLoader.addPart('campaignStep');
  $translatePartialLoader.addPart('user-profile');
  $translatePartialLoader.addPart('complete-funding');
  $translatePartialLoader.addPart('campaign-preview');
  $translatePartialLoader.addPart('campaign-review');
  $translatePartialLoader.addPart('campaign-page');
  $translatePartialLoader.addPart('guest-contribution');
  $translatePartialLoader.addPart('pledge-campaign');
  $translatePartialLoader.addPart('pledge-history');
  $translatePartialLoader.addPart('profile-setting');
  $translatePartialLoader.addPart('campaign-management');
  $translatePartialLoader.addPart('payment-setting');
  $translatePartialLoader.addPart('stream-management');
  $translatePartialLoader.addPart('transaction-management');
  $translatePartialLoader.addPart('message-center');
  $translatePartialLoader.addPart('portal-setting');
  $translatePartialLoader.addPart('subscription-settings');
  $translatePartialLoader.addPart('tab-report');
  $translatePartialLoader.addPart('tab-user');
  $translatePartialLoader.addPart('tab-coupon');
  $translatePartialLoader.addPart('tab-category');
  $translatePartialLoader.addPart('tab-campaign');
  $translatePartialLoader.addPart('tab-page');
  $translatePartialLoader.addPart('tab-portalSetting');
  $translatePartialLoader.addPart('tab-site-menu');
  $translatePartialLoader.addPart('tab-api');
  $translatePartialLoader.addPart('tab-email');
  $translatePartialLoader.addPart('profile');
  $translatePartialLoader.addPart('reset-password');
  $translatePartialLoader.addPart('campaign-widget');
  $translatePartialLoader.addPart('charity-helper');
  $translatePartialLoader.addPart('trulioo-verification');

  $translate.refresh().then(function(success) {
    $rootScope.partsDone = true;
    $translate(["moment_time_future", "moment_time_past", "moment_time_s", "moment_time_m", "moment_time_mm", "moment_time_h", "moment_time_hh", "moment_time_d", "moment_time_dd", "moment_time_M", "moment_time_MM", "moment_time_y", "moment_time_yy"]).then(function(translation) {
      // over write angularMoment formats
      moment.locale('en', {
        relativeTime: {
          future: "%s " + translation.moment_time_future,
          past: "%s " + translation.moment_time_past,
          s: "%d " + translation.moment_time_s,
          m: "a " + translation.moment_time_m,
          mm: "%d " + translation.moment_time_mm,
          h: "an " + translation.moment_time_h,
          hh: "%d " + translation.moment_time_hh,
          d: "a " + translation.moment_time_d,
          dd: "%d " + translation.moment_time_dd,
          M: "a " + translation.moment_time_M,
          MM: "%d " + translation.moment_time_MM,
          y: "a " + translation.moment_time_y,
          yy: "%d " + translation.moment_time_yy
        }
      });
    });
  });
  var sp = 1;

  var loadedVar = false;
  var translatedVar = false;
  // Disable route caching
  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    $rootScope.ogMeta = {
      "url": "",
      "title": "",
      "description": "",
      "site_name": "",
      "image": ""
    };

    if (typeof(current) !== 'undefined') {
      $templateCache.remove(current.templateUrl);
      // if (current.$$route && current.$$route.originalPath == '/api-docs') {
      //   $('#api-menu').remove();
      // }
    }
    $('.ui.sidebar').sidebar('hide');

    //Force hide menu;
    $('.collapsible-settings.dropdown').dropdown('hide');
  });

  // Handle dynamic URLs via route
  // Set page title depending on whether the route has a title specified
  $rootScope.$on('$routeChangeSuccess', function(ev, data) {
    initiateTwitter();
    $('body >.modals').remove();
    $rootScope.currentURL = $location.absUrl();
    $rootScope.ogMeta.url = $rootScope.currentURL;
    pageTitleLookup();
  });

  function fullLoaderStart() {
    $('body').addClass('loading');

    var opts = {
      lines: 15, // The number of lines to draw
      length: 24, // The length of each line
      width: 10, // The line thickness
      radius: 30, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#111', // #rgb or #rrggbb or array of colors
      speed: sp, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    };
    var target = document.getElementById('myloader');
    var spinner = new Spinner(opts).spin(target);
  }

  function fullLoaderEnd(timems) {
    $("#myloader").fadeOut(timems, function() {
      $('body').removeClass("loading");
      $('#myloader .spinner').remove();
      $('#myloader').removeAttr('style');
    });
  }

  PortalSettingsService.getSettingsObj().then(function(success) {
    // wordpress api url
    //look up component settings
    if (success.public_setting.site_widget_wp_api) {
      API_URL.wp_api = success.public_setting.site_widget_wp_api.url;
    }
    $rootScope.site_company = success.public_setting.site_company;
    $rootScope.ogMeta.site_name = $rootScope.site_company;

    //Check facebook app id
    if (success.public_setting.hasOwnProperty('site_facebook_app_id')) {
      $rootScope.facebook_app_id = success.public_setting.site_facebook_app_id;
    }

    // Site Name Meta translation
    $translate("site_name_meta").then(function(translation) {
      if (translation != "site_name_meta" && translation != "") {
        $rootScope.site_company = translation;
        $rootScope.ogMeta.site_name = $rootScope.site_company;
      }
    });

  });

  function pageTitleLookup() {
    RequestCacheService.getPage().then(function(success) {
      $("meta.jMeta").each(function() {
        $(this).remove();
      });
      // if path is null after slice, use original path. Otherwise use sliced path.
      var current_route = $location.path().slice(1) ? $location.path().slice(1) : $location.path();
      current_route = current_route == "!1" ? "/" : current_route;
      var pages = {};
      var pagesTitle = {};
      // put the response data in object format
      angular.forEach(success, function(value) {
        if (value.id == 1) {
          value.path = "/";
        }
        pages[value.path] = value.meta;
        pagesTitle[value.path] = value.title;
      });

      $rootScope.page_route = $route.current.originalPath ? $route.current.originalPath.slice(1) : null;
      if ($rootScope.page_route) {
        var temp = $rootScope.page_route.split('/');
        if (temp.length >= 2) {
          // if the path has more then 2 params
          if (temp[1].indexOf(':') === -1) {
            // if ':' not in second route param
            var new_temp = [temp[0], temp[1]];
            $rootScope.page_route = new_temp.join('-');
          }
        }
      } else {
        if (current_route == "/") {
          $rootScope.page_route = "home-page";
        } else {
          $rootScope.page_route = "custom-page";
        }
      }

      if (pagesTitle[current_route]) {
        // if current route is in pages object
        $rootScope.meta = pages[current_route];
        // assign page title if it has one
        $rootScope.page_title = pagesTitle[current_route];
        $rootScope.ogMeta.title = $rootScope.page_title;
      } else {
        // use pre-defined title otherwise
        // Title meta translation
        $translate($route.current.title).then(function(translation) {
          $rootScope.page_title = translation != null ? translation : $rootScope.page_title;
          $rootScope.ogMeta.title = $rootScope.page_title;
        });

      }

      // Create the meta tags and place them in index.html
      if (pages[current_route] || current_route == "explore" || current_route.includes("explore/category")) {
        if ((current_route == "explore" && $location.search().category) || current_route.includes("explore/category")) {
          if (current_route.includes("explore/category")) {
            var category_alias = current_route.split("/");
            var category_url = "category?path=" + category_alias[2] + "&use_path_lookup=1";
          } else if ($location.search().category.constructor == Array) {
            var category_url = "category/" + $location.search().category[0];
          } else {
            var category_url = "category/" + $location.search().category;
          }
          Restangular.one("portal").customGET(category_url)
            .then(function(categories) {
              var category_metatags = [];
              $.each(categories.attributes, function(index, value) {
                category_metatags.push({
                  name: index.replace("og", "og:"),
                  type: "property",
                  content: value
                });
                category_metatags.push({
                  name: index.replace("og", "twitter:"),
                  type: "property",
                  content: value
                });
              });
              var metaTags = category_metatags;
              for (var i = 0; i < metaTags.length; i++) {
                var metaName = metaTags[i].name.substr(3);
                if (metaTags[i].name.indexOf("og:") == 0 && $rootScope.ogMeta.hasOwnProperty(metaName)) {
                  checkOGTags(metaTags[i]);
                } else {
                  var meta = "<meta ";
                  meta += metaTags[i].type;
                  meta += " = '";
                  meta += metaTags[i].name;
                  meta += "' content = '";
                  meta += metaTags[i].content;
                  meta += "' class='jMeta'> \n";
                  if (metaTags[i].name == "description" && !$rootScope.ogMeta.description) {
                    $rootScope.ogMeta.description = metaTags[i].content;
                  }
                  if (metaTags[i].name.indexOf("og:") != 0) {
                    $("meta[property]").last().after(meta);
                  } else if (metaTags[i].name.split(":").length > 2) {
                    var metaSplit = metaTags[i].name.split(":");
                    var metaName = metaSplit[0] + ":" + metaSplit[1];
                    $("meta[property='" + metaName + "']").last().after(meta);
                  }
                }
              }
            });
        } else {
          var metaTags = pages[current_route];
          if (metaTags) {
            for (var i = 0; i < metaTags.length; i++) {
              var metaName = metaTags[i].name.substr(3);
              if (metaTags[i].name.indexOf("og:") == 0 && $rootScope.ogMeta.hasOwnProperty(metaName)) {
                checkOGTags(metaTags[i]);
              } else {
                var meta = "<meta ";
                meta += metaTags[i].type;
                meta += " = '";
                meta += metaTags[i].name;
                meta += "' content = '";
                meta += metaTags[i].content;
                meta += "' class='jMeta'> \n";
                if (metaTags[i].name == "description" && !$rootScope.ogMeta.description) {
                  $rootScope.ogMeta.description = metaTags[i].content;
                }
                if (metaTags[i].name.indexOf("og:") != 0) {
                  $("meta[property]").last().after(meta);
                } else if (metaTags[i].name.split(":").length > 2) {
                  var metaSplit = metaTags[i].name.split(":");
                  var metaName = metaSplit[0] + ":" + metaSplit[1];
                  $("meta[property='" + metaName + "']").last().after(meta);
                }
              }
            }
          }
        }
        if (!$("meta[name='description']").length) {
          var meta = "<meta name='description' content='" + $rootScope.page_title + "' class='jMeta'> \n";
          $("meta[property]").first().before(meta);
        }
      }
    });
  }

  function checkOGTags(ogTag) {
    var localOgTag = {};
    for (var prop in ogTag) {
      localOgTag[prop] = ogTag[prop];
    }
    $rootScope.ogMeta[localOgTag.name.substr(3)] = localOgTag.content;
  }

  //prerender flag
  window.prerenderReady = false;
  $timeout(function() {
    window.prerender = true;
  }, 2000);

  function initiateTwitter() {
    //twitter widget init
    $('#twitter-wjs').remove();
    $timeout(function() {
      ! function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
          p = /^http:/.test(d.location) ? 'http' : 'https';
        if (!d.getElementById(id)) {
          js = d.createElement(s);
          js.id = id;
          js.src = "https://platform.twitter.com/widgets.js";
          fjs.parentNode.insertBefore(js, fjs);
        }
      }(document, "script", "twitter-wjs");
    }, 200);
  }

  /**
   * Strips out commas for API optimization
   * 
   * @param {any} goal value in the input
   */
  $rootScope.formatFundingGoal = function(goal) {
    return goal.replace(/[\,\s]/g, "");
  }

});

app.constant('USER_ROLES', {
  all: '*',
  admin: '1',
  user: '2',
  campaign: '3',
  page: '4'
});

// Regions for campaign resources to indicate where the resource goes
app.constant('RESOURCE_REGIONS', {
  campaign: {
    header: 1, // Campaign header
    body: 2, // Links for campaign Body
    thumbnail: 3, // Thumbnail for the campaign
    top_header: 5, // Campaign Top Header Image
    thumbnail_video: 6, // Video thumbnail link for campaign
  }
});

//define font families
app.constant('FONT_FAMILY', {
  Georgia: 'Georgia, serif',
  Times: '"Times New Roman", Times, serif',
  Comic: '"Comic Sans MS", cursive, sans-serif',
});

app.constant('PHONE_TYPE', [{
  name: "Landline",
  id: '1'
}, {
  name: "Mobile",
  id: '2'
}, {
  name: "Fax",
  id: '3'
}]);

app.constant('AUTH_SCHEME', [{
  "id": 1,
  "name": "Crypt Blowfish 8",
  "translation": "tab_portalsetting_site_auth_scheme_blowfish_default"
}, {
  "id": 2,
  "name": "SHA1 Digest",
  "translation": "tab_portalsetting_site_auth_scheme_sha1"
}]);

app.constant("ANONYMOUS_COMMENT", {
  "anonymous_disabled": "disabled",
  "anonymous_backers": "backers",
  "anonymous_users": "users"
});

app.constant("SOCIAL_SHARING_OPTIONS", {
  "sharing_users": "users",
  "sharing_backers": "creator",
  "sharing_disabled": "disabled"
});

app.factory('authHttpInterceptor', function($q, $location, $injector, ipCookie, $rootScope) {
  return {
    // Set auth token for all requests
    request: function(config) {
      var User = $injector.get('UserService');
      if ($location.path().split("/")[1] !== 'login') {
        // if(ipCookie('current.user'))
        // {
        // 	config.headers["X-Auth-Token"] = ipCookie('current.user').auth_token;
        // }
        if (User.auth_token) {
          config.headers["X-Auth-Token"] = User.auth_token;
        }
      }
      return config;
    },
    // Ensure auth token is still valid
    responseError: function(response) {
      var lst = response.config.url.split('/');
      var User = $injector.get('UserService');

      if (checkWordpressException(response)) {
        $rootScope.wp_error = true;
        return $q.reject(response);
      }

      //////////// server not available
      if (response.status == 0) {
        // if(response.config.url.indexOf("post")){
        // }else{
        if (window.location.pathname != '/server-error') {
          window.location.href = '/server-error';
        }
        // }
      }
      if (response.status >= 500) {
        message.errorResponse = response;
      }
      if (response.status === 401 && response.data.code === "auth_token_not_valid" && lst[lst.length - 1] != 'logout') {
        User.setLoggedOut();
      }
      return $q.reject(response);
    }
  };
});

function checkWordpressException(response) {
  return response.config.functionLocation == "wp_service";
}

app.filter('unique', function() {
  return function(collection, keyname) {
    var output = [],
      keys = [];

    angular.forEach(collection, function(item) {
      var key = item[keyname];
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        output.push(item);
      }
    });
    return output;
  };
});

app.controller('MainCtrl', ['$scope', '$location', 'UserService', 'Restangular', 'API_URL', 'USER_ROLES', '$timeout', 'ThemeService', 'redirectService', '$translatePartialLoader', '$translate', 'RequestCacheService', 'LANG', '$rootScope', "$window", "$q", "PortalSettingsService", "SiteLogoService",
  function($scope, $location, User, Restangular, API, roles, $timeout, ThemeService, redirectService, $translatePartialLoader, $translate, RequestCacheService, LANG, $rootScope, $window, $q, PortalSettingsService, SiteLogoService) {

    $scope.location = window.location.href;

    $scope.User = User; // Set the User data
    $scope.server = API.url;
    $scope.server_loc = API.loc;
    $scope.successMessage = [];
    $scope.errorMessage = [];
    // $scope.floatingMessage = [];
    $scope.translateCompleted = false;
    var currentLoadedPart;
    $rootScope.inHTMLMode = 0;

    var isTransDone = false;
    var isRouteDone = false;

    $scope.showLinkCopied = false;

    $scope.loader_enabled = false;
    if (API.loader_enabled !== undefined) {
      $scope.loader_enabled = API.loader_enabled;
    }

    $scope.setLoggedOut = function() {
      PortalSettingsService.getSettingsObj().then(function(success) {
        if (success.public_setting.social_login !== undefined &&
            success.public_setting.social_login.toggle === true){
          User.setLoggedOut();
        }else{
          User.setLoggedOut();
        }
      });
      console.log($rootScope.okta_tokens)
    }

    $rootScope.removeFloatingMessage = function() {
      $rootScope.floatingMessage = {};
    }

    $rootScope.hideFloatingMessage = function() {
      $timeout(function() {
        $rootScope.removeFloatingMessage();
      }, 30000);
    }

    $rootScope.scrollToError = function() {
      // Check for error on the .field element
      $timeout(function() {
        if ($('.field').hasClass('error')) {
          $('html, body').animate({
            scrollTop: $('.field.error').offset().top - 15
          }, 500);
        }
      });
    }

    $rootScope.checkTranslation = function(base_translation, new_translation) {
      // Return new translation if translated in json file. Otherwise, use base translation
      var value = $translate.instant([base_translation, new_translation]);
      if (value[new_translation] === "" || value[new_translation] === new_translation) {
        return value[base_translation];
      } else {
        return value[new_translation];
      }
    }

    var show_loader = function() {
      $("body.container #loader.dimmer").dimmer({
        opacity: 1,
        closable: false,
        duration: {
          show: 0,
          hide: 1000
        },
      }).dimmer("show");
    }

    var hide_loader = function() {
      $("body.container #loader.dimmer").dimmer("hide");
    }

    $scope.$on('$routeChangeSuccess', function(ev, next, current) {
      var custom_emit = ["views/templates/campaign.html", "views/templates/explore.html", "views/templates/index.html", "views/templates/getstarted.html", "views/templates/profile-setup.html", "views/templates/campaign-preview.html", "views/templates/custom-page.html"];
      // Loader excluded from these pages.
      var no_loader = [];
      var exclude_loader_on = custom_emit + no_loader;

      var exclude_on_url = false;
      var path_tokens = $location.url().split("/");
      // If the page is campaign page detect with url since it can sometimes use custom template.
      if (path_tokens[1] == "campaign" &&
        !isNaN(path_tokens[2])) {
        exclude_on_url = true;
      }
      // Don't use on admin pages.
      if (path_tokens[1] == "admin") {
        exclude_on_url = true;
      }

      if (exclude_loader_on.indexOf(next.loadedTemplateUrl) <= -1 &&
        !exclude_on_url) {
        // hide_loader();
      }

      $rootScope.isConnectWithStripe = false;
      if (current != null && /templates\/stripe-connect/.test(current.loadedTemplateUrl) && next != null && (/templates\/portal-setting/.test(next.loadedTemplateUrl) || /templates\/complete-funding/.test(next.loadedTemplateUrl))) {
        $rootScope.isConnectWithStripe = true;
      }
    });

    $scope.$on('loading_finished', function() {
      hide_loader();
    });

    PortalSettingsService.getSettingsObj(true).then(function(success) {
      $scope.public_setting = success.public_setting;
      if($scope.public_setting.site_disable_unsupported_browsers !== undefined && $scope.public_setting.site_disable_unsupported_browsers != false){
        //disable facebook browser
        $scope.isFacebookApp = function() {
          var ua = navigator.userAgent || navigator.vendor || window.opera;
          return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1);
        }

      }

      $scope.site_load_icon = {};
      if ($scope.public_setting.site_load_icon !== undefined) {
        $scope.site_load_icon = $scope.public_setting.site_load_icon;
        SiteLogoService.setLoadIcon($scope.site_load_icon.value);
      }

      $scope.site_load_class = {};
      $scope.site_load_class = $scope.public_setting.site_load_class;
      if ($scope.site_load_class === undefined) {
        $scope.site_load_class = "circle notched";
      }

      // Sticky menu push
      $scope.stickyMenu = $scope.public_setting.site_theme_sticky_menu;

      if ($scope.public_setting.site_admin_campaign_management_only) {
        $scope.$watch(function() {
          return $location.path();
        }, function(newValue, oldValue) {
          var url = newValue.split("/")[1];
          if (User.portal_admin != roles.admin && (url == "start" || url == "getstarted" || url == "campaign-setup" || url == "rewards" || url == "profile-setup" || url == "complete-funding" || url == "campaign-preview" || url == "campaign-review")) {
            $location.path("/");
          }
        });
      }

      if (!$scope.public_setting.site_campaign_contributions) {
        $scope.$watch(function() {
          return $location.path();
        }, function(newValue, oldValue) {
          var url = newValue.split("/")[1];
          if (url == "pledge-campaign" || url == "inline-contribution") {
            $location.path("/explore");
          }
        });
      }

      // Load cookie consent pop up
      if (typeof $scope.public_setting.site_enable_cookie_consent === 'undefined' || $scope.public_setting.site_enable_cookie_consent == null) {
        $scope.enableCookieConsent = false;
      } else {
        $scope.enableCookieConsent = $scope.public_setting.site_enable_cookie_consent;
      }

      //I put this block of code at the of the success function of the PortalSettingsService
      if ($scope.enableCookieConsent) {
        $translate.refresh().then(function() {
          var cookieConsentTranslation = $translate.instant(['cookie_consent_message_text', 'cookie_consent_dismiss_text', 'cookie_consent_link_text', 'cookie_consent_link']);
          $scope.$on('loading_finished', function() {
            if ($("[aria-label='cookieconsent']").length == 0) {
              window.cookieconsent.initialise({
                "palette": {
                  "popup": {
                    "background": "#efefef",
                    "text": "#404040"
                  },
                  "button": {
                    "background": "#8ec760",
                    "text": "#ffffff"
                  }
                },
                "theme": "classic",
                "position": "bottom-left",
                "content": {
                  "message": cookieConsentTranslation.cookie_consent_message_text,
                  "dismiss": cookieConsentTranslation.cookie_consent_dismiss_text,
                  "link": cookieConsentTranslation.cookie_consent_link_text,
                  "href": cookieConsentTranslation.cookie_consent_link
                }
              });
            }
          });
        });
      }
    });

    $scope.$on('$routeChangeStart', function(event, current, previous) {
      currentLoadedPart = "";

      // Hide mobile menu when change routes.
      $('body').removeClass('mobile-sidebar-no-scroll');
      $('#mobile-sidebar').sidebar('hide');

      var exclude_on_url = false;
      var path_tokens = $location.url().split("/");
      // Don't use on admin pages.
      if (path_tokens[1] == "admin") {
        exclude_on_url = true;
      }

      // Loader excluded from these pages.
      var prevent_loader_on = ["views/templates/login-register.html", "views/templates/404.html", "views/templates/start.html", "views/templates/getstarted.html", "views/templates/campaign-setup.html", "views/templates/rewards.html", "views/templates/profile-setup.html", "views/templates/complete-funding.html", "views/templates/campaign-preview.html"];

      // Loader excluded from these pages.
      var force_loader_on = ["views/templates/api-docs.html"];

      // Show loader when changing routes.
      if ((prevent_loader_on.indexOf(current.templateUrl) <= -1 &&
          !exclude_on_url &&
          $scope.loader_enabled) ||
        force_loader_on.indexOf(current.templateUrl) >= 0) {
        show_loader();
      }
    });

    RequestCacheService.getPage().then(function(success) {
      $scope.portal_page = success;
    });
    $scope.$watch(function() {
      return $location.path();
    }, function(newValue, oldValue) {
      var url = newValue.split("/")[1];
      // if user is not loggin, make them login when they want to create a new campaign
      if (!User.isLoggedIn()) {
        redirectService.setUrl(oldValue);
        if (url == "start" || url == "pledge-campaign" || url == "message-center" || url == 'profile-setting' || url == 'payment-setting' || url == 'admin' || url == 'campaign-manager' || url == 'pledge-history' || url == 'getstarted' || url == 'campaign-setup' || url == 'rewards' || url == 'profile-setup' || url == 'complete-funding' || url == 'campaign-preview' || url == 'account') {
          $location.path('/login');
        }
      } else {
        // user is loggin
        // Add login class to body if user is logged in
        document.body.classList.add('is-logged-in');
        // restrict users not to go to authorized pages
        // Make sure admin-only pages are off-limits to other roles

        if (url == "admin" && (User.person_type_id == roles.user)) {
          $location.path('/');
        } else if (url == 'inline-contribution') {
          $location.path('/explore');
        }

        // if they go to the login page or register page when they already loggin, redirect them to home
        else if (url == "login" || newValue.split("/")[1] == "register") {
          $location.path('/');
        }

        //Ensuring that non-portal admins cannot access pages outside their permissions
        var url_secondary = $location.url().split("/");
        url_secondary = url_secondary[2]
        switch (url_secondary) {
          case null:
            break;
          case 'dashboard#campaigns':
            if(User.person_type_id != "1" && User.person_type_id != "3"){
              $location.path('/')
            }
          break
          case 'dashboard#pages':
            if(User.person_type_id != "1" && User.person_type_id != "4"){
              $location.path('/')
            }
          break;
          case 'dashboard#users':
            if(User.person_type_id != "1"){
              $location.path('/')
            }
          break;
          case 'dashboard#categories':
            if(User.person_type_id != "1"){
              $location.path('/')
            }
          break;
          case 'dashboard#menus':
            if(User.person_type_id != "1"){
              $location.path('/')
            }
          break;
          case 'dashboard#coupons':
            if(User.person_type_id != "1"){
              $location.path('/')
            }
          break;
          case 'dashboard#portal-settings':
            if(User.person_type_id != "1"){
              $location.path('/')
            }
          break;
          case 'dashboard#web-settings':
            if(User.person_type_id != "1"){
              $location.path('/')
            }
          break;
          case 'dashboard#subscription-settings':
            if(User.person_type_id != "1"){
              $location.path('/')
            }
          break;
          default:
            break;
        }


      }

      //initial theme color
      // assign function
      $scope.theme_classes = ThemeService.themeColor();
      $scope.top_nav_theme = ThemeService.topNav();
      ThemeService.init();
      $scope.top_nav_style = {};
      // if variable is not array, that means it is returning a promise
      if (!$.isArray($scope.theme_classes)) {
        // resolve promise then assign class
        $scope.theme_classes.then(function() {
          $scope.theme_classes = ThemeService.theme_classes;
        });
      }
    });
    $(window).scroll(function() {
      var saveheight = $(document).height()
      saveheight = saveheight - 1000
      if ($(this).scrollTop() > 220) {
        $('#back-to-top').fadeIn();
      } else {
        $('#back-to-top').fadeOut();
      }
      if ($(this).scrollTop() < saveheight) {
        $('#scroll-to-bottom').fadeIn();
      } else {
        $('#scroll-to-bottom').fadeOut();
      }
    });

    // back to top button
    $scope.backToTop = function() {
      $('html,body').animate({
        scrollTop: 0
      }, 800);
      return false;
    }

    $scope.scrollToBottom = function() {
      var saveheight = $(document).height()
      saveheight = saveheight - 900
      $('html,body').animate({
        scrollTop: saveheight
      }, 800);
      return false;
    }

    $scope.clearMessage = function() {
      $scope.successMessage = [];
      $scope.errorMessage = [];
      $scope.floatingMessage = [];
    }

    $scope.closeSuccessMessage = function() {
      $scope.successMessage = [];
    }
    $scope.closeErrorMessage = function() {
      $scope.errorMessage = [];
    }

    // Options for Froala editor
    // Intentional blank properties for events

    $rootScope.froalaOptions = {
      heightMin: 300,
      events: {},
      language: 'custom',
      toolbarSticky: true,
      tabSpaces: 2,
      codeMirrorOptions: {
        indentWithTabs: false,
        lineNumbers: true,
        lineWrapping: true,
        mode: 'htmlmixed',
        tabMode: 'indent',
        tabSize: 2
      },
      imageResizeWithPercent: true,
      linkAlwaysBlank: true,
      htmlAllowedAttrs: ['accept', 'accept-charset', 'accesskey', 'action', 'align', 'alt', 'async', 'autocomplete', 'autofocus', 'autoplay', 'autosave', 'background', 'bgcolor', 'border', 'charset', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'color', 'cols', 'colspan', 'content', 'contenteditable', 'contextmenu', 'controls', 'coords', 'data', 'data-.*', 'datetime', 'default', 'defer', 'dir', 'dirname', 'disabled', 'download', 'draggable', 'dropzone', 'enctype', 'for', 'form', 'formaction', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv', 'icon', 'id', 'ismap', 'itemprop', 'keytype', 'kind', 'label', 'lang', 'language', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'name', 'novalidate', 'open', 'optimum', 'pattern', 'ping', 'placeholder', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan', 'sandbox', 'scope', 'scoped', 'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes', 'span', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step', 'summary', 'spellcheck', 'style', 'tabindex', 'target', 'title', 'type', 'translate', 'usemap', 'value', 'valign', 'width', 'wrap', 'webui-pgwslider', 'options', 'scroll-to'],
      htmlAllowedTags: ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'queue', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'style', 'section', 'select', 'small', 'source', 'span', 'strike', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr', 'wp', 'wp-post-list', 'wp-individual-post', 'tmplvar', 'treety-widget'],
      htmlAllowedEmptyTags: ['textarea', 'a', 'iframe', 'object', 'video', 'style', 'script', 'wp', 'wp-post-list', 'wp-individual-post', 'tmplvar', 'i', 'treety-widget'],
      htmlRemoveTags: [],
      toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting', 'selectAll', 'html'],
      toolbarButtonsMD: ['fullscreen', 'bold', 'italic', 'underline', 'fontFamily', 'fontSize', 'color', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting', 'selectAll', 'html'],
      entities: '&amp;&lt;&gt;&#34;&#39;&iexcl;&cent;&pound;&curren;&yen;&brvbar;&sect;&uml;&copy;&ordf;&laquo;&not;&shy;&reg;&macr;&deg;&plusmn;&sup2;&sup3;&acute;&micro;&para;&middot;&cedil;&sup1;&ordm;&raquo;&frac14;&frac12;&frac34;&iquest;&Agrave;&Aacute;&Acirc;&Atilde;&Auml;&Aring;&AElig;&Ccedil;&Egrave;&Eacute;&Ecirc;&Euml;&Igrave;&Iacute;&Icirc;&Iuml;&ETH;&Ntilde;&Ograve;&Oacute;&Ocirc;&Otilde;&Ouml;&times;&Oslash;&Ugrave;&Uacute;&Ucirc;&Uuml;&Yacute;&THORN;&szlig;&agrave;&aacute;&acirc;&atilde;&auml;&aring;&aelig;&ccedil;&egrave;&eacute;&ecirc;&euml;&igrave;&iacute;&icirc;&iuml;&eth;&ntilde;&ograve;&oacute;&ocirc;&otilde;&ouml;&divide;&oslash;&ugrave;&uacute;&ucirc;&uuml;&yacute;&thorn;&yuml;&OElig;&oelig;&Scaron;&scaron;&Yuml;&fnof;&circ;&tilde;&Alpha;&Beta;&Gamma;&Delta;&Epsilon;&Zeta;&Eta;&Theta;&Iota;&Kappa;&Lambda;&Mu;&Nu;&Xi;&Omicron;&Pi;&Rho;&Sigma;&Tau;&Upsilon;&Phi;&Chi;&Psi;&Omega;&alpha;&beta;&gamma;&delta;&epsilon;&zeta;&eta;&theta;&iota;&kappa;&lambda;&mu;&nu;&xi;&omicron;&pi;&rho;&sigmaf;&sigma;&tau;&upsilon;&phi;&chi;&psi;&omega;&thetasym;&upsih;&piv;&ensp;&emsp;&thinsp;&zwnj;&zwj;&lrm;&rlm;&ndash;&mdash;&lsquo;&rsquo;&sbquo;&ldquo;&rdquo;&bdquo;&dagger;&Dagger;&bull;&hellip;&permil;&prime;&Prime;&lsaquo;&rsaquo;&oline;&frasl;&euro;&image;&weierp;&real;&trade;&alefsym;&larr;&uarr;&rarr;&darr;&harr;&crarr;&lArr;&uArr;&rArr;&dArr;&hArr;&forall;&part;&exist;&empty;&nabla;&isin;&notin;&ni;&prod;&sum;&minus;&lowast;&radic;&prop;&infin;&ang;&and;&or;&cap;&cup;&int;&there4;&sim;&cong;&asymp;&ne;&equiv;&le;&ge;&sub;&sup;&nsub;&sube;&supe;&oplus;&otimes;&perp;&sdot;&lceil;&rceil;&lfloor;&rfloor;&lang;&rang;&loz;&spades;&clubs;&hearts;&diams;'
    }

    // Checking if we have our own language file for Froala
    var xhr = new XMLHttpRequest();
    var path = "views/translation/" + LANG.PREFERRED_LANG + "/froala.json";
    xhr.open("GET", path);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        try {
          var jsondata = JSON.parse(xhr.responseText);
          $.FroalaEditor.LANGUAGE["custom"] = jsondata;
        } catch (e) {}
      }
    }
    xhr.send();

    // Override the HTML sanitize function so it doesn't filter "<" and ">"
    $rootScope.froalaOptions.events["froalaEditor.initialized"] = function(e, editor) {
      editor.helpers.sanitizeURL = function(url) {
        if (url == "link" || url == "link_pledges") {
          return "<tmplvar>" + url + "</tmplvar>";
        }
        return url;
      }

      editor.events.on("keydown", function() {
        // This is the tag we are checking
        var customTag = "TMPLVAR";

        // Check if the current marker's position is our defined customTag
        // Code snippet is copied from emoticons.js from Froala Editor
        var range = editor.selection.ranges(0);
        var container = range.startContainer;
        if (container.nodeType == Node.ELEMENT_NODE) {
          if (container.childNodes.length > 0 && range.startOffset > 0) {
            var node = container.childNodes[range.startOffset - 1];
            if ($(node).prop("tagName") === customTag) {
              $(node).after($.FroalaEditor.INVISIBLE_SPACE + $.FroalaEditor.MARKERS);
              editor.selection.restore();
            }
          }
        }
      });
    }

    $timeout(function() {
      var removeStickyOnScreenResize = function() {
        var currentScreenW = $(window).width();
        if (currentScreenW <= 1024) {
          // If the current screen width is less/equal than 1024 then remove sticky menu class
          $('#nav-wrapper .top-nav-bar').removeClass('sticky-menu');
          $('#main-bg').removeClass('sticky-menu-push');
        } else if ($scope.stickyMenu) {
          // If the sticky menu toggle is on then add the class
          $('#nav-wrapper .top-nav-bar').addClass('sticky-menu');
          $('#main-bg').addClass('sticky-menu-push');
        }
      }

      // Remove sticky menu class when resizing
      $(window).resize(function() {
        removeStickyOnScreenResize();
      });
    });
  }
]);

// set Restangular to use setFullResponse on specific services (to read headers)
app.factory('RestFullResponse', function(Restangular) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setFullResponse(true);
  });
});

// Requires moment.js
app.filter('formatDate', ['$translate', function($translate) {
  return function(input, formatting) {
    if (formatting == "MMMM YYYY") {
      var date_formatted = moment(input).format(formatting);
      var translated_month = $translate.instant(date_formatted.split(" ")[0]);
      return translated_month + " " + date_formatted.split(" ")[1];
    } else {
      return moment(input).format(formatting);
    }
  }
}]);

// Angular's currency filter always gives decimals, this filter is for no decimals
// also make it accept iso currency and change currency symbol according to iso
// Note: This only works for currency symbols that are displayed before the number
app.filter('noFractionCurrency', ['$filter', '$locale',
  function(filter, locale) {
    var currencyFilter = filter('currency');
    var formats = locale.NUMBER_FORMATS;
    return function(amount, currencySymbol) {
      // check ()
      var matches = /\(([^)]+)\)/.exec(currencySymbol);
      if (matches) {
        var iso_currency = matches[1];
        amount = new Intl.NumberFormat(this, {
          style: 'currency',
          currency: iso_currency,
          currencyDisplay: "symbol"
        }).format(amount).substring(0, sep);
        var index = amount.indexOf(formats.DECIMAL_SEP);
        if (index === -1) {
          index = amount.length;
        }
        return amount.substring(0, index);
      } else if (currencySymbol == "()") {
        var value = currencyFilter(amount);
        var sep = value.indexOf(formats.DECIMAL_SEP);
        return value.substring(0, sep);
      }
      var value = currencyFilter(amount, " ");
      var sep = value.indexOf(formats.DECIMAL_SEP);
      return value.substring(0, sep);
    };
  }
]);

app.filter('stringCurrency', function($filter, $locale) {

  return function(amount, currency_iso) {
    if (currency_iso && MoneySymbols[currency_iso]) {

      var symbol = MoneySymbols[currency_iso].money_format;
      var matched = /([^{]+)\{{/.exec(symbol);

      if (matched) {
        symbol = matched[1];

      } else {
        symbol = "$";
      }

      return symbol + amount;
    } else if (currency_iso === " ") {
      return amount;
    } else {
      return "$" + amount;
    }
  }
});

app.directive('format', ['$filter', function($filter) {
  return {
    require: '?ngModel',
    link: function(scope, elem, attrs, ctrl) {
      if (!ctrl) return;

      ctrl.$formatters.unshift(function(a) {
        return $filter(attrs.format)(ctrl.$modelValue)
      });

      ctrl.$parsers.unshift(function(viewValue) {
        elem.priceFormat({
          prefix: '',
          centsSeparator: '.',
          thousandsSeparator: ','
        });

        return elem[0].value;
      });
    }
  };
}]);

app.filter('formatCurrency', ['$filter', '$locale', function(filter, locale) {
  var currencyFilter = filter('currency');
  var formats = locale.NUMBER_FORMATS;
  return function(amount, currency_iso, hide_decimal) {

    var symbol_only = false;
    if (amount === ' ') {
      symbol_only = true;
    }

    var value = currencyFilter(amount, "");
    if (typeof value == 'undefined' || value === null) {
      return;
    }
    //var currencySymbol = getSymbolFromCurrency(currency_iso);
    if (currency_iso && currency_iso !== " ") {
      var symbol = MoneySymbols[currency_iso].money_symbol;
      //var symbol = currencySymbol;

      if (symbol_only) {
        return symbol;
      }

      if (MoneySymbols[currency_iso].money_decimal_sep) {
        locale.NUMBER_FORMATS.DECIMAL_SEP = MoneySymbols[currency_iso].money_decimal_sep;
      }

      if (MoneySymbols[currency_iso].money_group_sep) {
        locale.NUMBER_FORMATS.GROUP_SEP = MoneySymbols[currency_iso].money_group_sep;
      }

      //If hide decimal
      if (hide_decimal == 3) {
        var sep = value.indexOf(locale.NUMBER_FORMATS.DECIMAL_SEP);
        value = value.substring(0, sep);
      }

      //Change format base on currency
      var money_format = MoneySymbols[currency_iso].money_format;
      if (money_format) {
        money_format = money_format.replace("{{amount}}", value);
        money_format = money_format.replace("{{money_symbol}}", symbol);
        return money_format;
      } else {
        return symbol + value;
      }
    } else if (currency_iso === " ") {
      return value;
    } else {
      return "$" + value;
    }
  };
}]);

// Filter that would return the countries that is already taken for specific shipping
app.filter("excludeDupCountry", function() {
  // Array filter callback function
  var OnFilter = function(countryID) {
    return function(country) {
      // Keep the country that has the came countryID or it doesn't have shipping_status
      return country.refid == countryID || country.refid == -1;
    }
  }

  // Actual filter function
  return function(allCountries, rewardIndex, countryID, shippingTypeID) {
    if (allCountries) {
      // Create another array of countries so we don't modify the original data
      var countries = [];
      for (var index in allCountries) {
        countries.push(allCountries[index]);
      }

      // It's too much work to do complicated filtering in filter callback
      // Tagging the country for easy filter later
      for (var index in countries) {
        var country = countries[index];
        country.refid = -1;
        if (country.hasOwnProperty("shipping_status")) {
          for (var i in country.shipping_status) {
            if (country.shipping_status[i].reward_index == rewardIndex && country.shipping_status[i].shipping_option_type_id == shippingTypeID) {
              country.refid = country.id;
            }
          }
        }
      }
      var filteredCountries = countries.filter(OnFilter(countryID));
      return filteredCountries;
    }
  }
});

// Filters months so it can be translated
app.filter('monthName', ['$translate', function($translate) {
  return function(monthNumber) {
    var value = $translate.instant(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);
    var monthNames = [value.January, value.February, value.March, value.April, value.May, value.June,
      value.July, value.August, value.September, value.October, value.November, value.December
    ];
    return monthNames[monthNumber];
  }
}]);

app.controller('SiteErrorCtrl', function($scope, Restangular, $location, API_URL) {
  $scope.goBack = function() {
    window.history.go(-2);
  }
  $scope.goToHome = function() {
    $location.path('/');
  }
});

app.controller('FavIconCtrl', function($scope, Restangular, API_URL, PortalSettingsService) {
  $scope.server = API_URL.url;
  // load settings
  PortalSettingsService.getSettingsObj().then(function(success) {
    if (success.public_setting.site_favicon.path_external) {
      $scope.faviconURL = $scope.server + "/image/site_logo/" + success.public_setting.site_favicon.path_external;
    } else {
      $scope.faviconURL = "images/placeholder-images/placeholder_favicon.png";
    }
  });
});


app.service('redirectService', function() {
  var url = "";
  this.getUrl = function() {
    return url;
  }
  this.setUrl = function(s) {
    url = s;
  }
});

app.directive("scroll", function($window) {
  return function(scope, element, attrs) {
    angular.element($window).bind("scroll", function() {
      var bottom = $(window).scrollTop() + $(window).height();
      var height1 = $(element).offset().top + $(element).outerHeight();
      var height2 = $(element).parent().offset().top + $(element).parent().outerHeight();
      if (height1 >= height2 && bottom - height1 > 50) {
        scope.boolChangeClass = true;
      } else {
        scope.boolChangeClass = false;
      }
      scope.$apply();
    });
  };
});

// anchor scroll with animation
app.service('anchorSmoothScroll', function() {
  this.scrollTo = function(eID) {

    // This scrolling function
    // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

    var startY = currentYPosition();
    var stopY = elmYPosition(eID);
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 100) {
      scrollTo(0, stopY);
      return;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 20) speed = 20;
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    if (stopY > startY) {
      for (var i = startY; i < stopY; i += step) {
        setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
        leapY += step;
        if (leapY > stopY) leapY = stopY;
        timer++;
      }
      return;
    }
    for (var i = startY; i > stopY; i -= step) {
      setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
      leapY -= step;
      if (leapY < stopY) leapY = stopY;
      timer++;
    }

    function currentYPosition() {
      // Firefox, Chrome, Opera, Safari
      if (self.pageYOffset) return self.pageYOffset;
      // Internet Explorer 6 - standards mode
      if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
      // Internet Explorer 6, 7 and 8
      if (document.body.scrollTop) return document.body.scrollTop;
      return 0;
    }

    function elmYPosition(eID) {
      var elm = document.getElementById(eID);
      var y = elm.offsetTop;
      var node = elm;
      while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
      }
      return y;
    }

  };
});
