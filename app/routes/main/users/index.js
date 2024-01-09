import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainUsersIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    onlyActive: { refreshModel: true },
  };

  model(params) {
    const filter = {};

    if (params.onlyActive) {
      filter[':has-no:end-date'] = 't';
    }

    return this.store.query('employee', {
      page: {
        size: params.size,
        number: params.page,
      },
      sort: params.sort,
      include: 'user.account',
      filter,
    });
  }
}
