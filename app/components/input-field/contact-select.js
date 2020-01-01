import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { proxyAware } from '../../utils/proxy-aware';

@classic
export default class ContactSelect extends Component {
  @service store;

  @proxyAware('value')
  selected;

  didReceiveAttrs() {
    if (this.customer) {
      // TODO replace ember-data-has-many-query with ember-storefront
      // By using query we force ember-data to reload the relationship.
      // Ember data may otherwise assume it has already loaded the relation when it only fetched 1 page
      this.customer.query('contacts', {
        page: { size: 1000 }
      }).then((contacts) => this.set('options', contacts));
    }
  }

  customer = null;
  label = 'Contact';
  value = null;
  onSelectionChange = null;
}
