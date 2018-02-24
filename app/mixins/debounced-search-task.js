import Mixin from '@ember/object/mixin';
import { task, timeout } from 'ember-concurrency';

export default Mixin.create({
  debounceFilter: task(function * (key, value) {
    yield timeout(500);
    this.set(key, value);
    this.set('page', 0); // reset page to 0 on new search
  }).restartable(),
  debounceSearch: task(function * (searchTask) {
    yield timeout(500);
    this.set('page', 0); // reset page to 0 on new search
    yield searchTask.perform();
  }).restartable()
});
