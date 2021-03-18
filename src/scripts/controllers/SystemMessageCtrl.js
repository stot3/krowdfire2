app.controller('SystemMessageCtrl', function($scope){
	// get system message when bad server response. 
	SystemMessageService.getSystemMessage().then(function(success){
		angular.forEach(success, function(value){
			if(value.setting_type_id == 3)
			{
				$scope.systemMessage = value.value;
			}
		});
		
	});

	$scope.errorResponse = SystemMessageService.errorResponse;
});