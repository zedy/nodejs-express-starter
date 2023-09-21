// libs
import fs, { ReadStream } from 'fs';
import AWS from 'aws-sdk';
import { set } from 'lodash';

// models
import User from '../models/user';

// utils
import logger from '../utils/helpers/errorLogger';
import sendEmail from '../utils/helpers/sendEmail';
import awsUpload from '../utils/helpers/awsUpload';


// AWS config
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Params for uploading images to AWS's S3
const s3Upload = (uploadParams) =>
  new Promise((resolve, reject) => {
    s3.upload(uploadParams, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });

const createUser = async (payload) => {
  try {
    const user = await new User(payload).save();

    // send an email to the user
    sendEmail({
      to: payload.email,
      name: payload.fullName,
      type: 'user-created',
    });

    return {
      success: true,
      user,
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

const updateUser = async (req) => {
  try {
    const { id } = req.params;
    const { file } = req;
    const { payload } = req.body;
    const data = JSON.parse(JSON.stringify(payload));
    
    if (file) {
      // if a file was supplied then upload it to s3 and if it's super green then add it to the payload
      const pictureUploadResults = await awsUpload(file);

      if (pictureUploadResults.success) {
        data.profile = pictureUploadResults.url;
      }
    }

    await User.findByIdAndUpdate(id, data, { new: true });
    
    return {
      status: 'success',
      success: true,
    };
  } catch (e) {
    logger.log({
      level: 'error',
      message: e,
    });

    return {
      success: false,
      status: 'error',
      message: e.message,
    };
  }
};

const deleteUser = async (req) => {
  try {
    const { id } = req.params;

    await User.findOneAndDelete({ id });

    return {
      success: true,
      message: 'User successfully deleted.',
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

const getUser = async (req) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).exec();

    return {
      success: true,
      user,
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

export {
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
