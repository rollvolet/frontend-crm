import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import snippets from '../../../../../config/snippets';
import getDocumentLanguageCode from '../../../../../utils/get-document-language-code';

export default class OfferRoute extends Route {
  @service case;

  async model() {
    const customer = this.modelFor('main.case');
    const request = this.modelFor('main.case.request.edit');
    const contact = await request.contact;
    const building = await request.building;
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 21);
    const languageCode = await getDocumentLanguageCode({ customer, contact });

    const offer = this.store.createRecord('offer', {
      offerDate: new Date(),
      documentIntro: snippets[languageCode]['offerDocumentIntro'],
      documentOutro: snippets[languageCode]['offerDocumentOutro'],
      documentVersion: 'v1',
      vatRate,
      customer,
      request,
      contact,
      building,
    });

    return offer.save();
  }

  afterModel(model) {
    // update case to display the new offer tab
    this.case.updateRecord('offer', model);

    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.offer.edit', customer, model, {
      queryParams: { editMode: true },
    });
  }
}
