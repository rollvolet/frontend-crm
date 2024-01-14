import { isPresent } from '@ember/utils';
import { formatRequestNumber } from '../helpers/format-request-number';
import { formatInterventionNumber } from '../helpers/format-intervention-number';
import CalendarPeriod from '../classes/calendar-period';
import constants from '../config/constants';

const { DELIVERY_METHODS } = constants;

export async function updateCalendarEvent({ request, intervention, order }) {
  const saveCalendarEvent = async function (calendarEvent) {
    if (calendarEvent.hasDirtyAttributes) {
      const { validations } = await calendarEvent.validate();
      if (validations.isValid) {
        await calendarEvent.save();
      }
    }
  };

  if (request) {
    const visit = await request.visit;
    if (visit) {
      await setCalendarEventProperties(visit, { request });
      await saveCalendarEvent(visit);
    }
  }
  if (intervention) {
    const visit = await intervention.visit;
    if (visit) {
      await setCalendarEventProperties(visit, { intervention });
      await saveCalendarEvent(visit);
    }
  }
  if (order) {
    const planning = await order.planning;
    if (planning) {
      await setCalendarEventProperties(planning, { order });
      await saveCalendarEvent(planning);
    }
  }
}

export async function setCalendarEventProperties(calendarEvent, records) {
  let { request, intervention, order, calendarPeriod } = records;
  if (!calendarPeriod) {
    // If calendar period is not passed as argument, parse it from existing subject
    calendarPeriod = CalendarPeriod.parse(calendarEvent.subject);
  }
  let _case;
  if (request) {
    _case = await request.case;
    const [customer, visitor] = await Promise.all([_case.customer, request.visitor]);
    calendarEvent.subject = requestSubject(request, customer, calendarPeriod, visitor);
    calendarEvent.url = requestApplicationUrl(request, _case);
  } else if (intervention) {
    _case = await intervention.case;
    const customer = await _case.customer;
    calendarEvent.subject = await interventionSubject(intervention, customer, calendarPeriod);
    calendarEvent.description = intervention.description || null; // undefined seems to be interpreted as dirty attribute on save
    calendarEvent.url = interventionApplicationUrl(intervention, _case);
  } else if (order) {
    _case = await order.case;
    const [customer, request, deliveryMethod] = await Promise.all([
      _case.customer,
      _case.request,
      _case.deliveryMethod,
    ]);
    const visitor = await request.visitor;
    calendarEvent.subject = await orderSubject(
      order,
      customer,
      calendarPeriod,
      request,
      visitor,
      deliveryMethod
    );
    calendarEvent.description = order.comment || null; // undefined seems to be interpreted as dirty attribute on save
    calendarEvent.url = orderApplicationUrl(order, _case);
  }
  const [building, customer] = await Promise.all([_case.building, _case.customer]);
  const address = building ? await building.address : await customer.address;
  if (address) {
    calendarEvent.street = address.street;
    calendarEvent.postalCode = address.postalCode;
    calendarEvent.city = address.city;
    const country = await address.country;
    calendarEvent.country = country?.name;
  }
}

function requestSubject(request, customer, calendarPeriod, visitor) {
  const timeSpec = calendarPeriod.toSubjectString();
  const requestNumber = formatRequestNumber([request.number]);
  const initials = visitor ? `${visitor.initials}` : '';
  const requestReference = `AD${requestNumber} ${initials}`.trim();
  const description = request.description;
  return [timeSpec, customer.name, requestReference, description]
    .filter((f) => isPresent(f))
    .join(' | ');
}

async function interventionSubject(intervention, customer, calendarPeriod) {
  const timeSpec = calendarPeriod.toSubjectString();
  const interventionNumber = formatInterventionNumber([intervention.number]);
  const nbOfPersons = intervention.scheduledNbOfPersons || 0;
  const technicians = await intervention.technicians;
  const technicianNames = technicians.sortBy('firstName').mapBy('firstName').join(', ');
  const workload = `${nbOfPersons}p ${technicianNames}`.trim();
  return [timeSpec, customer.name, `IR${interventionNumber}`, workload]
    .filter((f) => isPresent(f))
    .join(' | ');
}

async function orderSubject(order, customer, calendarPeriod, request, visitor, deliveryMethod) {
  const timeSpec = calendarPeriod.toSubjectString();
  const requestNumber = formatRequestNumber([request.number]);
  const initials = visitor ? `${visitor.initials}` : '';
  const requestReference = `AD${requestNumber} ${initials}`.trim();
  const execution =
    deliveryMethod?.uri == DELIVERY_METHODS.TO_BE_DELIVERED ? deliveryMethod.label : null;
  const nbOfPersons = order.scheduledNbOfPersons || 0;
  const nbOfHours = order.scheduledNbOfHours || 0;
  const technicians = await order.technicians;
  const technicianNames = technicians.sortBy('firstName').mapBy('firstName').join(', ');
  const workload = `${nbOfHours}u x ${nbOfPersons}p ${technicianNames}`.trim();
  return [timeSpec, customer.name, requestReference, execution, workload]
    .filter((f) => isPresent(f))
    .join(' | ');
}

function requestApplicationUrl(request, _case) {
  return `${window.origin}/case/${_case.id}/request/${request.id}`;
}

function interventionApplicationUrl(intervention, _case) {
  return `${window.origin}/case/${_case.id}/intervention/${intervention.id}`;
}

function orderApplicationUrl(order, _case) {
  return `${window.origin}/case/${_case.id}/order/${order.id}`;
}
