app.controller('ResetPasswordCtrl', function($scope, UserService, Restangular, $routeParams, $location, $translatePartialLoader, $translate, $timeout, $rootScope) {

	var token = $routeParams.token;
	$form = {
			'token': token,
		}
		//(token);
	$scope.success = false;
	$scope.formData = {};
	var msg;
	Restangular.one('authenticate').one('forgot').get($form).then(
		function(success) {
			$scope.success = true;
		},
		function(failure) {
			msg = {
				'header': 'reset_password_valid_expired_error'
			}
			$rootScope.floatingMessage = msg;
			$scope.hideFloatingMessage();
		}
	);
	$scope.$emit("loading_finished");
	$scope.validatePassword = function() {
		var translation = $translate.instant(['reset_password_new_password_empty_prompt', 'reset_password_new_password_length_prompt', 'reset_password_confirm_new_password_empty_prompt', 'reset_password_confirm_new_password_match_prompt']);
		$('.password-content.form').form({
			new_password: {
				identifier: 'new_password',
				rules: [{
					type: 'empty',
					prompt: translation.reset_password_new_password_empty_prompt
				}, {
					type: 'length[6]',
					prompt: translation.reset_password_new_password_length_prompt
				}]
			},
			confirm_new_password: {
				identifier: 'confirm_new_password',
				rules: [{
					type: 'empty',
					prompt: translation.reset_password_confirm_new_password_empty_prompt
				}, {
					type: 'match[new_password]',
					prompt: translation.reset_password_confirm_new_password_match_prompt
				}]
			}
		}, {
			inline: true,
			onSuccess: function() {
				resetPassword();
			}
		});
	}

	function resetPassword() {
		// $('.password-content.form').form({
		// 	new_password: {
		// 		identifier: 'new_password',
		// 		rules: [{
		// 			type: 'empty',
		// 			prompt: 'Please enter new password'
		// 		}, {
		// 			type: 'length[6]',
		// 			prompt: 'Your password must be at least 6 characters'
		// 		}]
		// 	},
		// 	confirm_new_password: {
		// 		identifier: 'confirm_new_password',
		// 		rules: [{
		// 			type: 'empty',
		// 			prompt: 'Please enter new password'
		// 		}, {
		// 			type: 'match[new_password]',
		// 			prompt: 'Your password does not match'
		// 		}]
		// 	}
		// }, {
		// 	inline: true
		// });
		$form['password'] = $scope.formData.new_password;
		$form['password_confirm'] = $scope.formData.confirm_password;
		Restangular.one('authenticate').one('forgot').one('confirm').customPOST($form).then(
			function(success) {
				var seconds = 3;
				//Restangular.one('register/confirm').customPOST($form.token);
				//($form.token);
				msg = {
					'header': 'Your password has been reset successfully, will direct to login page automatically.',
				}
				$rootScope.floatingMessage = msg;
				$scope.hideFloatingMessage();

				$timeout(function() {
					$location.path('/login');
				}, 3000);
			},
			function(failure) {
				msg = {
					'header': failure.data.message,
				}
				$rootScope.floatingMessage = msg;
				$scope.hideFloatingMessage();
			}
		);
	};

	//resetPassword();

	$scope.closeSuccessMessage = function() {
		$scope.successMessage = [];
	};

});
