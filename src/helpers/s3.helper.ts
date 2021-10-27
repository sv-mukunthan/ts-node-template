import fs from "fs";
import * as AWS from "aws-sdk";
import { checkURL } from "../helpers/functions.helper";

// Enter the name of the bucket that you have created here
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

AWS.config.update({
  accessKeyId: process.env.AWS_HELLAVIEWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_HELLAVIEWS_SECRET_KEY,
  region: "ap-south-1", // Must be the same as your bucket
  signatureVersion: "v4",
  // ACL: "public-read",
});
// Initializing S3 Interface
const s3 = new AWS.S3();

export const uploadFile = async (file: string, name: string) => {
  try {
    // read content from the file
    const fileContent = fs.readFileSync(file);
    const fileType = file.split(".").pop();
    const fileName = "s3/" + name;
    // setting up s3 upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName, // file name you want to save as
      Body: fileContent,
      ContentType: checkURL(file) + "/" + fileType,
    };
    let data = await s3.upload(params).promise();
    return data;
  } catch (err) {
    console.log("upload err", err);
    return err;
  }
};

export const deleteFile = async (url: string) => {
  try {
    let name = "s3/" + url.split("/").pop();
    // setting up s3 upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: name, // file name you want to save as
    };

    // Uploading files to the bucket
    const res = await s3.deleteObject(params).promise();
    return res;
  } catch (err) {
    console.log("delete err", err);
    return err;
  }
};

export const signS3 = (req, res, next) => {
  const fileName =
    "s3/" + Date.now() + req.body["file_name"].replace(/\s/g, "");
  const fileType = req.body["file_type"];
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: "public-read",
  };
  console.log(s3Params);
  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${BUCKET_NAME}.s3-accelerate.amazonaws.com/${fileName}`,
    };
    // res.write(JSON.stringify(returnData));
    // res.end();
    res.send(returnData);
  });
};

export const getPresignedUrl = (file: string) => {
  return new Promise((resolve, reject) => {
    // read content from the file
    let name = file.split('/').pop()
    console.log(name);
    const signedUrlExpireSeconds = 60 * 60

    // setting up s3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: name, // file name you want to save as
        Expires: signedUrlExpireSeconds
    };

    s3.getSignedUrl('getObject', params, function(err, data) {
        if (err) {
          console.log(err);
          reject(err);
        }
        console.log(`File uploaded successfully. ${data}`)
        resolve(data);
    });
  })
};
