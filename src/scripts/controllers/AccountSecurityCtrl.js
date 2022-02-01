app.controller('SecurityTabCtrl', function(ipCookie, $scope, UserService, Restangular, $location, $routeParams, $translate) {
  
  if (!UserService.isLoggedIn()) {
    $location.path('/');
  }

  $scope.tfa = {};
  $scope.formData = {};

  $scope.putTFA = function(callback, failure) {
    Restangular.one('account/setting').customPUT({
      tfa: $scope.tfa
    }).then(function() {
      if (callback) callback();
    }, function() {
      if (failure) failure();
    });
  }

  $scope.fetchTFA = function() {
    Restangular.one('account/setting/tfa').customGET().then(function(success){
      //apply settings
      $scope.tfa = success.value;
      console.log('Fetched TFA = ', $scope.tfa);
    });
  }

  $scope.fetchTFA();

  window.a = $scope;

  $scope.enableTFA = function() {
    $scope.formData.code = "";
    //reset qr img src to avoid confusion
    $scope.tfa = {
      qr_code_url: "/images/Preloader_2_large.gif"
    }
    Restangular.one('account').one('tfa').customGET().then(
      function(success) {
        $scope.tfa = success;
        console.log('Generated TFA = ', $scope.tfa);
        $scope.putTFA();
        $scope.openModal('setup-2fa');
      }
    );
  }

  $scope.disableTFA = function() {
    $scope.tfa.enabled = false;
    $scope.putTFA(function() {
      $scope.tfa.enabled = false;
    },function() {
      $scope.tfa.enabled = true;
    });
  }

  $scope.checkCode = function() {

    var translation = $translate.instant(['tab_security_error_empty_code', 'tab_security_error_invalid_code']);

    Restangular.one('account').one('tfa/verify?code='+$scope.formData.code).customGET().then(
      function(success) {
        console.log(success);

        var rules = [
          {
            type: 'empty',
            prompt: translation.tab_security_error_empty_code
          }
        ]

        if (!success.valid) rules.push({
          type: 'contains[null]',
          prompt: translation.tab_security_error_invalid_code
        })

        $scope.form_validation = {
          code: {
            identifier: 'code',
            rules: rules
          }
        }
    
        $('#code-form').form($scope.form_validation, {
          inline: true,
          keyboardShortcuts: true,
          onSuccess: function () {
            $scope.tfa.enabled = true;
            $scope.openModal('copy-codes');
            $scope.putTFA();
          },
          onFailure: function () {
            rules.pop();
          }
        }).form('validate form');

      }
    )

  }

  //disable enter on submit for the invis form
  $('#code-form').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) { 
      e.preventDefault();
      return false;
    }
  });

  $scope.showMessage = function(text) {
    var msg = {
      header: text
    };

    $scope.$parent.successMessage.push(msg);
  }

});


