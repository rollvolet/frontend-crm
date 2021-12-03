import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';

export default class EditController extends Controller {
  @service case;

  get isDisabledEdit() {
    return this.case.current && this.case.current.offer != null;
  }

  get isEnabledDelete() {
    return this.case.current && this.case.current.offer == null;
  }

  @task
  *delete() {
    try {
      const calendarEvent = yield this.model.calendarEvent;
      if (calendarEvent) {
        yield calendarEvent.destroyRecord();
      }
      yield this.model.destroyRecord();

      this.transitionToRoute('main.requests.index');
    } catch (e) {
      warn(`Something went wrong while destroying request ${this.model.id}`, {
        id: 'destroy-failure',
      });
      yield this.model.rollbackAttributes(); // undo delete-state
    }
  }
}
