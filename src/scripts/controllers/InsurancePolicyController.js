app.controller('InsurancePolicyController', function($location, $scope, UserService, $routeParams){
    if (!UserService.isLoggedIn()) {
        $location.path('login');
    }
    UserService.getPaidGuard().then(
        function(data){
            if(data != true){
                $location.path('login');
            }
        }
    )
    .catch(
        function(err){
            console.error(err)
            $location.path('login');
        }
    )
    $scope.campaign_id = $routeParams.eid
 
    $scope.goToCampaignStart = function(){
        $location.url('/start')
    };
})