/**
 * Get the language code for a document based on the customer and contact of a model
 * As arguments, one can pass:
 * - model: model with a related contact and customer property
 * - customer, contact: a customer and contact resource
*/
export default async function getDocumentLanguageCode({ model, customer, contact }) {
  if (!contact)
    contact = model && await model.contact;

  let language;
  if (contact) {
    language = await contact.language;
  } else {
    if (!customer)
      customer = model && await model.customer;
    language = await customer.language;
  }

  if (language && language.code == 'FRA')
    return 'FRA';
  else
    return 'NED';
}
