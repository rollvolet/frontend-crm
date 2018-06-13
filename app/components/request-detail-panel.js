import Component from '@ember/component';

export default Component.extend({
  model: null,

  actions: {
    reloadVisit() {
      this.model.belongsTo('visit').reload();
    }
  }
});
