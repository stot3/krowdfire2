app.controller('UserManagementCtrl', function($scope, Restangular, $timeout, RequestCacheService) {
	updateCampaignListing();
	updateUserListign();
	$scope.sortOrFilters = '';
	$scope.persons = "";
	$scope.personFilters = {
		"sort": "person_id",
		"filters": {
			"person_type": "1"
		}
	}
	$scope.formData = {};
	$scope.person = {};
	  $scope.locale_c_TITLE = locale_CAMPAIGN_TITLE;
	  $scope.locale_cs_TITLE = locale_CAMPAIGNS_TITLE;
	// updateUserListign($scope.personFilters);
	window.a = $scope;

	RequestCacheService.getCategory().then(function(success) {
		$scope.categories = success;
		// $scope.categories.forEach(function(category) {
		// 	$scope.categoryFilters[category.category_id] = false;
		// });
	});

	$scope.addCategory = function(category) {
		(category);
	}


	function updateCampaignListing(sortOrFilters) {
		Restangular.all('campaign').getList(sortOrFilters).then(function(success) {
			('Data in!');
			$scope.campaigns = success;
		});
	}

	function updateUserListign(personFilters) {
		Restangular.one('portal').all('person').getList(personFilters).then(function(success) {
			('Person list');
			$scope.persons = success;
		});
	}

	$scope.editPerson = function($event, person) {
		$target = $($event.currentTarget);
		// (fname);
		$scope.person = person;
		$('.user-modal').modal('show');
	}

	$scope.addPerson = function($event) {
		$target = $($event.currentTarget);
		$('.add-user-modal').modal('setting', {
			closable: false,

		}).modal('show');
	}

	$scope.deletePerson = function($event) {
		$target = $($event.currentTarget);
		$('.delete-user-modal').modal('show');
	}

	$scope.user_edit_submit = function() {
		// debugger;
		// Restangular.one('account').all('profile').customPUT($scope.formData).then(
		// 	function(success){
		// 		$scope.formData.errors = {};
		// 	},function(failure){
		// 		$scope.formData.errors = failure.data.errors;
		// 	}
		// );
	}

	$scope.add_person_submit = function($event) {
			($scope.formData);
		}
		// ($('.ui.checkbox').attr('class'));

});