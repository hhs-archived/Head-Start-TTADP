import axios from 'axios';
import { createHash }  from 'crypto';
import fs from 'fs';
import path from 'path';
import StreamZip from 'node-stream-zip';
import { PassThrough, Readable, Transform } from 'stream';
import sax from 'sax';
import { Model } from 'sequelize';
import { calculateHashFromStream, getFileSizeFromStream } from '../fileUtils';
import {
  uploadStreamToS3,
  readStreamFromS3,
} from '../s3';
import db, {
  sequelize,
} from '../../models';
import { generateModelClass } from '../../models/auditModelGenerator';
import { auditLogger } from '../../logger';

/**
 * Generates import models for the given schemas.
 * @param {Object} schemas - The schemas object.
 * @returns {Object} - The generated import models.
 */
export const generateImportModels = (schemas) => Object.entries(schemas)
  .reduce((acc, [key, value]) => {
    // Generate a model class for each schema and assign it to the corresponding key in the accumulator object.
    acc[key].model = generateModelClass(
      sequelize,
      key,
      value,
      key,
    );
    return acc;
  }, {});

/**
 * Downloads a file from a given URL and returns a readable stream of the file contents.
 *
 * @param url - The URL of the file to download.
 * @param username - Optional username for authentication.
 * @param password - Optional password for authentication.
 * @returns A readable stream of the downloaded file contents.
 */
const steamFileFromUrl = async (url, username, password) => {
  try {
    // Create a pass-through stream
    const stream = new PassThrough();

    // Start the download using Axios
    const response = await axios.get(
      url,
      {
        responseType: 'stream',
        ...((username || password) && {
          auth: {
            ...(username && { username }),
            ...(password && { password }),
          },
        }),
      },
    );

    // Pipe the Axios response stream to the stream
    response.data.pipe(stream);

    return stream;
  } catch (err) {
    auditLogger.error('Error downloading file:', err);
    throw err;
  }
};

/**
 * Downloads a file from a given URL, calculates its hash and size,
 * and uploads it to an S3 bucket.
 *
 * @param url - The URL of the file to download.
 * @param s3Bucket - The name of the S3 bucket to upload the file to.
 * @param s3Key - The key (path) of the file in the S3 bucket.
 * @param username - Optional username for authentication.
 * @param password - Optional password for authentication.
 * @returns A promise that resolves to an object containing the hash, size, and S3 key of the uploaded file.
 */
export const steamFileFromUrlToS3 = async (
  url: string,
  s3Bucket: string,
  s3Key: string,
  username: string = null,
  password: string = null,
): Promise<{ hash: string, size: number, s3Key: string }> => {
  try {
    // Get a pass-through stream of the file
    const stream = await steamFileFromUrl(url, username, password);

    // Calculate the hash and size of the file concurrently
    const [hash, size] = await Promise.all([
      calculateHashFromStream(stream),
      getFileSizeFromStream(stream),
      uploadStreamToS3(stream, s3Bucket, s3Key),
    ]);

    return { hash, size, s3Key };
  } catch (err) {
    auditLogger.error('Error downloading file and uploading to S3:', err);
    throw err;
  }
};

const readStreamsFromZip = (
  zipStream: Readable,
): Promise<{ [key: string]: Readable }> => new Promise((resolve, reject) => {
  const streams: { [key: string]: Readable } = {};

  const zip = new StreamZip({
    storeEntries: true,
  });

  zip.on('ready', () => {
    const entries = zip.entries();

    for (const entry of Object.values(entries)) {
      if (!entry.isDirectory) {
        const stream = new Readable();
        stream._read = () => {}; // Required to make it a readable stream

        streams[entry.name] = stream;

        zip.stream(entry.name, (err, readStream) => {
          if (err) {
            console.error('Error reading zip entry:', err);
            return;
          }

          readStream.on('data', (chunk) => {
            stream.push(chunk);
          });

          readStream.on('end', () => {
            stream.push(null);
          });

          readStream.on('error', (err) => {
            console.error(`Error streaming file "${entry.name}":`, err);
          });
        });
      }
    }

    zip.close();

    resolve(streams);
  });

  zip.on('error', (err) => {
    reject(err);
  });

  zip.open(zipStream);
});

const readStreamsFromZipOnS3 = async (s3Bucket, s3Key) => {
  const stream = await readStreamFromS3(s3Bucket, s3Key);
  return readStreamsFromZip(stream);
};


async function processXmlFile(xmlPath: string, xslPath: string, model: Model) {
  // Read the XSL file
  const xslData = fs.readFileSync(xslPath, 'utf-8');

  // Create a SAX parser
  const parser = sax.createStream(true);

  // Flag to indicate if the root tag has been encountered
  let isRootTagFound = false;

  // Function to process the parsed XML data and insert into the database
  async function processXmlData(data: any) {
    try {
      // Insert the extracted data into the database using the Sequelize model
      await model.create(data);
      console.log('Data inserted successfully!');
    } catch (err) {
      console.error('Error inserting data:', err);
    }
  }

  // Configure the SAX parser event handlers
  parser.on('opentag', (node: sax.Tag) => {
    // Check if the current tag matches the root tag specified in the XSL file
    if (!isRootTagFound && node.name === /* Root tag name from XSL */) {
      isRootTagFound = true;
    }

    // Process the XML node as needed
    // For example, you can extract data from specific tags and store it in an object
    if (isRootTagFound) {
      const data = /* Extracted data from the XML node */;
      processXmlData(data);
    }
  });

  // Read the XML file using a stream
  const xmlStream = fs.createReadStream(xmlPath);

  // Create a transform stream to parse the XML
  const xmlParser = new Transform({
    transform(chunk, encoding, callback) {
      // Write the chunk to the SAX parser
      parser.write(chunk.toString());

      callback();
    },
    flush(callback) {
      // Signal the end of the stream to the SAX parser
      parser.end();
      callback();
    },
  });

  // Pipe the XML stream through the XML parser
  xmlStream.pipe(xmlParser);
}

const fileNameToModel = (zipFile: string, models: Model[]): Model => {
  const fileName = path.basename(zipFile);
  const fileExtension = path.extname(fileName);
  const fileNameWithoutExtension = path.basename(fileName, fileExtension);
  const processorModel = models['fileNameWithoutExtension'];
  return processorModel;
}

const loadDataFromUrl = async (url string, processorModels: Model[], username = null, password = null) => {
  // Load the data from url to s3, returning { hash, key }
  const {
    hash,
    size,
    s3Key,
  } = await steamFileFromUrlToS3(url, x, x, username, password);

  // Stream from s3, returning { file1: stream, ... }
  const fileStreams = readStreamsFromZipOnS3(x, x);

  // Process all file streams to their corresponding table through the generated models
  for ( const keyValue in Object.entries(fileStreams)) {
    const [ key, value ] = keyValue;

    const processorModel = fileNameToModel(key, processorModels);

    await processXmlFile(fileStream, processorModel);
  }
};

