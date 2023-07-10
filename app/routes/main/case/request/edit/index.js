import Route from '@ember/routing/route';

export default class MainCaseRequestEditIndexRoute extends Route {
  model() {
    const _case = this.modelFor('main.case');
    const request = this.modelFor('main.case.request.edit');

    return { case: _case, request };
  }
}
