app.service("ValidateURLService", function(Restangular, $location, PortalSettingsService, RequestCacheService) {
  this.validate = function() {
    return PortalSettingsService.getSettingsObj().then(
      function(success) {
        // seperate settings into two categories
        var public_settings = {};
        public_settings = success.public_setting;

        //Removes last slash because Wordpress adds one that causes errors
        $current_path = $location.path();
        $current_path = $current_path.replace(/\/$/, "").slice(1);

        if (public_settings.site_case_insensitive_campaign_path) {
          Restangular.one('campaign').customGET(null, {
            use_path_lookup: 1,
            path_lookup_case_insensitive: true,
            path: $current_path
          }).then(function(success) {
            return null;
          }, function(failed) {
            RequestCacheService.getPage().then(function(success) {
              var pages = success;
              for (var i = 0; i < pages.length; i++) {
                var regex = pages[i].path.replace(/\*/g, '[a-z0-9/-]*');
                if ($location.$$path.match('^/' + regex + '$')) {
                  return null;
                }
              }
              var meta = '<meta name="prerender-status-code" content="404" class="jMeta">  \n';
              $("meta[name='fragment']").last().after(meta);
              // $location.path("/404");
            });
          });
        } else {
          Restangular.one('campaign').customGET(null, {
            use_path_lookup: 1,
            path: $current_path
          }).then(function(success) {
            return null;
          }, function(failed) {
            RequestCacheService.getPage().then(function(success) {
              var pages = success;
              for (var i = 0; i < pages.length; i++) {
                if (pages[i].path) {
                  var stripped_path = "/" + $location.$$path.replace(/\/$/, "").slice(1);
                  var regex = pages[i].path.replace(/\*/g, '[a-z0-9/-]*');
                  if (stripped_path.match('^/' + regex + '$')) {
                    return null;
                  }
                }
              }
              var meta = '<meta name="prerender-status-code" content="404" class="jMeta">  \n';
              $("meta[name='fragment']").last().after(meta);
              // $location.path("/404");
            });
          });
        }
      }
    );
  }
});
