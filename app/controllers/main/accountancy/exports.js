import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class ExportsController extends Controller {
  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-date';

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
    this.page = page;
  }
}
