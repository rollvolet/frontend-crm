import ApplicationSerializer from './application';
import classic from 'ember-classic-decorator';

@classic
export default class CustomerSnapshotSerializer extends ApplicationSerializer {
  serializeBelongsTo(snapshot, json, relationship) {
    // TODO remove legacy ID conversion once countries are fully migrated to triplestore
    if (relationship.key == 'language') {
      const language = snapshot.belongsTo(relationship.key);
      if (language) {
        const languageAttributes = language.attributes();
        const uuid = languageAttributes.uuid;
        if (uuid) {
          json.relationships = json.relationships || {};
          const relationKey = this.keyForRelationship(relationship.key, 'belongsTo', 'serialize');
          const type = this.payloadKeyFromModelName(language.modelName);
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
