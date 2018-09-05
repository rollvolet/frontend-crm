import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  didInsertHook() {},
  willDestroyHook() {},

  didInsertElement() {
    this._super(...arguments);

    this.get('didInsertHook')();
  },

  willDestroyElement() {
    this._super(...arguments);

    this.get('willDestroyHook')();
  }
});
