import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';

export default Component.extend({
  classNames: ['ember-stripe-element'],

  autofocus: false,
  options: null,
  stripeElement: null,
  stripeError: null,
  type: null, // Set in components that extend from `stripe-element`

  init() {
    this._super(...arguments);
    set(this, 'options', {});
  },

  stripev3: service(),
  elements: computed(function() {
    return get(this, 'stripev3.elements')();
  }),

  didInsertElement() {
    this._super(...arguments);

    // Fetch user options
    let options = get(this, 'options');

    // Fetch `type` set by child component
    let type = get(this, 'type');

    // `stripeElement` instead of `element` to distinguish from `this.element`
    let stripeElement = get(this, 'elements').create(type, options);

    // Mount the Stripe Element onto the mount point
    stripeElement.mount(this.element.querySelector('[role="mount-point"]'));

    // Make the element available to the component
    set(this, 'stripeElement', stripeElement);

    // Set the event listeners
    this.setEventListeners();
  },

  didRender() {
    this._super(...arguments);
    // Fetch autofocus, set by user
    let autofocus = get(this, 'autofocus');
    let stripeElement = get(this, 'stripeElement');
    let iframe = this.element.querySelector('iframe')
    if (autofocus && iframe) {
      iframe.onload = () => {
        stripeElement.focus();
      };
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);
    get(this, 'stripeElement').update(get(this, 'options'));
  },

  willDestroyElement() {
    this._super(...arguments);
    get(this, 'stripeElement').unmount();
  },

  setEventListeners() {
    let stripeElement = get(this, 'stripeElement');
    stripeElement.on('ready', (event) => this.ready(stripeElement, event));
    stripeElement.on('blur', (event) => this.blur(stripeElement, event));
    stripeElement.on('focus', (event) => this.focus(stripeElement, event));
    stripeElement.on('change', (...args) => {
      let [{ complete, error: stripeError }] = args;
      this.change(stripeElement, ...args);

      if (complete) {
        this.complete(stripeElement);
      } else if (stripeError) {
        this.error(stripeError);
      }

      set(this, 'stripeError', stripeError);
    });
  },

  ready() { },
  blur() { },
  focus() { },
  change() { },
  complete() { },
  error() { }
});
