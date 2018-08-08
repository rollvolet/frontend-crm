import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | case tabs', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{case-tabs}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#case-tabs}}
        template block text
      {{/case-tabs}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
