import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | detail list subitem', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{detail-list-subitem}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#detail-list-subitem}}
        template block text
      {{/detail-list-subitem}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
