import { formatRequestNumber } from '../helpers/format-request-number';
import CalendarPeriod from '../classes/calendar-period';

export function setCalendarEventProperties(calendarEvent, records) {
  let { request, intervention, customer, building, calendarPeriod } = records;
  if (!calendarPeriod) {
    // If calendar period is not passed as argument, parse it from existing subject
    calendarPeriod = CalendarPeriod.parse(calendarEvent.subject);
  }
  if (request) {
    calendarEvent.subject = requestSubject(request, customer, calendarPeriod);
    calendarEvent.description = request.comment;
    calendarEvent.url = requestApplicationUrl(request, customer);
  } else if (intervention) {
    calendarEvent.subject = interventionSubject(intervention, customer, calendarPeriod);
    calendarEvent.description = intervention.description;
    calendarEvent.url = interventionApplicationUrl(intervention, customer);
  }
  const addressEntity = building || customer;
  calendarEvent.location = addressEntity?.fullAddress;
}

function requestSubject(request, customer, calendarPeriod) {
  const timeSpec = calendarPeriod.toSubjectString();
  const requestNumber = formatRequestNumber([request.id]);
  return `${timeSpec} ** AD${requestNumber} ** ${customer.name}`;
}

function interventionSubject(intervention, customer, calendarPeriod) {
  if (!calendarPeriod) {
    calendarPeriod = new CalendarPeriod('GD');
  }
  const timeSpec = calendarPeriod.toSubjectString();
  const nbOfPersons = intervention.nbOfPersons || 0;
  return `${timeSpec} ** IR${intervention.id} ** ${customer.name} (${nbOfPersons}p)`;
}

function requestApplicationUrl(request, customer) {
  return `${window.origin}/case/${customer.id}/request/${request.id}`;
}

function interventionApplicationUrl(intervention, customer) {
  return `${window.origin}/case/${customer.id}/intervention/${intervention.id}`;
}
