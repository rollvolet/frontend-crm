export default function formatOfferNumber(text) {
  if (text) {
    return text
      .replace(/\D/g, '') // remove all non-digit (\D) characters
      .replace(/(.{2})/g, '$1/') // insert '/' after each 2 characters
      .replace(/\/$/, ''); // remove trailing '/' if any
  } else {
    return text;
  }
}
