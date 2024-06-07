import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import format from 'date-fns/format';

export default class MainCalendarVisitsController extends Controller {
  @tracked dateStr;

  @action
  updateDate(date) {
    this.dateStr = format(date, 'yyyy-MM-dd');
  }
}
