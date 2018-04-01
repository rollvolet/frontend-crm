import Component from '@ember/component';

const FmtDecimalComponent = Component.extend({
  tagName: ''
});

FmtDecimalComponent.reopenClass({
  positionalParams: ['value']
});

export default FmtDecimalComponent;
