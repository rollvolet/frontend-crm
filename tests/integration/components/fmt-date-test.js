import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | fmt date', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{fmt-date}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#fmt-date}}
        template block text
      {{/fmt-date}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
