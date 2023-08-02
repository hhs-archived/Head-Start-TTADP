import axios from 'axios';
import { createHash }  from 'crypto';
import fs from 'fs';
import StreamZip from 'node-stream-zip';
import { PassThrough, Readable, Transform } from 'stream';
import sax from 'sax';
import { Model } from 'sequelize';
import {
  uploadStreamToS3,
  readStreamFromS3,
} from '../s3';
import db, {
  sequelize,
} from '../../models';
import { generateModelClass } from '../../models/auditModelGenerator';
import { auditLogger } from '../../logger';

export const generateImportModels = (schemas) => Object.entries(schemas)
  .reduce((acc, [key, value]) => {
    acc[key].model = generateModelClass(
      sequelize,
      key,
      value,
      key,
    );
    return acc;
  }, {});

const calculateStreamHash = (inputStream) => new Promise((resolve, reject) => {
    const shaHash = createHash('sha256');

    inputStream.on('data', (chunk) => {
      shaHash.update(chunk);
    });

    inputStream.on('end', () => {
      const shaHashResult = shaHash.digest('hex');
      resolve(shaHashResult);
    });

    inputStream.on('error', (error) => {
      reject(error);
    });
  });

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

    // Pipe the Axios response stream to the S3 upload stream
    response.data.pipe(stream);

    return stream;
  } catch (err) {
    auditLogger.error('Error downloading file:', err);
    throw err;
  }
};

export const steamFileFromUrlToS3 = async (url, s3Bucket, s3Key, username = null, password = null) => {
  try {
    // Get a pass-through stream of the file
    const stream = await steamFileFromUrl(url, username, password);

    const [hash, ] = await Promise.all([
      calculateStreamHash(stream),
      // Wait for the S3 upload to complete
      uploadStreamToS3(stream, s3Bucket, s3Key)
    ]);

    return { url, hash, s3Key };
  } catch (err) {
    auditLogger.error('Error downloading file and uploading to S3:', err);
    throw err;
  }
};

async function readStreamsFromZip(zipStream: Readable): Promise<{ [key: string]: Readable }> {
  return new Promise((resolve, reject) => {
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
}

// Usage example
const zipStream = getReadableStreamToZipFile(); // Replace with your own readable stream to the zip file
readStreamsFromZip(zipStream)
  .then((streams) => {
    // Use the streams as needed
    for (const fileName in streams) {
      const stream = streams[fileName];
      // Do something with the stream
    }
  })
  .catch((err) => {
    console.error('Error reading streams from zip:', err);
  });


async function processXmlFile(xmlPath: string, xslPath: string, model: typeof Model) {
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

