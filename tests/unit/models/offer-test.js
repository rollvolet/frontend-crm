import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Model | offer', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('offer'));
    // let store = this.store();
    assert.ok(!!model);
  });
});
