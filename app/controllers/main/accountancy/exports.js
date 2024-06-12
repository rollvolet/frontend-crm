import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default class MainAccountancyExportsController extends Controller {
  @service router;

  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-date';

  @task
  *runExport(accountancyExport) {
    yield Promise.all([
      accountancyExport.save(),
      timeout(3000), // workaround to await async cache clearing for quick exports
    ]);
    this.router.refresh('main.accountancy.exports');
  }

  @action
  previousPage() {
    this.selectPage(this.page - 1);
  }

  @action
  nextPage() {
    this.selectPage(this.page + 1);
  }

  @action
  selectPage(page) {
    this.page = page;
  }
}
