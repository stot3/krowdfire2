app.service('UserService', function($location, $http, $browser, APIRegister, ipCookie, Restangular, $timeout, redirectService, $translate) {
  var User = {
    email: '',
    first_name: '',
    last_name: '',
    auth_token: '',
    subscribed: false,
    uid: ''
  }

  User.updateUserData = function(data) {
    if (!data) return false;
    copyObjectProperties(data, User);
    ipCookie('current.user', User, { expires: 1440, expirationUnit: 'minutes', path: '/' }); // Update the cookie data or new User data will be overwritten
  }

 User.getPaidStatus = function(email){
    return $http.post('https://us-central1-sistrunk-software.cloudfunctions.net/getProfile', {email: email}, {headers: {"Content-Type": "application/json"}})
    .catch(
        function(err){ 
            console.error(err)
        }
    )
}
User.setInvitationInformation = function(email, campaign_id, campaign_name, inviterUid){
  return $http.post('https://us-central1-sistrunk-software.cloudfunctions.net/saveInvitation', {email: email, campaign_id: campaign_id, campaign_name: campaign_name, inviterUid: inviterUid}, {headers: {"Content-Type": "application/json"}})
  .catch(
    function(err){ 
        console.error(err)
    }
  )
}
User.getPaidGuard = function(){
  return $http.post('https://us-central1-sistrunk-software.cloudfunctions.net/getProfile', {email: User.email}, {headers: {"Content-Type": "application/json"}})
    .then(
      function(hasPaid){ 
        if(hasPaid.data.info.paid === true){
          return true
        }
        else{
          return false
        }
      }
    )
    .catch(
        function(err){ 
            console.error(err)
        }
    )
}
  User.setPaidStatus= function(email, inviterUid, campaignId){
    return $http.post('https://us-central1-sistrunk-software.cloudfunctions.net/userPaid', {email: email, inviterUid: inviterUid, campaign_id: campaignId}, {headers: {"Content-Type": "application/json"}}).catch(
        function(err){ 
            console.error(err)
        }
    )
}

User.getMatchingCampaign = function(campaign_name, campaign_id){
  return $http.post('https://us-central1-sistrunk-software.cloudfunctions.net/getProfile', {email: User.email}, {headers: {"Content-Type": "application/json"}})
    .then(
      function(hasPaid){ 
        if(hasPaid.data.info.inviterInformation.campaign_name == campaign_name && hasPaid.data.info.inviterInformation.campaign_id == campaign_id){
          return true
        }
        else{
          return false
        }
      }
    )
    .catch(
        function(err){ 
            return err
        }
    )
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
        return User.getPaidStatus(data.email).then(
          function(status){
            const paid = status.data.info.paid
            if(paid === true)
            {
              $location.path("/start");
              return true
            }
            else if(paid === undefined){
              $location.path("/");
              return true
            }
            else{
              const campaign_id = status.data.info.inviterInformation.campaign_id;
              const campaign_name = status.data.info.inviterInformation.campaign_name;
              $location.url(`/campaign/${campaign_id}/${campaign_name}`);
              return true
            }
          }
        ).catch( 
          function(err){
            console.error(err)
            $location.path('/login')
            return err
          }
        )
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
  User.showInvitationModal = function(){
    const payModal = $('#payModal.ui.modal').modal({
      closeable: true,
      allowMultiple:false,
      blurring: true,
      detachable:false,
      dimmerSettings:{
        closeable:true
      }
    }).modal('show'); 
  }
  User.hideInvitationModal = function(){
    return $('#payModal.ui.modal').modal('hide')
  }
  User.getProfile = function(){
    return $http.post("https://us-central1-sistrunk-software.cloudfunctions.net/getProfile", {email: User.email})
    .then( (profile) => {
      User.uid = profile.data.info.id
      return profile
    })
  }
  User.updateInvitees = function(emails, uid){
    return $http.post("https://us-central1-sistrunk-software.cloudfunctions.net/removeInvitation", {emails: emails, uid: User.uid})
  }
  User.saveCampaignSuccess = function(){
    return $http.post("https://us-central1-sistrunk-software.cloudfunctions.net/setSuccessCampaign", {uid: User.uid})
  }
  return User;
})
;