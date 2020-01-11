const digitsOnly = /\D/g;

export default function deformatVatNumber(formattedVatNumber) {
  if (formattedVatNumber && formattedVatNumber.length >= 2) {
    const country = formattedVatNumber.substr(0, 2);
    const formattedNumber = formattedVatNumber.substr(2);
    const number = formattedNumber.replace(digitsOnly, '');
    return `${country}${number}`;
  } else {
    return formattedVatNumber;
  }
}
