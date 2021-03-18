app.controller('StripeConnectCtrl', function($location, $scope, StripeService){
  if ($location.search()["error"] == "access_denied") {
    $location.url(atob($location.search()["state"]));
  }
  else {
    StripeService.connect().then(function(success) {
      // check if the email is already connected
      StripeService.getAccount().then(function(accounts){
        angular.forEach(accounts, function(account){
          // if other entrys have the same email
          if(account.id != success.id && (account.access_token == success.access_token || account.publishable_key == success.publishable_key))
          {
            StripeService.removeStripeConnect(success);
            return;
          }
        });
        // redirect
        if($location.search()['state'])
        {
          var redirect = $location.search()['state'];
          var decode = atob(redirect);
        //	(decode);
          $location.url(decode);
        }
      });
      $scope.$emit("loading_finished");

    }, function(failed){
      //('failed');
      // redirect
      if($location.search()['state'])
      {
        var redirect = $location.search()['state'];
        var decode = atob(redirect);
      //	(decode);
        $location.url(decode);
      }
      $scope.$emit("loading_finished");
    });
  }
});