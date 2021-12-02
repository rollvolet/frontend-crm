import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Model | postal code', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('postal-code'));
    // let store = this.store();
    assert.ok(!!model);
  });
});
