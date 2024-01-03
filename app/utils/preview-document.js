import fetch from 'fetch';

export default async function previewDocument(type, resource) {
  const response = await fetch(encodeURI(`/downloads?type=${type}&resource=${resource}`));
  handleResponse(response);
}

export async function previewFile(file) {
  const response = await fetch(`/files/${file.id}/download`);
  handleResponse(response);
}

export function previewBlob(blob) {
  var blobURL = URL.createObjectURL(blob);
  window.open(blobURL);
}

export async function fetchDocumentBlob(type, resource) {
  const response = await fetch(encodeURI(`/downloads?type=${type}&resource=${resource}`));
  return await handleResponse(response, async (location) => {
    const result = await fetch(location);
    return await result.blob();
  });
}

async function handleResponse(response, callback = window.open) {
  if (response.ok) {
    const location = response.headers.get('Location');
    if (location) {
      return await callback(location);
    }
  } else if (response.status == 404) {
    window.alert('Document niet gevonden');
  } else {
    throw new Error('Unable to preview document');
  }
}
