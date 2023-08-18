import { helper } from '@ember/component/helper';

export default helper(function resetRelation([model, relationName] /*, named*/) {
  return function () {
    if (model) {
      const relationship = model.relationshipFor(relationName);
      if (relationship) {
        if (relationship.kind == 'belongsTo') {
          model.belongsTo(relationName).reload();
        } else {
          model.hasMany(relationName).reload();
        }
      }
    }
  };
});
