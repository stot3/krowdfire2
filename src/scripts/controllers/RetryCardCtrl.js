app.controller('RetryCardCtrl', function($scope, $rootScope, $routeParams, $location, Restangular, UserService, $translatePartialLoader, $translate, StripeService, PledgeService, $timeout, PortalSettingsService) {
  $scope.card = {};
  var userId = UserService.id;
  var campaign_id = $routeParams.campaign_id;
  var pledge_level_id = $routeParams.pledge_level_id;
  var pledge_transaction_id = $routeParams.pledge_transaction_id;
  $scope.method = '';


  $scope.payment_intent_client_secret = $routeParams.payment_intent_client_secret;
  $scope.payment_intent_status = $routeParams.payment_intent_status;
  $scope.payment_intent_client_secret_tip = $routeParams.payment_intent_client_secret_tip;
  $scope.payment_intent_status_tip = $routeParams.payment_intent_status_tip;
  var payment_method_id = $routeParams.payment_method;
  var payment_method_tip_id = $routeParams.payment_method_tip;
  var code = $routeParams.code;
  var code_tip = $routeParams.code_tip;
  var use_sca = $routeParams.use_sca;
  var retry_pledge_token = $routeParams.retry_pledge_token;

  var payment_method = {};
  var payment_method_tip = {};

  $scope.requiresAuthentication = false;

  $scope.selectMethod = function(method){
    $scope.method = method;
  }

  if(
    ($scope.payment_intent_status == 'requires_payment_method' && code == 'authentication_required')
    ||
    ($scope.payment_intent_status_tip == 'requires_payment_method' && code_tip == 'authentication_required')
  ){
    $scope.requiresAuthentication = true;
  }

  var pledgeSuccessMessage = function() {
    $scope.retrySuccess = true;
    $('.repledge-thank-you').modal('show');
    delete $scope.failedMessage;
  }

  var pledgeFailMessage = function() {
    $scope.requiresAuthentication = false
    $('#authentication-failed').modal('show');
    $scope.$apply();
  }

  PortalSettingsService.getSettingsObj().then(function(settings){
    $scope.site_stripe_tokenization_settings = settings.public_setting.site_stripe_tokenization;
    Restangular.one('campaign', $routeParams.campaign_id).customGET().then(function(campaign){
      var stripe = Stripe($scope.site_stripe_tokenization_settings.public_stripe_key);
      var stripe_pledge = Stripe($scope.site_stripe_tokenization_settings.public_stripe_key);
      var stripe_tip = stripe_pledge;
      
      if(!settings.public_setting.site_campaign_fee_direct_transaction && settings.public_setting.stripe_standard_mode && campaign.managers[0] && campaign.managers[0].publishable_key){
        stripe_pledge = Stripe(campaign.managers[0].publishable_key);
      }

    $scope.initStripeElement = function() {

      var translation = $translate.instant(['pledge_campaign_stripe_elements_cardExpirey', 'pledge_campaign_stripe_elements_cardNumber', 'pledge_campaign_creditcard_cvc_placeholder']);

      $scope.elements = stripe.elements();

      var cardBrandToPfClass = {
        'visa': 'pf-visa',
        'mastercard': 'pf-mastercard',
        'amex': 'pf-american-express',
        'discover': 'pf-discover',
        'diners': 'pf-diners',
        'jcb': 'pf-jcb',
        'unknown': 'pf-credit-card',
      }

      //Styles 
      var style = {
        base: {
          iconColor: '#A3A3A3',
          color: '#000000',
          lineHeight: '16px',
          fontWeight: 400,
          fontFamily: 'Lato,"Helvetica Neue0",Arial,Helvetica,sans-serif',
          fontSize: '14px',
          '::placeholder': {
            color: '#A3A3A3',
          },
        },
        invalid: {
          color: '#d95c5c',
          ':focus': {
            color: '#d95c5c',
          },
        },
      };
      $scope.cardNumberElement = $scope.elements.create('cardNumber', {
        placeholder: translation.pledge_campaign_stripe_elements_cardNumber,
        iconStyle: 'solid',
        style: style
      });
      $scope.cardNumberElement.mount('#card-number-element');

      $scope.cardExpiryElement = $scope.elements.create('cardExpiry', {
        placeholder: translation.pledge_campaign_stripe_elements_cardExpirey,
        iconStyle: 'solid',
        style: style
      });
      $scope.cardExpiryElement.mount('#card-expiry-element');

      $scope.cardCvcElement = $scope.elements.create('cardCvc', {
        placeholder: translation.pledge_campaign_creditcard_cvc_placeholder,
        iconStyle: 'solid',
        style: style
      });
      $scope.cardCvcElement.mount('#card-cvc-element');

      $scope.cardNumberElement.addEventListener('change', function(event) {
        var displayError = angular.element('#card-errors');
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
        // Switch brand logo
        if (event.brand) {
          StripeService.setBrandIcon(event.brand, cardBrandToPfClass);
        }
      });

      $('#brand-icon').css("background-image", "url(images/cards/default-credit-card-icon.png)");

    }

      $scope.authenticateCard = function(){
        if(payment_method_id && payment_method_id.length > 3 && payment_method_id.substring(0, 4) == 'tok_'){
          payment_method = { 
            payment_method: {
              card: {
                token: payment_method_id
              }
            }
          }
        } else {
          payment_method = { 
            payment_method: payment_method_id
          }
        }

        if(payment_method_tip_id && payment_method_tip_id.length > 3 && payment_method_tip_id.substring(0, 4) == 'tok_'){
          payment_method_tip = { 
            payment_method: {
              card: {
                token: payment_method_tip_id
              }
            }
          }
        } else {
          payment_method_tip = { 
            payment_method: payment_method_tip_id
          }
        }

        if(
          ($scope.payment_intent_status == 'requires_payment_method' && code == 'authentication_required')
          ||
          ($scope.payment_intent_status_tip == 'requires_payment_method' && code_tip == 'authentication_required')
        ){
          if(
            ($scope.payment_intent_status == 'requires_payment_method' && code == 'authentication_required')
            &&
            ($scope.payment_intent_status_tip == 'requires_payment_method' && code_tip == 'authentication_required')
          ){
            stripe_pledge.confirmCardPayment($scope.payment_intent_client_secret, payment_method).then(function(pi){
              if(pi.error){
                pledgeFailMessage();
              } else {
                stripe_tip.confirmCardPayment($scope.payment_intent_client_secret_tip, payment_method_tip).then(function(pi){
                  if(pi.error){
                    pledgeFailMessage();
                  } else {
                    Restangular.one('campaign', campaign_id).one('pledge-transaction', pledge_transaction_id).customPUT({
                      sca_confirm_intent_capture: 1,
                      retry_pledge_token: retry_pledge_token,
                      use_sca: 1 
                    }).then(function(success) {
                      pledgeSuccessMessage();
                    });
                  }
                })
              }
            })
          } else if($scope.payment_intent_status == 'requires_payment_method' && code == 'authentication_required'){
            stripe_pledge.confirmCardPayment($scope.payment_intent_client_secret, payment_method).then(function(pi){
              if(pi.error){
                pledgeFailMessage();
              } else {
                Restangular.one('campaign', campaign_id).one('pledge-transaction', pledge_transaction_id).customPUT({
                  sca_confirm_intent_capture: 1,
                  retry_pledge_token: retry_pledge_token,
                  use_sca: 1 
                }).then(function(success) {
                  pledgeSuccessMessage();
                });
              }
            });
          } else if($scope.payment_intent_status_tip == 'requires_payment_method' && code_tip == 'authentication_required'){
            stripe_tip.confirmCardPayment($scope.payment_intent_client_secret_tip, payment_method_tip).then(function(pi){
              if(pi.error){
                pledgeFailMessage();
              } else {
                Restangular.one('campaign', campaign_id).one('pledge-transaction', pledge_transaction_id).customPUT({
                  sca_confirm_intent_capture: 1,
                  retry_pledge_token: retry_pledge_token,
                  use_sca: 1 
                }).then(function(success) {
                  pledgeSuccessMessage();
                });
              }
            })
          }
        }
      }

      $scope.existedCards = [];
      $scope.cardSelected = {};
      $scope.old_card_id = '';
      $scope.new_card_id = '';
      var existedStripeAccountCardId;
      var count = 0;
      $scope.$emit("loading_finished");
      setTimeout(function() {
        $('#propagate').checkbox('check');
      }, 200);

      if (campaign_id) {
        // request get campaign details
        Restangular.one('campaign', campaign_id).customGET().then(function(success) {
          $scope.campaign = success;
        });
      }
      if (pledge_transaction_id) {
        Restangular.one('campaign', campaign_id).one('pledge-transaction', pledge_transaction_id).customGET("", {retry_pledge_token: retry_pledge_token}).then(function(success) {
          $scope.failedContrib = success;
          $scope.failedContrib.amount_total = parseFloat(success.amount)+parseFloat((success.amount_tip || 0))
          $scope.old_card_id = $scope.failedContrib.stripe_account_card_id;
        }, function(failed) {
          if (failed.data.code == 'account_campaign_permission_transaction_entry_backer') {
            $('.ui.modal#wrong-account').modal({
              closable: false
            }).modal('show');
          } else if (failed.data.code == "entity_not_found") {
            $('.ui.modal#not-found-transaction').modal({
              closable: false
            }).modal('show');
          }
        });
      }

      $scope.saveCard = function() {
        var not_validated = !$('#credit-card-info').form('validate form');
        if (not_validated) {
          return;
        }
        $('#retrypledge').addClass('disabled');

        if ($scope.method == 'new') {
          // get account
          StripeService.getPledgerAccount(retry_pledge_token).then(function(account) {
            var account_id = account[0].id;
            // submit card and get card id
            stripe.createToken($scope.cardNumberElement).then(function(result) {
              var data = {
                card_token: result.token.id,
                retry_pledge_token: retry_pledge_token,
              };
              StripeService.newPledgerAccount(data).then(function(result){
                var data = {
                  stripe_transaction_entry_backer_id: account_id,
                  stripe_account_card_id: result.cards[0].stripe_account_card_id,
                  retry_pledge_token: retry_pledge_token
                };
                repledge(data);
              })
            });
          }); 
        } else {
          data = {
            //stripe_account_card_id_previous:$scope.old_card_id
            stripe_transaction_entry_backer_id: userId,
            stripe_account_card_id: existedStripeAccountCardId,
            retry_pledge_token: retry_pledge_token
          };
          repledge(data);
        }
      };

      $scope.submit = function(){
        switch($scope.method){
          case 'authenticate':
            $scope.authenticateCard();
            break;
          case 'new':
          case 'existing':
          default:
            $scope.saveCard();
        }
      }

      function repledge(data) {
        // perform re-pledge
        data.use_sca = 1;
        PledgeService.retryPledge(data, campaign_id, pledge_transaction_id, stripe_pledge, stripe_tip).then(function(){
          $scope.retrySuccess = true;
          $('.repledge-thank-you').modal('show');
        }).catch(function(failed){
          pledgeFailMessage();
          $('#retrypledge').removeClass('disabled');         
        })
      }

      

      $scope.goto = function() {
        $location.path('/explore');
      };

      var m_names = new Array("January", "February", "March",
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December");
      var currdate = new Date();
      $scope.currdate = (m_names[currdate.getMonth()]) + " " + currdate.getDate() + " " + currdate.getFullYear() + " " + currdate.getHours() + ":" + currdate.getMinutes();

      StripeService.getPledgerAccount(retry_pledge_token).then(function(success) {
        $scope.existedCards = success[0].cards;
      });

      $scope.setStripeCardId = function(stripe_account_card_id) {
        existedStripeAccountCardId = stripe_account_card_id;
      }

      $scope.initStripePayment = function() {
        $timeout(function() {
          $("input[name='card-number']").payment("formatCardNumber");
          $("input[name='cvc']").payment("formatCardCVC");
        }, 100);
      }
    });
  });
});

