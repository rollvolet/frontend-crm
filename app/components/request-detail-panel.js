import classic from 'ember-classic-decorator';
import { notEmpty } from '@ember/object/computed';
import Component from '@ember/component';

@classic
export default class RequestDetailPanel extends Component {
  model = null;

  @notEmpty('model.customer.id')
  isLinkedToCustomer;
}
