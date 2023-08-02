import { S3 } from 'aws-sdk';
import { Readable } from 'stream';
import { auditLogger } from '../logger';

const generateS3Config = () => {
  // take configuration from cloud.gov if it is available. If not, use env variables.
  if (process.env.VCAP_SERVICES) {
    const { credentials } = JSON.parse(process.env.VCAP_SERVICES).s3[0];
    return {
      bucketName: credentials.bucket,
      s3Config: {
        accessKeyId: credentials.access_key_id,
        endpoint: credentials.fips_endpoint,
        region: credentials.region,
        secretAccessKey: credentials.secret_access_key,
        signatureVersion: 'v4',
        s3ForcePathStyle: true,
      },
    };
  }
  return {
    bucketName: process.env.S3_BUCKET,
    s3Config: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      endpoint: process.env.S3_ENDPOINT,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      signatureVersion: 'v4',
      s3ForcePathStyle: true,
    },
  };
};

const { bucketName, s3Config } = generateS3Config();
const s3 = new S3(s3Config);

const getBucketName = () => bucketName;

const deleteFileFromS3 = async (key, bucket = bucketName, s3Client = s3) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  return s3Client.deleteObject(params).promise();
};

const deleteFileFromS3Job = async (job) => {
  const {
    fileId, fileKey, bucket,
  } = job.data;
  let res;
  try {
    res = await deleteFileFromS3(fileKey, bucket);
    return ({ status: 200, data: { fileId, fileKey, res } });
  } catch (error) {
    auditLogger.error(`S3 Queue Error: Unable to DELETE file '${fileId}' for key '${fileKey}': ${error.message}`);
    return { data: job.data, status: res ? res.statusCode : 500, res: res || undefined };
  }
};

const verifyVersioning = async (bucket = bucketName, s3Client = s3) => {
  const versioningConfiguration = {
    MFADelete: 'Disabled',
    Status: 'Enabled',
  };
  let params = {
    Bucket: bucket,
  };
  const data = await s3Client.getBucketVersioning(params);
  if (!(data) || data.Status !== 'Enabled') {
    params = {
      Bucket: bucket,
      VersioningConfiguration: versioningConfiguration,
    };
    return s3Client.putBucketVersioning(params);
  }
  return data;
};

const downloadFile = (key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  return s3.getObject(params).promise();
};

const getPresignedURL = (Key, Bucket = bucketName, s3Client = s3, Expires = 360) => {
  const url = { url: null, error: null };
  try {
    const params = {
      Bucket,
      Key,
      Expires,
    };
    url.url = s3Client.getSignedUrl('getObject', params);
  } catch (error) {
    url.error = error;
  }
  return url;
};

const uploadFile = async (buffer, name, type, s3Client = s3) => {
  const params = {
    Body: buffer,
    Bucket: bucketName,
    ContentType: type.mime,
    Key: name,
  };
  // Only check for versioning if not using Minio
  if (process.env.NODE_ENV === 'production') {
    await verifyVersioning();
  }

  return s3Client.upload(params).promise();
};

const uploadStreamToS3 = async (stream, s3Bucket, s3Key) => {
  try {
    // Set up the parameters for uploading to S3
    const params = {
      Bucket: s3Bucket,
      Key: s3Key,
      Body: stream,
    };

    // Upload the file to S3
    await s3.upload(params).promise();
  } catch (err) {
    auditLogger.error('Error uploading file to S3:', err);
    throw err;
  }
};

const readStreamFromS3 = async (s3Bucket, s3Key) => {
  try {
    // Set up the parameters for downloading from S3
    const params = {
      Bucket: s3Bucket,
      Key: s3Key,
    };

    // Download the file from S3
    const response = await s3.getObject(params).promise();

    // Create a readable stream from the downloaded data
    const stream = new Readable();
    stream.push(response.Body);
    stream.push(null);

    return stream;
  } catch (err) {
    auditLogger.error('Error reading file from S3:', err);
    throw err;
  }
};

const moveFile = async (
  sourceBucket,
  sourceKey,
  destinationBucket,
  destinationKey,
  deleteSource = true,
) => {
  try {
    // Copy the file to the destination bucket
    await s3.copyObject({
      Bucket: destinationBucket,
      CopySource: `/${sourceBucket}/${sourceKey}`,
      Key: destinationKey,
    }).promise();

    if (deleteSource) {
      // Delete the file from the source bucket
      await s3.deleteObject({
        Bucket: sourceBucket,
        Key: sourceKey,
      }).promise();
    }
  } catch (error) {
    auditLogger.error('Error moving file:', error);
  }
};

const toggleFileAccess = async (bucket, key, enableMutability, enableReadAccess) => {
  try {
    const params = {
      Bucket: bucket,
      Key: key,
      ACL: enableReadAccess ? 'public-read' : 'private',
      MetadataDirective: enableMutability ? 'REPLACE' : 'COPY',
    };

    // Update the file's ACL and metadata
    await s3.copyObject(params).promise();
  } catch (error) {
    auditLogger.error('Error toggling file access:', error);
  }
};

export {
  s3,
  getBucketName,
  downloadFile,
  getPresignedURL,
  uploadFile,
  uploadStreamToS3,
  readStreamFromS3,
  moveFile,
  toggleFileAccess,
  generateS3Config,
  verifyVersioning,
  deleteFileFromS3,
  deleteFileFromS3Job,
};
