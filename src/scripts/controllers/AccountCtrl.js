app.controller('AccountTabCtrl', function(ipCookie, $scope, UserService, Restangular, $location, $routeParams, $translate) {
  if (!UserService.isLoggedIn()) {
    $location.path('/');
  }

  $scope.formData = {};
  $scope.formData.email = UserService.email;
  window.a = $scope;

  $scope.errorShown = false;

  $scope.closeErrorMessage = function() {
    $scope.errorShown = false;
  }



  //validate email address
  function isValidEmailAddress(emailAddress) {
    var temp = emailAddress.match(/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/);
    if (temp) {
      return true;
    }
    return false;
  };

  $scope.sentChangeEmail = function() {
    Restangular.one('account').one('email').customPOST().then(
      function(success) {
        var msg = {
          header: "Verify email sent"
        };

        $scope.$parent.successMessage.push(msg);
      }
    );
  }

  $scope.deleteAccount = function() {
    var userid = UserService.id;

    $('.delete-user-modal').modal({
      onApprove: function(){deleteUserByID(userid); setLoggedOut();}
    }).modal('show');

  }

  $scope.exportCSV = getCSV;
  
  function getCSV() {
    $scope.allUsersCSV = [];
    var userData;
    var userid = UserService.id;
    return Restangular.one('portal/person/?filters={"person_id":"' + userid + '"}').customGET().then(function(response){
      response = response[0];
      userData = [{
        'person_type_id': response.person_type_id,
        'person_status_id': response.person_status_id,
        'first_name': response.first_name,
        'last_name': response.last_name,
        'person_id': response.id,
        'email': response.email,
        'created': (response.created).slice(0, 10)
      }];
      createUserCSV(userData, $scope.allUsersCSV);
      return $scope.allUsersCSV;
    })
  }

    // Create user csv based on the given user data and it will output the csv based on userDataCSV parameter
  function createUserCSV(userData, userDataCSV) {
    // to add data for csv
    var value = $translate.instant(['tab_user_admin', 'tab_user_registered', 'tab_user_pending', 'tab_user_approved', 'tab_user_disabled', 'tab_user_name', 'tab_user_email', 'tab_user_usertype', 'tab_user_created', 'tab_user_status', 'tab_user_iD']);
    $scope.regis = value.tab_user_registered;
    $scope.admin = value.tab_user_admin;
    $scope.userpend = value.tab_user_pending;
    $scope.userapprv = value.tab_user_approved;
    $scope.userdis = value.tab_user_disabled;
    $scope.uid = value.tab_user_iD;
    $scope.uname = value.tab_user_name;
    $scope.uemail = value.tab_user_email;
    $scope.utype = value.tab_user_usertype;
    $scope.ucreated = value.tab_user_created;
    $scope.ustatus = value.tab_user_status;
    $scope.csvheader = {
      'id': $scope.uid,
      'name': $scope.uname,
      'email': $scope.uemail,
      'type': $scope.utype,
      'created': $scope.ucreated,
      'Status': $scope.ustatus
    };
    userDataCSV.push($scope.csvheader);
    angular.forEach(userData, function(value) {
      var data1 = {};
      if (value.person_type_id == 1) {
        $scope.usertype = $scope.admin;
      } else {
        $scope.usertype = $scope.regis;
      }
      switch (value.person_status_id) {
        case 1:
          $scope.userstatus = $scope.userpend;
          break;
        case 2:
          $scope.userstatus = $scope.userapprv;
          break;
        case 3:
          $scope.userstatus = $scope.userdis;
          break;
      }

      $scope.fullname = value.first_name + " " + value.last_name;
      data1 = {
        'id': value.person_id,
        'name': $scope.fullname,
        'email': value.email,
        'type': $scope.usertype,
        'created': (value.created).slice(0, 10),
        'Status': $scope.userstatus
      }
      userDataCSV.push(data1);
    });
  }

  function deleteUserByID(id) {
    return Restangular.one('portal/person', id).customDELETE().then(function() {
      return true;
    });
  }

  function setLoggedOut() {
    // Log out no matter what the server response is
    if (ipCookie('current.user') && ipCookie('current.user').auth_token) {
      ipCookie.remove('current.user', { path: '/' });
      Restangular.one('logout').customPOST().then(
        function(success) {
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
    }

  }

});


