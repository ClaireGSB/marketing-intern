// queues/queue.ts

import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = {
  host: 'localhost', // or your Docker host IP if not on localhost
  port: 6379,
};


export const myQueue = new Queue('foo', { connection});

export async function addJobs() {
  console.log('Adding jobs');
  await myQueue.add('myJobName', { foo: 'bar' });
  await myQueue.add('myJobName', { qux: 'baz' });
}

// await addJobs();


const worker = new Worker('foo', async job => {
  // Will print { foo: 'bar'} for the first job
  // and { qux: 'baz' } for the second.
  console.log(job.data);
}, { connection });

// Log worker properties to make sure it's initialized
console.log('Worker started for queue:', worker.name);
console.log('Worker connection details:', worker.opts.connection);
console.log('Worker ID:', worker.id);
console.log('Is worker closed?', worker.closing);
console.log('Worker concurrency:', worker.opts.concurrency);

// You can also log the number of active listeners
console.log('Number of "completed" event listeners:', worker.listenerCount('completed'));
console.log('Number of "failed" event listeners:', worker.listenerCount('failed'));


// Error handling
myQueue.on('error', (err) => {
  console.error('Queue error:', err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

worker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});
