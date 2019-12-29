import classic from 'ember-classic-decorator';
import Component from '@ember/component';

@classic
export default class InvoiceSupplementsTable extends Component {
  model = null;
  isDisabledEdit = true;
}
