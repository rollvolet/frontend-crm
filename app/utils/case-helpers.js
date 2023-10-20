import constants from '../config/constants';

const { ACTIVITY_TYPES, CASE_STATUSES } = constants;

async function createCase(properties) {
  let store, number, namespace;
  const { request, intervention, invoice } = properties;
  if (request) {
    store = request.store;
    number = request.number;
    namespace = 'AD';
  } else if (intervention) {
    store = intervention.store;
    number = intervention.number;
    namespace = 'IR';
  } else if (invoice) {
    store = invoice.store;
    number = invoice.number;
    namespace = 'F';
  }

  const structuredIdentifier = store.createRecord('structured-identifier', {
    identifier: number,
    namespace,
  });

  await structuredIdentifier.save();

  properties.identifier = `${namespace}-${number}`;
  const _case = store.createRecord('case', properties);
  await _case.save();

  return _case;
}

async function cancelCase(_case, reason) {
  const store = _case.store;

  const invalidation = store.createRecord('activity', {
    date: new Date(),
    type: ACTIVITY_TYPES.INVALIDATION,
    description: reason,
    case: _case,
  });
  await invalidation.save();

  _case.status = CASE_STATUSES.CANCELLED;
  await _case.save();
}

async function reopenCase(_case) {
  const invalidation = await _case.invalidation;
  if (invalidation) {
    await invalidation.destroyRecord();
  }
  _case.status = CASE_STATUSES.ONGOING;
  await _case.save();
}

export { createCase, cancelCase, reopenCase };
