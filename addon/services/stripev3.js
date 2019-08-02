/* global Stripe */
import Service from '@ember/service';
import { getProperties, setProperties } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { resolve } from 'rsvp';
import loadScript from 'ember-stripe-elements/utils/load-script';

// As listed at https://stripe.com/docs/stripe-js/reference#the-stripe-object
const STRIPE_FUNCTIONS = [
  'elements',
  'createToken',
  'createSource',
  'createPaymentMethod',
  'retrieveSource',
  'paymentRequest',
	'redirectToCheckout',
	'retrievePaymentIntent',
	'handleCardPayment',
	'handleCardAction',
	'confirmPaymentIntent',
	'handleCardSetup',
	'retrieveSetupIntent',
	'confirmSetupIntent'
];

export default Service.extend({
  config: null,
  didConfigure: false,
  didLoad: false,

  lazyLoad: readOnly('config.lazyLoad'),
  mock: readOnly('config.mock'),
  publishableKey: readOnly('config.publishableKey'),

  init() {
    this._super(...arguments);

    let lazyLoad = this.get('lazyLoad');
    let mock = this.get('mock');

    if (!lazyLoad || mock) {
      this.configure();
    }
  },

  load() {
    let lazyLoad = this.get('lazyLoad');
    let mock = this.get('mock');
    let shouldLoad = lazyLoad && !mock

    let doLoad = shouldLoad ? loadScript("https://js.stripe.com/v3/") : resolve();

    return doLoad.then(() => {
      this.configure();
      this.set('didLoad', true);
    });
  },

  configure() {
    let didConfigure = this.get('didConfigure');

    if (!didConfigure) {
      let publishableKey = this.get('publishableKey');


      let stripe = new Stripe(publishableKey);
      let functions = getProperties(stripe, STRIPE_FUNCTIONS);
      setProperties(this, functions);

      this.set('didConfigure', true);
    }
  }
});
