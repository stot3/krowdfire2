app.controller("HomeCtrl",["$timeout","$scope","$route","$rootScope","$location","CampaignSettingsService","$translatePartialLoader","$translate","CreateCampaignService","Restangular","RESOURCE_REGIONS","InvitationService","PortalSettingsService","RequestCacheService","TimeStatusService","$sce","VideoLinkService","UserService","$q","RestFullResponse",function($timeout,$scope,$route,$rootScope,$location,CampaignSettingsService,$translatePartialLoader,$translate,CreateCampaignService,Restangular,RESOURCE_REGIONS,InvitationService,PortalSettingsService,RequestCacheService,TimeStatusService,$sce,VideoLinkService,UserService,$q,RestFullResponse){var nativeLookup;$scope.RESOURCE_REGIONS=RESOURCE_REGIONS,$scope.entriesPerType=4,$scope.timeStatusObj={},$scope.loadingFeatured=!1,$scope.loadingActive=!1,$scope.moment=function(value,suffix){return moment(value).fromNow(suffix)},$scope.days_text="days ago",$scope.day_text="day ago",$scope.rdays_text="days to go",$scope.rday_text="day to go",$scope.hours_text="hours ago",$scope.hour_text="hour ago",$scope.rhours_text="hours to go",$scope.rhour_text="hour to go",$scope.minutes_text="minutes ago",$scope.minute_text="minute ago",$scope.rminutes_text="minutes to go",$scope.rminute_text="minute to go",$scope.dateInPast=function(value,sec){return 0==sec||"00"==sec||sec<0},$scope.home_page_text={main_banner:{header_one:"",header_two:"",paragraph:"",display:""},middle_header:"",bottom_banner:{header_top:"",paragraph:"",header_bottom:"",left_column:{display:1,header:"",paragraph:""},middle_column:{display:1,header:"",paragraph:""},right_column:{display:1,header:"",paragraph:""}}},$scope.home_page_html_content={main_banner:"",bottom_banner:""};var arr_count=0,categoryId=[],newar=[];$scope.openInvitationPopUp=function(){$("#requestModal.ui.modal").modal("show")},$scope.hideInvitationPopUp=function(){$("#requestModal.ui.modal").modal("hide")},$scope.hideSuccessModal=function(){$("#successModal.ui.modal").modal("hide")},$scope.hideErrorModal=function(){$("#errorModal.ui.modal").modal("hide")};$scope.email="",$scope.invitationError="",PortalSettingsService.getSettingsObj().then((function(success){if($scope.home_page_text=success.public_setting.site_home_page_text,nativeLookup=success.public_setting.site_theme_shipping_native_lookup,$scope.public_settings={},$scope.public_settings.site_campaign_exclude_shipping_cost=success.public_setting.site_campaign_exclude_shipping_cost,$scope.isFeaturedCampaignLimitIncreased=success.public_setting.site_increase_featured_campaigns_limit,$scope.isHideCampaignCardCreatorCategory=success.public_setting.site_campaign_hide_campaign_card_creator_or_category,$scope.isCampaignCardBackers=success.public_setting.site_campaign_display_backers_campaign_card,$scope.infiniteScroller=success.public_setting.site_infinite_scroller,$scope.public_settings.site_default_campaign_rows=success.public_setting.site_default_campaign_rows,$scope.homepageCustomHtmlBlock=success.public_setting.site_homepage_custom_html_block,$scope.hideStartCampaignPage=success.public_setting.site_campaign_creation_hide_start_page,$scope.displayGoalAmountOnCampaignCard=success.public_setting.site_campaign_display_funding_goal_amount_on_campaign_cards,void 0!==$scope.infiniteScroller&&$scope.infiniteScroller||($scope.infiniteScroller={explore:!1,featured:!1,recent:!1,profile:!1}),void 0!==$scope.public_settings.site_default_campaign_rows&&$scope.public_settings.site_default_campaign_rows||($scope.public_settings.site_default_campaign_rows={featured:1,recent:1}),$scope.featuredCampaignsLimit=4,get_recent_campaigns(success.public_setting.recentProjectHideFeatured,success.public_setting.exclude_ended_from_recent),getFeaturedCampaigns(),$scope.site_theme_banner_is_image=success.public_setting.site_theme_banner_is_image,$scope.site_theme_banner_video_mute=success.public_setting.site_theme_banner_video_mute,$scope.isCardLabelSwitch=success.public_setting.site_campaign_switch_card_label,0==$scope.site_theme_banner_is_image){var initialVideoLink=success.public_setting.site_theme_banner_video_link,videoSettings={mute:$scope.site_theme_banner_video_mute,autoplay:!0};VideoLinkService.setSettings(videoSettings),VideoLinkService.processVideoLink(initialVideoLink),$scope.site_theme_banner_video_link_type=VideoLinkService.get_video_type(),$scope.site_theme_banner_video_link=VideoLinkService.get_video_link()}$scope.site_theme_main_background=success.public_setting.site_theme_main_background,$scope.main_banner_font_color={color:"#"+success.public_setting.site_home_page_text.main_banner.font_color,"font-family":success.public_setting.site_home_page_text.main_banner.font_family},$scope.middle_font_color={color:"#"+success.public_setting.site_home_page_text.middle_font_color,"font-family":success.public_setting.site_home_page_text.middle_font_family},$scope.bottom_banner_top_header_color={color:"#"+success.public_setting.site_home_page_text.bottom_banner.top_header_font_color,"font-family":success.public_setting.site_home_page_text.bottom_banner.top_header_font_family},$scope.bottom_banner_paragraph_color={color:"#"+success.public_setting.site_home_page_text.bottom_banner.paragraph_font_color,"font-family":success.public_setting.site_home_page_text.bottom_banner.paragraph_font_family},$scope.bottom_banner_column_header_font_style={color:"#"+success.public_setting.site_home_page_text.bottom_banner.column_header_font_color,"font-family":success.public_setting.site_home_page_text.bottom_banner.column_header_font_family};var bottom_header_color=success.public_setting.site_home_page_text.bottom_banner.bottom_header_font_color;bottom_header_color||(bottom_header_color="FFFFFF"),$scope.bottom_banner_bottom_header_color={color:"#"+bottom_header_color,"font-family":success.public_setting.site_home_page_text.bottom_banner.bottom_header_font_family},success.public_setting.site_home_page_text.bottom_banner.learn_more_button_text&&0!=success.public_setting.site_home_page_text.bottom_banner.learn_more_button_text.length||($scope.home_page_text.bottom_banner.learn_more_button_text="Learn more"),success.public_setting.site_home_page_text.bottom_banner.learn_more_button_text_link&&0!=success.public_setting.site_home_page_text.bottom_banner.learn_more_button_text_link.length||($scope.home_page_text.bottom_banner.learn_more_button_text_link="about"),success.public_setting.site_home_page_text.main_banner.button_text&&0!=success.public_setting.site_home_page_text.main_banner.button_text.length||($scope.home_page_text.main_banner.button_text="Start Project"),success.public_setting.site_home_page_text.main_banner.button_text_link&&0!=success.public_setting.site_home_page_text.main_banner.button_text_link.length||($scope.home_page_text.main_banner.button_text_link="start"),success.public_setting.site_home_page_text.main_banner.block_alignment&&($scope.blockAlignmentStyle={"text-align":success.public_setting.site_home_page_text.main_banner.block_alignment.value}),void 0===success.public_setting.site_home_page_text.bottom_banner.learn_more_display_button?$scope.learn_more_display_button=!0:$scope.learn_more_display_button=success.public_setting.site_home_page_text.bottom_banner.learn_more_display_button,$scope.no_campaign_message=success.public_setting.site_theme_no_campaign_message,$scope.hasCategory=success.public_setting.site_theme_category_display,$scope.campaign_display=success.public_setting.site_theme_campaign_grid_display,$scope.isISODate=success.public_setting.site_theme_campaign_display_iso_date,$scope.hideStartButton=success.public_setting.site_admin_campaign_management_only&&"/start"==$scope.home_page_text.main_banner.button_text_link&&1!=UserService.person_type_id,$scope.hideStartCampaignPage&&void 0!==$scope.hideStartCampaignPage&&($scope.goToCampaignCreation=function(){$scope.campaign={},$scope.campaign.profile_type_id=1,$scope.campaign.raise_mode_id=success.public_setting.site_campaign_raise_modes.default,$scope.campaign.name="unnamed_campaign",UserService.isLoggedIn()?Restangular.one("campaign").customPOST($scope.campaign).then((function(response){var id=response.entry_id;UserService.updateUserData({campaign_manager:1}),$location.path("/getstarted/"+id)}),(function(error){$scope.errorMsg=error.data.message})):$timeout((function(){$location.path("/login")}))})})),RestFullResponse.all("campaign").getList().then((function(success){$scope.allcampaigns=success.data,angular.forEach($scope.allcampaigns,(function(value,key){value.categories&&angular.forEach(value.categories,(function(v,k){categoryId[arr_count]=v.category_id,arr_count++})),CampaignSettingsService.processSettings(value.settings),value.settings=CampaignSettingsService.getSettings()})),newar=$.unique(categoryId.sort()).sort(),$.each(newar,(function(index,val){}));success.headers();$scope.campaignFinished=!0,checkLoader()})),Restangular.one("portal/setting").getList().then((function(success){if($scope.public_settings={},angular.forEach(success,(function(value){3==value.setting_type_id&&($scope.public_settings[value.name]=value.value)})),void 0===$scope.public_settings.site_campaign_allow_thumbnail_video&&($scope.public_settings.site_campaign_allow_thumbnail_video=!0),void 0===$scope.public_settings.exclude_ended_from_recent&&($scope.public_settings.exclude_ended_from_recent=!1),$scope.public_settings.site_theme_category_display){var categoryParam={active_only:0};categoryParam.active_only=$scope.public_settings.site_theme_category_display_with_campaigns_only?0:1,Restangular.one("portal").customGET("category",categoryParam).then((function(categories){$scope.categories=categories,$rootScope.checkhome=$scope.categories,$scope.categoryFinished=!0,checkLoader()}))}$scope.setVideoHeight(),$scope.settingsFinished=!0,checkLoader()}),(function(failure){console.error(failure),$msg={header:failure.data.message},$scope.errorMessage.push($msg),$scope.settingsFinished=!0,checkLoader()})),$scope.hascampaigns=function(id){var bool=0;return $.each(newar,(function(index,val){id==val&&bool++})),bool};var get_recent_campaigns=function(recentProjectHideFeatured,exclude_ended_from_recent){if(void 0===recentProjectHideFeatured&&(recentProjectHideFeatured=!1),void 0===exclude_ended_from_recent&&(exclude_ended_from_recent=!1),recentProjectHideFeatured)$scope.recent_campaigns_filters={sort:"-created",filters:{featured:"f"},page_entries:$scope.entriesPerType};else{if(exclude_ended_from_recent)var sort="entry_status_id,-created";else sort="-created";$scope.recent_campaigns_filters={sort:sort,page_entries:$scope.entriesPerType}}if($scope.public_settings.site_default_campaign_rows&&$scope.public_settings.site_default_campaign_rows.recent){var rows=$scope.public_settings.site_default_campaign_rows.recent;$scope.entriesPerType=4*rows,$scope.recent_campaigns_filters.page_entries=$scope.entriesPerType}RestFullResponse.all("campaign").getList($scope.recent_campaigns_filters).then((function(success){$scope.recentcampaigns=success.data,$scope.recentcampaigns=proccessVideoLinks($scope.recentcampaigns),angular.forEach($scope.recentcampaigns,(function(value,index){null!=value.cities&&checkNative(value.cities[0]),void 0!==$scope.public_settings.site_campaign_exclude_shipping_cost&&$scope.public_settings.site_campaign_exclude_shipping_cost&&(value.funded_amount=value.funded_amount-value.total_shipping_cost),CampaignSettingsService.processSettings(value.settings),value.settings=CampaignSettingsService.getSettings(),$scope.progressHide=$scope.public_settings.site_campaign_progress_bar_hide,value.settings.master_progress_bar_hide=!1,$scope.progressHide?value.settings.master_progress_bar_hide=!0:value.settings.master_progress_bar_hide=!1,void 0!==value.settings.progress_bar_hide&&(value.settings.master_progress_bar_hide=value.settings.progress_bar_hide)}));var headers=success.headers();$scope.totalEntriesRecent=headers["x-pager-total-entries"],$scope.campaignListFinished=!0,checkLoader()}))},getFeaturedCampaigns=function(){if($scope.public_settings.site_default_campaign_rows&&$scope.public_settings.site_default_campaign_rows.featured){var rows=$scope.public_settings.site_default_campaign_rows.featured;$scope.featuredCampaignsLimit=4*rows}RestFullResponse.all("campaign").getList({sort:"-display_priority",filters:{featured:"t"},page_entries:$scope.featuredCampaignsLimit}).then((function(success){$scope.featuredcampaigns=success.data,$scope.featuredcampaigns=proccessVideoLinks($scope.featuredcampaigns),angular.forEach($scope.featuredcampaigns,(function(value,index){null!=value.cities&&checkNative(value.cities[0]),void 0!==$scope.public_settings.site_campaign_exclude_shipping_cost&&$scope.public_settings.site_campaign_exclude_shipping_cost&&(value.funded_amount=value.funded_amount-value.total_shipping_cost),CampaignSettingsService.processSettings(value.settings),value.settings=CampaignSettingsService.getSettings(),$scope.progressHide=$scope.public_settings.site_campaign_progress_bar_hide,value.settings.master_progress_bar_hide=!1,$scope.progressHide?value.settings.master_progress_bar_hide=!0:value.settings.master_progress_bar_hide=!1,void 0!==value.settings.progress_bar_hide&&(value.settings.master_progress_bar_hide=value.settings.progress_bar_hide)}));var headers=success.headers();$scope.totalEntriesFeatured=headers["x-pager-total-entries"],$scope.featuredCampaignFinished=!0,checkLoader()}))};function checkLoader(){$scope.campaignFinished&&$scope.settingsFinished&&$scope.campaignListFinished&&$scope.featuredCampaignFinished&&$scope.$emit("loading_finished")}function checkNative(cityObj){var cityFull="";nativeLookup&&(cityObj.country=null!=cityObj.country_native_name?cityObj.country_native_name:cityObj.country,cityObj.subcountry=null!=cityObj.subcountry_native_name?cityObj.subcountry_native_name:cityObj.subcountry,cityObj.city=null!=cityObj.city_native_name?cityObj.city_native_name:cityObj.city,cityFull=cityObj.country+", "+cityObj.subcountry+", "+cityObj.city,cityObj.city_full=cityFull,cityObj.name=cityFull)}function proccessVideoLinks(campaigns){if(campaigns.length<=0)return campaigns;for(var i=0;i<campaigns.length;i++)if(campaigns[i].links){for(var thumbnailVideoLink="",j=0;j<campaigns[i].links.length;j++)campaigns[i].links[j].region_id==RESOURCE_REGIONS.campaign.thumbnail_video&&(thumbnailVideoLink=campaigns[i].links[j].uri);if(""!=thumbnailVideoLink){VideoLinkService.setSettings({mute:!0,autoplay:!0}),VideoLinkService.processVideoLink(thumbnailVideoLink,campaigns[i].id),campaigns[i].thumbnail_video_type=VideoLinkService.get_video_type(),campaigns[i].thumbnail_video_link=VideoLinkService.get_video_link()}}return campaigns}$scope.loadMoreFeaturedCampaigns=function(){$scope.featuredCampaignsLimit+=12,$scope.loadingFeatured=!0,RestFullResponse.all("campaign").getList({sort:"-display_priority",filters:{featured:"t"},page_entries:$scope.featuredCampaignsLimit}).then((function(success){$scope.featuredcampaigns=success.data,$scope.featuredcampaigns=proccessVideoLinks($scope.featuredcampaigns),angular.forEach($scope.featuredcampaigns,(function(value,index){null!=value.cities&&checkNative(value.cities[0]),void 0!==$scope.public_settings.site_campaign_exclude_shipping_cost&&$scope.public_settings.site_campaign_exclude_shipping_cost&&(value.funded_amount=value.funded_amount-value.total_shipping_cost),CampaignSettingsService.processSettings(value.settings),value.settings=CampaignSettingsService.getSettings(),$scope.progressHide=$scope.public_settings.site_campaign_progress_bar_hide,value.settings.master_progress_bar_hide=!1,$scope.progressHide?value.settings.master_progress_bar_hide=!0:value.settings.master_progress_bar_hide=!1,void 0!==value.settings.progress_bar_hide&&(value.settings.master_progress_bar_hide=value.settings.progress_bar_hide)})),$scope.featuredCampaignFinished=!0;var headers=success.headers();$scope.totalEntriesFeatured=headers["x-pager-total-entries"],$scope.loadingFeatured=!1,setTimeout((function(){$("html, body").animate({scrollTop:$("#featureDiscovered").offset().top+$("#featureDiscovered").outerHeight(!0)-$(window).height()},1500)}),1e3)}))},$scope.loadMoreRecentCampaigns=function(){$scope.loadingActive=!0,$scope.entriesPerType+=12,$scope.recent_campaigns_filters.page_entries=$scope.entriesPerType,RestFullResponse.all("campaign").getList($scope.recent_campaigns_filters).then((function(success){$scope.recentcampaigns=success.data,$scope.recentcampaigns=proccessVideoLinks($scope.recentcampaigns),angular.forEach($scope.recentcampaigns,(function(value,index){null!=value.cities&&checkNative(value.cities[0]),void 0!==$scope.public_settings.site_campaign_exclude_shipping_cost&&$scope.public_settings.site_campaign_exclude_shipping_cost&&(value.funded_amount=value.funded_amount-value.total_shipping_cost),CampaignSettingsService.processSettings(value.settings),value.settings=CampaignSettingsService.getSettings(),$scope.progressHide=$scope.public_settings.site_campaign_progress_bar_hide,value.settings.master_progress_bar_hide=!1,$scope.progressHide?value.settings.master_progress_bar_hide=!0:value.settings.master_progress_bar_hide=!1,void 0!==value.settings.progress_bar_hide&&(value.settings.master_progress_bar_hide=value.settings.progress_bar_hide)}));var headers=success.headers();$scope.totalEntriesRecent=headers["x-pager-total-entries"],$scope.loadingActive=!1,setTimeout((function(){$("html, body").animate({scrollTop:$("#recentDiscovered").offset().top+$("#recentDiscovered").outerHeight(!0)-$(window).height()},1500)}),1e3)}))},$scope.getTime=function(campaign){$scope.timeStatusObj=TimeStatusService.getTimeStatus(campaign),campaign.timeStatNum=$scope.timeStatusObj.timeStatusNumber,campaign.timeStatText=$scope.timeStatusObj.timeStatusText},$scope.getTimeZoneAbbr=function(campaign){"f"==campaign.campaign_started&&(campaign.timezoneText=moment().tz(campaign.timezone).zoneAbbr())},$scope.setVideoHeight=function(){var screenWidth=$(window).width(),screenHeight=$("#topbanner-main iframe, #topbanner-main video").height();screenWidth<=1024?$("#topbanner-main #video-wrapper").css("height","auto"):1440>=screenWidth?$("#topbanner-main #video-wrapper").css("height",screenHeight):screenWidth>1440&&$("#topbanner-main #video-wrapper").css("height","800px")},$(window).resize((function(){$scope.setVideoHeight()})),$timeout((function(){$scope.campaign_status_corner_closed=$rootScope.checkTranslation("index_closed","index_status_corner_closed")}),1e3)}]),app.controller("mastheadCtrl",["$scope","Restangular","$timeout","PortalSettingsService","$rootScope",function($scope,Restangular,$timeout,PortalSettingsService,$rootScope){PortalSettingsService.getSettingsObj().then((function(success){var url=success.public_setting.site_theme_main_background.path_external;url?($rootScope.ogMeta.image=$scope.server+"/static/images/"+url,$(".masthead").css("background-image","url("+$rootScope.ogMeta.image+")")):($rootScope.ogMeta.image="images/placeholder-images/placeholder_home_bg.png",$(".masthead").css("background-image","url("+$rootScope.ogMeta.image+")"),$(".masthead").css("background-size","cover"),$(".masthead").css("background-repeat","no-repeat"),$(".masthead").css("background-position","center center"))}),(function(failure){$rootScope.ogMeta.image="images/placeholder-images/placeholder_home_bg.png",$(".masthead").css("background-image","url("+$rootScope.ogMeta.image+")"),$(".masthead").css("background-size","cover"),$(".masthead").css("background-repeat","no-repeat"),$(".masthead").css("background-position","center center")}))}]);