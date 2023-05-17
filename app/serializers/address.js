import ApplicationSerializer from './application';
import classic from 'ember-classic-decorator';

@classic
export default class AddressSerializer extends ApplicationSerializer {
  serializeBelongsTo(snapshot, json, relationship) {
    // TODO remove legacy ID conversion once countries are fully migrated to triplestore
    if (relationship.key == 'country') {
      const country = snapshot.belongsTo(relationship.key);
      if (country) {
        const countryAttributes = country.attributes();
        const uuid = countryAttributes.uuid;
        if (uuid) {
          json.relationships = json.relationships || {};
          const relationKey = this.keyForRelationship(relationship.key, 'belongsTo', 'serialize');
          const type = this.payloadKeyFromModelName(country.modelName);
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
