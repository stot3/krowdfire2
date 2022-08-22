app.controller('StripeInstructionsCtrl', function($scope, $routeParams, CreateCampaignService){
    $scope.campaign = {}
    $scope.nextStepUrl = "complete-funding/" + $routeParams.campaign_id;
    $scope.backUrl = "profile-setup/" + $routeParams.campaign_id
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
})