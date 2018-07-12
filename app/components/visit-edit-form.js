import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { eq, or, not } from 'ember-awesome-macros';
import raw from 'ember-macro-helpers/raw';

export default Component.extend({
  tagName: '',
  store: service(),

  model: null,

  init() {
    this._super(...arguments);
    this.model.then((visit) => {
      if (visit && visit.visitor) {
        const visitor = this.store.peekAll('employee').find(e => e.firstName == visit.visitor);
        this.set('visitor', visitor);
      }
    });
  },

  requiresNoTime: not(or('requiresTimeRange', 'requiresSingleTime')),
  requiresTimeRange: eq('model.period', raw('van-tot')),
  requiresSingleTime: or(
    eq('model.period', raw('vanaf')),
    eq('model.period', raw('bepaald uur')),
    eq('model.period', raw('stipt uur')),
    eq('model.period', raw('benaderend uur'))),

  save: task(function * () {
    const visit = yield this.model;
    const { validations } = yield visit.validate();
    if (validations.isValid)
      yield visit.save();
  }),

  actions: {
    setVisitor(visitor) {
      this.set('visitor', visitor);
      const firstName = visitor ? visitor.firstName : null;
      this.model.set('visitor', firstName);
    },
    changePeriod(period) {
      this.model.set('period', period);

      if (period) {
        if (this.requiresSingleTime) {
          this.model.set('untilHour', null);
        } else if (this.requiresNoTime) {
          this.model.set('fromHour', null);
          this.model.set('untilHour', null);
        }
      }
      this.save.perform();
    }
  }
});
