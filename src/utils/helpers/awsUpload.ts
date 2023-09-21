/* eslint-disable comma-dangle */
// lib
import AWS from 'aws-sdk';
import fs from 'fs';
import { randomUUID } from 'crypto';

// utils
import logger from './errorLogger';

// types
import { AWSUploadParams } from '../../types/general';

// AWS config
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Params for uploading images to AWS's S3
const s3Upload = (uploadParams) => new Promise((resolve, reject) => {
  s3.upload(uploadParams, (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  });
});

const awsUpload = async (file) => {
  try {
    const uuid = randomUUID();
    const uploadParams: AWSUploadParams = {
      Bucket: process.env.AWS_BUCKET,
      Body: '',
      Key: '',
      CacheControl: 'public, max-age=604800',
      ContentType: '',
      ACL: process.env.AWS_ACL,
    };

    const fileStream = fs.createReadStream(file.path);

    fileStream.on('error', (err: string) => {
      throw new Error(err);
    });

    uploadParams.Body = fileStream;
    uploadParams.Key = `${uuid}-${file.originalname}`;
    uploadParams.ContentType = file.mimetype;

    const url = await s3Upload(uploadParams);

    fs.rm(file.path, () => {});

    return {
      success: true,
      message: 'Image uploaded',
      url,
    };
  } catch (e) {
    logger.log({
      level: 'error',
      message: e,
    });

    return {
      success: false,
      message: e.message,
    };
  }
};

export default awsUpload;
