import Component from '@ember/component';

const FmtCurrencyComponent = Component.extend({
  tagName: ''
});

FmtCurrencyComponent.reopenClass({
  positionalParams: ['value']
});

export default FmtCurrencyComponent;
