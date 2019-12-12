import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  store: service(),

  model: null,
  save: null,

  init() {
    this._super(...arguments);
    this.initVisitor.perform();
  },

  initVisitor: task(function * () {
    const request = yield this.model.request;
    if (request.visitor) {
      const visitor = this.store.peekAll('employee').find(e => e.firstName == request.visitor);
      this.set('visitor', visitor);
    }
  }).keepLatest(),

  actions: {
    async setVisitor(visitor) {
      this.set('visitor', visitor);
      const firstName = visitor ? visitor.firstName : null;
      const request = await this.model.request;
      request.set('visitor', firstName);
    }
  }
});
