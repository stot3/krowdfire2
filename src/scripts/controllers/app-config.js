// config file for the app
app.config(function($routeProvider, $locationProvider, RestangularProvider, $httpProvider, API_URL, LANG, flowFactoryProvider, ngQuickDateDefaultsProvider, uiSelectConfig, $analyticsProvider, $provide, $compileProvider, $sceDelegateProvider, CDN) {
    // $compileProvider.debugInfoEnabled(false);
    $httpProvider.interceptors.push('authHttpInterceptor');
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.withCredentials = false;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // window.disqus_shortname = "thrinaciawebui";
    RestangularProvider.setBaseUrl(API_URL.url + API_URL.loc); // Set base url for Restangular
    $locationProvider.html5Mode(true);

    // set ui-select theme
    uiSelectConfig.theme = 'select2';
    // Handle routing
    $routeProvider
        .when('/', { // Homepage
            templateUrl: 'views/templates/index.html',
            controller: 'HomeCtrl'
        })
        .when('/register/confirm/:validation_token?', { // Confirm registration
            templateUrl: 'views/templates/login-register.html',
            controller: 'RegConfirmCtrl',
            title: 'Confirm Account'
        })
        .when('/register', { // Login/register page
            templateUrl: 'views/templates/login-register.html',
            title: 'Register'
        })
        .when('/login', { // Login page
            templateUrl: 'views/templates/login-register.html',
            title: 'Login'
        })
        .when('/getstarted/:campaign_id?', { // Campaign editing page
            templateUrl: 'views/templates/getstarted.html',
            controller: 'CreateCampaignCtrl',
            title: 'campaign_step_basic_page_title'
        })
        .when('/explore', { // Campaign exploration page
            templateUrl: 'views/templates/explore.html',
            controller: 'ExploreCtrl',
            title: 'Explore',
            reloadOnSearch: false // Ensure updating explore page filter params doesn't cause reload
        })
        .when('/explore/category/:category_alias?', { // Campaign exploration page
            templateUrl: 'views/templates/explore.html',
            controller: 'ExploreCtrl',
            title: 'Explore',
            reloadOnSearch: false // Ensure updating explore page filter params doesn't cause reload
        })
        // .when('/campaign/:campaign_id/:campaign_name?', { // Detailed campaign view
        // 	templateUrl: 'views/templates/campaign.html',
        // 	controller: 'CampaignCtrl',
        // 	reloadOnSearch: false
        // })
        .when('/campaign-setup/:campaign_id', { // Campaign edit (creation continued)
            templateUrl: 'views/templates/campaign-setup.html',
            controller: 'CreateCampaignCtrl',
            title: 'campaign_step_detail_page_title'
        })
        .when('/campaign-widget/:campaign_id', { // Widget setup (creation continued)
            templateUrl: 'views/templates/campaign-widget.html',
            controller: 'WidgetCtrl',
            title: 'campaign_step_widget_page_title'
        })
        .when('/campaign-setup', { // Campaign setup (creation continued)
            templateUrl: 'views/templates/campaign-setup.html',
            controller: 'CreateCampaignCtrl',
            title: 'Campaign Setup'
        })
        .when('/profile-setup/:campaign_id', { // Profile setup (creation continued)
            templateUrl: 'views/templates/profile-setup.html',
            controller: 'UserProfileCtrl',
            title: 'campaign_step_profile_page_title'
        })

        .when('/admin/dashboard', { // Control panel, user management
            templateUrl: 'views/templates/portal-setting.html',
            controller: 'PortalSettingCtrl',
            title: 'Admin Dashboard',
            reloadOnSearch: false,
        })
        /* forgot password */
        .when('/authenticate/forgot/:token', {
            templateUrl: 'views/templates/forgot-password.html',
            controller: 'ResetPasswordCtrl',
            title: 'Forgot Password'
        })
        /* confirm email change */
        .when('/account/email/confirm/:token', {
            templateUrl: 'views/templates/confirm-email.html',
            controller: 'confirmEmailCtrl',
            title: 'Confirm Email'
        })
        /* review campaign */
        .when('/campaign-review/:campaign_id', {
            templateUrl: 'views/templates/campaign-review.html',
            controller: 'campaignReviewCtrl',
            title: 'Campaign Review',
            reloadOnSearch: false
        })
        /* retry credit card */
        .when('/pledge-retry', {
            templateUrl: 'views/templates/retry-card.html',
            controller: 'RetryCardCtrl',
            title: 'Retry Card'
        })
        /* user profile page */
        .when('/profile/:person_id?', {
            templateUrl: 'views/templates/profile.html',
            controller: 'ProfileCtrl',
            title: 'Profile'
        })
        /* pledge history */
        .when('/pledge-history', {
            templateUrl: 'views/templates/pledge-history.html',
            controller: 'PledgeHistoryCtrl',
            title: 'Pledge History',
            reloadOnSearch: false
        })
        /* campaign manager */
        .when('/campaign-manager', {
            templateUrl: 'views/templates/campaign-management.html',
            controller: 'CampaignManagementCtrl',
            title: 'Campaign Management',
            reloadOnSearch: false
        })
        /* profile settings */
        .when('/profile-setting', {
            templateUrl: 'views/templates/profile-setting.html',
            controller: 'ProfileSettingCtrl',
            title: 'Profile Settings',
            reloadOnSearch: false,
        })
        /* payment settings */
        .when('/payment-setting', {
            templateUrl: 'views/templates/payment-setting.html',
            controller: 'PaymentSettingCtrl',
            title: 'Payment Settings',
            reloadOnSearch: false,
        })
        /* 404 ERROR PAGE */
        .when('/404', {
            templateUrl: 'views/templates/404.html',
            controller: 'SiteErrorCtrl',
            title: '404 Error'
        })
        /* campaign pledge-levels */
        .when('/rewards', {
            templateUrl: 'views/templates/rewards.html',
            controller: 'CreateCampaignCtrl',
            title: 'Rewards'
        })
        .when('/rewards/:campaign_id', {
            templateUrl: 'views/templates/rewards.html',
            controller: 'CreateCampaignCtrl',
            title: 'campaign_step_reward_page_title'
        })
        .when('/story/:campaign_id', { // This will only be used if campaign description field is enabled on step 3
            templateUrl: 'views/templates/rewards.html',
            controller: 'CreateCampaignCtrl',
            title: 'campaign_step_reward_page_title'
        })
        /* campaign stripe setup */
        .when('/complete-funding', {
            templateUrl: 'views/templates/complete-funding.html',
            controller: 'CompleteFundingCtrl',
            title: 'Complete Funding'
        })
        .when('/complete-funding/:campaign_id', {
            templateUrl: 'views/templates/complete-funding.html',
            controller: 'CompleteFundingCtrl',
            title: 'campaign_step_funding_page_title'
        })
        /* start campaign */
        .when('/start', {
            templateUrl: 'views/templates/start.html',
            controller: 'StartCtrl',
            title: 'Start Your Project'
        })
        /* campaign preview */
        .when('/campaign-preview/:campaign_id', {
            templateUrl: 'views/templates/campaign-preview.html',
            controller: 'CampaignPreviewCtrl',
            title: 'campaign_step_preview_page_title',
            reloadOnSearch: false // Ensure updating explore page filter params doesn't cause reload
        })
        /* pledge campaign */
        .when('/pledge-campaign', {
            templateUrl: 'views/templates/pledge-campaign.html',
            controller: 'PledgeCampaignCtrl',
            title: 'Contribute to Campaign'
        })
        /* pledge failed */
        .when('/stripe/connect', {
            templateUrl: 'views/templates/stripe-connect.html',
            controller: 'StripeConnectCtrl',
            title: 'Stripe Connect'
        })
        /* message center */
        .when('/message-center', {
            templateUrl: 'views/templates/message-center.html',
            controller: 'MessageCenterCtrl',
            title: 'Message Center'
        })
        /* message center */
        .when('/message-center/:message_id/:person_id_sender', {
            templateUrl: 'views/templates/message-center.html',
            controller: 'MessageCenterCtrl',
            title: 'Message Center'
        })
        .when('/campaign-manager/stream-management/:campaign_id', {
            templateUrl: 'views/templates/stream-management.html',
            controller: 'StreamManageCtrl',
            title: 'Manage Stream'
        })
        .when('/campaign-manager/transactions/:campaign_id', {
            templateUrl: 'views/templates/transaction-details.html',
            controller: 'TransactionDetailsCtrl',
            title: 'Transactions'
        })
        .when('/inline-contribution', {
            templateUrl: 'views/templates/inline-contribution.html',
            controller: 'InlineContributionCtrl',
            controllerAs: 'inlineContribution',
            title: 'Inline Contribution'
        })
        .when('/embed/card-view/:campaign_id', {
            templateUrl: 'views/templates/partials/campaign/embed/card_view.html',
            controller: 'EmbedViewsCtrl',
            title: 'Card View',
        })
        .when('/testings', {
            templateUrl: 'views/templates/api.html',
            controller: 'ApiCtrl',
            resolve: {
                apiDocs: function($http) {
                    return $http.get('/docs/api_docs.json');
                }
            }
        })
        //////////////////// server not available page
        .when('/server-error', {
            templateUrl: 'views/templates/server-not-available.html',
        })
        .when('/#!', {
            redirectTo: '/',
        })
        .when('/!', {
            redirectTo: '/',
        })
        .when('/#', {
            redirectTo: '/',
        })
        .when('/#', {
            redirectTo: '/',
        })
        .when('/#!1', {
            redirectTo: '/',
        })
        .when('/!1', {
            redirectTo: '/',
        })
        .otherwise({
            resolve: {
                "valid": function(ValidateURLService) {
                    return ValidateURLService.validate();
                }
            },
            templateUrl: 'views/templates/custom-page.html',
            controller: 'CustomPageCtrl',
            reloadOnSearch: false,
        });

    flowFactoryProvider.defaults = {
        target: API_URL.url + API_URL.loc + '/photos',
        query: function(file, chunk) {
            return {
                "mediaType": file.file.type
            }
        },
        singleFile: true
    };

    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        CDN.APP_URL
    ]);

    var calendar_translation_error = function() {
        $.get("views/translation/" + LANG.DEFAULT_LANG + "/calendar.json", function(data) {
            var date_translation = data.date_label;
            var time_translation = data.time_label;
            var sunday = data.weekday_short_sun;
            var mon = data.weekday_short_mon;
            var tues = data.weekday_short_tues;
            var weds = data.weekday_short_weds;
            var thurs = data.weekday_short_thurs;
            var fri = data.weekday_short_fri;
            var sat = data.weekday_short_sat;

            var PLURAL_CATEGORY = {
                ZERO: "zero",
                ONE: "one",
                TWO: "two",
                FEW: "few",
                MANY: "many",
                OTHER: "other"
            };

            $provide.value("$locale", {
                "DATETIME_FORMATS": {
                    "AMPMS": [
                        data.am,
                        data.pm
                    ],
                    "DAY": [
                        data.weekday_sun,
                        data.weekday_mon,
                        data.weekday_tues,
                        data.weekday_weds,
                        data.weekday_thurs,
                        data.weekday_fri,
                        data.weekday_sat
                    ],
                    "ERANAMES": [
                        data.eraname_BC,
                        data.eraname_AD
                    ],
                    "ERAS": [
                        data.era_BC,
                        data.era_AD
                    ],
                    "FIRSTDAYOFWEEK": data.first_day_of_week,
                    "MONTH": [
                        data.January,
                        data.February,
                        data.March,
                        data.April,
                        data.May,
                        data.June,
                        data.July,
                        data.August,
                        data.September,
                        data.October,
                        data.November,
                        data.December
                    ],
                    "SHORTDAY": [
                        data.weekday_short_sun,
                        data.weekday_short_mon,
                        data.weekday_short_tues,
                        data.weekday_short_weds,
                        data.weekday_short_thurs,
                        data.weekday_short_fri,
                        data.weekday_short_sat
                    ],
                    "SHORTMONTH": [
                        data.short_January,
                        data.short_February,
                        data.short_March,
                        data.short_April,
                        data.short_May,
                        data.short_June,
                        data.short_July,
                        data.short_August,
                        data.short_September,
                        data.short_October,
                        data.short_November,
                        data.short_December
                    ],
                    "STANDALONEMONTH": [
                        data.January,
                        data.February,
                        data.March,
                        data.April,
                        data.May,
                        data.June,
                        data.July,
                        data.August,
                        data.September,
                        data.October,
                        data.November,
                        data.December
                    ],
                    "WEEKENDRANGE": [
                        5,
                        6
                    ],
                    "fullDate": "EEEE, MMMM d, y",
                    "longDate": "MMMM d, y",
                    "medium": "MMM d, y h:mm:ss a",
                    "mediumDate": "MMM d, y",
                    "mediumTime": "h:mm:ss a",
                    "short": "M/d/yy h:mm a",
                    "shortDate": "M/d/yy",
                    "shortTime": "h:mm a"
                },
                "NUMBER_FORMATS": {
                    "CURRENCY_SYM": data.currency_sym,
                    "DECIMAL_SEP": ".",
                    "GROUP_SEP": ",",
                    "PATTERNS": [{
                        "gSize": 3,
                        "lgSize": 3,
                        "maxFrac": 3,
                        "minFrac": 0,
                        "minInt": 1,
                        "negPre": "-",
                        "negSuf": "",
                        "posPre": "",
                        "posSuf": ""
                    }, {
                        "gSize": 3,
                        "lgSize": 3,
                        "maxFrac": 2,
                        "minFrac": 2,
                        "minInt": 1,
                        "negPre": "-\u00a4",
                        "negSuf": "",
                        "posPre": "\u00a4",
                        "posSuf": ""
                    }]
                },
                "pluralCat": function(n, opt_precision) {
                    return PLURAL_CATEGORY.OTHER;
                }
            });

            ngQuickDateDefaultsProvider.set({
                closeButtonHtml: "<i class='fa fa-times'></i>",
                buttonIconHtml: "<i class='fa fa-calendar'></i> ",
                nextLinkHtml: "<i class='fa fa-chevron-right'></i>",
                prevLinkHtml: "<i class='fa fa-chevron-left'></i>",
                dateLabelHtml: date_translation,
                timeLabelHtml: time_translation,
                dayAbbreviations: [sunday, mon, tues, weds, thurs, fri, sat],
            });
        });
    }

    $.ajax({
        url: "views/translation/" + LANG.PREFERRED_LANG + "/calendar.json",
        type: "GET",
        success: function(data) {

            if (data.weekday_short_fri === undefined) {
                calendar_translation_error();
                return;
            }

            var date_translation = data.date_label;
            var time_translation = data.time_label;
            var sunday = data.weekday_short_sun;
            var mon = data.weekday_short_mon;
            var tues = data.weekday_short_tues;
            var weds = data.weekday_short_weds;
            var thurs = data.weekday_short_thurs;
            var fri = data.weekday_short_fri;
            var sat = data.weekday_short_sat;

            var PLURAL_CATEGORY = {
                ZERO: "zero",
                ONE: "one",
                TWO: "two",
                FEW: "few",
                MANY: "many",
                OTHER: "other"
            };

            $provide.value("$locale", {
                "DATETIME_FORMATS": {
                    "AMPMS": [
                        data.am,
                        data.pm
                    ],
                    "DAY": [
                        data.weekday_sun,
                        data.weekday_mon,
                        data.weekday_tues,
                        data.weekday_weds,
                        data.weekday_thurs,
                        data.weekday_fri,
                        data.weekday_sat
                    ],
                    "ERANAMES": [
                        data.eraname_BC,
                        data.eraname_AD
                    ],
                    "ERAS": [
                        data.era_BC,
                        data.era_AD
                    ],
                    "FIRSTDAYOFWEEK": data.first_day_of_week,
                    "MONTH": [
                        data.January,
                        data.February,
                        data.March,
                        data.April,
                        data.May,
                        data.June,
                        data.July,
                        data.August,
                        data.September,
                        data.October,
                        data.November,
                        data.December
                    ],
                    "SHORTDAY": [
                        data.weekday_short_sun,
                        data.weekday_short_mon,
                        data.weekday_short_tues,
                        data.weekday_short_weds,
                        data.weekday_short_thurs,
                        data.weekday_short_fri,
                        data.weekday_short_sat
                    ],
                    "SHORTMONTH": [
                        data.short_January,
                        data.short_February,
                        data.short_March,
                        data.short_April,
                        data.short_May,
                        data.short_June,
                        data.short_July,
                        data.short_August,
                        data.short_September,
                        data.short_October,
                        data.short_November,
                        data.short_December
                    ],
                    "STANDALONEMONTH": [
                        data.January,
                        data.February,
                        data.March,
                        data.April,
                        data.May,
                        data.June,
                        data.July,
                        data.August,
                        data.September,
                        data.October,
                        data.November,
                        data.December
                    ],
                    "WEEKENDRANGE": [
                        5,
                        6
                    ],
                    "fullDate": "EEEE, MMMM d, y",
                    "longDate": "MMMM d, y",
                    "medium": "MMM d, y h:mm:ss a",
                    "mediumDate": "MMM d, y",
                    "mediumTime": "h:mm:ss a",
                    "short": "M/d/yy h:mm a",
                    "shortDate": "M/d/yy",
                    "shortTime": "h:mm a"
                },
                "NUMBER_FORMATS": {
                    "CURRENCY_SYM": data.currency_sym,
                    "DECIMAL_SEP": ".",
                    "GROUP_SEP": ",",
                    "PATTERNS": [{
                        "gSize": 3,
                        "lgSize": 3,
                        "maxFrac": 3,
                        "minFrac": 0,
                        "minInt": 1,
                        "negPre": "-",
                        "negSuf": "",
                        "posPre": "",
                        "posSuf": ""
                    }, {
                        "gSize": 3,
                        "lgSize": 3,
                        "maxFrac": 2,
                        "minFrac": 2,
                        "minInt": 1,
                        "negPre": "-\u00a4",
                        "negSuf": "",
                        "posPre": "\u00a4",
                        "posSuf": ""
                    }]
                },
                "pluralCat": function(n, opt_precision) {
                    return PLURAL_CATEGORY.OTHER;
                }
            });

            ngQuickDateDefaultsProvider.set({
                closeButtonHtml: "<i class='fa fa-times'></i>",
                buttonIconHtml: "<i class='fa fa-calendar'></i> ",
                nextLinkHtml: "<i class='fa fa-chevron-right'></i>",
                prevLinkHtml: "<i class='fa fa-chevron-left'></i>",
                dateLabelHtml: date_translation,
                timeLabelHtml: time_translation,
                dayAbbreviations: [sunday, mon, tues, weds, thurs, fri, sat],
            });
        },
        error: calendar_translation_error,
    });
});