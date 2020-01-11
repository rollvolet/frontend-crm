import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import { sort } from '@ember/object/computed';

@classic
export default class OfferlinesDetailPanel extends Component {
  sorting = Object.freeze(['sequenceNumber']);
  @sort('model', 'sorting') sortedOfferlines;
}
