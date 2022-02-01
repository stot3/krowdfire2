app.controller('NavSearchCtrl', function($scope, $location) {

  /*
  ## search campaign for top nav bar ##
  */
  $scope.search = function() {
    if ($scope.searchingCampaign) {
      if ($location.path() === '/explore') {
        $location.search('description', $scope.searchingCampaign);
      } else {
        $location.path('/explore').search('').search('description', $scope.searchingCampaign);
        if ($location.hash()) {
          $location.hash('');
        }
      }
    }
    if (!$scope.searchingCampaign) {
      $location.search('description', null);
    }
  }
  $scope.navSearchCampaign = function() {
    if ($scope.searchingCampaign) {
      $location.path('/explore').search('').search('description', $scope.searchingCampaign);
    } else {
      $location.search('');
    }
  }

});