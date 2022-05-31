import { isPresent } from '@ember/utils';
import { formatRequestNumber } from '../helpers/format-request-number';
import CalendarPeriod from '../classes/calendar-period';

export async function setCalendarEventProperties(calendarEvent, records) {
  let { request, intervention, order, customer, visitor, building, calendarPeriod } = records;
  if (!calendarPeriod) {
    // If calendar period is not passed as argument, parse it from existing subject
    calendarPeriod = CalendarPeriod.parse(calendarEvent.subject);
  }
  if (request) {
    calendarEvent.subject = requestSubject(request, customer, calendarPeriod, visitor);
    calendarEvent.url = requestApplicationUrl(request, customer);
  } else if (intervention) {
    calendarEvent.subject = await interventionSubject(intervention, customer, calendarPeriod);
    calendarEvent.description = intervention.description;
    calendarEvent.url = interventionApplicationUrl(intervention, customer);
  } else if (order) {
    calendarEvent.subject = await orderSubject(order, customer, calendarPeriod, visitor);
    calendarEvent.description = order.comment;
    calendarEvent.url = orderApplicationUrl(order, customer);
  }
  const addressEntity = building || customer;
  if (addressEntity) {
    calendarEvent.street = addressEntity.address;
    calendarEvent.postalCode = addressEntity.postalCode;
    calendarEvent.city = addressEntity.city;
    const country = await addressEntity.country;
    calendarEvent.country = country?.name;
  }
}

function requestSubject(request, customer, calendarPeriod, visitor) {
  const timeSpec = calendarPeriod.toSubjectString();
  const requestNumber = formatRequestNumber([request.id]);
  const initials = visitor ? `(${visitor.initials})` : '';
  const requestReference = `AD${requestNumber} ${initials}`.trim();
  const comment = request.comment;
  return [timeSpec, customer.name, requestReference, comment]
    .filter((f) => isPresent(f))
    .join(' | ');
}

async function interventionSubject(intervention, customer, calendarPeriod) {
  const timeSpec = calendarPeriod.toSubjectString();
  const nbOfPersons = intervention.nbOfPersons || 0;
  const technicians = await intervention.technicians;
  const technicianNames = technicians.sortBy('firstName').mapBy('firstName').join(', ');
  const workload = `${nbOfPersons}p ${technicianNames}`.trim();
  return [timeSpec, customer.name, `IR${intervention.id}`, workload]
    .filter((f) => isPresent(f))
    .join(' | ');
}

async function orderSubject(order, customer, calendarPeriod, visitor) {
  const timeSpec = calendarPeriod.toSubjectString();
  const requestNumber = formatRequestNumber([order.requestNumber]);
  const initials = visitor ? `${visitor.initials}` : '';
  const requestReference = `AD${requestNumber} ${initials}`.trim();
  const nbOfPersons = order.scheduledNbOfPersons || 0;
  const nbOfHours = order.scheduledHours || 0;
  const technicians = await order.technicians;
  const technicianNames = technicians.sortBy('firstName').mapBy('firstName').join(', ');
  const workload = `${nbOfPersons}p x ${nbOfHours}u ${technicianNames}`.trim();
  return [timeSpec, customer.name, requestReference, workload]
    .filter((f) => isPresent(f))
    .join(' | ');
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
