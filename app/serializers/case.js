import ApplicationSerializer from './application';
import classic from 'ember-classic-decorator';

@classic
export default class CaseSerializer extends ApplicationSerializer {
  serializeBelongsTo(snapshot, json, relationship) {
    // TODO remove legacy ID conversion once VAT rates are fully migrated to triplestore
    if (relationship.key == 'vatRate') {
      const vatRate = snapshot.belongsTo(relationship.key);
      if (vatRate) {
        const vatRateAttributes = vatRate.attributes();
        const uuid = vatRateAttributes.uuid;
        if (uuid) {
          json.relationships = json.relationships || {};
          const relationKey = this.keyForRelationship(relationship.key, 'belongsTo', 'serialize');
          const type = this.payloadKeyFromModelName(vatRate.modelName);
          json.relationships[relationKey] = {
            data: {
              type,
              id: uuid,
            },
          };
        }
      }
    } else {
      super.serializeBelongsTo(...arguments);
    }
  }
}