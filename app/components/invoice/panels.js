import Component from '@glimmer/component';
import { trackedFunction } from 'ember-resources/util/function';

export default class InvoicePanelsComponent extends Component {
  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  get case() {
    return this.caseData.value;
  }

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess || this.case?.isCancelled;
  }
}
