import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel from './validated-model';

export default class TimeSlotModel extends ValidatedModel {
  validators = {};

  @attr('datetime') start;
  @attr('datetime') end;

  @belongsTo('request', { inverse: 'timeSlot', async: true }) request;
}
