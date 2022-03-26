import { formatRequestNumber } from '../helpers/format-request-number';
import CalendarPeriod from '../classes/calendar-period';

export function requestSubject(request, customer, calendarPeriod) {
  if (!calendarPeriod) {
    calendarPeriod = new CalendarPeriod('GD');
  }
  const timeSpec = calendarPeriod.toSubjectString();
  const requestNumber = formatRequestNumber([request.id]);
  return `${timeSpec} [AD${requestNumber}] ${customer.name}`;
}

export function requestApplicationUrl(request, customer) {
  return `${window.origin}/case/${customer.id}/requests/${request.id}`;
}
