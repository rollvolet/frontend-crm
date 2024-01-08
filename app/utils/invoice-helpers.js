export async function createCustomerSnapshot(customer) {
  if (customer) {
    const store = customer.store;
    const [address, language] = await Promise.all([customer.address, customer.language]);
    const country = await address.country;

    const name = [
      customer.printInFront ? customer.honorificPrefix : null,
      customer.printPrefix ? customer.prefix : null,
      customer.name,
      customer.printSuffix ? customer.suffix : null,
      customer.printInFront ? null : customer.honorificPrefix,
    ]
      .filter((s) => s)
      .join(' ');

    const addressSnapshot = store.createRecord('address', {
      street: address.street,
      postalCode: address.postalCode,
      city: address.city,
      country,
    });
    await addressSnapshot.save();
    const snapshot = store.createRecord('customer-snapshot', {
      type: customer.type,
      name,
      number: customer.number,
      vatNumber: customer.vatNumber,
      source: customer,
      address: addressSnapshot,
      language,
    });
    await snapshot.save();
    return snapshot;
  } else {
    return null;
  }
}

export async function createContactSnapshot(contact) {
  if (contact) {
    const store = contact.store;
    const [address, language] = await Promise.all([contact.address, contact.language]);
    const country = await address.country;

    const addressSnapshot = store.createRecord('address', {
      street: address.street,
      postalCode: address.postalCode,
      city: address.city,
      country,
    });
    await addressSnapshot.save();
    const snapshot = store.createRecord('contact-snapshot', {
      name: contact.printName,
      position: contact.position,
      source: contact,
      address: addressSnapshot,
      language,
    });
    await snapshot.save();
    return snapshot;
  } else {
    return null;
  }
}

export async function createBuildingSnapshot(building) {
  if (building) {
    const store = building.store;
    const address = await building.address;
    const country = await address.country;

    const addressSnapshot = store.createRecord('address', {
      street: address.street,
      postalCode: address.postalCode,
      city: address.city,
      country,
    });
    await addressSnapshot.save();
    const snapshot = store.createRecord('building-snapshot', {
      name: building.printName,
      position: building.position,
      source: building,
      address: addressSnapshot,
    });
    await snapshot.save();
    return snapshot;
  } else {
    return null;
  }
}
