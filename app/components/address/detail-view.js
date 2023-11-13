import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class AddressDetailViewComponent extends Component {
  @service codelist;

  get isEmberDataRecord() {
    return this.args.model?.get;
  }

  get isDefaultCountry() {
    const countryId = this.isEmberDataRecord
      ? this.args.model?.get('country.id')
      : this.args.model?.countryId;
    return countryId == this.codelist.defaultCountry?.id;
  }

  get showCountry() {
    const hasPostalCode = this.isEmberDataRecord
      ? this.args.model.get('postalCode')
      : this.args.model?.postalCode;
    // Don't show country if no other address details are available
    return hasPostalCode && !this.isDefaultCountry;
  }
}
