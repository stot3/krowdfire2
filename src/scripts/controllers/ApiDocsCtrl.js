app.controller('ApiDocsCtrl', ['$scope', '$interval', '$timeout', '$http', 'APILocale', 'API_URL', 'UserService', 'Restangular', 'Geolocator', '$upload', '$location', '$anchorScroll', '$routeParams', 'anchorSmoothScroll',
  function($scope, $interval, $timeout, $http, APILocale, API_URL, User, Restangular, Geolocator, $upload, $location, $anchorScroll, $routeParams, anchorSmoothScroll) {

    //Semantic UI
    $('.ui.accordion')
      .accordion({
        exclusive: false,
      });
    //initialize tabs
    $('.ui.menu.menu-tabs .item').tab({
      context: $('.api-doc-info'),
    });

    $scope.API_URL = API_URL;

    window.a = $location;
    var tar = $location.$$url.split('#')[1];
    if (tar) {
      anchorSmoothScroll.scrollTo(tar);
    }

    $scope.showRequest = function($event) {
      $target = $($event.currentTarget);
      $children = $target.parents('.lv1').find('.lv2');
      $children.slideToggle();
      $target.toggleClass('open');
      if ($target.hasClass('open')) {
        $target.html('Hide Parameters');
      } else {
        $target.html('Show Parameters');
      }
    }

    var lookup_table = {};
    $http.get('/docs/lookup_table.json').then(function(data) {
      $scope.lookup_table = data.data;
    });
    $scope.$emit("loading_finished");
    $scope.showLookupTable = function($event) {
      $target = $($event.currentTarget);
      $scope.param_name = $target.text();
      if ($scope.lookup_table[$scope.param_name] != null) {
        $scope.param_detail = $scope.lookup_table[$scope.param_name];
        $('#lookup-table').modal('show');
      }
    }

    $scope.jumpTo = function($event) {
      $target = $($event.currentTarget);
      $ref = $($target.attr('ref'));
      $('.segment.selected').removeClass('selected');
      $ref.addClass('selected');
      $ref.toggle();

      console.debug($ref);
      $('html, body').scrollTop($ref.css('top'));
    }
    var setTabActive = function(id) {
      var target = $('#' + id).closest('.menu-tabs').find('.item');
      target.each(function() {
        $(this).removeClass('active');
      });
      $('#' + id).addClass('active');
      target = $('.lv1.tab[data-tab="' + id + '"]').closest('.api-doc-info').find('div.lv1');
      target.each(function() {
        $(this).removeClass('active');
      });
      $('.lv1.tab[data-tab="' + id + '"]').addClass('active');
    }

    $scope.nameClick = function($event) {
      $event.preventDefault();
      var target = $($event.currentTarget);
      $('.inner-item.lv1').each(function() {
        $(this).removeClass('active');
      })
      target.closest('.inner-item.lv1').addClass('active');
      var item = target.closest('.lv1');
      var id = item.find('.ui.selection .menu .item.active').attr('ref');
      if (!id) {
        id = item.find('.method-button').attr('ref');
      }
      $location.hash(id);
      $('.lv1').each(function() {
      });
      anchorSmoothScroll.scrollTo(id);
      setTabActive(id);
    }

    $scope.gotoElement = function($event) {
      $event.preventDefault();
      var target = $($event.currentTarget);
      $('.inner-item.lv1').each(function() {
        $(this).removeClass('active');
      })
      target.closest('.inner-item.lv1').addClass('active');
      var id = target.attr('ref');

      $location.hash(id);
      $('.lv1').each(function() {
      });
      anchorSmoothScroll.scrollTo(id);
      setTabActive(id);
    }

    $scope.showShare = function(e) {
      var proto = API_URL.url.split('/')[0];
      var tmp = $(e.target).closest('.button-segment').find('.share-url');
      tmp.toggle();
      var id = tmp.closest('.lv1').attr('data-tab');
      tmp.find('input').val(proto + "//" + $location.$$host + $location.$$path + '#' + id);
    }
  }
]);

app.filter('titleFilter', function() {
  return function($title) {
    $delim = "::";
    $filtered = $title.substring($title.lastIndexOf($delim) + $delim.length);
    return $filtered;
  };
});

app.filter('exampleLinkFilter', function() {
  return function($title) {
    $delim = "::";

    $filtered = $title.split($delim);

    return $filtered[2].toLowerCase() + "/" + $filtered[3].toLowerCase();
  };
});

app.controller('ApiCtrl', function($location, $scope, $http, $timeout, API_URL, apiDocs, anchorSmoothScroll) {
  // show ui side bar
  $('#api-menu').sidebar({
    dimPage: false,
    closable: false,
  }).sidebar('show');

  // regex to check '/'
  $scope.regex = new RegExp('\/', 'g');
  $scope.API_URL = API_URL;

  // restructure
  var api = apiDocs.data;
  $scope.api = {};
  var i, length = api.length;
  for (i = 0; i < length; i++) {
    $scope.api[api[i].package] = {};
    for (var j = 0; j < api[i].segments.length; j++) {
      if (!$scope.api[api[i].package][api[i].segments[j].name]) {
        $scope.api[api[i].package][api[i].segments[j].name] = {};
      }
      $scope.api[api[i].package][api[i].segments[j].name][api[i].segments[j].method] = api[i].segments[j];
    }
  }

  //initialize tabs
  $timeout(function() {
    $('.tabular.menu .item').tab();
  });
});
