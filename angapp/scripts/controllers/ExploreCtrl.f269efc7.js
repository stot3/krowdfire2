app.controller("ExploreCtrl",["$timeout","$scope","$rootScope","CampaignSettingsService","$routeParams","$translatePartialLoader","$translate","$location","$route","RESOURCE_REGIONS","Restangular","Geolocator","RestFullResponse","PortalSettingsService","RequestCacheService","VideoLinkService","$document",function($timeout,$scope,$rootScope,CampaignSettingsService,$routeParams,$translatePartialLoader,$translate,$location,$route,RESOURCE_REGIONS,Restangular,Geolocator,RestFullResponse,PortalSettingsService,RequestCacheService,VideoLinkService,$document){var nativeLookup,$msg;function updateCampaignListing(){var pageparam;pageparam=1==$routeParams.page||1==$scope.sortOrFilters.page?null:$scope.sortOrFilters.page,$location.search("page",pageparam),RestFullResponse.all("campaign").getList($scope.sortOrFilters).then((function(success){void 0!==$routeParams.sort&&$("#sort-campaigns").dropdown("set selected",$routeParams.sort),void 0!==$scope.setDefaultSort&&null!=typeof $scope.setDefaultSort||($scope.setDefaultSort={default:"",default_text:""}),"default"!==$scope.setDefaultSort.default&&("Random"===$scope.setDefaultSort.default_text&&""==$scope.sortOrFilters.sort?$scope.updateSort($scope.setDefaultSort.default,"random"):""==$scope.sortOrFilters.sort&&$scope.updateSort($scope.setDefaultSort.default),$location.search().sort==$scope.setDefaultSort.default&&$timeout((function(){$("#sort-campaigns").dropdown("set selected",$scope.setDefaultSort.default),$("#sort-campaigns").dropdown("set text",$scope.setDefaultSort.default_text)}),0)),$location.search().description&&0===success.data.length&&($scope.sortOrFilters.filters.description=null,$scope.sortOrFilters.filters.name=$location.search().description,RestFullResponse.all("campaign").getList($scope.sortOrFilters).then((function(success){$scope.campaigns=success.data,0===success.data.length?$scope.noCampaign=!0:($scope.noCampaign=!1,$scope.campigns=VideoLinkService.proccessCampaigns($scope.campaigns));var headers=success.headers();$scope.sortOrFilters.pagination.currentpage=headers["x-pager-current-page"],$scope.sortOrFilters.pagination.numpages=headers["x-pager-last-page"],$scope.sortOrFilters.pagination.nextpage=headers["x-pager-next-page"],$scope.sortOrFilters.pagination.pagesinset=headers["x-pager-pages-in-set"],$scope.sortOrFilters.pagination.totalentries=headers["x-pager-total-entries"],$scope.sortOrFilters.pagination.entriesperpage=headers["x-pager-entries-per-page"]}))),$scope.campaigns=success.data,$scope.statuses=new Array,angular.forEach($scope.campaigns,(function(value,index){value.entry_custom_status&&-1===$scope.statuses.indexOf(value.entry_custom_status)&&$scope.statuses.push(value.entry_custom_status),null!=value.cities&&checkNative(value.cities[0]),void 0!==$scope.public_settings.site_campaign_exclude_shipping_cost&&$scope.public_settings.site_campaign_exclude_shipping_cost&&(value.funded_amount=value.funded_amount-value.total_shipping_cost),CampaignSettingsService.processSettings(value.settings),value.settings=CampaignSettingsService.getSettings(),value.settings.master_progress_bar_hide=!1,$scope.progressHide?value.settings.master_progress_bar_hide=!0:value.settings.master_progress_bar_hide=!1,void 0!==value.settings.progress_bar_hide&&(value.settings.master_progress_bar_hide=value.settings.progress_bar_hide)})),0===success.data.length?$scope.noCampaign=!0:($scope.noCampaign=!1,$scope.campigns=VideoLinkService.proccessCampaigns($scope.campaigns));var headers=success.headers();$scope.sortOrFilters.pagination.currentpage=headers["x-pager-current-page"],$scope.sortOrFilters.pagination.numpages=headers["x-pager-last-page"],$scope.sortOrFilters.pagination.nextpage=headers["x-pager-next-page"],$scope.sortOrFilters.pagination.pagesinset=headers["x-pager-pages-in-set"],$scope.sortOrFilters.pagination.totalentries=headers["x-pager-total-entries"],$scope.sortOrFilters.pagination.entriesperpage=headers["x-pager-entries-per-page"],$scope.$emit("loading_finished")}))}function checkNative(cityObj){var cityFull="";nativeLookup&&(cityObj.country=null!=cityObj.country_native_name?cityObj.country_native_name:cityObj.country,cityObj.subcountry=null!=cityObj.subcountry_native_name?cityObj.subcountry_native_name:cityObj.subcountry,cityObj.city=null!=cityObj.city_native_name?cityObj.city_native_name:cityObj.city,cityFull=cityObj.country+", "+cityObj.subcountry+", "+cityObj.city,cityObj.city_full=cityFull,cityObj.name=cityFull)}function processParams(){!function(){var params=$location.search();if(void 0===$scope.public_settings?($scope.public_settings={},$scope.public_settings.exclude_ended_from_recent=!1):void 0===$scope.public_settings.exclude_ended_from_recent&&($scope.public_settings.exclude_ended_from_recent=!1),$scope.sortOrFilters.filters.category=[],$routeParams.category_alias)if($scope.categories)angular.forEach($scope.categories,(function(value){value.uri_paths&&value.uri_paths[0].path==$routeParams.category_alias&&$scope.sortOrFilters.filters.category.push(value.id)}));else{var categoryParam={active_only:0};categoryParam.active_only=$scope.public_settings.site_theme_category_display_with_campaigns_only?0:1,Restangular.one("portal").customGET("category",categoryParam).then((function(categories){$scope.categories=categories.plain(),angular.forEach($scope.categories,(function(value){value.uri_paths&&value.uri_paths[0].path==$routeParams.category_alias&&$scope.sortOrFilters.filters.category.push(value.id)}))}))}if(params.category instanceof Array)angular.forEach(params.category,(function(value){var temp=parseInt(value);temp&&!isNaN(temp)&&$scope.sortOrFilters.filters.category.push(temp)}));else if(params.category){var temp=parseInt(params.category);temp&&!isNaN(temp)&&$scope.sortOrFilters.filters.category.push(temp)}$scope.sortOrFilters.filters.location=params.location,$scope.sortOrFilters.filters.name=params.name,$scope.sortOrFilters.filters.description=params.description,params.entry_custom_status&&($scope.sortOrFilters.filters.entry_custom_status=params.entry_custom_status),params.sort?$scope.sortOrFilters.sort=params.sort:$scope.public_settings.exclude_ended_from_recent&&($scope.sortOrFilters.sort="entry_status_id"),$scope.sortOrFilters.page=params.page||1}(),setTimeout((function(){updateCampaignListing()}),1e3)}$scope.RESOURCE_REGIONS=RESOURCE_REGIONS,$scope.cities=[],$scope.loading=!1,$scope.explore_page_text={},$scope.moment=function(value,suffix){return moment(value).fromNow(suffix)},$scope.days_text="days ago",$scope.day_text="day ago",$scope.rdays_text="days to go",$scope.rday_text="day to go",$scope.hours_text="hours ago",$scope.hour_text="hour ago",$scope.rhours_text="hours to go",$scope.rhour_text="hour to go",$scope.minutes_text="minutes ago",$scope.minute_text="minute ago",$scope.rminutes_text="minutes to go",$scope.rminute_text="minute to go",$scope.dateInPast=function(value,sec){return 0==sec||"00"==sec||sec<0},$scope.noCampaign=!1,$scope.cityNameFilter={},$scope.sortOrFilters={sort:"",filters:{category:[],location:"",manager:"",blurb:"",name:"",description:"",entry_status_id:"",entry_custom_status:""},page_entries:9,page_limit:100,pagination:{},page:null},$scope.explore_page_html_content={top_banner:""},$scope.noSubs=0,$scope.firstTime=0,$scope.isDesktop=!0,$scope.scrollToCampaignCards=function(){$timeout((function(){$("html, body").animate({scrollTop:$("#campaign-card-list").offset().top-15},500)}))},$scope.loadMoreCampaigns=function(){$scope.sortOrFilters.page_entries+=9,$scope.loading=!0,RestFullResponse.all("campaign").getList($scope.sortOrFilters).then((function(success){$location.search().description&&0===success.data.length&&($scope.sortOrFilters.filters.description=null,$scope.sortOrFilters.filters.name=$location.search().description,RestFullResponse.all("campaign").getList($scope.sortOrFilters).then((function(success){$scope.campaigns=success.data,0===success.data.length?$scope.noCampaign=!0:($scope.noCampaign=!1,$scope.campigns=VideoLinkService.proccessCampaigns($scope.campaigns));var headers=success.headers();$scope.sortOrFilters.pagination.currentpage=headers["x-pager-current-page"],$scope.sortOrFilters.pagination.numpages=headers["x-pager-last-page"],$scope.sortOrFilters.pagination.nextpage=headers["x-pager-next-page"],$scope.sortOrFilters.pagination.pagesinset=headers["x-pager-pages-in-set"],$scope.sortOrFilters.pagination.totalentries=headers["x-pager-total-entries"],$scope.sortOrFilters.pagination.entriesperpage=headers["x-pager-entries-per-page"]}))),$scope.campaigns=success.data,angular.forEach($scope.campaigns,(function(value,index){null!=value.cities&&checkNative(value.cities[0]),void 0!==$scope.public_settings.site_campaign_exclude_shipping_cost&&$scope.public_settings.site_campaign_exclude_shipping_cost&&(value.funded_amount=value.funded_amount-value.total_shipping_cost),CampaignSettingsService.processSettings(value.settings),value.settings=CampaignSettingsService.getSettings(),value.settings.master_progress_bar_hide=!1,$scope.progressHide?value.settings.master_progress_bar_hide=!0:value.settings.master_progress_bar_hide=!1,void 0!==value.settings.progress_bar_hide&&(value.settings.master_progress_bar_hide=value.settings.progress_bar_hide)})),0===success.data.length?$scope.noCampaign=!0:($scope.noCampaign=!1,$scope.campigns=VideoLinkService.proccessCampaigns($scope.campaigns));var headers=success.headers();$scope.sortOrFilters.pagination.currentpage=headers["x-pager-current-page"],$scope.sortOrFilters.pagination.numpages=headers["x-pager-last-page"],$scope.sortOrFilters.pagination.nextpage=headers["x-pager-next-page"],$scope.sortOrFilters.pagination.pagesinset=headers["x-pager-pages-in-set"],$scope.sortOrFilters.pagination.totalentries=headers["x-pager-total-entries"],$scope.sortOrFilters.pagination.entriesperpage=headers["x-pager-entries-per-page"],$scope.loading=!1,setTimeout((function(){$("html, body").animate({scrollTop:$("#discover").offset().top+$("#discover").outerHeight(!0)-$(window).height()},1500)}),1e3)}))},$scope.isDesktopScreen=function(){var currentScreenWidth=$(window).width(),element=$(".mobile-collapsed");currentScreenWidth<=767?($scope.isDesktop=!1,element.removeClass("active")):($scope.isDesktop=!0,element.addClass("active"))},$scope.isDesktopScreen(),Restangular.one("portal/setting").getList().then((function(success){var categoryParam;$scope.public_settings={},angular.forEach(success,(function(value){3==value.setting_type_id&&($scope.public_settings[value.name]=value.value)})),$scope.infiniteScroller=$scope.public_settings.site_infinite_scroller,void 0!==$scope.infiniteScroller&&$scope.infiniteScroller||($scope.infiniteScroller={explore:!1,featured:!1,recent:!1,profile:!1}),$scope.public_settings.site_search_explore||($scope.public_settings.site_search_explore="name"),$scope.translateSearchPlaceholder(),nativeLookup=$scope.public_settings.site_theme_shipping_native_lookup,$scope.public_settings.site_theme_category_display_explore_sidebar&&((categoryParam={active_only:0}).active_only=$scope.public_settings.site_theme_category_display_with_campaigns_only?0:1,Restangular.one("portal").customGET("category",categoryParam).then((function(categories){$scope.categories=categories.plain(),function(categories){var categoriesCopy=angular.copy(categories);$scope.subcategories={},angular.forEach(categoriesCopy,(function(value,key){value.parent_category_id&&($scope.subcategories[value.parent_category_id]||($scope.subcategories[value.parent_category_id]=[]),$scope.subcategories[value.parent_category_id].push(value))}))}($scope.categories),$rootScope.checkexplore=$scope.categories,processParams()}))),$scope.public_settings.site_explore_page_text.homeSetting&&($scope.home_page_text=$scope.public_settings.site_home_page_text,$scope.main_banner_font_color={color:"#"+$scope.public_settings.site_home_page_text.main_banner.font_color,"font-family":$scope.public_settings.site_home_page_text.main_banner.font_family}),void 0===$scope.public_setting.site_campaign_allow_thumbnail_video&&($scope.public_settings.site_campaign_allow_thumbnail_video=!0),$scope.settingsLoaded=!0}),(function(failure){$msg=null!=failure.data?{header:failure.data.message}:{header:"Error"},$scope.errorMessage.push($msg)})),$scope.translateSearchPlaceholder=function(){var translate=$translate.instant(["explore_search_bycampaignid","explore_search_bydescripton","explore_search_bymanager","explore_search_byname"]);"name"==$scope.public_settings.site_search_explore&&($scope.searchPlaceholder=translate.explore_search_byname),"description"==$scope.public_settings.site_search_explore&&($scope.searchPlaceholder=translate.explore_search_bydescripton),"campaign ID"==$scope.public_settings.site_search_explore&&($scope.searchPlaceholder=translate.explore_search_bycampaignid),"manager"==$scope.public_settings.site_search_explore&&($scope.searchPlaceholder=translate.explore_search_bymanager)},$scope.selectAllSubCategories=function(category_id){var cat=$location.search().category||[];if(1==$scope.noSubs)return angular.forEach($scope.subcategories[category_id],(function(value,key,obj){for(var i=0;i<cat.length;i++)cat[i]==obj[key].category_id&&$location.search().category.splice(i,1)})),void($scope.noSubs=0);array_cat=[],1==$(angular.element("#sub-cat-dropdown-"+category_id)).hasClass("active")?angular.forEach($scope.subcategories[category_id],(function(value,key,obj){for(var i=0;i<cat.length;i++)cat[i]==obj[key].category_id&&$location.search().category.splice(i,1)})):angular.forEach($scope.subcategories[category_id],(function(value,key,obj){$scope.updateCategoryFilters(obj[key])}))},$scope.updateCategoryFilters=function(category){if("object"==typeof $location.search().category)var categories=$location.search().category||[];else{categories=[];var category_parse=parseInt($location.search().category);isNaN(category_parse)||categories.push(category_parse)}if(category){var index=categories.indexOf(category.id);index>-1?categories.splice(index,1):categories.push(parseInt(category.id))}else categories=[];if($scope.public_settings.site_enable_auto_select_subcat&&1==$scope.firstTime&&null!=category&&null!=category.parent_category_id){var sizeOfSubCats=$scope.subcategories[category.parent_category_id].length,sizeDeducted=sizeOfSubCats;$("#sub-cat-"+category.parent_category_id+" .content a").each((function(i,obj){angular.forEach($location.search().category,(function(val,key,object){val==obj.id&&sizeDeducted--}))})),sizeOfSubCats==sizeDeducted&&setTimeout((function(){$scope.noSubs=1,angular.element("#sub-cat-dropdown-"+category.parent_category_id).click()}),0)}$scope.firstTime=1,$location.search("category",categories),$scope.isDesktop||$scope.scrollToCampaignCards()},$scope.updateProgressFilters=function(status){"reset"==status?($location.search("entry_custom_status",null),$route.reload()):$location.search("entry_custom_status",status),$scope.isDesktop||$scope.scrollToCampaignCards()},$timeout((function(){$(window).resize((function(){$scope.isDesktopScreen()}))})),$scope.updateCampaignListing=function(){updateCampaignListing()},$scope.updateSort=function(sort,random){var randomModulo=Math.floor(77*Math.random())+7;random&&(sort+=randomModulo),sort&&$location.search("sort",sort)},$scope.getTotalItems=function(){var desiredtotal=$scope.sortOrFilters.pagination.entriesperpage*$scope.sortOrFilters.page_limit;return desiredtotal>$scope.sortOrFilters.pagination.totalentries?$scope.sortOrFilters.pagination.totalentries:desiredtotal},$scope.searchCities=function(term){term&&Geolocator.searchCities(term,nativeLookup).then((function(cities){$scope.cities=cities,angular.forEach($scope.cities,(function(value,index){checkNative(value)}))}))},$scope.getCityQuery=function(value){var cityID;value?value?(cityID=Geolocator.lookupCityID(value.name),$location.search("location",cityID)):$location.search("location",null):$location.search().location&&processParams()},$scope.$watch("cityNameFilter.selected",(function(value,oldvalue){$scope.searchCities(value)})),$scope.$watch((function(){return $location.search()}),(function(value){processParams()}),!0),$scope.resetLocation=function(){$scope.cityNameFilter.selected=void 0,$location.search("location",null),$(".ui.dropdown").dropdown("clear"),$(".ui.form").form("clear");var value=$translate.instant(["explore_search_location_placeholder"]);$("#locationPlaceholder").text(value.explore_search_location_placeholder)},$scope.searchTitles=function(term){term?$location.search($scope.public_settings.site_search_explore,term):$location.search($scope.public_settings.site_search_explore,null)},PortalSettingsService.getSettingsObj().then((function(success){$scope.progressHide=success.public_setting.site_campaign_progress_bar_hide,$scope.category_display=success.public_setting.site_theme_category_display_explore_sidebar,$scope.no_campaign_message=success.public_setting.site_theme_no_campaign_message,$scope.campaign_display=success.public_setting.site_theme_campaign_grid_display,$scope.explore_page_text=success.public_setting.site_explore_page_text,$scope.isISODate=success.public_setting.site_theme_campaign_display_iso_date,$scope.isCardLabelSwitch=success.public_setting.site_campaign_switch_card_label,$scope.isHideCampaignCardCreatorCategory=success.public_setting.site_campaign_hide_campaign_card_creator_or_category,$scope.setDefaultSort=success.public_setting.site_set_explore_default_sort,$scope.isCampaignCardBackers=success.public_setting.site_campaign_display_backers_campaign_card,$scope.displayGoalAmountOnCampaignCard=success.public_setting.site_campaign_display_funding_goal_amount_on_campaign_cards,void 0!==$scope.setDefaultSort&&$scope.setDefaultSort&&"default"==$scope.setDefaultSort.default&&""==$scope.sortOrFilters.sort&&void 0===$routeParams.sort&&$timeout((function(){$("#sort-campaigns").find(".item").removeClass("active selected")}))})),$scope.paginateUpdate=function(){updateCampaignListing(),setTimeout((function(){$("html, body").animate({scrollTop:$("#sort-campaigns").offset().top},100)}),1e3)},$scope.getCampaignThumbnailSrc=function(file){return"GIF Image"===file.file_type?$scope.server+"/static/images/"+file.path_external:$scope.server+"/image/campaign_thumbnail_xl/"+file.path_external},$scope.getTimeZoneAbbr=function(campaign){"f"==campaign.campaign_started&&(campaign.timezoneText=moment().tz(campaign.timezone).zoneAbbr())},$timeout((function(){$scope.campaign_status_corner_closed=$rootScope.checkTranslation("index_closed","index_status_corner_closed")}),1e3)}]),app.controller("exploreHeadCtrl",["$scope","Restangular","PortalSettingsService","$rootScope",function($scope,Restangular,PortalSettingsService,$rootScope){PortalSettingsService.getSettingsObj().then((function(success){var url=success.public_setting.site_theme_explore_background.path_external;url?($rootScope.ogMeta.image=$scope.server+"/static/images/"+url,$(".explore-head").css("background-image","url("+$rootScope.ogMeta.image+")")):($rootScope.ogMeta.image="images/placeholder-images/placeholder_explore_bg.png",$(".explore-head").css("background-image","url("+$rootScope.ogMeta.image+")"),$(".explore-head").css("background-size","cover"),$(".explore-head").css("background-repeat","no-repeat"),$(".explore-head").css("background-position","center center"))}),(function(failure){$rootScope.ogMeta.image="images/placeholder-images/placeholder_explore_bg.png",$(".explore-head").css("background-image","url("+$rootScope.ogMeta.image+")"),$(".explore-head").css("background-size","cover"),$(".explore-head").css("background-repeat","no-repeat"),$(".explore-head").css("background-position","center center")}))}]),app.controller("masthead2Ctrl",["$scope","Restangular","$timeout","PortalSettingsService","$rootScope",function($scope,Restangular,$timeout,PortalSettingsService,$rootScope){PortalSettingsService.getSettingsObj().then((function(success){var url=success.public_setting.site_theme_explore_background.path_external;url?($rootScope.ogMeta.image=$scope.server+"/static/images/"+url,$(".masthead").css("background-image","url("+$rootScope.ogMeta.image+")")):($rootScope.ogMeta.image="images/placeholder-images/placeholder_explore_bg.png",$(".masthead").css("background-image","url("+$rootScope.ogMeta.image+")"),$(".masthead").css("background-size","cover"),$(".masthead").css("background-repeat","no-repeat"),$(".masthead").css("background-position","center center"))}),(function(failure){$rootScope.ogMeta.image="images/placeholder-images/placeholder_explore_bg.png",$(".masthead").css("background-image","url("+$rootScope.ogMeta.image+")"),$(".masthead").css("background-size","cover"),$(".masthead").css("background-repeat","no-repeat"),$(".masthead").css("background-position","center center")}))}]);