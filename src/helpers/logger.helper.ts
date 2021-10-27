
interface log {
  (log: any):  void
}

interface logger {
  error: log,
  log: log,
  info: log
}

function Logger():any {
  if (process.env.NODE_ENV === "production") {
    var winston = require("winston"),
      WinstonCloudWatch = require("winston-aws-cloudwatch");

    // when you don't provide a name the default one
    // is CloudWatch
    winston.add(
      new WinstonCloudWatch({
        awsConfig: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: "us-east-1",
        },
        logGroupName: "hellaviews-backend",
        logStreamName: "hellaviews",
      })
    );
  } else {
    var winston: any = {
      error: (log) => {
        if (process.env.NODE_ENV === "test") {
          return;
        } else {
          console.error(log);
        }
      },
      log: (log) => {
        if (process.env.NODE_ENV === "test") {
          return;
        } else {
          console.log(log);
        }
        return;
      },
      info: (log: any) => {
        if (process.env.NODE_ENV === "test") {
          return;
        } else {
          console.log(log);
        }
        return;
      },
    };
    return winston;
  }

  // logger = winston;
  // return winston;
}

export default Logger;
