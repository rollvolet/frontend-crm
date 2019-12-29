import decodeAuthToken from 'rollvolet-crm/utils/decode-auth-token';
import { module, test } from 'qunit';

module('Unit | Utility | decode-auth-token', function() {

  // Replace this with your real tests.
  test('it works', function(assert) {
    let result = decodeAuthToken();
    assert.ok(result);
  });
});
