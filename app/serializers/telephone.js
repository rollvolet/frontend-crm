import ApplicationSerializer from './application';
import classic from 'ember-classic-decorator';

@classic
export default class TelephoneSerializer extends ApplicationSerializer {
  serializeBelongsTo(snapshot, json, relationship) {
    // TODO remove legacy ID conversion once countries are fully migrated to triplestore
    if (relationship.key == 'country') {
      const telephone = snapshot.belongsTo(relationship.key);
      if (telephone) {
        const telephoneAttributes = telephone.attributes();
        const uuid = telephoneAttributes.uuid;
        if (uuid) {
          json.relationships = json.relationships || {};
          const relationKey = this.keyForRelationship(relationship.key, 'belongsTo', 'serialize');
          const type = this.payloadKeyFromModelName(telephone.modelName);
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
