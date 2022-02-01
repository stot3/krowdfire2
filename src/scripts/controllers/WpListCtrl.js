//wordpress list controller
app.controller('wpListCtrl', function($http, $scope, API_URL, $timeout, $location, $sce, wpService, BLOG_SETTINGS) {
  $scope.posts = [];
  $scope.categories = [];
  $scope.category_filter = [];
  $scope.category_name = '';
  $scope.tag_filter = [];
  $scope.current_page = 1;
  $scope.totalPage = 1;
  $scope.posts_per_page = BLOG_SETTINGS.posts_per_page;


  $scope.updatePostList = function() {
    if ($scope.category_filter && $scope.category_filter.length) {
      $scope.category_filter = [$scope.category_filter[0].id];
    }
    wpService.getPosts($scope.category_filter, function() {
      $scope.posts = wpService.posts;
      $scope.totalPage = wpService.totalPage;
    }, $scope.tag_filter, $scope.posts_per_page, $scope.current_page, $scope.s);
  }
  var para = $location.search();
  if (para.category) {
    $scope.category_filter.push(para.category);
  }
  if (para.tag) {
    $scope.tag_filter.push(para.tag);
  }
  if (para.s) {
    $scope.s = para.s;
  }
  $scope.list_limit = $scope.posts_per_page;
  wpService.getPosts($scope.category_filter, function() {
    $scope.posts = wpService.posts;
  }, $scope.tag_filter, $scope.list_limit, 1, $scope.s);

  if (wpService.categories && wpService.categories.length) {
    $scope.categories = wpService.categories;
    $scope.totalPage = wpService.totalPage;

    angular.forEach($scope.categories, function(v) {
      if (para.category && para.category == v.id) {
        $scope.category_filter = [{ id: v.id, name: v.name }];
        $scope.category_name = v.name;
      }
    });

  } else {
    wpService.getCategories(function() {
      $scope.categories = wpService.categories;
      $scope.totalPage = wpService.totalPage;

      angular.forEach($scope.categories, function(v) {
        if (para.category && para.category == v.id) {
          $scope.category_filter = [{ id: v.id, name: v.name }];
          $scope.category_name = v.name;
        }
      });
    });
  }

  function updateParameter() {
    var obj = {};
    if ($scope.category_filter.length) {
      obj = {
        category: $scope.category_filter[0].id,
      }
    }
    if ($scope.tag_filter.length) {
      obj.tag = $scope.tag_filter;
    }
    if ($scope.s && $scope.s.length) {
      obj.s = $scope.s;
    }
    $location.search(obj);
  }
  $scope.updateCategory = function(category) {
    $scope.category_filter = [];
    if (category) {
      $scope.category_filter.push({ id: category.id, name: category.name });
      updateParameter();
      $scope.updatePostList();
    } else {
      $scope.category_filter = [];
      var para = $location.search();
      delete para.category;
      $location.search(para);
      $scope.updatePostList();
    }
  }
  $scope.updateTags = function(tag) {
    $scope.tag_filter = [];
    if (tag) {
      $scope.tag_filter.push(tag.slug);
      updateParameter();
      $scope.updatePostList();
    } else {
      $scope.updatePostList();
    }
  }
  $scope.updateSearchTerm = function() {
    if ($scope.s.length) {
      updateParameter();
      $scope.updatePostList();
    } else {
      $scope.updatePostList();
    }
  }
  $scope.searchEnterPress = function(e) {
    if (e.charCode == 13) {
      $scope.updateSearchTerm();
    }
  }
});