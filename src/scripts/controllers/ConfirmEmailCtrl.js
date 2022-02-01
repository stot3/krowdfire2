app.controller('confirmEmailCtrl', function($scope, $rootScope, UserService, Restangular, $routeParams, $location, $timeout, $translatePartialLoader, $translate) {
    var token = $routeParams.token;
    $form = {
        'token': token,
    }
    $scope.success = false;
    $scope.formData = {};
    $scope.valueCheck = true;
    var $msg;
    $scope.$emit("loading_finished");
    function validateEmail(){
      var translation = $translate.instant(["confirm_email_new_email_message", "confirm_email_new_email_error"]);
      $("form[name='email_form']").form({
        new_email: {
          identifier: 'new_email',
          rules: [{
            type: "empty",
            prompt: translation.confirm_email_new_email_message
          }, {
            type: "email",
            prompt: translation.confirm_email_new_email_message
          }]
        },
        confirm_email: {
          identifier: 'confirm_email',
          rules: [{
            type: "empty",
            prompt: translation.confirm_email_new_email_error
          }, {
            type: 'match[new_email]',
            prompt: translation.confirm_email_new_email_error
          }]
        }
      }, {
        inline: true,
        on: 'blur',
        onSuccess: function() {
          $scope.valueCheck = true;
        },
        onFailure: function() {
          $scope.valueCheck = false;
        }
      }).form("validate form");
    }

    Restangular.one('account/email/confirm', token).get().then(
        function(success) {
            $scope.success = true;
        },
        function(failure) {
            $msg = {
                'header': 'confirm_email_email_invalid_expired_error'
            }
            $rootScope.floatingMessage = $msg;
            $scope.hideFloatingMessage();
        }
    );
    //Reset email
    $scope.confirmResetEmail = function() {
      validateEmail();
      if ($scope.valueCheck) {
        if (UserService.isLoggedIn()) {
            if ($scope.formData.new_email == $scope.formData.confirm_email) {
                $form = {
                    'token': token,
                    'email': $scope.formData.new_email,
                }
                Restangular.one('account/email/confirm').customPOST($form).then(
                    function(success) {
                        $msg = {
                            'header': "confirm_email_email_sent"
                        }
                        $rootScope.floatingMessage = $msg;
                        $scope.hideFloatingMessage();
                    },
                    function(failure) {
                        $msg = {
                            'header': failure.data.message,
                        }
                        $rootScope.floatingMessage = $msg;
                        $scope.hideFloatingMessage();
                    }
                );
            }
        } else { //user not logged in
            $msg = {
                'header': "confirm_email_email_please_login",
            }
            $rootScope.floatingMessage = $msg;
            $scope.hideFloatingMessage();
        }
      }
    }

});
