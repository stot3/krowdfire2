import {Injectable} from "@angular/core"
import {Http} from "@angular/http"
import {ConstantsGlobal} from "../Constants-Global"

@Injectable()
export class PledgeService {
  
  constructor(private http: Http) {
  }

  /**
   * Get Stripe account
   * @return {Promise}
   */
  pledge(pledgeInfo, campaign_id, stripe_pledge, stripe_tip){

    //make compatible with error handling in PledgeCampaignCtrl
    var failed = {
      data: {
        code: 'payment_failed'
      }
    }

    pledgeInfo.use_sca = 1;

    let postData = (url, data) => new Promise<any>((resolve, reject) =>{
      let headers = {
        'Content-type': 'application/json',
      }
      fetch(url, {
        method: 'POST', 
        headers,
        credentials: 'include',
        body: JSON.stringify(data)
      }).then(res => {
        if(!res.ok){
          reject(failed);
        }
        resolve(res.json())
      }).catch(error => {
        reject(failed);
      })
    });

   return new Promise((resolve, reject) => {
      postData(ConstantsGlobal.getApiUrlCampaign()+campaign_id+'/pledge', pledgeInfo).then(
        success => {
        var successful_pledge: any = success;
        // pledge and tip authentication
        if(success.payment_intent_status == "requires_action" && success.payment_intent_status_tip == "requires_action"){
          stripe_pledge.handleCardAction(success.payment_intent_client_secret).then(function(pi){
            if(pi.error){
              reject(failed);
            }
            postData(ConstantsGlobal.getApiUrl()+'account/stripe/payment-intent-direct/confirm/'+success.charge_id,
            {stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id}).then((res) => {
              stripe_tip.handleCardAction(success.payment_intent_client_secret_tip).then(function(pi_tip){
                if(pi_tip.error){
                  successful_pledge.amount_tip = 0;
                  resolve(successful_pledge);
                } else {
                  postData(ConstantsGlobal.getApiUrl()+'account/stripe/payment-intent-direct/confirm/'+success.charge_id_tip, 
                  {stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id, tip_transaction: 1}).then((res) => {
                    resolve(successful_pledge);
                  }).catch(error => {
                    reject(failed);
                  });
                }
              }).catch(function(){
                reject(failed);
              }); 
            }).catch(error => {
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
              let url = ConstantsGlobal.getApiUrl()+'account/stripe/payment-intent-direct/confirm/'+success.charge_id;
              let data = { stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id };
              postData(url, data).then(
                res => {
                  resolve(successful_pledge);
                }).catch( error => {
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
              postData(ConstantsGlobal.getApiUrl()+'account/stripe/payment-intent-direct/confirm/'+success.charge_id_tip,
              {stripe_transaction_id: success.stripe_transaction_id, entry_id: campaign_id, tip_transaction: 1}).then((res) => {
                resolve(successful_pledge);
              }).catch(error => {
                reject(failed);
              });
            }
          }).catch(function(){
            reject(failed);
          });
        } else {
          resolve(successful_pledge);
        }
      }).catch(error => {
        reject()
      });
    });
  }


  /**
   * Get Stripe account
   * @return {Promise}
   */
   paypalPledge(pledgeInfo, campaign_id, paypal_order_id){

    //make compatible with error handling in PledgeCampaignCtrl
    var failed = {
      data: {
        code: 'payment_failed'
      }
    }

    pledgeInfo.use_sca = 0;
    pledgeInfo.paypal_order_id = paypal_order_id;

    delete pledgeInfo.stripe_account_card_id

    let postData = (url, data) => new Promise<any>((resolve, reject) =>{
      let headers = {
        'Content-type': 'application/json',
      }
      fetch(url, {
        method: 'POST', 
        headers,
        credentials: 'include',
        body: JSON.stringify(data)
      }).then(res => {
        if(!res.ok){
          reject(failed);
        }
        resolve(res.json())
      }).catch(error => {
        reject(failed);
      })
    });

   return new Promise((resolve, reject) => {
      postData(ConstantsGlobal.getApiUrlCampaign()+campaign_id+'/pledge', pledgeInfo).then(
        success => {
        var successful_pledge: any = success;

        resolve(successful_pledge);
      }).catch(error => {
        reject()
      });
    });
  }
}
