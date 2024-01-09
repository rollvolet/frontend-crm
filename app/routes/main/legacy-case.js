import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainLegacyCaseRoute extends Route {
  @service store;
  @service router;

  queryParams = {
    type: { refreshModel: true },
    id: { refreshModel: true },
  };

  async model(params) {
    const customerId = params.customer_id;
    const type = params.type;
    const id = params.id;

    const record = await this.store.queryOne(type, {
      include: 'case',
      'filter[legacy-id]': id,
      'filter[case][customer][number]': customerId,
    });
    const _case = await record.case;

    this.router.transitionTo(`main.case.${type}.edit.index`, _case.id, record.id);
  }
}
