import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import snippets from '../../../../../config/snippets';

export default Route.extend({
  case: service(),
  store: service(),

  async model() {
    const customer = this.modelFor('main.case');
    const request = this.modelFor('main.case.request.edit');
    const contact = await request.get('contact');
    const building = await request.get('building');
    const vatRate = this.store.peekAll('vat-rate').find(v => v.rate == 21);

    let languageCode;
    if (contact) {
      const lang = await contact.get('language');
      languageCode = lang && lang.code;
    } else if (customer) {
      const lang = await customer.get('language');
      languageCode = lang && lang.code;
    }
    if (!['NED', 'FRA'].includes(languageCode))
      languageCode = 'NED';

    const offer = this.store.createRecord('offer', {
      offerDate: new Date(),
      documentIntro: snippets[languageCode]['offerDocumentIntro'],
      documentOutro: snippets[languageCode]['offerDocumentOutro'],
      documentVersion: 'v1',
      vatRate,
      customer,
      request,
      contact,
      building
    });

    return offer.save();
  },
  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.offer.edit', customer, model, {
      queryParams: { editMode: true }
    });

    // update case to display the new offer tab
    this.case.updateRecord('offer', model);
  }
});
