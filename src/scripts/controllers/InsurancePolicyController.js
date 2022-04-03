app.controller('InsurancePolicyController', function($location, $scope, UserService, $routeParams){
    if (!UserService.isLoggedIn()) {
        $location.path('login');
    }
    UserService.getProfile().then(
        function(data){
            const paid = data.data.info.paid
            if(paid != true){
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
    $scope.saveCampaignSuccess = function(){
        return UserService.getProfile().then(
            () => {
                UserService.saveCampaignSuccess()
                .then( 
                    () => { 
                        $location.path('campaign-manager')
                    }
                )
                .catch(
                    err => {
                        console.error(err)
                    }
                )
            }
        ) 
        .catch(
            err => {
                console.error(err)
            }
        ) 

        
    }
})