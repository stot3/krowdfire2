app.controller('TruliooVerificationCtrl', function ($translate, $scope, UserService, $rootScope, Restangular, $q, Geolocator, API_URL) {
    $scope.truliooNeededFields = {};
    $scope.truliooVerified = false;
    $scope.verifyTruliooLoading = {
      loading: false,
      confirm_loading: true
    };
    $scope.user = UserService;
    $scope.valCheck = true;

    function getFieldsNeededForVerification(country_code) {
  
      var xhr = new XMLHttpRequest();
        
      xhr.open("GET", API_URL.identity_proxy_url + '/fields/' + country_code, true);
  
      //Send the proper header information along with the request
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send();
      return new Promise(function(resolve, reject) {
        xhr.onload = function() {
          // Do whatever with response
          if(xhr.status === 200) {
            var response = JSON.parse(xhr.response);
            resolve(response);
          } else {
            reject({'error': 'Unable to communicate with server.'});
          }
        }
      });
  
    }
  
    confirmTruliooTransaction = function(transId) {
      var xhr = new XMLHttpRequest();
  
      xhr.open("GET", API_URL.identity_proxy_url + '/confirm/' + transId, true);
      //Send the proper header information along with the request
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send();
      return new Promise(function(resolve, reject) {
        xhr.onload = function() {
          // Do whatever with response
          if(xhr.status === 200) {
            var response = JSON.parse(xhr.response);
            resolve(response);
          } else {
            reject({'error': 'Unable to communicate with server.'});
          }
        }
      });
    }
  
    verifyTrulioo = function() {
      $scope.verifyTruliooLoading.loading = true;
      var payload = $scope.truliooNeededFields;
      // console.log($scope.truliooNeededFields);
      if(payload) {
  
        payload = {
          "AcceptTruliooTermsAndConditions": true,
          "CleansedAddress": false,
          "FirstGivenName": payload.FirstGivenName.value,
          "FirstSurName": payload.FirstSurName.value,
          "BuildingNumber": payload.BuildingNumber.value,
          "StreetName": payload.StreetName.value,
          "City": payload.City.value,
          "StreetName": payload.StreetName.value,
          "PostalCode": payload.PostalCode.value
        }
  
        var xhr = new XMLHttpRequest();
        // console.log(payload); 
        xhr.open("POST", API_URL.identity_proxy_url + '/verifyuser/' + $scope.user.id, true);
  
        //Send the proper header information along with the request
        xhr.setRequestHeader("Content-Type", "application/json");
  
        xhr.send(JSON.stringify(payload));

        $('.ui.modal.addresses-modal').modal('hide');
        return new Promise(function(resolve, reject) {
          xhr.onload = function() {
            var trulioo_verified = {
              'country': "",
              'product_name': "",
              'verified': false,
              'response': false
            };

            if(xhr.status === 200) {
              var response = JSON.parse(xhr.response);
              if(!Array.isArray(response)) {
                if(response.hasOwnProperty('Record')) {
                  if(response.Record.RecordStatus === 'match') {
                    $scope.$apply(function() {
                      trulioo_verified.verified['verified'] = true;
                      $scope.truliooVerified = true;
                      $rootScope.verified = true;
                      $scope.verifyTruliooLoading.loading = false;
                      resolve(trulioo_verified);
                    });

                  } else {
                    $scope.$apply(function() {
                      $scope.verifyTruliooLoading.loading = false;
                      reject(response); 
                    });
                  }
                }  else {
                  $scope.$apply(function() {
                    $scope.verifyTruliooLoading.loading = false;
                    reject(response); 
                  });
                }
                
              } else if (response[0].attributes && response[0].attributes.hasOwnProperty('trulioo_verified')) {
                $scope.$apply(function() {
                  trulioo_verified.verified['verified'] = true;
                  $scope.truliooVerified = true;
                  $rootScope.verified = true;
                  $scope.verifyTruliooLoading.loading = false;
                });
              } else {
                $scope.$apply(function() {
                  $scope.verifyTruliooLoading.loading = false;
                  reject(response); 
                });
              }

            }
            else {
              reject(false);
            }
          }
        })
        
      }
    }
  
    $scope.savePersonAttributes = function (person_id, $data) {
      console.log($data);
      Restangular.one('portal/person/attribute', person_id).customPUT($data);
    }

    $scope.generateTruliooNeededFields = function(promises) {
      // 2 promises, get address, get phone number
      return $q.all(promises).then(function(result) {
          $scope.useAddress; 
          var phoneNumber; 
          for (var i = 0; i < result.length; i++) {
            if(result[i] && result[i].hasOwnProperty('paddress') && result[i].paddress && result[i].paddress[0].hasOwnProperty('address_type')) {
              for(var j = 0; j < result[i].paddress.length; j++) {
                if(result[i].paddress[j].primary_address) {
                  $scope.useAddress = result[i].paddress[j];
                  break;
                }
              }
            }
            if(result[i] && result[i].hasOwnProperty('pphonenumber') && result[i].pphonenumber && result[i].pphonenumber[0].hasOwnProperty('phone_number_type')) {
              phoneNumber = result[i].pphonenumber[0];
            }
          }

          if(!$scope.useAddress)
            return { 'error': 'No primary address set'};

          return getFieldsNeededForVerification($scope.useAddress.code_iso3166_1).then(function(success) {
            if(typeof success !== 'object') {
              return;
            }

            var personInfoReq = success.properties.PersonInfo.properties;
            var locationReq = success.properties.Location.properties;
            var communicationReq = success.properties.Communication.properties;
            $scope.$apply(function() {
              if(personInfoReq) {
                for (var property in personInfoReq) {
                  
                  if(property === "FirstGivenName") {
                    $scope.truliooNeededFields[property] = {value: $scope.user.first_name, required: success.properties.PersonInfo.required.indexOf(property) != -1 ? true : false};
                  }
                  if(property === "FirstSurName") {
                    $scope.truliooNeededFields[property] = {value: $scope.user.last_name, required: success.properties.PersonInfo.required.indexOf(property) != -1 ? true : false};
                  }
                }
              }
              
              if(locationReq) {
                for (var property in locationReq) {
                  if(property === "City") {
                    $scope.truliooNeededFields[property] = {value: $scope.useAddress.city, required: success.properties.Location.required.indexOf(property) != -1 ? true : false};
                  }
                  if(property === "PostalCode") {
                    $scope.truliooNeededFields[property] = {value: $scope.useAddress.mail_code, required: success.properties.Location.required.indexOf(property) != -1 ? true : false};
                  }
                  if(property === "StreetName") {
                    $scope.truliooNeededFields[property] = {value: $scope.useAddress.street2, required: success.properties.Location.required.indexOf(property) != -1 ? true : false};
                  }
                  if(property === "BuildingNumber") {
                    $scope.truliooNeededFields[property] = {value: $scope.useAddress.street1, required: success.properties.Location.required.indexOf(property) != -1 ? true : false};
                  }
                  if(property === "StateProvinceCode") {
                    $scope.truliooNeededFields[property] = {value: $scope.useAddress.subcountry, required: success.properties.Location.required.indexOf(property) != -1 ? true : false};
                  }
                }
              }
  
              if(communicationReq) {
                for (var property in communicationReq) {
                  if(property === "EmailAddress") {
                    $scope.truliooNeededFields[property] = {value: $scope.user.email, required: success.properties.Communication.required.indexOf(property) != -1 ? true : false};
                  } 
                  if(phoneNumber && phoneNumber.hasOwnProperty('phone_number_type') && phoneNumber.phone_number_type === "Mobile Phone Number") {
                    if(property === "MobileNumber") {
                      $scope.truliooNeededFields[property] = {value: phoneNumber.number, required: success.properties.Communication.required.indexOf(property) != -1 ? true : false};
                    }
                  }
    
                  if(phoneNumber && phoneNumber.hasOwnProperty('phone_number_type') && phoneNumber.phone_number_type === "Landline Phone Number") {
                    if(property === "Telephone") {
                      $scope.truliooNeededFields[property] = {value: phoneNumber.number, required: success.properties.Communication.required.indexOf(property) != -1 ? true : false};
                    }
                  }
  
                  if(!$scope.truliooNeededFields['TelephoneType'] && phoneNumber) {
                    $scope.truliooNeededFields['TelephoneType'] = {value: phoneNumber.phone_number_type, required: success.properties.Communication.required.indexOf(property) != -1 ? true : false};
                  }
                }
              }
              
            });
            return $scope.truliooNeededFields;
          });

      });
    }
  
    $scope.onPageLoad = function(person_id) {
      getAddresses();
      $scope.generateTruliooNeededFields([
        getAddress(person_id),
        getPhoneNumber(person_id)
      ]);

    }
  
    getCustomFields = function (person_id) {
      // get custom fields
      $scope.custom_field = [];
  
      return Restangular.one('portal/person/attribute?filters={"person_id":"' + person_id + '"}').customGET().then(function (success) {
        $scope.$emit("loading_finished");
        if (success) {
          $scope.custom_field = success;
        }
        // get organization name & ein
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
  
        return $scope.custom_field;
  
      }, function (error) {
        $scope.custom_field = [];
        $scope.pcustom = [];
        $scope.pcustom_copy = angular.copy($scope.pcustom);
  
        return $scope.custom_field;
      });
    }
  
    $rootScope.$on("TruliooPageLoad", function(evt, data){
      var person_id = data && data.hasOwnProperty('person') ? data.person.person_id : undefined;

      if(typeof person_id !== 'undefined') {
        $scope.user = data.person;
      }
  
      $scope.generateTruliooNeededFields([
        getAddress(person_id),
        getPhoneNumber(person_id)
      ]);
      
      getCustomFieldsAndVerify(person_id);
    });
    
    //Get TruliooFields
    $scope.onPageLoad();
    //Get CustomFields - search trans ID to confirm if is a match  
    getCustomFieldsAndVerify($scope.user.id);
    
    $scope.showAddresses = function() {
      $('.addresses-modal').modal('setting',{
        closable: false
      }).modal('show');
    };

    // Look up city based on search term, then find the cityID and store it
    // This will check the setting to see if native_lookup is needed for search
    $scope.searchCities = function (term) {
      var cityID = null; // variable to hold city ID
      var countryID = null;
      var native_lookup = $scope.public_setting.site_theme_shipping_native_lookup == true ? 1 : 0;
      if (term) {
        // Check setting here to choose which one to use, check the layout
        // This one is to search cities directly
        Geolocator.searchCities(term, native_lookup).then(function (cities) {
          $scope.cities = cities;
        });
      }
    }


    function getCustomFieldsAndVerify(person_id) {
      // Will return trulioo_verified attribute from success if the user has already been verified before.
      getCustomFields(person_id).then(function(success) {
        //get transaction record id 
        var verified 
        if(success.length > 0) {
          verified = (success[0].attributes && success[0].attributes.hasOwnProperty('trulioo_verified')) ? success[0].attributes.trulioo_verified : false;
        } else {
          verified = false;
        }

        if(verified) {
              $scope.truliooVerified = true;
              $scope.verifyTruliooLoading.confirm_loading = false;
        } else {
          $scope.truliooVerified = false;
          $scope.verifyTruliooLoading.confirm_loading = false;
        }
      });
    }
  
    function getAddress(paramID) {
      return Restangular.one('account/').customGET('address', {'person_id' : paramID}).then(function(success) {
        if (success) {
          return {
            paddress: success.personal,
            baddress: success.business
          }
        } 
      });
    }
    
    function getAddresses() {
      // request for account address info
      Restangular.one('account/address').customGET().then(function (success) {
        $scope.personal_addresses = checkNative(success.personal); // personal address
        $scope.business_addresses = checkNative(success.business);
      });
    }

    addressValidation = function () {
      var translation = $translate.instant(['tab_address_select_company_error', 'tab_address_address1_error', 'tab_address_mailcode_error']);

      $('.address-form').form({
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
            prompt: "Please specify building number"
          }]
        },
        address1: {
          identifier: 'address2',
          rules: [{
            type: 'empty',
            prompt: "Please specify street name"
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
            $scope.valCheck = $scope.valCheck && true;
          },
          onFailure: function () {
            $scope.valCheck = $scope.valCheck && false;
          }
        }).form('validate form');
    }

    function getPhoneNumber(paramID) {
      return Restangular.one('account/').customGET('phone-number', {'person_id' : paramID}).then(function(success) {
        return {
          pphonenumber: success.personal,
          bphonenumber: success.business
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

    setTruliooNeededFields = function(address) {
      $scope.truliooNeededFields = {
        "AcceptTruliooTermsAndConditions": true,
        "CleansedAddress": false,
        "FirstGivenName": {value: $scope.user.first_name, required: true },
        "FirstSurName": {value: $scope.user.last_name, required: true },
        "BuildingNumber": {value: address.street1, required: true },
        "StreetName": {value: address.street2, required: true },
        "City": {value: address.city ? address.city : address.selected.city, required: true },
        "PostalCode": {value: address.mail_code, required: true }
      };
    }

    $scope.setAddress = function() {

      var selectedOption = selected();

      $('.ui.modal.addresses-modal')
      .modal('setting',{
        onApprove : function() {
          return false;
        }
      });

      if(selectedOption !== null) {
        if(selectedOption.hasOwnProperty('address')) {
          setTruliooNeededFields(selectedOption['address']);
          verifyTrulioo();
        } else if (selectedOption.hasOwnProperty('newAddress')) {

          addressValidation();
          
          if($scope.valCheck) {
            var payload = {
              "street1": selectedOption['newAddress'].street1,
              "street2": selectedOption['newAddress'].street2,
              "city_id": selectedOption['newAddress'].selected.city_id,
              "mail_code": selectedOption['newAddress'].mail_code,
              "primary_address": 1
            };
            angular.forEach($scope.personal_addresses, function (value) {
              if (value.primary_address == 1) {
                var update = {
                  primary_address: 0,
                };
                unsetPrimary = Restangular.one('account/address', value.address_id).customPUT(update);
              }
            });

            Restangular.one('account/address').customPOST(payload)
            .then(function (success) {
              msg = {
                header: 'tab_address_save_success'
              }
              $rootScope.floatingMessage = msg;
              $scope.hideFloatingMessage();
              setTruliooNeededFields(selectedOption['newAddress']);
              verifyTrulioo();
            }, function (failed) {
              msg = {
                header: failed.data.message
              }
              $rootScope.floatingMessage = msg;
              $scope.hideFloatingMessage();
            });;
          }
        }
      }
              
    };

  function selected() {
      var selected = null;
      $('table.address-table-personal').find('tbody td.t-check-box input').each(function () {
        if ($(this).prop('checked')) {
          selected = $(this).scope();
        }
      });

      return selected;
    };
    
  });
  