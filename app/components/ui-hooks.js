import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  didInsertHook() {},
  willDestroyHook() {},

  didInsertElement() {
    this._super(...arguments);

    this.didInsertHook();
  },

  willDestroyElement() {
    this._super(...arguments);

    this.willDestroyHook();
  }
});
