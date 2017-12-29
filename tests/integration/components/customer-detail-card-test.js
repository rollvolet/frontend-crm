import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('customer-detail-card', 'Integration | Component | customer detail card', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{customer-detail-card}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#customer-detail-card}}
      template block text
    {{/customer-detail-card}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
