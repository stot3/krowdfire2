app.controller('CreditCardFormCtrl', function($scope, $translate, PortalSettingsService) {

  $translate(["credit_card_form_card_name", "credit_card_form_card_number", "credit_card_form_exp_month", "credit_card_form_exp_year", "credit_card_form_cvc"]).then(function(translations) {
    var translationCardNum = translations.credit_card_form_card_number;
    var translationExpMonth = translations.credit_card_form_exp_month;
    var translationExpYear = translations.credit_card_form_exp_year;
    var translationCVC = translations.credit_card_form_cvc;
    var translationCardName = translations.credit_card_form_card_name;


    if ($scope.site_stripe_tokenization_settings && $scope.site_stripe_tokenization_settings.toggle) {
      $('#credit-card-info').form({
        card_number: {
          identifier: 'cardnumber',
          rules: [{
            type: 'empty',
            prompt: translationCardNum
          }]
        },
        exp_month: {
          identifier: 'exp-date',
          rules: [{
            type: 'empty',
            prompt: translationExpMonth
          }, {
            type: 'maxLength[4]',
            prompt: translationExpMonth
          }]
        },
        cvc: {
          identifier: 'cvc',
          rules: [{
            type: 'empty',
            prompt: translationCVC
          }]
        },
        stripeCardName: {
          identifier: 'stripeCardName',
          rules: [{
            type: 'empty',
            prompt: translationCardName
          }]
        }
      }, {
        inline: true,
      });

    } else {
      $('#credit-card-info').form({
        card_number: {
          identifier: 'card-number',
          rules: [{
            type: 'empty',
            prompt: translationCardNum
          }]
        },
        exp_month: {
          identifier: 'exp-month',
          rules: [{
            type: 'empty',
            prompt: translationExpMonth
          }, {
            type: 'maxLength[2]',
            prompt: translationExpMonth
          }]
        },
        exp_year: {
          identifier: 'exp-year',
          rules: [{
            type: 'empty',
            prompt: translationExpYear
          }, {
            type: 'maxLength[4]',
            prompt: translationExpYear
          }]
        },
        cvc: {
          identifier: 'cvc',
          rules: [{
            type: 'empty',
            prompt: translationCVC
          }]
        },
      }, {
        inline: true,
      });
    }

  });
});