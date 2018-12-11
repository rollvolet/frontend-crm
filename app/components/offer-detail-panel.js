import Component from '@ember/component';

export default Component.extend({
  model: null,

  actions: {
    async reloadVisit() {
      const request = await this.model.request;
      request.belongsTo('visit').reload();
    }
  }
});
