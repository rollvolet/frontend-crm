import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Component from '@ember/component';
import PellOptions from '../mixins/pell-options';

@classic
export default class InvoiceEditForm extends Component.extend(PellOptions) {
  model = null;
  save = null;

  @action
  setVatRate(vatRate) {
    this.set('model.vatRate', vatRate);
    this.set('model.certificateRequired', vatRate.rate == 6);
  }
}
