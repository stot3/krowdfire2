app.service('DisqusShortnameService', function(Restangular) {
  this.getDisqusShortname = function() {
    return Restangular.one('portal/setting/site_disqus_code').customGET();
  }

  this.setDisqusShortname = function(shortname) {
    var data = {
      site_disqus_code: shortname,
    };
    return Restangular.one('portal/setting/public').customPUT(data);
  }

  return this;
});

//service for saving site logo url
app.service('SiteLogoService', function() {
  var logoUrl;
  var mainBackground;
  var exploreBackground;
  var favIcon;
  var loadIcon;
  this.getLogoUrl = function() {
    return logoUrl;
  }
  this.setLogoUrl = function(val) {
    logoUrl = val;
  }
  this.getMainBackground = function() {
    return mainBackground;
  }
  this.setMainBackground = function(val) {
    mainBackground = val;
  }
  this.getExploreBackground = function() {
    return exploreBackground;
  }
  this.setExploreBackground = function(val) {
    exploreBackground = val;
  }
  this.setFavIcon = function(val) {
    favIcon = val;
  }
  this.getFavIcon = function() {
    return favIcon;
  }
  this.setLoadIcon = function(val) {
    loadIcon = val;
  }
  this.getLoadIcon = function() {
    return loadIcon;
  }
});

app.service('Geolocator', function($q, $http, API_URL, Restangular, LANG) {
  var storedData = null;
  this.searchCities = function(term, native_lookup) {
    var localeReq = Restangular.one('locale/city', term).customGET();
    if (native_lookup) {
      localeReq = Restangular.one('locale/city').customGET(term, {
        "native_lookup": native_lookup
      });
    }
    return localeReq.then(function(success) {
      storedData = success.plain();
      angular.forEach(storedData, function(value, key) {
        // Format: City name, Subcountry Country
        if (native_lookup) {
          var name = "";
          if (value.city_native_name != null) {
            name += value.city_native_name;
          } else {
            name += value.city;
          }
          if (value.subcountry_native_name != null) {
            name += ", " + value.subcountry_native_name;
          } else {
            name += ", " + value.subcountry;
          }
          if (value.country_native_name != null) {
            name += " " + value.country_native_name;
          } else {
            name += " " + value.country;
          }
          value.name = name;
        }
      });
      return storedData;
    });
  }

  this.searchCitiesBySubcountry = function(term, subcountry_id, native_lookup) {
    var localeReq;
    if (!native_lookup) {
      localeReq = Restangular.one("locale/city").customGET(term, {
        subcountry_id: subcountry_id
      });
    } else {
      localeReq = Restangular.one("locale/city").customGET(term, {
        subcountry_id: subcountry_id,
        native_lookup: native_lookup
      });
    }
    return localeReq.then(function(success) {
      storedData = success.plain();
      return storedData;
    });
  }

  this.getCountries = function() {
    return Restangular.one("locale/country").customGET().then(function(success) {
      var countryData = success.plain();
      return countryData;
    });
  }

  this.getSubcountriesByCountry = function(countryID) {
    return Restangular.one("locale/subcountry", countryID).get().then(function(success) {
      return success.plain();
    });
  }

  this.lookupCityID = function(data) { // Look up corresponding cityID for last (cached) search, and match it based on the full name
    var city_id;
    angular.forEach(storedData, function(obj) {
      if (data === obj.name) {
        city_id = obj.city_id; // Found, exit loop and return value
        return false;
      }
    });
    return city_id;
  }

  this.lookupCountryID = function(data) {
    var country_id;
    angular.forEach(storedData, function(obj) {

      if (data === obj.name) {
        country_id = obj.country_id; // return country id if names match
        return false; // break out after match
      }
    });
    return country_id;
  }
});

app.service('RequestCacheService', function($cacheFactory, Restangular) {
  var requests = {};
  var cache = $cacheFactory('cached_pages');

  // cache pages GET request
  requests.getPage = function() {
    var request = Restangular.one('portal/page').customGET();
    cache.put('portal_page_promise', request);
    return request;
  }

  // cache categories GET request
  requests.getCategory = function() {
    var data = cache.get('portal_category_promise');
    if (!data) {
      var request = Restangular.one('portal/category').customGET();
      cache.put('portal_category_promise', request);
      return request;
    } else {
      return data;
    }
  }

  return requests;
});