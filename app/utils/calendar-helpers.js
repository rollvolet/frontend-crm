import { formatRequestNumber } from '../helpers/format-request-number';
import CalendarPeriod from '../classes/calendar-period';

export function requestSubject(request, customer, calendarPeriod) {
  if (!calendarPeriod) {
    calendarPeriod = new CalendarPeriod('GD');
  }
  const timeSpec = calendarPeriod.toSubjectString();
  const requestNumber = formatRequestNumber([request.id]);
  return `${timeSpec} ** AD${requestNumber} ** ${customer.name}`;
}

export function interventionSubject(intervention, customer, calendarPeriod) {
  if (!calendarPeriod) {
    calendarPeriod = new CalendarPeriod('GD');
  }
  const timeSpec = calendarPeriod.toSubjectString();
  const nbOfPersons = intervention.nbOfPersons || 0;
  return `${timeSpec} ** IR${intervention.id} ** ${customer.name} (${nbOfPersons}p)`;
}

export function requestApplicationUrl(request, customer) {
  return `${window.origin}/case/${customer.id}/request/${request.id}`;
}

export function interventionApplicationUrl(intervention, customer) {
  return `${window.origin}/case/${customer.id}/intervention/${intervention.id}`;
}
