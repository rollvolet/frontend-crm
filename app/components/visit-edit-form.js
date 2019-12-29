import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { eq, or, not, raw } from 'ember-awesome-macros';

@classic
@tagName('')
export default class VisitEditForm extends Component {
  @service
  store;

  model = null;
  save = null;

  @not(or('requiresTimeRange', 'requiresSingleTime'))
  requiresNoTime;

  @eq('model.period', raw('van-tot'))
  requiresTimeRange;

  @or(
    eq('model.period', raw('vanaf')),
    eq('model.period', raw('bepaald uur')),
    eq('model.period', raw('stipt uur')),
    eq('model.period', raw('benaderend uur'))
  )
  requiresSingleTime;

  @action
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
