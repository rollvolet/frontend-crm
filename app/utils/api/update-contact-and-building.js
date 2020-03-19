import fetch, { Headers } from 'fetch';

export default function apiUpdateContactAndBuilding(access_token, body) {
  return fetch(`/api/cases/contact-and-building`, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    }),
    body: JSON.stringify(body)
  });
}
