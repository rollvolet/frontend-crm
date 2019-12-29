import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task } from 'ember-concurrency';

@classic
export default class OfferEditForm extends Component {
  @service
  store;

  model = null;
  save = null;

  init() {
    super.init(...arguments);
    this.initVisitor.perform();
  }

  @(task(function * () {
    const request = yield this.model.request;
    if (request.visitor) {
      const visitor = this.store.peekAll('employee').find(e => e.firstName == request.visitor);
      this.set('visitor', visitor);
    }
  }).keepLatest())
  initVisitor;

  @action
  async setVisitor(visitor) {
    this.set('visitor', visitor);
    const firstName = visitor ? visitor.firstName : null;
    const request = await this.model.request;
    request.set('visitor', firstName);
  }
}
