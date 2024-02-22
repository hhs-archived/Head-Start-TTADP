/* eslint-disable  @typescript-eslint/no-explicit-any */
import { CronJob } from 'cron';
import { MAINTENANCE_TYPE, MAINTENANCE_CATEGORY } from '../../constants';
import {
  addQueueProcessor,
  enqueueMaintenanceJob,
  maintenanceCommand,
  addCronJob,
  runMaintenanceCronJobs,
} from './common';
import {
  download as downloadImport,
  process as processImport,
  moreToDownload,
  moreToProcess,
  getImportSchedules,
} from '../importSystem';
import LockManager from '../lockManager';
import { auditLogger } from '../../logger';

/**
 * Enqueues a maintenance job for imports with a specified type and optional id.
 *
 * @param type - The type of maintenance job to enqueue, must be a value from MAINTENANCE_TYPE.
 * @param id - An optional numeric identifier for the job.
 *
 * @returns The result of the enqueueMaintenanceJob function, which is not specified here.
 *
 * @throws Will throw an error if enqueueMaintenanceJob throws.
 */
const enqueueImportMaintenanceJob = async (
  type: typeof MAINTENANCE_TYPE[keyof typeof MAINTENANCE_TYPE],
  id?: number,
  requiresWorker = false,
  requiresLock = false,
) => {
  // Log the enqueueing of the maintenance job
  auditLogger.info({
    action: 'enqueueImportMaintenanceJob',
    type,
    id,
    requiresWorker,
    requiresLock,
  });

  // Enqueue the maintenance job
  return enqueueMaintenanceJob(
    MAINTENANCE_CATEGORY.IMPORT,
    {
      type,
      id,
    },
    requiresWorker,
    requiresLock,
  );
};

/**
 * Asynchronously sets up cron jobs for each import schedule retrieved from a data source.
 * It iterates over the list of import schedules and adds a cron job for each schedule
 * by calling the `addCronJob` function with the necessary parameters.
 *
 * @returns A promise that resolves to an object containing the list of import schedules.
 * @throws Will throw an error if retrieving import schedules or setting up cron jobs fails.
 */
const scheduleImportCrons = async () => {
  let imports;

  try {
    auditLogger.info('Starting to retrieve import schedules'); // Log the start of the retrieval process
    imports = await getImportSchedules();

    auditLogger.info('Retrieved import schedules from data source', { count: imports.length }); // Log the count of retrieved schedules

    imports.forEach(({
      id,
      name,
      schedule: importSchedule,
    }) => {
      auditLogger.info(`Setting up cron job for import schedule: ${name}`, { id, importSchedule }); // Log additional details

      addCronJob(
        MAINTENANCE_CATEGORY.IMPORT,
        MAINTENANCE_TYPE.IMPORT_DOWNLOAD,
        (category, type, timezone, schedule) => new CronJob(
          schedule,
          async () => {
            auditLogger.info(`Enqueuing maintenance job for import schedule: ${name}`, { id }); // Log the enqueuing with id
            await enqueueImportMaintenanceJob(type, id);
          },
          null,
          true,
          timezone,
        ),
        importSchedule,
        name,
      );
    });

    auditLogger.info('Running maintenance cron jobs');
    await runMaintenanceCronJobs();

  } catch (err) {
    auditLogger.error(`Error occurred: ${err.message}`, { err }); // Log the full error object for more details

    return { imports, isSuccessful: false, error: err.message };
  }

  auditLogger.info('Successfully scheduled import crons', { scheduled: imports.map(({ name }) => name) }); // Log the names of scheduled crons

  return { imports, isSuccessful: true, scheduled: imports.map(({ name }) => name) };
};
/**
 * Asynchronously triggers the import schedule process by executing a maintenance command.
 * It attempts to schedule import cron jobs and returns the results of this operation.
 *
 * The function is wrapped in a higher-order function `maintenanceCommand` which takes
 * a callback with parameters for logging and the ID of the user who triggered the action.
 *
 * @returns A Promise that resolves to an object indicating the success status and any
 *          results or errors from the scheduling attempt. The object contains a boolean
 *          `isSuccessful` which is true if no errors occurred, and false otherwise. If
 *          an error occurs, the object will include an `error` property with error details.
 *
 * @throws If an exception occurs within the `maintenanceCommand` or `scheduleImportCrons`,
 *         it will be caught and the returned object will contain the error information.
 */
const importSchedule = async () => maintenanceCommand(
  // The callback provided to the maintenance command takes log functions and an ID.
  async (logMessages, logBenchmarks, triggeredById) => {
    try {
      // Attempt to import cron schedules and store the results.
      const scheduleResults = await scheduleImportCrons();
      // Log the successful import operation using auditLogger
      auditLogger.info('Import schedule operation successful', {
        scheduleResults,
        triggeredById,
      });
      // Return an object indicating success and include the schedule results.
      // The operation is successful if the 'error' key is not present in the results.
      return {
        isSuccessful: !Object.keys(scheduleResults).includes('error'),
        ...scheduleResults,
        triggeredById,
      };
    } catch (err) {
      // Log the failed import operation using auditLogger
      auditLogger.error('Import schedule operation failed', {
        error: err,
        triggeredById,
      });
      // If an error occurs during import, return an object indicating failure and the error.
      return { isSuccessful: false, error: err };
    }
  },
  // Specify the maintenance category and type for this operation.
  MAINTENANCE_CATEGORY.IMPORT,
  MAINTENANCE_TYPE.IMPORT_SCHEDULE,
);

/**
 * Asynchronously initiates the download of an import based on the provided identifier and manages
 * the maintenance tasks associated with the import process. It calls the `maintenanceCommand`
 * function with a callback that handles the download and enqueues further processing jobs
 * as needed.
 *
 * @param id - The unique identifier for the import to be downloaded.
 * @returns A promise that resolves to an object indicating the success status of the operation
 *          and containing the download results or an error if one occurred.
 *
 * The returned object has the following structure:
 * - isSuccessful: A boolean indicating whether the download and enqueue operations were successful.
 * - ...downloadResults: The results of the download operation, spread into the returned object.
 * - error (optional): Present if an error occurred during the operation, contains the error
 * details.
 *
 * Exceptions:
 * - If an error is thrown within the callback provided to `maintenanceCommand`, it is caught and
 *   encapsulated in the returned object with `isSuccessful` set to false.
 */
const importDownload = async (id) => maintenanceCommand(
  // The maintenanceCommand function is called with a callback that performs the actual work.
  async (logMessages, logBenchmarks, triggeredById) => {
    try {
      // Attempt to download the import using the provided id.
      const downloadResults = await downloadImport(id);
      // Log the download action for audit purposes
      auditLogger.info('Import downloaded', { id, downloadResults });

      // Check if there are more items to download after the current batch.
      const [downloadMore, processMore] = await Promise.all([
        moreToDownload(id),
        moreToProcess(id),
      ]);

      // If there are more items to download, enqueue a job to download the next batch.
      if (downloadMore) {
        await enqueueImportMaintenanceJob(
          MAINTENANCE_TYPE.IMPORT_DOWNLOAD,
          id,
        );
      }
      // If the download results have a length, enqueue a job to process the downloaded data.
      if (processMore) {
        await enqueueImportMaintenanceJob(
          MAINTENANCE_TYPE.IMPORT_PROCESS,
          id,
        );
      }
      // Log the success status and download results for audit purposes
      auditLogger.info('Import download process completed', { id, downloadResults });

      // Return an object indicating the success status and include the download results.
      return {
        isSuccessful: !Object.keys(downloadResults).includes('error'),
        ...downloadResults,
      };
    } catch (err) {
      // Log the error for audit purposes
      auditLogger.error('Import download process failed', { id, error: err });
      // In case of an error, return an object indicating failure and the error itself.
      return { isSuccessful: false, error: err };
    }
  },
  // Additional parameters for the maintenanceCommand function to specify the category and type.
  MAINTENANCE_CATEGORY.IMPORT,
  MAINTENANCE_TYPE.IMPORT_DOWNLOAD,
  // Include the id in the options object for the maintenanceCommand.
  { id },
);

/**
 * Asynchronously handles the import process for a given identifier (id).
 * It wraps the import logic within a maintenance command that provides logging
 * and benchmarking utilities. If there are more items to process after the current
 * import, it enqueues a new import maintenance job. It returns an object indicating
 * whether the import was successful and includes the process results or an error if one occurred.
 *
 * @param id - The identifier for the import process.
 * @returns A Promise that resolves to an object with a boolean 'isSuccessful' property
 * indicating the success of the import process, and may include additional process results
 * or an error object if an exception was caught.
 */
const importProcess = async (id) => maintenanceCommand(
  // Wrap the import logic within a maintenance command that provides logging and benchmarking
  // utilities.
  async (_logMessages, _logBenchmarks, _triggeredById) => {
    try {
      const lockManager = new LockManager(`${MAINTENANCE_TYPE.IMPORT_PROCESS}-${id}`);
      auditLogger.info(`Processing import ${id}`);
      auditLogger.info('Lock manager created');
      let result;
      await lockManager.executeWithLock(async () => {
        // Process the import and await the results.
        const processResults = await processImport(id);
        // Check if there are more items to process after the current import.
        const more = await moreToProcess(id);
        if (more) {
          // If more items need processing, enqueue a new import maintenance job.
          await enqueueImportMaintenanceJob(
            MAINTENANCE_TYPE.IMPORT_PROCESS,
            id,
          );
        }
        // Return the process results along with a success flag indicating the absence of
        // an 'error' key.
        result = {
          isSuccessful: !Object.keys(processResults).includes('error'),
          ...processResults,
        };
      });
      auditLogger.info(`Import process for ${id} completed successfully`);
      return result;
    } catch (err) {
      // In case of an error, return an object indicating the process was not successful and
      // include the error.
      auditLogger.error(`Error processing import ${id}: ${err}`);
      return { isSuccessful: false, error: err };
    }
  },
  // Specify the maintenance category and type for this import process.
  MAINTENANCE_CATEGORY.IMPORT,
  MAINTENANCE_TYPE.IMPORT_PROCESS,
  // Provide additional context for the maintenance command with the id.
  { id },
);

/**
 * Handles the maintenance job for different types of import actions.
 * Based on the job type, it delegates the task to the appropriate function.
 *
 * @param job - An object containing the details of the job, including its type and id.
 * @returns The result of the action performed by the delegated function.
 * @throws Will throw an error if the job type is not recognized.
 */
const importMaintenance = async (job) => {
  // Destructure the 'type' and 'id' properties from the job's data
  const {
    type,
    id,
  } = job.data;

  // Declare a variable to hold the action to be performed
  let action;

  // Use a switch statement to determine the action based on the job type
  switch (type) {
    // If the job type is import schedule, call the importSchedule function
    case MAINTENANCE_TYPE.IMPORT_SCHEDULE:
      action = await importSchedule();
      auditLogger.info('Import schedule action performed');
      break;
    // If the job type is import download, call the importDownload function with the provided id
    case MAINTENANCE_TYPE.IMPORT_DOWNLOAD:
      action = await importDownload(id);
      auditLogger.info('Import download action performed');
      break;
    // If the job type is import process, call the importProcess function with the provided id
    case MAINTENANCE_TYPE.IMPORT_PROCESS:
      action = await importProcess(id);
      auditLogger.info('Import process action performed');
      break;
    // If the job type does not match any case, throw an error
    default:
      throw new Error('Unknown type');
  }

  // Return the result of the action performed
  return action;
};

addQueueProcessor(MAINTENANCE_CATEGORY.IMPORT, importMaintenance);
// TODO: commented out to prevent scheduled execution, as there is a concurrency issue that still
// needs to be addressed
// Assuming MAINTENANCE_TYPE and enqueueImportMaintenanceJob are imported or declared elsewhere
// import { MAINTENANCE_TYPE, enqueueImportMaintenanceJob } from '...';

// if (process.env.WORKER_THRONG_ID === '1') {
  auditLogger.info('Attempting to enqueue an import maintenance job.');

  try {
    enqueueImportMaintenanceJob(MAINTENANCE_TYPE.IMPORT_SCHEDULE, undefined, true, true);
    auditLogger.info('Successfully enqueued import maintenance job.');
  } catch (error) {
    auditLogger.error('Failed to enqueue import maintenance job.', error);
  }


export {
  enqueueImportMaintenanceJob,
  scheduleImportCrons,
  importSchedule,
  importDownload,
  importProcess,
  importMaintenance,
};
