import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel from './validated-model';

export default class TimeSlotModel extends ValidatedModel {
  validators = {};

  @attr('string') title;
  @attr('string') description;
  @attr('datetime') start;
  @attr('datetime') end;

  @belongsTo('request', { inverse: 'timeSlot', async: true }) request;
  @belongsTo('employee', { inverse: 'timeSlots', async: true }) employee;
}
