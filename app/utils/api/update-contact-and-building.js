import fetch, { Headers } from 'fetch';

export default function apiUpdateContactAndBuilding(body) {
  return fetch(`/api/cases/contact-and-building`, {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(body)
  });
}
