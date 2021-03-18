app.controller('OktaRegisterCtrl', function($rootScope, $scope, $rootScope, Restangular, $translate, UserService, $translate, OKTA_CONFIG) {
  $scope.validate = async function (id_token = null) {
    const headers = {"Accept": "application/json", 
      "Content-Type": "application/json", 
    };
    let params = {};
    let endpoint = ""
    console.log({id_token})
    if (id_token === null){
      endpoint = "authenticate/okta"
      const email = $('#okta-signin-username').val();
      const password = $('#okta-signin-password').val();
      params = {email, password}
    }else{
      endpoint = "authenticate/okta/social"
      params = {id_token}
    }
    return Restangular.one(endpoint).customPOST(params, undefined, undefined, headers).then(function (success){
      UserService.setLoggedIn(success);
      console.log({success3: success})
      return { success, authenticated: 1 };
    }).catch((e) => {
      return {e, authenticated: 0};
    });
  }
  $scope.setOktaTokens = function (tokens) {
    $rootScope.okta_tokens = tokens
  }
  $scope.public_settings = function () {
    if ($scope.public_setting === undefined) {
      return undefined;
    }
    return $scope.public_setting.social_login
  }
  $scope.oktaSignIn = function (config) {
    if ($scope._oktaSignIn === undefined){
      $scope._oktaSignIn = new OktaSignIn(config)
    }
    return $scope._oktaSignIn
  }
  $scope.$on('$destroy', function() {
    if ($scope._oktaSignIn !== undefined){
      $scope._oktaSignIn.remove()
    }
  })
  $scope.translate = async (property) => {
    return $translate(property)
  }
  $scope.oktaConfig = OKTA_CONFIG;
});