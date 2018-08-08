import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  didInsert() {},
  willDestroy() {},

  didInsertElement() {
    this._super(...arguments);

    this.get('didInsert')();
  },

  willDestroyElement() {
    this._super(...arguments);

    this.get('willDestroy')();
  }
});
