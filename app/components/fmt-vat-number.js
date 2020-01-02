import Component from '@glimmer/component';
import formatVatNumber from '../utils/format-vat-number';

export default class FmtVatNumberComponent extends Component {
  get formattedValue() {
    return formatVatNumber(this.args.value);
  }
}
