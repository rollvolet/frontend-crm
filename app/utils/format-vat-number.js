export default function formatVatNumber(vatNumber) {
  if (vatNumber) {
    if (vatNumber.length >= 2) {
      const country = vatNumber.substr(0, 2).toUpperCase();
      let number = vatNumber.substr(2);

      if (country == 'BE') {
        if (number.length && !number.startsWith('0'))
          number = `0${number}`;

        if (number.length >= 4)
          number = `${number.substr(0,4)}.${number.substr(4)}`;

        if (number.length >= 8)
          number = `${number.substr(0,8)}.${number.substr(8)}`;
      }

      return `${country} ${number}`;
    } else {
      return vatNumber.toUpperCase();
    }
  } else {
    return vatNumber;
  }
}
