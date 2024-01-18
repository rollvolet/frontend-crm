import fetch, { Headers } from 'fetch';

export default async function fetchNextNumber(type, scope) {
  const body = {
    data: {
      type: 'sequence-numbers',
      attributes: {
        'resource-type': type,
        scope,
      },
    },
  };
  const response = await fetch('/sequence-numbers', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    }),
    body: JSON.stringify(body),
  });

  if (response.ok) {
    const json = await response.json();
    return json.data?.attributes?.number;
  } else {
    throw response;
  }
}
