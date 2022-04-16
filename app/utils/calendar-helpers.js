import { formatRequestNumber } from '../helpers/format-request-number';
import CalendarPeriod from '../classes/calendar-period';

export function setCalendarEventProperties(calendarEvent, records) {
  let { request, intervention, order, customer, visitor, building, calendarPeriod } = records;
  if (!calendarPeriod) {
    // If calendar period is not passed as argument, parse it from existing subject
    calendarPeriod = CalendarPeriod.parse(calendarEvent.subject);
  }
  if (request) {
    calendarEvent.subject = requestSubject(request, customer, calendarPeriod, visitor);
    calendarEvent.url = requestApplicationUrl(request, customer);
  } else if (intervention) {
    calendarEvent.subject = interventionSubject(intervention, customer, calendarPeriod);
    calendarEvent.description = intervention.description;
    calendarEvent.url = interventionApplicationUrl(intervention, customer);
  } else if (order) {
    calendarEvent.subject = orderSubject(order, customer, calendarPeriod, visitor);
    calendarEvent.description = order.comment;
    calendarEvent.url = orderApplicationUrl(order, customer);
  }
  const addressEntity = building || customer;
  calendarEvent.location = addressEntity?.fullAddress;
}

function requestSubject(request, customer, calendarPeriod, visitor) {
  const timeSpec = calendarPeriod.toSubjectString();
  const requestNumber = formatRequestNumber([request.id]);
  const initials = visitor ? `(${visitor.initials})` : '';
  const comment = request.comment;
  return [timeSpec, customer.name, `AD${requestNumber} ${initials}`, comment]
    .filter((f) => f)
    .join(' | ');
}

function interventionSubject(intervention, customer, calendarPeriod) {
  const timeSpec = calendarPeriod.toSubjectString();
  const nbOfPersons = intervention.nbOfPersons || 0;
  return `${timeSpec} | ${customer.name} | ${nbOfPersons}p | IR${intervention.id}`;
}

function orderSubject(order, customer, calendarPeriod, visitor) {
  const timeSpec = calendarPeriod.toSubjectString();
  const requestNumber = formatRequestNumber([order.requestNumber]);
  const nbOfPersons = order.scheduledNbOfPersons || 0;
  const nbOfHours = order.scheduledNbOfHours || 0;
  const workload = `${nbOfPersons}p x ${nbOfHours}u`;
  const initials = visitor ? `(${visitor.initials})` : '';
  return `${timeSpec} | ${customer.name} | ${workload} | AD${requestNumber} ${initials}`.trim();
}

function requestApplicationUrl(request, customer) {
  return `${window.origin}/case/${customer.id}/request/${request.id}`;
}

function interventionApplicationUrl(intervention, customer) {
  return `${window.origin}/case/${customer.id}/intervention/${intervention.id}`;
}

function orderApplicationUrl(order, customer) {
  return `${window.origin}/case/${customer.id}/order/${order.id}`;
}
