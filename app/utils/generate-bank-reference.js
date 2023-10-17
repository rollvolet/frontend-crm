export default function generateBankReference(invoiceNumber, base = 0) {
  const ref = base + invoiceNumber;
  let modulo = `${ref % 97}`.padStart(2, '0');
  if (modulo == '00') modulo = '97';

  return `${ref}${modulo}`.padStart(12, '0');
}
