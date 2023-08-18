import { helper } from '@ember/component/helper';

export default helper(function resetAttribute([model, attribute] /*, named*/) {
  return function () {
    if (model) {
      const changedAttributes = model.changedAttributes();
      if (changedAttributes[attribute]) {
        const previousValue = changedAttributes[attribute][0];
        model[attribute] = previousValue;
      }
    }
  };
});
