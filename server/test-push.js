import { jobQueue } from './queues/job.queue.js';

await jobQueue.add('manual-test', {
  jobId: 'test-123',
  title: 'Manual Job',
  company: 'Test Co',
  description: 'Just a test job',
  location: 'Nowhere',
  link: 'http://test.com',
  category: 'Test',
  type: 'Full Time',
  datePosted: new Date(),
});
console.log('✔️ Manual job pushed');
