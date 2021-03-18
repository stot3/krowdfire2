app.service('UserService', function($location, $http, $browser, APIRegister, ipCookie, Restangular, $timeout, redirectService, $translate) {
  var User = {
    email: '',
    first_name: '',
    last_name: '',
    auth_token: ''
  }

  User.updateUserData = function(data) {
    if (!data) return false;
    copyObjectProperties(data, User);
    ipCookie('current.user', User, { expires: 1440, expirationUnit: 'minutes', path: '/' }); // Update the cookie data or new User data will be overwritten
  }

  function copyObjectProperties(srcObj, destObj) {
    for (var key in srcObj) {
      destObj[key] = srcObj[key];
    }
  }

  User.isLoggedIn = function() {
    if (!ipCookie('current.user')) {
      return false; // Returning the cookie will cause infinite $digest cycles. Return false if loggedin cookie is gone
    } else {
      copyObjectProperties(ipCookie('current.user'), User); // If the user refreshes the browser, objects in memory are gone. Retrieve data.
    }
    return User.auth_token; // If the cookie exists, make sure the auth token exists too
  }

  User.setLoggedIn = function(data, redirect) {
    if(data.attributes) {
      delete data.attributes;
    }
    if (!redirect) {
      redirect = false;
    }
    // set data variable to data retrieved from end point or broswer cookie
    data = data || ipCookie('current.user');
    if (!data) return false;
    copyObjectProperties(data, User);
    ipCookie('current.user', data, { expires: 1440, expirationUnit: 'minutes', path: '/' }); // Server currently sets token expiry to 4 hours, prompt re-log before that

    var url = redirectService.getUrl();
    if (redirect == false) {
      if (url && url != '/login' && url.split("/")[1] != 'register' && url.split('/')[1] != 'authenticate') {
        $location.path(url);
      } else {
        $location.path('/');
      }
    }
    return true;
  }

  User.setLoggedOut = function(okta_settings = null) {
    // Log out no matter what the server response is
    if (ipCookie('current.user') && ipCookie('current.user').auth_token) {
      ipCookie.remove('current.user', { path: '/' });
      Restangular.one('logout').customPOST().then(
        function(success) {
          User.email = '';
          User.first_name = '';
          User.last_name = '';
          User.auth_token = '';
          $location.path('/login');
        },
        function(failure) {
          //(failure);
        });
      // 	ipCookie.remove('current.user', {path: '/'});
      // 	$timeout(function(){
      // 		$location.path('/')
      // 	},1000);
      // }, function(failure){
      // 	('logout failure');
      // 	ipCookie.remove('current.user', {path: '/'});
      // }, function(always){
      // 	ipCookie.remove('current.user', {path: '/'});
      // }
      // );
    } else // cookie not found
    {
      // clear User
      User.email = '';
      User.first_name = '';
      User.last_name = '';
      User.auth_token = '';
    }

  }
  return User;
});