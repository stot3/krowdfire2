(function() {
  var ERROR_CODE = 'You are using old version of the widget code, please make sure to get the latest version from your campaign page. Alternatively you can manually rename any references to "atlas-widget" or "reach-widget" to "sedra-widget" instead in your widget code. Thank you.';

  if (!document.querySelector("sedra-widget")) {
    var oldWidget = document.querySelector("reach-widget") ? document.querySelector("reach-widget") : document.querySelector("atlas-widget");
    var errorDom = document.createElement("h3");
    errorDom.innerText = ERROR_CODE;
    oldWidget.appendChild(errorDom);
    console.error(ERROR_CODE);
    return;
  }

  var thrinaciaHostUrl = "";

  getWidgetHost();

  var jqueryurl = thrinaciaHostUrl + "widget/production/jquery.min.js",
    es6shimjs = thrinaciaHostUrl + "widget/production/es6-shim.min.js",
    reflectjs = thrinaciaHostUrl + "widget/production/Reflect.js",
    widgetUrl = thrinaciaHostUrl + "widget/production/sedra.js",
    widgetcss = thrinaciaHostUrl + "widget/production/sedra.css",
    semanticjs = thrinaciaHostUrl + "widget/production/semantic.min.js",
    loadercss = thrinaciaHostUrl + "widget/production/loader.css",
    oktacss = "https://global.oktacdn.com/okta-signin-widget/5.3.3/css/okta-sign-in.min.css";

  setLoaderDom();

  function setLoaderDom() {
    var loaderLink = document.createElement("link");
    loaderLink.rel = "stylesheet";
    loaderLink.href = loadercss;
    loaderLink.className = "sedraloadercss";
    document.querySelector("head").appendChild(loaderLink);
    var widgetLoaderDom = document.createElement("div");
    widgetLoaderDom.className = "sedra-widget-loader";
    document.querySelector("sedra-widget").appendChild(widgetLoaderDom);
  }

  function getWidgetHost() {
    var appLocalUrl = "";
    var getWidgetMatch = /widget\/production\/getwidget.js/;
    var getWidgetMatch2 = /widget.js/;
    var scriptTags = document.getElementsByTagName("script");
    for (var i = 0; i < scriptTags.length; i++) {
      if (getWidgetMatch.test(scriptTags[i].src) || getWidgetMatch2.test(scriptTags[i].src)) {
        if (scriptTags[i].src.indexOf("widget/production/getwidget.js") > -1) {
          thrinaciaHostUrl = scriptTags[i].src.substr(0, scriptTags[i].src.indexOf("widget/production/getwidget.js"));
        } else {
          thrinaciaHostUrl = scriptTags[i].src.substr(0, scriptTags[i].src.indexOf("widget.js"));
        }
        appLocalUrl = thrinaciaHostUrl + "app_local.js";
        break;
      }
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", appLocalUrl);
    xhr.withCredentials = false;
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 400) {
          getUrlFromString(xhr.responseText);
          initWidget();
        } else {
          console.log("app_local.js is not defined");
          initWidget();
        }
      }
    };
    xhr.send();
  };

  function getUrlFromString(successString) {
    //Get api url
    var apiUrlStart = successString.indexOf("app.constant('API_URL',");
    var apiUrlLocEnd = successString.indexOf("loc");
    var tempString = successString.substr(apiUrlStart, apiUrlLocEnd - apiUrlStart);
    var httpsStart = tempString.indexOf("http");
    var urlEnd = tempString.indexOf(",", httpsStart);
    if (httpsStart != -1 && urlEnd != -1) {
      window.widgetHost = tempString.substr(httpsStart, urlEnd - httpsStart - 1);
    }

    //Get site url 
    var sedraUrlStart = successString.indexOf("app.constant('SEDRA',");
    if (sedraUrlStart != -1) {
      var sedraUrlLocEnd = successString.lastIndexOf("loc");
      var sedratempString = successString.substr(sedraUrlStart, sedraUrlLocEnd - sedraUrlStart);
      var sedraHttpsStart = sedratempString.indexOf("http");
      var sedraUrlEnd = sedratempString.indexOf(",", sedraHttpsStart);
      if (sedraHttpsStart != -1 && sedraUrlEnd != -1) {
        window.widgetUrl = sedratempString.substr(sedraHttpsStart, sedraUrlEnd - sedraHttpsStart - 1);
      }
    }

    //Grab Default lang
    var defaultLangIndex = successString.indexOf("DEFAULT_LANG");
    var lang = {};
    if (defaultLangIndex != -1) {
      var defaultLangSubString = successString.substr(defaultLangIndex + 13, successString.length - defaultLangIndex);
      if (defaultLangSubString.indexOf('\"') < 5 && defaultLangSubString.indexOf('\"') != -1) {
        var defaultLang = defaultLangSubString.substr(defaultLangSubString.indexOf('\"') + 1, 2);
      } else {
        var defaultLang = defaultLangSubString.substr(defaultLangSubString.indexOf('\'') + 1, 2);
      }
      lang.defaultLang = defaultLang;
    }
    //Grab Preferred lang
    var preferredLangIndex = successString.indexOf("PREFERRED_LANG");
    if (preferredLangIndex != -1) {
      var preferredLangSubString = successString.substr(preferredLangIndex + 15, successString.length - preferredLangIndex);
      if (preferredLangSubString.indexOf('\"') < 5 && preferredLangSubString.indexOf('\"') != -1) {
        var preferredLang = preferredLangSubString.substr(preferredLangSubString.indexOf('\"') + 1, 2);
      } else {
        var preferredLang = preferredLangSubString.substr(preferredLangSubString.indexOf('\'') + 1, 2);
      }
      lang.preferredLang = preferredLang;
    }
    window.DefaultPreferredLang = lang;
    window.sucessString = successString;

    // Okta settings
    if (window.OktaConfig === undefined){
      let oktaSettingsStart = successString.indexOf("app.constant('OKTA_CONFIG', ");
      if (oktaSettingsStart != -1) {
        let oktaSettingsEnd = successString.indexOf("});", oktaSettingsStart);
        const oktaSettingsStartJson = successString.indexOf("{", oktaSettingsStart)
        let oktaSettingsJsonStr = successString.substr(oktaSettingsStartJson, oktaSettingsEnd).replace(");", "")
        window.OktaConfig = JSON.parse(oktaSettingsJsonStr)
      }
    }
  }

  function initWidget() {
    var sedrajsScripts = document.querySelectorAll("script.sedra-js");
    if (!sedrajsScripts.length) {
      loadangular();
      loadStripe();
      loadOkta();
    }
  }

  function load() {
    if (!window.jQuery && !window.$) {
      loadjquery();
    } else {
      loadDep();
    }
  }

  function loadjquery() {
    loadScript("sedra-jquery", jqueryurl, loadDep);
  }

  function loadangular() {
    loadScript("sedra-es6shim", es6shimjs, null);
    loadScript("sedra-reflect", reflectjs, load);
  }

  function loadWidget() {
    loadScript("sedra-widget", widgetUrl, null);
  }

  function loadStripe() {
    loadScript(null, "https://js.stripe.com/v3/", null);
  }

  function loadOkta() {
    loadScript(null, "https://global.oktacdn.com/okta-signin-widget/5.3.3/js/okta-sign-in.min.js", null);
  }

  function loadScript(tagId, url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.className = "sedra-js";
    script.id = tagId;

    if (script.readyState) {
      script.onreadystatechange = function() {
        if (script.readyState == "loaded" ||
          script.readyState == "complete") {
          script.onreadystatechange = null;
          if (callback !== null) {
            callback();
          }
        }
      };
    } else {
      script.onload = function() {
        if (callback !== null) {
          callback();
        }
      };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  function loadDep() {
    var sedracssSelector = document.querySelector("link.sedracss");
    if (!sedracssSelector) {
      var sedracssLink = document.createElement("link");
      sedracssLink.rel = "stylesheet";
      sedracssLink.href = widgetcss;
      sedracssLink.className = "sedracss";
      document.querySelector("head").appendChild(sedracssLink);
    }
    
    var oktacssSelector = document.querySelector("link.oktacss");
    if (!oktacssSelector) {
      var oktacssLink = document.createElement("link");
      oktacssLink.rel = "stylesheet";
      oktacssLink.href = oktacss;
      oktacssLink.className = "oktacss";
      document.querySelector("head").appendChild(oktacssLink);
    }

    var isSemanticExist = false;
    var $script = jQuery("script");
    $script.each(function(index) {
      var attr = jQuery(this).attr("src");
      if (attr && attr.indexOf("semantic") != -1) {
        isSemanticExist = true;
        return false;
      }
    });

    if (!isSemanticExist) {
      jQuery.getScript(semanticjs)
        .success(function(data) {
          loadWidget();
        });
    } else {
      loadWidget();
    }
  }
})();