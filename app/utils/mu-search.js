import fetch from 'fetch';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';

function getPaginationMetadata(pageNumber, size, total) {
  const pagination = {};

  pagination.first = {
    number: 0,
    size,
  };

  const lastPageNumber =
    total % size === 0 ? Math.floor(total / size) - 1 : Math.floor(total / size);
  const lastPageSize = total % size === 0 ? size : total % size;
  pagination.last = {
    number: lastPageNumber,
    size: lastPageSize,
  };

  pagination.self = {
    number: pageNumber,
    size,
  };

  if (pageNumber > 0) {
    pagination.prev = {
      number: pageNumber - 1,
      size,
    };
  }

  if (pageNumber < lastPageNumber) {
    const nextPageSize = pageNumber + 1 === lastPageNumber ? lastPageSize : size;
    pagination.next = {
      number: pageNumber + 1,
      size: nextPageSize,
    };
  }

  return pagination;
}

function sortOrder(sort) {
  if (sort.startsWith('-')) {
    return 'desc';
  } else if (sort.length > 0) {
    return 'asc';
  } else {
    return null;
  }
}

function stripSort(sort) {
  return sort.replace(/(^\+)|(^-)/g, '');
}

function snakeToCamel(text) {
  return text.replace(/(-\w)/g, (entry) => entry[1].toUpperCase());
}

function fixBooleanValues(object) {
  for (let key in object) {
    if (['true', 'false'].includes(object[key])) {
      object[key] = object[key] == 'true';
    } else if (object[key]?.constructor?.name == 'Object') {
      fixBooleanValues(object[key]);
    }
  }
}

async function muSearch(index, page, size, sort, filter, dataMapping, highlightConfig) {
  if (!dataMapping) {
    dataMapping = (entry) => entry.attributes;
  }

  for (let key in filter) {
    if (filter[key] == null) {
      delete filter[key]; // mu-search doesn't work well with unspecified filters
    }
  }

  const endpoint = new URL(`/${index}/search`, window.location.origin);
  const params = new URLSearchParams(
    Object.entries({
      'page[size]': size,
      'page[number]': page,
      collapse_uuids: 't',
    })
  );

  for (const field in filter) {
    params.append(`filter[${field}]`, filter[field]);
  }

  if (sort) {
    sort.split(',').forEach((s) => {
      params.append(`sort[${snakeToCamel(stripSort(s))}]`, sortOrder(s));
    });
  }

  if (highlightConfig) {
    if (highlightConfig.fields) {
      params.append(`highlight[:fields:]`, highlightConfig.fields.join(','));
    }

    if (highlightConfig.tag) {
      params.append('highlight[:tag:]', highlightConfig.tag);
    }
  }

  endpoint.search = params.toString();

  const { count, data } = await (await fetch(endpoint)).json();
  const pagination = getPaginationMetadata(page, size, count);
  const entries = A(
    await Promise.all(
      data.map((entry) => {
        fixBooleanValues(entry);
        return dataMapping(entry);
      })
    )
  );

  return ArrayProxy.create({
    content: entries,
    highlight: data.map((entry) => entry.highlight),
    meta: {
      count,
      pagination,
    },
  });
}

export default muSearch;
