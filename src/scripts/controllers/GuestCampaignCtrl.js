app.controller('GuestCampaignCtrl', function($q, $location, $scope, UserService, StripeService, $routeParams, $translatePartialLoader, $translate, Restangular, Geolocator, RESOURCE_REGIONS) {
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  window.a = $scope;

  $scope.pledgeLevel = $routeParams.plid;
  $scope.pledgeAmount = parseInt($routeParams.m);
  $scope.campaign_id = $routeParams.eid;
  $scope.selectedCity = {};

  // set toggle object
  $scope.toggle = {
    newCard: false,
    newAddress: false,
    selectedCard: false,
    selectedAddress: false
  };

  $('i').popup();


  //get the campaign
  Restangular.one('campaign', $scope.campaign_id).get().then(function(success) {
    $scope.campaign = success;
    var count = 0;
    angular.forEach($scope.campaign.pledges, function(value, key) {
      if ($scope.pledgeLevel == value.pledge_level_id) {
        $scope.pledgeindex = count;
      }
      count++;
    });
  });


  // reset select box dropdown to default
  $scope.dropdownReset = function(selector) {
    if (selector == '.address-select') {
      $scope.selectedAddress = null;
    } else {
      $scope.selectedCardID = null;
    }
    // restore dropdown
    $(selector).dropdown('restore defaults');
  };


  /*
  Address section
  */

  // set up objects to send through POST
  $scope.address = {
    city_id: '',
    mail_code: '',
    street1: '',
    street2: '',
    country_id: ''
  };
  $scope.creditCard = {
    email: '',
    number: '',
    exp_month: '',
    exp_year: '',
    cvc: '',
    first_name: '',
    last_name: ''

  };
  $scope.guestinfo = {


  }
  $scope.company = {
    name: ''
  }

  //submit form
  $scope.submit = function() {

    var invalid_elements = $('form, ng-form').find('.ng-invalid,.has-error');
    if (invalid_elements.length > 0) {
      return;
    }

    $("div.loader").addClass("active");
    var promises = [];

    //create new card if the person doesn't have any account
    if (!$scope.pledgeLevel) {
      if ($scope.company.name) {
        promises.push(Restangular.one('account/business/guest').customPOST($scope.company));
      }
      promises.push(StripeService.newGuestPledgerAccount($scope.creditCard));

    }


    //for rewards
    if ($scope.pledgeLevel) {
      //check for company name
      promises.push(StripeService.newGuestPledgerAccount($scope.creditCard));

      if ($scope.company.name) {
        promises.push(Restangular.one('account/business/guest').customPOST($scope.company));
      }
      //if there is shipping
      if ($scope.campaign.pledges[$scope.pledgeindex].shipping) {

        promises.push(Restangular.one('account/address/guest').customPOST($scope.address));

      }

    }
    // wait until all the above requests return promises and got resolved
    $q.all(promises).then(function(resolved) {
      // loop through the results and find value
      angular.forEach(resolved, function(value) {
        if (value.card_id) {
          $scope.guest_card_id = value.card_id;

          $scope.guest_fingerprint = value.fingerprint;

        }
        if (value.address_id) {
          $scope.selectedAddressID = value.address_id;
        }
      });

      // setup the object for POST request
      var pledgeInfo = {
        pledge_level_id: $scope.pledgeLevel,
        amount: $scope.totalAmount,
        shipping_address_id: $scope.selectedAddressID || '',
        card_id: $scope.guest_card_id,
        fingerprint: $scope.guest_fingerprint,
        email: $scope.creditCard.email,
        last_name: $scope.creditCard.last_name,
        first_name: $scope.creditCard.first_name
      };

      // submit pledge
      Restangular.one('campaign', $scope.campaign_id).one('pledge/guest').customPOST(pledgeInfo).then(function(success) {

        $scope.responseMsg = "Thank you for your contribution";
        $('.thank-you').dimmer({
          closable: false
        }).dimmer('show');
        // put campaign_backer in User
        var data = {
          campaign_backer: 1,
        };

      }, function(failed) {
        $("div.loader").removeClass("active");
        $scope.responseMsg = 'Invalid Card';
      });

    }, function(failed) {
      $("div.loader").removeClass("active");
      $scope.responseMsg = failed.data.message;


    });
  };



  $scope.openModalById = function(id) {
    $('.ui.modal#' + id).modal('show');
  };


  // Prepare data caching for location filter
  $scope.cities = [];

  // search city input
  $scope.searchCities = function(term) {
    var cityID = null; // variable to hold city ID
    var countryID = null;
    if (term) {
      Geolocator.searchCities(term).then(function(cities) {
        $scope.cities = cities;
      });
    }

  };
  // watching variable changes
  $scope.$watch('selectedCity.selected', function(value) {
    if (value) {
      cityID = Geolocator.lookupCityID(value.name);

      if (cityID) {
        $scope.address.city_id = cityID;
      }
      countryID = Geolocator.lookupCountryID(value.name);
      if (countryID) {
        $scope.address.country_id = countryID;
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

  $scope.goBackToCampaign = function() {
    $location.path('/campaign/' + $scope.campaign.entry_id + "/" + $scope.campaign.name);
  }

  $scope.total = function(shipping) {
    if (shipping) {
      $scope.totalAmount = parseInt($scope.pledgeAmount) + parseInt(shipping);
    } else {
      $scope.totalAmount = $scope.pledgeAmount;
    }
    return $scope.totalAmount;
  }

});
