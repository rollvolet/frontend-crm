import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { eq, or, not, raw } from 'ember-awesome-macros';

export default Component.extend({
  tagName: '',
  store: service(),

  model: null,
  save: null,

  requiresNoTime: not(or('requiresTimeRange', 'requiresSingleTime')),
  requiresTimeRange: eq('model.period', raw('van-tot')),
  requiresSingleTime: or(
    eq('model.period', raw('vanaf')),
    eq('model.period', raw('bepaald uur')),
    eq('model.period', raw('stipt uur')),
    eq('model.period', raw('benaderend uur'))),

  actions: {
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
