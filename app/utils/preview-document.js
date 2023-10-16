import fetch, { Headers } from 'fetch';

async function bodyWithLanguage(record) {
  let language = null;
  if (record) {
    const _case = await record.case;
    const [customer, contact] = await Promise.all([_case.customer, _case.contact]);
    language = contact ? await contact.language : await customer.language;
  }

  return {
    data: {
      type: 'document-generators',
      attributes: {
        language: language?.code,
      },
    },
  };
}

function previewBlob(blob) {
  var blobURL = URL.createObjectURL(blob);
  window.open(blobURL);
}

export async function previewDocument(url, { record } = {}) {
  const body = await bodyWithLanguage(record);

  const response = await fetch(url, {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/pdf',
      'Content-Type': 'application/json',
    }),
    body: body ? JSON.stringify(body) : '',
  });

  if (response.ok) {
    const blob = await response.blob();
    previewBlob(blob);
  } else {
    throw response;
  }
}
