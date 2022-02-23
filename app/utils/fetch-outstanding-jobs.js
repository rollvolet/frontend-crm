import fetch, { Headers } from 'fetch';
import ArrayProxy from '@ember/array/proxy';
import OutstandingJob from '../classes/outstanding-job';
import OutstandingJobReport from '../classes/outstanding-job-report';
import getPaginationMetadata from './get-pagination-metadata';

const jobsApiPath = '/api/reports/outstanding-jobs';
const reportApiPath = '/api/reports/outstanding-job-report';

export async function fetchOutstandingJobs(searchParams) {
  const endpoint = new URL(jobsApiPath, window.location.origin);
  endpoint.search = searchParams.toString();

  const response = await fetch(endpoint, {
    headers: new Headers({
      Accept: 'application/json',
    }),
  });
  const json = await response.json();
  const entries = json.data.map((item) => new OutstandingJob(item.attributes));
  const count = json.meta.count;
  const page = json.meta.page;
  const pagination = getPaginationMetadata(page.number, page.size, count);

  return ArrayProxy.create({
    content: entries,
    meta: {
      count,
      pagination,
    },
  });
}

export async function fetchOutstandingJobsReport(searchParams) {
  const endpoint = new URL(reportApiPath, window.location.origin);
  endpoint.search = searchParams.toString();

  const response = await fetch(endpoint, {
    headers: new Headers({
      Accept: 'application/json',
    }),
  });
  const json = await response.json();
  return new OutstandingJobReport(json.data.attributes);
}
