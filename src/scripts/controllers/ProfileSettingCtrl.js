////////////////////////////////////////////////////////////////////////////
// Profile Settings
////////////////////////////////////////////////////////////////////////////

app.controller('ProfileSettingCtrl', function ($location, $timeout, $scope, $q, $rootScope, UserService, $translatePartialLoader, $translate, Restangular, Geolocator, PHONE_TYPE, PortalSettingsService) {
  /*======================================================================*/
  /*------------------------------- global -------------------------------*/
  /*======================================================================*/
  $scope.formPreventDefault = function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  }

  $scope.organization_name = {};

  $scope.clearMessage = function () {
    $rootScope.floatingMessage = [];
  }
  var msg;
  // success message & failure mess
  PortalSettingsService.getSettingsObj().then(function (success) {
    $scope.public_settings = success.public_setting;
    $scope.isAccSetEnabled = success.public_setting.site_disable_account_setting;
    $scope.native_lookup = success.public_setting.site_theme_shipping_native_lookup;
    $scope.isRemoveUserProfileBio = success.public_setting.site_remove_user_profile_bio;

    $scope.getCustomFields();
  });

  $scope.getCustomFields = function () {
    // get custom fields
    $scope.custom_field = [];


    Restangular.one('portal/person/attribute?filters={"person_id":"' + UserService.person_id + '"}').customGET().then(function (success) {
      $scope.$emit("loading_finished");
      if (success) {
        $scope.custom_field = success;
      }

      // Organization Name & EIN custom fields
      if ($scope.public_settings.site_campaign_enable_organization_name && $scope.custom_field[0].attributes) {
        $scope.organization_name.value = $scope.custom_field[0].attributes['organization_name'];
        $scope.organization_name.ein = $scope.custom_field[0].attributes['ein'];
      }

      //business fields
      if ($scope.public_settings.site_campaign_business_section_custom) {
        if ($scope.public_settings.site_campaign_business_section_custom.length > 0) {
          $scope.bcustom = [];
          angular.forEach($scope.public_settings.site_campaign_business_section_custom, function (value) {
            var fieldRequire = false;
            var fieldPlaceholder = '';
            if (value.placeholder) {
              fieldPlaceholder = value.placeholder;
            }
            if (value.profile_setting_required) {
              fieldRequire = value.profile_setting_required;
            }
            var field = {
              name: value.name,
              identifier: "customFieldBusiness" + key,
              value: '',
              placeholder: fieldPlaceholder,
              required: fieldRequire
            };

            // Compare if key matches setting.name
            angular.forEach($scope.custom_field[0].attributes, function (val, key, obj) {
              if (key) {
                if (key == value.name) {
                  field.value = val;
                }
              }
            });
            $scope.bcustom.push(field);
          });
          $scope.bcustom_copy = angular.copy($scope.bcustom);
        }
      }

      // personal fields
      if ($scope.public_settings.site_campaign_personal_section_custom) {
        if ($scope.public_settings.site_campaign_personal_section_custom.length > 0) {
          $scope.pcustom = [];
          angular.forEach($scope.public_settings.site_campaign_personal_section_custom, function (value, key) {
            var fieldRequire = false;
            var fieldPlaceholder = '';
            if (value.placeholder) {
              fieldPlaceholder = value.placeholder;
            }
            if (value.profile_setting_required) {
              fieldRequire = value.profile_setting_required;
            }
            if ($scope.public_settings.site_campaign_personal_section_enhanced) {
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
            } else {
              var field = {
                name: value.name,
                identifier: "customField" + key,
                value: '',
                option: 'Text',
                dropdown_array: null,
                profile_step_show: true,
                placeholder: fieldPlaceholder,
                required: fieldRequire
              };
            }
            angular.forEach($scope.custom_field[0].attributes, function (val, key, obj) {
              if (key) {
                if (key == value.name) {
                  field.value = val;
                }
              }
            });
            $scope.pcustom.push(field);
          });
          $scope.pcustom_copy = angular.copy($scope.pcustom);
        }
      }
    }, function (error) {
      $scope.custom_field = [];
      $scope.pcustom = [];
      $scope.pcustom_copy = angular.copy($scope.pcustom);
      $scope.$emit("loading_finished");
    });
  }
  $scope.customFieldDropdown = function (option, field) {
    field.value = option;
  }


  $scope.savePersonAttributes = function (person_id, $data) {
    Restangular.one('portal/person/attribute', person_id).customPUT($data);
  }

  $scope.emailshow = false;

  // detect location hash
  var hashVal = $location.hash();


  // hash value handler
  if (hashVal) {
    $('#profile-setting-tabs').find('[data-tab]').removeClass('active');
    $('#profile-setting-tabs').find('[data-tab=' + hashVal + ']').addClass('active');
  }

  // click hash function
  $scope.clickHash = function (tabName) {
    $location.hash(tabName).replace();
  };

  $scope.user = UserService;

  // open modal by id
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

  $scope.closeModal = function () {
    $('.ui.modal').modal('hide');

  }

  // set dimmer on and off
  $scope.dimmerOn = function () {
    $('.image').dimmer('show');
  };
  $scope.dimmerOff = function () {
    $('.image').dimmer('hide');
  };

  // select all check boxes on the current page
  $scope.checkAll = function (tableClass) {
    var checked = $('.' + tableClass + ' thead tr .check-all input').prop('checked');
    if (checked == false) {
      $('.' + tableClass + ' tbody tr .t-check-box input').prop('checked', true);
    } else {
      $('.' + tableClass + ' tbody tr .t-check-box input').prop('checked', false);
    }
  };

  // queue up the checked items
  function selectQueue(tableClass) {

    var queue = [];
    $('table.' + tableClass).find('tbody td.t-check-box input').each(function () {
      if ($(this).prop('checked')) {
        var item = $(this).scope();

        queue.push(item);

      }
    });
    return queue;
  };

  /* initialize semantic tabbing*/
  $('#profile-setting-tabs .menu-tabs .item').tab({
    context: $('#profile-setting-tabs')
  });

  $scope.getCompany = function () {
    Restangular.one('account/business').customGET().then(function (success) {
      $scope.companies = success;
    });
  }

  // multi delete
  $scope.multiDelete = function (tableClass, modalID, callback) {

    $scope.deleteQueue = selectQueue(tableClass);

    $scope.itemDeleteCount = $scope.deleteQueue.length;

    if ($scope.deleteQueue.length) {
      $scope.openModal(modalID, callback);

    } else {
      msg = {
        'header': 'profile_setting_select_error'
      }

      $rootScope.floatingMessage = msg;

      $scope.hideFloatingMessage();
    }
  };
});

/*======================================================================*/
/*------------------------ Manage Personal Info ------------------------*/
/*======================================================================*/
app.controller('TabPersonCtrl', function ($translate, $scope, $timeout, $q, Restangular, UserService, FileUploadService, $rootScope) {
  // get the account info (first, last name/ bio)
  getProfileInfo();

  $scope.organization_name = {};

  function getProfileInfo() {
    Restangular.one('account/person', UserService.person_id).customGET().then(function (success) {
      $scope.profile = {
        first_name: success.first_name,
        last_name: success.last_name,
        bio: success.bio,
      };
      $rootScope.checkperson = $scope.profile;
    });
  }

  getProfileImage();

  // HTTP protocols for Profile Links
  $scope.profile_protocols = [{
    value: "http://"
  }, {
    value: "https://"
  }, {
    value: "Relative Path"
  }];
  $scope.profile_link_default_protocol = $scope.profile_protocols[0];

  function getProfileImage() {
    // get the profile image
    Restangular.one('account/resource/file').customGET().then(function (success) {
      $scope.profileImage = success.personal;
    });
  }
  getProfileLinks();

  // add more link
  $scope.addLink = function (arr) {
    var link = {
      uri: '',
      uri_text: '',
    };
    if (angular.isUndefined(arr))
      angular.copy(link);
    else
      arr.push(angular.copy(link));
  };

  // remove links
  $scope.removeProfileLink = function (link, index) {
    // send delete request if id exists
    if (link.uri_id) {
      Restangular.one('account/website', link.uri_id).customDELETE().then(function (success) {
        // delete the item from the list
        msg = {
          'header': "link_removed"
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
    $scope.profileLinks.splice(index, 1);
  };

  //Regex Form Validation
  $.fn.form.settings.rules.regexCustomValidation = function (value, validate) {
    var regex = new RegExp(validate);
    if (!value) {
      return true;
    }
    if (regex)
      return regex.test(value);
    return false;
  }

  var personalValidation = function () {
    var translation = $translate.instant(['tab_personal_setting_fname_validation', 'tab_personal_setting_lname_validation', 'tab_personal_setting_custom_field_validate', 'tab_personal_setting_custom_field_empty']);
    
    $scope.form_validation = {
      first_name: {
        identifier: 'first_name',
        rules: [{
          type: 'empty',
          prompt: translation.tab_personal_setting_fname_validation
        }]
      },
      last_name: {
        identifier: 'last_name',
        rules: [{
          type: 'empty',
          prompt: translation.tab_personal_setting_lname_validation
        }]
      }
    }

    angular.forEach($scope.pcustom, function (value, key) {
      if (value.required && !value.validate) {
        var customValidate = {
          identifier: value.identifier,
          rules: [{
            type: 'empty',
            prompt: translation.tab_personal_setting_custom_field_empty
          }]
        }
        $scope.form_validation['customField' + key] = customValidate;
      } else if (!value.required && value.validate) {
        var customValidate = {
          identifier: value.identifier,
          rules: [{
            type: 'regexCustomValidation[' + value.validate + ']',
            prompt: translation.tab_personal_setting_custom_field_validate
          }]
        }
        $scope.form_validation['customField' + key] = customValidate;
      } else if (value.required && value.validate) {
        var customValidate = {
          identifier: value.identifier,
          rules: [{
            type: 'empty',
            prompt: translation.tab_personal_setting_custom_field_empty
          }, {
            type: 'regexCustomValidation[' + value.validate + ']',
            prompt: translation.tab_personal_setting_custom_field_validate
          }]
        }
        $scope.form_validation['customField' + key] = customValidate;
      }
    });

    $('.ui.form').form($scope.form_validation, {
      inline: true,
      keyboardShortcuts: true,
      onSuccess: function () {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function () {
        $scope.valcheck = $scope.valcheck && false;
        $('html, body').animate({
          scrollTop: $(".field.error").offset().top
        }, 1000);
      }
    }).form('validate form');
  }


  // save data
  $scope.saveData = function (e) {
    $scope.valcheck = true;
    personalValidation();

    //Check Custom Fields
    var custom_fields = {};
    if ($scope.pcustom) {
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
      custom_fields = JSON.stringify(custom_fields);
    }

    var customFieldData = {
      attributes: custom_fields
    }

    // save all data
    var accountData = {
      first_name: $scope.profile.first_name,
      last_name: $scope.profile.last_name,
      bio: $scope.profile.bio
    }


    if ($scope.valcheck) {
      saveAccountInfo(accountData).then(function (success) {
        UserService.updateUserData(accountData);
        msg = {
          'loading': true,
          'loading_message': 'in_progress'
        }

        $scope.savePersonAttributes(UserService.person_id, customFieldData);

        $rootScope.floatingMessage = msg;
        $q.all(saveProfileLinks()).then(function (success) {
          msg = {
            'header': "success_message_save_changes_button",
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        }, function (failed) {
          // fail message for links
          msg = {
            header: failed.data.message
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      }, function (failed) {
        // fail message for account info
        msg = {
          header: failed.data.message
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
  }

  // request server to get the profile links
  function getProfileLinks() {
    Restangular.one('account/website').customGET().then(function (success) {
      $scope.profileLinks = success.personal; // assign them to the scope variable
      // Remove http protocols from existing links when retrieving and set the dropdown to that protocol
      //don't remove for relative urls
      for (var n in $scope.profileLinks) {
        var current_profile_link = $scope.profileLinks[n].uri;
        for (var i in $scope.profile_protocols) {
          var indexOf = current_profile_link.indexOf($scope.profile_protocols[i].value);
          if (indexOf > -1) {
            $scope.profileLinks[n].uri = current_profile_link.replace($scope.profile_protocols[i].value, "");
            $scope.profileLinks[n].profile_link_default_protocol = $scope.profile_protocols[i].value;
            break;
          } else {
            $scope.profileLinks[n].profile_link_default_protocol = $scope.profile_protocols[2].value;
          }
        }
      }
    });
  }

  $scope.profileLinks = [] || $scope.profileLinks;
  while ($scope.profileLinks.length === 0)
    $scope.addLink($scope.profileLinks);

  function saveAccountInfo(data) {
    return Restangular.one('account').customPUT(data);
  }

  function saveProfileLinks() {
    var requestQueue = [];
    var selectedProtocols = $(".dropdown.profile-link-protocol").dropdown("get text");
    angular.forEach($scope.profileLinks, function (link, key) {
      // Concate the selected protocol to the user entered link/path.
      var new_link = {};

      for (var prop in link) {
        new_link[prop] = link[prop];
      }
      // if protocol is not Relative
      if (Array.isArray(selectedProtocols)) {
        if (selectedProtocols[key] == "relative") {
          new_link.uri = link.uri;
        } else {
          // replace protocal in link if present
          link.uri = link.uri.replace(/^https?\:\/\//i, "");
          new_link.uri = selectedProtocols[key] + link.uri;
        }
      } else {
        if (selectedProtocols == "relative") {
          new_link.uri = link.uri;
        } else {
          // replace protocal in link if present
          link.uri = link.uri.replace(/^https?\:\/\//i, "");
          new_link.uri = selectedProtocols + link.uri;
        }
      }

      if (new_link.uri_id) // if there is an id, send PUT request to update
      {
        requestQueue.push(Restangular.one('account/website', new_link.uri_id).customPUT(new_link));
      } else // else send POST to create new
      {
        requestQueue.push(Restangular.one('account/website').customPOST(new_link));
      }
    });
    return requestQueue;
  }

  // If profileImage has content, we PUT. No then POST
  $scope.uploadProfileImage = function (files) {
    if (files.length) {
      if ($scope.allowedImage(files[0].type)) {
        var params = {
          resource_content_type: 'image',
        };
        var $picNode = $('.profilePersonal');
        Restangular.one('account/resource/file/').customGET().then(function (success) {
          // If there's no content then we POST
          if (success.personal.length == 0) {
            FileUploadService.upload('account/resource/file', files, params, $picNode).then(function (success) {
              // Checking the response if it has values
              if (success.length != 0) {
                $scope.profileImage.push(success[0].data);
              }
            });
          } else {
            FileUploadService.modify('account/resource/file/', files, params, success.personal[0].id, $picNode).then(function (success) {
              if (success.length != 0) {
                $scope.profileImage = [];
                $scope.profileImage.push(success[0].data);
              }
            });
          }
        });
      } else {
        //Show modal
        $('.wrong-filetype').modal('show');
      }
    }
  }

  $scope.allowedImage = function (file_type) {
    var allowed_type = ['image/vnd.microsoft.icon', 'image/x-icon', 'image/png', 'image/pjpeg', 'image/jpeg', 'image/gif'];
    if (allowed_type.indexOf(file_type) > -1) {
      return true;
    } else {
      return false;
    }
  }

  $scope.deleteProfileImage = function (files) {
    if (files && files.length) {
      var file = files.pop();
      Restangular.one('account/resource/file').customDELETE(file.id);
      $('.imagePlace .dimmer').dimmer('hide');
      $('.ui.progress.upload-bar').show();
      $('.ui.loader.download-loader').hide();
    }
  }

  Restangular.one('portal/person/attribute?filters={"person_id":"' + UserService.person_id + '"}').customGET().then(function (success) {
    if (success[0].attributes) {
      $scope.organization_name.value = success[0].attributes['organization_name'];
      $scope.organization_name.ein = success[0].attributes['ein'];
    }
  });
});
/*======================================================================*/
/*------------------------ Manage Company Info -------------------------*/
/*======================================================================*/
app.controller('TabCompanyCtrl', function ($translate, $scope, $timeout, $q, Restangular, UserService, FileUploadService, $rootScope) {
  $scope.deleteProfileImage = function (files) {
    // delete the first file in array (most recently added)
    var index = 0;
    Restangular.one('account/resource/file').customDELETE(files[index].id).then(function () {
      files.splice(index, 1);
    });
    $('.imagePlace .dimmer').dimmer('hide');
    $('.ui.loader.download-loader').fadeOut();
    $('.ui.progress.upload-bar').fadeOut();
  };


  // HTTP protocols for Profile Links
  $scope.profile_protocols = [{
    value: "http://"
  }, {
    value: "https://"
  }, {
    value: "Relative Path"
  }];
  $scope.profile_link_default_protocol = $scope.profile_protocols[0];

  // get the business info
  getBusinessInfo();

  $scope.getBusinessImage = function (businessID) {
    // get the profile image
    Restangular.one('account/resource/file?business_organization_id=' + businessID).customGET().then(function (success) {
      $scope.businessImage = success;
    });
  };

  $scope.uploadBusinessImage = function (files) {
    if (files.length) {
      var $picNode = $('.profileCompany');
      var params = {
        resource_content_type: 'image',
        business_organization_id: $scope.businessSelected.id
      };

      // Check if there is a bussiness already created
      // If not then we POST one with Placeholder as the name
      if (!$scope.businessSelected.id) {
        if (!$scope.businessSelected.name) {
          $scope.businessSelected.name = "Placeholder"
        }
        Restangular.one('account/business').customPOST($scope.businessSelected).then(function (success) {
          $scope.businessSelected = success;
          getBusinessInfo();
          params.business_organization_id = $scope.businessSelected.id;
          FileUploadService.upload('account/resource/file/', files, params, $picNode).then(function (success) {
            $scope.businessImage = [];
            $scope.businessImage.push(success[0].data);
          });
        });
      } else {
        FileUploadService.upload('account/resource/file/', files, params, $picNode).then(function (success) {
          $scope.businessImage = [];
          $scope.businessImage.push(success[0].data);
        });
      }
    }
  }

  $scope.deleteBusinessImage = function (files) {
    if (files && files.length) {
      var file = files.pop();
      var param = {
        business_organization_id: $scope.businessSelected.id,
      };
      Restangular.one('account/resource/file').customDELETE(file.id, param);
      $('.imagePlace .dimmer').dimmer('hide');
      $('.ui.loader.download-loader').fadeOut();
      $('.ui.progress.upload-bar').fadeOut();
    }
  }

  // the business is being selected/editting or being creating
  $scope.selectBusiness = function (business) {
    // clear existing business data before pulling in new business data
    // $('.ui.form.company-form').form('clear');
    //openModal('setting-add-company');
    $scope.businessLinks = [];
    $scope.businessImage = null;
    $scope.getBusinessImage(business.business_organization_id);
    $scope.businessSelected = business;
    getBusinessLinks(business.business_organization_id);
  };
  // reset business if the add business button is clicked
  $scope.newBusiness = function () {
    $('.ui.form.company-form').form('clear');
    $scope.businessSelected = {
      business_organization_id: '',
      description: '',
      name: '',
    };
    $scope.businessLinks = [];
    $scope.businessImage = [];
  };
  // add more business link
  $scope.addBusinessLink = function (arr) {
    var link = {
      uri: '',
      uri_text: '',
      business_organization_id: $scope.businessSelected.business_organization_id,
    };
    if (angular.isUndefined(arr))
      angular.copy(link);
    else
      arr.push(angular.copy(link));
  };

  // remove links
  $scope.removeBusinessLink = function (link) {
    if (link.uri_id) {
      Restangular.one('account/website').customDELETE(link.uri_id, {
        business_organization_id: link.business_organization_id
      }).then(function (success) {
        $scope.businessLinks.splice($scope.businessLinks.indexOf(link), 1); // delete the item from the list
      }); // send delete request
    } else {
      $scope.businessLinks.splice($scope.businessLinks.indexOf(link), 1);
    }
  };

  $scope.companyValidation = function () {
    var translation = $translate.instant(['tab_company_setting_company_name_error']);

    $('.company-form.ui.form').form({
      company_name: {
        identifier: 'company_name',
        rules: [{
          type: 'empty',
          prompt: translation.tab_company_setting_company_name_error
        }]
      }
    }, {
        inline: true,
        onSuccess: function () {
          $scope.valcheck = $scope.valcheck && true;
        },
        onFailure: function () {
          $scope.valcheck = $scope.valcheck && false;
        }
      }).form('validate form');
  }

  $scope.saveBusinessInfoEnter = function (event) {
    if (event.keyCode == 13) {
      event.target.blur();
      $scope.saveBusinessInfo(event);
    }
  }

  // save the campany info and link
  $scope.saveBusinessInfo = function () {
    $scope.valcheck = true;
    $scope.companyValidation();

    if ($scope.valcheck) {
      var request;
      msg = {
        'loading': true,
        'loading_message': 'in_progress'
      }
      $rootScope.floatingMessage = msg;
      //Check Custom Fields
      var custom_fields = {};
      if ($scope.bcustom) {
        angular.forEach($scope.bcustom, function (v) {
          custom_fields[v.name] = v.value;
        });
      }
  
      if (custom_fields) {
        custom_fields = JSON.stringify(custom_fields);
      }
  
      var customFieldData = {
        attributes: custom_fields
      }

      $scope.savePersonAttributes(UserService.person_id, customFieldData)

      if ($scope.businessSelected.business_organization_id) {

        // if id exists
        request = Restangular.one('account/business', $scope.businessSelected.business_organization_id).customPUT($scope.businessSelected).then(function (success) {
          saveBusinessLinks();
          msg = {
            'header': "success_message_save_changes_button"
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          $scope.getCompany();
        }); // update
      } else {
        // if no id exist
        request = Restangular.one('account/business').customPOST($scope.businessSelected).then(function (success) {
          $scope.businessSelected = success; // assign the new business to selected so that links can be added
          saveBusinessLinks();
          msg = {
            'header': "success_message_save_changes_button"
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          $scope.getCompany();
        }); // create new
      }

      if (request) {
        request.then(function () {
          $('#setting-add-company').modal('hide');
          msg = {
            header: 'tab_company_setting_company_info_save_success'
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          getBusinessInfo();
        });
      } else {
        msg = {
          header: 'tab_company_setting_company_info_save_error'
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }
    }
  }

  $scope.removeBusiness = function (business) {
    return Restangular.one('account/business', business.business_organization_id).customDELETE(); // send delete request
  };

  // confirm delete
  $scope.confirmDeleteBusiness = function () {
    var requestQueue = [];

    angular.forEach($scope.deleteQueue, function (value) {
      requestQueue.push($scope.removeBusiness(value.business));
    });
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    $q.all(requestQueue).then(function (success) {
      angular.forEach(success, function (value) {
        angular.forEach($scope.businesses, function (business, index) {
          if (value.id == business.id) {
            $scope.businesses.splice(index, 1);
          }
        });
      });
      msg = {
        header: 'tab_company_setting_company_info_delete_success'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      $scope.getCompany();
    }, function (failed) {
      msg = {
        header: failed.data.message
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  };

  // save the links
  function saveBusinessLinks() {
    var selectedProtocols = $(".dropdown.business-link-setup").dropdown("get text");
    angular.forEach($scope.businessLinks, function (link, key) {
      // send request if fields are not blank
      var new_link = {};

      for (var prop in link) {
        new_link[prop] = link[prop];
      }

      if (Array.isArray(selectedProtocols)) {
        if (selectedProtocols[key] == "Relative Path") {
          new_link.uri = link.uri;
        } else {
          new_link.uri = selectedProtocols[key] + link.uri;
        }
      } else {
        if (selectedProtocols == "Relative Path") {
          new_link.uri = link.uri;
        } else {
          new_link.uri = selectedProtocols + link.uri;
        }
      }

      if (new_link.uri_text && new_link.uri) {
        if (new_link.uri_id) // if there is an id, send PUT request to update
        {
          Restangular.one('account/website', new_link.uri_id).customPUT(new_link);
        } else // else send POST to create new
        {
          new_link.business_organization_id = $scope.businessSelected.business_organization_id;
          Restangular.one('account/website').customPOST(new_link);
        }
      }
    });
  }
  // get links that is related to a business
  function getBusinessLinks(businessId) {
    Restangular.all('account/website?business_organization_id=' + businessId).customGET().then(function (success) {
      // assign them to the scope variable
      $scope.businessLinks = success.business;
      for (var n in $scope.businessLinks) {
        var current_business_link = $scope.businessLinks[n].uri;
        for (var i in $scope.profile_protocols) {
          var indexOf = current_business_link.indexOf($scope.profile_protocols[i].value);
          if (indexOf > -1) {
            $scope.businessLinks[n].uri = current_business_link.replace($scope.profile_protocols[i].value, "");
            $scope.businessLinks[n].profile_link_default_protocol = $scope.profile_protocols[i].value;
            break;
          } else {
            $scope.businessLinks[n].profile_link_default_protocol = $scope.profile_protocols[2].value;
          }
        }
      }
    });
  }
  // function to request server for business info
  function getBusinessInfo() {
    Restangular.one('account/business').customGET().then(function (success) {
      $scope.businesses = success;
      if ($scope.businesses[0]) {
        $scope.showcompany = true;
      } else {
        $scope.showcompany = false;
      }
    });
  }
});
/*======================================================================*/
/*--------------------------- Manage Addresses -------------------------*/
/*======================================================================*/
app.controller('TabAddressCtrl', function ($translate, $scope, $timeout, $q, Restangular, UserService, Geolocator, PortalSettingsService, $rootScope) {
  var msg = {};
  $scope.addressSubcountrySelected = {};
  $scope.addressCountrySelected = {};
  $scope.addressSelected = {};
  PortalSettingsService.getSettingsObj().then(function (success) {
    $scope.alt_shipping = success.public_setting.site_theme_alt_shipping_layout;
    $scope.native_lookup = success.public_setting.site_theme_shipping_native_lookup;
    if ($scope.native_lookup) {
      success.public_setting.site_theme_default_shipping_country.name = success.public_setting.site_theme_default_shipping_country.native_name;
    }
    // Check alternative shipping setting
    if ($scope.alt_shipping) {
      getCountries();
    }
    $scope.default_country = success.public_setting.site_theme_default_shipping_country;
    if ($scope.default_country != null) {
      if ($scope.default_country.name) {
        $scope.addressCountrySelected.selected = $scope.default_country;
      }
    }
    $scope.setCountry($scope.addressCountrySelected.selected);
    if ($scope.addressCountrySelected.selected != null && Object.getOwnPropertyNames($scope.addressCountrySelected.selected).length && $scope.addressCountrySelected.selected.name) {
      getSubcountries($scope.addressCountrySelected.selected.id);
    }
  });
  var address_table = "";
  getAddressInfo();
  $scope.getCompany();

  $scope.selectAddress = function (address) {
    $('.ui.form').form('clear');
    $scope.addressSelected = address;
    if ($scope.alt_shipping) {
      $scope.addressCountrySelected.selected = {
        "name": "",
        "id": 0
      };
      $scope.addressSubcountrySelected.selected = {
        "name": "",
        "id": 0
      };
      $scope.addressSelected.selected = {
        "name": "",
        "id": 0
      };
      $scope.addressCountrySelected.selected.name = $scope.native_lookup && address.country_native_name ? address.country_native_name : address.country;
      $scope.addressCountrySelected.selected.id = address.country_id;
      $scope.addressSubcountrySelected.selected.name = $scope.native_lookup && address.subcountry_native_name ? address.subcountry_native_name : address.subcountry;
      $scope.addressSubcountrySelected.selected.id = address.subcountry_id;
      $scope.addressSelected.selected.name = $scope.native_lookup && address.city_native_name ? address.city_native_name : address.city;
    } else {
      $scope.addressSelected.selected = {
        "name": address.city_full
      };
    }
    if (address.business_organization) {
      $scope.showBusName = true;
    } else {
      $scope.showbusName = false;
    }
    angular.forEach($scope.companies, function (value) {
      if (value.business_organization_id == $scope.addressSelected.business_organization_id) {
        $scope.companyName = value.name;
        $('#defaulttext').text($scope.companyName);
        $('#defaulttext').removeClass('default');
      }
    });
  }

  $scope.showpersonal = true;
  $scope.showbusiness = false;

  $scope.newAddress = function () {
    // clearAddress();
    $('.ui.form').form('clear');
    // reset variable
    $scope.showBusName = false;
    $scope.addressSelected = {
      business_organization_id: '',
      city_id: '',
      mail_code: '',
      street1: '',
      street2: '',
      description: '',
    };
  };

  $scope.removeAddress = function (address) {
    if ($scope.showbusiness) {
      var par = {
        business_organization_id: address.business_organization_id
      }
      return Restangular.one('account/address', address.address_id).remove(par); // send delete request
    } else if ($scope.showpersonal) {
      return Restangular.one('account/address', address.address_id).customDELETE(); // send delete request
    }
  };
  // confirm delete
  $scope.confirmDeleteAddress = function () {
    var queueLength = $scope.deleteQueue.length;
    var errorMsg;

    var requestQueue = [];
    angular.forEach($scope.deleteQueue, function (value, key) {
      requestQueue.push($scope.removeAddress(value.address));
    });
    // wait all promises
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    $q.all(requestQueue).then(function (success) {
      angular.forEach(success, function (value) {
        //remove object from addresses array
        angular.forEach($scope.addresses, function (address, index) {
          if (address.id == value.id) {
            $scope.addresses.splice(index, 1);
          }
        })
      });
      msg = {
        header: 'tab_address_delete_success'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      getAddressInfo();
    }, function (failed) {
      msg = {
        header: failed.data.message
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  };

  // Look up city based on search term, then find the cityID and store it
  // This will check the setting to see if native_lookup is needed for search
  $scope.searchCities = function (term) {
    var cityID = null; // variable to hold city ID
    var countryID = null;
    var native_lookup = $scope.native_lookup == true ? 1 : 0;

    if (term) {
      // Check setting here to choose which one to use, check the layout
      // This one is to search cities directly
      if (!$scope.alt_shipping) {
        Geolocator.searchCities(term, native_lookup).then(function (cities) {
          $scope.cities = cities;
        });
      }
      // This one is to search with subcountry id to limit the area
      else {
        Geolocator.searchCitiesBySubcountry(term, $scope.addressSubcountrySelected.selected.id, native_lookup).then(function (cities) {
          $scope.cities = cities;
          if (!cities || cities instanceof Array && cities.length === 0) {
            Geolocator.searchCitiesBySubcountry(term, $scope.addressSubcountrySelected.selected.id, 0).then(function (cities) {
              $scope.cities = cities;
            });
          } else if (native_lookup) {
            for (var i in cities) {
              if (cities[i].city_native_name != null) {
                cities[i].name = cities[i].city_native_name;
              }
              if (cities[i].country_native_name != null) {
                cities[i].country = cities[i].country_native_name;
              }
              if (cities[i].subcountry_native_name != null) {
                cities[i].subcountry = cities[i].subcountry_native_name;
              }
            }
            $scope.cities = cities;
          }
        });
      }
    }
  }

  $scope.$watch("addressCountrySelected.selected", function (value, oldValue) {
    if (value != oldValue && value) {
      getSubcountries(value.id);
    }
  });

  $scope.$watch('addressSelected.selected', function (value) {
    if (value) {
      var cityID = Geolocator.lookupCityID(value.name);
      if (cityID) {
        $scope.addressSelected.city_id = cityID;
      }
      $('#select-city .select-error').remove();
      $('#select-city').removeClass('error');
    }
  });



  function getCountries() {
    Geolocator.getCountries().then(function (countries) {
      if ($scope.native_lookup) {
        for (var i in countries) {
          if (countries[i].native_name != null) {
            countries[i].name = countries[i].native_name;
          }
        }
      }
      $scope.countries = countries;
      // Check if there is default country, if so, we put it at first index and remove the one originally in the array
      if ($scope.default_country) {
        for (var index in $scope.countries) {
          var value = $scope.countries[index];
          if (value.id == $scope.default_country.id) {
            // This line is to change output language of default_country according to native_lookup setting
            $scope.default_country = value;
            $scope.countries.splice(index, 1);
            break;
          }
        }
        $scope.countries.splice(0, 0, $scope.default_country);
      }
    });
  }

  function getSubcountries(countryID) {
    Geolocator.getSubcountriesByCountry(countryID).then(function (subcountries) {
      // Check which language to show
      if ($scope.native_lookup) {
        for (var i in subcountries) {
          if (subcountries[i].native_name != null) {
            subcountries[i].name = subcountries[i].native_name;
          }
        }
      }
      $scope.subcountries = subcountries;
    });
  }

  $scope.setCountry = function (country) {
    $scope.addressCountrySelected.selected = country;
  }

  function clearAddress() {
    $scope.addressSelected.selected = {};
    $scope.addressSubcountrySelected.selected = {};
    $scope.addressCountrySelected.selected = $scope.default_country;
    $scope.addressSelected.mail_code = "";
    $scope.addressSelected.street1 = "";
    $scope.addressSelected.street2 = "";
  }


  $scope.addressValidation = function () {
    var translation = $translate.instant(['tab_address_select_company_error', 'tab_address_address1_error', 'tab_address_mailcode_error']);

    $('.address-form.ui.form').form({
      company_select: {
        identifier: 'company_select',
        rules: [{
          type: 'empty',
          prompt: translation.tab_address_select_company_error
        }]
      },
      address1: {
        identifier: 'address1',
        rules: [{
          type: 'empty',
          prompt: translation.tab_address_address1_error
        }]
      },
      mail_code: {
        identifier: 'mail_code',
        rules: [{
          type: 'empty',
          prompt: translation.tab_address_mailcode_error
        }]
      }
    }, {
        inline: true,
        onSuccess: function () {
          $scope.valcheck = $scope.valcheck && true;
        },
        onFailure: function () {
          $scope.valcheck = $scope.valcheck && false;
        }
      }).form('validate form');
  }

  $scope.saveAddressInfoEnter = function (event) {
    if (event.keyCode == 13) {
      event.target.blur();
      $scope.saveAddressInfo(event);
    }
  }

  $scope.saveAddressInfo = function (event) {
    var translation = $translate.instant(['profile_setting_selectcity_error']);
    $scope.valcheck = true;
    if (!$('#select-city .select2-container').hasClass('select2-container-disabled')) {
      if (!$scope.addressSelected.selected) {
        $('.select-error').remove();
        $('#select-city').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.profile_setting_selectcity_error + '</div>');
        $('#select-city').addClass('error');
      }
    }
    $scope.addressValidation();
    if ($scope.valcheck) {
      angular.element(event.target).addClass("disabled");

      msg = {
        'loading': true,
        'loading_message': 'in_progress'
      }
      $rootScope.floatingMessage = msg;
      var request;

      if ($scope.addressSelected.address_id) {
        request = Restangular.one('account/address', $scope.addressSelected.address_id).customPUT($scope.addressSelected);
      } else {
        request = Restangular.one('account/address').customPOST($scope.addressSelected);
      }
      request.then(function (success) {
        $('#setting-add-address').modal('hide');
        msg = {
          header: 'tab_address_save_success'
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        angular.element(event.target).removeClass("disabled");
        getAddressInfo();
      }, function (failed) {
        msg = {
          header: failed.data.message
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        angular.element(event.target).removeClass("disabled");
      });
    }
  };

  $scope.setPrimary = function () {

    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    var queue = selectQueue(address_table);
    // check the queue length
    if (queue.length != 1) {
      // throw "only one primary address can be set";
      msg = {
        header: 'tab_address_set_primary'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    } else {
      var unsetPrimary;
      // unset previous primary address
      angular.forEach($scope.addresses, function (value) {
        if (value.primary_address == 1) {
          var update = {
            primary_address: 0,
          };
          unsetPrimary = Restangular.one('account/address', value.address_id).customPUT(update);
        }
      });

      // set primary address
      var update = {
        primary_address: 1,
      };
      if (unsetPrimary) {
        unsetPrimary.then(function (success) {
          Restangular.one('account/address', queue[0].address.address_id).customPUT(update);
        }).then(function () {
          msg = {
            header: 'tab_address_reset_primary'
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          getAddressInfo();
        }, function (failed) {
          msg = {
            header: failed.data.message
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      } else {
        Restangular.one('account/address', queue[0].address.address_id).customPUT(update).then(function () {
          msg = {
            header: 'tab_address_set_primary_success'
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          getAddressInfo();
        }, function (failed) {
          msg = {
            header: failed.data.message
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      }

    }
  };
  $scope.selectCompany = function (id) {
    $scope.addressSelected.business_organization_id = id;
  }
  $scope.showPersonal = function (id) {

    if (id == 'p') {
      setTimeout(function () {
        $('#personalbtn').addClass('positive');
        $('#businessbtn').removeClass('positive');
      }, 50);
      $scope.showpersonal = true;
      $scope.showbusiness = false;
      address_table = "address-table-personal";
    }
    if (id == 'b') {
      setTimeout(function () {
        $('#businessbtn').addClass('positive');
        $('#personalbtn').removeClass('positive');
      }, 50);
      $scope.showpersonal = false;
      $scope.showbusiness = true;
      address_table = "address-table-business";
    }
  }

  // queue up the checked items
  function selectQueue(tableClass) {
    var queue = [];
    $('table.' + tableClass).find('tbody td.t-check-box input').each(function () {
      if ($(this).prop('checked')) {
        var item = $(this).scope();
        queue.push(item);
      }
    });
    return queue;
  };

  function getAddressInfo() {
    // request for account address info
    Restangular.one('account/address').customGET().then(function (success) {
      $scope.personal_addresses = checkNative(success.personal); // personal address
      $scope.business_addresses = checkNative(success.business);

      if (success.personal) {
        $scope.showadd = true;
        $scope.showbadd = true;
        $scope.showPersonal('p');
      } else if (success.business) {
        $scope.showadd = false;
        $scope.showbadd = true;
        $scope.showPersonal('b');
      }
    });
  }

  function checkNative(addressData) {
    angular.forEach(addressData, function (value, key) {
      // Format: Country Subcountry, City
      if ($scope.native_lookup) {
        var name = "";
        if (value.country_native_name != null) {
          name += value.country_native_name;
        } else {
          name += value.country;
        }
        if (value.subcountry_native_name != null) {
          name += " " + value.subcountry_native_name;
        } else {
          name += " " + value.subcountry;
        }
        if (value.city_native_name != null && value.city != "Other") {
          name += ", " + value.city_native_name;
        } else if (value.city != "Other") {
          name += ", " + value.city;
        } else {
          value.city = "";
        }
        value.city_full = name;
      }
    });
    return addressData;
  }

});



/*======================================================================*/
/*--------------------------- Manage Phone -------------------------*/
/*======================================================================*/
app.controller('TabPhoneCtrl', function ($translate, $scope, $timeout, $q, Restangular, UserService, PHONE_TYPE, $rootScope) {
  getPhoneInfo();
  $scope.getCompany();

  $scope.formPreventDefault = function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  }

  $scope.savePhoneInfoEnter = function (event) {
    if (event.keyCode == 13) {
      event.target.blur();
      $scope.savePhoneInfo(event);
    }
  }

  $scope.selectPhone = function (phone) {
    $scope.phoneSelected = phone;
    if (phone.business_organization) {
      $scope.showBusName = true;
    } else {
      $scope.showBusName = false;
    }
    angular.forEach($scope.phonetype, function (value) {
      if (value.id == $scope.phoneSelected.phone_number_type_id) {
        $scope.phoneName = value.name;
      }
    });
  };

  $scope.showpersonal = true;
  $scope.showbusiness = false;
  $scope.phonetype = PHONE_TYPE;

  $scope.newPhone = function () {
    $('.ui.form').form('clear');
    // reset variable
    $scope.showBusName = false;
    $scope.phoneSelected = {
      business_organization_id: '',
      number: '',
      phone_number_type_id: '',
      id: ''
    };
  };

  $scope.removePhone = function (phone) {
    if ($scope.showbusiness) {
      var par = {
        business_organization_id: phone.business_organization_id
      }
      return Restangular.one('account/phone-number', phone.id).remove(par); // send delete request
    } else if ($scope.showpersonal) {
      return Restangular.one('account/phone-number', phone.id).customDELETE(); // send delete request
    }
  };
  // confirm delete
  $scope.confirmDeletePhone = function () {
    var queueLength = $scope.deleteQueue.length;
    var errorMsg;

    var requestQueue = [];
    angular.forEach($scope.deleteQueue, function (value, key) {
      requestQueue.push($scope.removePhone(value.phone));
    });
    // wait all promises
    $q.all(requestQueue).then(function (success) {
      msg = {
        header: 'tab_phone_deleted_success'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      getPhoneInfo();

    }, function (failed) {
      msg = {
        header: failed.data.message
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  };

  $scope.phoneValidation = function () {
    var translation = $translate.instant(['tab_phone_setting_company_error', 'tab_phone_setting_number_error', 'tab_phone_setting_notvalidnumber_error']);

    $('.phone-number-form.ui.form').form({
      company_select: {
        identifier: 'company_select',
        rules: [{
          type: 'empty',
          prompt: translation.tab_phone_setting_company_error
        }]
      },
      number: {
        identifier: 'number',
        rules: [{
          type: 'empty',
          prompt: translation.tab_phone_setting_number_error
        }, {
          type: 'integer',
          prompt: translation.tab_phone_setting_notvalidnumber_error
        }]
      }
    }, {
        inline: true,
        keyboardShortcuts: true,
        onSuccess: function () {
          $scope.valcheck = $scope.valcheck && true;
        },
        onFailure: function () {
          $scope.valcheck = $scope.valcheck && false;
        }
      }).form('validate form');
  }

  $scope.savePhoneInfo = function (event) {
    $scope.valcheck = true;
    $scope.phoneValidation();

    if ($scope.valcheck) {
      angular.element(event.target).addClass("disabled");
      msg = {
        'loading': true,
        'loading_message': 'in_progress'
      }
      $rootScope.floatingMessage = msg;
      var request;

      if ($scope.phoneSelected.id) {
        request = Restangular.one('account/phone-number', $scope.phoneSelected.id).customPUT($scope.phoneSelected);
      } else {
        request = Restangular.one('account/phone-number').customPOST($scope.phoneSelected);
      }
      request.then(function (success) {
        $('#setting-add-phone').modal('hide');
        msg = {
          header: 'tab_phone_saved_success'
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        angular.element(event.target).removeClass("disabled");
        getPhoneInfo();
      }, function (failed) {
        $('#setting-add-phone').modal('hide');
        msg = {
          header: failed.data.message
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        angular.element(event.target).removeClass("disabled");
      });
    }
  };

  $scope.phoneTypeSelected = function (id) {
    $scope.phoneSelected.phone_number_type_id = id;
  }

  $scope.selectCompany = function (id) {
    $scope.phoneSelected.business_organization_id = id;

  }
  $scope.showPersonal = function (id) {
    if (id == 'p') {
      setTimeout(function () {
        $('#Npersonalbtn').addClass('positive');
        $('#Nbusinessbtn').removeClass('positive');
      }, 50);
      $scope.showpersonal = true;
      $scope.showbusiness = false;
    }
    if (id == 'b') {
      setTimeout(function () {
        $('#Nbusinessbtn').addClass('positive');
        $('#Npersonalbtn').removeClass('positive');
      }, 50);
      $scope.showpersonal = false;
      $scope.showbusiness = true;
    }
  }

  function getPhoneInfo() {
    // request for account address info
    Restangular.one('account/phone-number').customGET().then(function (success) {
      $scope.personal_number = success.personal;
      $scope.business_number = success.business;
      if (success.personal) {
        $scope.showadd = true;
        $scope.showPersonal('p');
      } else if (success.business) {
        $scope.showadd = true;
        $scope.showPersonal('b');
      }
    });
  }
});
/*======================================================================*/
/*--------------------------- Account Settings -------------------------*/
/*======================================================================*/
app.controller('AccountCtrl', function ($translate, $scope, UserService, Restangular, $location, $timeout, $rootScope) {
  function errorHandling(failed) {
    var msg = {
      'header': ""
    }
    if (failed.data) {
      if (failed.data.errors) {
        for (var prop in failed.data.errors) {
          msg.header = failed.data.errors[prop][0].code;
          break;
        }
      } else if (failed.data.type) {
        msg.header = 'invalid_request_error'

      } else {
        msg.header = failed.data.code;
      }
      $rootScope.floatingMessage = msg;
    }
  }

  if (!UserService.isLoggedIn()) {
    $location.path('/');
  }
  $scope.formData = {};
  $scope.formData.email = UserService.email;
  window.a = $scope;
  $scope.showPassword = false;

  $scope.toggleContent = function () {
    $scope.showPassword ^= true;
  };

  $scope.accountValidation = function () {
    var translation = $translate.instant(['tab_account_setting_old_pw_error', 'tab_account_setting_pw_error', 'tab_account_setting_pw_match_error']);

    $('.account-form.ui.form').form({
      current_password: {
        identifier: 'current_password',
        rules: [{
          type: 'empty',
          prompt: translation.tab_account_setting_old_pw_error
        }]
      },
      new_password: {
        identifier: 'new_password',
        rules: [{
          type: 'empty',
          prompt: translation.tab_account_setting_pw_error
        }]
      },
      confirm_password: {
        identifier: 'confirm_password',
        rules: [{
          type: 'empty',
          prompt: translation.tab_account_setting_pw_error
        }, {
          type: 'match[new_password]',
          prompt: translation.tab_account_setting_pw_match_error
        }]
      }
    }, {
        inline: true,
        keyboardShortcuts: true,
        onSuccess: function () {
          $scope.valcheck = $scope.valcheck && true;
        },
        onFailure: function () {
          $scope.valcheck = $scope.valcheck && false;
        }
      }).form('validate form');
  }

  $scope.changePassword = function () {
    $scope.valcheck = true;
    $scope.accountValidation();
    $rootScope.scrollToError();

    if ($scope.valcheck) {
      var data = {
        password_old: $scope.formData.old_password,
        password: $scope.formData.new_password,
        password_confirm: $scope.formData.confirm_password,
      }
      Restangular.one('account').customPUT(data).then(
        function (success) {
          var msg = {
            header: 'tab_account_setting_pw_reset_success'
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();

        },
        function (failed) {
          errorHandling(failed);
        }
      );
    }
  };


  function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
  }

  $scope.sentChangeEmail = function () {

    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;

    Restangular.one('account').one('email').customPOST().then(
      function (success) {
        msg = {
          'header': "tab_profile_setting_email_change_instructions",
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();

      });
  }
});