//wordpress post page controller
app.controller('WPCtrl', function($location, $http, $scope, $routeParams, API_URL, Restangular, $sce, wpService, $timeout, $rootScope) {
  // ($location.absUrl());
  var paras = $location.$$path.split('/');
  $scope.current_url = $location.absUrl();
  $scope.current_url_escaped = escape($location.absUrl());


  // $rootScope.ogMeta.description = "this is blah";

  function updatePost() {
    var req = {
      method: 'GET',
      url: API_URL.wp_api + 'posts/?slug=' + paras[3] + '&_embed',
      headers: {

      },
      transformRequest: function(data, headersGetter) {
        var headers = headersGetter();
        delete headers['X-Auth-Token'];
        return headers;
      },
      withCredentials: false,
    };
    $http(req).success(function(data, status, headers, config) {
      $scope.post = data[0];
      $rootScope.ogMeta.title = $scope.post.title.rendered;
      var metaDescription = $scope.post.content.rendered.substring(0, 300);
      //Remove html tags
      metaDescription = metaDescription.replace(/<\/?[^>]+(>|$)/g, "");
      $rootScope.ogMeta.description = metaDescription + "...";

      $scope.post.title = $sce.trustAsHtml($scope.post.title.rendered);
      $rootScope.page_title = $scope.post.title;

      $scope.post.content = $sce.trustAsHtml($scope.post.content.rendered);
      var tmp = new Date($scope.post.date);
      $scope.post.dateString = tmp.toString();

      if ($scope.post._embedded.author[0].hasOwnProperty('avatar_urls')) {
        var authors = $scope.post._embedded.author[0];
        for (author in authors.avatar_urls) {
          $scope.post.author_avatar = authors.avatar_urls[author];
        }
      } else {
        $scope.post.author_avatar = 'images/placeholder-images/placeholder_profile_photo.png';
      }

    }).error(function(data, status, headers, config) {
      (data);
    });
  }
  updatePost();
  if (wpService.categories && wpService.categories.length) {
    $scope.categories = wpService.categories;
  } else {
    wpService.getCategories(function() {
      $scope.categories = wpService.categories;
    });
  }

  $scope.searchIconClick = function() {
    $location.url('/blog?s=' + $scope.s);
  }
  $scope.searchEnterPress = function(e) {
    if (e.charCode == 13) {
      $scope.searchIconClick();
    }
  }

  // disqus initialization
  Restangular.one('portal/setting/site_disqus_code').customGET().then(
    function(success) {
      var disqus_shortname = success[0].value;
      var disqus_identifier = $routeParams.post_id;
      var disqus_url = $location.absUrl();

      // if embed.js is already inserted. call reset function
      $timeout(function() {
        if (window.DISQUS) {
          $('<div id="disqus_thread"></div>').insertAfter('#insert-disqus');
          DISQUS.reset({
            reload: true,
            config: function() {
              this.page.identifier = disqus_identifier;
              this.page.url = disqus_url;
            }
          });
        } else {
          $('<div id="disqus_thread"></div>').insertAfter('#insert-disqus');
          window.disqus_identifier = disqus_identifier;
          window.disqus_url = disqus_url;
          var dsq = document.createElement('script');
          dsq.type = 'text/javascript';
          dsq.async = true;
          dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
          $('head').append(dsq);
        }
      });
    }
  );
});