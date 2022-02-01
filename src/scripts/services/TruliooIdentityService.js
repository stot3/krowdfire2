app.service('TruliooIdentityService', function($q, Restangular, IDENTITY_PROXY_SERVER) {
  var TruliooIdentityService = {
    fields: {}
  };

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

  function getPhoneNumber(paramID) {
    return Restangular.one('account/').customGET('phone-number', {'person_id' : paramID}).then(function(success) {
      return {
        pphonenumber: success.personal,
        bphonenumber: success.business
      }
    });
  }

  TruliooIdentityService.generateTruliooNeededFields = function(user) {
    return $q.all([getAddress(user.person_id), getPhoneNumber(user.person_id)]).then(function(result) {
        var address; 
        var phoneNumber; 
        for (var i = 0; i < result.length; i++) {
          if(result[i] && result[i].hasOwnProperty('paddress') && result[i].paddress[0].hasOwnProperty('address_type')) {
            for(var j = 0; j < result[i].paddress.length; j++) {
              if(result[i].paddress[j].primary_address) {
                address = result[i].paddress[j];
                break;
              }
            }
          }
          if(result[i] && result[i].hasOwnProperty('pphonenumber') && result[i].pphonenumber[0].hasOwnProperty('phone_number_type')) {
            phoneNumber = result[i].pphonenumber[0];
          }
        }

        if(!address)
          return { 'error': 'No primary address set'};

        return _getFieldsNeededForVerification(address.code_iso3166_1).then(function(success) {
          if(typeof success !== 'object') {
            return;
          }
          var personInfoReq = success.properties.PersonInfo.properties;
          var locationReq = success.properties.Location.properties;
          var communicationReq = success.properties.Communication.properties;
            if(personInfoReq) {
            for (var property in personInfoReq) {
              
              if(property === "FirstGivenName") {
                TruliooIdentityService.fields[property] = {value: user.first_name, required: success.properties.PersonInfo.required.indexOf(property) != -1 ? true : false};
              }
              if(property === "FirstSurName") {
                TruliooIdentityService.fields[property] = {value: user.last_name, required: success.properties.PersonInfo.required.indexOf(property) != -1 ? true : false};
              }
            }
          }
          
          if(locationReq) {
            for (var property in locationReq) {
              if(property === "City") {
                TruliooIdentityService.fields[property] = {value: address.city, required: success.properties.Location.required.indexOf(property) != -1 ? true : false};
              }
              if(property === "PostalCode") {
                TruliooIdentityService.fields[property] = {value: address.mail_code, required: success.properties.Location.required.indexOf(property) != -1 ? true : false};
              }
              if(property === "StreetName") {
                TruliooIdentityService.fields[property] = {value: address.street2, required: success.properties.Location.required.indexOf(property) != -1 ? true : false};
              }
              if(property === "BuildingNumber") {
                TruliooIdentityService.fields[property] = {value: address.street1, required: success.properties.Location.required.indexOf(property) != -1 ? true : false};
              }
              if(property === "StateProvinceCode") {
                TruliooIdentityService.fields[property] = {value: address.subcountry, required: success.properties.Location.required.indexOf(property) != -1 ? true : false};
              }
            }
          }

          if(communicationReq) {
            for (var property in communicationReq) {
              if(property === "EmailAddress") {
                TruliooIdentityService.fields[property] = {value: user.email, required: success.properties.Communication.required.indexOf(property) != -1 ? true : false};
              } 
              if(phoneNumber.hasOwnProperty('phone_number_type') && phoneNumber.phone_number_type === "Mobile Phone Number") {
                if(property === "MobileNumber") {
                  TruliooIdentityService.fields[property] = {value: phoneNumber.number, required: success.properties.Communication.required.indexOf(property) != -1 ? true : false};
                }
              }

              if(phoneNumber.hasOwnProperty('phone_number_type') && phoneNumber.phone_number_type === "Landline Phone Number") {
                if(property === "Telephone") {
                  TruliooIdentityService.fields[property] = {value: phoneNumber.number, required: success.properties.Communication.required.indexOf(property) != -1 ? true : false};
                }
              }

              if(!TruliooIdentityService.fields['TelephoneType']) {
                TruliooIdentityService.fields['TelephoneType'] = {value: phoneNumber.phone_number_type, required: success.properties.Communication.required.indexOf(property) != -1 ? true : false};
              }
            }
          }
          
          return TruliooIdentityService.fields;
        });

    });
  }

  function _getFieldsNeededForVerification(country_code) {
  
    var xhr = new XMLHttpRequest();
      
    xhr.open("GET", IDENTITY_PROXY_SERVER.APP_URL + '/fields/' + country_code, true);

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

  TruliooIdentityService.confirmTransaction = function(transId) {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", IDENTITY_PROXY_SERVER.APP_URL + '/confirm/' + transId, true);
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

  TruliooIdentityService.verifyTransaction = function(fields) {
    var payload = fields;
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
      
      xhr.open("POST", IDENTITY_PROXY_SERVER.APP_URL + '/verify', true);

      //Send the proper header information along with the request
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.send(JSON.stringify(payload));
      return new Promise(function(resolve, reject) {
        xhr.onload = function() {
          var trulioo_verified = {
            'country': "",
            'product_name': "",
            'verified': false,
            'response': false
          };
          // Do whatever with response
          if(xhr.status === 200) {
            var response = JSON.parse(xhr.response);
            //Check for match
            if(response.Record.RecordStatus === 'match') {
              //Save to campaign settings
              trulioo_verified = {
                'TransactionRecordID': response.Record.TransactionRecordID,
              };
              
              resolve(trulioo_verified);
  
            } else {
              reject(response); 
            }
          }
        }
      })
    }

  }

  return TruliooIdentityService;
});