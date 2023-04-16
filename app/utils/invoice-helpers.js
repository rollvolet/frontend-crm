export async function createContactSnapshot(contact) {
  const store = contact.store;
  const country = await contact.country;
  const address = store.createRecord('address', {
    street: contact.address,
    postalCode: contact.postalCode,
    city: contact.city,
    country,
  });
  await address.save();
  const snapshot = store.createRecord('contact-snapshot', {
    name: contact.printName,
    number: contact.number,
    source: contact.uri,
    address,
  });
  await snapshot.save();
  return snapshot;
}

export async function createBuildingSnapshot(building) {
  const store = building.store;
  const country = await building.country;
  const address = store.createRecord('address', {
    street: building.address,
    postalCode: building.postalCode,
    city: building.city,
    country,
  });
  await address.save();
  const snapshot = store.createRecord('building-snapshot', {
    name: building.printName,
    number: building.number,
    source: building.uri,
    address,
  });
  await snapshot.save();
  return snapshot;
}
