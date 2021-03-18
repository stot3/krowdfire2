app.controller('RegisterCtrl', function($scope, $rootScope, $location, Restangular, PortalSettingsService, UserService, $translate, $translatePartialLoader) {

  $scope.tos_register = false;
  $scope.submit_once = false;
  $scope.organization_name = {};

  PortalSettingsService.getSettings(true).then(function(success) {

    // get public settings
    $scope.public_settings = {};
    // loop and categorize the response data. put them into object
    angular.forEach(success, function(value) {
      if (value.setting_type_id == 3) {
        $scope.public_settings[value.name] = value.value;
      }
    });

    $scope.val = success;
    $rootScope.registerRedirect = null;
    angular.forEach($scope.val, function(value) {
      if (value) {
        if (value.name === 'site_tos_registration_ui') {
          $scope.tos_register = value.value;
        }
        if (value.name == 'site_auto_approve_new_users') {
          $scope.showMess = value.value;
        } else if (value.name === "site_register_redirect" && !$rootScope.registerRedirect) {
          $rootScope.registerRedirect = value.value;
          if (typeof $scope.registerRedirect.text !== "undefined" && $scope.registerRedirect.text !== "" && typeof $scope.registerRedirect.link !== "undefined" && $scope.registerRedirect.link !== "") {
            $scope.registerRedirectShow = true;
          } else {
            $scope.registerRedirectShow = false;
          }
        } else if (value.name === "site_auth_scheme") {
          $scope.auth_scheme_id = value.value.id;
        }
      }
    });
    $scope.getCustomFields();
  });
  $scope.getCustomFields = function() {
    // get custom fields
    $scope.custom_field = [];

    // personal fields
    if ($scope.public_settings.site_campaign_personal_section_custom) {
      if ($scope.public_settings.site_campaign_personal_section_custom.length > 0) {
        $scope.pcustom = [];
        angular.forEach($scope.public_settings.site_campaign_personal_section_custom, function(value, key) {
          var fieldRequire = false;
          var fieldPlaceholder = '';
          if(value.placeholder) {
            fieldPlaceholder = value.placeholder;
          }
          if(value.profile_setting_required) {
            fieldRequire = value.profile_setting_required;
          }
          var field = {
            name: value.name,
            identifier: "customField" + key,
            value: '',
            option: value.option,
            dropdown_array: value.dropdown_array,
            profile_step_show: value.profile_step_show,
            profile_setting_register_show: value.profile_setting_register_show,
            profile_setting_show: value.profile_setting_show,
            register_show: value.register_show,
            validate: value.validate,
            placeholder: fieldPlaceholder,
            required: fieldRequire
          };
          $scope.pcustom.push(field);
        });
        $scope.pcustom_copy = angular.copy($scope.pcustom);
      }
    }
  }
  $scope.customFieldDropdown = function(options, field) {
    field.value = options;
  }

  //Regex Form Validation
  $.fn.form.settings.rules.regexCustomValidation = function(value, validate) {
    var regex = new RegExp(validate);
    if(!value){
      return true;
    }
    if (regex)
      return regex.test(value);
    return false;
  }

  setTimeout(function() {
    $translate(['login_page_first_name_empty', 'login_page_organization_name_empty','login_page_ein_empty','login_page_last_name_empty', 'login_page_empty_email', 'login_page_valid_email', 'login_page_password_empty', 'login_page_password_length', 'login_page_reenter_password', 'login_page_password_match', 'register_custom_field_validate', 'register_custom_field_empty']).then(function(value) {
      $scope.first_name_empty = value.login_page_first_name_empty;
      $scope.last_name_empty = value.login_page_last_name_empty;
      $scope.email_empty = value.login_page_empty_email;
      $scope.email_valid = value.login_page_valid_email;
      $scope.password_empty = value.login_page_password_empty;
      $scope.password_length = value.login_page_password_length;
      $scope.reenter_password = value.login_page_reenter_password;
      $scope.password_match = value.login_page_password_match;
      $scope.organization_empty = value.login_page_organization_name_empty;
      $scope.ein_empty = value.login_page_ein_empty;

      $scope.custom_field_validate = value.register_custom_field_validate;
      $scope.custom_field_empty = value.register_custom_field_empty;

      $scope.form_validation = {
        firstName: {
          identifier: 'first_name',
          rules: [{
            type: 'empty',
            prompt: $scope.first_name_empty
          }]
        },
        lastName: {
          identifier: 'last_name',
          rules: [{
            type: 'empty',
            prompt: $scope.last_name_empty
          }]
        },
        email: {
          identifier: 'email',
          rules: [{
            type: 'empty',
            prompt: $scope.email_empty
          }, {
            type: 'email',
            prompt: $scope.email_valid
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
        },
        passwordMatch: {
          identifier: 'password_confirm',
          rules: [{
            type: 'empty',
            prompt: $scope.reenter_password
          }, {
            type: 'match[password]',
            prompt: $scope.password_match
          }]
        },
        organizationName: {
          identifier: 'organization_name',
          rules: [{
            type: 'empty',
            prompt: $scope.organization_empty
          }]
        },
        einNumber: {
          identifier: 'ein',
          rules: [{
            type: 'empty',
            prompt: $scope.ein_empty
          }]
        }
      };

      if ($scope.public_settings.site_campaign_personal_section_custom && $scope.pcustom) {
        if ($scope.public_settings.site_campaign_personal_section_custom.length > 0) {
          angular.forEach($scope.pcustom, function(value, key) {
            if (value.required && !value.validate) {
              var customValidate = {
                identifier: value.identifier,
                rules: [{
                  type: 'empty',
                  prompt: $scope.custom_field_empty
                }]
              }
              $scope.form_validation['customField' + key] = customValidate;
            } else if(!value.required && value.validate) {
              var customValidate = {
                identifier: value.identifier,
                rules: [{
                    type: 'regexCustomValidation[' + value.validate + ']',
                    prompt: $scope.custom_field_validate
                }]
              }
              $scope.form_validation['customField' + key] = customValidate;
            } else if(value.required && value.validate) {
              var customValidate = {
                identifier: value.identifier,
                rules: [{
                    type: 'empty',
                    prompt: $scope.custom_field_empty
                  }, {
                    type: 'regexCustomValidation[' + value.validate + ']',
                    prompt: $scope.custom_field_validate
                  }]
              }
              $scope.form_validation['customField' + key] = customValidate;
            }
          });
        }
      }

      // semantic form validation
      $('.ui.register.form').form($scope.form_validation, {
        inline: true,
      });

    });
  }, 1000);



  //
  $scope.formData = {};

  $scope.submit = function() { // Register the user

    $scope.userData = {
      email: $scope.formData.email,
      password: $scope.formData.password
    };

    if ($scope.tos_register) {
      $scope.submit_once = true;
      if (!$('#register input[type="checkbox"]').is(':checked')) {
        $scope.register_tos_not_checked = true;
        return;
      } else {
        $scope.register_tos_not_checked = false;
      }
    }
    var not_validated = !$('.ui.register.form').form('validate form');
    if (not_validated) {
      return;
    }
    // clear messages
    $scope.formData.errors = null;
    $scope.formData.successful = null;

    $scope.loading = true;
    $scope.formData.successful = {
      "message": "register_processing_registration"
    };

    $translate('login_page_processing_registration').then(function(value) {
      $scope.registration_processing = value;
      //("inside");
    });

    //check password encryption type
    var auth_scheme = '';

    switch ($scope.auth_scheme_id) {
      case 1:
        auth_scheme = 'crypt-bf8';
        break;
      case 2:
        auth_scheme = 'sha1';
        var secret_key = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 30; i++)
          secret_key += possible.charAt(Math.floor(Math.random() * possible.length));

        var password_scheme_options = '{"sha1":{"secret_key":"' + secret_key + '"}}';
        break;
      default:
        auth_scheme = '';
    }
    if (typeof password_scheme_options !== 'undefined') {
      $scope.formData.password_scheme_options = password_scheme_options;
    };
    $scope.formData.password_scheme = auth_scheme;

    //Check Custom Fields
    var custom_fields = {};
    if ($scope.pcustom){
      angular.forEach($scope.pcustom, function (v) {
        custom_fields[v.name] = v.value;
      });
    }

    //If Organization_name is enabled
    if ($scope.public_settings.site_campaign_enable_organization_name) {
      custom_fields['organization_name'] = $scope.organization_name.value;
      custom_fields['ein'] = $scope.organization_name.ein;
    }

    if (custom_fields) {
      $scope.formData.attributes = JSON.stringify(custom_fields);
    }

    Restangular.one('register').customPOST($scope.formData).then(
      function(success) {
        //($scope.showMess);
        if ($scope.showMess) {
          $rootScope.userEmail = $scope.formData.email;
          $scope.formData = '';
          $scope.formData = {};
          $scope.formData.successful = {
            "message": "register_success_account_confirmed"
          };
          $scope.agreed = false;
          $translate('account_confirmed').then(function(value) {
            $scope.registration_processing = value;
          });
        } else {

          $scope.formData.successful = {
            "message": "register_confirmation_email_sent"
          };
          //($scope.formData.successful);
          $translate('login_page_confirmation_sent').then(function(value) {
            $scope.registration_processing = value;
          });
        }

        if ($scope.public_settings.site_auto_approve_new_users) {
          Restangular.all('authenticate').post($scope.userData).then(function(logInData) {
            UserService.setLoggedIn(logInData, true);
            $location.path('/');

            if (UserService.isLoggedIn()) {
              //Send Extra Fields To Attributes
              Restangular.one('portal/person/attribute', UserService.person_id).customPUT(data);
            }

          });

          $scope.loading = false;
          return;
        }


        $scope.loading = false;
      },
      function(failure) { // If the register request fails, set the errors returned from the server
        $scope.formData.errors = failure.data.errors;
        $scope.formData.successful = null;
        $scope.errcode = $scope.formData.errors.email[0].code;
        $scope.loading = false;
        if ($scope.errcode === 'register_invalid_email_exists') {
          $translate('login_page_email_alreadyused').then(function(value) {
            $scope.error_messgae = value;
          });
        }
        if ($scope.errcode === 'register_transaction_account_create') {
          $translate('login_page_account_creation_failed').then(function(value) {
            $scope.error_messgae = value;
          });
        }
      }
    );
  }
});

app.controller('RegConfirmCtrl', function($routeParams, $scope, $route, UserService, APIRegister, ipCookie, Restangular, $translate) {
  $scope.confirmation = {};
  if ($routeParams.validation_token) { // If the validation token exists, ask server to confirm the user
    // logout user
    if (UserService.isLoggedIn()) {
      ipCookie.remove('current.user');
      Restangular.one('logout').customPOST();
    }
    APIRegister.regconfirm({
      token: $routeParams.validation_token
    }, function(success) {
      $scope.confirmation.confirmed = {
        "message": "register_success_account_confirmed"
      };
      setTimeout(function() {
        $translate('account_confirmed').then(function(value) {
          $scope.account_confirmed = value;
        });
      }, 1000);
      $scope.confirmation.errors = null;
      $('#login input[name="email"]').val(success.email);
    }, function(failure) {
      $scope.confirmation.confirmed = false;
      $scope.confirmation.errors = failure.data.errors;
      //($scope.confirmation.errors);
      setTimeout(function() {
        $translate('token_invalid').then(function(value) {
          $scope.token_invalid = value;
        });
      }, 1000);
    });
  }
});