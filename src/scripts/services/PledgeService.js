app.service('PledgeService', function(Restangular, $translate) {
  var pledge = {};

  pledge.makePledge = function(pledgeInfo, campaign_id, stripe_pledge, stripe_tip){

    //make compatible with error handling in PledgeCampaignCtrl
    var failed = {
      data: {
        code: $translate.instant('payment_failed')
      }
    }

    return new Promise(function(resolve, reject){
      Restangular.one('campaign', campaign_id).one('pledge').customPOST(pledgeInfo).then(function(success){
        var successful_pledge = success;
        // pledge and tip authentication
        if(success.payment_intent_status == "requires_action" && success.payment_intent_status_tip == "requires_action"){
          stripe_pledge.handleCardAction(success.payment_intent_client_secret).then(function(pi){
            if(pi.error){
              reject(failed);
            }
            Restangular.one('account/stripe/payment-intent-direct/confirm/'+success.charge_id)
            .customPOST({stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id}).then(function(){
              stripe_tip.handleCardAction(success.payment_intent_client_secret_tip).then(function(pi_tip){
                if(pi_tip.error){
                  successful_pledge.amount_tip = 0;
                  resolve(successful_pledge);
                } else {
                  Restangular.one('account/stripe/payment-intent-direct/confirm/'+success.charge_id_tip)
                  .customPOST({stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id, tip_transaction: 1}).then(function(){
                    resolve(successful_pledge);
                  }).catch(function(){
                    reject(failed);
                  });
                }
              }).catch(function(){
                reject(failed);
              }); 
            }).catch(function(){
              reject(failed);
            })
          }).catch(function(){
            reject(failed);
          }) 
        }
        // stripe 3D secure pledge authenticiation
        else if(success.payment_intent_status == "requires_action"){
          stripe_pledge.handleCardAction(success.payment_intent_client_secret).then(function(pi){
            if(pi.error){
              reject(failed);
            } else {
              console.log(pi);
              Restangular.one('account/stripe/payment-intent-direct/confirm/'+success.charge_id)
              .customPOST({stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id}).then(function(){
                resolve(successful_pledge);
              }).catch(function(){
                reject(failed)
              });
            }
          }).catch(function(){
            reject(failed);
          });
        }
        //tip authentication
        else if(success.payment_intent_status_tip == "requires_action"){
          stripe_tip.handleCardAction(success.payment_intent_client_secret_tip).then(function(pi_tip){
            if(pi_tip.error){
              successful_pledge.amount_tip = 0;
              resolve(successful_pledge);
            } else {
              Restangular.one('account/stripe/payment-intent-direct/confirm/'+success.charge_id_tip)
              .customPOST({stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id, tip_transaction: 1}).then(function(){
                resolve(successful_pledge);
              }).catch(function(){
                reject(failed);
              });
            }
          }).catch(function(){
            reject(failed);
          });
        } else {
          resolve(successful_pledge);
        }
      }).catch(function(){
        reject()
      });
    });
  }

  pledge.retryPledge = function(pledgeInfo, campaign_id, pledge_transaction_id, stripe_pledge, stripe_tip){

    //make compatible with error handling in PledgeCampaignCtrl
    var failed = {
      data: {
        code: $translate.instant('payment_failed')
      }
    }

    return new Promise(function(resolve, reject){
      Restangular.one('campaign', campaign_id).one('pledge-transaction', pledge_transaction_id).customPUT(pledgeInfo).then(function(success) {
        var successful_pledge = success;
        // pledge and tip authentication
        if(success.payment_intent_status == "requires_action" && success.payment_intent_status_tip == "requires_action"){
          stripe_pledge.handleCardAction(success.payment_intent_client_secret).then(function(pi){
            if(pi.error){
              reject(failed);
            }
            Restangular.one('account/stripe/payment-intent-direct/confirm/'+success.charge_id)
            .customPOST({stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id}).then(function(){
              stripe_tip.handleCardAction(success.payment_intent_client_secret_tip).then(function(pi_tip){
                if(pi_tip.error){
                  successful_pledge.amount_tip = 0;
                  resolve(successful_pledge);
                } else {
                  Restangular.one('account/stripe/payment-intent-direct/confirm/'+success.charge_id_tip)
                  .customPOST({stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id, tip_transaction: 1}).then(function(){
                    resolve(successful_pledge);
                  }).catch(function(){
                    reject(failed);
                  });
                }
              }).catch(function(){
                reject(failed);
              }); 
            }).catch(function(){
              reject(failed);
            })
          }).catch(function(){
            reject(failed);
          }) 
        }
        // stripe 3D secure pledge authenticiation
        else if(success.payment_intent_status == "requires_action"){
          stripe_pledge.handleCardAction(success.payment_intent_client_secret).then(function(pi){
            if(pi.error){
              reject(failed);
            } else {
              console.log(pi);
              Restangular.one('account/stripe/payment-intent-direct/confirm/'+success.charge_id)
              .customPOST({stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id}).then(function(){
                resolve(successful_pledge);
              }).catch(function(){
                reject(failed)
              });
            }
          }).catch(function(){
            reject(failed);
          });
        }
        //tip authentication
        else if(success.payment_intent_status_tip == "requires_action"){
          stripe_tip.handleCardAction(success.payment_intent_client_secret_tip).then(function(pi_tip){
            if(pi_tip.error){
              successful_pledge.amount_tip = 0;
              resolve(successful_pledge);
            } else {
              Restangular.one('account/stripe/payment-intent-direct/confirm/'+success.charge_id_tip)
              .customPOST({stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id, tip_transaction: 1}).then(function(){
                resolve(successful_pledge);
              }).catch(function(){
                reject(failed);
              });
            }
          }).catch(function(){
            reject(failed);
          });
        } else {
          resolve(successful_pledge);
        }
      }).catch(function(){
        reject(failed);
      });
    });
  }

  return pledge;
});