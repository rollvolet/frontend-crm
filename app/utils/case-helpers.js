import constants from '../config/constants';

const { ACTIVITY_TYPES, CASE_STATUSES } = constants;

async function createCase(properties) {
  let store, number, namespace;
  const { request, intervention, invoice } = properties;
  if (request) {
    store = request.store;
    number = request.number;
    namespace = 'AD';
    properties.depositRequired = true;
    properties.hasProductionTicket = false;
  } else if (intervention) {
    store = intervention.store;
    number = intervention.number;
    namespace = 'IR';
  } else if (invoice) {
    store = invoice.store;
    number = invoice.number;
    namespace = 'F';
  }
  properties.identifier = `${namespace}-${number}`;

  const _case = store.createRecord('case', properties);
  const { validations } = await _case.validate();
  if (validations.isValid) {
    await _case.save();

    const structuredIdentifier = store.createRecord('structured-identifier', {
      identifier: number,
      namespace,
      case: _case,
    });
    await structuredIdentifier.save();

    return _case;
  } else {
    throw new Error(`Invalid case. Unable to save.\n${validations.messages.join('\n')}`);
  }
}

async function cancelCase(_case, reason, user) {
  const store = _case.store;

  const invalidation = store.createRecord('activity', {
    date: new Date(),
    type: ACTIVITY_TYPES.INVALIDATION,
    description: reason,
    case: _case,
    user,
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
