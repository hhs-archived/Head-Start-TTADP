/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import crypto from 'crypto';
import { Readable } from 'stream';

export function fileHash(filepath) {
  let hash = null;
  if (fs.existsSync(filepath)) {
    const fileBuffer = fs.readFileSync(filepath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    hash = hashSum.digest('hex');
  }
  return hash;
}

/**
 * Calculates the hash of a stream using SHA256 algorithm.
 * @param inputStream - The input stream to calculate the hash from.
 * @returns A promise that resolves with the calculated hash as a string.
 */
export const calculateHashFromStream = (
  inputStream,
) => new Promise((resolve, reject) => {
  // Create a hash object using the 'sha256' algorithm
  const shaHash = crypto.createHash('sha256');

  // Listen for 'data' event on the input stream
  inputStream.on('data', (chunk) => {
    // Update the hash object with each chunk of data
    shaHash.update(chunk);
  });

  // Listen for 'end' event on the input stream
  inputStream.on('end', () => {
    // Calculate the final hash value in hexadecimal format
    const shaHashResult = shaHash.digest('hex');
    // Resolve the promise with the calculated hash
    resolve(shaHashResult);
  });

  // Listen for 'error' event on the input stream
  inputStream.on('error', (error) => {
    // Reject the promise with the error
    reject(error);
  });
});

/**
* Calculates the size of a file from a given readable stream.
* @param stream - The readable stream to calculate the size from.
* @returns A promise that resolves with the size of the file in bytes.
*/
export const getFileSizeFromStream = (stream) => new Promise((resolve, reject) => {
  let size = 0;

  // Listen for 'data' event on the stream
  stream.on('data', (chunk) => {
    // Increment the size by the length of each chunk
    size += chunk.length;
  });

  // Listen for 'end' event on the stream
  stream.on('end', () => {
    // Resolve the promise with the final size
    resolve(size);
  });

  // Listen for 'error' event on the stream
  stream.on('error', (err) => {
    // Reject the promise with the error
    reject(err);
  });
});
