import * as AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-south-1', // Must be the same as your bucket
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

const Mail = (from: string, to: string, subject: string, text: string, html: any) => {
  const promise = new Promise((resolve, reject) => {
    const params = {
      Destination: {
        ToAddresses: [to] // Email address/addresses that you want to send your email
      },
      Message: {
        Body: {
          Html: {
            // HTML Format of the email
            Charset: "UTF-8",
            Data:
              html
          },
          Text: {
            Charset: "UTF-8",
            Data: text
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject
        }
      },
      Source: "Dev Deepvitals <dev@deepvitals.com>"
    };
  
    const sendEmail = ses.sendEmail(params).promise();
    
    sendEmail
    .then(data => {
      console.log("email submitted to SES", data);
      resolve(true)
    })
    .catch(error => {
      console.log(error);
      reject(false);
    });
  });
  return promise;
};

export default Mail;