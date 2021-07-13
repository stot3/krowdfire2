var app=angular.module("Atlas",["ngRoute","ngResource","ipCookie","ui.router","ngSanitize","ui.select","ui.select2","ui.sortable","ngCsv","restangular","ngQuickDate","flow","angularFileUpload","angularMoment","angles","videosharing-embed","angulartics","angulartics.piwik","angulartics.google.analytics","pascalprecht.translate","froala"]);function checkWordpressException(response){return"wp_service"==response.config.functionLocation}app.constant("OKTA_CONFIG",{}),app.constant("BLOG_SETTINGS",{posts_per_page:"5"}),app.run(["$sce","$http","$window","$rootScope","$route","$location","$templateCache","$timeout","Restangular","API_URL","RequestCacheService","PortalSettingsService","$translate","$translatePartialLoader","$q",function($sce,$http,$window,$rootScope,$route,$location,$templateCache,$timeout,Restangular,API_URL,RequestCacheService,PortalSettingsService,$translate,$translatePartialLoader,$q){$rootScope.partsDone=!1,$translatePartialLoader.addPart("global"),$translatePartialLoader.addPart("navbar"),$translatePartialLoader.addPart("footer"),$translatePartialLoader.addPart("profile-setting"),$translatePartialLoader.addPart("campaign-review"),$translatePartialLoader.addPart("confirm-email"),$translatePartialLoader.addPart("transaction-management"),$translatePartialLoader.addPart("forgot-pasword"),$translatePartialLoader.addPart("retry-card"),$translatePartialLoader.addPart("error"),$translatePartialLoader.addPart("calendar"),$translatePartialLoader.addPart("response-message"),$translatePartialLoader.addPart("home-page"),$translatePartialLoader.addPart("login"),$translatePartialLoader.addPart("explore"),$translatePartialLoader.addPart("campaign-page"),$translatePartialLoader.addPart("custom-comment"),$translatePartialLoader.addPart("startCampaign"),$translatePartialLoader.addPart("getStarted"),$translatePartialLoader.addPart("campaignStep"),$translatePartialLoader.addPart("user-profile"),$translatePartialLoader.addPart("complete-funding"),$translatePartialLoader.addPart("campaign-preview"),$translatePartialLoader.addPart("campaign-review"),$translatePartialLoader.addPart("campaign-page"),$translatePartialLoader.addPart("guest-contribution"),$translatePartialLoader.addPart("pledge-campaign"),$translatePartialLoader.addPart("pledge-history"),$translatePartialLoader.addPart("profile-setting"),$translatePartialLoader.addPart("campaign-management"),$translatePartialLoader.addPart("payment-setting"),$translatePartialLoader.addPart("stream-management"),$translatePartialLoader.addPart("transaction-management"),$translatePartialLoader.addPart("message-center"),$translatePartialLoader.addPart("portal-setting"),$translatePartialLoader.addPart("subscription-settings"),$translatePartialLoader.addPart("tab-report"),$translatePartialLoader.addPart("tab-user"),$translatePartialLoader.addPart("tab-coupon"),$translatePartialLoader.addPart("tab-category"),$translatePartialLoader.addPart("tab-campaign"),$translatePartialLoader.addPart("tab-page"),$translatePartialLoader.addPart("tab-portalSetting"),$translatePartialLoader.addPart("tab-site-menu"),$translatePartialLoader.addPart("tab-api"),$translatePartialLoader.addPart("tab-email"),$translatePartialLoader.addPart("profile"),$translatePartialLoader.addPart("reset-password"),$translatePartialLoader.addPart("campaign-widget"),$translatePartialLoader.addPart("charity-helper"),$translatePartialLoader.addPart("trulioo-verification"),$translate.refresh().then((function(success){$rootScope.partsDone=!0,$translate(["moment_time_future","moment_time_past","moment_time_s","moment_time_m","moment_time_mm","moment_time_h","moment_time_hh","moment_time_d","moment_time_dd","moment_time_M","moment_time_MM","moment_time_y","moment_time_yy"]).then((function(translation){moment.locale("en",{relativeTime:{future:"%s "+translation.moment_time_future,past:"%s "+translation.moment_time_past,s:"%d "+translation.moment_time_s,m:"a "+translation.moment_time_m,mm:"%d "+translation.moment_time_mm,h:"an "+translation.moment_time_h,hh:"%d "+translation.moment_time_hh,d:"a "+translation.moment_time_d,dd:"%d "+translation.moment_time_dd,M:"a "+translation.moment_time_M,MM:"%d "+translation.moment_time_MM,y:"a "+translation.moment_time_y,yy:"%d "+translation.moment_time_yy}})}))}));function checkOGTags(ogTag){var localOgTag={};for(var prop in ogTag)localOgTag[prop]=ogTag[prop];$rootScope.ogMeta[localOgTag.name.substr(3)]=localOgTag.content}$rootScope.$on("$routeChangeStart",(function(event,next,current){$rootScope.ogMeta={url:"",title:"",description:"",site_name:"",image:""},void 0!==current&&$templateCache.remove(current.templateUrl),$(".ui.sidebar").sidebar("hide"),$(".collapsible-settings.dropdown").dropdown("hide")})),$rootScope.$on("$routeChangeSuccess",(function(ev,data){$("#twitter-wjs").remove(),$timeout((function(){var d,s,id,js,fjs;d=document,s="script",id="twitter-wjs",fjs=d.getElementsByTagName(s)[0],/^http:/.test(d.location),d.getElementById(id)||((js=d.createElement(s)).id=id,js.src="https://platform.twitter.com/widgets.js",fjs.parentNode.insertBefore(js,fjs))}),200),$("body >.modals").remove(),$rootScope.currentURL=$location.absUrl(),$rootScope.ogMeta.url=$rootScope.currentURL,RequestCacheService.getPage().then((function(success){$("meta.jMeta").each((function(){$(this).remove()}));var current_route=$location.path().slice(1)?$location.path().slice(1):$location.path();current_route="!1"==current_route?"/":current_route;var pages={},pagesTitle={};if(angular.forEach(success,(function(value){1==value.id&&(value.path="/"),pages[value.path]=value.meta,pagesTitle[value.path]=value.title})),$rootScope.page_route=$route.current.originalPath?$route.current.originalPath.slice(1):null,$rootScope.page_route){var temp=$rootScope.page_route.split("/");if(temp.length>=2&&-1===temp[1].indexOf(":")){var new_temp=[temp[0],temp[1]];$rootScope.page_route=new_temp.join("-")}}else $rootScope.page_route="/"==current_route?"home-page":"custom-page";if(pagesTitle[current_route]?($rootScope.meta=pages[current_route],$rootScope.page_title=pagesTitle[current_route],$rootScope.ogMeta.title=$rootScope.page_title):$translate($route.current.title).then((function(translation){$rootScope.page_title=null!=translation?translation:$rootScope.page_title,$rootScope.ogMeta.title=$rootScope.page_title})),pages[current_route]||"explore"==current_route||current_route.includes("explore/category")){if("explore"==current_route&&$location.search().category||current_route.includes("explore/category")){if(current_route.includes("explore/category"))var category_url="category?path="+current_route.split("/")[2]+"&use_path_lookup=1";else category_url=$location.search().category.constructor==Array?"category/"+$location.search().category[0]:"category/"+$location.search().category;Restangular.one("portal").customGET(category_url).then((function(categories){var category_metatags=[];$.each(categories.attributes,(function(index,value){category_metatags.push({name:index.replace("og","og:"),type:"property",content:value}),category_metatags.push({name:index.replace("og","twitter:"),type:"property",content:value})}));for(var metaTags=category_metatags,i=0;i<metaTags.length;i++){var metaName=metaTags[i].name.substr(3);if(0==metaTags[i].name.indexOf("og:")&&$rootScope.ogMeta.hasOwnProperty(metaName))checkOGTags(metaTags[i]);else{var meta="<meta ";if(meta+=metaTags[i].type,meta+=" = '",meta+=metaTags[i].name,meta+="' content = '",meta+=metaTags[i].content,meta+="' class='jMeta'> \n","description"!=metaTags[i].name||$rootScope.ogMeta.description||($rootScope.ogMeta.description=metaTags[i].content),0!=metaTags[i].name.indexOf("og:"))$("meta[property]").last().after(meta);else if(metaTags[i].name.split(":").length>2){var metaSplit=metaTags[i].name.split(":");metaName=metaSplit[0]+":"+metaSplit[1],$("meta[property='"+metaName+"']").last().after(meta)}}}}))}else{var metaTags=pages[current_route];if(metaTags)for(var i=0;i<metaTags.length;i++){var metaName=metaTags[i].name.substr(3);if(0==metaTags[i].name.indexOf("og:")&&$rootScope.ogMeta.hasOwnProperty(metaName))checkOGTags(metaTags[i]);else{var meta="<meta ";if(meta+=metaTags[i].type,meta+=" = '",meta+=metaTags[i].name,meta+="' content = '",meta+=metaTags[i].content,meta+="' class='jMeta'> \n","description"!=metaTags[i].name||$rootScope.ogMeta.description||($rootScope.ogMeta.description=metaTags[i].content),0!=metaTags[i].name.indexOf("og:"))$("meta[property]").last().after(meta);else if(metaTags[i].name.split(":").length>2){var metaSplit=metaTags[i].name.split(":");metaName=metaSplit[0]+":"+metaSplit[1],$("meta[property='"+metaName+"']").last().after(meta)}}}}$("meta[name='description']").length||(meta="<meta name='description' content='"+$rootScope.page_title+"' class='jMeta'> \n",$("meta[property]").first().before(meta))}}))})),PortalSettingsService.getSettingsObj().then((function(success){success.public_setting.site_widget_wp_api&&(API_URL.wp_api=success.public_setting.site_widget_wp_api.url),$rootScope.site_company=success.public_setting.site_company,$rootScope.ogMeta.site_name=$rootScope.site_company,success.public_setting.hasOwnProperty("site_facebook_app_id")&&($rootScope.facebook_app_id=success.public_setting.site_facebook_app_id),$translate("site_name_meta").then((function(translation){"site_name_meta"!=translation&&""!=translation&&($rootScope.site_company=translation,$rootScope.ogMeta.site_name=$rootScope.site_company)}))})),window.prerenderReady=!1,$timeout((function(){window.prerender=!0}),2e3),$rootScope.formatFundingGoal=function(goal){return goal.replace(/[\,\s]/g,"")}}]),app.constant("USER_ROLES",{all:"*",admin:"1",user:"2",campaign:"3",page:"4"}),app.constant("RESOURCE_REGIONS",{campaign:{header:1,body:2,thumbnail:3,top_header:5,thumbnail_video:6}}),app.constant("FONT_FAMILY",{Georgia:"Georgia, serif",Times:'"Times New Roman", Times, serif',Comic:'"Comic Sans MS", cursive, sans-serif'}),app.constant("PHONE_TYPE",[{name:"Landline",id:"1"},{name:"Mobile",id:"2"},{name:"Fax",id:"3"}]),app.constant("AUTH_SCHEME",[{id:1,name:"Crypt Blowfish 8",translation:"tab_portalsetting_site_auth_scheme_blowfish_default"},{id:2,name:"SHA1 Digest",translation:"tab_portalsetting_site_auth_scheme_sha1"}]),app.constant("ANONYMOUS_COMMENT",{anonymous_disabled:"disabled",anonymous_backers:"backers",anonymous_users:"users"}),app.constant("SOCIAL_SHARING_OPTIONS",{sharing_users:"users",sharing_backers:"creator",sharing_disabled:"disabled"}),app.factory("authHttpInterceptor",["$q","$location","$injector","ipCookie","$rootScope",function($q,$location,$injector,ipCookie,$rootScope){return{request:function(config){var User=$injector.get("UserService");return"login"!==$location.path().split("/")[1]&&User.auth_token&&(config.headers["X-Auth-Token"]=User.auth_token),config},responseError:function(response){var lst=response.config.url.split("/"),User=$injector.get("UserService");return checkWordpressException(response)?($rootScope.wp_error=!0,$q.reject(response)):(0==response.status&&"/server-error"!=window.location.pathname&&(window.location.href="/server-error"),response.status>=500&&(message.errorResponse=response),401===response.status&&"auth_token_not_valid"===response.data.code&&"logout"!=lst[lst.length-1]&&User.setLoggedOut(),$q.reject(response))}}}]),app.filter("unique",(function(){return function(collection,keyname){var output=[],keys=[];return angular.forEach(collection,(function(item){var key=item[keyname];-1===keys.indexOf(key)&&(keys.push(key),output.push(item))})),output}})),app.controller("MainCtrl",["$scope","$location","UserService","Restangular","API_URL","USER_ROLES","$timeout","ThemeService","redirectService","$translatePartialLoader","$translate","RequestCacheService","LANG","$rootScope","$window","$q","PortalSettingsService","SiteLogoService",function($scope,$location,User,Restangular,API,roles,$timeout,ThemeService,redirectService,$translatePartialLoader,$translate,RequestCacheService,LANG,$rootScope,$window,$q,PortalSettingsService,SiteLogoService){$scope.location=window.location.href,$scope.User=User,$scope.server=API.url,$scope.server_loc=API.loc,$scope.successMessage=[],$scope.errorMessage=[],$scope.translateCompleted=!1,$rootScope.inHTMLMode=0;$scope.showLinkCopied=!1,$scope.loader_enabled=!1,void 0!==API.loader_enabled&&($scope.loader_enabled=API.loader_enabled),$scope.setLoggedOut=function(){PortalSettingsService.getSettingsObj().then((function(success){void 0!==success.public_setting.social_login&&success.public_setting.social_login.toggle,User.setLoggedOut()})),console.log($rootScope.okta_tokens)},$rootScope.removeFloatingMessage=function(){$rootScope.floatingMessage={}},$rootScope.hideFloatingMessage=function(){$timeout((function(){$rootScope.removeFloatingMessage()}),3e4)},$rootScope.scrollToError=function(){$timeout((function(){$(".field").hasClass("error")&&$("html, body").animate({scrollTop:$(".field.error").offset().top-15},500)}))},$rootScope.checkTranslation=function(base_translation,new_translation){var value=$translate.instant([base_translation,new_translation]);return""===value[new_translation]||value[new_translation]===new_translation?value[base_translation]:value[new_translation]};$scope.$on("$routeChangeSuccess",(function(ev,next,current){var exclude_loader_on=["views/templates/campaign.e44b9120.html","views/templates/explore.e44b9120.html","views/templates/index.e44b9120.html","views/templates/getstarted.e44b9120.html","views/templates/profile-setup.e44b9120.html","views/templates/campaign-preview.e44b9120.html","views/templates/custom-page.e44b9120.html"]+[],path_tokens=$location.url().split("/");"campaign"!=path_tokens[1]||isNaN(path_tokens[2]),path_tokens[1],exclude_loader_on.indexOf(next.loadedTemplateUrl),$rootScope.isConnectWithStripe=!1,null!=current&&/templates\/stripe-connect/.test(current.loadedTemplateUrl)&&null!=next&&(/templates\/portal-setting/.test(next.loadedTemplateUrl)||/templates\/complete-funding/.test(next.loadedTemplateUrl))&&($rootScope.isConnectWithStripe=!0)})),$scope.$on("loading_finished",(function(){$("body.container #loader.dimmer").dimmer("hide")})),PortalSettingsService.getSettingsObj(!0).then((function(success){$scope.public_setting=success.public_setting,void 0!==$scope.public_setting.site_disable_unsupported_browsers&&0!=$scope.public_setting.site_disable_unsupported_browsers&&($scope.isFacebookApp=function(){var ua=navigator.userAgent||navigator.vendor||window.opera;return ua.indexOf("FBAN")>-1||ua.indexOf("FBAV")>-1||ua.indexOf("Instagram")>-1}),$scope.site_load_icon={},void 0!==$scope.public_setting.site_load_icon&&($scope.site_load_icon=$scope.public_setting.site_load_icon,SiteLogoService.setLoadIcon($scope.site_load_icon.value)),$scope.site_load_class={},$scope.site_load_class=$scope.public_setting.site_load_class,void 0===$scope.site_load_class&&($scope.site_load_class="circle notched"),$scope.stickyMenu=$scope.public_setting.site_theme_sticky_menu,$scope.public_setting.site_admin_campaign_management_only&&$scope.$watch((function(){return $location.path()}),(function(newValue,oldValue){var url=newValue.split("/")[1];User.portal_admin==roles.admin||"start"!=url&&"getstarted"!=url&&"campaign-setup"!=url&&"rewards"!=url&&"profile-setup"!=url&&"complete-funding"!=url&&"campaign-preview"!=url&&"campaign-review"!=url||$location.path("/")})),$scope.public_setting.site_campaign_contributions||$scope.$watch((function(){return $location.path()}),(function(newValue,oldValue){var url=newValue.split("/")[1];"pledge-campaign"!=url&&"inline-contribution"!=url||$location.path("/explore")})),void 0===$scope.public_setting.site_enable_cookie_consent||null==$scope.public_setting.site_enable_cookie_consent?$scope.enableCookieConsent=!1:$scope.enableCookieConsent=$scope.public_setting.site_enable_cookie_consent,$scope.enableCookieConsent&&$translate.refresh().then((function(){var cookieConsentTranslation=$translate.instant(["cookie_consent_message_text","cookie_consent_dismiss_text","cookie_consent_link_text","cookie_consent_link"]);$scope.$on("loading_finished",(function(){0==$("[aria-label='cookieconsent']").length&&window.cookieconsent.initialise({palette:{popup:{background:"#efefef",text:"#404040"},button:{background:"#8ec760",text:"#ffffff"}},theme:"classic",position:"bottom-left",content:{message:cookieConsentTranslation.cookie_consent_message_text,dismiss:cookieConsentTranslation.cookie_consent_dismiss_text,link:cookieConsentTranslation.cookie_consent_link_text,href:cookieConsentTranslation.cookie_consent_link}})}))}))})),$scope.$on("$routeChangeStart",(function(event,current,previous){"",$("body").removeClass("mobile-sidebar-no-scroll"),$("#mobile-sidebar").sidebar("hide");var exclude_on_url=!1;"admin"==$location.url().split("/")[1]&&(exclude_on_url=!0);(["views/templates/login-register.e44b9120.html","views/templates/404.e44b9120.html","views/templates/start.e44b9120.html","views/templates/getstarted.e44b9120.html","views/templates/campaign-setup.e44b9120.html","views/templates/rewards.e44b9120.html","views/templates/profile-setup.e44b9120.html","views/templates/complete-funding.e44b9120.html","views/templates/campaign-preview.e44b9120.html"].indexOf(current.templateUrl)<=-1&&!exclude_on_url&&$scope.loader_enabled||["views/templates/api-docs.html"].indexOf(current.templateUrl)>=0)&&$("body.container #loader.dimmer").dimmer({opacity:1,closable:!1,duration:{show:0,hide:1e3}}).dimmer("show")})),RequestCacheService.getPage().then((function(success){$scope.portal_page=success})),$scope.$watch((function(){return $location.path()}),(function(newValue,oldValue){var url=newValue.split("/")[1];if(User.isLoggedIn()){document.body.classList.add("is-logged-in"),"admin"==url&&User.person_type_id==roles.user?$location.path("/"):"inline-contribution"==url?$location.path("/explore"):"login"!=url&&"register"!=newValue.split("/")[1]||$location.path("/");var url_secondary=$location.url().split("/");switch(url_secondary=url_secondary[2]){case null:break;case"dashboard#campaigns":"1"!=User.person_type_id&&"3"!=User.person_type_id&&$location.path("/");break;case"dashboard#pages":"1"!=User.person_type_id&&"4"!=User.person_type_id&&$location.path("/");break;case"dashboard#users":case"dashboard#categories":case"dashboard#menus":case"dashboard#coupons":case"dashboard#portal-settings":case"dashboard#web-settings":case"dashboard#subscription-settings":"1"!=User.person_type_id&&$location.path("/")}}else redirectService.setUrl(oldValue),"start"!=url&&"pledge-campaign"!=url&&"message-center"!=url&&"profile-setting"!=url&&"payment-setting"!=url&&"admin"!=url&&"campaign-manager"!=url&&"pledge-history"!=url&&"getstarted"!=url&&"campaign-setup"!=url&&"rewards"!=url&&"profile-setup"!=url&&"complete-funding"!=url&&"campaign-preview"!=url&&"account"!=url||$location.path("/login");$scope.theme_classes=ThemeService.themeColor(),$scope.top_nav_theme=ThemeService.topNav(),ThemeService.init(),$scope.top_nav_style={},$.isArray($scope.theme_classes)||$scope.theme_classes.then((function(){$scope.theme_classes=ThemeService.theme_classes}))})),$(window).scroll((function(){var saveheight=$(document).height();saveheight-=1e3,$(this).scrollTop()>220?$("#back-to-top").fadeIn():$("#back-to-top").fadeOut(),$(this).scrollTop()<saveheight?$("#scroll-to-bottom").fadeIn():$("#scroll-to-bottom").fadeOut()})),$scope.backToTop=function(){return $("html,body").animate({scrollTop:0},800),!1},$scope.scrollToBottom=function(){var saveheight=$(document).height();return saveheight-=900,$("html,body").animate({scrollTop:saveheight},800),!1},$scope.clearMessage=function(){$scope.successMessage=[],$scope.errorMessage=[],$scope.floatingMessage=[]},$scope.closeSuccessMessage=function(){$scope.successMessage=[]},$scope.closeErrorMessage=function(){$scope.errorMessage=[]},$rootScope.froalaOptions={heightMin:300,events:{},language:"custom",toolbarSticky:!0,tabSpaces:2,codeMirrorOptions:{indentWithTabs:!1,lineNumbers:!0,lineWrapping:!0,mode:"htmlmixed",tabMode:"indent",tabSize:2},imageResizeWithPercent:!0,linkAlwaysBlank:!0,htmlAllowedAttrs:["accept","accept-charset","accesskey","action","align","alt","async","autocomplete","autofocus","autoplay","autosave","background","bgcolor","border","charset","cellpadding","cellspacing","checked","cite","class","color","cols","colspan","content","contenteditable","contextmenu","controls","coords","data","data-.*","datetime","default","defer","dir","dirname","disabled","download","draggable","dropzone","enctype","for","form","formaction","headers","height","hidden","high","href","hreflang","http-equiv","icon","id","ismap","itemprop","keytype","kind","label","lang","language","list","loop","low","max","maxlength","media","method","min","multiple","name","novalidate","open","optimum","pattern","ping","placeholder","poster","preload","pubdate","radiogroup","readonly","rel","required","reversed","rows","rowspan","sandbox","scope","scoped","scrolling","seamless","selected","shape","size","sizes","span","src","srcdoc","srclang","srcset","start","step","summary","spellcheck","style","tabindex","target","title","type","translate","usemap","value","valign","width","wrap","webui-pgwslider","options","scroll-to"],htmlAllowedTags:["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","blockquote","br","button","canvas","caption","cite","code","col","colgroup","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hgroup","hr","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","menu","menuitem","meter","nav","noscript","object","ol","optgroup","option","output","p","param","pre","progress","queue","rp","rt","ruby","s","samp","script","style","section","select","small","source","span","strike","strong","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr","wp","wp-post-list","wp-individual-post","tmplvar","treety-widget"],htmlAllowedEmptyTags:["textarea","a","iframe","object","video","style","script","wp","wp-post-list","wp-individual-post","tmplvar","i","treety-widget"],htmlRemoveTags:[],toolbarButtons:["fullscreen","bold","italic","underline","strikeThrough","subscript","superscript","fontFamily","fontSize","|","color","emoticons","inlineStyle","paragraphStyle","|","paragraphFormat","align","formatOL","formatUL","outdent","indent","quote","insertHR","-","insertLink","insertImage","insertVideo","insertFile","insertTable","undo","redo","clearFormatting","selectAll","html"],toolbarButtonsMD:["fullscreen","bold","italic","underline","fontFamily","fontSize","color","paragraphStyle","paragraphFormat","align","formatOL","formatUL","outdent","indent","quote","insertHR","insertLink","insertImage","insertVideo","insertFile","insertTable","undo","redo","clearFormatting","selectAll","html"],entities:"&amp;&lt;&gt;&#34;&#39;&iexcl;&cent;&pound;&curren;&yen;&brvbar;&sect;&uml;&copy;&ordf;&laquo;&not;&shy;&reg;&macr;&deg;&plusmn;&sup2;&sup3;&acute;&micro;&para;&middot;&cedil;&sup1;&ordm;&raquo;&frac14;&frac12;&frac34;&iquest;&Agrave;&Aacute;&Acirc;&Atilde;&Auml;&Aring;&AElig;&Ccedil;&Egrave;&Eacute;&Ecirc;&Euml;&Igrave;&Iacute;&Icirc;&Iuml;&ETH;&Ntilde;&Ograve;&Oacute;&Ocirc;&Otilde;&Ouml;&times;&Oslash;&Ugrave;&Uacute;&Ucirc;&Uuml;&Yacute;&THORN;&szlig;&agrave;&aacute;&acirc;&atilde;&auml;&aring;&aelig;&ccedil;&egrave;&eacute;&ecirc;&euml;&igrave;&iacute;&icirc;&iuml;&eth;&ntilde;&ograve;&oacute;&ocirc;&otilde;&ouml;&divide;&oslash;&ugrave;&uacute;&ucirc;&uuml;&yacute;&thorn;&yuml;&OElig;&oelig;&Scaron;&scaron;&Yuml;&fnof;&circ;&tilde;&Alpha;&Beta;&Gamma;&Delta;&Epsilon;&Zeta;&Eta;&Theta;&Iota;&Kappa;&Lambda;&Mu;&Nu;&Xi;&Omicron;&Pi;&Rho;&Sigma;&Tau;&Upsilon;&Phi;&Chi;&Psi;&Omega;&alpha;&beta;&gamma;&delta;&epsilon;&zeta;&eta;&theta;&iota;&kappa;&lambda;&mu;&nu;&xi;&omicron;&pi;&rho;&sigmaf;&sigma;&tau;&upsilon;&phi;&chi;&psi;&omega;&thetasym;&upsih;&piv;&ensp;&emsp;&thinsp;&zwnj;&zwj;&lrm;&rlm;&ndash;&mdash;&lsquo;&rsquo;&sbquo;&ldquo;&rdquo;&bdquo;&dagger;&Dagger;&bull;&hellip;&permil;&prime;&Prime;&lsaquo;&rsaquo;&oline;&frasl;&euro;&image;&weierp;&real;&trade;&alefsym;&larr;&uarr;&rarr;&darr;&harr;&crarr;&lArr;&uArr;&rArr;&dArr;&hArr;&forall;&part;&exist;&empty;&nabla;&isin;&notin;&ni;&prod;&sum;&minus;&lowast;&radic;&prop;&infin;&ang;&and;&or;&cap;&cup;&int;&there4;&sim;&cong;&asymp;&ne;&equiv;&le;&ge;&sub;&sup;&nsub;&sube;&supe;&oplus;&otimes;&perp;&sdot;&lceil;&rceil;&lfloor;&rfloor;&lang;&rang;&loz;&spades;&clubs;&hearts;&diams;"};var xhr=new XMLHttpRequest,path="views/translation/"+LANG.PREFERRED_LANG+"/froala.json";xhr.open("GET",path),xhr.onreadystatechange=function(){if(4==xhr.readyState&&200==xhr.status)try{var jsondata=JSON.parse(xhr.responseText);$.FroalaEditor.LANGUAGE.custom=jsondata}catch(e){}},xhr.send(),$rootScope.froalaOptions.events["froalaEditor.initialized"]=function(e,editor){editor.helpers.sanitizeURL=function(url){return"link"==url||"link_pledges"==url?"<tmplvar>"+url+"</tmplvar>":url},editor.events.on("keydown",(function(){var range=editor.selection.ranges(0),container=range.startContainer;if(container.nodeType==Node.ELEMENT_NODE&&container.childNodes.length>0&&range.startOffset>0){var node=container.childNodes[range.startOffset-1];"TMPLVAR"===$(node).prop("tagName")&&($(node).after($.FroalaEditor.INVISIBLE_SPACE+$.FroalaEditor.MARKERS),editor.selection.restore())}}))},$timeout((function(){$(window).resize((function(){$(window).width()<=1024?($("#nav-wrapper .top-nav-bar").removeClass("sticky-menu"),$("#main-bg").removeClass("sticky-menu-push")):$scope.stickyMenu&&($("#nav-wrapper .top-nav-bar").addClass("sticky-menu"),$("#main-bg").addClass("sticky-menu-push"))}))}))}]),app.factory("RestFullResponse",["Restangular",function(Restangular){return Restangular.withConfig((function(RestangularConfigurer){RestangularConfigurer.setFullResponse(!0)}))}]),app.filter("formatDate",["$translate",function($translate){return function(input,formatting){if("MMMM YYYY"==formatting){var date_formatted=moment(input).format(formatting);return $translate.instant(date_formatted.split(" ")[0])+" "+date_formatted.split(" ")[1]}return moment(input).format(formatting)}}]),app.filter("noFractionCurrency",["$filter","$locale",function(filter,locale){var currencyFilter=filter("currency"),formats=locale.NUMBER_FORMATS;return function(amount,currencySymbol){var matches=/\(([^)]+)\)/.exec(currencySymbol);if(matches){var iso_currency=matches[1],index=(amount=new Intl.NumberFormat(this,{style:"currency",currency:iso_currency,currencyDisplay:"symbol"}).format(amount).substring(0,sep)).indexOf(formats.DECIMAL_SEP);return-1===index&&(index=amount.length),amount.substring(0,index)}if("()"==currencySymbol){var sep=(value=currencyFilter(amount)).indexOf(formats.DECIMAL_SEP);return value.substring(0,sep)}var value;sep=(value=currencyFilter(amount," ")).indexOf(formats.DECIMAL_SEP);return value.substring(0,sep)}}]),app.filter("stringCurrency",["$filter","$locale",function($filter,$locale){return function(amount,currency_iso){if(currency_iso&&MoneySymbols[currency_iso]){var symbol=MoneySymbols[currency_iso].money_format,matched=/([^{]+)\{{/.exec(symbol);return(symbol=matched?matched[1]:"$")+amount}return" "===currency_iso?amount:"$"+amount}}]),app.directive("format",["$filter",function($filter){return{require:"?ngModel",link:function(scope,elem,attrs,ctrl){ctrl&&(ctrl.$formatters.unshift((function(a){return $filter(attrs.format)(ctrl.$modelValue)})),ctrl.$parsers.unshift((function(viewValue){return elem.priceFormat({prefix:"",centsSeparator:".",thousandsSeparator:","}),elem[0].value})))}}}]),app.filter("formatCurrency",["$filter","$locale",function(filter,locale){var currencyFilter=filter("currency");locale.NUMBER_FORMATS;return function(amount,currency_iso,hide_decimal){var symbol_only=!1;" "===amount&&(symbol_only=!0);var value=currencyFilter(amount,"");if(null!=value){if(currency_iso&&" "!==currency_iso){var symbol=MoneySymbols[currency_iso].money_symbol;if(symbol_only)return symbol;if(MoneySymbols[currency_iso].money_decimal_sep&&(locale.NUMBER_FORMATS.DECIMAL_SEP=MoneySymbols[currency_iso].money_decimal_sep),MoneySymbols[currency_iso].money_group_sep&&(locale.NUMBER_FORMATS.GROUP_SEP=MoneySymbols[currency_iso].money_group_sep),3==hide_decimal){var sep=value.indexOf(locale.NUMBER_FORMATS.DECIMAL_SEP);value=value.substring(0,sep)}var money_format=MoneySymbols[currency_iso].money_format;return money_format?money_format=(money_format=money_format.replace("{{amount}}",value)).replace("{{money_symbol}}",symbol):symbol+value}return" "===currency_iso?value:"$"+value}}}]),app.filter("excludeDupCountry",(function(){return function(allCountries,rewardIndex,countryID,shippingTypeID){if(allCountries){var countries=[];for(var index in allCountries)countries.push(allCountries[index]);for(var index in countries){var country=countries[index];if(country.refid=-1,country.hasOwnProperty("shipping_status"))for(var i in country.shipping_status)country.shipping_status[i].reward_index==rewardIndex&&country.shipping_status[i].shipping_option_type_id==shippingTypeID&&(country.refid=country.id)}return countries.filter(function(countryID){return function(country){return country.refid==countryID||-1==country.refid}}(countryID))}}})),app.filter("monthName",["$translate",function($translate){return function(monthNumber){var value=$translate.instant(["January","February","March","April","May","June","July","August","September","October","November","December"]);return[value.January,value.February,value.March,value.April,value.May,value.June,value.July,value.August,value.September,value.October,value.November,value.December][monthNumber]}}]),app.controller("SiteErrorCtrl",["$scope","Restangular","$location","API_URL",function($scope,Restangular,$location,API_URL){$scope.goBack=function(){window.history.go(-2)},$scope.goToHome=function(){$location.path("/")}}]),app.controller("FavIconCtrl",["$scope","Restangular","API_URL","PortalSettingsService",function($scope,Restangular,API_URL,PortalSettingsService){$scope.server=API_URL.url,PortalSettingsService.getSettingsObj().then((function(success){success.public_setting.site_favicon.path_external?$scope.faviconURL=$scope.server+"/image/site_logo/"+success.public_setting.site_favicon.path_external:$scope.faviconURL="images/placeholder-images/placeholder_favicon.png"}))}]),app.service("redirectService",(function(){var url="";this.getUrl=function(){return url},this.setUrl=function(s){url=s}})),app.directive("scroll",["$window",function($window){return function(scope,element,attrs){angular.element($window).bind("scroll",(function(){var bottom=$(window).scrollTop()+$(window).height(),height1=$(element).offset().top+$(element).outerHeight(),height2=$(element).parent().offset().top+$(element).parent().outerHeight();scope.boolChangeClass=height1>=height2&&bottom-height1>50,scope.$apply()}))}}]),app.service("anchorSmoothScroll",(function(){this.scrollTo=function(eID){var startY=self.pageYOffset?self.pageYOffset:document.documentElement&&document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop?document.body.scrollTop:0,stopY=function(eID){var elm=document.getElementById(eID),y=elm.offsetTop,node=elm;for(;node.offsetParent&&node.offsetParent!=document.body;)node=node.offsetParent,y+=node.offsetTop;return y}(eID),distance=stopY>startY?stopY-startY:startY-stopY;if(distance<100)scrollTo(0,stopY);else{var speed=Math.round(distance/100);speed>=20&&(speed=20);var step=Math.round(distance/25),leapY=stopY>startY?startY+step:startY-step,timer=0;if(stopY>startY)for(var i=startY;i<stopY;i+=step)setTimeout("window.scrollTo(0, "+leapY+")",timer*speed),(leapY+=step)>stopY&&(leapY=stopY),timer++;else for(i=startY;i>stopY;i-=step)setTimeout("window.scrollTo(0, "+leapY+")",timer*speed),(leapY-=step)<stopY&&(leapY=stopY),timer++}}}));