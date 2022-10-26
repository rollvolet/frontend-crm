import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import snippets from '../../../../../config/snippets';
import getDocumentLanguageCode from '../../../../../utils/get-document-language-code';

export default class OfferRoute extends Route {
  @service case;
  @service configuration;
  @service userInfo;
  @service store;
  @service router;

  async beforeModel() {
    const request = this.modelFor('main.case.request.edit');
    if (!request.visitor) {
      const employee = this.userInfo.employee || this.configuration.defaultVisitor;
      if (employee) {
        request.visitor = employee.firstName;
        await request.save();
      }
    }
  }

  async model() {
    const request = this.modelFor('main.case.request.edit');
    const customer = await request.customer;
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

    await offer.save();

    // TODO set case on creation of offer once relation is fully defined
    await this.case.current.updateRecord('offer', offer);

    return offer;
  }

  afterModel(model) {
    const _case = this.modelFor('main.case');
    this.router.transitionTo('main.case.offer.edit', _case, model, {
      queryParams: { editMode: true },
    });
  }
}
