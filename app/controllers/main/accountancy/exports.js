import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class ExportsController extends Controller {
  page = 0;
  size = 10;
  sort = '-date';

  @task
  *runExport(accountancyExport) {
    yield accountancyExport.save();
    this.send('refreshModel');
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
    this.set('page', page);
  }
}
