app.service("PledgeService",["Restangular","$translate",function(Restangular,$translate){var pledge={makePledge:function(pledgeInfo,campaign_id,stripe_pledge,stripe_tip){var failed={data:{code:$translate.instant("payment_failed")}};return new Promise((function(resolve,reject){Restangular.one("campaign",campaign_id).one("pledge").customPOST(pledgeInfo).then((function(success){var successful_pledge=success;"requires_action"==success.payment_intent_status&&"requires_action"==success.payment_intent_status_tip?stripe_pledge.handleCardAction(success.payment_intent_client_secret).then((function(pi){pi.error&&reject(failed),Restangular.one("account/stripe/payment-intent-direct/confirm/"+success.charge_id).customPOST({stripe_transaction_id:success.stripe_transaction_id,entry_id:campaign_id}).then((function(){stripe_tip.handleCardAction(success.payment_intent_client_secret_tip).then((function(pi_tip){pi_tip.error?(successful_pledge.amount_tip=0,resolve(successful_pledge)):Restangular.one("account/stripe/payment-intent-direct/confirm/"+success.charge_id_tip).customPOST({stripe_transaction_id:success.stripe_transaction_id,entry_id:campaign_id,tip_transaction:1}).then((function(){resolve(successful_pledge)})).catch((function(){reject(failed)}))})).catch((function(){reject(failed)}))})).catch((function(){reject(failed)}))})).catch((function(){reject(failed)})):"requires_action"==success.payment_intent_status?stripe_pledge.handleCardAction(success.payment_intent_client_secret).then((function(pi){pi.error?reject(failed):(console.log(pi),Restangular.one("account/stripe/payment-intent-direct/confirm/"+success.charge_id).customPOST({stripe_transaction_id:success.stripe_transaction_id,entry_id:campaign_id}).then((function(){resolve(successful_pledge)})).catch((function(){reject(failed)})))})).catch((function(){reject(failed)})):"requires_action"==success.payment_intent_status_tip?stripe_tip.handleCardAction(success.payment_intent_client_secret_tip).then((function(pi_tip){pi_tip.error?(successful_pledge.amount_tip=0,resolve(successful_pledge)):Restangular.one("account/stripe/payment-intent-direct/confirm/"+success.charge_id_tip).customPOST({stripe_transaction_id:success.stripe_transaction_id,entry_id:campaign_id,tip_transaction:1}).then((function(){resolve(successful_pledge)})).catch((function(){reject(failed)}))})).catch((function(){reject(failed)})):resolve(successful_pledge)})).catch((function(){reject()}))}))},retryPledge:function(pledgeInfo,campaign_id,pledge_transaction_id,stripe_pledge,stripe_tip){var failed={data:{code:$translate.instant("payment_failed")}};return new Promise((function(resolve,reject){Restangular.one("campaign",campaign_id).one("pledge-transaction",pledge_transaction_id).customPUT(pledgeInfo).then((function(success){var successful_pledge=success;"requires_action"==success.payment_intent_status&&"requires_action"==success.payment_intent_status_tip?stripe_pledge.handleCardAction(success.payment_intent_client_secret).then((function(pi){pi.error&&reject(failed),Restangular.one("account/stripe/payment-intent-direct/confirm/"+success.charge_id).customPOST({stripe_transaction_id:success.stripe_transaction_id,entry_id:campaign_id}).then((function(){stripe_tip.handleCardAction(success.payment_intent_client_secret_tip).then((function(pi_tip){pi_tip.error?(successful_pledge.amount_tip=0,resolve(successful_pledge)):Restangular.one("account/stripe/payment-intent-direct/confirm/"+success.charge_id_tip).customPOST({stripe_transaction_id:success.stripe_transaction_id,entry_id:campaign_id,tip_transaction:1}).then((function(){resolve(successful_pledge)})).catch((function(){reject(failed)}))})).catch((function(){reject(failed)}))})).catch((function(){reject(failed)}))})).catch((function(){reject(failed)})):"requires_action"==success.payment_intent_status?stripe_pledge.handleCardAction(success.payment_intent_client_secret).then((function(pi){pi.error?reject(failed):(console.log(pi),Restangular.one("account/stripe/payment-intent-direct/confirm/"+success.charge_id).customPOST({stripe_transaction_id:success.stripe_transaction_id,entry_id:campaign_id}).then((function(){resolve(successful_pledge)})).catch((function(){reject(failed)})))})).catch((function(){reject(failed)})):"requires_action"==success.payment_intent_status_tip?stripe_tip.handleCardAction(success.payment_intent_client_secret_tip).then((function(pi_tip){pi_tip.error?(successful_pledge.amount_tip=0,resolve(successful_pledge)):Restangular.one("account/stripe/payment-intent-direct/confirm/"+success.charge_id_tip).customPOST({stripe_transaction_id:success.stripe_transaction_id,entry_id:campaign_id,tip_transaction:1}).then((function(){resolve(successful_pledge)})).catch((function(){reject(failed)}))})).catch((function(){reject(failed)})):resolve(successful_pledge)})).catch((function(){reject(failed)}))}))}};return pledge}]);