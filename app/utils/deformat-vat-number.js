const digitsOnly = /\D/g;
const wordCharsOnly = /\W/g; // digits, numbers and _

export default function deformatVatNumber(formattedVatNumber) {
  if (formattedVatNumber && formattedVatNumber.length >= 2) {
    const country = formattedVatNumber.substr(0, 2);
    const formattedNumber = formattedVatNumber.substr(2);
    if (country == 'BE') {
      const number = formattedNumber.replace(digitsOnly, '');
      return `${country}${number}`;
    } else {
      const number = formattedNumber.replace(wordCharsOnly, '');
      return `${country}${number}`;
    }
  } else {
    return formattedVatNumber;
  }
}
