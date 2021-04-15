
app.service('PaypalService', function($q, PortalSettingsService) {
  var pp = {};

  // check if the paypal sdk is loaded
  pp.isInitialized = function(){
    return (typeof paypal !== 'undefined')
  }
  
  // initialize the paypal sdk
  pp.init = function(campaign){
    return $q(function(resolve, reject){
      if(!pp.isInitialized()){
        PortalSettingsService.getSettingsObj().then(function(settings) {
          // Add Paypal sdk to page if client id is set and payment gateway is 3(paypal).
          if(settings.public_setting.site_payment_gateway == 3 && settings.public_setting.paypal_publishable_key) {
            var currency = "USD";
            if(settings.public_setting.site_campaign_fee_currency.length > 0) {
              currency = settings.public_setting.site_campaign_fee_currency[0].code_iso4217_alpha;
            }
            if(campaign.currencies.length > 0) {
              currency = campaign.currencies[0].code_iso4217_alpha;
            }

            var node = document.createElement('script'); 
            node.src = 'https://www.paypal.com/sdk/js?client-id='+settings.public_setting.paypal_publishable_key+'&intent=capture&components=buttons&disable-funding=credit&currency='+currency;
            node.type = 'text/javascript'; 
            node.async = true; 
            node.onload = function(){resolve(true)};
            node.onerror = function(){reject(false)};
            node.charset = 'utf-8';
            document.getElementsByTagName('head')[0].appendChild(node); 
          }
        });
      } else {
        resolve(true);
      }
    });
  };

  return pp;
});