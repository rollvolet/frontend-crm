import ApplicationSerializer from './application';
import classic from 'ember-classic-decorator';

@classic
export default class TechnicalWorkActivitySerializer extends ApplicationSerializer {
  serializeBelongsTo(snapshot, json, relationship) {
    super.serializeBelongsTo(...arguments);
    // TODO remove legacy ID replacement once employees are fully migrated to triplestore
    if (relationship.key == 'employee') {
      const legacyId = json.relationships.employee?.data?.id;
      if (legacyId) {
        const employee = this.store.peekRecord('employee', legacyId);
        json.relationships.employee.data.id = employee.uuid;
      }
    }
  }
}
