import constants from '../config/constants';

const { ACTIVITY_TYPES, CASE_STATUSES } = constants;

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

export { cancelCase, reopenCase };
