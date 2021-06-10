app.controller('LoginCtrl', function($rootScope, $location, $scope, PortalSettingsService, UserService, Restangular, redirectService, $translate, $translatePartialLoader, AUTH_SCHEME, $timeout) {
  // Login page
  $scope.submit_once = false;
  $scope.formData = {};
  $scope.account = {};

  $scope.translateText = function(text) {
    return $translate.instant(text);
  };
  var auth_scheme = AUTH_SCHEME[0];
  var url = redirectService.getUrl();
  var tmp_lst = url.split('/');
  if (tmp_lst[1] == 'authenticate' && tmp_lst[2] == 'forgot') {
    $rootScope.login_successful = {
      message: "login_new_password",
    };
  }
  $scope.$watch('userEmail', function(v) {
    if ($scope.formData.email) {

    } else {
      $scope.formData.email = v;
    }
  });

  $(".modal").modal({
    allowMultiple: true
  });

  // Check valid login id
  $scope.tos_login = true;
  PortalSettingsService.getSettings(true).then(function(success) {
    $rootScope.loginRedirect = null;
    $scope.val = success;
    angular.forEach($scope.val, function(value) {

      if (value) {
        if (value.name === 'site_tos_login_ui') {
          $scope.tos_login = value.value;
        } else if (value.name === "site_auth_scheme") {
          auth_scheme = value.value;
        } else if (value.name === "site_disable_account_setting") {
          $scope.isAccSetEnabled = !value.value;
        } else if (value.name === "site_login_redirect" && !$rootScope.loginRedirect) {
          $rootScope.loginRedirect = value.value;
          if (typeof $scope.loginRedirect.text !== "undefined" && $scope.loginRedirect.text !== "" && typeof $scope.loginRedirect.link !== "undefined" && $scope.loginRedirect.link !== "") {
            $scope.loginRedirectShow = true;
          } else {
            $scope.loginRedirectShow = false;
          }
        } else if(value.name === 'social_login'){
            $scope.socialLogin = value.value['toggle']
          }
        }
        if(value.name === 'site_payment_gateway'){
          $scope.site_payment_gateway = value.value;
        }

    });

    if ($scope.socialLogin === null || $scope.socialLogin === undefined){
      $scope.socialLogin = false;
    }
    $scope.isAccSetEnabled = $scope.isAccSetEnabled != undefined ? $scope.isAccSetEnabled : true;
    $scope.$emit("loading_finished");
  });

  $scope.cancelSubmit = function() {
    $rootScope.loading = false;
    $rootScope.login_successful = null;
    $scope.closeModal();
  }

  // Check valid login id

  $scope.socialLogin = null;
  $rootScope.checklogin = true;
  $scope.formData = {};

  $scope.submitWithTFA = function() {
    var translation = $translate.instant(['tab_security_error_empty_code', 'tab_security_error_invalid_code']);

    // since this is the second stage in the login process and uses a different controller instance,
    // we need to re-set the the values from the html form
    if ($scope.socialLogin !== true) {
      if (!$scope.formData.email) {
        $scope.formData.email = $('#login input[name="email"]').val();
      }
      if (!$scope.formData.password) {
        $scope.formData.password = $('#login input[name="password"]').val();
      }
    } else {
      if (!$scope.formData.email) {
        $scope.formData.email = $('#okta-signin-username').val();
      }
       if (!$scope.formData.password) {
        $scope.formData.password = $('#okta-signin-password').val();
      }
    }
    
    Restangular.one('authenticate').customPOST($scope.formData).then(
      function(success) {
        console.log(success);

        var rules = [
          {
            type: 'empty',
            prompt: translation.tab_security_error_empty_code
          }
        ]

        if (success.valid_tfa_code_required) rules.push({
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
            $scope.onSubmitSuccess(success);
          },
          onFailure: function () {
            rules.pop();
          }
        }).form('validate form');

      }
    )

  }

  $scope.onSubmitSuccess = function(success) {
    var requires_tfa = success.valid_tfa_code_required;
    if (requires_tfa) { //if the login endpoint demands tfa

      $scope.openModal('enter-2fa');
      $scope.formData.email = $('#login input[name="email"]').val();
      $scope.formData.password = $('#login input[name="password"]').val();
      
      
    } else { //if the login is successful
      // clear messages
      $scope.formData.errors = null;
      // success message
      $rootScope.login_successful = {
        message: "login_login_successful"
      };
      // translate login successful
      $translate(['login_page_login_success']).then(function(value) {
        $scope.login_message = value.login_page_login_success;
      });
      UserService.setLoggedIn(success); // Update loggedin status and user account info
      if (success.person_type_id == 1){
        Restangular.one('account/stripe/application').customGET("", {},
          {
              'X-Auth-Token': success.auth_token
          }
        ).then(function(success) {
          var stripe_setting = success.plain();
          var show_modal = false;

          if (!stripe_setting.publishable_key || stripe_setting.publishable_key == "public_id_dummy") {
              show_modal = true;
          }

          if (!stripe_setting.secret_key || stripe_setting.secret_key == "secret_key_dummy") {
              show_modal = true;
          }

          if($scope.site_payment_gateway && $scope.site_payment_gateway != 1) {
            show_modal = false;
          }

          $rootScope.loading = false;
          $rootScope.login_successful = null;

          if (show_modal){
            $location.path('/admin/dashboard');
            $location.hash('portal-settings');
            $rootScope.showNewPlatformModal = true
          }
        });
      }
      $('.ui.modal').modal('hide');
    }
  }

  $scope.submit = async function() {
    if ($scope.socialLogin !== true) {
      if ($scope.tos_login) {
        $scope.submit_once = true;
        if (!$('#login input[type="checkbox"]').is(':checked')) {
          $scope.login_tos_not_checked = true;
          return;
        } else {
          $scope.login_tos_not_checked = false;
        }
      }

      var not_validated = !$('.ui.login.form').form('validate form');
      if (not_validated) {
        return;
      }
    }
    // clear messages
    $scope.formData.errors = null;
    $rootScope.login_successful = null;
    // set loading true
    $rootScope.loading = true;
    // display message
    $rootScope.login_successful = {
      "message": "login_logging_in"
    };
    $translate(['login_page_login_message']).then(function(value) {
      $scope.login_message = value.login_page_login_message;
    });
    // angularjs model will not autofill. need to do it manually
    if ($scope.socialLogin !== true) {
      if (!$scope.formData.email) {
        $scope.formData.email = $('#login input[name="email"]').val();
      }
      if (!$scope.formData.password) {
        $scope.formData.password = $('#login input[name="password"]').val();
      }
    } else {
      // if (!$scope.formData.email) {
        $scope.formData.email = $('#okta-signin-username').val();
        $scope.formData.password = $('#okta-signin-password').val();
    }
    
    // Check if it's SHA 1, a constant in app.js
    if (auth_scheme.id == 2) {
      $scope.formData.password_scheme = "sha1";
    }
    
    const result = Restangular.all('authenticate').post($scope.formData).then(
      function(success) {
        $scope.onSubmitSuccess(success);
        // return {success: 1}
      },
      function(failure) { // If the login request fails, set the errors returned from the server
        // clear messages
        $scope.formData.errors = null;
        $rootScope.login_successful = null;
        $scope.formData.errors = failure.data.errors;
        $scope.formData.error_message = failure.data.message;
        $scope.str = $scope.formData.errors.credential_verification[0].code;
        if ($scope.str === "authenticate_invalid_authenticate_credentials") {
          $translate('login_page_invalid_credentials').then(function(value) {
            $scope.invalid_cred = value;
          });
        }
        $rootScope.loading = false;
        return {success: 0, errors: $scope.formData.errors, message: $scope.formData.error_message}
      });
      return await result


  };
  // Details empty will prompt error message
  $scope.serrormessgae = "";
  $timeout(function() {
    $translate(['login_page_invalid_email', 'login_page_empty_email', 'login_page_password_empty', 'login_page_password_length']).then(function(value) {

      $scope.email_empty_invalid = value.login_page_invalid_email;
      $scope.email_empty = value.login_page_empty_email;
      $scope.password_empty = value.login_page_password_empty;
      $scope.password_length = value.login_page_password_length;
      // semantic form validation
      $('.ui.login.form').form({
        email: {
          identifier: 'email',
          rules: [{
            type: 'empty',
            prompt: $scope.email_empty
          }, {
            type: 'email',
            prompt: $scope.email_empty_invalid
          }]
        },
        password: {
          identifier: 'password',
          rules: [{
            type: 'empty',
            prompt: $scope.password_empty
          }, {
            type: 'length[6]',
            prompt: $scope.password_length
          }]
        }
      }, {
        inline: true,
      });
    });
  }, 1000);

  $scope.forgotPassword = function() {
    $('.forgot-password-modal').modal({
      onApprove: function() {
        // if the email is not valid, do not close modal
        if (!$('.ui.email.form').form('validate form')) {
          return false;
        }
      },
    }).modal('show');
  };

  // sent reset password email
  $scope.resetPassword = function() {
    if ($scope.isAccSetEnabled) {
      // process when email is valid
      if (!$('.ui.email.form').form('validate form')) {
        return;
      }

      var data = {
        'email': $scope.account.email,
      }
      Restangular.one('authenticate').one('forgot').customPOST(data).then(function(success) {
        if (success.success) {
          $rootScope.emailconfirmed = true;
        } else {
          $rootScope.wrongemail = true;
        }
      });
    }
  };

  $scope.reconfirm = function() {
    // process when email is valid
    if (!$('.ui.email.form').form('validate form')) {
      return;
    }
    var data = {
      'email': $scope.account.email,
    };
    Restangular.one('register').one('reconfirm').customPOST(data).then(function(success) {
      if (success.success) {
        $rootScope.emailconfirmed = true;
      } else {
        $rootScope.wrongemail = true;
      }
    });
  }

  var translationLogin = $translate.instant(['login_emailempty_prompt', 'login_emailinvalid_prompt']);
  // modal forgot password/activate account validation
  $('.ui.email.form').form({
    email: {
      identifier: 'email',
      rules: [{
        type: 'empty',
        prompt: translationLogin.login_emailempty_prompt
      }, {
        type: 'email',
        prompt: translationLogin.login_emailinvalid_prompt
      }]
    },
  }, {
    inline: true,
    on: 'blur',
    onInvalid: function() {
      if (this.hasClass('ng-pristine')) {
        this.parent().removeClass('error');
        this.next().remove();
      }
    }
  });

  $scope.openModal = function (modalId, callback) {
    var selector = $('.modal#' + modalId);
    selector.modal({
      closable: false,
      onApprove: function () {
        if (typeof callback == "function") {
          callback();
        }
        return false;
      }
    }).modal('show');

  };

});