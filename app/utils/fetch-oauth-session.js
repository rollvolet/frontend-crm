import fetch, { Headers } from 'fetch';

export default async function fetchOAuthSession() {
  const response = await fetch('/sessions/current/oauth', {
    method: 'GET',
    headers: new Headers({
      Accept: 'application/vnd.api+json',
    }),
  });

  if (response.ok) {
    const json = await response.json();
    return json.data?.attributes?.uri;
  } else {
    return null;
  }
}
