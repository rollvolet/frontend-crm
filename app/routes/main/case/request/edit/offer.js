import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import snippets from '../../../../../config/snippets';
import getDocumentLanguageCode from '../../../../../utils/get-document-language-code';
import { updateCalendarEvent } from '../../../../../utils/calendar-helpers';

export default class MainCaseRequestEditOfferRoute extends Route {
  @service configuration;
  @service userInfo;
  @service sequence;
  @service store;
  @service router;

  async beforeModel() {
    const request = this.modelFor('main.case.request.edit');
    if (!request.visitor) {
      const employee = this.userInfo.employee || this.configuration.defaultVisitor;
      if (employee) {
        request.visitor = employee.firstName;
        await request.save();
        await updateCalendarEvent({ request }); // order doesn't exist yet
      }
    }
  }

  async model() {
    const _case = this.modelFor('main.case');
    const [customer, contact] = await Promise.all([_case.customer, _case.contact]);

    const languageCode = await getDocumentLanguageCode({ customer, contact });

    const number = await this.sequence.fetchNextOfferNumber();
    const offer = this.store.createRecord('offer', {
      number,
      offerDate: new Date(),
      documentIntro: snippets[languageCode]['offerDocumentIntro'],
      documentOutro: snippets[languageCode]['offerDocumentOutro'],
      documentVersion: 'v1',
      case: _case,
    });

    await offer.save();

    return offer;
  }

  afterModel(model) {
    const _case = this.modelFor('main.case');
    this.router.transitionTo('main.case.offer.edit', _case.id, model.id, {
      queryParams: { editMode: true },
    });
  }
}
