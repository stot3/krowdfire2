import { Injectable } from '@angular/core';

declare var Stripe: any;

export class StripeElement {
  public card: any;
  public stripe: any;
  public element: any;

  public cardNumber: any;
  public cardExpiry: any; 
  public cardCvc: any;

  constructor(public toggle: Boolean, public stripePublicKey: String) {
    if(toggle) {
      var stripe = this.setStripe(this.stripe, stripePublicKey);
      var element = this.createElement(this.stripe);
    }
  } 
  clearElements() {
    this.cardNumber.clear();
    this.cardExpiry.clear();
    this.cardCvc.clear();
  }
  getCard(type: string) {
    if(type == 'cardNumber') {
      return this.cardNumber;
    } else if(type == 'cardExpiry') {
      return this.cardExpiry;
    } else if(type == 'cardCvc') {
      return this.cardCvc;
    } else {
      return null;
    }
  }

  setCart(card) {
    this.card = card;
  }

  createCard(elementType: string, placeholder: string) {
    var style = {
      base: {
        iconColor: '#A3A3A3',
        color: '#000000',
        fontWeight: 400,
        fontFamily: 'Lato,"Helvetica Neue0",Arial,Helvetica,sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#9B9B9B',
        },
      },
      invalid: {
        color: '#9F3A38',
        fontWeight: 400,
        ':focus': {
          color: '#9F3A38',
        },
      },
    };

    if(this.getCard(elementType) == null) {
      var card = this.getElement().create(elementType, {
        placeholder: placeholder,
        hidePostalCode: true,
        style: style
      });
      if(elementType == 'cardNumber') {
        this.cardNumber = card;
      } else if(elementType == 'cardExpiry') {
        this.cardExpiry = card;
      } else if(elementType == 'cardCvc') {
        this.cardCvc = card;
      }
    }
  }

  getStripe() {
    return this.stripe;
  }

  setStripe(stripe, public_key) {
    stripe = Stripe(public_key);
    this.stripe = stripe;
  }

  getElement() {
    return this.element;
  }
  
  setElement(element) {
    this.element = element;
  }

  createElement(stripe) {
    var element = stripe.elements();
    this.element = element;
    return element;
  }
}