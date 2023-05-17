export async function createCustomerSnapshot(customer) {
  if (customer) {
    const store = customer.store;
    const country = await customer.country;
    const telephones = await store.query('telephone', {
      ':exact:customer': customer.uri,
      sort: 'position',
      page: { size: 100 },
    });

    const address = store.createRecord('address', {
      street: customer.address,
      postalCode: customer.postalCode,
      city: customer.city,
      country,
    });
    await address.save();
    const snapshot = store.createRecord('customer-snapshot', {
      type: customer.type,
      name: customer.printName,
      number: customer.number,
      vatNumber: customer.vatNumber,
      source: customer.uri,
      address,
      telephones,
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
  } else {
    return null;
  }
}

export async function createBuildingSnapshot(building) {
  if (building) {
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
  } else {
    return null;
  }
}
