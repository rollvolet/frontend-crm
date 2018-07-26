import EmberObject from '@ember/object';
import DecimalInputFormattingMixin from 'rollvolet-crm/mixins/decimal-input-formatting';
import { module, test } from 'qunit';

module('Unit | Mixin | decimal-input-formatting', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let DecimalInputFormattingObject = EmberObject.extend(DecimalInputFormattingMixin);
    let subject = DecimalInputFormattingObject.create();
    assert.ok(subject);
  });
});
