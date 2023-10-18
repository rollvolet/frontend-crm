import fetch from 'fetch';

export default async function previewDocument(type, resource) {
  const response = await fetch(encodeURI(`/downloads?type=${type}&resource=${resource}`));
  return handleResponse(response);
}

export async function previewFile(file) {
  const response = await fetch(`/files/${file.id}/download`);
  return handleResponse(response);
}

export function previewBlob(blob) {
  var blobURL = URL.createObjectURL(blob);
  window.open(blobURL);
}

async function handleResponse(response) {
  if (response.ok) {
    const location = response.headers.get('Location');
    if (location) {
      const result = await fetch(location);
      const blob = await result.blob();
      previewBlob(blob);
    }
  } else if (response.status == 404) {
    window.alert('Document niet gevonden');
  } else {
    throw new Error('Unable to preview document');
  }
}
