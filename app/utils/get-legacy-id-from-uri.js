export default function getLegacyIdFromUri(uri) {
  if (uri && uri.includes('/')) {
    return uri.slice(uri.lastIndexOf('/') + 1);
  } else {
    return null;
  }
}
