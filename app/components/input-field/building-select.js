import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { proxyAware } from '../../utils/proxy-aware';

@classic
export default class BuildingSelect extends Component {
  @service store;

  @proxyAware('value')
  selected;

  didReceiveAttrs() {
    if (this.customer) {
      // TODO replace ember-data-has-many-query with ember-storefront
      // By using query we force ember-data to reload the relationship.
      // Ember data may otherwise assume it has already loaded the relation when it only fetched 1 page
      this.customer.query('buildings', {
        page: { size: 1000 }
      }).then((buildings) => this.set('options', buildings));
    }
  }

  customer = null;
  label = 'Gebouw';
  value = null;
  onSelectionChange = null;
}
