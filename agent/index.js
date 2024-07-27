// it has power to read and write in this db
// this is the code for agent it alway run in server
import { writeDb } from "../db";
import goodbye from "graceful-goodbye";

const worker = new Worker("./agent/agent-worker.js", { smol: true });

console.log('agent is runing')

worker.onmessage = (event) => {
  const jobData = event.data;
  console.log(jobData);
  // here will call that job done
  markJobAsCompleted(jobData.result.id);
};

worker.onerror = (error) => {
  console.log(error.message);
};

// Function to get pending jobs from the database
const getPendingJobs = (callback) => {
  try {
    const jobsQuery = writeDb.query(
      `SELECT * FROM jobs WHERE status = $status`,
    );
    const jobsData = jobsQuery.all({ $status: "pending" });
    callback(null, jobsData);
  } catch (e) {
    callback(e.message, []);
  }
};

// Function to mark a job as completed
const markJobAsCompleted = (jobId) => {
  try {
    const jobUpdateQuery = writeDb.query(
      `UPDATE jobs SET status = 'completed' WHERE id = $jobId`,
    );
    jobUpdateQuery.run({ $jobId: jobId });
  } catch (e) {
    console.log(e);
  }
};

// Function to mark a job as Runing
const markJobAsRuning = (jobId) => {
  try {
    const jobUpdateQuery = writeDb.query(
      `UPDATE jobs SET status = 'running' WHERE id = $jobId`,
    );
    jobUpdateQuery.run({ $jobId: jobId });
  } catch (e) {
    console.log(e);
  }
};

const markJobRuningToPending = () => {
  const updateRuningToPendingQuery = writeDb.query(
    `UPDATE jobs SET status = 'pending' WHERE status = 'running'`,
  );
  try {
    updateRuningToPendingQuery.run();
  } catch (e) {
    console.log(e);
  }
};

// Function to process jobs
const processJobs = async () => {
  getPendingJobs(async (err, jobs) => {
    if (err) return;

    console.log("job len :", jobs.length);

    for (const job of jobs) {
      console.log(`Executing job: ${JSON.stringify(job)}`);
      worker.postMessage(job);
      markJobAsRuning(job.id);
    }
  });
};

goodbye(() => {
  markJobRuningToPending();
});

// Main function to run the agent
const main = async () => {
  while (true) {
    await processJobs();
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 60 seconds
  }
};

// Start the agent
main();
