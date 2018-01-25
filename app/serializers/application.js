import DS from 'ember-data';
import DataTableSerializerMixin from 'ember-data-table/mixins/serializer';

export default DS.JSONAPISerializer.extend(DataTableSerializerMixin, {
  /**
      Parse the links in the JSONAPI response and convert to a meta-object
   */
  normalizeArrayResponse(store, primaryModelClass, payload) {
    const result = this._super(...arguments);
    result.meta = result.meta || {};

    if (payload.links) {
      result.meta.pagination = this.createPageMeta(payload.links);
    }
    if (payload.meta) {
      result.meta.count = payload.meta.count;
    }

    return result;
  }
});
