app.controller('UserProfileCtrl', function($q, $route, $routeParams, $rootScope, $location, $scope, $timeout, $translate, Geolocator, UserService, Restangular, CreateCampaignService, FileUploadService, PortalSettingsService, PHONE_TYPE, API_URL) {

  $(document).on("keydown", ".select2 .select2-search input", prevent_default_enter_key);

  $scope.truliooEnabled = true;

  $scope.uid = UserService.person_type_id;

  function prevent_default_enter_key($event) {
    if ($event.keyCode == 13) {
      return false;
    }
  }

  $scope.organization_name = {};

  $scope.clearMessage = function() {
    $rootScope.floatingMessage = [];
  }
  var msg;

  function saveMsg() {
    //$scope.clearMessage();
    msg = {
      'header': "success_message_save_changes_button",
    }
    $rootScope.floatingMessage = msg;
    $scope.hideFloatingMessage();
  }

  $scope.campaign = {};
  $scope.manager = {};
  $scope.customlinks = [];
  $scope.selectedCity = {};
  $scope.currentPath = $location.path().split("/")[1];

  // For single manager only for now
  var campaignManagerId = [];
  var paramID = {
    person_id: "",
    business_organization_id: ""
  };
  // This is to save temp business info when switch to add new company from selecting existed company
  var tempBusInfo = {};
  $scope.businessImage = [];
  $scope.businessnumber = false;
  $scope.selectedCity = {};
  $scope.selectedSubcountry = {};
  $scope.selectedCountry = {};
  $scope.company = {};
  $scope.stepTwo = false;

  // load portal settings to see which mode is allowed for campaign creation
  PortalSettingsService.getSettingsObj().then(function(success) {
    $scope.public_settings = success.public_setting;
    $scope.native_lookup = success.public_setting.site_theme_shipping_native_lookup;
    $scope.contributionEnabled = success.public_setting.site_campaign_contributions;
    $scope.isStepFundingDelayed = success.public_setting.site_theme_campaign_delayed_funding_setup;
    $scope.isRemoveUserProfileBio = success.public_setting.site_remove_user_profile_bio;
    $scope.isFieldDisplayStacked = success.public_setting.site_campaign_creation_field_display_stacked;
    $scope.hideAllCampaignRewardsFields = success.public_setting.site_campaign_creation_hide_campaign_rewards_fields;
    $scope.splitUserNameAddressToSteps = success.public_setting.site_campaign_creation_split_profile_name_address_fields_to_steps;
    $scope.makeUserProfileAddressRequired = success.public_setting.site_campaign_creation_make_user_profile_address_required;
    $scope.displayPrevButtonHeader = success.public_setting.site_campaign_creation_display_previous_button_on_header;
    $scope.isStepRewardDelayed = success.public_setting.site_theme_campaign_delayed_reward_setup;
    // $scope.displayLaunchCampaignOnStep4 = success.public_setting.site_campaign_creation_launch_campaign_on_step4;
    $scope.bankFormEnabled = $scope.public_settings.site_campaign_country_funding_step;

    $scope.nextStepUrl = "complete-funding/" + $routeParams.campaign_id;

    if ($scope.public_settings.site_theme_campaign_show_reward_section) {
      if (($scope.hideAllCampaignRewardsFields || typeof $scope.hideAllCampaignRewardsFields !== 'undefined') && ($scope.showCampaignDescription || typeof $scope.hideAllCampaignRewardsFields !== 'undefined')) {
        $scope.thirdStepPath = 'story';
      } else {
        $scope.thirdStepPath = 'rewards';
      }

      $scope.backUrl = $scope.thirdStepPath + "/" + $routeParams.campaign_id;
    } else {
      $scope.backUrl = "campaign-setup/" + $routeParams.campaign_id;
    }


    if ($scope.public_settings.site_payment_gateway == 2) {
      $scope.nextStepUrl = "campaign-preview/" + $routeParams.campaign_id;
    }
    $scope.direct_transaction = success.public_setting.site_campaign_fee_direct_transaction;
    if ($scope.direct_transaction) {
      $scope.nextStepUrl = "campaign-preview/" + $routeParams.campaign_id;
    }
    if ($scope.bankFormEnabled) {
      $scope.nextStepUrl = "complete-funding/" + $routeParams.campaign_id;
    }
    $scope.default_country = success.public_setting.site_theme_default_shipping_country;
    $scope.alt_shipping = success.public_setting.site_theme_alt_shipping_layout;
    // Check alternative shipping setting
    if ($scope.alt_shipping) {
      getCountries();
    }
    if ($routeParams.campaign_id) {
      loadCampaign();
    }

    if(API_URL.identity_proxy_url == undefined && $scope.public_settings.site_verification.toggle) {
      $scope.truliooEnabled = false;
      msg = {
        header: 'tab_address_missing_proxy'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }
  
  });

  $scope.userProfileAddressValidation = function() {
    var translation = $translate.instant(['profile_setup_address_1_prompt', 'profile_setup_address_mail_code_prompt']);

    if($scope.profile_type_id === 1){
      $('.ui.form#user-profile-form').form({
        address1: {
          identifier: 'address1',
          rules: [{
            type: 'empty',
            prompt: translation.profile_setup_address_1_prompt
          }]
        },
        mail_code: {
          identifier: 'mail_code',
          rules: [{
            type: 'empty',
            prompt: translation.profile_setup_address_mail_code_prompt
          }]
        }
      }, {
        inline: true,
        onSuccess: function() {
          $scope.valcheck = true;
        },
        onFailure: function() {
          $scope.valcheck = false;
        }
      }).form('validate form');
   }

  }

  $scope.inlineUserProfileAddressValidation = function() {
    var translation = $translate.instant(['profile_setup_address_city_prompt', 'profile_setup_address_country_prompt', 'profile_setup_address_sub_country_prompt']);

    if ($('#user-address-select-country .select2-choice').hasClass('select2-default')) {
      $('#select-user-country .select-error').remove();
      $('#select-user-country').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.profile_setup_address_country_prompt + '</div>');
      $('#select-user-country').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }
    if ($('#user-address-select-subcountry .select2-choice').hasClass('select2-default') && $scope.selectedCountry.selected) {
      $('#select-user-subcountry .select-error').remove();
      $('#select-user-subcountry').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.profile_setup_address_sub_country_prompt + '</div>');
      $('#select-user-subcountry').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }
    if ($('#user-address-select-city .select2-choice').hasClass('select2-default') && $scope.selectedSubcountry.selected) {
      $('#select-user-city .select-error').remove();
      $('#select-user-city').append('<div class="select-error ui red pointing prompt label transition visible">' + translation.profile_setup_address_city_prompt + '</div>');
      $('#select-user-city').addClass('error');
      $scope.valcheck = $scope.valcheck && false;
    }
  }

  $scope.customFieldDropdown = function(option, field, name) {
    field.value = option;
    if (name) {
      $timeout(function() {
        $("#field_" + name).dropdown('set selected', option);
      }, 0);
    }
  }

  $scope.phonetype = PHONE_TYPE;
  // Translate phone type, even on refresh
  var trans_array = [];
  angular.forEach(PHONE_TYPE, function(value) {
    trans_array.push(value.name);
  });

  $translate(trans_array).then(function(translation) {
    angular.forEach(translation, function(value, key) {
      for (var i = 0; i < $scope.phonetype.length; i++) {
        if ($scope.phonetype[i].name == key) {
          $scope.phonetype[i].name = value;
        }
      }
    });
  });


  // initiate profile type view
  var profile_type_translation = $translate.instant(["profile_setup_toggle_view_on_campaign_both", "profile_setup_toggle_view_on_campaign_business",
    "profile_setup_toggle_view_on_campaign_user", "Individual User Profile", "Business Organization Profile"
  ]);

  // initiate profile types
  $scope.profileTypes = [{
    name: profile_type_translation['Individual User Profile'],
    profile_type_id: 1,
  }, {
    name: profile_type_translation['Business Organization Profile'],
    profile_type_id: 2,
  }];

  $scope.profileTypesView = [{
    name: profile_type_translation.profile_setup_toggle_view_on_campaign_both,
    profile_type_view_id: 0,
  }, {
    name: profile_type_translation.profile_setup_toggle_view_on_campaign_business,
    profile_type_view_id: 1,
  }, {
    name: profile_type_translation.profile_setup_toggle_view_on_campaign_user,
    profile_type_view_id: 2,
  }];

  $scope.profileTypeViewSelected = function(typeID) {
    $scope.campaign.profile_type_view_id = typeID;
    toggleProfileTypeViewText();
  };

  $scope.toggleProfileTypeViewText = function() {
    toggleProfileTypeViewText();
  };

  function toggleProfileTypeViewText() {
    //Profile View Text
    var profile_type_text_translation = $translate.instant(["profile_setup_toggle_view_on_campaign_both_text", "profile_setup_toggle_view_on_campaign_user_text", "profile_setup_toggle_view_on_campaign_business_text"]);
    if ($scope.campaign.toggle_profile_type_view_advance) {
      if ($scope.campaign.profile_type_view_id == 0) {
        $scope.profile_type_view_text = profile_type_text_translation.profile_setup_toggle_view_on_campaign_both_text;
      } else if ($scope.campaign.profile_type_view_id == 1) {
        $scope.profile_type_view_text = profile_type_text_translation.profile_setup_toggle_view_on_campaign_business_text;
      } else {
        $scope.profile_type_view_text = profile_type_text_translation.profile_setup_toggle_view_on_campaign_user_text;
      }
    } else {
      if (!$scope.campaign.business_organizations) {
        $scope.profile_type_view_text = profile_type_text_translation.profile_setup_toggle_view_on_campaign_user_text;
      } else {
        $scope.profile_type_view_text = profile_type_text_translation.profile_setup_toggle_view_on_campaign_both_text;
      }
    }
  }

  // false to show add new company form, true to choose existing company
  $scope.companyFormToggle = false;
  $scope.newCompany = {};
  $scope.newCompanyLogoID = "";
  var imageFiles = {};
  getNotes();
  // get all the existing companies created by the user
  // to generate the dropdown selection

  function getCompany() {
    Restangular.one('account/business').customGET(paramID.business_organization_id).then(function(success) {
      $scope.companies = success;
      if ($scope.companies.length != 0) {
        $scope.companyFormToggle = true;
      } else {
        $scope.companyFormToggle = false;
      }
    });
  }

  $scope.profileTypeSelected = function(typeID) {
    if ($scope.campaign.profile_type_id != typeID) {
      clearAddress();
    }
    // Default phone number type will be first item in dropdown
    $(".profile-type .text").text($scope.profileTypes[typeID - 1].name);
    $scope.campaign.profile_type_id = typeID;
    toggleProfileTypeViewText();
    if ($scope.campaign.business_organizations) {
      checkAddress($scope.campaign.profile_type_id, $scope.campaign.business_organizations[0].business_organization_id);
    } else {
      checkAddress($scope.campaign.profile_type_id, 0);
    }

  };
  $scope.phoneInfo = {
    number: '',
    phone_number_type_id: '',
    business_organization_id: '',
    person_id: ''
  }
  $scope.phoneTypeSelected = function(type) {
    $scope.phoneInfo.phone_number_type_id = type;
  }

  function loadCampaign() {
    // load campaign
    CreateCampaignService.load($routeParams.campaign_id).then(function(success) {
      // Emit event for hiding loader.
      $scope.$emit("loading_finished");

      $scope.campaign = success;

      if($scope.isStepRewardDelayed && success.ever_published == false){
        $scope.backUrl = "campaign-setup/" + $routeParams.campaign_id;
      }

      //Default value for Profile Advanced Display
      if (!$scope.campaign['profile_type_view_id']) {
        $scope.campaign['profile_type_view_id'] = "0";
      }

      // Grab Campaign Settings to use
      angular.forEach($scope.campaign.settings, function(value, index) {
        var setting_name = value.name;
        var setting_value = value.value;
        $scope.campaign[setting_name] = setting_value;
      });
      if (!$scope.contributionEnabled || $scope.isStepFundingDelayed && !$scope.campaign.ever_published) {
        $scope.nextStepUrl = "/campaign-preview/" + $routeParams.campaign_id;
      }
      //Show profile type message
      toggleProfileTypeViewText();
      Restangular.one('campaign', $routeParams.campaign_id).one('stripe-account').customGET().then(function(stripe) {
        if (stripe.length)
          $scope.campaign.stripe_account_id = stripe[0].id;
      });
      // find the current manager. for later version there will have mutiple managers for one campaign
      angular.forEach($scope.campaign.managers, function(value, index) {
        campaignManagerId[index] = value.id;
        $scope.manager = value;
        if (value.person_websites) {
          $scope.customlinks = value.person_websites;
          // Remove http protocols from existing links
          for (var n in $scope.customlinks) {
            var current_profile_link = $scope.customlinks[n].uri;
            if (current_profile_link != "undefined") {
              for (var i in $scope.profile_protocols) {
                var indexOf = current_profile_link.indexOf($scope.profile_protocols[i].value);
                if (indexOf > -1) {
                  $scope.customlinks[n].uri = current_profile_link.replace($scope.profile_protocols[i].value, "");
                  $scope.customlinks[n].profile_link_default_protocol = $scope.profile_protocols[i].value;
                  break;
                } else {
                  $scope.customlinks[n].profile_link_default_protocol = $scope.profile_protocols[2].value;
                }
              }
            }
          }
        }
      }); 

      //prefill business (prefilling one for now)
      if ($scope.campaign.business_organizations) {

        if ($scope.campaign.business_organizations.length) {
          $scope.companyFormToggle = true;
        }
        $scope.company_selected = $scope.campaign.business_organizations[0].business_organization_id;
        paramID.business_organization_id = $scope.campaign.business_organizations[0].business_organization_id;
        $scope.getBusinessLinks($scope.company_selected);
        $scope.getBusinessImage();
        $scope.getBusinessNameDescription($scope.company_selected);
        $('#default-ctext').text($scope.campaign.business_organizations[0].name);
      }
      // For now, there is only 1 manager
      // Check condition, if this array has items, have paramID's person_id to have this value
      if (campaignManagerId.length == 1) {
        paramID.person_id = campaignManagerId[0];
        getCompany();
      }
      getAddress(paramID)
      getPhoneNumber(paramID);
      $scope.businessLinks = [];
      initBusiness();

      // get custom fields
      $scope.custom_field = [];
      Restangular.one('portal/person/attribute?filters={"person_id":"' + $scope.manager.person_id + '"}').customGET().then(function(success) {
        if (success) {
          $scope.custom_field = success;
        }

        // Organization Name & EIN custom fields
        if ($scope.public_settings.site_campaign_enable_organization_name && $scope.custom_field[0].attributes) {
          $scope.organization_name.value = $scope.custom_field[0].attributes['organization_name'];
          $scope.organization_name.ein = $scope.custom_field[0].attributes['ein'];

          // set default view, show profile only
          $scope.campaign.toggle_profile_type_view_advance = true;
          $scope.campaign.profile_type_view_id = 2;
          toggleProfileTypeViewText();
        }

        //business fields
        if ($scope.public_settings.site_campaign_business_section_custom) {
          if ($scope.public_settings.site_campaign_business_section_custom.length > 0) {
            $scope.bcustom = [];
            angular.forEach($scope.public_settings.site_campaign_business_section_custom, function(value) {
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
              angular.forEach($scope.custom_field[0].attributes, function(val, key, obj) {
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
            angular.forEach($scope.public_settings.site_campaign_personal_section_custom, function(value, key) {
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

              // Compare if key matches setting.name
              angular.forEach($scope.custom_field[0].attributes, function(val, key, obj) {
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

      });
    });
  }

  /*
      Pass paramID to GET request, if person_id on paramID has value, request will return info associated with that id
      If not, it will grab whoever is signed in
      paramID is to specify this function to grab info from the campaign manager
      @params paramID - An object that contains person_id and business_organization_id
   */
  function getAddress(paramID) {
    Restangular.one('account/').customGET('address', paramID).then(function(success) {
      if (success) {
        $scope.personal_address = success.personal;
        $scope.bussiness_address = success.business;
        if ($scope.bussiness_address) {
          $scope.baddress_present = true;
        } else {
          $scope.baddress_present = false;
        }
        if ($scope.personal_address) {
          $scope.paddress_present = true;
        } else {
          $scope.paddress_present = false;
        }
        if ($scope.campaign.business_organizations) {
          checkAddress($scope.campaign.profile_type_id, $scope.campaign.business_organizations[0].business_organization_id);
        } else {
          checkAddress($scope.campaign.profile_type_id, 0);
        }

      } else {
        $scope.setCountry($scope.selectedCountry.selected);
        if ($scope.selectedCountry.selected != null && Object.getOwnPropertyNames($scope.selectedCountry.selected).length) {
          getSubcountries($scope.selectedCountry.selected.id);
        }
      }
    });
  }

  /*
      Get phone number for individual and business
      paramID is to specify this function to grab info from the campaign manager
      @params paramID - An object that contains person_id and business_organization_id
   */
  function getPhoneNumber(paramID) {
    Restangular.one('account/').customGET('phone-number', paramID).then(function(success) {

      if (success.personal) {
        $scope.personalnumber = true;
        $scope.phoneInfo.number = success.personal[0].number;
        // $scope.personal_number = success.personal[0].number;
        $scope.pid = success.personal[0].phone_number_type_id;
        $scope.pphone_number_id = success.personal[0].phone_number_id;
        $scope.Ptype = checktype(success.personal[0].phone_number_type_id);
        $('#ptype').text($scope.Ptype);
      }
      if (success.business) {
        $scope.BusinessNumbers = success.business;
        if ($scope.campaign.business_organizations) {
          checkNumber($scope.campaign.business_organizations[0].business_organization_id);
        } else {
          checkNumber(0);
        }
      }
      if ($scope.campaign.profile_type_id == 2) {
        $scope.phoneInfo.phone_number_type_id = $scope.bid;
      } else {
        $scope.phoneInfo.phone_number_type_id = $scope.pid;
      }
    });
  }

  function checkNumber(id) {
    var count = 0;
    angular.forEach($scope.BusinessNumbers, function(v) {
      if (v.business_organization_id == id) {
        $scope.businessnumber = true;
        $scope.business_number = v.number;
        $scope.bid = v.phone_number_type_id;
        $scope.Btype = checktype(v.phone_number_type_id);
        $scope.bphone_number_id = v.phone_number_id;
        $('#btype').text($scope.Btype);
        count = count - $scope.BusinessNumbers.length;
      }
      count++;
      if ($scope.BusinessNumbers.length == count) {
        $scope.businessnumber = false;
        $scope.business_number = '';
        $scope.bid = '';
        $scope.Btype = '';
        $scope.bphone_number_id = '';
      }
    });
  }

  function checktype(id) {
    var type;
    angular.forEach($scope.phonetype, function(value) {
      if (value.id == id) {
        type = value.name;
      }

    });
    return type;
  }

  function checkAddress(id, bID) {
    $scope.address_ID = "";
    $('#bselect_city').text("");
    if (id == 2) {
      if ($scope.bussiness_address) {
        var count = 0;
        angular.forEach($scope.bussiness_address, function(value) {
          if (value.business_organization_id == bID) {
            $scope.address_ID = value.address_id;
            $scope.baddress = {
              city_id: value.city_id,
              mail_code: value.mail_code,
              street1: value.street1,
              street2: value.street2,
              country_id: value.country_id,
            };
            var business_address = $scope.native_lookup == true ? getNativeName(value) : value;
            $scope.selectedCity.selected = value.city_full;
            if ($scope.alt_shipping) {
              var countryObj = {
                "country": business_address.country,
                "name": business_address.country,
                "country_id": business_address.country_id,
                "id": business_address.country_id,
                "country_native_name": business_address.country_native_name
              }
              var subcountryObj = {
                "subcountry": business_address.subcountry,
                "name": business_address.subcountry,
                "subcountry_id": business_address.subcountry_id,
                "id": business_address.subcountry_id,
                "subcountry_native_name": business_address.subcountry_native_name
              }
              var cityObj = {
                "city": business_address.city,
                "name": business_address.city,
                "city_id": business_address.city_id,
                "id": business_address.city_id,
                "city_native_name": business_address.city_native_name
              }
              $scope.selectedCountry.selected = countryObj;
              $scope.setCountry($scope.selectedCountry.selected);
              $scope.selectedSubcountry.selected = subcountryObj;
              $scope.selectedCity.selected = cityObj;
            } else {
              $('#bselect_city').text($scope.selectedCity.selected);
            }
            count = count - $scope.bussiness_address.length;
          }
          count++;
          if ($scope.bussiness_address.length == count) {
            $scope.baddress = {
              city_id: '',
              mail_code: '',
              street1: '',
              street2: '',
              country_id: '',
            };
          }
        });
      }
    } else if ($scope.personal_address) {
      $scope.address = {
        city_id: $scope.personal_address[0].city_id,
        mail_code: $scope.personal_address[0].mail_code,
        street1: $scope.personal_address[0].street1,
        street2: $scope.personal_address[0].street2,
        country_id: $scope.personal_address[0].country_id,
        address_id: $scope.personal_address[0].address_id
      };
      var personalAddress = $scope.personal_address[0];
      personalAddress = $scope.native_lookup == true ? getNativeName(personalAddress) : personalAddress;

      $scope.selectedCity.selected = personalAddress.city_full;
      if ($scope.alt_shipping) {
        var countryObj = {
          "country": personalAddress.country,
          "name": personalAddress.country,
          "country_id": personalAddress.country_id,
          "id": personalAddress.country_id,
          "country_native_name": personalAddress.country_native_name
        }
        var subcountryObj = {
          "subcountry": personalAddress.subcountry,
          "name": personalAddress.subcountry,
          "subcountry_id": personalAddress.subcountry_id,
          "id": personalAddress.subcountry_id,
          "subcountry_native_name": personalAddress.subcountry_native_name
        }
        var cityObj = {
          "city": personalAddress.city,
          "name": personalAddress.city,
          "city_id": personalAddress.city_id,
          "id": personalAddress.city_id,
          "city_native_name": personalAddress.city_native_name
        }
        $scope.selectedCountry.selected = countryObj;
        $scope.setCountry($scope.selectedCountry.selected);
        $scope.selectedSubcountry.selected = subcountryObj;
        $scope.selectedCity.selected = cityObj;
      } else {
        $('#select_city').text($scope.selectedCity.selected);
      }
    }
  }

  function getNativeName(addressObj) {
    var name = "";
    if (addressObj.country_native_name != null) {
      name += addressObj.country_native_name;
      addressObj.country = addressObj.country_native_name;
    } else {
      name += addressObj.country;
    }
    if (addressObj.subcountry_native_name != null) {
      name += " " + addressObj.subcountry_native_name;
      addressObj.subcountry = addressObj.subcountry_native_name;
    } else {
      name += " " + addressObj.subcountry;
    }
    if (addressObj.city_native_name != null && addressObj.city != "Other") {
      name += ", " + addressObj.city_native_name;
      addressObj.city = addressObj.city_native_name;
    } else if (addressObj.city != "Other") {
      name += ", " + addressObj.city;
    } else {
      addressObj.city = "";
    }
    addressObj.city_full = name;
    addressObj.name = name;
    return addressObj;
  }

  function getCountries() {
    Geolocator.getCountries().then(function(countries) {
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
    Geolocator.getSubcountriesByCountry(countryID).then(function(subcountries) {
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

  $scope.setCountry = function(country) {
    $scope.selectedCountry.selected = country;
  }

  function clearAddress() {
    $scope.selectedCity.selected = undefined;
    $scope.selectedSubcountry.selected = undefined;
    $scope.selectedCountry.selected = undefined;
    $scope.shipOptions = [];
    $scope.address.mail_code = "";
    $scope.address.street1 = "";
    $scope.address.street2 = "";
  }

  $scope.CompanyAddress = function(add) {
      clearAddress();
      checkAddress(2, add.business_organization_id);
      checkNumber(add.business_organization_id);
      $scope.company_selected = add.business_organization_id;
      $scope.getBusinessImage();
      $scope.getBusinessLinks(add.business_organization_id);
    }
    // set up objects to send through POST
  $scope.address = {
    city_id: '',
    mail_code: '',
    street1: '',
    street2: '',
    country_id: '',
    address_id: '',
    person_id: ''
  };
  $scope.baddress = {
    city_id: '',
    mail_code: '',
    street1: '',
    street2: '',
    country_id: '',
    business_organization_id: '',
    person_id: ''
  };

  $scope.getBusinessNameDescription = function(bid) {
    Restangular.one("account/business", bid).customGET().then(function(success) {
      var business = {};
      if (success[0]) {
        business = success[0];
      }
      if (success) {
        business = success;
      }

      $scope.company.name = business.name;
      $scope.company.description = business.description;
    });
  }

  // get links that is related to a business
  $scope.getBusinessLinks = function(businessId) {
    Restangular.all('account/website?business_organization_id=' + businessId).customGET().then(function(success) {
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
    }, function(failure) {
      $scope.businessLinks = [];
    });
  }

  // Default business
  if (!$scope.company_selected) {
    $scope.company_selected = {
      business_organization_id: '',
      description: '',
      name: '',
    }
  };

  // add more business link
  $scope.addBusinessLink = function(arr) {
    /*    if(!$scope.company_selected.business_organization_id){
          $scope.company_selected.business_organization_id = $scope.company_selected;
        }*/
    var link = {
      uri: '',
      uri_text: '',
      business_organization_id: $scope.company_selected,
    };
    if (angular.isUndefined(arr))
      $scope.businessLinks.push(angular.copy(link));
    else
      arr.push(angular.copy(link));
  };

  // remove links
  $scope.removeBusinessLink = function(link) {
    if (link.uri_id) {
      Restangular.one('account/website').customDELETE(link.uri_id, {
        business_organization_id: link.business_organization_id
      }).then(function(success) {
        $scope.businessLinks.splice($scope.businessLinks.indexOf(link), 1); // delete the item from the list
      }); // send delete request
    } else {
      $scope.businessLinks.splice($scope.businessLinks.indexOf(link), 1);
    }
  };

  // save the links
  function saveBusinessLinks(business_id, Protocols) {
    if (!Protocols) {
      var selectedProtocols = $(".dropdown.business-link-setup").dropdown("get text");
    } else {
      var selectedProtocols = Protocols;
    }
    angular.forEach($scope.businessLinks, function(link, key) {
      // Concate the selected protocol to the user entered link/path.
      var new_link = {};

      for (var prop in link) {
        new_link[prop] = link[prop];
        if (business_id) {
          new_link.business_organization_id = business_id;
        }
      }

      // if protocol is not Relative
      if (Array.isArray(selectedProtocols)) {
        if (selectedProtocols[key] == "Relative Path") {
          new_link.uri = link.uri;
        } else {
          link.uri = link.uri.replace(/^https?\:\/\//i, "");
          new_link.uri = selectedProtocols[key] + link.uri;
        }
      } else {
        if (selectedProtocols == "Relative Path") {
          new_link.uri = link.uri;
        } else {
          link.uri = link.uri.replace(/^https?\:\/\//i, "");
          new_link.uri = selectedProtocols + link.uri;
        }
      }
      // send request if fields are not blank
      if (new_link.uri) {
        if (new_link.uri_id) // if there is an id, send PUT request to update
        {
          Restangular.one('account/website', new_link.uri_id).customPUT(new_link);
        } else // else send POST to create new
        {
          link.business_organization_id = $scope.company_selected;
          Restangular.one('account/website').customPOST(new_link);
        }
      }
    });
  }

  //Regex Form Validation
  $.fn.form.settings.rules.regexCustomValidation = function(value, validate) {
    var regex = new RegExp(validate);
    if (!value) {
      return true;
    }
    if (regex)
      return regex.test(value);
    return false;
  }

  var personalValidation = function() {
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

    angular.forEach($scope.pcustom, function(value, key) {
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

    $('.ui.form#user-profile-form').form($scope.form_validation, {
      inline: true,
      keyboardShortcuts: true,
      onSuccess: function() {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function() {
        $scope.valcheck = $scope.valcheck && false;
        $scope.profileTypeSelected(1);
        $('html, body').animate({
          scrollTop: $(".field.error").offset().top
        }, 1000);
      }
    }).form('validate form');
    // return $scope.valcheck;
  }

  var businessValidation = function() {
    var translation = $translate.instant(['profile_setup_company_name_empty']);

    $scope.form_validation_business = {
      company_name: {
        identifier: 'company_name',
        rules: [{
          type: 'empty',
          prompt: translation.profile_setup_company_name_empty
        }]
      }
    };

    angular.forEach($scope.bcustom, function(value, key) {
      if (value.required) {
        var customValidate = {
          identifier: value.identifier,
          rules: [{
            type: 'empty',
            prompt: translation.profile_setup_organization_custom_field_empty
          }]
        }
        $scope.form_validation_business['customField' + key] = customValidate;
      }
    });

    $('.ui.form#business-profile-form').form($scope.form_validation_business, {
      inline: true,
      keyboardShortcuts: true,
      onSuccess: function() {
        $scope.valcheck = $scope.valcheck && true;
      },
      onFailure: function() {
        $scope.valcheck = $scope.valcheck && false;
        $scope.profileTypeSelected(2);
        $('html, body').animate({
          scrollTop: $(".field.error").offset().top
        }, 1000);
      }
    }).form('validate form');
    // return $scope.valcheck;
  }

  $translate(['profile_setup_name_terms_and_conditions']).then(function(translation) {
    if (translation.hasOwnProperty('profile_setup_name_terms_and_conditions') && translation.profile_setup_name_terms_and_conditions) {
      $('#terms-and-conditions').html(translation.profile_setup_name_terms_and_conditions);
      $('#terms-and-conditions').css('text-align', 'right');
    }
  });

  $scope.switchProfileStep = function($event) {
    $scope.valcheck = true;

    if ($scope.campaign.profile_type_id == 1) {
      personalValidation();
    }
    if ($scope.campaign.profile_type_id == 2) {
      businessValidation();
    }

    if ($event.currentTarget.id == "campaign-create-next-button") {
      $scope.originalPageTitle = $route.current.title;
      $timeout(function() {
        $translate($route.current.title + "2").then(function(translation) {
          $rootScope.page_title = translation != $scope.originalPageTitle + "2" ? translation : $scope.originalPageTitle;
          $rootScope.ogMeta.title = $rootScope.page_title;
        });
      }, 0);
    }

    if ($event.currentTarget.id == "campaign-create-prev-button") {
      $timeout(function() {
        $translate($scope.originalPageTitle).then(function(translation) {
          $rootScope.page_title = translation != null ? translation : $route.current.title;
          $rootScope.ogMeta.title = $rootScope.page_title;
        });
      }, 0);
    }

    if ($scope.valcheck) {
      $scope.stepTwo = !$scope.stepTwo;

      // change translation below 'next step' button
      $translate(['profile_setup_address_terms_and_conditions', 'profile_setup_name_terms_and_conditions']).then(function(translation) {
       if ($scope.stepTwo) {
          $('#terms-and-conditions').html(translation.profile_setup_address_terms_and_conditions);
        } else {
          $('#terms-and-conditions').html(translation.profile_setup_name_terms_and_conditions);
        }
      });
    }


  }

  $scope.saveData = function($event) {
    $scope.valcheck = true;

    if ($scope.campaign.profile_type_id == 1) {
      personalValidation();
    }
    if ($scope.campaign.profile_type_id == 2) {
      businessValidation();
    }

    if ($scope.makeUserProfileAddressRequired && typeof $scope.makeUserProfileAddressRequired !== 'undefined') {
      $scope.inlineUserProfileAddressValidation();
      $scope.userProfileAddressValidation();
    }
    $rootScope.scrollToError();
    if ($scope.valcheck) {

      // New profile type fields
      if ($scope.campaign.profile_type_id == 1) {
        var selectedProtocols = $(".dropdown.profile-link-protocol").dropdown("get text");
      } else {
        var selectedProtocols = $(".dropdown.business-link-setup").dropdown("get text");
      }
      var profile_type_data = {
        toggle_profile_type_view_advance: $scope.campaign.toggle_profile_type_view_advance,
        profile_type_view_id: $scope.campaign.profile_type_view_id,
        charity_id: $scope.campaign.charity_id
      }
      Restangular.one("campaign/" + $routeParams.campaign_id + "/setting").customPUT(profile_type_data).then(function(success) {
        msg = {
          'header': "success_message_save_changes_button",
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });

      var currentEle = $event.currentTarget;
      var navigating = $(currentEle).hasClass("save-campaign-button") ? false : true;

      var custom_setting = {};
      var j = 0;
      var i = 0;

      if ($scope.bcustom) {
        angular.forEach($scope.bcustom, function(v) {
          custom_setting[v.name] = v.value;
        });
      }
      if ($scope.pcustom) {
        angular.forEach($scope.pcustom, function(v) {
          custom_setting[v.name] = v.value;
        });
      }

      if ($scope.public_settings.site_campaign_enable_organization_name) {
        custom_setting['organization_name'] = $scope.organization_name.value;
        custom_setting['ein'] = $scope.organization_name.ein;
        if (custom_setting) {
          custom_setting = JSON.stringify(custom_setting);
        }
      }
      var customFieldData = {
        attributes: custom_setting
      }

      $scope.savePersonAttributes($scope.manager.person_id, customFieldData);

      if ($scope.campaign.profile_type_id == 2) {
        $scope.phoneInfo.number = $scope.business_number;
        // select from existing
        if ($scope.company_selected && $scope.companyFormToggle == true) {

          if ($scope.company.name) {
            $scope.company_selected['name'] = $scope.company.name;
          }
          if ($scope.company.description) {
            $scope.company_selected['description'] = $scope.company.description;
          }

          var data = {
            // business organization id takes an array
            business_organization_id: [$scope.company_selected],
            profile_type_id: $scope.campaign.profile_type_id,
            toggle_profile_type_view_advance: $scope.campaign.toggle_profile_type_view_advance
          };
          $scope.baddress.business_organization_id = $scope.company_selected;
          $scope.phoneInfo.business_organization_id = $scope.company_selected;
          $scope.baddress.person_id = paramID.person_id;
          $scope.phoneInfo.person_id = paramID.person_id;
          Restangular.one('campaign', $routeParams.campaign_id).customPUT(data).then(function(success) {
            CreateCampaignService.cacheIn(success.plain());
            if ($scope.address_ID && $scope.baddress.city_id && $scope.baddress.street1 != undefined && $scope.baddress.mail_code != undefined) {
              Restangular.one('account/address', $scope.address_ID).customPUT($scope.baddress);
            } else if ($scope.baddress.city_id && $scope.baddress.street1 != undefined && $scope.baddress.mail_code != undefined) {
              $scope.baddress.business_organization_id = $scope.company_selected;
              Restangular.one('account/address').customPOST($scope.baddress).then(function(success) {
                $scope.address_ID = success.id;
              });
            }
            if ($scope.businessnumber) {
              Restangular.one('account/phone-number', $scope.bphone_number_id).customPUT($scope.phoneInfo);
              $scope.businessnumber = true;
            } else if ($scope.phoneInfo.number != undefined && $scope.phoneInfo.number != "") {
              Restangular.one('account/phone-number').customPOST($scope.phoneInfo).then(function(success) {
                //checkNumber($scope.company_selected);
              });
            }
            var busParam = {
              description: $scope.company.description
            }
            busParam.name = $scope.company.name;

            //For some reason dropdown is removed from UI so this code is not needed anymore
            // for (var i in $scope.companies) {
            //   if ($scope.companies[i].id == $scope.company_selected) {
            //     busParam.name = $scope.companies[i].name;
            //     break;
            //   }
            // }

            //Save Business Link
            saveBusinessLinks($scope.company_selected, selectedProtocols);

            Restangular.one("account/business", $scope.company_selected).customPUT(busParam).then(function(success) {
              getCompany();
            });
          });
        }
        // add new company
        else if ($scope.companyFormToggle == false) {
          var data = {
            person_id: $scope.manager.id,
            name: $scope.newCompany.name,
            description: $scope.newCompany.description
          }

          // Parameters to be used for modifying image info
          if (!$scope.company_selected) {
            $scope.company_selected = "";
          }
          var fileParam = {
            person_id: paramID.person_id,
            business_organization_id: $scope.company_selected,
            resource_content_type: 'image'
          }
          if ($scope.companyFormToggle == false) {
            Restangular.one('account/business').customPOST(data).then(function(success) {
              data = {
                business_organization_id: [success.id],
                profile_type_id: $scope.campaign.profile_type_id,
                toggle_profile_type_view_advance: $scope.campaign.toggle_profile_type_view_advance
              }
              $scope.phoneInfo.business_organization_id = success.id;
              $scope.baddress.business_organization_id = success.id;
              $scope.phoneInfo.person_id = paramID.person_id;
              $scope.baddress.person_id = paramID.person_id;
              Restangular.one('campaign', $routeParams.campaign_id).customPUT(data).then(function(success) {
                CreateCampaignService.cacheIn(success.plain());
              });
              // After saving new company is done, change to existing company option
              $scope.companyFormToggle = true;
              $scope.company.description = $scope.newCompany.description;
              $scope.company.name = $scope.newCompany.name;
              $scope.newCompany = {};
              $scope.companies.push(success);
              // Save the current selected company id
              $scope.company_selected = success.business_organization_id;

              //Save Business Link
              saveBusinessLinks($scope.company_selected, selectedProtocols);

              if ($scope.baddress.city_id && $scope.baddress.street1 != undefined && $scope.baddress.screet1 != "") {
                Restangular.one('account/address').customPOST($scope.baddress).then(function(success) {
                  $scope.address_ID = success.id;
                });
              }
              if ($scope.business_number && $scope.business_number != undefined && $scope.business_number != "") {
                Restangular.one('account/phone-number').customPOST($scope.phoneInfo).then(function(success) {
                  //checkNumber($scope.company_selected);
                });
              }
              if ($scope.businessImage.length != 0) {
                $scope.businessImage = [];
                $scope.modifyBusinessImage(imageFiles, fileParam);
              }

            }, function(failure) {
              msg = {
                'header': failure.data.message
              }
              $rootScope.floatingMessage = msg;
              $scope.hideFloatingMessage();
            });
          } else {
            //Update existing business after uploading image
            $scope.baddress.business_organization_id = $scope.company_selected;
            $scope.phoneInfo.business_organization_id = $scope.company_selected;
            $scope.baddress.person_id = paramID.person_id;
            $scope.phoneInfo.person_id = paramID.person_id;
            Restangular.one('account/business', $scope.company_selected).customPUT(data).then(function(success) {
              if ($scope.address_ID && $scope.baddress.city_id && $scope.baddress.street1 != undefined && $scope.baddress.mail_code != undefined) {
                Restangular.one('account/address', $scope.address_ID).customPUT($scope.baddress);
              } else if ($scope.baddress.city_id && $scope.baddress.street1 != undefined && $scope.baddress.mail_code != undefined) {
                $scope.baddress.business_organization_id = $scope.company_selected;
                Restangular.one('account/address').customPOST($scope.baddress).then(function(success) {
                  $scope.address_ID = success.id;
                });
              }
              if ($scope.businessnumber) {
                Restangular.one('account/phone-number', $scope.bphone_number_id).customPUT($scope.phoneInfo);
                $scope.businessnumber = true;
              } else if ($scope.business_number != undefined && $scope.business_number != "") {
                Restangular.one('account/phone-number').customPOST($scope.phoneInfo);
              }
            }, function(failure) {
              msg = {
                'header': failure.data.message
              }
              $rootScope.floatingMessage = msg;
              $scope.hideFloatingMessage();
            });
          }
        }

      }
      if ($scope.campaign.profile_type_id === 1) {
        // Following action can only be processed by campaign manager or admin
        if (UserService.id == $scope.manager.id || UserService.person_type_id == 1) {
          var data = {
            profile_type_id: $scope.campaign.profile_type_id,
            toggle_profile_type_view_advance: $scope.campaign.toggle_profile_type_view_advance
          }
          Restangular.one("campaign", $routeParams.campaign_id).customPUT(data).then(function(success) {

            // $scope.phoneInfo.number = $scope.personal_number;
            $scope.phoneInfo.person_id = $scope.manager.person_id;
            // if campaign uses personal type profile
            // Send to server, then on success, updateUserData;
            var accountData = {
              first_name: $scope.manager.first_name,
              last_name: $scope.manager.last_name,
              bio: $scope.manager.bio
            };
            
            if (typeof $scope.public_settings.site_verification == "undefined") {
              $scope.public_settings.site_verification = { toggle: false};
            }
            
            if (typeof $scope.public_settings.social_login == "undefined") {
              $scope.public_settings.social_login = { toggle: false};
            }

            $scope.address.person_id = paramID.person_id;
            if (!$scope.paddress_present) {
              Restangular.one('account/address').customPOST($scope.address);
            } else if ($scope.address.city_id && $scope.address.street1 && $scope.address.mail_code) {
              Restangular.one('account/address', $scope.address.address_id).customPUT($scope.address);
            }

            savePhoneNumber();

            // if($scope.public_settings.site_verification.toggle) {
            //   $q.all([saveAddress(paramID.person_id), savePhoneNumber()]).then(function(result) {
            //     TruliooIdentityService.generateTruliooNeededFields(UserService).then(function(fields) {
            //       TruliooIdentityService.verifyTransaction(fields).then(function(success) {
            //         //Need to resave custom fields
            //         var custom_setting = {};
            //         if ($scope.bcustom) {
            //           angular.forEach($scope.bcustom, function(v) {
            //             custom_setting[v.name] = v.value;
            //           });
            //         }
            //         if ($scope.pcustom) {
            //           angular.forEach($scope.pcustom, function(v) {
            //             custom_setting[v.name] = v.value;
            //           });
            //         }

            //         if ($scope.public_settings.site_campaign_enable_organization_name) {
            //           custom_setting['organization_name'] = $scope.organization_name.value;
            //           custom_setting['ein'] = $scope.organization_name.ein;
            //         }

            //         custom_setting['trulioo_verified'] = success;

            //         if (custom_setting) {
            //           custom_setting = JSON.stringify(custom_setting);
            //         }
                    
            //         var customFieldData = {
            //           attributes: custom_setting
            //         }

            //         $scope.savePersonAttributes($scope.manager.person_id, customFieldData);
            //       });
            //     });
            //   });
            // } else {
            //   $scope.address.person_id = paramID.person_id;
            //   if (!$scope.paddress_present) {
            //     Restangular.one('account/address').customPOST($scope.address);
            //   } else if ($scope.address.city_id && $scope.address.street1 && $scope.address.mail_code) {
            //     Restangular.one('account/address', $scope.address.address_id).customPUT($scope.address);
            //   }

            //   savePhoneNumber();
            // }

            
            // Check admin user type id
            if (UserService.id == $scope.manager.id) {
              accountData.person_id = $scope.manager.person_id;
              Restangular.one('account').customPUT(accountData).then(function(success) {
                if (UserService.id == $scope.manager.id) {
                  UserService.updateUserData(accountData);
                }
              });
            } else if (UserService.person_type_id == 1) {
              accountData.person_id = $scope.manager.person_id;
              Restangular.one('portal/person', $scope.manager.person_id).customPUT(accountData);
            }
            saveProfileLinks(selectedProtocols);
          });
        }
      }
    } else {
      // Need to fill out required fields before moving on
      $event.preventDefault();
      msg = {
        'header': 'fail_message_save_changes_button'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      return false;
    }
  }

  $scope.savePersonAttributes = function(person_id, $data) {
    Restangular.one('portal/person/attribute', person_id).customPUT($data);
  }

  function savePhoneNumber() {
    if ($scope.personalnumber && $scope.pphone_number_id) {
      Restangular.one('account/phone-number', $scope.pphone_number_id).customPUT($scope.phoneInfo);
    } else if (!$scope.personalnumber) {
      Restangular.one('account/phone-number').customPOST($scope.phoneInfo);
    }
  }

  // HTTP protocols for Profile Links
  $scope.profile_protocols = [{
    value: "http://"
  }, {
    value: "https://"
  }, {
    value: "Relative Path"
  }];
  $scope.profile_link_default_protocol = $scope.profile_protocols[0];

  $scope.addLink = function(arr) {
    var link = {
      uri: '',
      uri_text: ''
    };
    if (angular.isUndefined(arr))
      return angular.copy(link);
    else
      return arr.push(angular.copy(link));
  };

  // remove links
  $scope.removeProfileLink = function(link, index) {
    // send delete request if id exists
    if (link.id) {
      Restangular.one('account/website', link.id).customDELETE().then(function(success) {
        // delete the item from the list
      });
    }
    $scope.customlinks.splice(index, 1);
  };

  function saveProfileLinks(Protocols) {
    if (!Protocols) {
      var selectedProtocols = $(".dropdown.profile-link-protocol").dropdown("get text");
    } else {
      var selectedProtocols = Protocols;
    }
    angular.forEach($scope.customlinks, function(link, key) {
      var new_link = {};

      for (var prop in link) {
        new_link[prop] = link[prop];
      }

      if (Array.isArray(selectedProtocols)) {
        if (selectedProtocols[key] != "Relative Path") {
          link.uri = link.uri.replace(/^https?\:\/\//i, "");
          new_link.uri = selectedProtocols[key] + link.uri;
        } else {
          new_link.uri = link.uri;
        }
      } else {
        if (selectedProtocols != "Relative Path") {
          link.uri = link.uri.replace(/^https?\:\/\//i, "");
          new_link.uri = selectedProtocols + link.uri;
        } else {
          new_link.uri = link.uri;
        }
      }

      if (new_link.uri && new_link.uri != 'http://' && new_link.uri != 'https://') {
        // if there is an id, send PUT request to update
        if (new_link.id) {
          Restangular.one('account/website', new_link.id).customPUT(new_link);
        }
        // else send POST to create new
        else {
          new_link.person_id = $scope.manager.id;
          Restangular.one('account/website').customPOST(new_link).then(function(success) {
            //$scope.customlinks[key] = success;
          });
        }
      }
    });
  }

  // set dimmer on and off
  $scope.dimmerOn = function() {
    $('.image').dimmer('show');
  };
  $scope.dimmerOff = function() {
    $('.image').dimmer('hide');
  };

  function getNotes() {
    Restangular.one('campaign', $routeParams.campaign_id).one('note').customGET().then(function(success) {
      if (success) {
        $scope.notes = success[0].value;
      }
    });
  }

  $scope.uploadProfileImage = function(files) {
    if ($scope.manager.id == UserService.id || UserService.person_type_id == 1) {
      if (files.length) {
        if ($scope.allowedImage(files[0].type)) {
          var params = {
            resource_content_type: 'image',
            person_id: $scope.manager.id
          };
          var $picNode = $('.profileSetup');
          if ($scope.manager.person_files == null || $scope.manager.person_files.length == 0) {
            FileUploadService.upload('account/resource/file/', files, params, $picNode).then(function(success) {
              if (success.length) {
                $scope.manager.person_files = [];
                $scope.manager.person_files.push(success[0].data);
              }
            });
          } else {
            FileUploadService.modify('account/resource/file/', files, params, $scope.manager.person_files[0].id, $picNode).then(function(success) {
              if (success.length) {
                $scope.manager.person_files = [];
                $scope.manager.person_files.push(success[0].data);
              }
            });
          }
        } else {
          //Show modal
          $('.wrong-filetype').modal('show');
        }
      }
    }
  }

  $scope.allowedImage = function(file_type) {
    var allowed_type = ['image/vnd.microsoft.icon', 'image/x-icon', 'image/png', 'image/pjpeg', 'image/jpeg', 'image/gif'];
    if (allowed_type.indexOf(file_type) > -1) {
      return true;
    } else {
      return false;
    }
  }

  $scope.deleteProfileImage = function(files) {
    if (files && files.length) {
      var file = files.pop();
      Restangular.one('account/resource/file').customDELETE(file.id);
      $('.imagePlace .dimmer').dimmer('hide');
      $('.ui.progress.upload-bar').show();
      $('.ui.loader.download-loader').hide();
    }
  }

  // Check companyFormToggle to determine what option the user is at
  // If at add new then disregard business id
  $scope.uploadBusinessImage = function(files) {
    $scope.files = files;
    if (UserService.id == $scope.manager.id || UserService.person_type_id == 1) {
      if (files.length) {
        var params = {};
        if ($scope.companyFormToggle) {
          params = {
            resource_content_type: 'image',
            business_organization_id: $scope.company_selected,
            // person_id: paramID.person_id
          };
        } else {
          params = {
            resource_content_type: 'image',
            // person_id: paramID.person_id
          }
        }

        // If creating a new company
        if (!$scope.companyFormToggle) {
          $scope.company_selected = {};
          $scope.company_selected.name = "Placeholder";
          if ($scope.newCompany.hasOwnProperty('name')) {
            $scope.company_selected.name = $scope.newCompany.name;
          }
          if ($scope.newCompany.hasOwnProperty('description')) {
            $scope.company_selected.description = $scope.newCompany.description;
          }

          Restangular.one('account/business').customPOST($scope.company_selected).then(function(success) {
            $scope.company_selected = success.id;
            params.business_organization_id = $scope.company_selected;
            var $picNode = $('.profileCompany');
            if ($scope.businessImage.length == 0) {
              FileUploadService.upload('account/resource/file/', files, params, $picNode).then(function(success) {
                // $scope.businessImage.push(success[0].data);
                $scope.getBusinessImage();
                $scope.newCompanyLogoID = success[0].data.id;
              });
            } else {
              FileUploadService.modify('account/resource/file/', files, params, $scope.businessImage[0].id, $picNode).then(function(success) {
                // $scope.businessIamge = [];
                // $scope.businessImage.push(success[0].data);
                $scope.getBusinessImage();
                $scope.newCompanyLogoID = success[0].data.id;
              });
            }
            //attach newly created business to campaign
            var data = {
              business_organization_id: [$scope.company_selected],
              entry_id: $routeParams.campaign_id
            };
            Restangular.one('campaign', $routeParams.campaign_id).customPUT(data).then(function(success) {}, function(failure) {
              msg = {
                'header': failure.data.message
              }
              $rootScope.floatingMessage = msg;
              $scope.hideFloatingMessage();
            });
          });
        } else {
          // Upload to existing company
          var $picNode = $('.profileCompany');
          if ($scope.businessImage.length == 0) {
            FileUploadService.upload('account/resource/file/', files, params, $picNode).then(function(success) {
              $scope.getBusinessImage();
              $scope.newCompanyLogoID = success[0].data.id;
            });
          } else {
            FileUploadService.modify('account/resource/file/', files, params, $scope.businessImage[0].id, $picNode).then(function(success) {
              $scope.getBusinessImage();
              $scope.newCompanyLogoID = success[0].data.id;
            });
          }

        }
      }
    }
  }

  $scope.modifyBusinessImage = function(files, params) {
    var picNode = $('.profileCompany');
    $scope.uploadBusinessImage($scope.files);
  }

  $scope.deleteBusinessImage = function(files) {
    if (files && files.length) {
      var file = files.pop();
      var param = {
        business_organization_id: $scope.company_selected
      };
      Restangular.one('account/resource/file').customDELETE(file.id, param);
      $('.imagePlace .dimmer').dimmer('hide');
      $('.ui.progress.upload-bar').show();
      $('.ui.loader.download-loader').hide();
    }
  }

  $scope.getBusinessImage = function() {
    // get the profile image
    $scope.businessImage = [];
    if ($scope.company_selected != null && $scope.company_selected != undefined) {
      var dataParam = {
        business_organization_id: $scope.company_selected,
        // person_id: paramID.person_id
      }
      Restangular.one('account/resource').customGET('file', dataParam).then(function(success) {
        if (success.length) {
          $scope.businessImage.push(success[0]);
        }
        // $scope.businessImage = success;
      });
    }
  };

  // Prepare data caching for location filter
  $scope.cities = [];

  // Look up city based on search term, then find the cityID and store it
  // This will check the setting to see if native_lookup is needed for search
  $scope.searchCities = function(term) {
    var cityID = null; // variable to hold city ID
    var countryID = null;
    var native_lookup = $scope.native_lookup == true ? 1 : 0;
    if (term) {
      // Check setting here to choose which one to use, check the layout
      // This one is to search cities directly
      if (!$scope.alt_shipping) {
        Geolocator.searchCities(term, native_lookup).then(function(cities) {
          if (native_lookup) {
            // To change the order displayed to country subcountry, city
            cities.forEach(function(value, index) {
              value = getNativeName(value);
            });
          }
          $scope.cities = cities;
        });
      }
      // This one is to search with subcountry id to limit the area
      else {
        Geolocator.searchCitiesBySubcountry(term, $scope.selectedSubcountry.selected.id, native_lookup).then(function(cities) {
          if (native_lookup) {
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
          }
          $scope.cities = cities;
        });
      }
    }
  }

  $scope.searchCitiesbusiness = function(term) {
    var cityID = null; // variable to hold city ID
    var countryID = null;
    var native_lookup = $scope.native_lookup == true ? 1 : 0;
    if (term) {
      // Check setting here to choose which one to use, check the layout
      // This one is to search cities directly
      if (!$scope.alt_shipping) {
        Geolocator.searchCities(term, native_lookup).then(function(cities) {
          if (native_lookup) {
            // To change the order displayed to country subcountry, city
            cities.forEach(function(value, index) {
              value = getNativeName(value);
            });
          }
          $scope.cities = cities;
        });
      }
      // This one is to search with subcountry id to limit the area
      else {
        Geolocator.searchCitiesBySubcountry(term, $scope.selectedSubcountry.selected.id, native_lookup).then(function(cities) {
          if (native_lookup) {
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
          }
          $scope.cities = cities;
        });
      }
    }
  }

  // Clear data and repopulate data when switching between new or existing options
  // in business detail in profile-setup
  $scope.newOrExistComp = function() {
    var $compBtn = $('#compBtn');
    // companyFormToggle is false means you are on add new company option
    // companyFormToggle is true means you are on existing company option
    $scope.companyFormToggle = !$scope.companyFormToggle;
    // Clear fields when switch to add new company option
    if (!$scope.companyFormToggle) {
      $scope.selectedCountry.selected = false;
      $scope.selectedSubcountry.selected = undefined;
      $scope.selectedCity.selected = undefined;
      $scope.baddress.street1 = "";
      $scope.baddress.street2 = "";
      $('#bselect_city').text("");
      $scope.baddress.mail_code = "";
      $scope.business_number = "";
      $scope.businessImage = [];
      $scope.businessLinks = [];
      $compBtn.css("margin-top", "5px");
    } else {
      $compBtn.css("margin-top", "0px");
      getAddress(paramID);
      getPhoneNumber(paramID);
      $scope.getBusinessImage();
    }
  }

  $scope.$watch("selectedCountry.selected", function(value, oldValue) {
    if (value != oldValue && value) {
      getSubcountries(value.id);
    }
  });

  // watching variable changes
  $scope.$watch('selectedCity.selected', function(value) {
    if (value) {
      cityID = Geolocator.lookupCityID(value.name);
      if (cityID) {
        if ($scope.campaign.profile_type_id == 2) {
          $scope.baddress.city_id = cityID;
          $('#bselect_city').text(value.name);
        } else {

          $scope.address.city_id = cityID;
          $('#select_city').text(value.name);
        }
      }
      countryID = Geolocator.lookupCountryID(value.name);
      if (countryID) {
        if ($scope.campaign.profile_type_id == 2) {
          $scope.baddress.country_id = countryID;
        } else {
          $scope.address.country_id = countryID;
        }

      }

    }
  });
  $scope.$watch('bselectedCity.selected', function(value) {
    if (value) {

      cityID = Geolocator.lookupCityID(value.name);

      if (cityID) {
        $scope.baddress.city_id = cityID;
      }
      countryID = Geolocator.lookupCountryID(value.name);
      if (countryID) {
        $scope.baddress.country_id = countryID;
      }
    }
  });

  $scope.$watch('address.country_id', function(countryID) {
    var worldWide = null;
    var country = null;
    if (countryID) {
      // find out the index
      angular.forEach($scope.shippingOption, function(item, key) {
        if (item.country_id == countryID) {
          country = key;
          // return; // break loop when match country found
        }

        if (item.shipping_option_type_id == 1) {
          worldWide = key;
        }
      });

      // determine country or worldwide
      if (country != null) {
        $scope.costIndex = country;
      } else if (worldWide != null) {
        $scope.costIndex = worldWide;
      }
    }
  });

  $scope.$watch('selectedCity.selected', function(newValue, oldValue) {
    if (newValue) {
      $('#select-user-city .select-error').remove();
      $('#select-user-city').removeClass('error');
    }
  });

  $scope.$watch('selectedCountry.selected', function(newValue, oldValue) {
    if (newValue) {
      $('#select-user-country .select-error').remove();
      $('#select-user-country').removeClass('error');
    }
  });

  $scope.$watch('selectedSubcountry.selected', function(newValue, oldValue) {
    if (newValue) {
      $('#select-user-subcountry .select-error').remove();
      $('#select-user-subcountry').removeClass('error');
    }
  });

  function initBusiness() {
    if ($scope.company_selected.business_organization_id == "") {
      Restangular.one('account/').customGET('business', paramID).then(function(success) {
        $scope.companies = success;
        if ($scope.companies != 0) {
          $scope.company = $scope.companies[0];
          $scope.company_selected = $scope.companies[0];
          $scope.CompanyAddress($scope.company_selected);
          $scope.getBusinessNameDescription($scope.company_selected.id);
        }
      });
    }
  }

  $scope.completionCheck = function() {

    var reqFieldsCheck;

    if ($scope.create) {
      if (!$('#creationCheck').checkbox('is checked')) {
        $scope.tos_not_checked = true;
        return;
      } else {
        $scope.tos_not_checked = false;
      }
    }

    var campaign = $scope.campaign;
    if ($scope.direct_transaction || ($scope.payment_gateway == 2) || ($scope.public_settings.site_campaign_country_funding_step && $scope.campaign.settings.country_bank_form)) {
      campaign.stripe_account_id = -1;
    }

    // Check if rewards is required and if it is empty or not
    if ($scope.public_settings.site_theme_campaign_show_reward_required) {
      // if rewards is required
      if (campaign.pledges) {
        $scope.rewardsCheck = true;
      } else {
        $scope.rewardsCheck = false;
      }
    } else {
      //rewads is not required
      $scope.rewardsCheck = true;
    }
    if ($scope.in_revision) {
      $scope.confirmNotice = true;
      $scope.loadingText = false;
      return;
    }

    // Toggle check for campaign steps with hidden required fields
    if ($scope.hideCampaignBlurbField && $scope.hideCampaignCategoryField && $scope.hideCampaignImageField) {
      reqFieldsCheck = (campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.funding_goal && campaign.currency_id && campaign.description && $scope.rewardsCheck && checkFunding()) ? true : false;
    } else if ($scope.hideCampaignImageField) {
      basicsReqField = (campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.categories && campaign.funding_goal && campaign.currency_id && campaign.description && $scope.rewardsCheck && checkFunding()) ? true : false;
    } else if ($scope.hideCampaignBlurbField) {
      basicsReqField = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.categories && campaign.funding_goal && campaign.currency_id && campaign.description && $scope.rewardsCheck && checkFunding()) ? true : false;
    } else if ($scope.hideCampaignCategoryField) {
      basicsReqField = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.funding_goal && campaign.currency_id && campaign.description && $scope.rewardsCheck && checkFunding()) ? true : false;
    } else {
      reqFieldsCheck = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.categories && campaign.funding_goal && campaign.currency_id && campaign.description && $scope.rewardsCheck && checkFunding()) ? true : false;
    }
    if (reqFieldsCheck) {
      $scope.loadingText = true;

      CreateCampaignService.sendForReview().then(function(success) {
        $scope.confirmNotice = true;
        $scope.loadingText = false;
      }, function(failed) {
        $scope.errorNotice = failed.data.message;
        msg = {
          'header': failed.data.message
        };
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    } else {
      var steps = [];
      var step1ReqField, step2ReqField, step3ReqField;
      $timeout(function() {
        $translate(['basics', 'details', 'rewards', 'funding', 'uprofile']).then(function(value) {

          // Toggle check for campaign step 1 with hidden required fields
          if ($scope.hideCampaignBlurbField && $scope.hideCampaignCategoryField && $scope.hideCampaignImageField) {
            step1ReqField = (campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.funding_goal && campaign.currency_id) ? true : false;
          } else if ($scope.hideCampaignImageField) {
            step1ReqField = (campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.categories && campaign.funding_goal && campaign.currency_id) ? true : false;
          } else if ($scope.hideCampaignBlurbField) {
            step1ReqField = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.categories && campaign.funding_goal && campaign.currency_id) ? true : false;
          } else if ($scope.hideCampaignCategoryField) {
            step1ReqField = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.funding_goal && campaign.currency_id) ? true : false;
          } else {
            step1ReqField = (hasImage() && campaign.name && campaign.raise_mode_id && campaign.profile_type_id && campaign.blurb && campaign.categories && campaign.funding_goal && campaign.currency_id) ? true : false;
          }
          if (!step1ReqField) {
            steps.push(value.basics);
          }

          // Toggle check for campaign step 2 with hidden required fields
          if ($scope.showCampaignImageField) {
            step2ReqField = (hasImage()) ? true : false;
          } else {
            step2ReqField = (campaign.description) ? true : false;
          }
          if (!step2ReqField) {
            steps.push(value.details);
          }

          // Toggle check for campaign step 3 with hidden required fields
          if ($scope.hideAllCampaignRewardsFields) {
            step3ReqField = (campaign.description) ? true : false;
          } else {
            step3ReqField = (campaign.pledges && $scope.public_settings.site_theme_campaign_show_reward_required)
          }
          if (!step3ReqField) {
            // set error message if no rewards
            steps.push(value.rewards);
          }
          if (!(campaign.stripe_account_id)) {
            steps.push(value.funding);
          }
          if (steps.length > 0) {
            missingText(steps);
          }
        });
      });
    }
  };

  function missingText(array) {
    $translate(['steps', 'stepsmessage', 'step', 'stepmessage']).then(function(value) {
      if (array.length > 1) {
        $scope.steps = value.steps;
        $scope.stepsmessage = value.stepsmessage;
        $scope.missingFieldsText = $scope.steps + "\"" + array.toString() + "\"" + $scope.stepsmessage;
      } else {
        $scope.step = value.step;
        $scope.stepmessage = value.stepmessage;
        $scope.missingFieldsText = $scope.step + "\"" + array.toString() + "\"" + $scope.stepmessage;
      }
      msg = {
        'header': $scope.missingFieldsText,
      };
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();

    });
  }
});