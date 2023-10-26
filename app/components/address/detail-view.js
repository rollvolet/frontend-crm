import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class AddressDetailViewComponent extends Component {
  @service codelist;

  get isDefaultCountry() {
    return this.args.model?.get('country.id') == this.codelist.defaultCountry?.id;
  }

  get showCountry() {
    // Don't show country if no other address details are available
    return this.args.model?.get('postalCode') && !this.isDefaultCountry;
  }
}
