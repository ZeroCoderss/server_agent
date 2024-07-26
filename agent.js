// it has power to read and write in this db
// this is the code for agent it alway run in server
import { writeDb } from "./db";

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

// Function to execute a job
const executeJob = async (job) => {
  try {
    // Replace with actual job execution logic
    console.log(`Executing job: ${JSON.stringify(job)}`);
    // For example, sending job details to a server
  } catch (error) {
    console.error(`Error executing job: ${error.message}`);
  }
};

// Function to process jobs
const processJobs = async () => {
  getPendingJobs(async (err, jobs) => {
    if (err) return;

    for (const job of jobs) {
      await executeJob(job);
      markJobAsCompleted(job.id);
    }
  });
};

// Main function to run the agent
const main = async () => {
  while (true) {
    await processJobs();
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 60 seconds
  }
};

// Start the agent
main();
